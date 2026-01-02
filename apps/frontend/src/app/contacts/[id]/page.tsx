'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

interface ContactDetailsPageProps {
  params: {
    id: string;
  };
}

export default function ContactDetailsPage({ params }: ContactDetailsPageProps) {
  const { id } = params;
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, isLoading: authLoading } = useAuth();

  const { data: contact, isLoading: contactLoading } = useQuery({
    queryKey: ['contact', id],
    queryFn: async () => {
      const response = await api.get(`/contacts/${id}`);
      return response.data;
    },
    enabled: !!user && !!id,
  });

  if (authLoading || contactLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Yuklanmoqda...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (!user || !contact) {
    return (
      <DashboardLayout>
        <div className="text-center py-8 text-gray-500">
          Mijoz topilmadi yoki sizda huquq yo'q.
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <Link
              href="/contacts"
              className="text-primary hover:text-opacity-80 text-sm mb-2 inline-block"
            >
              ← Mijozlar ro'yxatiga qaytish
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">{contact.fullName}</h1>
            {contact.company && (
              <p className="text-gray-600 mt-1">{contact.company}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Aloqa Ma'lumotlari</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {contact.phone && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Telefon</p>
                    <a
                      href={`tel:${contact.phone}`}
                      className="text-lg font-medium text-primary hover:text-opacity-80"
                    >
                      {contact.phone}
                    </a>
                  </div>
                )}
                {contact.email && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Email</p>
                    <a
                      href={`mailto:${contact.email}`}
                      className="text-lg font-medium text-primary hover:text-opacity-80"
                    >
                      {contact.email}
                    </a>
                  </div>
                )}
                {contact.address && (
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-500 mb-1">Manzil</p>
                    <p className="text-gray-900">{contact.address}</p>
                  </div>
                )}
                {contact.company && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Kompaniya</p>
                    <p className="text-gray-900">{contact.company}</p>
                  </div>
                )}
                {contact.tin && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">INN/STIR</p>
                    <p className="text-gray-900">{contact.tin}</p>
                  </div>
                )}
                {contact.branch && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Filial</p>
                    <p className="text-gray-900">{contact.branch.name}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Notes */}
            {contact.notes && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Izohlar</h2>
                <p className="text-gray-700 whitespace-pre-wrap">{contact.notes}</p>
              </div>
            )}

            {/* Tags */}
            {contact.tags && contact.tags.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Teglar</h2>
                <div className="flex flex-wrap gap-2">
                  {contact.tags.map((tag: string, index: number) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Leads */}
            {contact.leads && contact.leads.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Lidlar</h2>
                <div className="space-y-3">
                  {contact.leads.map((lead: any) => (
                    <Link
                      key={lead.id}
                      href={`/leads/${lead.id}`}
                      className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-gray-900">{lead.title}</h3>
                          <p className="text-sm text-gray-500 mt-1">
                            {lead.status} • {lead.source}
                          </p>
                        </div>
                        <span className="text-xs text-gray-400">
                          {new Date(lead.createdAt).toLocaleDateString('uz-UZ')}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Deals */}
            {contact.deals && contact.deals.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Bitimlar</h2>
                <div className="space-y-3">
                  {contact.deals.map((deal: any) => (
                    <Link
                      key={deal.id}
                      href={`/deals/${deal.id}`}
                      className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-gray-900">{deal.title}</h3>
                          <p className="text-sm text-gray-500 mt-1">
                            {deal.stage} • {deal.amount ? `${deal.amount} ${deal.currency}` : 'Summasiz'}
                          </p>
                        </div>
                        <span className="text-xs text-gray-400">
                          {new Date(deal.createdAt).toLocaleDateString('uz-UZ')}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Messages */}
            {contact.messages && contact.messages.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Xabarlar</h2>
                <div className="space-y-3">
                  {contact.messages.map((message: any) => (
                    <div
                      key={message.id}
                      className="p-4 border border-gray-200 rounded-lg"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-medium text-gray-700">
                          {message.type}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(message.createdAt).toLocaleString('uz-UZ')}
                        </span>
                      </div>
                      <p className="text-gray-700 text-sm">{message.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Statistics */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Statistikalar</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Lidlar</span>
                  <span className="text-2xl font-bold text-gray-900">
                    {contact._count?.leads || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Bitimlar</span>
                  <span className="text-2xl font-bold text-gray-900">
                    {contact._count?.deals || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Xabarlar</span>
                  <span className="text-2xl font-bold text-gray-900">
                    {contact._count?.messages || 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Tezkor Amallar</h2>
              <div className="space-y-2">
                <Link
                  href={`/leads/new?contactId=${contact.id}`}
                  className="block w-full text-center bg-primary text-white px-4 py-2 rounded-lg hover:bg-opacity-90 text-sm font-medium"
                >
                  + Yangi Lid
                </Link>
                <Link
                  href={`/deals/new?contactId=${contact.id}`}
                  className="block w-full text-center bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-opacity-90 text-sm font-medium"
                >
                  + Yangi Bitim
                </Link>
                <Link
                  href={`/messages?contactId=${contact.id}`}
                  className="block w-full text-center bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-opacity-90 text-sm font-medium"
                >
                  Xabarlarni ko'rish
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
