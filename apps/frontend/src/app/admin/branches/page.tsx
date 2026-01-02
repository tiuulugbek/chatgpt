'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AdminGuard } from '@/components/guards/AdminGuard';
import { useAuth } from '@/hooks/useAuth';

interface BranchFormData {
  name: string;
  code?: string;
  address?: string;
  phone?: string;
  email?: string;
  region?: string;
  isActive?: boolean;
}

export default function AdminBranchesPage() {
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<any | null>(null);
  const [formData, setFormData] = useState<BranchFormData>({
    name: '',
    code: '',
    address: '',
    phone: '',
    email: '',
    region: '',
    isActive: true,
  });
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  // Filiallarni olish
  const { data: branches, isLoading } = useQuery({
    queryKey: ['branches'],
    queryFn: async () => {
      const response = await api.get('/branches');
      return response.data;
    },
  });

  // Yangi filial yaratish
  const createMutation = useMutation({
    mutationFn: async (data: BranchFormData) => {
      const response = await api.post('/branches', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branches'] });
      setIsModalOpen(false);
      resetForm();
      setSuccess('Filial muvaffaqiyatli yaratildi!');
      setError('');
      setTimeout(() => setSuccess(''), 3000);
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Filial yaratishda xatolik yuz berdi.');
      setSuccess('');
    },
  });

  // Filialni yangilash
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<BranchFormData> }) => {
      const response = await api.patch(`/branches/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branches'] });
      setIsModalOpen(false);
      resetForm();
      setSuccess('Filial muvaffaqiyatli yangilandi!');
      setError('');
      setTimeout(() => setSuccess(''), 3000);
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Filialni yangilashda xatolik yuz berdi.');
      setSuccess('');
    },
  });

  // Filialni o'chirish
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/branches/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branches'] });
      setSuccess('Filial muvaffaqiyatli o\'chirildi!');
      setError('');
      setTimeout(() => setSuccess(''), 3000);
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Filialni o\'chirishda xatolik yuz berdi.');
      setSuccess('');
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      address: '',
      phone: '',
      email: '',
      region: '',
      isActive: true,
    });
    setEditingBranch(null);
    setError('');
  };

  const handleOpenModal = (branch?: any) => {
    if (branch) {
      setEditingBranch(branch);
      setFormData({
        name: branch.name,
        code: branch.code || '',
        address: branch.address || '',
        phone: branch.phone || '',
        email: branch.email || '',
        region: branch.region || '',
        isActive: branch.isActive,
      });
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (editingBranch) {
      updateMutation.mutate({ id: editingBranch.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (branchId: string) => {
    if (confirm('Haqiqatan ham bu filialni o\'chirmoqchimisiz?')) {
      deleteMutation.mutate(branchId);
    }
  };

  const filteredBranches = branches?.filter((branch: any) =>
    branch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    branch.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    branch.region?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminGuard>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Filiallar Boshqaruvi</h1>
              <p className="text-gray-600 mt-1">Barcha filiallarni boshqaring</p>
            </div>
            {currentUser?.role === 'SUPER_ADMIN' && (
              <button
                onClick={() => handleOpenModal()}
                className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-opacity-90 font-medium shadow-lg"
              >
                + Yangi Filial
              </button>
            )}
          </div>

          {/* Xabarlar */}
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

          {/* Qidiruv */}
          <div className="bg-white rounded-lg shadow p-4">
            <input
              type="text"
              placeholder="Nomi, kodi yoki hudud bo'yicha qidirish..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Filiallar ro'yxati */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="text-gray-500">Yuklanmoqda...</div>
            </div>
          ) : filteredBranches?.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <div className="text-6xl mb-4">🏢</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Filiallar topilmadi
              </h3>
              <p className="text-gray-600">
                {searchTerm ? 'Qidiruv natijasi bo\'sh' : 'Hozircha filiallar mavjud emas'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBranches?.map((branch: any) => (
                <div
                  key={branch.id}
                  className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-semibold text-gray-900">{branch.name}</h3>
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        branch.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {branch.isActive ? 'Faol' : 'Nofaol'}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    {branch.code && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Kod:</span>
                        <span className="px-2 py-1 bg-gray-100 rounded text-gray-800 font-mono">
                          {branch.code}
                        </span>
                      </div>
                    )}
                    {branch.region && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Hudud:</span>
                        <span>{branch.region}</span>
                      </div>
                    )}
                    {branch.address && (
                      <div className="flex items-start gap-2">
                        <span className="font-medium">Manzil:</span>
                        <span className="flex-1">{branch.address}</span>
                      </div>
                    )}
                    {branch.phone && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">📞</span>
                        <a href={`tel:${branch.phone}`} className="text-primary hover:underline">
                          {branch.phone}
                        </a>
                      </div>
                    )}
                    {branch.email && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">📧</span>
                        <a href={`mailto:${branch.email}`} className="text-primary hover:underline">
                          {branch.email}
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Statistikalar */}
                  {branch._count && (
                    <div className="grid grid-cols-2 gap-2 mb-4 pt-4 border-t border-gray-200">
                      <div className="text-center">
                        <div className="text-lg font-bold text-gray-900">
                          {branch._count.users || 0}
                        </div>
                        <div className="text-xs text-gray-500">Xodimlar</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-gray-900">
                          {branch._count.leads || 0}
                        </div>
                        <div className="text-xs text-gray-500">Lidlar</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-gray-900">
                          {branch._count.deals || 0}
                        </div>
                        <div className="text-xs text-gray-500">Bitimlar</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-gray-900">
                          {branch._count.contacts || 0}
                        </div>
                        <div className="text-xs text-gray-500">Mijozlar</div>
                      </div>
                    </div>
                  )}

                  {/* Amallar */}
                  {currentUser?.role === 'SUPER_ADMIN' && (
                    <div className="flex space-x-2 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => handleOpenModal(branch)}
                        className="flex-1 bg-primary text-white px-4 py-2 rounded-lg hover:bg-opacity-90 text-sm font-medium"
                      >
                        Tahrirlash
                      </button>
                      <button
                        onClick={() => handleDelete(branch.id)}
                        className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm font-medium"
                        disabled={deleteMutation.isPending}
                      >
                        {deleteMutation.isPending ? 'O\'chirilmoqda...' : 'O\'chirish'}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Modal - Filial formasi */}
          {isModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">
                      {editingBranch ? 'Filialni Tahrirlash' : 'Yangi Filial'}
                    </h2>
                    <button
                      onClick={handleCloseModal}
                      className="text-gray-400 hover:text-gray-600 text-2xl"
                    >
                      ×
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Filial nomi *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Masalan: Toshkent filiali"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Filial kodi
                        </label>
                        <input
                          type="text"
                          value={formData.code}
                          onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="Masalan: TASH"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Hudud
                        </label>
                        <input
                          type="text"
                          value={formData.region}
                          onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="Masalan: Toshkent"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Manzil
                      </label>
                      <textarea
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        rows={2}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="To'liq manzil"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Telefon
                        </label>
                        <input
                          type="text"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="+998 71 123 45 67"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="filial@soundz.uz"
                        />
                      </div>
                    </div>

                    {editingBranch && (
                      <div>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={formData.isActive}
                            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                            className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                          />
                          <span className="text-sm font-medium text-gray-700">Faol</span>
                        </label>
                      </div>
                    )}

                    <div className="flex justify-end space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={handleCloseModal}
                        className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                      >
                        Bekor qilish
                      </button>
                      <button
                        type="submit"
                        disabled={createMutation.isPending || updateMutation.isPending}
                        className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {createMutation.isPending || updateMutation.isPending
                          ? 'Saqlanmoqda...'
                          : editingBranch
                          ? 'Yangilash'
                          : 'Yaratish'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    </AdminGuard>
  );
}
