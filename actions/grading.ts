"use server";

import dbConnect from "@/lib/mongodb";
import Assignment from "@/models/Assignment";
import AssignmentSubmission from "@/models/AssignmentSubmission";
import User from "@/models/User";
import UserProgress from "@/models/UserProgress";
import Course from "@/models/Course";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { revalidatePath } from "next/cache";

async function verifyTeacher() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "admin" && session.user.role !== "teacher")) {
    throw new Error("Unauthorized access.");
  }
  return session;
}

export async function getPendingSubmissions() {
  try {
    const session = await verifyTeacher();
    await dbConnect();

    // Find assignments directly mapping through the course
    const myAssignments = await Assignment.find()
      .populate({ path: 'courseId', select: 'instructorId' })
      .lean();

    const allowedAssigIds = myAssignments
      .filter((a: any) => a.courseId?.instructorId?.toString() === session.user.id || session.user.role === "admin")
      .map((a: any) => a._id);

    const submissions = await AssignmentSubmission.find({
      assignmentId: { $in: allowedAssigIds },
      status: "pending" // Only reviewing pending
    })
    .populate('assignmentId', 'title maxScore', Assignment)
    .populate('userId', 'name email', User)
    .sort({ createdAt: -1 })
    .lean();

    return { success: true, submissions: JSON.parse(JSON.stringify(submissions)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function gradeSubmission(submissionId: string, score: number, feedback: string) {
  try {
    const session = await verifyTeacher();
    await dbConnect();

    const existingSub = await AssignmentSubmission.findById(submissionId).populate({
      path: 'assignmentId',
      populate: { path: 'courseId' }
    });

    if (!existingSub) throw new Error("Submission not found");

    if (session.user.role !== "admin" && existingSub.assignmentId?.courseId?.instructorId?.toString() !== session.user.id) {
      throw new Error("Unauthorized to grade this submission.");
    }

    const sub = await AssignmentSubmission.findByIdAndUpdate(submissionId, {
      score,
      teacherFeedback: feedback,
      status: "graded",
    }, { new: true });

    // Sync grade to UserProgress
    if (sub && existingSub.assignmentId?.courseId?._id) {
      const courseId = existingSub.assignmentId.courseId._id;
      const progress = await UserProgress.findOne({ userId: sub.userId, courseId });
      
      if (progress) {
        const pSub = progress.assignmentSubmissions.find((s: any) => s.assignmentId.toString() === sub.assignmentId.toString());
        if (pSub) {
          pSub.score = score;
          pSub.status = "graded";
        } else {
          progress.assignmentSubmissions.push({
            assignmentId: sub.assignmentId,
            status: "graded",
            score: score,
            submittedAt: sub.submittedAt
          });
        }
        await progress.save();
      }
    }

    revalidatePath("/dashboard/teacher/assignments");
    return { success: true, submission: JSON.parse(JSON.stringify(sub)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
