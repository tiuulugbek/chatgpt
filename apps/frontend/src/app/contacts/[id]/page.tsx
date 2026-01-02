'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

export default function ContactDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const contactId = params.id as string;

  const [activeTab, setActiveTab] = useState<'info' | 'leads' | 'deals' | 'messages'>('info');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<any>({});

  // Contact ma'lumotlarini olish
  const { data: contact, isLoading } = useQuery({
    queryKey: ['contact', contactId],
    queryFn: async () => {
      const response = await api.get(`/contacts/${contactId}`);
      return response.data;
    },
    enabled: !!contactId,
  });

  // Contact yangilash
  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.patch(`/contacts/${contactId}`, data);
      return response.data;
    },
    onSuccess: () => {
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ['contact', contactId] });
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
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

  if (!contact) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Mijoz topilmadi</h2>
          <button
            onClick={() => router.push('/contacts')}
            className="text-primary hover:text-opacity-80"
          >
            Mijozlar ro'yxatiga qaytish
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const handleSaveEdit = () => {
    updateMutation.mutate(editData);
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
            <h1 className="text-3xl font-bold text-gray-900">{contact.fullName}</h1>
            {contact.company && (
              <p className="text-gray-600 mt-1">{contact.company}</p>
            )}
          </div>
          {!isEditing && (
            <button
              onClick={() => {
                setIsEditing(true);
                setEditData({
                  fullName: contact.fullName,
                  phone: contact.phone || '',
                  email: contact.email || '',
                  address: contact.address || '',
                  company: contact.company || '',
                  tin: contact.tin || '',
                  notes: contact.notes || '',
                  tags: contact.tags?.join(', ') || '',
                });
              }}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90"
            >
              Tahrirlash
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'info', label: 'Ma\'lumotlar' },
              { id: 'leads', label: `Lidlar (${contact.leads?.length || 0})` },
              { id: 'deals', label: `Bitimlar (${contact.deals?.length || 0})` },
              { id: 'messages', label: `Xabarlar (${contact.messages?.length || 0})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow p-6">
          {/* Ma'lumotlar */}
          {activeTab === 'info' && (
            <div className="space-y-6">
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      F.I.Sh.
                    </label>
                    <input
                      type="text"
                      value={editData.fullName}
                      onChange={(e) => setEditData({ ...editData, fullName: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Telefon
                      </label>
                      <input
                        type="tel"
                        value={editData.phone}
                        onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={editData.email}
                        onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Manzil
                    </label>
                    <input
                      type="text"
                      value={editData.address}
                      onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Kompaniya
                      </label>
                      <input
                        type="text"
                        value={editData.company}
                        onChange={(e) => setEditData({ ...editData, company: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        STIR
                      </label>
                      <input
                        type="text"
                        value={editData.tin}
                        onChange={(e) => setEditData({ ...editData, tin: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Izohlar
                    </label>
                    <textarea
                      value={editData.notes}
                      onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-4">Kontakt ma'lumotlari</h3>
                    <div className="space-y-3">
                      <div>
                        <div className="text-sm text-gray-500">Telefon</div>
                        <div className="font-medium text-gray-900">
                          {contact.phone || '-'}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Email</div>
                        <div className="font-medium text-gray-900">
                          {contact.email || '-'}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Manzil</div>
                        <div className="font-medium text-gray-900">
                          {contact.address || '-'}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-4">Kompaniya ma'lumotlari</h3>
                    <div className="space-y-3">
                      <div>
                        <div className="text-sm text-gray-500">Kompaniya</div>
                        <div className="font-medium text-gray-900">
                          {contact.company || '-'}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">STIR</div>
                        <div className="font-medium text-gray-900">
                          {contact.tin || '-'}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Filial</div>
                        <div className="font-medium text-gray-900">
                          {contact.branch?.name || '-'}
                        </div>
                      </div>
                    </div>
                  </div>
                  {contact.notes && (
                    <div className="md:col-span-2">
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Izohlar</h3>
                      <p className="text-gray-700 whitespace-pre-wrap">{contact.notes}</p>
                    </div>
                  )}
                  {contact.tags && contact.tags.length > 0 && (
                    <div className="md:col-span-2">
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Teglar</h3>
                      <div className="flex flex-wrap gap-2">
                        {contact.tags.map((tag: string, index: number) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-primary bg-opacity-10 text-primary rounded-full text-sm"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Lidlar */}
          {activeTab === 'leads' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Lidlar</h3>
                <Link
                  href={`/leads/new?contactId=${contactId}`}
                  className="text-sm text-primary hover:text-opacity-80"
                >
                  + Yangi Lid
                </Link>
              </div>
              {contact.leads && contact.leads.length > 0 ? (
                <div className="space-y-3">
                  {contact.leads.map((lead: any) => (
                    <Link
                      key={lead.id}
                      href={`/leads/${lead.id}`}
                      className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium text-gray-900">{lead.title}</div>
                          <div className="text-sm text-gray-500 mt-1">
                            {new Date(lead.createdAt).toLocaleDateString('uz-UZ')}
                          </div>
                        </div>
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {lead.status}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Hozircha lidlar mavjud emas
                </div>
              )}
            </div>
          )}

          {/* Bitimlar */}
          {activeTab === 'deals' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Bitimlar</h3>
                <Link
                  href={`/deals/new?contactId=${contactId}`}
                  className="text-sm text-primary hover:text-opacity-80"
                >
                  + Yangi Bitim
                </Link>
              </div>
              {contact.deals && contact.deals.length > 0 ? (
                <div className="space-y-3">
                  {contact.deals.map((deal: any) => (
                    <Link
                      key={deal.id}
                      href={`/deals/${deal.id}`}
                      className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium text-gray-900">{deal.title}</div>
                          {deal.amount && (
                            <div className="text-sm font-semibold text-primary mt-1">
                              {parseFloat(deal.amount).toLocaleString('uz-UZ')} {deal.currency || 'UZS'}
                            </div>
                          )}
                          <div className="text-sm text-gray-500 mt-1">
                            {new Date(deal.createdAt).toLocaleDateString('uz-UZ')}
                          </div>
                        </div>
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          {deal.stage}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Hozircha bitimlar mavjud emas
                </div>
              )}
            </div>
          )}

          {/* Xabarlar */}
          {activeTab === 'messages' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Xabarlar</h3>
              {contact.messages && contact.messages.length > 0 ? (
                <div className="space-y-3">
                  {contact.messages.map((message: any) => (
                    <div
                      key={message.id}
                      className="p-4 border border-gray-200 rounded-lg"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="text-sm font-medium text-gray-900">
                          {message.type}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(message.createdAt).toLocaleString('uz-UZ')}
                        </div>
                      </div>
                      <div className="text-gray-700">{message.content}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Hozircha xabarlar mavjud emas
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

