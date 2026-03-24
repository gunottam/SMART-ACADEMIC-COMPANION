"use server";

import dbConnect from "@/lib/mongodb";
import Course from "@/models/Course";
import Module from "@/models/Module";
import Topic from "@/models/Topic";
import User from "@/models/User";
import UserProgress from "@/models/UserProgress";
import Assignment from "@/models/Assignment";
import Assessment from "@/models/Assessment";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { revalidatePath } from "next/cache";

export async function syncMockData() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || ((session.user as any).role !== "admin" && (session.user as any).role !== "teacher")) {
      throw new Error("Unauthorized access");
    }

    await dbConnect();
    const teacherId = (session.user as any).id;

    // 1. Find or create a Mock Student
    let mockStudent = await User.findOne({ email: "student@example.com", role: "student" });
    if (!mockStudent) {
      mockStudent = await User.create({
        name: "Mock Student",
        email: "student@example.com",
        role: "student",
      });
    }

    // 2. Generate 'Data Structures' Course
    // Clean up old ones just to be safe so we don't spam the DB
    await Course.deleteMany({ title: "Data Structures", instructorId: teacherId });
    
    const course = await Course.create({
      title: "Data Structures",
      description: "An intensive course on arrays, linked lists, trees, and graphs.",
      tags: ["Computer Science", "Programming"],
      instructorId: teacherId,
      status: "published",
    });

    // 3. Generate 1 Module
    const mod = await Module.create({
      courseId: course._id,
      title: "Introduction to Data Structures",
      description: "Learn the fundamentals of structuring data correctly.",
      order: 0,
    });

    // 4. Generate 1 Topic
    const topic = await Topic.create({
      moduleId: mod._id,
      title: "Arrays and Linked Lists",
      content: "Arrays are contiguous memory locations, whereas Linked Lists are nodes scattered with pointers.",
      order: 0,
    });

    // 5. Enroll the Mock Student (UserProgress)
    await UserProgress.deleteMany({ userId: mockStudent._id, courseId: course._id });
    await UserProgress.create({
      userId: mockStudent._id,
      courseId: course._id,
      progress: 0,
      completedTopics: [],
      // Ensure the course will load securely natively on the student dash
    });

    revalidatePath("/dashboard/teacher");
    revalidatePath("/dashboard/student/courses");
    return { success: true, message: "Data Structures mock course seeded and student enrolled!" };
  } catch (error: any) {
    console.error("Sync error:", error);
    return { success: false, error: error.message };
  }
}

export async function seedWebArchitecture() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || ((session.user as any).role !== "admin" && (session.user as any).role !== "teacher")) {
      throw new Error("Unauthorized access");
    }

    await dbConnect();
    const teacherId = (session.user as any).id;

    // Clean up
    await Course.deleteMany({ title: "Advanced Web Architecture", instructorId: teacherId });
    
    const course = await Course.create({
      title: "Advanced Web Architecture",
      description: "Deep dive into system design, SSR, scaling, and modern microservices.",
      tags: ["SSR", "Microservices", "System Design"],
      instructorId: teacherId,
      status: "published",
    });

    const mod = await Module.create({
      courseId: course._id,
      title: "System Design Fundamentals",
      description: "Explore advanced scaling capabilities.",
      order: 0,
    });

    const topic = await Topic.create({
      moduleId: mod._id,
      title: "Load Balancing at Scale",
      content: "A load balancer acts as the traffic cop sitting in front of your servers and routing client requests across all servers fulfilling those requests. This ensures no single server bears too much demand.",
      order: 0,
    });

    await Assignment.create({
      courseId: course._id,
      moduleId: mod._id,
      topicId: topic._id,
      title: "Build a scalable load balancer concept",
      description: "Write a high-level overview or provide a system diagram detailing how you would balance 1 million requests per second across a global microservices architecture.",
      maxScore: 100,
    });

    await Assessment.create({
      topicId: topic._id,
      title: "Web Architecture Quiz",
      passingScore: 70,
      questions: [
        {
          text: "Which of the following best describes SSR?",
          options: ["Server-Side Rendering", "Static Site Resolution", "System Scaling Requirement"],
          correctOptionIndex: 0
        },
        {
          text: "What is the primary benefit of microservices?",
          options: ["Monolithic codebase", "Independent deployment & scaling", "Shared database memory"],
          correctOptionIndex: 1
        },
        {
          text: "How does a load balancer prevent downtime?",
          options: ["By storing all data in one place", "By routing traffic away from failed instances", "By increasing CPU clock speed"],
          correctOptionIndex: 1
        }
      ]
    });

    revalidatePath("/dashboard/teacher");
    revalidatePath("/dashboard/student/courses");
    return { success: true, message: "Web Architecture mock course seeded!" };
  } catch (error: any) {
    console.error("Sync error:", error);
    return { success: false, error: error.message };
  }
}
