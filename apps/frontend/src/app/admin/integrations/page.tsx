'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AdminGuard } from '@/components/guards/AdminGuard';
import { useAuth } from '@/hooks/useAuth';

interface IntegrationFormData {
  [key: string]: any;
}

export default function AdminIntegrationsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activePlatform, setActivePlatform] = useState<string | null>(null);
  const [formData, setFormData] = useState<IntegrationFormData>({});
  const [testResult, setTestResult] = useState<any>(null);

  const { data: integrations, isLoading } = useQuery({
    queryKey: ['integrations'],
    queryFn: async () => {
      const response = await api.get('/integrations/settings');
      return response.data;
    },
    enabled: !!user && user.role === 'SUPER_ADMIN',
  });

  const updateMutation = useMutation({
    mutationFn: async ({ platform, data }: { platform: string; data: any }) => {
      const response = await api.patch(`/integrations/${platform}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      setTestResult(null);
    },
  });

  const testMutation = useMutation({
    mutationFn: async (platform: string) => {
      const response = await api.post(`/integrations/${platform}/test`);
      return response.data;
    },
    onSuccess: (data) => {
      setTestResult(data);
    },
  });

  const handleOpenModal = (platform: string) => {
    setActivePlatform(platform);
    const integration = integrations?.[platform];
    const platformConfig = platforms.find((p) => p.id === platform);
    
    // Mavjud sozlamalarni formData'ga yuklash
    const initialData: any = {};
    if (platformConfig) {
      platformConfig.fields.forEach((field) => {
        if (field.key === 'accessToken' && integration?.hasToken) {
          initialData[field.key] = '••••••••'; // Masked value
        } else if (field.key === 'appSecret' && integration?.hasSecret) {
          initialData[field.key] = '••••••••'; // Masked value
        } else if (field.key === 'botToken' && integration?.hasToken) {
          initialData[field.key] = '••••••••'; // Masked value
        } else if (field.key === 'apiKey' && integration?.hasApiKey) {
          initialData[field.key] = '••••••••'; // Masked value
        } else if (integration && integration[field.key]) {
          initialData[field.key] = integration[field.key];
        }
      });
    }
    
    setFormData(initialData);
    setTestResult(null);
  };

  const handleCloseModal = () => {
    setActivePlatform(null);
    setFormData({});
    setTestResult(null);
  };

  const handleSubmit = (e: React.FormEvent, platform: string) => {
    e.preventDefault();
    
    // Masked qiymatlarni olib tashlash
    const cleanData: any = {};
    Object.keys(formData).forEach((key) => {
      if (formData[key] && formData[key] !== '••••••••') {
        cleanData[key] = formData[key];
      }
    });
    
    updateMutation.mutate({ platform, data: cleanData });
  };

  const handleTest = (platform: string) => {
    testMutation.mutate(platform);
  };

  const platforms = [
    {
      id: 'instagram',
      name: 'Instagram',
      icon: '📷',
      description: 'Instagram Graph API integratsiyasi - izohlar va DM\'larni boshqarish',
      fields: [
        { key: 'appId', label: 'App ID', type: 'text', placeholder: 'Instagram App ID' },
        { key: 'appSecret', label: 'App Secret', type: 'password', placeholder: 'Instagram App Secret' },
        { key: 'accessToken', label: 'Access Token', type: 'password', placeholder: 'Instagram Access Token' },
      ],
    },
    {
      id: 'facebook',
      name: 'Facebook',
      icon: '👥',
      description: 'Facebook Graph API integratsiyasi - xabarlar va izohlarni boshqarish',
      fields: [
        { key: 'appId', label: 'App ID', type: 'text', placeholder: 'Facebook App ID' },
        { key: 'appSecret', label: 'App Secret', type: 'password', placeholder: 'Facebook App Secret' },
        { key: 'accessToken', label: 'Access Token', type: 'password', placeholder: 'Facebook Access Token' },
        { key: 'pageId', label: 'Page ID', type: 'text', placeholder: 'Facebook Page ID' },
      ],
    },
    {
      id: 'telegram',
      name: 'Telegram',
      icon: '✈️',
      description: 'Telegram Bot API integratsiyasi - bot orqali xabarlarni qabul qilish',
      fields: [
        { key: 'botToken', label: 'Bot Token', type: 'password', placeholder: 'Telegram Bot Token' },
        { key: 'webhookUrl', label: 'Webhook URL', type: 'text', placeholder: 'https://yourdomain.com/api/telegram/webhook' },
      ],
    },
    {
      id: 'youtube',
      name: 'YouTube',
      icon: '📺',
      description: 'YouTube Data API integratsiyasi - izohlarni boshqarish',
      fields: [
        { key: 'apiKey', label: 'API Key', type: 'password', placeholder: 'YouTube Data API Key' },
        { key: 'channelId', label: 'Channel ID', type: 'text', placeholder: 'YouTube Channel ID' },
      ],
    },
    {
      id: 'googleMaps',
      name: 'Google Maps',
      icon: '🗺️',
      description: 'Google Maps Reviews integratsiyasi - sharhlarni olish',
      fields: [
        { key: 'apiKey', label: 'API Key', type: 'password', placeholder: 'Google Maps API Key' },
        { key: 'placeIds', label: 'Place ID\'lar (vergul bilan ajratilgan)', type: 'text', placeholder: 'ChIJ...' },
      ],
    },
    {
      id: 'yandexMaps',
      name: 'Yandex Maps',
      icon: '🗺️',
      description: 'Yandex Maps Reviews integratsiyasi - sharhlarni olish',
      fields: [
        { key: 'apiKey', label: 'API Key', type: 'password', placeholder: 'Yandex Maps API Key' },
        { key: 'orgIds', label: 'Organization ID\'lar (vergul bilan ajratilgan)', type: 'text', placeholder: '123456789' },
      ],
    },
  ];

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
            <h1 className="text-3xl font-bold text-gray-900">Integratsiyalar</h1>
            <p className="text-gray-600 mt-1">Ijtimoiy tarmoqlar va xizmatlar bilan integratsiyalarni sozlang</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {platforms.map((platform) => {
              const integration = integrations?.[platform.id];
              const isEnabled = integration?.enabled || false;

              return (
                <div
                  key={platform.id}
                  className={`bg-white rounded-lg shadow-lg p-6 border-2 transition ${
                    isEnabled ? 'border-green-500' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-4xl">{platform.icon}</span>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{platform.name}</h3>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            isEnabled
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {isEnabled ? 'Faol' : 'Nofaol'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-4">{platform.description}</p>

                  <div className="space-y-2">
                    <button
                      onClick={() => handleOpenModal(platform.id)}
                      className="w-full bg-primary text-white px-4 py-2 rounded-lg hover:bg-opacity-90 text-sm font-medium"
                    >
                      {isEnabled ? 'Sozlamalarni yangilash' : 'Sozlash'}
                    </button>
                    {isEnabled && (
                      <button
                        onClick={() => handleTest(platform.id)}
                        disabled={testMutation.isPending}
                        className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium disabled:opacity-50"
                      >
                        {testMutation.isPending ? 'Test qilinmoqda...' : '🔍 Test qilish'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Modal */}
          {activePlatform && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">
                      {platforms.find((p) => p.id === activePlatform)?.name} Sozlamalari
                    </h2>
                    <button
                      onClick={handleCloseModal}
                      className="text-gray-400 hover:text-gray-600 text-2xl"
                    >
                      ×
                    </button>
                  </div>

                  <form
                    onSubmit={(e) => handleSubmit(e, activePlatform)}
                    className="space-y-4"
                  >
                    {platforms
                      .find((p) => p.id === activePlatform)
                      ?.fields.map((field) => {
                        const currentValue = formData[field.key] || '';
                        const isMasked = currentValue === '••••••••';
                        const integration = integrations?.[activePlatform];
                        
                        return (
                          <div key={field.key}>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              {field.label}
                              {isMasked && (
                                <span className="ml-2 text-xs text-gray-500">
                                  (mavjud sozlama - yangi qiymat kiriting)
                                </span>
                              )}
                            </label>
                            {field.key === 'placeIds' || field.key === 'orgIds' ? (
                              <textarea
                                value={Array.isArray(currentValue) ? currentValue.join(', ') : currentValue}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    [field.key]: e.target.value,
                                  })
                                }
                                placeholder={field.placeholder}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                rows={3}
                              />
                            ) : (
                              <div>
                                <input
                                  type={field.type}
                                  value={isMasked ? '' : currentValue}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      [field.key]: e.target.value,
                                    })
                                  }
                                  placeholder={
                                    isMasked
                                      ? 'Yangi qiymat kiriting yoki bo\'sh qoldiring'
                                      : field.placeholder
                                  }
                                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                                {isMasked && (
                                  <p className="mt-1 text-xs text-gray-500">
                                    Mavjud sozlama saqlanadi, agar yangi qiymat kiritmasangiz
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}

                    {testResult && (
                      <div
                        className={`p-4 rounded-lg ${
                          testResult.success
                            ? 'bg-green-50 border border-green-200 text-green-700'
                            : 'bg-red-50 border border-red-200 text-red-700'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <span className="text-xl">
                            {testResult.success ? '✅' : '❌'}
                          </span>
                          <div className="flex-1">
                            <p className="font-medium">{testResult.message}</p>
                            {testResult.data && (
                              <details className="mt-2">
                                <summary className="cursor-pointer text-sm font-medium">
                                  Batafsil ma'lumot
                                </summary>
                                <pre className="mt-2 text-xs overflow-auto bg-white p-2 rounded border">
                                  {JSON.stringify(testResult.data, null, 2)}
                                </pre>
                              </details>
                            )}
                            {testResult.error && (
                              <details className="mt-2">
                                <summary className="cursor-pointer text-sm font-medium">
                                  Xatolik ma'lumotlari
                                </summary>
                                <pre className="mt-2 text-xs overflow-auto bg-white p-2 rounded border">
                                  {JSON.stringify(testResult.error, null, 2)}
                                </pre>
                              </details>
                            )}
                          </div>
                        </div>
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
                        disabled={updateMutation.isPending}
                        className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {updateMutation.isPending ? 'Saqlanmoqda...' : 'Saqlash'}
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
