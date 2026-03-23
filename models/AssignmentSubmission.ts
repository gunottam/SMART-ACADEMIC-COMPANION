import mongoose, { Schema, Document } from "mongoose";

export interface IAssignmentSubmission extends Document {
  assignmentId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  content: string; // The text submission or a URL to the uploaded file
  submissionType: "text" | "file";
  status: "pending" | "graded" | "returned";
  score?: number;
  teacherFeedback?: string;
  submittedAt: Date;
  updatedAt: Date;
}

const AssignmentSubmissionSchema: Schema = new Schema(
  {
    assignmentId: { type: Schema.Types.ObjectId, ref: "Assignment", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
    submissionType: { type: String, enum: ["text", "file"], default: "text" },
    status: { type: String, enum: ["pending", "graded", "returned"], default: "pending" },
    score: { type: Number, required: false },
    teacherFeedback: { type: String, required: false },
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models.AssignmentSubmission || mongoose.model<IAssignmentSubmission>("AssignmentSubmission", AssignmentSubmissionSchema);
