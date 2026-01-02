'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';

const stageOptions = [
  { value: 'LEAD', label: 'Lid' },
  { value: 'CONTACTED', label: 'Aloqa qilindi' },
  { value: 'PROPOSAL', label: 'Taklif yuborildi' },
  { value: 'NEGOTIATION', label: 'Muzokara' },
  { value: 'CLOSED_WON', label: 'Yutdi' },
  { value: 'CLOSED_LOST', label: 'Yutqazdi' },
];

const stageColors: Record<string, string> = {
  LEAD: 'bg-blue-100 text-blue-800',
  CONTACTED: 'bg-purple-100 text-purple-800',
  PROPOSAL: 'bg-yellow-100 text-yellow-800',
  NEGOTIATION: 'bg-indigo-100 text-indigo-800',
  CLOSED_WON: 'bg-green-100 text-green-800',
  CLOSED_LOST: 'bg-red-100 text-red-800',
};

export default function DealDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const dealId = params.id as string;

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<any>({});

  // Deal ma'lumotlarini olish
  const { data: deal, isLoading } = useQuery({
    queryKey: ['deal', dealId],
    queryFn: async () => {
      const response = await api.get(`/deals/${dealId}`);
      return response.data;
    },
    enabled: !!dealId,
  });

  // Deal yangilash
  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.patch(`/deals/${dealId}`, data);
      return response.data;
    },
    onSuccess: () => {
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ['deal', dealId] });
      queryClient.invalidateQueries({ queryKey: ['deals'] });
    },
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Yuklanmoqda...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (!deal) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Bitim topilmadi</h2>
          <button
            onClick={() => router.push('/deals')}
            className="text-primary hover:text-opacity-80"
          >
            Bitimlar ro'yxatiga qaytish
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const handleSaveEdit = () => {
    updateMutation.mutate(editData);
  };

  const handleStageChange = (newStage: string) => {
    if (confirm('Bosqichni o\'zgartirishni tasdiqlaysizmi?')) {
      updateMutation.mutate({ stage: newStage });
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <button
              onClick={() => router.back()}
              className="text-gray-600 hover:text-gray-900 mb-4"
            >
              ← Orqaga
            </button>
            <h1 className="text-3xl font-bold text-gray-900">{deal.title}</h1>
            <div className="flex items-center gap-4 mt-2">
              <span
                className={`px-3 py-1 inline-flex text-sm font-semibold rounded-full ${
                  stageColors[deal.stage] || 'bg-gray-100 text-gray-800'
                }`}
              >
                {stageOptions.find((s) => s.value === deal.stage)?.label || deal.stage}
              </span>
              {deal.amount && (
                <span className="text-lg font-semibold text-primary">
                  {parseFloat(deal.amount).toLocaleString('uz-UZ')} {deal.currency || 'UZS'}
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={deal.stage}
              onChange={(e) => handleStageChange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {stageOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Asosiy ma'lumotlar */}
          <div className="lg:col-span-2 space-y-6">
            {/* Izohlar */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Izohlar</h2>
                {!isEditing && (
                  <button
                    onClick={() => {
                      setIsEditing(true);
                      setEditData({ notes: deal.notes || '' });
                    }}
                    className="text-sm text-primary hover:text-opacity-80"
                  >
                    Tahrirlash
                  </button>
                )}
              </div>
              {isEditing ? (
                <div className="space-y-4">
                  <textarea
                    value={editData.notes || ''}
                    onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                    rows={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveEdit}
                      className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90"
                    >
                      Saqlash
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      Bekor qilish
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-700 whitespace-pre-wrap">
                  {deal.notes || 'Izohlar kiritilmagan'}
                </p>
              )}
            </div>

            {/* Lid ma'lumotlari */}
            {deal.lead && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Lid ma'lumotlari</h2>
                <div className="space-y-2">
                  <div>
                    <div className="text-sm text-gray-500">Lid nomi</div>
                    <div className="font-medium text-gray-900">{deal.lead.title}</div>
                  </div>
                  <Link
                    href={`/leads/${deal.lead.id}`}
                    className="text-sm text-primary hover:text-opacity-80"
                  >
                    Lidni ko'rish →
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Yon panel */}
          <div className="space-y-6">
            {/* Mijoz ma'lumotlari */}
            {deal.contact && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Mijoz</h2>
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-gray-500">Ism</div>
                    <div className="font-medium text-gray-900">{deal.contact.fullName}</div>
                  </div>
                  {deal.contact.phone && (
                    <div>
                      <div className="text-sm text-gray-500">Telefon</div>
                      <div className="font-medium text-gray-900">{deal.contact.phone}</div>
                    </div>
                  )}
                  {deal.contact.email && (
                    <div>
                      <div className="text-sm text-gray-500">Email</div>
                      <div className="font-medium text-gray-900">{deal.contact.email}</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Ma'lumotlar */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Ma'lumotlar</h2>
              <div className="space-y-3 text-sm">
                <div>
                  <div className="text-gray-500">Mas'ul</div>
                  <div className="font-medium text-gray-900">
                    {deal.assignee
                      ? `${deal.assignee.firstName} ${deal.assignee.lastName}`
                      : 'Tayinlanmagan'}
                  </div>
                </div>
                <div>
                  <div className="text-gray-500">Filial</div>
                  <div className="font-medium text-gray-900">
                    {deal.branch?.name || 'Filial yo\'q'}
                  </div>
                </div>
                {deal.probability !== null && (
                  <div>
                    <div className="text-gray-500">Ehtimollik</div>
                    <div className="font-medium text-gray-900">{deal.probability}%</div>
                  </div>
                )}
                {deal.expectedCloseDate && (
                  <div>
                    <div className="text-gray-500">Yopilish sanasi</div>
                    <div className="font-medium text-gray-900">
                      {new Date(deal.expectedCloseDate).toLocaleDateString('uz-UZ')}
                    </div>
                  </div>
                )}
                {deal.closedAt && (
                  <div>
                    <div className="text-gray-500">Yopilgan sana</div>
                    <div className="font-medium text-gray-900">
                      {new Date(deal.closedAt).toLocaleDateString('uz-UZ')}
                    </div>
                  </div>
                )}
                <div>
                  <div className="text-gray-500">Yaratilgan</div>
                  <div className="font-medium text-gray-900">
                    {new Date(deal.createdAt).toLocaleString('uz-UZ')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

