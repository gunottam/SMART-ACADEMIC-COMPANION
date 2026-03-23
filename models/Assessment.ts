import mongoose, { Schema, Document, Model } from 'mongoose';

interface IQuestion {
  text: string;
  options: string[];
  correctOptionIndex: number;
  explanation?: string;
}

export interface IAssessment extends Document {
  topicId: mongoose.Types.ObjectId;
  title: string;
  questions: IQuestion[];
  passingScore: number;
}

const QuestionSchema = new Schema<IQuestion>({
  text: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctOptionIndex: { type: Number, required: true },
  explanation: { type: String },
});

const AssessmentSchema: Schema = new Schema(
  {
    topicId: { type: Schema.Types.ObjectId, ref: 'Topic', required: true },
    title: { type: String, required: true },
    questions: [QuestionSchema],
    passingScore: { type: Number, required: true, default: 70 }, // percentage
  },
  { timestamps: true }
);

const Assessment: Model<IAssessment> = mongoose.models.Assessment || mongoose.model<IAssessment>('Assessment', AssessmentSchema);
export default Assessment;
