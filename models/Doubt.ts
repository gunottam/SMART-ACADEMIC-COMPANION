import mongoose, { Document, Model } from "mongoose";

export interface IDoubt extends Document {
  studentId: mongoose.Types.ObjectId;
  teacherId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  topicId: mongoose.Types.ObjectId;
  question: string;
  answer?: string;
  status: "Open" | "Resolved";
  createdAt: Date;
  updatedAt: Date;
}

const DoubtSchema = new mongoose.Schema<IDoubt>(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    topicId: { type: mongoose.Schema.Types.ObjectId, ref: "Topic", required: true },
    question: { type: String, required: true },
    answer: { type: String, default: null },
    status: { type: String, enum: ["Open", "Resolved"], default: "Open" },
  },
  { timestamps: true }
);

const Doubt: Model<IDoubt> = mongoose.models.Doubt || mongoose.model<IDoubt>("Doubt", DoubtSchema);

export default Doubt;
