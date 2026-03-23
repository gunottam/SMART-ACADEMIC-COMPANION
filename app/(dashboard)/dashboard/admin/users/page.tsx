"use client";

import { useState, useEffect } from "react";
import { getAllUsers, updateUserRole } from "@/actions/admin";
import { Shield, BookOpen, GraduationCap, Loader2 } from "lucide-react";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await getAllUsers();
      if (res.success) {
        setUsers(res.users);
      }
      setLoading(false);
    }
    load();
  }, []);

  const handleRoleChange = async (userId: string, newRole: string) => {
    const res = await updateUserRole(userId, newRole);
    if (res.success) {
      setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
    } else {
      alert("Failed to update role: " + res.error);
    }
  };

  const roleIcon = {
    admin: <Shield className="w-4 h-4 text-red-400" />,
    teacher: <BookOpen className="w-4 h-4 text-emerald-400" />,
    student: <GraduationCap className="w-4 h-4 text-cyan-400" />
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-neutral-50 mb-2">User Management</h1>
        <p className="text-neutral-400">Control system access and assign instructor privileges.</p>
      </div>

      <div className="rounded-2xl border border-white/5 bg-[#121212] overflow-hidden">
        {loading ? (
          <div className="p-10 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-neutral-500" /></div>
        ) : (
          <table className="w-full text-left text-sm text-neutral-400">
            <thead className="bg-white/[0.02] text-xs uppercase text-neutral-500 border-b border-white/5">
              <tr>
                <th className="px-6 py-4 font-medium">Name</th>
                <th className="px-6 py-4 font-medium">Email</th>
                <th className="px-6 py-4 font-medium">Current Role</th>
                <th className="px-6 py-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4 font-medium text-neutral-200">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs text-white">
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
                      onChange={(e) => handleRoleChange(user._id, e.target.value)}
                      className="bg-[#1A1A1A] border border-white/10 rounded-md px-3 py-1.5 text-xs text-neutral-200 focus:outline-none focus:border-red-500/50"
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
