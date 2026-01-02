'use client';

import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

// Telegram Web App API types
declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        initData: string;
        initDataUnsafe: {
          user?: {
            id: number;
            first_name: string;
            last_name?: string;
            username?: string;
            language_code?: string;
          };
          auth_date: number;
          hash: string;
        };
        version: string;
        platform: string;
        colorScheme: 'light' | 'dark';
        themeParams: {
          bg_color?: string;
          text_color?: string;
          hint_color?: string;
          link_color?: string;
          button_color?: string;
          button_text_color?: string;
        };
        isExpanded: boolean;
        viewportHeight: number;
        viewportStableHeight: number;
        headerColor: string;
        backgroundColor: string;
        BackButton: {
          isVisible: boolean;
          onClick: (callback: () => void) => void;
          offClick: (callback: () => void) => void;
          show: () => void;
          hide: () => void;
        };
        MainButton: {
          text: string;
          color: string;
          textColor: string;
          isVisible: boolean;
          isActive: boolean;
          isProgressVisible: boolean;
          setText: (text: string) => void;
          onClick: (callback: () => void) => void;
          offClick: (callback: () => void) => void;
          show: () => void;
          hide: () => void;
          enable: () => void;
          disable: () => void;
          showProgress: (leaveActive?: boolean) => void;
          hideProgress: () => void;
          setParams: (params: { text?: string; color?: string; text_color?: string; is_active?: boolean; is_visible?: boolean }) => void;
        };
        HapticFeedback: {
          impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
          notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
          selectionChanged: () => void;
        };
        ready: () => void;
        expand: () => void;
        close: () => void;
        sendData: (data: string) => void;
        openLink: (url: string, options?: { try_instant_view?: boolean }) => void;
        openTelegramLink: (url: string) => void;
        openInvoice: (url: string, callback?: (status: string) => void) => void;
        showPopup: (params: { title?: string; message: string; buttons?: Array<{ id?: string; type?: 'default' | 'ok' | 'close' | 'cancel' | 'destructive'; text: string }> }, callback?: (id: string) => void) => void;
        showAlert: (message: string, callback?: () => void) => void;
        showConfirm: (message: string, callback?: (confirmed: boolean) => void) => void;
        showScanQrPopup: (params: { text?: string }, callback?: (data: string) => void) => void;
        closeScanQrPopup: () => void;
        readTextFromClipboard: (callback?: (text: string) => void) => void;
        requestWriteAccess: (callback?: (granted: boolean) => void) => void;
        requestContact: (callback?: (granted: boolean) => void) => void;
        onEvent: (eventType: string, eventHandler: () => void) => void;
        offEvent: (eventType: string, eventHandler: () => void) => void;
      };
    };
  }
}

export default function TelegramMiniAppPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isTelegram, setIsTelegram] = useState(false);
  const [telegramUser, setTelegramUser] = useState<any>(null);

  useEffect(() => {
    // Telegram Web App API'ni tekshirish
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      setIsTelegram(true);
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();

      // Telegram foydalanuvchi ma'lumotlarini olish
      if (tg.initDataUnsafe?.user) {
        setTelegramUser(tg.initDataUnsafe.user);
      }

      // Back button handler
      tg.BackButton.onClick(() => {
        tg.close();
      });
      tg.BackButton.show();

      // Theme'ni sozlash
      if (tg.themeParams.bg_color) {
        document.documentElement.style.setProperty('--tg-theme-bg-color', tg.themeParams.bg_color);
      }
      if (tg.themeParams.text_color) {
        document.documentElement.style.setProperty('--tg-theme-text-color', tg.themeParams.text_color);
      }
    }
  }, []);

  // Dashboard statistikalarini olish
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['dashboard', 'telegram'],
    queryFn: async () => {
      const response = await api.get('/reports/dashboard?range=month');
      return response.data;
    },
    enabled: !!user,
  });

  // Leads ro'yxatini olish
  const { data: leads } = useQuery({
    queryKey: ['leads', 'telegram'],
    queryFn: async () => {
      const response = await api.get('/leads?limit=5');
      return response.data;
    },
    enabled: !!user,
  });

  // Deals ro'yxatini olish
  const { data: deals } = useQuery({
    queryKey: ['deals', 'telegram'],
    queryFn: async () => {
      const response = await api.get('/deals?limit=5');
      return response.data;
    },
    enabled: !!user,
  });

  if (!isTelegram) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Telegram Mini-App</h1>
            <p className="text-gray-600 mb-4">
              Bu sahifa faqat Telegram ichida ishlaydi.
            </p>
            <Link href="/dashboard" className="text-primary hover:underline">
              Dashboard'ga qaytish →
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Soundz CRM</h1>
          {telegramUser && (
            <p className="text-gray-600">
              Xush kelibsiz, {telegramUser.first_name} {telegramUser.last_name || ''}!
            </p>
          )}
        </div>

        {/* Statistics */}
        {dashboardData && (
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-500">Lidlar</p>
              <p className="text-2xl font-bold text-primary mt-1">{dashboardData.leads || 0}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-500">Bitimlar</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{dashboardData.deals || 0}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-500">Mijozlar</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{dashboardData.contacts || 0}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-500">Daromad</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">
                {dashboardData.revenue?.toLocaleString('uz-UZ') || 0} UZS
              </p>
            </div>
          </div>
        )}

        {/* Recent Leads */}
        {leads && leads.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Oxirgi Lidlar</h2>
            <div className="space-y-3">
              {leads.slice(0, 5).map((lead: any) => (
                <div key={lead.id} className="border-b pb-3 last:border-b-0">
                  <p className="font-medium text-gray-900">{lead.title}</p>
                  <p className="text-sm text-gray-600">{lead.contact?.fullName || 'Noma\'lum'}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(lead.createdAt).toLocaleDateString('uz-UZ')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Deals */}
        {deals && deals.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Oxirgi Bitimlar</h2>
            <div className="space-y-3">
              {deals.slice(0, 5).map((deal: any) => (
                <div key={deal.id} className="border-b pb-3 last:border-b-0">
                  <p className="font-medium text-gray-900">{deal.title}</p>
                  <p className="text-sm text-gray-600">
                    {deal.amount?.toLocaleString('uz-UZ')} {deal.currency}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {deal.stage.replace(/_/g, ' ')} • {new Date(deal.createdAt).toLocaleDateString('uz-UZ')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Tezkor Amallar</h2>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => {
                if (window.Telegram?.WebApp) {
                  window.Telegram.WebApp.openLink(`${window.location.origin}/leads/new`);
                }
              }}
              className="bg-primary text-white px-4 py-3 rounded-lg hover:bg-opacity-90 font-medium"
            >
              + Yangi Lid
            </button>
            <button
              onClick={() => {
                if (window.Telegram?.WebApp) {
                  window.Telegram.WebApp.openLink(`${window.location.origin}/deals/new`);
                }
              }}
              className="bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-opacity-90 font-medium"
            >
              + Yangi Bitim
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

