import { getStudentsForTeacher } from "@/actions/teacher";
import { Users } from "lucide-react";
import { TeacherRoster } from "@/components/dashboard/TeacherRoster";

export default async function TeacherStudentsPage() {
  const { success, roster, error } = await getStudentsForTeacher();

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-neutral-50 mb-2 flex items-center gap-3">
          <Users className="w-8 h-8 text-emerald-400" />
          Tenant Enrollment Roster
        </h1>
        <p className="text-neutral-400">Deep isolated analytics pipeline tracking your specific students' progress.</p>
      </div>

      {success ? (
        <TeacherRoster initialData={roster || []} />
      ) : (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg">
          Failed to load student tracking pipeline: {error}
        </div>
      )}
    </div>
  );
}
