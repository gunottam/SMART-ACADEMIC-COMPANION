import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICourse extends Document {
  title: string;
  description: string;
  instructorId: mongoose.Types.ObjectId;
  tags: string[];
  status: 'draft' | 'published' | 'archived';
  thumbnail?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CourseSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    instructorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    tags: [{ type: String }],
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
    thumbnail: { type: String },
  },
  { timestamps: true }
);

const Course: Model<ICourse> = mongoose.models.Course || mongoose.model<ICourse>('Course', CourseSchema);
export default Course;
