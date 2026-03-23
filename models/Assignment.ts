import mongoose, { Schema, Document } from "mongoose";

export interface IAssignment extends Document {
  courseId: mongoose.Types.ObjectId;
  moduleId: mongoose.Types.ObjectId;
  topicId?: mongoose.Types.ObjectId; // Optional: can be bound to a specific topic or just a module
  title: string;
  description: string;
  dueDate?: Date;
  maxScore: number;
  createdAt: Date;
  updatedAt: Date;
}

const AssignmentSchema: Schema = new Schema(
  {
    courseId: { type: Schema.Types.ObjectId, ref: "Course", required: true },
    moduleId: { type: Schema.Types.ObjectId, ref: "Module", required: true },
    topicId: { type: Schema.Types.ObjectId, ref: "Topic", required: false },
    title: { type: String, required: true },
    description: { type: String, required: true },
    dueDate: { type: Date, required: false },
    maxScore: { type: Number, default: 100 },
  },
  { timestamps: true }
);

export default mongoose.models.Assignment || mongoose.model<IAssignment>("Assignment", AssignmentSchema);
