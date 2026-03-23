import { StatCard } from "@/components/dashboard/StatCard";
import { Users, Shield, Database, Activity } from "lucide-react";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export default async function AdminDashboardPage() {
  await dbConnect();

  const totalUsers = await User.countDocuments();
  const activeAdmins = await User.countDocuments({ role: "admin" });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-neutral-50 mb-2">Master Console</h1>
        <p className="text-neutral-400">System operation, telemetry, and user role management.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Users"
          value={totalUsers.toString()}
          icon={<Users className="w-5 h-5 text-red-400" />}
        />
        <StatCard
          title="Active Admins"
          value={activeAdmins.toString()}
          icon={<Shield className="w-5 h-5 text-red-400" />}
        />
        <StatCard
          title="Database Size"
          value="Healthy"
          icon={<Database className="w-5 h-5 text-red-400" />}
        />
        <StatCard
          title="System Health"
          value="Optimal"
          icon={<Activity className="w-5 h-5 text-red-400" />}
        />
      </div>
    </div>
  );
}
