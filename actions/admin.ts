"use server";

import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { revalidatePath } from "next/cache";

async function verifyAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin") {
    throw new Error("Unauthorized access. Master Admin privileges required.");
  }
  return session;
}

export async function getAllUsers() {
  try {
    await verifyAdmin();
    await dbConnect();
    const users = await User.find({}).sort({ createdAt: -1 });
    return { success: true, users: JSON.parse(JSON.stringify(users)) };
  } catch (error: any) {
    return { success: false, error: error.message, users: [] };
  }
}

export async function updateUserRole(userId: string, newRole: string) {
  try {
    const session = await verifyAdmin();
    await dbConnect();
    
    // Prevent accidental self-demotion lockout if it's the only admin
    if ((session.user as any).id === userId && newRole !== "admin") {
       throw new Error("Cannot demote your own active admin session.");
    }
    
    await User.findByIdAndUpdate(userId, { role: newRole });
    revalidatePath("/dashboard/admin/users");
    
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
