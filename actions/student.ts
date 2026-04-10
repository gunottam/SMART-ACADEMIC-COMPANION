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
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import mongoose from "mongoose";

export async function getPublishedCourses() {
  try {
    await dbConnect();
    // Only return courses that have been explicitly published by teachers
    const courses = await Course.find({ status: "published" })
      .populate("instructorId", "name image")
      .sort({ createdAt: -1 });
    
    return { success: true, courses: JSON.parse(JSON.stringify(courses)) };
  } catch (error: any) {
    return { success: false, error: error.message, courses: [] };
  }
}

export async function getCourseWithCurriculum(courseId: string) {
  try {
    await dbConnect();
    
    const course = await Course.findById(courseId).populate("instructorId", "name");
    if (!course) throw new Error("Course not found");

    const modules = await Module.find({ courseId }).sort({ order: 1 });
    
    const moduleIds = modules.map(m => m._id);
    const topics = await Topic.find({ moduleId: { $in: moduleIds } }).sort({ order: 1 });
    
    // Fetch Assessments
    const topicIds = topics.map(t => t._id);
    const assessments = await Assessment.find({ topicId: { $in: topicIds } });
    
    // Fetch Assignments
    const assignments = await Assignment.find({ topicId: { $in: topicIds } });

    const curriculum = modules.map(m => {
      return {
        ...m.toObject(),
        topics: topics.filter(t => t.moduleId.toString() === m._id.toString()).map(t => {
          const tObj = t.toObject();
          const assessment = assessments.find(a => a.topicId.toString() === tObj._id.toString());
          if (assessment) (tObj as any).assessment = assessment.toObject();
          
          const assignment = assignments.find(a => a.topicId?.toString() === tObj._id.toString());
          if (assignment) (tObj as any).assignment = assignment.toObject();

          return tObj;
        })
      };
    });

    return { 
      success: true, 
      course: JSON.parse(JSON.stringify(course)),
      curriculum: JSON.parse(JSON.stringify(curriculum))
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

async function verifyStudent() {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");
  return session;
}

export async function startCourse(courseId: string) {
  try {
    const session = await verifyStudent();
    await dbConnect();

    // Init progress if missing
    let progress = await UserProgress.findOne({ userId: (session.user as any).id, courseId });
    if (!progress) {
      progress = await UserProgress.create({
        userId: (session.user as any).id,
        courseId,
        progress: 0,
        completedTopics: [],
        startedAt: Date.now()
      });
    }

    const courseModules = await Module.find({ courseId });
    const moduleIds = courseModules.map((m: any) => m._id);
    const totalTopicsInCourse = await Topic.countDocuments({ moduleId: { $in: moduleIds } });

    let calculatedProgress = 0;
    if (totalTopicsInCourse > 0) {
      calculatedProgress = Math.min(100, Math.round((progress.completedTopics.length / totalTopicsInCourse) * 100));
    } else {
      calculatedProgress = 100;
    }

    // Force sync the DB document if fundamentally desync'd
    if (progress.progress !== calculatedProgress) {
        progress.progress = calculatedProgress;
        await progress.save();
    }

    console.log(`[STUDENT DASHBOARD] Progress Calculated: ${calculatedProgress}% for UserProgress ObjectId: ${progress._id}`);

    return { success: true, progress: JSON.parse(JSON.stringify(progress)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function markTopicComplete(courseId: string, topicId: string, totalTopicsInCourse: number) {
  try {
    const session = await verifyStudent();
    await dbConnect();

    const progressDoc = await UserProgress.findOne({ userId: (session.user as any).id, courseId });
    if (!progressDoc) throw new Error("Progress document not initialized.");

    // Avoid duplicate completions
    const currentCompleted = progressDoc.completedTopics.map((id: any) => id.toString());
    if (currentCompleted.includes(topicId)) {
      return { success: true, progress: JSON.parse(JSON.stringify(progressDoc)) }; // Already completed
    }

    // Add to completed
    progressDoc.completedTopics.push(new mongoose.Types.ObjectId(topicId));
    
    const courseModules = await Module.find({ courseId });
    const moduleIds = courseModules.map((m: any) => m._id);
    const dynamicTotal = await Topic.countDocuments({ moduleId: { $in: moduleIds } });

    // Recalculate generic percent securely
    if (dynamicTotal > 0) {
      progressDoc.progress = Math.min(100, Math.round((progressDoc.completedTopics.length / dynamicTotal) * 100));
    } else {
      progressDoc.progress = 100;
    }
    
    progressDoc.lastActivityAt = new Date();
    await progressDoc.save();

    return { success: true, progress: JSON.parse(JSON.stringify(progressDoc)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function submitAssessment(courseId: string, topicId: string, assessmentId: string, score: number, totalTopicsInCourse: number) {
  try {
    const session = await verifyStudent();
    await dbConnect();

    const progressDoc = await UserProgress.findOne({ userId: (session.user as any).id, courseId });
    if (!progressDoc) throw new Error("Progress document not initialized.");

    // Record the attempt securely
    progressDoc.assessmentAttempts.push({
      assessmentId: new mongoose.Types.ObjectId(assessmentId),
      score,
      timestamp: new Date()
    });

    // Mark the underlying topic complete if they passed
    if (score >= 70) {
      const currentCompleted = progressDoc.completedTopics.map((id: any) => id.toString());
      if (!currentCompleted.includes(topicId)) {
        progressDoc.completedTopics.push(new mongoose.Types.ObjectId(topicId));
        
        const courseModules = await Module.find({ courseId });
        const moduleIds = courseModules.map((m: any) => m._id);
        const dynamicTotal = await Topic.countDocuments({ moduleId: { $in: moduleIds } });

        if (dynamicTotal > 0) {
          progressDoc.progress = Math.min(100, Math.round((progressDoc.completedTopics.length / dynamicTotal) * 100));
        } else {
          progressDoc.progress = 100;
        }
      }
    }

    // Weakness Detection Algorithm (Rule-Based)
    // If score < 40 -> Critical, < 70 -> Warning. 
    // We store the Topic ObjectId in weakAreas if score < 70.
    const tId = new mongoose.Types.ObjectId(topicId);
    if (score < 70) {
      if (!progressDoc.weakAreas.some((w: any) => w.toString() === topicId)) {
        progressDoc.weakAreas.push(tId);
      }
    } else {
      // If they passed this time, remove it from weak areas
      progressDoc.weakAreas = progressDoc.weakAreas.filter((w: any) => w.toString() !== topicId);
    }

    progressDoc.lastActivityAt = new Date();
    await progressDoc.save();

    return { success: true, progress: JSON.parse(JSON.stringify(progressDoc)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getStudentAnalytics() {
  try {
    const session = await verifyStudent();
    await dbConnect();
    
    const userId = (session.user as any).id;
    const progressDocs = await UserProgress.find({ userId });
    
    const totalCoursesEnrolled = progressDocs.length;
    let topicsCompleted = 0;
    let totalAssessmentsTaken = 0;
    let aggregateScore = 0;
    
    progressDocs.forEach(doc => {
      topicsCompleted += doc.completedTopics.length;
      doc.assessmentAttempts.forEach((attempt: any) => {
        totalAssessmentsTaken++;
        aggregateScore += attempt.score;
      });
    });
    
    const averageScore = totalAssessmentsTaken > 0 ? Math.round(aggregateScore / totalAssessmentsTaken) : 0;
    
    const weakAreasSet = new Set<string>();
    progressDocs.forEach(doc => {
      doc.weakAreas.forEach((w: any) => weakAreasSet.add(w.toString()));
    });

    const recentAssessments = progressDocs.flatMap(doc => doc.assessmentAttempts);
    
    return {
      success: true,
      stats: {
        totalCoursesEnrolled,
        topicsCompleted,
        averageScore,
        weakAreas: Array.from(weakAreasSet),
        recentAssessments: JSON.parse(JSON.stringify(recentAssessments))
      }
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function submitAssignment(courseId: string, assignmentId: string, content: string, submissionType: "text" | "file") {
  try {
    const session = await verifyStudent();
    await dbConnect();
    
    const userIdObj = new mongoose.Types.ObjectId(session.user.id);
    const assignmentIdObj = new mongoose.Types.ObjectId(assignmentId);

    const submission = await AssignmentSubmission.findOneAndUpdate(
      { assignmentId: assignmentIdObj, userId: userIdObj },
      { content, submissionType, status: "pending", submittedAt: new Date() },
      { new: true, upsert: true }
    );

    const progressDoc = await UserProgress.findOne({ userId: userIdObj, courseId });
    if (progressDoc) {
      const existing = progressDoc.assignmentSubmissions.find((s: any) => s.assignmentId.toString() === assignmentId);
      if (!existing) {
        progressDoc.assignmentSubmissions.push({
          assignmentId: assignmentIdObj,
          status: "pending",
          submittedAt: new Date()
        });
      } else {
        existing.status = "pending";
        existing.submittedAt = new Date();
      }
      progressDoc.lastActivityAt = new Date();
      await progressDoc.save();
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
