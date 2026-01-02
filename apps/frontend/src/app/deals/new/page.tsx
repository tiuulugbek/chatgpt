'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import { DealStage } from '@prisma/client';

interface DealFormData {
  title: string;
  amount?: number;
  currency: string;
  stage: DealStage;
  probability?: number;
  expectedCloseDate?: string;
  notes?: string;
  contactId?: string;
  leadId?: string;
  assigneeId?: string;
  branchId?: string;
}

export default function NewDealPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const [formData, setFormData] = useState<DealFormData>({
    title: '',
    amount: undefined,
    currency: 'UZS',
    stage: DealStage.LEAD,
    probability: 0,
    expectedCloseDate: '',
    notes: '',
    contactId: searchParams.get('contactId') || '',
    leadId: '',
    assigneeId: user?.id || '',
    branchId: user?.branchId || '',
  });
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  // Contacts list
  const { data: contacts } = useQuery({
    queryKey: ['contacts'],
    queryFn: async () => {
      const response = await api.get('/contacts');
      return response.data;
    },
    enabled: !!user,
  });

  // Leads list
  const { data: leads } = useQuery({
    queryKey: ['leads'],
    queryFn: async () => {
      const response = await api.get('/leads');
      return response.data;
    },
    enabled: !!user,
  });

  // Users list (for assignee)
  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await api.get('/users');
      return response.data;
    },
    enabled: !!user && (user.role === 'SUPER_ADMIN' || user.role === 'BRANCH_MANAGER'),
  });

  // Branches list
  const { data: branches } = useQuery({
    queryKey: ['branches'],
    queryFn: async () => {
      const response = await api.get('/branches');
      return response.data;
    },
    enabled: !!user && user.role === 'SUPER_ADMIN',
  });

  // Create deal mutation
  const createDealMutation = useMutation({
    mutationFn: async (data: DealFormData) => {
      const response = await api.post('/deals', data);
      return response.data;
    },
    onSuccess: () => {
      setSuccess('Bitim muvaffaqiyatli yaratildi!');
      setError('');
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setTimeout(() => {
        router.push('/deals');
      }, 1500);
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Bitim yaratishda xatolik yuz berdi.');
      setSuccess('');
    },
  });

  useEffect(() => {
    // URL'dan contactId olish
    const contactId = searchParams.get('contactId');
    if (contactId) {
      setFormData((prev) => ({ ...prev, contactId }));
    }
  }, [searchParams]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Clean data - bo'sh qiymatlarni olib tashlash
    const cleanData: any = { ...formData };
    if (!cleanData.amount) delete cleanData.amount;
    if (!cleanData.probability) delete cleanData.probability;
    if (!cleanData.expectedCloseDate) delete cleanData.expectedCloseDate;
    if (!cleanData.notes) delete cleanData.notes;
    if (!cleanData.contactId) delete cleanData.contactId;
    if (!cleanData.leadId) delete cleanData.leadId;
    if (!cleanData.assigneeId) delete cleanData.assigneeId;
    if (!cleanData.branchId) delete cleanData.branchId;

    createDealMutation.mutate(cleanData);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Yangi Bitim Yaratish</h1>
          <p className="text-gray-600 mt-1">Yangi bitim qo'shing</p>
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

        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Bitim nomi *
              </label>
              <input
                id="title"
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Masalan: Eshitish apparati sotuvi"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                  Summa
                </label>
                <input
                  id="amount"
                  type="number"
                  value={formData.amount || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      amount: e.target.value ? parseFloat(e.target.value) : undefined,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="1000000"
                />
              </div>
              <div>
                <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-2">
                  Valyuta
                </label>
                <select
                  id="currency"
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="UZS">UZS (So'm)</option>
                  <option value="USD">USD (Dollar)</option>
                  <option value="EUR">EUR (Yevro)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="stage" className="block text-sm font-medium text-gray-700 mb-2">
                  Bosqich *
                </label>
                <select
                  id="stage"
                  required
                  value={formData.stage}
                  onChange={(e) => setFormData({ ...formData, stage: e.target.value as DealStage })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {Object.values(DealStage).map((stage) => (
                    <option key={stage} value={stage}>
                      {stage.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="probability" className="block text-sm font-medium text-gray-700 mb-2">
                  Ehtimollik (%)
                </label>
                <input
                  id="probability"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.probability || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      probability: e.target.value ? parseInt(e.target.value) : undefined,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="50"
                />
              </div>
            </div>

            <div>
              <label htmlFor="expectedCloseDate" className="block text-sm font-medium text-gray-700 mb-2">
                Kutilayotgan yakunlanish sanasi
              </label>
              <input
                id="expectedCloseDate"
                type="date"
                value={formData.expectedCloseDate}
                onChange={(e) => setFormData({ ...formData, expectedCloseDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="contactId" className="block text-sm font-medium text-gray-700 mb-2">
                  Mijoz
                </label>
                <select
                  id="contactId"
                  value={formData.contactId}
                  onChange={(e) => setFormData({ ...formData, contactId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Mijoz tanlang</option>
                  {contacts?.map((contact: any) => (
                    <option key={contact.id} value={contact.id}>
                      {contact.fullName} {contact.phone ? `(${contact.phone})` : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="leadId" className="block text-sm font-medium text-gray-700 mb-2">
                  Lid
                </label>
                <select
                  id="leadId"
                  value={formData.leadId}
                  onChange={(e) => setFormData({ ...formData, leadId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Lid tanlang</option>
                  {leads?.map((lead: any) => (
                    <option key={lead.id} value={lead.id}>
                      {lead.title} ({lead.status})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {user?.role === 'SUPER_ADMIN' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="branchId" className="block text-sm font-medium text-gray-700 mb-2">
                    Filial
                  </label>
                  <select
                    id="branchId"
                    value={formData.branchId}
                    onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Filial tanlang</option>
                    {branches?.map((branch: any) => (
                      <option key={branch.id} value={branch.id}>
                        {branch.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="assigneeId" className="block text-sm font-medium text-gray-700 mb-2">
                    Mas'ul
                  </label>
                  <select
                    id="assigneeId"
                    value={formData.assigneeId}
                    onChange={(e) => setFormData({ ...formData, assigneeId: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Mas'ul tanlang</option>
                    {users?.map((u: any) => (
                      <option key={u.id} value={u.id}>
                        {u.firstName} {u.lastName} ({u.role})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {(user?.role === 'BRANCH_MANAGER' || user?.role === 'BRANCH_STAFF') && (
              <div>
                <label htmlFor="assigneeId" className="block text-sm font-medium text-gray-700 mb-2">
                  Mas'ul
                </label>
                <select
                  id="assigneeId"
                  value={formData.assigneeId}
                  onChange={(e) => setFormData({ ...formData, assigneeId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Mas'ul tanlang</option>
                  {users?.map((u: any) => (
                    <option key={u.id} value={u.id}>
                      {u.firstName} {u.lastName} ({u.role})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                Izohlar
              </label>
              <textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Bitim haqida qo'shimcha ma'lumotlar..."
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Bekor qilish
              </button>
              <button
                type="submit"
                disabled={createDealMutation.isPending}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createDealMutation.isPending ? 'Yaratilmoqda...' : 'Bitim Yaratish'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
