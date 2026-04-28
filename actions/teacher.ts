"use server";

import dbConnect from "@/lib/mongodb";
import Course from "@/models/Course";
import Module from "@/models/Module";
import Topic from "@/models/Topic";
import Assessment from "@/models/Assessment";
import Assignment from "@/models/Assignment";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { revalidatePath } from "next/cache";
import UserProgress from "@/models/UserProgress";
import { getTeacherDoubts } from "@/actions/doubts";
import { isMockDataMode } from "@/lib/config";
import {
  MOCK_TEACHER_DASHBOARD,
  MOCK_TEACHER_DOUBTS,
  MOCK_TEACHER_ROSTER,
} from "@/lib/mock-data";

async function requireInstructor() {
  const session = await getServerSession(authOptions);
  if (
    !session?.user?.id ||
    (session.user.role !== "admin" && session.user.role !== "teacher")
  ) {
    throw new Error("Instructor access required.");
  }
  return session;
}

type ModuleInput = {
  _id?: string;
  title: string;
  description?: string;
  topics: TopicInput[];
};
type TopicInput = {
  _id?: string;
  title: string;
  content: string;
  assessment?: {
    _id?: string;
    title?: string;
    passingScore?: number;
    questions: Array<{
      text: string;
      options: string[];
      correctOptionIndex: number;
    }>;
  };
  assignment?: {
    _id?: string;
    title: string;
    description?: string;
    maxScore?: number;
    dueDate?: Date | string | null;
  };
};

export async function createCourse(data: {
  title: string;
  description: string;
  tags: string[];
  status: string;
  modules: ModuleInput[];
}) {
  try {
    const session = await requireInstructor();
    await dbConnect();

    const newCourse = await Course.create({
      title: data.title,
      description: data.description,
      tags: data.tags,
      instructorId: session.user.id,
      status: data.status,
    });

    if (Array.isArray(data.modules)) {
      for (let i = 0; i < data.modules.length; i++) {
        const mod = data.modules[i];
        if (!mod.title?.trim() && (mod.topics || []).length === 0) continue;

        const moduleDoc = await Module.create({
          courseId: newCourse._id,
          title: mod.title?.trim() || "Untitled Module",
          description: mod.description || "",
          order: i,
        });

        const validTopics = (mod.topics || []).filter(
          (t) => t.title?.trim() || t.content?.trim()
        );
        if (validTopics.length === 0) continue;

        const insertedTopics = await Topic.insertMany(
          validTopics.map((t, idx) => ({
            moduleId: moduleDoc._id,
            title: t.title?.trim() || "Untitled Topic",
            content: t.content?.trim() || "No content provided yet.",
            order: idx,
          }))
        );

        const assessmentsToInsert = validTopics
          .map((t, idx) => {
            if (!t.assessment?.questions?.length) return null;
            const qs = t.assessment.questions.filter(
              (q) => q.text?.trim() && q.options?.[0]?.trim()
            );
            if (!qs.length) return null;
            return {
              topicId: insertedTopics[idx]._id,
              title: t.assessment.title?.trim() || "Topic Quiz",
              questions: qs.map((q) => ({
                text: q.text.trim(),
                options: q.options.map((o) => o?.trim() || "Empty Option"),
                correctOptionIndex: q.correctOptionIndex || 0,
              })),
              passingScore: t.assessment.passingScore || 70,
            };
          })
          .filter(Boolean);
        if (assessmentsToInsert.length) {
          await Assessment.insertMany(assessmentsToInsert);
        }

        const assignmentsToInsert = validTopics
          .map((t, idx) => {
            if (!t.assignment?.title?.trim()) return null;
            return {
              courseId: newCourse._id,
              moduleId: moduleDoc._id,
              topicId: insertedTopics[idx]._id,
              title: t.assignment.title.trim(),
              description:
                t.assignment.description?.trim() || "No instructions provided.",
              maxScore: t.assignment.maxScore || 100,
              dueDate: t.assignment.dueDate || null,
            };
          })
          .filter(Boolean);
        if (assignmentsToInsert.length) {
          await Assignment.insertMany(assignmentsToInsert);
        }
      }
    }

    revalidatePath("/dashboard/teacher/courses");
    return { success: true as const, courseId: newCourse._id.toString() };
  } catch (error) {
    return {
      success: false as const,
      error: error instanceof Error ? error.message : "Failed to create course",
    };
  }
}

export async function getTeacherCourses() {
  try {
    const session = await requireInstructor();
    await dbConnect();

    const courses = await Course.find({ instructorId: session.user.id })
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

export async function getCourseForEdit(courseId: string) {
  try {
    const session = await requireInstructor();
    await dbConnect();

    const course = await Course.findById(courseId);
    if (!course) throw new Error("Course not found");

    if (
      session.user.role !== "admin" &&
      course.instructorId.toString() !== session.user.id
    ) {
      throw new Error("You do not own this course.");
    }

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
      id: m._id.toString(),
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
            id: t._id.toString(),
            ...(assessment
              ? { assessment: { ...assessment, id: assessment._id.toString() } }
              : {}),
            ...(assignment
              ? { assignment: { ...assignment, id: assignment._id.toString() } }
              : {}),
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

export async function updateCourseWithCurriculum(
  courseId: string,
  data: {
    title: string;
    description: string;
    tags: string[];
    status: string;
    modules: ModuleInput[];
  }
) {
  try {
    const session = await requireInstructor();
    await dbConnect();

    const course = await Course.findById(courseId);
    if (!course) throw new Error("Course not found");
    if (
      session.user.role !== "admin" &&
      course.instructorId.toString() !== session.user.id
    ) {
      throw new Error("You do not own this course.");
    }

    course.title = data.title;
    course.description = data.description;
    course.tags = data.tags;
    course.status = data.status as typeof course.status;
    await course.save();

    const incomingModuleIds = data.modules
      .filter((m) => m._id)
      .map((m) => m._id as string);
    const existingModules = await Module.find({ courseId });

    for (const exMod of existingModules) {
      if (!incomingModuleIds.includes(exMod._id.toString())) {
        const topicsToDelete = await Topic.find({ moduleId: exMod._id });
        const topicIds = topicsToDelete.map((t) => t._id);
        await Assessment.deleteMany({ topicId: { $in: topicIds } });
        await Assignment.deleteMany({ topicId: { $in: topicIds } });
        await Topic.deleteMany({ moduleId: exMod._id });
        await Module.findByIdAndDelete(exMod._id);
      }
    }

    for (let i = 0; i < data.modules.length; i++) {
      const mod = data.modules[i];
      if (!mod.title?.trim() && (mod.topics || []).length === 0) continue;

      const moduleDoc =
        mod._id && mod._id.length === 24
          ? await Module.findByIdAndUpdate(
              mod._id,
              {
                title: mod.title?.trim() || "Untitled Module",
                description: mod.description || "",
                order: i,
              },
              { new: true }
            )
          : await Module.create({
              courseId,
              title: mod.title?.trim() || "Untitled Module",
              description: mod.description || "",
              order: i,
            });

      if (!moduleDoc) continue;

      const incomingTopicIds = (mod.topics || [])
        .filter((t) => t._id && t._id.length === 24)
        .map((t) => t._id as string);
      const existingTopics = await Topic.find({ moduleId: moduleDoc._id });

      for (const exTop of existingTopics) {
        if (!incomingTopicIds.includes(exTop._id.toString())) {
          await Assessment.deleteMany({ topicId: exTop._id });
          await Assignment.deleteMany({ topicId: exTop._id });
          await Topic.findByIdAndDelete(exTop._id);
        }
      }

      for (let tIdx = 0; tIdx < (mod.topics || []).length; tIdx++) {
        const t = mod.topics[tIdx];
        if (!t.title?.trim() && !t.content?.trim()) continue;

        const topicDoc =
          t._id && t._id.length === 24
            ? await Topic.findByIdAndUpdate(
                t._id,
                {
                  title: t.title?.trim() || "Untitled Topic",
                  content: t.content?.trim() || "No content provided.",
                  order: tIdx,
                },
                { new: true }
              )
            : await Topic.create({
                moduleId: moduleDoc._id,
                title: t.title?.trim() || "Untitled Topic",
                content: t.content?.trim() || "No content provided.",
                order: tIdx,
              });

        if (!topicDoc) continue;

        if (t.assessment?.questions?.length) {
          const qs = t.assessment.questions.filter(
            (q) => q.text?.trim() && q.options?.[0]?.trim()
          );
          if (qs.length) {
            const mapped = qs.map((q) => ({
              text: q.text.trim(),
              options: q.options.map((o) => o?.trim() || "Empty Option"),
              correctOptionIndex: q.correctOptionIndex || 0,
            }));
            if (t.assessment._id && t.assessment._id.length === 24) {
              await Assessment.findByIdAndUpdate(t.assessment._id, {
                title: t.assessment.title?.trim() || "Topic Quiz",
                questions: mapped,
                passingScore: t.assessment.passingScore || 70,
              });
            } else {
              await Assessment.deleteMany({ topicId: topicDoc._id });
              await Assessment.create({
                topicId: topicDoc._id,
                title: t.assessment.title?.trim() || "Topic Quiz",
                questions: mapped,
                passingScore: t.assessment.passingScore || 70,
              });
            }
          }
        } else {
          await Assessment.deleteMany({ topicId: topicDoc._id });
        }

        if (t.assignment?.title?.trim()) {
          if (t.assignment._id && t.assignment._id.length === 24) {
            await Assignment.findByIdAndUpdate(t.assignment._id, {
              title: t.assignment.title.trim(),
              description:
                t.assignment.description?.trim() || "No instructions provided.",
              maxScore: t.assignment.maxScore || 100,
              dueDate: t.assignment.dueDate || null,
            });
          } else {
            await Assignment.deleteMany({ topicId: topicDoc._id });
            await Assignment.create({
              courseId,
              moduleId: moduleDoc._id,
              topicId: topicDoc._id,
              title: t.assignment.title.trim(),
              description:
                t.assignment.description?.trim() || "No instructions provided.",
              maxScore: t.assignment.maxScore || 100,
              dueDate: t.assignment.dueDate || null,
            });
          }
        } else {
          await Assignment.deleteMany({ topicId: topicDoc._id });
        }
      }
    }

    revalidatePath("/dashboard/teacher/courses");
    revalidatePath(`/dashboard/teacher/courses/${courseId}/edit`);
    return { success: true as const };
  } catch (error) {
    return {
      success: false as const,
      error: error instanceof Error ? error.message : "Failed to update course",
    };
  }
}

export async function getTeacherAnalytics() {
  try {
    const session = await requireInstructor();
    await dbConnect();

    const courseQuery =
      session.user.role === "admin"
        ? {}
        : { instructorId: session.user.id };
    const courses = await Course.find(courseQuery).select("_id").lean();
    const courseIds = courses.map((c) => c._id);

    const avgScores = await UserProgress.aggregate([
      { $match: { courseId: { $in: courseIds } } },
      {
        $addFields: {
          studentAvgScore: {
            $cond: {
              if: {
                $gt: [{ $size: { $ifNull: ["$assessmentAttempts", []] } }, 0],
              },
              then: { $avg: "$assessmentAttempts.score" },
              else: null,
            },
          },
        },
      },
      {
        $group: {
          _id: "$courseId",
          computedAvgScore: { $avg: "$studentAvgScore" },
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
          averageScore: {
            $round: [{ $ifNull: ["$computedAvgScore", 0] }, 1],
          },
          totalStudents: 1,
          _id: 0,
        },
      },
      { $sort: { averageScore: -1 } },
    ]);

    const weakTopics = await UserProgress.aggregate([
      { $match: { courseId: { $in: courseIds } } },
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

export async function getStudentsForTeacher() {
  try {
    const session = await requireInstructor();
    if (isMockDataMode()) {
      return { success: true as const, roster: MOCK_TEACHER_ROSTER };
    }
    await dbConnect();

    const courseQuery =
      session.user.role === "admin"
        ? {}
        : { instructorId: session.user.id };
    const courses = await Course.find(courseQuery).select("_id title").lean();
    const courseIds = courses.map((c) => c._id);
    const courseMap = new Map(courses.map((c) => [c._id.toString(), c.title]));

    const progresses = await UserProgress.find({ courseId: { $in: courseIds } })
      .populate("userId", "name email")
      .populate("weakAreas", "title")
      .lean();

    const roster = progresses
      .filter((p) => p.userId)
      .map((p) => {
        const attempts = p.assessmentAttempts || [];
        const avgScore = attempts.length
          ? Math.round(
              attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length
            )
          : 0;
        const u = p.userId as unknown as {
          _id: unknown;
          name?: string;
          email?: string;
        };
        const weak = (p.weakAreas || []) as Array<{ title?: string }>;
        return {
          id: p._id.toString(),
          studentId: String(u._id),
          studentName: u.name || "Unknown",
          studentEmail: u.email || "No Email",
          courseName: courseMap.get(p.courseId.toString()) || "Unknown Course",
          completionPercentage: p.progress || 0,
          averageScore: avgScore,
          weakAreas: weak
            .map((w) => w.title)
            .filter((v): v is string => Boolean(v)),
        };
      });

    return { success: true as const, roster };
  } catch (error) {
    return {
      success: false as const,
      error: error instanceof Error ? error.message : "Failed to load roster",
      roster: [] as unknown[],
    };
  }
}

export async function addStandaloneAssessment(data: {
  courseId: string;
  title: string;
  questions: Array<{
    text: string;
    options: string[];
    correctOptionIndex: number;
  }>;
  passingScore: number;
}) {
  try {
    const session = await requireInstructor();
    await dbConnect();

    const course = await Course.findById(data.courseId);
    if (!course) throw new Error("Course not found");
    if (
      session.user.role !== "admin" &&
      course.instructorId.toString() !== session.user.id
    ) {
      throw new Error("You do not own this course.");
    }

    let moduleDoc = await Module.findOne({
      courseId: data.courseId,
      title: "Additional Assessments",
    });
    if (!moduleDoc) {
      moduleDoc = await Module.create({
        courseId: data.courseId,
        title: "Additional Assessments",
        description: "Standalone tests and quizzes",
        order: 999,
      });
    }

    const topicCount = await Topic.countDocuments({ moduleId: moduleDoc._id });
    const topicDoc = await Topic.create({
      moduleId: moduleDoc._id,
      title: data.title,
      content: "Please complete the assessment below.",
      order: topicCount,
    });

    const qs = data.questions
      .filter((q) => q.text?.trim() && q.options?.[0]?.trim())
      .map((q) => ({
        text: q.text.trim(),
        options: q.options.map((o) => o?.trim() || "Empty Option"),
        correctOptionIndex: q.correctOptionIndex || 0,
      }));
    if (!qs.length) throw new Error("At least one question is required.");

    const assessment = await Assessment.create({
      topicId: topicDoc._id,
      title: data.title,
      questions: qs,
      passingScore: data.passingScore || 70,
    });

    revalidatePath("/dashboard/teacher/assessments");
    revalidatePath("/dashboard/student/courses");

    return {
      success: true as const,
      assessment: JSON.parse(JSON.stringify(assessment)),
    };
  } catch (error) {
    return {
      success: false as const,
      error:
        error instanceof Error
          ? error.message
          : "Failed to create assessment",
    };
  }
}

export async function getTeacherAssessmentResults() {
  try {
    const session = await requireInstructor();
    await dbConnect();

    const isAdmin = session.user.role === "admin";
    const courseQuery = isAdmin ? {} : { instructorId: session.user.id };

    const courses = await Course.find(courseQuery)
      .select("_id title")
      .lean();
    const courseIds = courses.map((c) => c._id);
    if (!courseIds.length)
      return { success: true as const, assessments: [], attempts: [] };

    const modules = await Module.find({ courseId: { $in: courseIds } })
      .select("_id courseId title")
      .lean();
    const moduleIds = modules.map((m) => m._id);

    const topics = await Topic.find({ moduleId: { $in: moduleIds } })
      .select("_id moduleId title")
      .lean();
    const topicIds = topics.map((t) => t._id);

    const assessments = await Assessment.find({ topicId: { $in: topicIds } })
      .sort({ createdAt: -1 })
      .lean();

    const progresses = await UserProgress.find({
      courseId: { $in: courseIds },
    })
      .populate("userId", "name email")
      .lean();

    const courseMap = new Map(courses.map((c) => [c._id.toString(), c.title]));
    const moduleMap = new Map(modules.map((m) => [m._id.toString(), m]));
    const topicMap = new Map(topics.map((t) => [t._id.toString(), t]));
    const assessmentMap = new Map(
      assessments.map((a) => [a._id.toString(), a])
    );

    const flattenedAssessments = assessments.map((a) => {
      const topic = topicMap.get(a.topicId?.toString());
      const moduleRow = topic ? moduleMap.get(topic.moduleId?.toString()) : null;
      const courseTitle = moduleRow
        ? courseMap.get(moduleRow.courseId?.toString())
        : "Unknown Course";
      return {
        _id: a._id.toString(),
        title: a.title,
        passingScore: a.passingScore ?? 70,
        questionCount: Array.isArray(a.questions) ? a.questions.length : 0,
        topicTitle: topic?.title || "Unknown Topic",
        moduleTitle: moduleRow?.title || "Unknown Module",
        courseTitle,
      };
    });

    const attempts: Array<{
      id: string;
      assessmentTitle: string;
      topicTitle: string;
      courseTitle: string;
      studentName: string;
      studentEmail: string;
      score: number;
      timestamp: Date;
    }> = [];

    for (const p of progresses) {
      const student = p.userId as unknown as { name?: string; email?: string };
      const courseTitle =
        courseMap.get(p.courseId?.toString()) || "Unknown Course";
      for (const attempt of p.assessmentAttempts || []) {
        const assessment = assessmentMap.get(attempt.assessmentId?.toString());
        if (!assessment) continue;
        const topic = topicMap.get(assessment.topicId?.toString());
        attempts.push({
          id: `${p._id.toString()}-${attempt.assessmentId?.toString()}-${attempt.timestamp}`,
          assessmentTitle: assessment.title,
          topicTitle: topic?.title || "Unknown Topic",
          courseTitle,
          studentName: student?.name || "Unknown Student",
          studentEmail: student?.email || "No Email",
          score: attempt.score,
          timestamp: attempt.timestamp,
        });
      }
    }

    attempts.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return {
      success: true as const,
      assessments: JSON.parse(JSON.stringify(flattenedAssessments)),
      attempts: JSON.parse(JSON.stringify(attempts)),
    };
  } catch (error) {
    return {
      success: false as const,
      error: error instanceof Error ? error.message : "Failed to load results",
      assessments: [] as unknown[],
      attempts: [] as unknown[],
    };
  }
}

export async function getTeacherDashboardData() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false as const, error: "Unauthorized" };
    }
    if (session.user.role !== "admin" && session.user.role !== "teacher") {
      return { success: false as const, error: "Forbidden" };
    }

    if (isMockDataMode()) {
      return {
        success: true as const,
        activeCount: MOCK_TEACHER_DASHBOARD.activeCount,
        totalCourses: MOCK_TEACHER_DASHBOARD.totalCourses,
        uniqueStudents: MOCK_TEACHER_DASHBOARD.uniqueStudents,
        totalAssessmentsTaken: MOCK_TEACHER_DASHBOARD.totalAssessmentsTaken,
        avgScores: MOCK_TEACHER_DASHBOARD.avgScores,
        weakTopics: MOCK_TEACHER_DASHBOARD.weakTopics,
        doubts: MOCK_TEACHER_DOUBTS,
      };
    }

    await dbConnect();
    const instructorId = session.user.id;
    const isAdmin = session.user.role === "admin";
    const courseQuery = isAdmin ? {} : { instructorId };
    const courses = await Course.find(courseQuery).select("_id status").lean();
    const activeCount = courses.filter((c) => c.status === "published").length;
    const courseIds = courses.map((c) => c._id);
    const progresses = courseIds.length
      ? await UserProgress.find({ courseId: { $in: courseIds } })
          .select("userId assessmentAttempts")
          .lean()
      : [];
    const uniqueStudents = new Set(
      progresses.map((p) => p.userId.toString())
    ).size;
    let totalAssessmentsTaken = 0;
    for (const p of progresses) {
      totalAssessmentsTaken += p.assessmentAttempts?.length || 0;
    }

    const analyticsRes = await getTeacherAnalytics();
    const doubtsRes = await getTeacherDoubts();

    return {
      success: true as const,
      activeCount,
      totalCourses: courses.length,
      uniqueStudents,
      totalAssessmentsTaken,
      avgScores: analyticsRes.success ? analyticsRes.analytics.avgScores : [],
      weakTopics: analyticsRes.success ? analyticsRes.analytics.weakTopics : [],
      doubts: doubtsRes.success ? doubtsRes.doubts : [],
    };
  } catch (error) {
    return {
      success: false as const,
      error:
        error instanceof Error ? error.message : "Failed to load dashboard",
      activeCount: 0,
      totalCourses: 0,
      uniqueStudents: 0,
      totalAssessmentsTaken: 0,
      avgScores: [] as unknown[],
      weakTopics: [] as unknown[],
      doubts: [] as unknown[],
    };
  }
}
