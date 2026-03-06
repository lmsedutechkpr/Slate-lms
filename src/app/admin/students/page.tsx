import { getAdminStudents } from '@/lib/actions/admin';
import { Users, Search } from 'lucide-react';

export default async function AdminStudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const q = params.q || '';

  const allStudents = await getAdminStudents();
  const students = q
    ? allStudents.filter(
        (s: any) =>
          s.full_name?.toLowerCase().includes(q.toLowerCase()) ||
          s.email?.toLowerCase().includes(q.toLowerCase())
      )
    : allStudents;

  const totalEnrollments = students.reduce(
    (sum: number, s: any) => sum + (s.enrollmentCount || 0),
    0
  );

  return (
    <div className="min-h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-5">
        <h1 className="text-2xl font-bold text-gray-900">Students</h1>
        <p className="text-gray-400 text-sm mt-1">
          {students.length} registered · {totalEnrollments} total enrollments
        </p>
      </div>

      <div className="px-8 py-6 space-y-4">
        {/* Search */}
        <div className="relative max-w-md">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <form>
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="Search by name or email..."
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-400"
            />
          </form>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          {students.length === 0 ? (
            <div className="py-16 text-center">
              <Users size={32} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">No students found</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-6 py-4">
                    Student
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-6 py-4 hidden md:table-cell">
                    Email
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-6 py-4 hidden lg:table-cell">
                    Enrollments
                  </th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-6 py-4 hidden xl:table-cell">
                    Joined
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {students.map((student: any) => (
                  <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 text-blue-700 text-xs font-bold">
                          {student.avatar_url ? (
                            <img
                              src={student.avatar_url}
                              alt={student.full_name}
                              className="w-9 h-9 rounded-full object-cover"
                            />
                          ) : (
                            student.full_name?.[0]?.toUpperCase() || '?'
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {student.full_name || 'Unknown'}
                          </p>
                          <p className="text-xs text-gray-500 md:hidden truncate">
                            {student.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <span className="text-sm text-gray-600">{student.email}</span>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-sm font-semibold ${
                            student.enrollmentCount > 0 ? 'text-gray-900' : 'text-gray-400'
                          }`}
                        >
                          {student.enrollmentCount}
                        </span>
                        {student.enrollmentCount > 0 && (
                          <span className="text-xs text-gray-400">
                            course{student.enrollmentCount !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden xl:table-cell">
                      <span className="text-xs text-gray-500">
                        {new Date(student.created_at).toLocaleDateString('en-IN')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
