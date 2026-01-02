'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

// Deal Stage o'zbekcha nomlari va ranglari
const stageConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  LEAD: { label: 'Lid', color: 'text-blue-800', bgColor: 'bg-blue-100' },
  CONTACTED: { label: 'Aloqa qilindi', color: 'text-purple-800', bgColor: 'bg-purple-100' },
  PROPOSAL: { label: 'Taklif yuborildi', color: 'text-yellow-800', bgColor: 'bg-yellow-100' },
  NEGOTIATION: { label: 'Muzokara', color: 'text-indigo-800', bgColor: 'bg-indigo-100' },
  CLOSED_WON: { label: 'Yutdi', color: 'text-green-800', bgColor: 'bg-green-100' },
  CLOSED_LOST: { label: 'Yutqazdi', color: 'text-red-800', bgColor: 'bg-red-100' },
};

// Pipeline bosqichlari tartibi
const stageOrder = ['LEAD', 'CONTACTED', 'PROPOSAL', 'NEGOTIATION', 'CLOSED_WON', 'CLOSED_LOST'];

export default function DealsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [draggedDeal, setDraggedDeal] = useState<string | null>(null);

  // Pipeline ma'lumotlarini olish
  const { data: pipelineData, isLoading } = useQuery({
    queryKey: ['deals', 'pipeline'],
    queryFn: async () => {
      const response = await api.get('/deals/pipeline');
      return response.data;
    },
    enabled: !!user,
  });

  // Stage o'zgartirish
  const updateStageMutation = useMutation({
    mutationFn: async ({ dealId, stage }: { dealId: string; stage: string }) => {
      const response = await api.patch(`/deals/${dealId}`, { stage });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
    },
  });

  // Drag and drop handlers
  const handleDragStart = (dealId: string) => {
    setDraggedDeal(dealId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (newStage: string) => {
    if (draggedDeal) {
      updateStageMutation.mutate({ dealId: draggedDeal, stage: newStage });
      setDraggedDeal(null);
    }
  };

  // Backend'dan kelgan pipeline object'ni ishlatish
  const dealsByStage = pipelineData || {};

  // Barcha deals'ni bitta array'ga yig'ish (statistikalar uchun)
  const allDeals = Object.values(dealsByStage).flat() as any[];

  // Har bir stage uchun summani hisoblash
  const getStageTotal = (stage: string) => {
    const deals = dealsByStage[stage] || [];
    return deals.reduce((sum: number, deal: any) => {
      return sum + (parseFloat(deal.amount) || 0);
    }, 0);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Yuklanmoqda...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Bitimlar</h1>
            <p className="text-gray-600 mt-1">Savdo voronkasi (Pipeline)</p>
          </div>
          <div className="flex gap-4">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('kanban')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                  viewMode === 'kanban'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Kanban
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                  viewMode === 'table'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Jadval
              </button>
            </div>
            <Link
              href="/deals/new"
              className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-opacity-90 transition font-medium"
            >
              + Yangi Bitim
            </Link>
          </div>
        </div>

        {/* Kanban View */}
        {viewMode === 'kanban' && (
          <div className="overflow-x-auto pb-4">
            <div className="flex gap-4 min-w-max">
              {stageOrder.map((stage) => {
                const config = stageConfig[stage];
                const deals = dealsByStage[stage] || [];
                const total = getStageTotal(stage);

                return (
                  <div
                    key={stage}
                    className="flex-shrink-0 w-80 bg-gray-50 rounded-lg p-4"
                    onDragOver={handleDragOver}
                    onDrop={() => handleDrop(stage)}
                  >
                    {/* Stage Header */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">{config.label}</h3>
                        <span className="text-sm text-gray-500 bg-white px-2 py-1 rounded-full">
                          {deals.length}
                        </span>
                      </div>
                      {total > 0 && (
                        <div className="text-sm font-medium text-gray-700">
                          {total.toLocaleString('uz-UZ')} {deals[0]?.currency || 'UZS'}
                        </div>
                      )}
                    </div>

                    {/* Deals List */}
                    <div className="space-y-3 min-h-[200px]">
                      {deals.map((deal: any) => (
                        <div
                          key={deal.id}
                          draggable
                          onDragStart={() => handleDragStart(deal.id)}
                          className="bg-white rounded-lg shadow-sm p-4 cursor-move hover:shadow-md transition"
                        >
                          <Link href={`/deals/${deal.id}`}>
                            <div className="space-y-2">
                              <h4 className="font-medium text-gray-900 text-sm">
                                {deal.title}
                              </h4>
                              {deal.contact && (
                                <div className="text-xs text-gray-500">
                                  {deal.contact.fullName}
                                </div>
                              )}
                              {deal.amount && (
                                <div className="text-sm font-semibold text-primary">
                                  {parseFloat(deal.amount).toLocaleString('uz-UZ')}{' '}
                                  {deal.currency || 'UZS'}
                                </div>
                              )}
                              {deal.assignee && (
                                <div className="text-xs text-gray-400">
                                  {deal.assignee.firstName} {deal.assignee.lastName}
                                </div>
                              )}
                              {deal.expectedCloseDate && (
                                <div className="text-xs text-gray-400">
                                  📅{' '}
                                  {new Date(deal.expectedCloseDate).toLocaleDateString('uz-UZ')}
                                </div>
                              )}
                            </div>
                          </Link>
                        </div>
                      ))}
                      {deals.length === 0 && (
                        <div className="text-center text-gray-400 text-sm py-8">
                          Bitimlar yo'q
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Table View */}
        {viewMode === 'table' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sarlavha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mijoz
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bosqich
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Summa
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mas'ul
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Yopilish sanasi
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amallar
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {allDeals?.map((deal: any) => {
                    const config = stageConfig[deal.stage] || stageConfig.LEAD;
                    return (
                      <tr key={deal.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {deal.title}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {deal.contact?.fullName || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${config.bgColor} ${config.color}`}
                          >
                            {config.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {deal.amount
                            ? `${parseFloat(deal.amount).toLocaleString('uz-UZ')} ${deal.currency || 'UZS'}`
                            : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {deal.assignee
                            ? `${deal.assignee.firstName} ${deal.assignee.lastName}`
                            : 'Tayinlanmagan'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {deal.expectedCloseDate
                            ? new Date(deal.expectedCloseDate).toLocaleDateString('uz-UZ')
                            : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link
                            href={`/deals/${deal.id}`}
                            className="text-primary hover:text-opacity-80"
                          >
                            Ko'rish
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {allDeals.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-500">Hozircha bitimlar mavjud emas</div>
                <Link
                  href="/deals/new"
                  className="inline-block mt-4 text-primary hover:text-opacity-80"
                >
                  + Yangi Bitim Yaratish
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Pipeline Statistikasi */}
        {allDeals.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-500 mb-1">Jami Bitimlar</div>
              <div className="text-3xl font-bold text-gray-900">
                {allDeals.length}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-500 mb-1">Jami Summa</div>
              <div className="text-3xl font-bold text-primary">
                {allDeals
                  .reduce((sum: number, deal: any) => sum + (parseFloat(deal.amount) || 0), 0)
                  .toLocaleString('uz-UZ')}{' '}
                UZS
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-500 mb-1">Yutgan Bitimlar</div>
              <div className="text-3xl font-bold text-green-600">
                {(dealsByStage.CLOSED_WON || []).length}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
