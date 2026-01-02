'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import { SimpleBarChart, SimpleLineChart, DonutChart } from '@/components/charts/SimpleChart';
import Link from 'next/link';

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

  // Mock data for charts (keyinchalik backend'dan keladi)
  const leadsData = [12, 19, 15, 25, 22, 30, 28];
  const leadsLabels = ['Dush', 'Sesh', 'Chor', 'Pay', 'Jum', 'Shan', 'Yak'];
  const dealsData = [5, 8, 6, 12, 10, 15, 14];
  const revenueData = [1200, 1800, 1500, 2200, 2000, 2800, 2600];

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
              <span className="text-green-200">↑ +12.5%</span>
              <span className="ml-2 text-purple-100">o'tgan oydan</span>
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
              <span className="text-green-200">↑ +8.2%</span>
              <span className="ml-2 text-orange-100">o'tgan oydan</span>
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
              <span className="text-green-200">↑ +15.3%</span>
              <span className="ml-2 text-green-100">o'tgan oydan</span>
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
              <span className="text-green-200">↑ +22.1%</span>
              <span className="ml-2 text-blue-100">o'tgan oydan</span>
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
            <SimpleBarChart
              data={leadsData}
              labels={leadsLabels}
              color="#3F3091"
              height={250}
            />
            <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t">
              <div>
                <p className="text-sm text-gray-500">O'rtacha</p>
                <p className="text-xl font-bold text-gray-900">21</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Maksimal</p>
                <p className="text-xl font-bold text-green-600">30</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Jami</p>
                <p className="text-xl font-bold text-primary">151</p>
              </div>
            </div>
          </div>

          {/* Bitimlar Vronkasi */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Bitimlar Vronkasi</h2>
              <p className="text-sm text-gray-500">Joriy holat</p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
                  <span className="text-sm font-medium text-gray-700">Yangi</span>
                </div>
                <span className="text-lg font-bold text-purple-600">12</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                  <span className="text-sm font-medium text-gray-700">Aloqa</span>
                </div>
                <span className="text-lg font-bold text-blue-600">8</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                  <span className="text-sm font-medium text-gray-700">Taklif</span>
                </div>
                <span className="text-lg font-bold text-yellow-600">15</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-sm font-medium text-gray-700">Yakunlangan</span>
                </div>
                <span className="text-lg font-bold text-green-600">24</span>
              </div>
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
            <SimpleLineChart
              data={revenueData}
              color="#F07E22"
              height={200}
            />
            <div className="mt-6 pt-6 border-t flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">Jami Daromad</p>
                <p className="text-2xl font-bold text-gray-900">14,100 so'm</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">O'rtacha</p>
                <p className="text-xl font-bold text-accent">2,014 so'm</p>
              </div>
            </div>
          </div>

          {/* Manbalar Tahlili */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Lidlar Manbalari</h2>
              <p className="text-sm text-gray-500">Qaysi kanaldan ko'proq lidlar kelmoqda</p>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Veb-sayt</span>
                  <span className="text-sm font-bold text-gray-900">45%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full"
                    style={{ width: '45%' }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Instagram</span>
                  <span className="text-sm font-bold text-gray-900">28%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-pink-500 h-2 rounded-full"
                    style={{ width: '28%' }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Telegram</span>
                  <span className="text-sm font-bold text-gray-900">18%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: '18%' }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Facebook</span>
                  <span className="text-sm font-bold text-gray-900">9%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: '9%' }}
                  ></div>
                </div>
              </div>
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



