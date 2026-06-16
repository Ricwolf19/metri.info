import {
  AdminCardSkeleton,
  AdminHeaderSkeleton,
  AdminStatGridSkeleton,
} from "@/components/admin/AdminSkeleton";

const AnalyticsLoading = () => (
  <>
    <AdminHeaderSkeleton />
    <div className="space-y-4">
      <AdminStatGridSkeleton />
      <div className="grid gap-4 lg:grid-cols-2">
        <AdminCardSkeleton height="h-48" />
        <AdminCardSkeleton height="h-48" />
      </div>
    </div>
  </>
);

export default AnalyticsLoading;
