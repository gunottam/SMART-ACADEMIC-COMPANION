"use client";

import { useState, useEffect } from "react";
import { getAllUsers, updateUserRole } from "@/actions/admin";
import { Shield, BookOpen, GraduationCap, Loader2 } from "lucide-react";
import { toast } from "@/components/ui/Toaster";
import type { UserRole } from "@/models/User";

type UserRow = {
  _id: string;
  name?: string;
  email: string;
  role: UserRole;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await getAllUsers();
      if (res.success) {
        setUsers((res.users || []) as UserRow[]);
      }
      setLoading(false);
    }
    load();
  }, []);

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    const res = await updateUserRole(userId, newRole);
    if (res.success) {
      setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
      toast.success("Role updated.");
    } else {
      toast.error("Failed to update role: " + res.error);
    }
  };

  const roleIcon = {
    admin: <Shield className="w-4 h-4 text-indigo-600" />,
    teacher: <BookOpen className="w-4 h-4 text-blue-600" />,
    student: <GraduationCap className="w-4 h-4 text-slate-600" />
  };

  return (
    <div className="px-4 sm:px-6 md:px-8 py-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-blue-600 mb-2">User Management</h1>
        <p className="text-slate-600">Control system access and assign instructor privileges.</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-10 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-blue-600" /></div>
        ) : (
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-medium">Name</th>
                <th className="px-6 py-4 font-medium">Email</th>
                <th className="px-6 py-4 font-medium">Current Role</th>
                <th className="px-6 py-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-xs text-blue-700 font-medium">
                        {user.name?.[0]?.toUpperCase()}
                      </div>
                      {user.name}
                    </div>
                  </td>
                  <td className="px-6 py-4">{user.email}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                       {roleIcon[user.role as keyof typeof roleIcon]}
                       <span className="capitalize">{user.role}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <select 
                      value={user.role}
                      onChange={(e) =>
                        handleRoleChange(user._id, e.target.value as UserRole)
                      }
                      className="bg-white border border-slate-200 rounded-md px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500"
                    >
                      <option value="student">Student</option>
                      <option value="teacher">Teacher</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
