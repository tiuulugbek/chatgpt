'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AdminGuard } from '@/components/guards/AdminGuard';

export default function AdminBranchesPage() {
  const queryClient = useQueryClient();

  const { data: branches, isLoading } = useQuery({
    queryKey: ['branches'],
    queryFn: async () => {
      const response = await api.get('/branches');
      return response.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/branches/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branches'] });
    },
  });

  return (
    <AdminGuard>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Filiallar</h1>
            <button className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-opacity-90">
              + Yangi Filial
            </button>
          </div>

          {isLoading ? (
            <div className="text-center py-8">Yuklanmoqda...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {branches?.map((branch: any) => (
                <div
                  key={branch.id}
                  className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {branch.name}
                    </h3>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        branch.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {branch.isActive ? 'Faol' : 'Nofaol'}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    {branch.code && (
                      <div>
                        <span className="font-medium">Kod:</span> {branch.code}
                      </div>
                    )}
                    {branch.region && (
                      <div>
                        <span className="font-medium">Hudud:</span> {branch.region}
                      </div>
                    )}
                    {branch.phone && (
                      <div>
                        <span className="font-medium">Telefon:</span> {branch.phone}
                      </div>
                    )}
                    {branch.email && (
                      <div>
                        <span className="font-medium">Email:</span> {branch.email}
                      </div>
                    )}
                  </div>
                  <div className="mt-4 flex space-x-2">
                    <button className="flex-1 bg-primary text-white px-4 py-2 rounded-lg hover:bg-opacity-90 text-sm">
                      Tahrirlash
                    </button>
                    <button
                      onClick={() => deleteMutation.mutate(branch.id)}
                      className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm"
                    >
                      O'chirish
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DashboardLayout>
    </AdminGuard>
  );
}

