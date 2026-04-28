"use server";

import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function updateProfile(data: { name?: string }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false as const, error: "Unauthorized" };
    }

    const name = (data.name || "").trim();
    if (!name) {
      return { success: false as const, error: "Name cannot be empty." };
    }
    if (name.length > 80) {
      return { success: false as const, error: "Name is too long." };
    }

    await dbConnect();
    await User.findByIdAndUpdate(session.user.id, { name });

    return { success: true as const };
  } catch (error) {
    return {
      success: false as const,
      error:
        error instanceof Error ? error.message : "Failed to update profile",
    };
  }
}
