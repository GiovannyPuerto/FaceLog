'use client';
// frontend/app/dashboard/layout.tsx

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="dashboard-layout">
      {children}
    </div>
  );
}
