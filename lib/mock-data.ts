import type { LearningInsights } from "@/lib/groq";

/** Student analytics — mirrors `getStudentAnalytics` stats shape */
export const MOCK_STUDENT_ANALYTICS = {
  totalCoursesEnrolled: 3,
  topicsCompleted: 12,
  averageScore: 72,
  weakAreas: [] as string[],
  recentAssessments: [
    { score: 68, timestamp: new Date(Date.now() - 86400000 * 5).toISOString() },
    { score: 74, timestamp: new Date(Date.now() - 86400000 * 4).toISOString() },
    { score: 71, timestamp: new Date(Date.now() - 86400000 * 3).toISOString() },
    { score: 78, timestamp: new Date(Date.now() - 86400000 * 2).toISOString() },
    { score: 82, timestamp: new Date(Date.now() - 86400000).toISOString() },
    { score: 79, timestamp: new Date().toISOString() },
  ],
};

export const MOCK_LEARNING_INSIGHTS: LearningInsights = {
  weakAreas: [
    { topic: "Async JavaScript & Promises", reason: "Quiz attempts averaged below mastery threshold; confusion around error handling." },
    { topic: "REST API design", reason: "Short-answer patterns suggest gaps linking HTTP verbs to resource semantics." },
    { topic: "CSS Grid vs Flexbox", reason: "Mixed scores on layout drills—practice choosing the right tool per use-case." },
  ],
  planTitle: "4-week catch-up: foundations → integration",
  planSummary:
    "Prioritize async control flow with short daily drills, then connect to a tiny API project you ship end-to-end. Capstone week blends layout practice with API consumption so skills compound.",
  weeklySteps: [
    { day: "Mon", focus: "20 min: promise chains + async/await drills (10 micro-items)", minutes: 20 },
    { day: "Tue", focus: "Build one endpoint consumer (GET + error UI) in a sandbox page", minutes: 35 },
    { day: "Wed", focus: "Grid/Flex: recreate two reference layouts without peeking at solution", minutes: 30 },
    { day: "Thu", focus: "POST + validation story; log failures and retry once", minutes: 40 },
    { day: "Fri", focus: "Review weakest quiz topics; re-attempt similar items timed", minutes: 25 },
  ],
};

export const MOCK_TEACHER_DASHBOARD = {
  activeCount: 2,
  totalCourses: 3,
  uniqueStudents: 14,
  totalAssessmentsTaken: 47,
  avgScores: [
    { courseId: "mock-c1", courseName: "Full-Stack Web Foundations", averageScore: 76.5, totalStudents: 8 },
    { courseId: "mock-c2", courseName: "Data Structures Lab", averageScore: 71.2, totalStudents: 6 },
  ],
  weakTopics: [
    { topicName: "Async / Promises", frequency: 9 },
    { topicName: "MongoDB indexing", frequency: 5 },
    { topicName: "Authentication flows", frequency: 4 },
  ],
};

export const MOCK_TEACHER_DOUBTS = [
  {
    _id: "mock-doubt-1",
    question: "Should we prefer aggregation pipelines over multiple find() calls for the leaderboard?",
    studentId: { name: "River Chen" },
    courseId: { title: "Data Structures Lab" },
    topicId: { title: "MongoDB queries" },
  },
  {
    _id: "mock-doubt-2",
    question: "Is it okay to store refresh tokens in httpOnly cookies only, or do we need CSRF too?",
    studentId: { name: "Sam Okonkwo" },
    courseId: { title: "Full-Stack Web Foundations" },
    topicId: { title: "Authentication flows" },
  },
];

export const MOCK_TEACHER_ROSTER = [
  {
    id: "mock-r1",
    studentId: "u1",
    studentName: "River Chen",
    studentEmail: "river@example.edu",
    courseName: "Full-Stack Web Foundations",
    completionPercentage: 62,
    averageScore: 74,
    weakAreas: ["Async / Promises", "REST verbs"],
  },
  {
    id: "mock-r2",
    studentId: "u2",
    studentName: "Sam Okonkwo",
    studentEmail: "sam@example.edu",
    courseName: "Full-Stack Web Foundations",
    completionPercentage: 88,
    averageScore: 81,
    weakAreas: [],
  },
  {
    id: "mock-r3",
    studentId: "u3",
    studentName: "Jordan Miles",
    studentEmail: "jordan@example.edu",
    courseName: "Data Structures Lab",
    completionPercentage: 45,
    averageScore: 63,
    weakAreas: ["MongoDB indexing", "Big-O proofs"],
  },
];
