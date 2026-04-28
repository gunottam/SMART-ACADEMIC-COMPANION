"use server";

import dbConnect from "@/lib/mongodb";
import Doubt from "@/models/Doubt";
import Course from "@/models/Course";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { isMockDataMode } from "@/lib/config";
import { MOCK_TEACHER_DOUBTS } from "@/lib/mock-data";

export async function submitDoubt(data: {
  courseId: string;
  topicId: string;
  question: string;
}) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return { success: false as const, error: "Unauthorized" };

    await dbConnect();

    const course = await Course.findById(data.courseId).select("instructorId");
    if (!course) return { success: false as const, error: "Course not found" };
    if (!course.instructorId)
      return {
        success: false as const,
        error: "Course has no associated teacher",
      };

    const doubt = await Doubt.create({
      studentId: session.user.id,
      teacherId: course.instructorId,
      courseId: data.courseId,
      topicId: data.topicId,
      question: data.question.trim(),
    });

    return { success: true as const, doubt: JSON.parse(JSON.stringify(doubt)) };
  } catch (error) {
    return {
      success: false as const,
      error: error instanceof Error ? error.message : "Failed to submit doubt",
    };
  }
}

export async function getTeacherDoubts() {
  try {
    const session = await getServerSession(authOptions);
    const role = session?.user?.role;
    if (!session?.user?.id || (role !== "teacher" && role !== "admin")) {
      return { success: false as const, error: "Unauthorized", doubts: [] };
    }

    if (isMockDataMode()) {
      return { success: true as const, doubts: MOCK_TEACHER_DOUBTS };
    }

    await dbConnect();

    const query =
      role === "admin"
        ? { status: "Open" as const }
        : { teacherId: session.user.id, status: "Open" as const };

    const doubts = await Doubt.find(query)
      .populate("studentId", "name email")
      .populate("topicId", "title")
      .populate("courseId", "title")
      .sort({ createdAt: -1 })
      .lean();

    const clean = doubts.filter((d) => d.courseId && d.topicId);

    return {
      success: true as const,
      doubts: JSON.parse(JSON.stringify(clean)),
    };
  } catch (error) {
    return {
      success: false as const,
      error: error instanceof Error ? error.message : "Failed to load doubts",
      doubts: [],
    };
  }
}

export async function resolveDoubt(doubtId: string, answer: string) {
  try {
    const session = await getServerSession(authOptions);
    const role = session?.user?.role;
    if (!session?.user?.id || (role !== "teacher" && role !== "admin")) {
      return { success: false as const, error: "Unauthorized" };
    }

    if (isMockDataMode() && doubtId.startsWith("mock-")) {
      return { success: true as const, doubt: { _id: doubtId } };
    }

    await dbConnect();

    const query =
      role === "admin"
        ? { _id: doubtId }
        : { _id: doubtId, teacherId: session.user.id };

    const doubt = await Doubt.findOneAndUpdate(
      query,
      { answer: answer.trim(), status: "Resolved" },
      { new: true }
    );

    if (!doubt) {
      return {
        success: false as const,
        error: "Doubt not found or access denied",
      };
    }

    return { success: true as const, doubt: JSON.parse(JSON.stringify(doubt)) };
  } catch (error) {
    return {
      success: false as const,
      error: error instanceof Error ? error.message : "Failed to resolve doubt",
    };
  }
}

export async function getTopicDoubts(topicId: string) {
  try {
    await dbConnect();
    const doubts = await Doubt.find({ topicId, status: "Resolved" })
      .populate("studentId", "name")
      .sort({ updatedAt: -1 })
      .lean();
    return {
      success: true as const,
      doubts: JSON.parse(JSON.stringify(doubts)),
    };
  } catch (error) {
    return {
      success: false as const,
      error: error instanceof Error ? error.message : "Failed to load doubts",
      doubts: [],
    };
  }
}
