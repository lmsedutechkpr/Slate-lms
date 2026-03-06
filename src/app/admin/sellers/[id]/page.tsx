import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getAdminSellerDetail } from '@/lib/actions/admin';
import SellerApprovalActions from '@/components/admin/SellerApprovalActions';
import {
  ArrowLeft,
  ShoppingBag,
  Users,
  Globe,
  Twitter,
  Linkedin,
  Youtube,
  CheckCircle,
  Clock,
  XCircle,
  Star,
  IndianRupee,
} from 'lucide-react';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  pending_review: { label: 'Pending Review', color: 'text-amber-700', bg: 'bg-amber-100' },
  published: { label: 'Published', color: 'text-emerald-700', bg: 'bg-emerald-100' },
  draft: { label: 'Draft', color: 'text-gray-600', bg: 'bg-gray-100' },
  rejected: { label: 'Rejected', color: 'text-red-700', bg: 'bg-red-100' },
  archived: { label: 'Archived', color: 'text-slate-600', bg: 'bg-slate-100' },
};

const APPROVAL_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; icon: any }
> = {
  approved: { label: 'Approved', color: 'text-emerald-700', bg: 'bg-emerald-100', icon: CheckCircle },
  pending: { label: 'Pending Approval', color: 'text-amber-700', bg: 'bg-amber-100', icon: Clock },
  rejected: { label: 'Rejected', color: 'text-red-700', bg: 'bg-red-100', icon: XCircle },
};

export default async function AdminSellerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getAdminSellerDetail(id);

  if (!data) notFound();

  const { profile, products, totalSales, totalRevenue } = data;
  const approvalConf =
    APPROVAL_CONFIG[profile.approval_status as string] || {
      label: 'Unknown',
      color: 'text-gray-700',
      bg: 'bg-gray-100',
      icon: Clock,
    };
  const ApprovalIcon = approvalConf.icon;

  return (
    <div className="min-h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-5">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
          <Link href="/admin/dashboard" className="hover:text-gray-900 transition-colors">Admin</Link>
          <span>›</span>
          <Link href="/admin/sellers" className="hover:text-gray-900 transition-colors">Sellers</Link>
          <span>›</span>
          <span className="text-gray-900 font-medium">{profile.full_name}</span>
        </div>
        <Link
          href="/admin/sellers"
          className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft size={13} /> Back to sellers
        </Link>
      </div>

      <div className="px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main */}
          <div className="lg:col-span-2 space-y-5">
            {/* Profile Card */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
              <div className="flex items-start gap-5">
                <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-2xl font-bold flex-shrink-0">
                  {profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.full_name}
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  ) : (
                    profile.full_name?.[0]?.toUpperCase() || '?'
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h1 className="text-xl font-bold text-gray-900">{profile.full_name}</h1>
                      <p className="text-gray-500 text-sm">{profile.email}</p>
                      {profile.headline && (
                        <p className="text-gray-600 text-sm mt-1 italic">{profile.headline}</p>
                      )}
                    </div>
                    <span
                      className={`flex-shrink-0 flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${approvalConf.bg} ${approvalConf.color}`}
                    >
                      <ApprovalIcon size={11} />
                      {approvalConf.label}
                    </span>
                  </div>

                  {/* Social Links */}
                  <div className="flex items-center gap-3 mt-3">
                    {profile.website && (
                      <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-700">
                        <Globe size={16} />
                      </a>
                    )}
                    {profile.twitter && (
                      <a href={profile.twitter} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-500">
                        <Twitter size={16} />
                      </a>
                    )}
                    {profile.linkedin && (
                      <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-700">
                        <Linkedin size={16} />
                      </a>
                    )}
                    {profile.youtube && (
                      <a href={profile.youtube} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-red-600">
                        <Youtube size={16} />
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {profile.bio && (
                <p className="text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-5">
                  {profile.bio}
                </p>
              )}

              {profile.expertise && profile.expertise.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Expertise
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {profile.expertise.map((e: string) => (
                      <span
                        key={e}
                        className="text-xs bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full"
                      >
                        {e}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="text-xs text-gray-400 border-t border-gray-100 pt-4">
                Joined {new Date(profile.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              {[
                {
                  label: 'Total Products',
                  value: products.length,
                  icon: ShoppingBag,
                  color: 'bg-blue-100 text-blue-600',
                },
                {
                  label: 'Total Sales',
                  value: totalSales,
                  icon: Users,
                  color: 'bg-purple-100 text-purple-600',
                },
                {
                  label: 'Revenue',
                  value: `₹${totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`,
                  icon: IndianRupee,
                  color: 'bg-amber-100 text-amber-600',
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="bg-white rounded-2xl border border-gray-200 p-5 text-center"
                >
                  <div className={`inline-flex p-2.5 rounded-xl ${stat.color} mb-3`}>
                    <stat.icon size={18} />
                  </div>
                  <div className="text-xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Products */}
            {products.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <h2 className="font-semibold text-gray-900">
                    Products ({products.length})
                  </h2>
                </div>
                <div className="divide-y divide-gray-50">
                  {products.map((product: any) => {
                    const conf = STATUS_CONFIG[product.status] || STATUS_CONFIG.draft;
                    return (
                      <Link
                        key={product.id}
                        href={`/admin/products/${product.id}`}
                        className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="w-14 h-14 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                          {product.thumbnail_url ? (
                            <img
                              src={product.thumbnail_url}
                              alt={product.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ShoppingBag size={14} className="text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {product.title}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${conf.bg} ${conf.color}`}
                            >
                              {conf.label}
                            </span>
                            <span className="text-xs text-gray-500 capitalize">
                              {product.file_type || 'digital'}
                            </span>
                          </div>
                        </div>
                        <span className="text-sm font-medium text-gray-700 flex-shrink-0">
                          {product.price === 0
                            ? 'Free'
                            : `₹${Number(product.price).toLocaleString('en-IN')}`}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4 lg:sticky lg:top-6">
              <h2 className="font-semibold text-gray-900">Account Actions</h2>
              <SellerApprovalActions
                sellerId={profile.id}
                status={profile.approval_status}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
