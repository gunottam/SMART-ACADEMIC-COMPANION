"use server";

import dbConnect from "@/lib/mongodb";
import User, { UserRole } from "@/models/User";
import Course from "@/models/Course";
import Module from "@/models/Module";
import Topic from "@/models/Topic";
import Assessment from "@/models/Assessment";
import Assignment from "@/models/Assignment";
import AssignmentSubmission from "@/models/AssignmentSubmission";
import UserProgress from "@/models/UserProgress";
import Doubt from "@/models/Doubt";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "admin") {
    throw new Error("Admin privileges required.");
  }
  return session;
}

export async function getAllUsers() {
  try {
    await requireAdmin();
    await dbConnect();
    const users = await User.find({}).sort({ createdAt: -1 }).lean();
    return {
      success: true as const,
      users: JSON.parse(JSON.stringify(users)),
    };
  } catch (error) {
    return {
      success: false as const,
      error: error instanceof Error ? error.message : "Failed to load users",
      users: [] as unknown[],
    };
  }
}

export async function updateUserRole(userId: string, newRole: UserRole) {
  try {
    const session = await requireAdmin();
    await dbConnect();

    if (session.user.id === userId && newRole !== "admin") {
      throw new Error("Cannot demote your own active admin session.");
    }

    await User.findByIdAndUpdate(userId, { role: newRole });
    revalidatePath("/dashboard/admin/users");
    return { success: true as const };
  } catch (error) {
    return {
      success: false as const,
      error: error instanceof Error ? error.message : "Failed to update role",
    };
  }
}

export async function getAdminAnalytics() {
  try {
    await requireAdmin();
    await dbConnect();

    const avgScores = await UserProgress.aggregate([
      {
        $group: {
          _id: "$courseId",
          averageProgress: { $avg: "$progress" },
          totalStudents: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "courses",
          localField: "_id",
          foreignField: "_id",
          as: "course",
        },
      },
      { $unwind: "$course" },
      {
        $project: {
          courseId: "$_id",
          courseName: "$course.title",
          averageScore: { $round: ["$averageProgress", 2] },
          totalStudents: 1,
          _id: 0,
        },
      },
      { $sort: { averageScore: -1 } },
    ]);

    const weakTopics = await UserProgress.aggregate([
      { $unwind: "$weakAreas" },
      { $group: { _id: "$weakAreas", count: { $sum: 1 } } },
      {
        $lookup: {
          from: "topics",
          localField: "_id",
          foreignField: "_id",
          as: "topicDetails",
        },
      },
      { $unwind: { path: "$topicDetails", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          topicId: "$_id",
          topicName: { $ifNull: ["$topicDetails.title", "Unknown Topic"] },
          frequency: "$count",
          _id: 0,
        },
      },
      { $sort: { frequency: -1 } },
      { $limit: 10 },
    ]);

    return {
      success: true as const,
      analytics: JSON.parse(JSON.stringify({ avgScores, weakTopics })),
    };
  } catch (error) {
    return {
      success: false as const,
      error:
        error instanceof Error ? error.message : "Failed to load analytics",
    };
  }
}

export async function getSystemSnapshot() {
  try {
    await requireAdmin();
    await dbConnect();

    const [users, courses, published, submissions, openDoubts] =
      await Promise.all([
        User.countDocuments(),
        Course.countDocuments(),
        Course.countDocuments({ status: "published" }),
        AssignmentSubmission.countDocuments(),
        Doubt.countDocuments({ status: "Open" }),
      ]);

    return {
      success: true as const,
      snapshot: { users, courses, published, submissions, openDoubts },
    };
  } catch (error) {
    return {
      success: false as const,
      error:
        error instanceof Error ? error.message : "Failed to load snapshot",
    };
  }
}

export async function getAllCourses() {
  try {
    await requireAdmin();
    await dbConnect();
    const courses = await Course.find({})
      .populate("instructorId", "name email")
      .sort({ createdAt: -1 })
      .lean();
    return {
      success: true as const,
      courses: JSON.parse(JSON.stringify(courses)),
    };
  } catch (error) {
    return {
      success: false as const,
      error: error instanceof Error ? error.message : "Failed to load courses",
      courses: [] as unknown[],
    };
  }
}

export async function deleteCourse(courseId: string) {
  try {
    await requireAdmin();
    await dbConnect();

    const modules = await Module.find({ courseId }).select("_id").lean();
    const moduleIds = modules.map((m) => m._id);
    const topics = await Topic.find({ moduleId: { $in: moduleIds } })
      .select("_id")
      .lean();
    const topicIds = topics.map((t) => t._id);

    await Assessment.deleteMany({ topicId: { $in: topicIds } });
    await Assignment.deleteMany({ topicId: { $in: topicIds } });
    await Topic.deleteMany({ moduleId: { $in: moduleIds } });
    await Module.deleteMany({ courseId });
    await UserProgress.deleteMany({ courseId });
    await Doubt.deleteMany({ courseId });
    await Course.findByIdAndDelete(courseId);

    revalidatePath("/dashboard/admin/courses");
    return { success: true as const };
  } catch (error) {
    return {
      success: false as const,
      error: error instanceof Error ? error.message : "Failed to delete course",
    };
  }
}
