'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

// Message Type o'zbekcha nomlari va ikonkalari
const messageTypeConfig: Record<string, { label: string; icon: string; color: string }> = {
  INSTAGRAM_COMMENT: { label: 'Instagram Izoh', icon: '📷', color: 'bg-pink-100 text-pink-800' },
  INSTAGRAM_DM: { label: 'Instagram DM', icon: '💬', color: 'bg-pink-100 text-pink-800' },
  FACEBOOK_COMMENT: { label: 'Facebook Izoh', icon: '👥', color: 'bg-blue-100 text-blue-800' },
  FACEBOOK_MESSAGE: { label: 'Facebook Xabar', icon: '💬', color: 'bg-blue-100 text-blue-800' },
  TELEGRAM: { label: 'Telegram', icon: '✈️', color: 'bg-blue-100 text-blue-800' },
  YOUTUBE_COMMENT: { label: 'YouTube Izoh', icon: '📺', color: 'bg-red-100 text-red-800' },
  EMAIL: { label: 'Email', icon: '📧', color: 'bg-gray-100 text-gray-800' },
  PHONE_CALL: { label: 'Telefon Qo\'ng\'iroq', icon: '📞', color: 'bg-green-100 text-green-800' },
  INTERNAL_NOTE: { label: 'Ichki Izoh', icon: '📝', color: 'bg-yellow-100 text-yellow-800' },
};

export default function MessagesPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [directionFilter, setDirectionFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState<string>('');

  // API so'rov parametrlari
  const queryParams = new URLSearchParams();
  if (typeFilter !== 'all') queryParams.append('type', typeFilter);
  if (directionFilter !== 'all') queryParams.append('direction', directionFilter);

  const { data: messages, isLoading } = useQuery({
    queryKey: ['messages', typeFilter, directionFilter],
    queryFn: async () => {
      const response = await api.get(`/messages?${queryParams.toString()}`);
      return response.data;
    },
    enabled: !!user,
  });

  // Xabarni o'qilgan deb belgilash
  const markAsReadMutation = useMutation({
    mutationFn: async (messageId: string) => {
      const response = await api.patch(`/messages/${messageId}/read`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
  });

  // Javob berish
  const replyMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/messages', data);
      return response.data;
    },
    onSuccess: () => {
      setReplyContent('');
      setSelectedMessage(null);
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
  });

  // Qidiruv natijalarini filtrlash
  const filteredMessages = messages?.filter((message: any) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      message.content?.toLowerCase().includes(query) ||
      message.contact?.fullName?.toLowerCase().includes(query) ||
      message.contact?.phone?.includes(query)
    );
  }) || [];

  // O'qilmagan xabarlar soni
  const unreadCount = filteredMessages.filter((m: any) => !m.isRead).length;

  const handleReply = (message: any) => {
    if (!replyContent.trim()) return;

    replyMutation.mutate({
      type: message.type,
      direction: 'OUTBOUND',
      content: replyContent,
      contactId: message.contactId,
      leadId: message.leadId,
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Xabarlar</h1>
            <p className="text-gray-600 mt-1">
              Barcha kanallardan kelgan xabarlar
              {unreadCount > 0 && (
                <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                  {unreadCount} o'qilmagan
                </span>
              )}
            </p>
          </div>
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
                placeholder="Xabar matni, mijoz..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Type filtri */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Platforma
              </label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">Barchasi</option>
                {Object.entries(messageTypeConfig).map(([value, config]) => (
                  <option key={value} value={value}>
                    {config.icon} {config.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Direction filtri */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Yo'nalish
              </label>
              <select
                value={directionFilter}
                onChange={(e) => setDirectionFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">Barchasi</option>
                <option value="INBOUND">Mijozdan kelgan</option>
                <option value="OUTBOUND">Mijozga yuborilgan</option>
              </select>
            </div>
          </div>
        </div>

        {/* Xabarlar ro'yxati */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="text-gray-500">Yuklanmoqda...</div>
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">💬</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Hozircha xabarlar mavjud emas
            </h3>
            <p className="text-gray-600">
              Ijtimoiy tarmoqlar integratsiyasi sozlangandan keyin xabarlar shu yerda ko'rinadi
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Xabarlar ro'yxati */}
            <div className="lg:col-span-2 space-y-4">
              {filteredMessages.map((message: any) => {
                const typeConfig = messageTypeConfig[message.type] || {
                  label: message.type,
                  icon: '💬',
                  color: 'bg-gray-100 text-gray-800',
                };

                return (
                  <div
                    key={message.id}
                    className={`bg-white rounded-lg shadow p-6 cursor-pointer transition ${
                      !message.isRead ? 'border-l-4 border-primary' : ''
                    } ${selectedMessage === message.id ? 'ring-2 ring-primary' : ''}`}
                    onClick={() => {
                      setSelectedMessage(message.id);
                      if (!message.isRead) {
                        markAsReadMutation.mutate(message.id);
                      }
                    }}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{typeConfig.icon}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900">
                              {message.contact?.fullName || 'Noma\'lum mijoz'}
                            </span>
                            {!message.isRead && (
                              <span className="w-2 h-2 bg-primary rounded-full"></span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span
                              className={`px-2 py-1 text-xs font-semibold rounded-full ${typeConfig.color}`}
                            >
                              {typeConfig.label}
                            </span>
                            {message.direction === 'INBOUND' ? (
                              <span className="text-xs text-gray-500">← Kelgan</span>
                            ) : (
                              <span className="text-xs text-gray-500">→ Yuborilgan</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-gray-400">
                        {new Date(message.createdAt).toLocaleString('uz-UZ', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <p className="text-gray-700 mb-3 whitespace-pre-wrap">
                      {message.content}
                    </p>

                    {message.contact && (
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        {message.contact.phone && (
                          <span>📞 {message.contact.phone}</span>
                        )}
                        {message.lead && (
                          <Link
                            href={`/leads/${message.lead.id}`}
                            className="text-primary hover:text-opacity-80"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Lidni ko'rish →
                          </Link>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Javob berish paneli */}
            <div className="lg:col-span-1">
              {selectedMessage && (
                <div className="bg-white rounded-lg shadow p-6 sticky top-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Javob berish
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Javob matni
                      </label>
                      <textarea
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        rows={6}
                        placeholder="Javob yozing..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <button
                      onClick={() => {
                        const message = filteredMessages.find(
                          (m: any) => m.id === selectedMessage
                        );
                        if (message) handleReply(message);
                      }}
                      disabled={!replyContent.trim() || replyMutation.isPending}
                      className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {replyMutation.isPending ? 'Yuborilmoqda...' : 'Javob yuborish'}
                    </button>
                    <button
                      onClick={() => {
                        setSelectedMessage(null);
                        setReplyContent('');
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      Bekor qilish
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Statistikalar */}
        {filteredMessages.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-500 mb-1">Jami Xabarlar</div>
              <div className="text-3xl font-bold text-gray-900">
                {filteredMessages.length}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-500 mb-1">O'qilmagan</div>
              <div className="text-3xl font-bold text-red-600">{unreadCount}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-500 mb-1">Kelgan</div>
              <div className="text-3xl font-bold text-blue-600">
                {filteredMessages.filter((m: any) => m.direction === 'INBOUND').length}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-500 mb-1">Yuborilgan</div>
              <div className="text-3xl font-bold text-green-600">
                {filteredMessages.filter((m: any) => m.direction === 'OUTBOUND').length}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
