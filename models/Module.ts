import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IModule extends Document {
  courseId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  order: number;
}

const ModuleSchema: Schema = new Schema(
  {
    courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    title: { type: String, required: true },
    description: { type: String },
    order: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

const Module: Model<IModule> = mongoose.models.Module || mongoose.model<IModule>('Module', ModuleSchema);
export default Module;
