'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import { LeadSource, DealStage } from '@prisma/client';
import { SimpleBarChart } from '@/components/charts/SimpleChart';

const leadSourceLabels: Record<LeadSource, string> = {
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

const dealStageLabels: Record<DealStage, string> = {
  LEAD: 'Yangi',
  CONTACTED: 'Aloqa',
  PROPOSAL: 'Taklif',
  NEGOTIATION: 'Muzokara',
  CLOSED_WON: 'Yakunlangan',
  CLOSED_LOST: 'Yutqazilgan',
};

export default function ReportsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'leads' | 'deals' | 'performance'>('leads');
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    branchId: '',
    source: '',
    stage: '',
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

  // Leads report
  const { data: leadsReport, isLoading: leadsLoading } = useQuery({
    queryKey: ['reports', 'leads', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.branchId) params.append('branchId', filters.branchId);
      if (filters.source) params.append('source', filters.source);
      const response = await api.get(`/reports/leads?${params.toString()}`);
      return response.data;
    },
    enabled: !!user && activeTab === 'leads',
  });

  // Deals report
  const { data: dealsReport, isLoading: dealsLoading } = useQuery({
    queryKey: ['reports', 'deals', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.branchId) params.append('branchId', filters.branchId);
      if (filters.stage) params.append('stage', filters.stage);
      const response = await api.get(`/reports/deals?${params.toString()}`);
      return response.data;
    },
    enabled: !!user && activeTab === 'deals',
  });

  // Performance report
  const { data: performanceReport, isLoading: performanceLoading } = useQuery({
    queryKey: ['reports', 'performance', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.branchId) params.append('branchId', filters.branchId);
      const response = await api.get(`/reports/performance?${params.toString()}`);
      return response.data;
    },
    enabled: !!user && activeTab === 'performance',
  });

  const isLoading = leadsLoading || dealsLoading || performanceLoading;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('uz-UZ', {
      style: 'currency',
      currency: 'UZS',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleExport = async (type: 'leads' | 'deals' | 'performance') => {
    // CSV export functionality
    let data: any[] = [];
    let filename = '';

    if (type === 'leads' && leadsReport) {
      data = leadsReport.leads.map((lead: any) => ({
        'Sarlavha': lead.title,
        'Status': lead.status,
        'Manba': lead.source,
        'Mijoz': lead.contact?.fullName || '',
        'Telefon': lead.contact?.phone || '',
        'Filial': lead.branch?.name || '',
        'Mas\'ul': `${lead.assignee?.firstName} ${lead.assignee?.lastName}`,
        'Yaratilgan sana': new Date(lead.createdAt).toLocaleDateString('uz-UZ'),
      }));
      filename = 'lidlar_hisoboti.csv';
    } else if (type === 'deals' && dealsReport) {
      data = dealsReport.deals.map((deal: any) => ({
        'Sarlavha': deal.title,
        'Bosqich': deal.stage,
        'Summa': deal.amount || 0,
        'Valyuta': deal.currency,
        'Mijoz': deal.contact?.fullName || '',
        'Filial': deal.branch?.name || '',
        'Mas\'ul': `${deal.assignee?.firstName} ${deal.assignee?.lastName}`,
        'Yaratilgan sana': new Date(deal.createdAt).toLocaleDateString('uz-UZ'),
      }));
      filename = 'bitimlar_hisoboti.csv';
    } else if (type === 'performance' && performanceReport) {
      data = performanceReport.performance.map((perf: any) => ({
        'F.I.Sh.': `${perf.user.firstName} ${perf.user.lastName}`,
        'Email': perf.user.email,
        'Rol': perf.user.role,
        'Filial': perf.user.branch?.name || '',
        'Lidlar': perf.leads,
        'Bitimlar': perf.deals,
        'Yakunlangan bitimlar': perf.closedDeals,
        'Daromad': perf.revenue,
        'Konversiya foizi': `${perf.conversionRate.toFixed(2)}%`,
      }));
      filename = 'xodimlar_faolligi.csv';
    }

    if (data.length === 0) return;

    // Convert to CSV
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map((row) => headers.map((header) => `"${row[header]}"`).join(',')),
    ].join('\n');

    // Download
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Hisobotlar</h1>
            <p className="text-gray-600 mt-1">Batafsil statistikalar va tahlillar</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {[
                { id: 'leads', label: 'Lidlar Hisoboti', icon: '📋' },
                { id: 'deals', label: 'Bitimlar Hisoboti', icon: '💼' },
                { id: 'performance', label: 'Xodimlar Faolligi', icon: '👥' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-6 py-4 border-b-2 font-medium text-sm transition ${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Filtrlash</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Boshlanish sanasi
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tugash sanasi
              </label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            {user?.role === 'SUPER_ADMIN' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filial
                </label>
                <select
                  value={filters.branchId}
                  onChange={(e) => setFilters({ ...filters, branchId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Barcha filiallar</option>
                  {branches?.map((branch: any) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {activeTab === 'leads' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Manba
                </label>
                <select
                  value={filters.source}
                  onChange={(e) => setFilters({ ...filters, source: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Barcha manbalar</option>
                  {Object.values(LeadSource).map((source) => (
                    <option key={source} value={source}>
                      {leadSourceLabels[source]}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {activeTab === 'deals' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bosqich
                </label>
                <select
                  value={filters.stage}
                  onChange={(e) => setFilters({ ...filters, stage: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Barcha bosqichlar</option>
                  {Object.values(DealStage).map((stage) => (
                    <option key={stage} value={stage}>
                      {dealStageLabels[stage]}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="text-gray-500">Yuklanmoqda...</div>
          </div>
        ) : (
          <>
            {/* Leads Report */}
            {activeTab === 'leads' && leadsReport && (
              <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="text-sm text-gray-500 mb-1">Jami Lidlar</div>
                    <div className="text-3xl font-bold text-gray-900">{leadsReport.total}</div>
                  </div>
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="text-sm text-gray-500 mb-1">Manbalar soni</div>
                    <div className="text-3xl font-bold text-gray-900">
                      {leadsReport.sourceStats?.length || 0}
                    </div>
                  </div>
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="text-sm text-gray-500 mb-1">Statuslar soni</div>
                    <div className="text-3xl font-bold text-gray-900">
                      {leadsReport.statusStats?.length || 0}
                    </div>
                  </div>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Source Stats */}
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Lidlar Manbalari
                    </h3>
                    <div className="space-y-4">
                      {leadsReport.sourceStats?.map((stat: any) => (
                        <div key={stat.source}>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-gray-700">
                              {leadSourceLabels[stat.source as LeadSource] || stat.source}
                            </span>
                            <span className="text-sm font-bold text-gray-900">
                              {stat.count} ({stat.percentage.toFixed(1)}%)
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full"
                              style={{ width: `${stat.percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Status Stats */}
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Lidlar Statuslari
                    </h3>
                    <div className="space-y-4">
                      {leadsReport.statusStats?.map((stat: any) => (
                        <div key={stat.status}>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-gray-700">
                              {stat.status}
                            </span>
                            <span className="text-sm font-bold text-gray-900">
                              {stat.count} ({stat.percentage.toFixed(1)}%)
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-500 h-2 rounded-full"
                              style={{ width: `${stat.percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Export Button */}
                <div className="flex justify-end">
                  <button
                    onClick={() => handleExport('leads')}
                    className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90"
                  >
                    CSV ga eksport qilish
                  </button>
                </div>
              </div>
            )}

            {/* Deals Report */}
            {activeTab === 'deals' && dealsReport && (
              <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="text-sm text-gray-500 mb-1">Jami Bitimlar</div>
                    <div className="text-3xl font-bold text-gray-900">{dealsReport.total}</div>
                  </div>
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="text-sm text-gray-500 mb-1">Jami Daromad</div>
                    <div className="text-3xl font-bold text-green-600">
                      {formatCurrency(dealsReport.revenue?.total || 0)}
                    </div>
                  </div>
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="text-sm text-gray-500 mb-1">O'rtacha Bitim Qiymati</div>
                    <div className="text-3xl font-bold text-gray-900">
                      {formatCurrency(dealsReport.revenue?.average || 0)}
                    </div>
                  </div>
                </div>

                {/* Stage Stats */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Bitimlar Bosqichlari
                  </h3>
                  <div className="space-y-4">
                    {dealsReport.stageStats?.map((stat: any) => (
                      <div key={stat.stage}>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-700">
                            {dealStageLabels[stat.stage as DealStage] || stat.stage}
                          </span>
                          <span className="text-sm font-bold text-gray-900">
                            {stat.count} ({stat.percentage.toFixed(1)}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full"
                            style={{ width: `${stat.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Export Button */}
                <div className="flex justify-end">
                  <button
                    onClick={() => handleExport('deals')}
                    className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90"
                  >
                    CSV ga eksport qilish
                  </button>
                </div>
              </div>
            )}

            {/* Performance Report */}
            {activeTab === 'performance' && performanceReport && (
              <div className="space-y-6">
                {/* Performance Table */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          F.I.Sh.
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Filial
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Lidlar
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Bitimlar
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Yakunlangan
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Daromad
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Konversiya
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {performanceReport.performance?.map((perf: any) => (
                        <tr key={perf.user.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {perf.user.firstName} {perf.user.lastName}
                            </div>
                            <div className="text-sm text-gray-500">{perf.user.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {perf.user.branch?.name || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {perf.leads}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {perf.deals}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {perf.closedDeals}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                            {formatCurrency(perf.revenue)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                perf.conversionRate >= 50
                                  ? 'bg-green-100 text-green-800'
                                  : perf.conversionRate >= 25
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {perf.conversionRate.toFixed(1)}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Export Button */}
                <div className="flex justify-end">
                  <button
                    onClick={() => handleExport('performance')}
                    className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90"
                  >
                    CSV ga eksport qilish
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
