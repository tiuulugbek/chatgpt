'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';

const statusOptions = [
  { value: 'NEW', label: 'Yangi' },
  { value: 'CONTACTED', label: 'Aloqa qilindi' },
  { value: 'QUALIFIED', label: 'Sifatli' },
  { value: 'PROPOSAL_SENT', label: 'Taklif yuborildi' },
  { value: 'NEGOTIATION', label: 'Muzokara' },
  { value: 'WON', label: 'Yutdi' },
  { value: 'LOST', label: 'Yutqazdi' },
  { value: 'CLOSED', label: 'Yopildi' },
];

const statusColors: Record<string, string> = {
  NEW: 'bg-blue-100 text-blue-800',
  CONTACTED: 'bg-purple-100 text-purple-800',
  QUALIFIED: 'bg-yellow-100 text-yellow-800',
  PROPOSAL_SENT: 'bg-orange-100 text-orange-800',
  NEGOTIATION: 'bg-indigo-100 text-indigo-800',
  WON: 'bg-green-100 text-green-800',
  LOST: 'bg-red-100 text-red-800',
  CLOSED: 'bg-gray-100 text-gray-800',
};

const sourceLabels: Record<string, string> = {
  WEBSITE: 'Veb-sayt',
  INSTAGRAM: 'Instagram',
  FACEBOOK: 'Facebook',
  TELEGRAM: 'Telegram',
  YOUTUBE: 'YouTube',
  PHONE: 'Telefon',
  EMAIL: 'Email',
  GOOGLE_MAPS: 'Google Maps',
  YANDEX_MAPS: 'Yandex Maps',
  OTHER: 'Boshqa',
};

export default function LeadDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const leadId = params.id as string;

  const [noteContent, setNoteContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<any>({});

  // Lead ma'lumotlarini olish
  const { data: lead, isLoading } = useQuery({
    queryKey: ['lead', leadId],
    queryFn: async () => {
      const response = await api.get(`/leads/${leadId}`);
      return response.data;
    },
    enabled: !!leadId,
  });

  // Status o'zgartirish
  const updateStatusMutation = useMutation({
    mutationFn: async (status: string) => {
      const response = await api.patch(`/leads/${leadId}`, { status });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead', leadId] });
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });

  // Izoh qo'shish
  const addNoteMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await api.post(`/leads/${leadId}/notes`, { content });
      return response.data;
    },
    onSuccess: () => {
      setNoteContent('');
      queryClient.invalidateQueries({ queryKey: ['lead', leadId] });
    },
  });

  // Lead yangilash
  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.patch(`/leads/${leadId}`, data);
      return response.data;
    },
    onSuccess: () => {
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ['lead', leadId] });
      queryClient.invalidateQueries({ queryKey: ['leads'] });
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

  if (!lead) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Lid topilmadi</h2>
          <button
            onClick={() => router.push('/leads')}
            className="text-primary hover:text-opacity-80"
          >
            Lidlar ro'yxatiga qaytish
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const handleStatusChange = (newStatus: string) => {
    if (confirm('Statusni o\'zgartirishni tasdiqlaysizmi?')) {
      updateStatusMutation.mutate(newStatus);
    }
  };

  const handleAddNote = () => {
    if (noteContent.trim()) {
      addNoteMutation.mutate(noteContent);
    }
  };

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
            <h1 className="text-3xl font-bold text-gray-900">{lead.title}</h1>
            <div className="flex items-center gap-4 mt-2">
              <span
                className={`px-3 py-1 inline-flex text-sm font-semibold rounded-full ${
                  statusColors[lead.status] || 'bg-gray-100 text-gray-800'
                }`}
              >
                {statusOptions.find((s) => s.value === lead.status)?.label || lead.status}
              </span>
              <span className="text-sm text-gray-500">
                {sourceLabels[lead.source] || lead.source}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={lead.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {statusOptions.map((option) => (
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
            {/* Tavsif */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Tavsif</h2>
                {!isEditing && (
                  <button
                    onClick={() => {
                      setIsEditing(true);
                      setEditData({ description: lead.description || '' });
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
                    value={editData.description || ''}
                    onChange={(e) =>
                      setEditData({ ...editData, description: e.target.value })
                    }
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
                  {lead.description || 'Tavsif kiritilmagan'}
                </p>
              )}
            </div>

            {/* Izohlar */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Izohlar</h2>
              
              {/* Izoh qo'shish */}
              <div className="mb-6">
                <textarea
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  rows={3}
                  placeholder="Yangi izoh qo'shing..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary mb-2"
                />
                <button
                  onClick={handleAddNote}
                  disabled={!noteContent.trim() || addNoteMutation.isPending}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 disabled:opacity-50"
                >
                  {addNoteMutation.isPending ? 'Qo\'shilmoqda...' : 'Izoh qo\'shish'}
                </button>
              </div>

              {/* Izohlar ro'yxati */}
              <div className="space-y-4">
                {lead.notes && lead.notes.length > 0 ? (
                  lead.notes.map((note: any) => (
                    <div key={note.id} className="border-l-4 border-primary pl-4 py-2">
                      <p className="text-gray-700">{note.content}</p>
                      <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                        <span>
                          {note.user
                            ? `${note.user.firstName} ${note.user.lastName}`
                            : 'Tizim'}
                        </span>
                        <span>•</span>
                        <span>
                          {new Date(note.createdAt).toLocaleString('uz-UZ')}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    Hozircha izohlar mavjud emas
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Yon panel */}
          <div className="space-y-6">
            {/* Mijoz ma'lumotlari */}
            {lead.contact && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Mijoz</h2>
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-gray-500">Ism</div>
                    <div className="font-medium text-gray-900">
                      {lead.contact.fullName}
                    </div>
                  </div>
                  {lead.contact.phone && (
                    <div>
                      <div className="text-sm text-gray-500">Telefon</div>
                      <div className="font-medium text-gray-900">
                        {lead.contact.phone}
                      </div>
                    </div>
                  )}
                  {lead.contact.email && (
                    <div>
                      <div className="text-sm text-gray-500">Email</div>
                      <div className="font-medium text-gray-900">
                        {lead.contact.email}
                      </div>
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
                    {lead.assignee
                      ? `${lead.assignee.firstName} ${lead.assignee.lastName}`
                      : 'Tayinlanmagan'}
                  </div>
                </div>
                <div>
                  <div className="text-gray-500">Filial</div>
                  <div className="font-medium text-gray-900">
                    {lead.branch?.name || 'Filial yo\'q'}
                  </div>
                </div>
                <div>
                  <div className="text-gray-500">Yaratilgan</div>
                  <div className="font-medium text-gray-900">
                    {new Date(lead.createdAt).toLocaleString('uz-UZ')}
                  </div>
                </div>
                {lead.updatedAt && (
                  <div>
                    <div className="text-gray-500">Yangilangan</div>
                    <div className="font-medium text-gray-900">
                      {new Date(lead.updatedAt).toLocaleString('uz-UZ')}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

