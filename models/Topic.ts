import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITopic extends Document {
  moduleId: mongoose.Types.ObjectId;
  title: string;
  content: string; // Markdown or rich text
  order: number;
  estimatedMinutes?: number;
}

const TopicSchema: Schema = new Schema(
  {
    moduleId: { type: Schema.Types.ObjectId, ref: 'Module', required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    order: { type: Number, required: true, default: 0 },
    estimatedMinutes: { type: Number },
  },
  { timestamps: true }
);

const Topic: Model<ITopic> = mongoose.models.Topic || mongoose.model<ITopic>('Topic', TopicSchema);
export default Topic;
