import mongoose, { Schema, Document, Model } from "mongoose";

export type UserRole = "student" | "teacher" | "admin";

export interface IUser extends Document {
  name?: string;
  email: string;
  image?: string;
  role: UserRole;
  passwordHash?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    image: { type: String },
    role: {
      type: String,
      enum: ["student", "teacher", "admin"],
      default: "student",
    },
    passwordHash: { type: String, select: false },
  },
  { timestamps: true }
);

const User: Model<IUser> =
  (mongoose.models.User as Model<IUser>) ||
  mongoose.model<IUser>("User", UserSchema);

export default User;
