'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';

const statusOptions = [
  { value: 'NEW', label: 'Yangi' },
  { value: 'CONTACTED', label: 'Aloqa qilindi' },
  { value: 'QUALIFIED', label: 'Sifatli' },
];

const sourceOptions = [
  { value: 'WEBSITE', label: 'Veb-sayt' },
  { value: 'INSTAGRAM', label: 'Instagram' },
  { value: 'FACEBOOK', label: 'Facebook' },
  { value: 'TELEGRAM', label: 'Telegram' },
  { value: 'YOUTUBE', label: 'YouTube' },
  { value: 'PHONE', label: 'Telefon' },
  { value: 'EMAIL', label: 'Email' },
  { value: 'GOOGLE_MAPS', label: 'Google Maps' },
  { value: 'YANDEX_MAPS', label: 'Yandex Maps' },
  { value: 'OTHER', label: 'Boshqa' },
];

export default function NewLeadPage() {
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'NEW',
    source: 'WEBSITE',
    priority: '',
    // Contact ma'lumotlari
    contactFullName: '',
    contactPhone: '',
    contactEmail: '',
    branchId: user?.branchId || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Filiallar ro'yxatini olish
  const { data: branches } = useQuery({
    queryKey: ['branches'],
    queryFn: async () => {
      const response = await api.get('/branches');
      return response.data;
    },
    enabled: !!user && user.role === 'SUPER_ADMIN',
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/leads', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      router.push('/leads');
    },
    onError: (error: any) => {
      const errorData = error.response?.data;
      if (errorData?.message) {
        setErrors({ general: errorData.message });
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validatsiya
    if (!formData.title.trim()) {
      setErrors({ title: 'Sarlavha majburiy' });
      return;
    }

    if (!formData.contactFullName.trim() || !formData.contactPhone.trim()) {
      setErrors({ contact: 'Mijoz ismi va telefon raqami majburiy' });
      return;
    }

    const payload = {
      title: formData.title,
      description: formData.description || undefined,
      status: formData.status,
      source: formData.source,
      priority: formData.priority || undefined,
      branchId: formData.branchId || user?.branchId,
      contact: {
        fullName: formData.contactFullName,
        phone: formData.contactPhone,
        email: formData.contactEmail || undefined,
      },
    };

    createMutation.mutate(payload);
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="text-gray-600 hover:text-gray-900 mb-4"
          >
            ← Orqaga
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Yangi Lid Yaratish</h1>
          <p className="text-gray-600 mt-1">Yangi murojaat qo'shing</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
          {errors.general && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {errors.general}
            </div>
          )}

          {/* Asosiy ma'lumotlar */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Asosiy ma'lumotlar</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sarlavha <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                    errors.title ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Masalan: Yangi mijoz murojaati"
                />
                {errors.title && (
                  <p className="text-red-500 text-sm mt-1">{errors.title}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tavsif
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Lid haqida qo'shimcha ma'lumot..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Manba
                  </label>
                  <select
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {sourceOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {user?.role === 'SUPER_ADMIN' && branches && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Filial
                  </label>
                  <select
                    value={formData.branchId}
                    onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Filial tanlang</option>
                    {branches.map((branch: any) => (
                      <option key={branch.id} value={branch.id}>
                        {branch.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Mijoz ma'lumotlari */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Mijoz ma'lumotlari</h2>
            <div className="space-y-4">
              {errors.contact && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {errors.contact}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  F.I.Sh. <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.contactFullName}
                  onChange={(e) =>
                    setFormData({ ...formData, contactFullName: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Ism Familiya"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefon <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.contactPhone}
                    onChange={(e) =>
                      setFormData({ ...formData, contactPhone: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="+998 90 123 45 67"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) =>
                      setFormData({ ...formData, contactEmail: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="email@example.com"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Tugmalar */}
          <div className="flex justify-end gap-4 pt-4 border-t">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createMutation.isPending ? 'Saqlanmoqda...' : 'Saqlash'}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}

