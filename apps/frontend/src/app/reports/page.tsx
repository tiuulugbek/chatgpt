'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function ReportsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Hisobotlar</h1>
        <div className="bg-white rounded-lg shadow p-8">
          <p className="text-gray-600">
            Hisobotlar moduli tez orada qo'shiladi...
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}


