'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function MessagesPage() {
  const { data: messages, isLoading } = useQuery({
    queryKey: ['messages'],
    queryFn: async () => {
      const response = await api.get('/messages');
      return response.data;
    },
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Xabarlar</h1>

        {isLoading ? (
          <div className="text-center py-8">Yuklanmoqda...</div>
        ) : (
          <div className="bg-white rounded-lg shadow">
            <div className="divide-y divide-gray-200">
              {messages?.map((message: any) => (
                <div
                  key={message.id}
                  className="p-6 hover:bg-gray-50 transition"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-sm font-medium text-gray-900">
                          {message.contact?.fullName || 'Noma\'lum'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {message.type}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{message.content}</p>
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(message.createdAt).toLocaleString('uz-UZ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}



