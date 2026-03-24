"use server";

import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { revalidatePath } from "next/cache";
import UserProgress from "@/models/UserProgress";

async function verifyAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin") {
    throw new Error("Unauthorized access. Master Admin privileges required.");
  }
  return session;
}

export async function getAllUsers() {
  try {
    await verifyAdmin();
    await dbConnect();
    const users = await User.find({}).sort({ createdAt: -1 });
    return { success: true, users: JSON.parse(JSON.stringify(users)) };
  } catch (error: any) {
    return { success: false, error: error.message, users: [] };
  }
}

export async function updateUserRole(userId: string, newRole: string) {
  try {
    const session = await verifyAdmin();
    await dbConnect();
    
    // Prevent accidental self-demotion lockout if it's the only admin
    if ((session.user as any).id === userId && newRole !== "admin") {
       throw new Error("Cannot demote your own active admin session.");
    }
    
    await User.findByIdAndUpdate(userId, { role: newRole });
    revalidatePath("/dashboard/admin/users");
    
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getAdminAnalytics() {
  try {
    await verifyAdmin();
    await dbConnect();

    const avgScores = await UserProgress.aggregate([
      {
        $group: {
          _id: "$courseId",
          averageProgress: { $avg: "$progress" },
          totalStudents: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: "courses",
          localField: "_id",
          foreignField: "_id",
          as: "course"
        }
      },
      { $unwind: "$course" },
      {
        $project: {
          courseId: "$_id",
          courseName: "$course.title",
          averageScore: { $round: ["$averageProgress", 2] },
          totalStudents: 1,
          _id: 0
        }
      },
      { $sort: { averageScore: -1 } }
    ]);

    const weakTopics = await UserProgress.aggregate([
      { $unwind: "$weakAreas" },
      {
        $group: {
          _id: "$weakAreas",
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: "topics",
          localField: "_id",
          foreignField: "_id",
          as: "topicDetails"
        }
      },
      { $unwind: { path: "$topicDetails", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          topicId: "$_id",
          topicName: { $ifNull: ["$topicDetails.title", "Unknown Topic"] },
          frequency: "$count",
          _id: 0
        }
      },
      { $sort: { frequency: -1 } },
      { $limit: 10 }
    ]);

    return { 
      success: true, 
      analytics: JSON.parse(JSON.stringify({ avgScores, weakTopics })) 
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
