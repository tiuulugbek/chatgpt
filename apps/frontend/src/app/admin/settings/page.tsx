'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AdminGuard } from '@/components/guards/AdminGuard';
import { useAuth } from '@/hooks/useAuth';

// Barcha mavjud platformalar
const allPlatforms = [
  { id: 'INSTAGRAM_COMMENT', label: 'Instagram Izoh', icon: '📷', group: 'instagram' },
  { id: 'INSTAGRAM_DM', label: 'Instagram DM', icon: '💬', group: 'instagram' },
  { id: 'FACEBOOK_COMMENT', label: 'Facebook Izoh', icon: '👥', group: 'facebook' },
  { id: 'FACEBOOK_MESSAGE', label: 'Facebook Xabar', icon: '💬', group: 'facebook' },
  { id: 'TELEGRAM', label: 'Telegram', icon: '✈️', group: 'telegram' },
  { id: 'YOUTUBE_COMMENT', label: 'YouTube Izoh', icon: '📺', group: 'youtube' },
  { id: 'EMAIL', label: 'Email', icon: '📧', group: 'email' },
  { id: 'PHONE', label: 'Telefon Qo\'ng\'iroq', icon: '📞', group: 'phone' },
  { id: 'INTERNAL_NOTE', label: 'Ichki Izoh', icon: '📝', group: 'internal' },
];

// Platformalar guruhlari
const platformGroups = [
  { id: 'instagram', label: 'Instagram', platforms: ['INSTAGRAM_COMMENT', 'INSTAGRAM_DM'] },
  { id: 'facebook', label: 'Facebook', platforms: ['FACEBOOK_COMMENT', 'FACEBOOK_MESSAGE'] },
  { id: 'telegram', label: 'Telegram', platforms: ['TELEGRAM'] },
  { id: 'youtube', label: 'YouTube', platforms: ['YOUTUBE_COMMENT'] },
  { id: 'email', label: 'Email', platforms: ['EMAIL'] },
  { id: 'phone', label: 'Telefon', platforms: ['PHONE'] },
  { id: 'internal', label: 'Ichki Izohlar', platforms: ['INTERNAL_NOTE'] },
];

export default function AdminSettingsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      try {
        const response = await api.get('/settings');
        return response.data;
      } catch (error: any) {
        console.error('Settings endpoint xatosi:', error);
        // Agar settings endpoint ishlamasa, default qiymatlarni qaytarish
        return {
          enabledPlatforms: [
            'INSTAGRAM_COMMENT',
            'INSTAGRAM_DM',
            'FACEBOOK_COMMENT',
            'FACEBOOK_MESSAGE',
            'TELEGRAM',
            'YOUTUBE_COMMENT',
            'EMAIL',
            'PHONE',
            'INTERNAL_NOTE',
          ],
        };
      }
    },
    enabled: !!user && user.role === 'SUPER_ADMIN',
    retry: false,
  });

  const [enabledPlatforms, setEnabledPlatforms] = useState<string[]>([]);

  // Settings yuklanganda enabledPlatforms'ni o'rnatish
  useEffect(() => {
    if (settings?.enabledPlatforms) {
      setEnabledPlatforms(settings.enabledPlatforms);
    } else {
      // Default qiymatlar
      setEnabledPlatforms([
        'INSTAGRAM_COMMENT',
        'INSTAGRAM_DM',
        'FACEBOOK_COMMENT',
        'FACEBOOK_MESSAGE',
        'TELEGRAM',
        'YOUTUBE_COMMENT',
        'EMAIL',
        'PHONE',
        'INTERNAL_NOTE',
      ]);
    }
  }, [settings]);

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.patch('/settings', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
  });

  const handlePlatformToggle = (platformId: string) => {
    const newEnabledPlatforms = enabledPlatforms.includes(platformId)
      ? enabledPlatforms.filter((id) => id !== platformId)
      : [...enabledPlatforms, platformId];

    setEnabledPlatforms(newEnabledPlatforms);
    updateMutation.mutate({ enabledPlatforms: newEnabledPlatforms });
  };

  const handleGroupToggle = (groupPlatforms: string[]) => {
    const allGroupEnabled = groupPlatforms.every((id) => enabledPlatforms.includes(id));
    
    const newEnabledPlatforms = allGroupEnabled
      ? enabledPlatforms.filter((id) => !groupPlatforms.includes(id))
      : [...new Set([...enabledPlatforms, ...groupPlatforms])];

    setEnabledPlatforms(newEnabledPlatforms);
    updateMutation.mutate({ enabledPlatforms: newEnabledPlatforms });
  };

  if (isLoading) {
    return (
      <AdminGuard>
        <DashboardLayout>
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Yuklanmoqda...</div>
          </div>
        </DashboardLayout>
      </AdminGuard>
    );
  }

  return (
    <AdminGuard>
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Sozlamalar</h1>
            <p className="text-gray-600 mt-1">Tizim sozlamalarini boshqaring</p>
          </div>

          {/* Platformalar ko'rinishi */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Xabarlar Platformalari
              </h2>
              <p className="text-sm text-gray-600">
                Qaysi platformalar Messages sahifasida ko'rinishini tanlang
              </p>
            </div>

            <div className="space-y-6">
              {platformGroups.map((group) => {
                const groupPlatforms = allPlatforms.filter((p) =>
                  group.platforms.includes(p.id)
                );
                const allGroupEnabled = group.platforms.every((id) =>
                  enabledPlatforms.includes(id)
                );
                const someGroupEnabled = group.platforms.some((id) =>
                  enabledPlatforms.includes(id)
                );

                return (
                  <div key={group.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-medium text-gray-900">
                          {group.label}
                        </h3>
                        <button
                          onClick={() => handleGroupToggle(group.platforms)}
                          className={`px-3 py-1 text-sm rounded-lg transition ${
                            allGroupEnabled
                              ? 'bg-green-100 text-green-800'
                              : someGroupEnabled
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {allGroupEnabled
                            ? 'Barchasi yoqilgan'
                            : someGroupEnabled
                            ? 'Qisman yoqilgan'
                            : 'Barchasi o\'chirilgan'}
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {groupPlatforms.map((platform) => {
                        const isEnabled = enabledPlatforms.includes(platform.id);
                        return (
                          <label
                            key={platform.id}
                            className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition ${
                              isEnabled
                                ? 'border-primary bg-primary bg-opacity-5'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isEnabled}
                              onChange={() => handlePlatformToggle(platform.id)}
                              className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary"
                            />
                            <span className="text-xl">{platform.icon}</span>
                            <span
                              className={`flex-1 font-medium ${
                                isEnabled ? 'text-gray-900' : 'text-gray-500'
                              }`}
                            >
                              {platform.label}
                            </span>
                            {isEnabled && (
                              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                                Yoqilgan
                              </span>
                            )}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {updateMutation.isPending && (
              <div className="mt-4 text-sm text-gray-500">
                Sozlamalar saqlanmoqda...
              </div>
            )}
          </div>

          {/* Qo'shimcha sozlamalar */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Boshqa Sozlamalar
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">
                    Avtomatik Taqsimlash
                  </div>
                  <div className="text-sm text-gray-500">
                    Yangi lidlar avtomatik ravishda filiallarga taqsimlanadi
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings?.autoAssignEnabled || false}
                    onChange={(e) =>
                      updateMutation.mutate({ autoAssignEnabled: e.target.checked })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary peer-focus:ring-opacity-20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">
                    Bildirishnomalar
                  </div>
                  <div className="text-sm text-gray-500">
                    Yangi xabarlar va lidlar haqida bildirishnomalar
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings?.notificationEnabled !== false}
                    onChange={(e) =>
                      updateMutation.mutate({ notificationEnabled: e.target.checked })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary peer-focus:ring-opacity-20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </AdminGuard>
  );
}
