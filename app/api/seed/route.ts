import { NextResponse } from 'next/server';
import dbConnect from "@/lib/mongodb";
import Course from "@/models/Course";
import Module from "@/models/Module";
import Topic from "@/models/Topic";
import Assessment from "@/models/Assessment";
import Assignment from "@/models/Assignment";
import AssignmentSubmission from "@/models/AssignmentSubmission";
import UserProgress from "@/models/UserProgress";
import Doubt from "@/models/Doubt";
import User from "@/models/User";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await dbConnect();
    
    // Wipe existing data safely based on user request (Clear all courses)
    await Assessment.deleteMany({});
    await Assignment.deleteMany({});
    await AssignmentSubmission.deleteMany({});
    await Topic.deleteMany({});
    await Module.deleteMany({});
    await Course.deleteMany({});
    await UserProgress.deleteMany({});
    await Doubt.deleteMany({});

    // Find or Make a Teacher
    let teacher = await User.findOne({ role: { $in: ["teacher", "admin"] } });
    if (!teacher) {
      teacher = await User.create({ name: "Professor Smith", email: "teacher@geu.ac.in", role: "teacher" });
    }

    // ----------------------------------------
    // COURSE 1: Next.js Full Stack Development
    // ----------------------------------------
    const course1 = await Course.create({
      title: "Next.js 16 Full Stack Masterclass",
      description: "Master React App Router, Server Actions, and MongoDB to build robust production applications.",
      status: "published",
      instructorId: teacher._id,
      tags: ["React", "Next.js", "Web Dev"]
    });

    const mod1 = await Module.create({ courseId: course1._id, title: "Module 1: App Router Basics", description: "Introduction to routing in Next.js", order: 0 });
    const top1 = await Topic.create({ moduleId: mod1._id, title: "Understanding Layouts and Pages", content: "To create a route, add a page.tsx file to a folder...", order: 0 });
    const top2 = await Topic.create({ moduleId: mod1._id, title: "Server and Client Components", content: "Next.js defaults to Server Components. Use 'use client' for interactivity...", order: 1 });
    
    await Assessment.create({
      topicId: top1._id,
      title: "Routing Quiz",
      questions: [
        { text: "What file determines a route in Next.js App Router?", options: ["route.ts", "page.tsx", "index.js", "view.tsx"], correctOptionIndex: 1 },
        { text: "Which wrapper allows components to persist state across routes?", options: ["page.tsx", "layout.tsx", "loading.tsx", "template.tsx"], correctOptionIndex: 1 }
      ],
      passingScore: 70
    });

    await Assignment.create({
      courseId: course1._id,
      moduleId: mod1._id,
      topicId: top2._id,
      title: "Component Tree Design Document",
      description: "Submit a text diagram mapping out when you would use Server vs Client components for a basic blog dashboard structure.",
      maxScore: 100,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
    });

    const mod2 = await Module.create({ courseId: course1._id, title: "Module 2: Data Fetching", description: "Fetching data safely on the server", order: 1 });
    const top3 = await Topic.create({ moduleId: mod2._id, title: "Server Actions Deep Dive", content: "Server actions allow you to execute server code directly from UI components without an API route.", order: 0 });

    // ----------------------------------------
    // COURSE 2: Advanced Cloud Deployments
    // ----------------------------------------
    const course2 = await Course.create({
      title: "Advanced Cloud Deployments via Docker",
      description: "Scale your applications across AWS and Azure securely utilizing stateless containers.",
      status: "published",
      instructorId: teacher._id,
      tags: ["DevOps", "Cloud", "Architecture"]
    });

    const mod3 = await Module.create({ courseId: course2._id, title: "Module 1: Container Orchestration", order: 0 });
    const top4 = await Topic.create({ moduleId: mod3._id, title: "Dockerizing Node.js Services", content: "Writing optimal Dockerfiles for Node apps focusing on layer caching and slim alpine images...", order: 0 });

    return NextResponse.json({ success: true, message: "Database successfully wiped and seeded with fresh mock data!" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
