"use server";

import dbConnect from "@/lib/mongodb";
import Doubt from "@/models/Doubt";
import Course from "@/models/Course";
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
    if (!session?.user || (session.user as any).role !== "teacher") {
      return { success: false, error: "Unauthorized" };
    }
    const teacherId = (session.user as any).id;

    const doubts = await Doubt.find({ teacherId, status: "Open" })
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
    if (!session?.user || (session.user as any).role !== "teacher") {
      return { success: false, error: "Unauthorized" };
    }
    const teacherId = (session.user as any).id;

    const doubt = await Doubt.findOneAndUpdate(
      { _id: doubtId, teacherId },
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
