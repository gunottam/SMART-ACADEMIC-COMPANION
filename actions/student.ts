"use server";

import dbConnect from "@/lib/mongodb";
import Course from "@/models/Course";
import Module from "@/models/Module";
import Topic from "@/models/Topic";
import Assessment from "@/models/Assessment";
import Assignment from "@/models/Assignment";
import AssignmentSubmission from "@/models/AssignmentSubmission";
import UserProgress from "@/models/UserProgress";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import mongoose from "mongoose";
import { isMockDataMode } from "@/lib/config";
import { MOCK_LEARNING_INSIGHTS, MOCK_STUDENT_ANALYTICS } from "@/lib/mock-data";
import { buildStudentPerformanceSnapshot } from "@/lib/studentPerformance";
import { generateLearningInsightsWithGroq } from "@/lib/groq";
import { buildFallbackLearningInsights } from "@/lib/learningFallback";
import type { LearningInsights } from "@/lib/groq";

async function requireSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session;
}

export async function getPublishedCourses() {
  try {
    await dbConnect();
    const courses = await Course.find({ status: "published" })
      .populate("instructorId", "name image")
      .sort({ createdAt: -1 })
      .lean();
    return { success: true as const, courses: JSON.parse(JSON.stringify(courses)) };
  } catch (error) {
    return {
      success: false as const,
      error: error instanceof Error ? error.message : "Failed to load courses",
      courses: [] as unknown[],
    };
  }
}

export async function getCourseWithCurriculum(courseId: string) {
  try {
    await dbConnect();

    const course = await Course.findById(courseId)
      .populate("instructorId", "name")
      .lean();
    if (!course) throw new Error("Course not found");

    const modules = await Module.find({ courseId }).sort({ order: 1 }).lean();
    const moduleIds = modules.map((m) => m._id);
    const topics = await Topic.find({ moduleId: { $in: moduleIds } })
      .sort({ order: 1 })
      .lean();

    const topicIds = topics.map((t) => t._id);
    const [assessments, assignments] = await Promise.all([
      Assessment.find({ topicId: { $in: topicIds } }).lean(),
      Assignment.find({ topicId: { $in: topicIds } }).lean(),
    ]);

    const curriculum = modules.map((m) => ({
      ...m,
      topics: topics
        .filter((t) => t.moduleId.toString() === m._id.toString())
        .map((t) => {
          const assessment = assessments.find(
            (a) => a.topicId.toString() === t._id.toString()
          );
          const assignment = assignments.find(
            (a) => a.topicId?.toString() === t._id.toString()
          );
          return {
            ...t,
            ...(assessment ? { assessment } : {}),
            ...(assignment ? { assignment } : {}),
          };
        }),
    }));

    return {
      success: true as const,
      course: JSON.parse(JSON.stringify(course)),
      curriculum: JSON.parse(JSON.stringify(curriculum)),
    };
  } catch (error) {
    return {
      success: false as const,
      error: error instanceof Error ? error.message : "Failed to load course",
    };
  }
}

export async function startCourse(courseId: string) {
  try {
    const session = await requireSession();
    await dbConnect();

    let progress = await UserProgress.findOne({
      userId: session.user.id,
      courseId,
    });

    if (!progress) {
      progress = await UserProgress.create({
        userId: session.user.id,
        courseId,
        progress: 0,
        completedTopics: [],
        startedAt: Date.now(),
      });
    }

    const moduleIds = (await Module.find({ courseId }).select("_id").lean()).map(
      (m) => m._id
    );
    const totalTopics = await Topic.countDocuments({
      moduleId: { $in: moduleIds },
    });

    const expected =
      totalTopics > 0
        ? Math.min(
            100,
            Math.round((progress.completedTopics.length / totalTopics) * 100)
          )
        : 0;

    if (progress.progress !== expected) {
      progress.progress = expected;
      await progress.save();
    }

    return {
      success: true as const,
      progress: JSON.parse(JSON.stringify(progress)),
    };
  } catch (error) {
    return {
      success: false as const,
      error: error instanceof Error ? error.message : "Failed to start course",
    };
  }
}

async function recalcProgress(
  progressDoc: mongoose.Document & {
    completedTopics: mongoose.Types.ObjectId[];
    progress: number;
    lastActivityAt: Date;
  },
  courseId: string
) {
  const moduleIds = (await Module.find({ courseId }).select("_id").lean()).map(
    (m) => m._id
  );
  const total = await Topic.countDocuments({ moduleId: { $in: moduleIds } });
  progressDoc.progress =
    total > 0
      ? Math.min(
          100,
          Math.round((progressDoc.completedTopics.length / total) * 100)
        )
      : 0;
  progressDoc.lastActivityAt = new Date();
}

export async function markTopicComplete(
  courseId: string,
  topicId: string,
  _totalTopicsHint?: number
) {
  try {
    void _totalTopicsHint;
    const session = await requireSession();
    await dbConnect();

    const progress = await UserProgress.findOne({
      userId: session.user.id,
      courseId,
    });
    if (!progress) throw new Error("Progress document not initialised");

    const already = progress.completedTopics.some(
      (id) => id.toString() === topicId
    );
    if (!already) {
      progress.completedTopics.push(new mongoose.Types.ObjectId(topicId));
      await recalcProgress(progress, courseId);
      await progress.save();
    }

    return {
      success: true as const,
      progress: JSON.parse(JSON.stringify(progress)),
    };
  } catch (error) {
    return {
      success: false as const,
      error: error instanceof Error ? error.message : "Failed to update progress",
    };
  }
}

export async function submitAssessment(
  courseId: string,
  topicId: string,
  assessmentId: string,
  score: number,
  _totalTopicsHint?: number
) {
  try {
    void _totalTopicsHint;
    const session = await requireSession();
    await dbConnect();

    const progress = await UserProgress.findOne({
      userId: session.user.id,
      courseId,
    });
    if (!progress) throw new Error("Progress document not initialised");

    progress.assessmentAttempts.push({
      assessmentId: new mongoose.Types.ObjectId(assessmentId),
      score,
      timestamp: new Date(),
    });

    const topicObjectId = new mongoose.Types.ObjectId(topicId);
    if (score >= 70) {
      const done = progress.completedTopics.some(
        (id) => id.toString() === topicId
      );
      if (!done) progress.completedTopics.push(topicObjectId);
      progress.weakAreas = progress.weakAreas.filter(
        (w) => w.toString() !== topicId
      );
    } else if (!progress.weakAreas.some((w) => w.toString() === topicId)) {
      progress.weakAreas.push(topicObjectId);
    }

    await recalcProgress(progress, courseId);
    await progress.save();

    return {
      success: true as const,
      progress: JSON.parse(JSON.stringify(progress)),
    };
  } catch (error) {
    return {
      success: false as const,
      error: error instanceof Error ? error.message : "Failed to submit assessment",
    };
  }
}

export async function getStudentAnalytics() {
  try {
    const session = await requireSession();

    if (isMockDataMode()) {
      return {
        success: true as const,
        stats: {
          totalCoursesEnrolled: MOCK_STUDENT_ANALYTICS.totalCoursesEnrolled,
          topicsCompleted: MOCK_STUDENT_ANALYTICS.topicsCompleted,
          averageScore: MOCK_STUDENT_ANALYTICS.averageScore,
          weakAreas: MOCK_STUDENT_ANALYTICS.weakAreas,
          recentAssessments: MOCK_STUDENT_ANALYTICS.recentAssessments,
          source: "mock" as const,
        },
      };
    }

    await dbConnect();

    const userId = session.user.id;
    const progresses = await UserProgress.find({ userId }).lean();

    const weakAreaIds = [
      ...new Set(
        progresses.flatMap((p) =>
          (p.weakAreas || []).map((w) => w.toString())
        )
      ),
    ];
    const weakTopicsDoc =
      weakAreaIds.length > 0
        ? await Topic.find({ _id: { $in: weakAreaIds } })
            .select("title")
            .lean()
        : [];
    const weakAreaTitles = weakTopicsDoc
      .map((t) => t.title)
      .filter((x): x is string => Boolean(x));

    let topicsCompleted = 0;
    let attemptsCount = 0;
    let scoreSum = 0;

    for (const p of progresses) {
      topicsCompleted += (p.completedTopics || []).length;
      for (const a of p.assessmentAttempts || []) {
        attemptsCount += 1;
        scoreSum += a.score;
      }
    }

    const recentAssessments = progresses.flatMap(
      (p) => p.assessmentAttempts || []
    );

    return {
      success: true as const,
      stats: {
        totalCoursesEnrolled: progresses.length,
        topicsCompleted,
        averageScore:
          attemptsCount > 0 ? Math.round(scoreSum / attemptsCount) : 0,
        weakAreas: weakAreaTitles,
        recentAssessments: JSON.parse(JSON.stringify(recentAssessments)),
        source: "live" as const,
      },
    };
  } catch (error) {
    return {
      success: false as const,
      error: error instanceof Error ? error.message : "Failed to load analytics",
    };
  }
}

export type StudentLearningInsightsResult =
  | {
      success: true;
      insights: LearningInsights;
      source: "mock" | "groq" | "fallback";
    }
  | { success: false; error: string };

/** Groq-powered weak-area detection + personalized study plan (fallback if no API key). */
export async function getStudentLearningInsights(): Promise<StudentLearningInsightsResult> {
  try {
    const session = await requireSession();

    if (isMockDataMode()) {
      return {
        success: true as const,
        insights: MOCK_LEARNING_INSIGHTS,
        source: "mock" as const,
      };
    }

    const snapshot = await buildStudentPerformanceSnapshot(session.user.id);
    const groqInsights = await generateLearningInsightsWithGroq(
      JSON.stringify(snapshot)
    );
    const insights =
      groqInsights ?? buildFallbackLearningInsights(snapshot);

    return {
      success: true as const,
      insights,
      source: groqInsights ? ("groq" as const) : ("fallback" as const),
    };
  } catch (error) {
    return {
      success: false as const,
      error:
        error instanceof Error ? error.message : "Failed to build learning plan",
    };
  }
}

export async function submitAssignment(
  courseId: string,
  assignmentId: string,
  content: string,
  submissionType: "text" | "file"
) {
  try {
    const session = await requireSession();
    await dbConnect();

    const userId = new mongoose.Types.ObjectId(session.user.id);
    const assignmentObjectId = new mongoose.Types.ObjectId(assignmentId);

    await AssignmentSubmission.findOneAndUpdate(
      { assignmentId: assignmentObjectId, userId },
      {
        content,
        submissionType,
        status: "pending",
        submittedAt: new Date(),
      },
      { new: true, upsert: true }
    );

    const progress = await UserProgress.findOne({ userId, courseId });
    if (progress) {
      const existing = progress.assignmentSubmissions.find(
        (s) => s.assignmentId.toString() === assignmentId
      );
      if (existing) {
        existing.status = "pending";
        existing.submittedAt = new Date();
      } else {
        progress.assignmentSubmissions.push({
          assignmentId: assignmentObjectId,
          status: "pending",
          submittedAt: new Date(),
        });
      }
      progress.lastActivityAt = new Date();
      await progress.save();
    }

    return { success: true as const };
  } catch (error) {
    return {
      success: false as const,
      error:
        error instanceof Error ? error.message : "Failed to submit assignment",
    };
  }
}
