import { getStudentsForTeacher } from "@/actions/teacher";
import { Users } from "lucide-react";
import { TeacherRoster } from "@/components/dashboard/TeacherRoster";

export default async function TeacherStudentsPage() {
  const { success, roster, error } = await getStudentsForTeacher();

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-blue-600 mb-2 flex items-center gap-3">
          <Users className="w-8 h-8 text-blue-600" />
          Tenant Enrollment Roster
        </h1>
        <p className="text-slate-600">Deep isolated analytics pipeline tracking your specific students&apos; progress.</p>
      </div>

      {success ? (
        <TeacherRoster initialData={roster || []} />
      ) : (
        <div className="p-4 bg-red-50 border border-red-100 text-red-700 rounded-lg">
          Failed to load student tracking pipeline: {error}
        </div>
      )}
    </div>
  );
}
