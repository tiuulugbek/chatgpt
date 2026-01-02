'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import { SimpleBarChart, SimpleLineChart } from '@/components/charts/SimpleChart';
import Link from 'next/link';
import { DealStage, LeadSource } from '@prisma/client';

const dealStageLabels: Record<DealStage, string> = {
  LEAD: 'Yangi',
  CONTACTED: 'Aloqa',
  PROPOSAL: 'Taklif',
  NEGOTIATION: 'Muzokara',
  CLOSED_WON: 'Yakunlangan',
  CLOSED_LOST: 'Yutqazilgan',
};

const leadSourceLabels: Record<LeadSource, string> = {
  WEBSITE: 'Veb-sayt',
  INSTAGRAM: 'Instagram',
  FACEBOOK: 'Facebook',
  TELEGRAM: 'Telegram',
  YOUTUBE: 'YouTube',
  PHONE_CALL: 'Telefon',
  EMAIL: 'Email',
  REFERRAL: 'Tavsiya',
  OTHER: 'Boshqa',
};

const leadSourceColors: Record<LeadSource, string> = {
  WEBSITE: '#3F3091',
  INSTAGRAM: '#E4405F',
  FACEBOOK: '#1877F2',
  TELEGRAM: '#0088CC',
  YOUTUBE: '#FF0000',
  PHONE_CALL: '#10B981',
  EMAIL: '#6B7280',
  REFERRAL: '#F59E0B',
  OTHER: '#9CA3AF',
};

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['dashboard', timeRange],
    queryFn: async () => {
      const response = await api.get(`/reports/dashboard?range=${timeRange}`);
      return response.data;
    },
    enabled: !!user,
    refetchInterval: 30000, // 30 soniyada bir yangilash
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  if (authLoading || isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Yuklanmoqda...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (!user) {
    return null;
  }

  const formatGrowth = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('uz-UZ', {
      style: 'currency',
      currency: 'UZS',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Xush kelibsiz, {user?.firstName}!</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setTimeRange('week')}
              className={`px-4 py-2 rounded-lg transition ${
                timeRange === 'week'
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Hafta
            </button>
            <button
              onClick={() => setTimeRange('month')}
              className={`px-4 py-2 rounded-lg transition ${
                timeRange === 'month'
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Oy
            </button>
            <button
              onClick={() => setTimeRange('year')}
              className={`px-4 py-2 rounded-lg transition ${
                timeRange === 'year'
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Yil
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-purple-100 text-sm mb-1">Jami Lidlar</p>
                <p className="text-4xl font-bold">{dashboardData?.leads || 0}</p>
              </div>
              <div className="bg-white bg-opacity-20 rounded-lg p-3">
                <span className="text-2xl">📋</span>
              </div>
            </div>
            <div className="flex items-center text-sm">
              <span
                className={`${
                  (dashboardData?.growth?.leads || 0) >= 0
                    ? 'text-green-200'
                    : 'text-red-200'
                }`}
              >
                {dashboardData?.growth?.leads
                  ? `${formatGrowth(dashboardData.growth.leads)}`
                  : '0%'}
              </span>
              <span className="ml-2 text-purple-100">
                {timeRange === 'week'
                  ? 'o\'tgan haftadan'
                  : timeRange === 'year'
                  ? 'o\'tgan yildan'
                  : 'o\'tgan oydan'}
              </span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-orange-100 text-sm mb-1">Faol Bitimlar</p>
                <p className="text-4xl font-bold">{dashboardData?.deals || 0}</p>
              </div>
              <div className="bg-white bg-opacity-20 rounded-lg p-3">
                <span className="text-2xl">💼</span>
              </div>
            </div>
            <div className="flex items-center text-sm">
              <span
                className={`${
                  (dashboardData?.growth?.deals || 0) >= 0
                    ? 'text-green-200'
                    : 'text-red-200'
                }`}
              >
                {dashboardData?.growth?.deals
                  ? `${formatGrowth(dashboardData.growth.deals)}`
                  : '0%'}
              </span>
              <span className="ml-2 text-orange-100">
                {timeRange === 'week'
                  ? 'o\'tgan haftadan'
                  : timeRange === 'year'
                  ? 'o\'tgan yildan'
                  : 'o\'tgan oydan'}
              </span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-green-100 text-sm mb-1">Mijozlar</p>
                <p className="text-4xl font-bold">{dashboardData?.contacts || 0}</p>
              </div>
              <div className="bg-white bg-opacity-20 rounded-lg p-3">
                <span className="text-2xl">👥</span>
              </div>
            </div>
            <div className="flex items-center text-sm">
              <span
                className={`${
                  (dashboardData?.growth?.contacts || 0) >= 0
                    ? 'text-green-200'
                    : 'text-red-200'
                }`}
              >
                {dashboardData?.growth?.contacts
                  ? `${formatGrowth(dashboardData.growth.contacts)}`
                  : '0%'}
              </span>
              <span className="ml-2 text-green-100">
                {timeRange === 'week'
                  ? 'o\'tgan haftadan'
                  : timeRange === 'year'
                  ? 'o\'tgan yildan'
                  : 'o\'tgan oydan'}
              </span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-blue-100 text-sm mb-1">Xabarlar</p>
                <p className="text-4xl font-bold">{dashboardData?.messages || 0}</p>
              </div>
              <div className="bg-white bg-opacity-20 rounded-lg p-3">
                <span className="text-2xl">💬</span>
              </div>
            </div>
            <div className="flex items-center text-sm">
              <span
                className={`${
                  (dashboardData?.growth?.messages || 0) >= 0
                    ? 'text-green-200'
                    : 'text-red-200'
                }`}
              >
                {dashboardData?.growth?.messages
                  ? `${formatGrowth(dashboardData.growth.messages)}`
                  : '0%'}
              </span>
              <span className="ml-2 text-blue-100">
                {timeRange === 'week'
                  ? 'o\'tgan haftadan'
                  : timeRange === 'year'
                  ? 'o\'tgan yildan'
                  : 'o\'tgan oydan'}
              </span>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lidlar Statistikasi */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Lidlar Statistikasi</h2>
                <p className="text-sm text-gray-500">Haftalik ko'rsatkichlar</p>
              </div>
              <Link
                href="/leads"
                className="text-primary hover:text-opacity-80 text-sm font-medium"
              >
                Barchasini ko'rish →
              </Link>
            </div>
            {dashboardData?.weeklyStats?.leads ? (
              <>
                <SimpleBarChart
                  data={dashboardData.weeklyStats.leads.data}
                  labels={dashboardData.weeklyStats.leads.labels}
                  color="#3F3091"
                  height={250}
                />
                <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t">
                  <div>
                    <p className="text-sm text-gray-500">O'rtacha</p>
                    <p className="text-xl font-bold text-gray-900">
                      {Math.round(dashboardData.weeklyStats.leads.average)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Maksimal</p>
                    <p className="text-xl font-bold text-green-600">
                      {dashboardData.weeklyStats.leads.max}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Jami</p>
                    <p className="text-xl font-bold text-primary">
                      {dashboardData.weeklyStats.leads.total}
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-gray-400">
                Ma'lumotlar mavjud emas
              </div>
            )}
          </div>

          {/* Bitimlar Vronkasi */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Bitimlar Vronkasi</h2>
              <p className="text-sm text-gray-500">Joriy holat</p>
            </div>
            <div className="space-y-4">
              {dashboardData?.dealStatuses && dashboardData.dealStatuses.length > 0 ? (
                dashboardData.dealStatuses.map((item: any) => (
                  <div
                    key={item.status}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center">
                      <div
                        className="w-3 h-3 rounded-full mr-3"
                        style={{
                          backgroundColor:
                            item.status === DealStage.CLOSED_WON
                              ? '#10B981'
                              : item.status === DealStage.CLOSED_LOST
                              ? '#EF4444'
                              : '#3F3091',
                        }}
                      ></div>
                      <span className="text-sm font-medium text-gray-700">
                        {dealStageLabels[item.status as DealStage] || item.status}
                      </span>
                    </div>
                    <span className="text-lg font-bold text-gray-900">{item.count}</span>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-400 py-8">Bitimlar mavjud emas</div>
              )}
            </div>
            <Link
              href="/deals"
              className="block mt-6 text-center text-primary hover:text-opacity-80 text-sm font-medium"
            >
              Barcha bitimlar →
            </Link>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Daromad Statistikasi */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Daromad Statistikasi</h2>
                <p className="text-sm text-gray-500">Haftalik daromad</p>
              </div>
            </div>
            {dashboardData?.weeklyStats?.revenue ? (
              <>
                <SimpleLineChart
                  data={dashboardData.weeklyStats.revenue.data}
                  color="#F07E22"
                  height={200}
                />
                <div className="mt-6 pt-6 border-t flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500">Jami Daromad</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(dashboardData.weeklyStats.revenue.total)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">O'rtacha</p>
                    <p className="text-xl font-bold text-accent">
                      {formatCurrency(dashboardData.weeklyStats.revenue.average)}
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-gray-400">
                Ma'lumotlar mavjud emas
              </div>
            )}
          </div>

          {/* Manbalar Tahlili */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Lidlar Manbalari</h2>
              <p className="text-sm text-gray-500">Qaysi kanaldan ko'proq lidlar kelmoqda</p>
            </div>
            <div className="space-y-4">
              {dashboardData?.leadSources && dashboardData.leadSources.length > 0 ? (
                dashboardData.leadSources
                  .sort((a: any, b: any) => b.count - a.count)
                  .slice(0, 5)
                  .map((item: any) => (
                    <div key={item.source}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">
                          {leadSourceLabels[item.source as LeadSource] || item.source}
                        </span>
                        <span className="text-sm font-bold text-gray-900">
                          {item.percentage.toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all"
                          style={{
                            width: `${item.percentage}%`,
                            backgroundColor:
                              leadSourceColors[item.source as LeadSource] || '#3F3091',
                          }}
                        ></div>
                      </div>
                    </div>
                  ))
              ) : (
                <div className="text-center text-gray-400 py-8">Ma'lumotlar mavjud emas</div>
              )}
            </div>
            <Link
              href="/reports"
              className="block mt-6 text-center text-primary hover:text-opacity-80 text-sm font-medium"
            >
              Batafsil hisobot →
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Tezkor Amallar</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              href="/leads/new"
              className="flex flex-col items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition"
            >
              <span className="text-3xl mb-2">➕</span>
              <span className="text-sm font-medium text-gray-700">Yangi Lid</span>
            </Link>
            <Link
              href="/deals/new"
              className="flex flex-col items-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition"
            >
              <span className="text-3xl mb-2">💼</span>
              <span className="text-sm font-medium text-gray-700">Yangi Bitim</span>
            </Link>
            <Link
              href="/contacts/new"
              className="flex flex-col items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition"
            >
              <span className="text-3xl mb-2">👤</span>
              <span className="text-sm font-medium text-gray-700">Yangi Mijoz</span>
            </Link>
            <Link
              href="/messages"
              className="flex flex-col items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition"
            >
              <span className="text-3xl mb-2">💬</span>
              <span className="text-sm font-medium text-gray-700">Xabarlar</span>
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
