"use server";

import dbConnect from "@/lib/mongodb";
import Assignment from "@/models/Assignment";
import AssignmentSubmission from "@/models/AssignmentSubmission";
import UserProgress from "@/models/UserProgress";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { revalidatePath } from "next/cache";

async function requireInstructor() {
  const session = await getServerSession(authOptions);
  if (
    !session?.user?.id ||
    (session.user.role !== "admin" && session.user.role !== "teacher")
  ) {
    throw new Error("Unauthorized access.");
  }
  return session;
}

type PopulatedCourse = {
  _id: unknown;
  instructorId?: { toString: () => string };
};

type PopulatedAssignment = {
  _id: unknown;
  title?: string;
  maxScore?: number;
  courseId?: PopulatedCourse | null;
};

export async function getPendingSubmissions() {
  try {
    const session = await requireInstructor();
    await dbConnect();

    const myAssignments = await Assignment.find()
      .populate({ path: "courseId", select: "instructorId" })
      .lean<PopulatedAssignment[]>();

    const allowedIds = myAssignments
      .filter(
        (a) =>
          session.user.role === "admin" ||
          a.courseId?.instructorId?.toString() === session.user.id
      )
      .map((a) => a._id);

    const submissions = await AssignmentSubmission.find({
      assignmentId: { $in: allowedIds },
      status: "pending",
    })
      .populate("assignmentId", "title maxScore")
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .lean();

    return {
      success: true as const,
      submissions: JSON.parse(JSON.stringify(submissions)),
    };
  } catch (error) {
    return {
      success: false as const,
      error:
        error instanceof Error ? error.message : "Failed to load submissions",
      submissions: [] as unknown[],
    };
  }
}

export async function gradeSubmission(
  submissionId: string,
  score: number,
  feedback: string
) {
  try {
    const session = await requireInstructor();
    await dbConnect();

    const existing = await AssignmentSubmission.findById(submissionId).populate({
      path: "assignmentId",
      populate: { path: "courseId" },
    });

    if (!existing) throw new Error("Submission not found");

    const assignment = existing.assignmentId as unknown as {
      courseId?: { _id?: unknown; instructorId?: { toString: () => string } };
    } | null;

    if (
      session.user.role !== "admin" &&
      assignment?.courseId?.instructorId?.toString() !== session.user.id
    ) {
      throw new Error("Unauthorized to grade this submission.");
    }

    const sub = await AssignmentSubmission.findByIdAndUpdate(
      submissionId,
      {
        score,
        teacherFeedback: feedback,
        status: "graded",
      },
      { new: true }
    );

    if (sub && assignment?.courseId?._id) {
      const courseId = assignment.courseId._id;
      const progress = await UserProgress.findOne({
        userId: sub.userId,
        courseId,
      });

      if (progress) {
        const pSub = progress.assignmentSubmissions.find(
          (s) => s.assignmentId.toString() === sub.assignmentId.toString()
        );
        if (pSub) {
          pSub.score = score;
          pSub.status = "graded";
        } else {
          progress.assignmentSubmissions.push({
            assignmentId: sub.assignmentId,
            status: "graded",
            score,
            submittedAt: sub.submittedAt,
          });
        }
        await progress.save();
      }
    }

    revalidatePath("/dashboard/teacher/assignments");
    return {
      success: true as const,
      submission: JSON.parse(JSON.stringify(sub)),
    };
  } catch (error) {
    return {
      success: false as const,
      error:
        error instanceof Error ? error.message : "Failed to grade submission",
    };
  }
}
