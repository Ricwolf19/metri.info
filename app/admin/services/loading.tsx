import {
  AdminCardSkeleton,
  AdminHeaderSkeleton,
} from "@/components/admin/AdminSkeleton";

const ServicesLoading = () => (
  <>
    <AdminHeaderSkeleton />
    <div className="grid gap-4 sm:grid-cols-2">
      <AdminCardSkeleton height="h-28" />
      <AdminCardSkeleton height="h-28" />
      <AdminCardSkeleton height="h-28" />
      <AdminCardSkeleton height="h-28" />
    </div>
  </>
);

export default ServicesLoading;
