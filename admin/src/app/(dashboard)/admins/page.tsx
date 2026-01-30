"use client";

import { AdminManagement } from "@/components/admin-management";

export default function AdminsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <AdminManagement />
      </div>
    </div>
  );
}
