import dbConnect from "@/lib/mongodb";
import UserProgress from "@/models/UserProgress";
import Assessment from "@/models/Assessment";
import Topic from "@/models/Topic";
import Course from "@/models/Course";

export type AttemptSummary = {
  score: number;
  topicTitle: string | null;
  courseTitle: string | null;
  at: string;
};

export type StudentPerformanceSnapshot = {
  averageScore: number;
  totalAttempts: number;
  topicsCompleted: number;
  coursesEnrolled: number;
  attempts: AttemptSummary[];
  legacyWeakTopicTitles: string[];
};

export async function buildStudentPerformanceSnapshot(
  userId: string
): Promise<StudentPerformanceSnapshot> {
  await dbConnect();
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
  const legacyWeakTopicTitles = weakTopicsDoc
    .map((t) => t.title)
    .filter((x): x is string => Boolean(x));

  type RawAttempt = {
    score: number;
    assessmentId: { toString(): string };
    timestamp: Date;
    courseId: { toString(): string };
  };

  const rawAttempts: RawAttempt[] = [];
  let scoreSum = 0;

  for (const p of progresses) {
    for (const a of p.assessmentAttempts || []) {
      scoreSum += a.score;
      rawAttempts.push({
        score: a.score,
        assessmentId: a.assessmentId,
        timestamp: a.timestamp,
        courseId: p.courseId,
      });
    }
  }

  const attemptCount = rawAttempts.length;
  const recent = rawAttempts
    .slice(-30)
    .sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

  const assessmentIds = [
    ...new Set(recent.map((r) => r.assessmentId.toString())),
  ];
  const assessments =
    assessmentIds.length > 0
      ? await Assessment.find({ _id: { $in: assessmentIds } })
          .select("topicId")
          .lean()
      : [];

  const topicIds = [
    ...new Set(assessments.map((a) => a.topicId.toString())),
  ];
  const topics =
    topicIds.length > 0
      ? await Topic.find({ _id: { $in: topicIds } })
          .select("title moduleId")
          .lean()
      : [];

  const topicById = new Map(topics.map((t) => [t._id.toString(), t]));
  const assessmentTopic = new Map(
    assessments.map((a) => [a._id.toString(), a.topicId.toString()])
  );

  const courseIds = [...new Set(progresses.map((p) => p.courseId.toString()))];
  const courses =
    courseIds.length > 0
      ? await Course.find({ _id: { $in: courseIds } })
          .select("title")
          .lean()
      : [];
  const courseTitle = new Map(courses.map((c) => [c._id.toString(), c.title]));

  const attempts: AttemptSummary[] = recent.map((raw) => {
    const tid = assessmentTopic.get(raw.assessmentId.toString());
    const topic = tid ? topicById.get(tid) : undefined;
    return {
      score: raw.score,
      topicTitle: topic?.title ?? null,
      courseTitle: courseTitle.get(raw.courseId.toString()) ?? null,
      at: new Date(raw.timestamp).toISOString(),
    };
  });

  let topicsCompleted = 0;
  for (const p of progresses) {
    topicsCompleted += (p.completedTopics || []).length;
  }

  return {
    averageScore: attemptCount ? Math.round(scoreSum / attemptCount) : 0,
    totalAttempts: attemptCount,
    topicsCompleted,
    coursesEnrolled: progresses.length,
    attempts,
    legacyWeakTopicTitles,
  };
}
