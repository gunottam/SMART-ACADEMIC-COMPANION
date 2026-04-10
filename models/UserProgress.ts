import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUserProgress extends Document {
  userId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  progress: number;
  completedTopics: mongoose.Types.ObjectId[];
  assessmentAttempts: { assessmentId: mongoose.Types.ObjectId; score: number; timestamp: Date }[];
  weakAreas: mongoose.Types.ObjectId[];
  assignmentSubmissions: {
    assignmentId: mongoose.Types.ObjectId;
    status: "pending" | "graded" | "returned";
    score?: number;
    submittedAt: Date;
  }[];
  startedAt: Date;
  lastActivityAt: Date;
}

const UserProgressSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    completedTopics: [{ type: Schema.Types.ObjectId, ref: 'Topic' }],
    assessmentAttempts: [{ 
      assessmentId: { type: Schema.Types.ObjectId, ref: 'Assessment' },
      score: Number,
      timestamp: { type: Date, default: Date.now }
    }],
    weakAreas: [{ type: Schema.Types.ObjectId, ref: 'Topic' }],
    assignmentSubmissions: [
      {
        assignmentId: { type: Schema.Types.ObjectId, ref: "Assignment" },
        status: { type: String, enum: ["pending", "graded", "returned"], default: "pending" },
        score: { type: Number },
        submittedAt: { type: Date, default: Date.now }
      }
    ],
    startedAt: { type: Date, default: Date.now },
    lastActivityAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Indexes to speed up progress lookups for a user in a course
UserProgressSchema.index({ userId: 1, courseId: 1 });

const UserProgress: Model<IUserProgress> = mongoose.models.UserProgress || mongoose.model<IUserProgress>('UserProgress', UserProgressSchema);
export default UserProgress;
