"use server";

import dbConnect from "@/lib/mongodb";
import Course from "@/models/Course";
import Module from "@/models/Module";
import Topic from "@/models/Topic";
import Assessment from "@/models/Assessment";
import Assignment from "@/models/Assignment";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { revalidatePath } from "next/cache";

async function verifyTeacher() {
  const session = await getServerSession(authOptions);
  
  // Grant access to both teachers and system admins
  if (!session || ((session.user as any).role !== "admin" && (session.user as any).role !== "teacher")) {
    throw new Error("Unauthorized access. Instructor privileges required.");
  }
  
  return session;
}

export async function createCourse(data: { 
  title: string; 
  description: string; 
  tags: string[]; 
  status: string;
  modules: { title: string; description: string; topics: { title: string; content: string; assessment?: any }[] }[];
}) {
  try {
    const session = await verifyTeacher();
    await dbConnect();

    const newCourse = await Course.create({
      title: data.title,
      description: data.description,
      tags: data.tags,
      instructorId: (session.user as any).id,
      status: data.status,
    });
    
    // Create Modules and Topics deeply
    if (data.modules && data.modules.length > 0) {
      for (let i = 0; i < data.modules.length; i++) {
        const modData = data.modules[i];
        
        // Skip entirely empty modules
        if (!modData.title?.trim() && modData.topics.length === 0) continue;

        const newModule = await Module.create({
          courseId: newCourse._id,
          title: modData.title?.trim() || "Untitled Module",
          description: modData.description || "",
          order: i
        });

        if (modData.topics && modData.topics.length > 0) {
          // Filter out topics that act as accidental empty UI ghost states
          const validTopics = modData.topics.filter(t => t.title?.trim() || t.content?.trim());
          
          const topicsToInsert = validTopics.map((t, tIndex) => ({
            moduleId: newModule._id,
            title: t.title?.trim() || "Untitled Topic",
            content: t.content?.trim() || "No content provided yet.",
            order: tIndex
          }));
          
          if (topicsToInsert.length > 0) {
            const insertedTopics = await Topic.insertMany(topicsToInsert);
            
            // Handle Assessments bound to valid topics
            const assessmentsToInsert: any[] = [];
            validTopics.forEach((t, i) => {
              if (t.assessment && t.assessment.questions && t.assessment.questions.length > 0) {
                // Filter out ghost questions
                const validQs = t.assessment.questions.filter((q: any) => q.text?.trim() && q.options[0]?.trim());
                if (validQs.length > 0) {
                  assessmentsToInsert.push({
                    topicId: insertedTopics[i]._id,
                    title: t.assessment.title?.trim() || "Topic Quiz",
                    questions: validQs.map((q: any) => ({
                      text: q.text?.trim() || "Untitled Question",
                      options: q.options.map((o: string) => o?.trim() || "Empty Option"),
                      correctOptionIndex: q.correctOptionIndex || 0
                    })),
                    passingScore: 70
                  });
                }
              }
            });
            
            if (assessmentsToInsert.length > 0) {
              await Assessment.insertMany(assessmentsToInsert);
            }

            // Handle Assignments bound to valid topics
            const assignmentsToInsert: any[] = [];
            validTopics.forEach((t: any, i: number) => {
              if (t.assignment && t.assignment.title?.trim()) {
                assignmentsToInsert.push({
                  courseId: newCourse._id,
                  moduleId: newModule._id,
                  topicId: insertedTopics[i]._id,
                  title: t.assignment.title.trim(),
                  description: t.assignment.description?.trim() || "No instructions provided.",
                  maxScore: t.assignment.maxScore || 100,
                  dueDate: t.assignment.dueDate || null,
                });
              }
            });

            if (assignmentsToInsert.length > 0) {
              await Assignment.insertMany(assignmentsToInsert);
            }
          }
        }
      }
    }

    revalidatePath("/dashboard/teacher/courses");
    return { success: true, courseId: newCourse._id.toString() };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getTeacherCourses() {
  try {
    const session = await verifyTeacher();
    await dbConnect();

    // Fetch courses owned by this instructor
    const courses = await Course.find({ instructorId: (session.user as any).id }).sort({ createdAt: -1 });
    
    // Convert Mongoose documents to plain JS objects to successfully pass the Server/Client boundary
    return { success: true, courses: JSON.parse(JSON.stringify(courses)) };
  } catch (error: any) {
    return { success: false, error: error.message, courses: [] };
  }
}

export async function getCourseForEdit(courseId: string) {
  try {
    const session = await verifyTeacher();
    await dbConnect();

    const course = await Course.findById(courseId);
    if (!course || course.instructorId.toString() !== (session.user as any).id) {
      throw new Error("Unauthorized");
    }

    const modules = await Module.find({ courseId }).sort({ order: 1 });
    const moduleIds = modules.map(m => m._id);
    const topics = await Topic.find({ moduleId: { $in: moduleIds } }).sort({ order: 1 });
    const topicIds = topics.map(t => t._id);
    
    const assessments = await Assessment.find({ topicId: { $in: topicIds } });
    const assignments = await Assignment.find({ topicId: { $in: topicIds } });

    const curriculum = modules.map(m => {
      return {
        ...m.toObject(),
        id: m._id.toString(), // critical for UI key mapping
        topics: topics.filter(t => t.moduleId.toString() === m._id.toString()).map(t => {
          const tObj: any = t.toObject();
          tObj.id = tObj._id.toString();
          
          const assessment = assessments.find(a => a.topicId.toString() === tObj._id.toString());
          if (assessment) {
            tObj.assessment = assessment.toObject();
            tObj.assessment.id = tObj.assessment._id.toString();
          }
          
          const assignment = assignments.find(a => a.topicId?.toString() === tObj._id.toString());
          if (assignment) {
            tObj.assignment = assignment.toObject();
            tObj.assignment.id = tObj.assignment._id.toString();
          }
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

export async function updateCourseWithCurriculum(courseId: string, data: {
  title: string; description: string; tags: string[]; status: string; modules: any[];
}) {
  try {
    const session = await verifyTeacher();
    await dbConnect();

    const course = await Course.findById(courseId);
    if (!course || course.instructorId.toString() !== (session.user as any).id) {
      throw new Error("Unauthorized or course not found.");
    }

    // Standard Course update
    course.title = data.title;
    course.description = data.description;
    course.tags = data.tags;
    course.status = data.status as any;
    await course.save();

    // The robust upsert + delete tree loop
    const incomingModuleIds = data.modules.filter(m => m._id).map(m => m._id.toString());
    const existingModules = await Module.find({ courseId });

    for (const exMod of existingModules) {
      if (!incomingModuleIds.includes(exMod._id.toString())) {
        await Module.findByIdAndDelete(exMod._id);
        const topicsToDelete = await Topic.find({ moduleId: exMod._id });
        const topicIds = topicsToDelete.map(t => t._id);
        await Topic.deleteMany({ moduleId: exMod._id });
        await Assessment.deleteMany({ topicId: { $in: topicIds } });
        await Assignment.deleteMany({ topicId: { $in: topicIds } });
      }
    }

    for (let i = 0; i < data.modules.length; i++) {
      const modData = data.modules[i];
      if (!modData.title?.trim() && modData.topics.length === 0) continue;

      let modDoc;
      if (modData._id && modData._id.length === 24) {
        modDoc = await Module.findByIdAndUpdate(modData._id, {
          title: modData.title.trim() || "Untitled Module",
          description: modData.description || "",
          order: i
        }, { new: true });
      } else {
        modDoc = await Module.create({ courseId, title: modData.title.trim() || "Untitled Module", description: modData.description || "", order: i });
      }

      if (!modDoc) continue;

      const incomingTopicIds = modData.topics.filter((t:any) => t._id && t._id.length === 24).map((t:any) => t._id.toString());
      const existingTopics = await Topic.find({ moduleId: modDoc._id });
      
      for (const exTop of existingTopics) {
        if (!incomingTopicIds.includes(exTop._id.toString())) {
          await Topic.findByIdAndDelete(exTop._id);
          await Assessment.deleteMany({ topicId: exTop._id });
          await Assignment.deleteMany({ topicId: exTop._id });
        }
      }

      for (let tIndex = 0; tIndex < modData.topics.length; tIndex++) {
        const topData = modData.topics[tIndex];
        if (!topData.title?.trim() && !topData.content?.trim()) continue;

        let topDoc;
        if (topData._id && topData._id.length === 24) {
          topDoc = await Topic.findByIdAndUpdate(topData._id, {
            title: topData.title.trim() || "Untitled Topic",
            content: topData.content.trim() || "No content provided.",
            order: tIndex
          }, { new: true });
        } else {
          topDoc = await Topic.create({ moduleId: modDoc._id, title: topData.title.trim() || "Untitled Topic", content: topData.content.trim() || "No content provided.", order: tIndex });
        }

        if (!topDoc) continue;

        // Secure upsert Assessment
        if (topData.assessment && topData.assessment.questions && topData.assessment.questions.length > 0) {
          const validQs = topData.assessment.questions.filter((q: any) => q.text?.trim() && q.options[0]?.trim());
          if (validQs.length > 0) {
            const mappedQs = validQs.map((q: any) => ({
              text: q.text.trim(),
              options: q.options.map((o: string) => o?.trim() || "Empty Option"),
              correctOptionIndex: q.correctOptionIndex || 0
            }));

            if (topData.assessment._id && topData.assessment._id.length === 24) {
              await Assessment.findByIdAndUpdate(topData.assessment._id, { title: topData.assessment.title?.trim() || "Topic Quiz", questions: mappedQs });
            } else {
              await Assessment.deleteMany({ topicId: topDoc._id });
              await Assessment.create({ topicId: topDoc._id, title: topData.assessment.title?.trim() || "Topic Quiz", questions: mappedQs, passingScore: 70 });
            }
          }
        } else {
          await Assessment.deleteMany({ topicId: topDoc._id });
        }

        // Secure upsert Assignment
        if (topData.assignment && topData.assignment.title?.trim()) {
           if (topData.assignment._id && topData.assignment._id.length === 24) {
             await Assignment.findByIdAndUpdate(topData.assignment._id, {
               title: topData.assignment.title.trim(),
               description: topData.assignment.description?.trim() || "No instructions provided.",
               maxScore: topData.assignment.maxScore || 100
             });
           } else {
             await Assignment.deleteMany({ topicId: topDoc._id });
             await Assignment.create({ courseId, moduleId: modDoc._id, topicId: topDoc._id, title: topData.assignment.title.trim(), description: topData.assignment.description?.trim() || "No instructions provided.", maxScore: topData.assignment.maxScore || 100 });
           }
        } else {
           await Assignment.deleteMany({ topicId: topDoc._id });
        }
      }
    }

    revalidatePath("/dashboard/teacher/courses");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

