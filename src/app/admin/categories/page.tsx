import { getAdminCategories } from '@/lib/actions/admin';
import CategoryActions from '@/components/admin/CategoryActions';

export default async function AdminCategoriesPage() {
  const categories = await getAdminCategories();

  const totalCourses = categories.reduce((s: number, c: any) => s + (c.courseCount || 0), 0);

  return (
    <div className="min-h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-5">
        <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
        <p className="text-gray-400 text-sm mt-1">
          {categories.length} categories · {totalCourses} courses
        </p>
      </div>

      <div className="px-8 py-6">
        <CategoryActions categories={categories} />
      </div>
    </div>
  );
}
