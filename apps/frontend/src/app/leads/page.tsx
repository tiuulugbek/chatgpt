'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

// Lead Status ranglari
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

// Lead Status o'zbekcha nomlari
const statusLabels: Record<string, string> = {
  NEW: 'Yangi',
  CONTACTED: 'Aloqa qilindi',
  QUALIFIED: 'Sifatli',
  PROPOSAL_SENT: 'Taklif yuborildi',
  NEGOTIATION: 'Muzokara',
  WON: 'Yutdi',
  LOST: 'Yutqazdi',
  CLOSED: 'Yopildi',
};

// Lead Source o'zbekcha nomlari
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

export default function LeadsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Filtrlash holatlari
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // API so'rov parametrlari
  const queryParams = new URLSearchParams();
  if (statusFilter !== 'all') queryParams.append('status', statusFilter);
  if (sourceFilter !== 'all') queryParams.append('source', sourceFilter);

  const { data: leads, isLoading } = useQuery({
    queryKey: ['leads', statusFilter, sourceFilter],
    queryFn: async () => {
      const response = await api.get(`/leads?${queryParams.toString()}`);
      return response.data;
    },
    enabled: !!user,
  });

  // Qidiruv natijalarini filtrlash
  const filteredLeads = leads?.filter((lead: any) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      lead.title?.toLowerCase().includes(query) ||
      lead.contact?.fullName?.toLowerCase().includes(query) ||
      lead.contact?.phone?.includes(query) ||
      lead.description?.toLowerCase().includes(query)
    );
  }) || [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Lidlar</h1>
            <p className="text-gray-600 mt-1">Barcha murojaatlarni boshqaring</p>
          </div>
          <Link
            href="/leads/new"
            className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-opacity-90 transition font-medium"
          >
            + Yangi Lid
          </Link>
        </div>

        {/* Filtrlash va qidiruv */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Qidiruv */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Qidiruv
              </label>
              <input
                type="text"
                placeholder="Lid nomi, mijoz, telefon..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Status filtri */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">Barchasi</option>
                {Object.entries(statusLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {/* Manba filtri */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Manba
              </label>
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">Barchasi</option>
                {Object.entries(sourceLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Lidlar ro'yxati */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="text-gray-500">Yuklanmoqda...</div>
          </div>
        ) : filteredLeads.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Hozircha lidlar mavjud emas
            </h3>
            <p className="text-gray-600 mb-6">
              Yangi lid yaratish uchun "Yangi Lid" tugmasini bosing
            </p>
            <Link
              href="/leads/new"
              className="inline-block bg-primary text-white px-6 py-3 rounded-lg hover:bg-opacity-90 transition"
            >
              + Yangi Lid Yaratish
            </Link>
          </div>
        ) : (
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
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Manba
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mas'ul
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sana
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amallar
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredLeads.map((lead: any) => (
                    <tr key={lead.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {lead.title}
                        </div>
                        {lead.description && (
                          <div className="text-sm text-gray-500 mt-1 line-clamp-1">
                            {lead.description}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {lead.contact ? (
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {lead.contact.fullName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {lead.contact.phone}
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">Mijoz yo'q</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            statusColors[lead.status] || 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {statusLabels[lead.status] || lead.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {sourceLabels[lead.source] || lead.source}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {lead.assignee
                          ? `${lead.assignee.firstName} ${lead.assignee.lastName}`
                          : 'Tayinlanmagan'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(lead.createdAt).toLocaleDateString('uz-UZ', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          href={`/leads/${lead.id}`}
                          className="text-primary hover:text-opacity-80 mr-4"
                        >
                          Ko'rish
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Statistikalar */}
        {filteredLeads.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm text-gray-500 mb-1">Jami Lidlar</div>
              <div className="text-2xl font-bold text-gray-900">
                {filteredLeads.length}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm text-gray-500 mb-1">Yangi</div>
              <div className="text-2xl font-bold text-blue-600">
                {filteredLeads.filter((l: any) => l.status === 'NEW').length}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm text-gray-500 mb-1">Aloqa qilindi</div>
              <div className="text-2xl font-bold text-purple-600">
                {filteredLeads.filter((l: any) => l.status === 'CONTACTED').length}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm text-gray-500 mb-1">Yutdi</div>
              <div className="text-2xl font-bold text-green-600">
                {filteredLeads.filter((l: any) => l.status === 'WON').length}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
