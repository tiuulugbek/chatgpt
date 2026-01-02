'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import { DealStage } from '@prisma/client';
import Link from 'next/link';

interface DealDetailsPageProps {
  params: {
    id: string;
  };
}

const dealStageLabels: Record<DealStage, string> = {
  LEAD: 'Yangi',
  CONTACTED: 'Aloqa',
  PROPOSAL: 'Taklif',
  NEGOTIATION: 'Muzokara',
  CLOSED_WON: 'Yakunlangan',
  CLOSED_LOST: 'Yutqazilgan',
};

export default function DealDetailsPage({ params }: DealDetailsPageProps) {
  const { id } = params;
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, isLoading: authLoading } = useAuth();
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const { data: deal, isLoading: dealLoading } = useQuery({
    queryKey: ['deal', id],
    queryFn: async () => {
      const response = await api.get(`/deals/${id}`);
      return response.data;
    },
    enabled: !!user && !!id,
  });

  const updateDealMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.patch(`/deals/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      setSuccess('Bitim muvaffaqiyatli yangilandi!');
      setError('');
      queryClient.invalidateQueries({ queryKey: ['deal', id] });
      queryClient.invalidateQueries({ queryKey: ['deals'] });
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Bitimni yangilashda xatolik yuz berdi.');
      setSuccess('');
    },
  });

  const deleteDealMutation = useMutation({
    mutationFn: async () => {
      await api.delete(`/deals/${id}`);
    },
    onSuccess: () => {
      alert('Bitim muvaffaqiyatli o\'chirildi!');
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      router.push('/deals');
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Bitimni o\'chirishda xatolik yuz berdi.');
    },
  });

  const handleStageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateDealMutation.mutate({ stage: e.target.value as DealStage });
  };

  const handleDeleteDeal = () => {
    if (confirm('Haqiqatan ham bu bitimni o\'chirmoqchimisiz?')) {
      deleteDealMutation.mutate();
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('uz-UZ', {
      style: 'currency',
      currency: currency === 'UZS' ? 'UZS' : currency,
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (authLoading || dealLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Yuklanmoqda...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (!user || !deal) {
    return (
      <DashboardLayout>
        <div className="text-center py-8 text-gray-500">
          Bitim topilmadi yoki sizda huquq yo'q.
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
            <Link
              href="/deals"
              className="text-primary hover:text-opacity-80 text-sm mb-2 inline-block"
            >
              ← Bitimlar ro'yxatiga qaytish
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Bitim: {deal.title}</h1>
          </div>
          <div className="flex space-x-3">
            {(user.role === 'SUPER_ADMIN' || user.role === 'BRANCH_MANAGER') && (
              <button
                onClick={handleDeleteDeal}
                disabled={deleteDealMutation.isPending}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 disabled:opacity-50"
              >
                {deleteDealMutation.isPending ? 'O\'chirilmoqda...' : 'Bitimni o\'chirish'}
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Deal Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Asosiy Ma'lumotlar</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Bitim nomi</p>
                  <p className="text-lg font-medium text-gray-900">{deal.title}</p>
                </div>
                {deal.notes && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Izohlar</p>
                    <p className="text-gray-700 whitespace-pre-wrap">{deal.notes}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Bosqich</p>
                    <select
                      value={deal.stage}
                      onChange={handleStageChange}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                      disabled={updateDealMutation.isPending}
                    >
                      {Object.values(DealStage).map((stage) => (
                        <option key={stage} value={stage}>
                          {dealStageLabels[stage]}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Ehtimollik</p>
                    <p className="text-gray-900">{deal.probability || 0}%</p>
                  </div>
                  {deal.amount && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Summa</p>
                      <p className="text-xl font-bold text-gray-900">
                        {formatCurrency(deal.amount, deal.currency)}
                      </p>
                    </div>
                  )}
                  {deal.expectedCloseDate && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Kutilayotgan yakunlanish sanasi</p>
                      <p className="text-gray-900">
                        {new Date(deal.expectedCloseDate).toLocaleDateString('uz-UZ')}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Filial</p>
                    <p className="text-gray-900">{deal.branch?.name || 'Noma\'lum'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Mas'ul</p>
                    <p className="text-gray-900">
                      {deal.assignee?.firstName} {deal.assignee?.lastName || 'Noma\'lum'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Yaratuvchi</p>
                    <p className="text-gray-900">
                      {deal.creator?.firstName} {deal.creator?.lastName || 'Noma\'lum'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Yaratilgan sana</p>
                    <p className="text-gray-900">
                      {new Date(deal.createdAt).toLocaleString('uz-UZ')}
                    </p>
                  </div>
                  {deal.closedAt && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Yakunlangan sana</p>
                      <p className="text-gray-900">
                        {new Date(deal.closedAt).toLocaleString('uz-UZ')}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Related Lead */}
            {deal.lead && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Tegishli Lid</h2>
                <Link
                  href={`/leads/${deal.lead.id}`}
                  className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                >
                  <h3 className="font-medium text-gray-900">{deal.lead.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {deal.lead.status} • {deal.lead.source}
                  </p>
                </Link>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Contact Information */}
            {deal.contact && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Mijoz Ma'lumotlari</h2>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">F.I.Sh.</p>
                    <p className="text-gray-900 font-medium">{deal.contact.fullName}</p>
                  </div>
                  {deal.contact.phone && (
                    <div>
                      <p className="text-sm text-gray-500">Telefon</p>
                      <a
                        href={`tel:${deal.contact.phone}`}
                        className="text-primary hover:text-opacity-80"
                      >
                        {deal.contact.phone}
                      </a>
                    </div>
                  )}
                  {deal.contact.email && (
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <a
                        href={`mailto:${deal.contact.email}`}
                        className="text-primary hover:text-opacity-80"
                      >
                        {deal.contact.email}
                      </a>
                    </div>
                  )}
                  <Link
                    href={`/contacts/${deal.contact.id}`}
                    className="block mt-4 text-center text-primary hover:text-opacity-80 text-sm font-medium"
                  >
                    Mijoz profiliga o'tish →
                  </Link>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Tezkor Amallar</h2>
              <div className="space-y-2">
                {deal.contact && (
                  <Link
                    href={`/leads/new?contactId=${deal.contact.id}`}
                    className="block w-full text-center bg-primary text-white px-4 py-2 rounded-lg hover:bg-opacity-90 text-sm font-medium"
                  >
                    + Yangi Lid
                  </Link>
                )}
                {deal.contact && (
                  <Link
                    href={`/deals/new?contactId=${deal.contact.id}`}
                    className="block w-full text-center bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-opacity-90 text-sm font-medium"
                  >
                    + Yangi Bitim
                  </Link>
                )}
                {deal.contact && (
                  <Link
                    href={`/messages?contactId=${deal.contact.id}`}
                    className="block w-full text-center bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-opacity-90 text-sm font-medium"
                  >
                    Xabarlarni ko'rish
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
