"use server";

import dbConnect from "@/lib/mongodb";
import Doubt from "@/models/Doubt";
import Course from "@/models/Course";
import Topic from "@/models/Topic";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function submitDoubt(data: {
  courseId: string;
  topicId: string;
  question: string;
}) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }
    const studentId = (session.user as any).id;

    // Get the course to find the teacherId
    const course = await Course.findById(data.courseId);
    if (!course) {
      return { success: false, error: "Course not found" };
    }

    const teacherId = course.instructorId;
    if (!teacherId) {
      return { success: false, error: "Course has no associated teacher" };
    }

    const doubt = new Doubt({
      studentId,
      teacherId,
      courseId: data.courseId,
      topicId: data.topicId,
      question: data.question,
    });

    await doubt.save();
    return { success: true, doubt: JSON.parse(JSON.stringify(doubt)) };
  } catch (error: any) {
    console.error("Submit doubt error:", error);
    return { success: false, error: error.message };
  }
}

export async function getTeacherDoubts() {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    if (!session?.user || ((session.user as any).role !== "teacher" && (session.user as any).role !== "admin")) {
      return { success: false, error: "Unauthorized" };
    }
    const user = session.user as any;
    
    // If admin, they can see all open doubts. If teacher, only those assigned to them.
    const query = user.role === "admin" ? { status: "Open" } : { teacherId: user.id, status: "Open" };

    const doubts = await Doubt.find(query)
      .populate("studentId", "name email")
      .populate("topicId", "title")
      .populate("courseId", "title")
      .sort({ createdAt: -1 })
      .lean();

    const cleanDoubts = doubts.filter((d: any) => d.courseId && d.topicId);

    return { success: true, doubts: JSON.parse(JSON.stringify(cleanDoubts)) };
  } catch (error: any) {
    console.error("Get teacher doubts error:", error);
    return { success: false, error: error.message };
  }
}

export async function resolveDoubt(doubtId: string, answer: string) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    if (!session?.user || ((session.user as any).role !== "teacher" && (session.user as any).role !== "admin")) {
      return { success: false, error: "Unauthorized" };
    }
    const user = session.user as any;
    const query = user.role === "admin" ? { _id: doubtId } : { _id: doubtId, teacherId: user.id };

    const doubt = await Doubt.findOneAndUpdate(
      query,
      { answer, status: "Resolved" },
      { new: true }
    );

    if (!doubt) {
      return { success: false, error: "Doubt not found or access denied" };
    }

    return { success: true, doubt: JSON.parse(JSON.stringify(doubt)) };
  } catch (error: any) {
    console.error("Resolve doubt error:", error);
    return { success: false, error: error.message };
  }
}

export async function getTopicDoubts(topicId: string) {
  try {
    await dbConnect();
    const doubts = await Doubt.find({ topicId, status: "Resolved" })
      .populate("studentId", "name")
      .sort({ updatedAt: -1 })
      .lean();
    return { success: true, doubts: JSON.parse(JSON.stringify(doubts)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
