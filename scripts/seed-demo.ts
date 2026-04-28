/**
 * Wipes the MongoDB database and inserts one teacher, one student, one published course
 * with curriculum, assessments, progress, a doubt, and a pending assignment submission.
 *
 * Usage: npm run seed:demo -- --yes
 *
 * Login (credentials): emails must match ALLOWED_EMAIL_DOMAIN (default @geu.ac.in)
 *   Teacher: demo.teacher@geu.ac.in
 *   Student: demo.student@geu.ac.in
 *   Password: Demo2026!
 */

import { resolve } from "node:path";
import { config } from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });

import User from "../models/User";
import Course from "../models/Course";
import Module from "../models/Module";
import Topic from "../models/Topic";
import Assessment from "../models/Assessment";
import Assignment from "../models/Assignment";
import UserProgress from "../models/UserProgress";
import Doubt from "../models/Doubt";
import AssignmentSubmission from "../models/AssignmentSubmission";

const DEMO_PASSWORD = "Demo2026!";

const TEACHER = {
  email: "demo.teacher@geu.ac.in",
  name: "Demo Teacher",
  role: "teacher" as const,
};

const STUDENT = {
  email: "demo.student@geu.ac.in",
  name: "Demo Student",
  role: "student" as const,
};

function mcq(
  text: string,
  options: string[],
  correct: number
): { text: string; options: string[]; correctOptionIndex: number } {
  return { text, options, correctOptionIndex: correct };
}

async function main() {
  const confirmed =
    process.argv.includes("--yes") || process.argv.includes("-y");
  if (!confirmed) {
    console.error(
      "\nThis will DROP ALL DATA in your MongoDB database.\nRe-run with: npm run seed:demo -- --yes\n"
    );
    process.exit(1);
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("Missing MONGODB_URI (set in .env.local)");
    process.exit(1);
  }

  console.log("Connecting…");
  await mongoose.connect(uri);
  console.log("Dropping database…");
  await mongoose.connection.dropDatabase();

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);

  const teacher = await User.create({
    ...TEACHER,
    passwordHash,
  });
  const student = await User.create({
    ...STUDENT,
    passwordHash,
  });

  const course = await Course.create({
    title: "Full-Stack Foundations (Demo)",
    description:
      "Hands-on module covering HTTP/API basics, fetch, and asynchronous JavaScript—seeded for product demos.",
    instructorId: teacher._id,
    tags: ["web", "javascript", "api", "demo"],
    status: "published",
  });

  const modA = await Module.create({
    courseId: course._id,
    title: "HTTP & REST APIs",
    description: "Resources, verbs, and practical requests.",
    order: 0,
  });
  const modB = await Module.create({
    courseId: course._id,
    title: "Asynchronous JavaScript",
    description: "Promises and async control flow.",
    order: 1,
  });

  const t1 = await Topic.create({
    moduleId: modA._id,
    title: "REST resources & routing",
    content:
      "REST maps CRUD to HTTP verbs. Practice identifying noun resources and safe vs non-safe methods.",
    order: 0,
    estimatedMinutes: 25,
  });
  const t2 = await Topic.create({
    moduleId: modA._id,
    title: "HTTP status codes",
    content:
      "2xx success, 4xx client errors, 5xx server errors. Know when to retry vs fix the request.",
    order: 1,
    estimatedMinutes: 20,
  });
  const t3 = await Topic.create({
    moduleId: modA._id,
    title: "Fetch API & JSON",
    content: "Use fetch(), parse JSON, and handle network failures gracefully.",
    order: 2,
    estimatedMinutes: 30,
  });
  const t4 = await Topic.create({
    moduleId: modB._id,
    title: "Promises & chaining",
    content:
      "Promise states, then/catch, and composing asynchronous workflows.",
    order: 0,
    estimatedMinutes: 35,
  });
  const t5 = await Topic.create({
    moduleId: modB._id,
    title: "async / await",
    content:
      "Linear async code, try/catch with await, and avoiding sequential waterfalls when parallel works.",
    order: 1,
    estimatedMinutes: 35,
  });

  const ass1 = await Assessment.create({
    topicId: t1._id,
    title: "Quiz: REST basics",
    passingScore: 70,
    questions: [
      mcq(
        "Which HTTP verb is usually idempotent for updating an existing resource?",
        ["POST", "PATCH", "GET", "CONNECT"],
        1
      ),
      mcq(
        "In RESTful design, a URL like /users/:id/posts often represents…",
        [
          "A collection nested under a resource",
          "A database table join only",
          "A WebSocket channel",
          "A CDN cache key",
        ],
        0
      ),
    ],
  });
  const ass2 = await Assessment.create({
    topicId: t2._id,
    title: "Quiz: Status codes",
    passingScore: 70,
    questions: [
      mcq(
        "Which status indicates success with no response body?",
        ["200", "201", "204", "302"],
        2
      ),
      mcq(
        "A validation error from the client typically maps to…",
        ["401", "403", "404", "422"],
        3
      ),
    ],
  });
  const ass3 = await Assessment.create({
    topicId: t3._id,
    title: "Quiz: Fetch",
    passingScore: 70,
    questions: [
      mcq(
        "fetch() resolves on HTTP error statuses unless…",
        [
          "You check response.ok",
          "You use XMLHttpRequest",
          "You set credentials: omit",
          "You disable CORS",
        ],
        0
      ),
    ],
  });
  const ass4 = await Assessment.create({
    topicId: t4._id,
    title: "Quiz: Promises",
    passingScore: 70,
    questions: [
      mcq(
        "What happens if you throw inside a .then() without catch?",
        [
          "The promise rejects",
          "It is ignored",
          "The program exits",
          "It becomes synchronous",
        ],
        0
      ),
      mcq(
        "Promise.all fails when…",
        [
          "Any input promise rejects",
          "The first resolves",
          "Arrays are empty",
          "Using TypeScript",
        ],
        0
      ),
    ],
  });
  const ass5 = await Assessment.create({
    topicId: t5._id,
    title: "Quiz: async/await",
    passingScore: 70,
    questions: [
      mcq(
        "await pauses execution of…",
        [
          "The enclosing async function only",
          "The entire JS runtime",
          "Only React components",
          "Only Node worker threads",
        ],
        0
      ),
    ],
  });

  const assignment = await Assignment.create({
    courseId: course._id,
    moduleId: modA._id,
    topicId: t3._id,
    title: "Mini-lab: wrap fetch in error handling",
    description:
      "Submit a short code snippet or link to a gist where you fetch JSON and branch on response.ok with user-visible errors.",
    maxScore: 100,
  });

  const now = Date.now();
  const day = 86400000;

  await UserProgress.create({
    userId: student._id,
    courseId: course._id,
    progress: 60,
    completedTopics: [t1._id, t3._id, t5._id],
    weakAreas: [t2._id, t4._id],
    assessmentAttempts: [
      { assessmentId: ass1._id, score: 78, timestamp: new Date(now - day * 6) },
      { assessmentId: ass2._id, score: 55, timestamp: new Date(now - day * 5) },
      { assessmentId: ass3._id, score: 82, timestamp: new Date(now - day * 4) },
      { assessmentId: ass4._id, score: 58, timestamp: new Date(now - day * 3) },
      { assessmentId: ass5._id, score: 88, timestamp: new Date(now - day * 2) },
      { assessmentId: ass2._id, score: 62, timestamp: new Date(now - day * 1) },
    ],
    assignmentSubmissions: [
      {
        assignmentId: assignment._id,
        status: "pending" as const,
        submittedAt: new Date(now - day),
      },
    ],
    startedAt: new Date(now - day * 10),
    lastActivityAt: new Date(now - day),
  });

  await Doubt.create({
    studentId: student._id,
    teacherId: teacher._id,
    courseId: course._id,
    topicId: t4._id,
    question:
      "When should I prefer Promise.all over sequential awaits if failures are possible?",
    status: "Open",
  });

  await AssignmentSubmission.create({
    assignmentId: assignment._id,
    userId: student._id,
    content:
      "Demo submission (seed): fetch() wrapper that checks response.ok, parses JSON in try/catch, and shows a toast on failure.",
    submissionType: "text",
    status: "pending",
    submittedAt: new Date(now - day),
  });

  console.log("\n✓ Demo seed complete.\n");
  console.log("── Credentials (credentials provider) ──");
  console.log(`Teacher  ${TEACHER.email}`);
  console.log(`Student  ${STUDENT.email}`);
  console.log(`Password ${DEMO_PASSWORD}`);
  console.log("\nSet USE_MOCK_DATA=false (or remove it) in .env.local to use this data instead of UI mocks.");
  console.log("Course:", course.title, `(published)\n`);

  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
