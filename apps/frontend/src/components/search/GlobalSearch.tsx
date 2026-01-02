'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export function GlobalSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const { data: searchResults, isLoading } = useQuery({
    queryKey: ['search', searchTerm],
    queryFn: async () => {
      if (!searchTerm || searchTerm.length < 2) return null;
      const response = await api.get(`/search?q=${encodeURIComponent(searchTerm)}`);
      return response.data;
    },
    enabled: searchTerm.length >= 2,
    staleTime: 30000,
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
        document.getElementById('search-input')?.focus();
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleResultClick = (type: string, id: string) => {
    setIsOpen(false);
    setSearchTerm('');
    router.push(`/${type}/${id}`);
  };

  return (
    <div className="relative">
      <div className="relative">
        <input
          id="search-input"
          type="text"
          placeholder="Qidirish... (Ctrl+K)"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="w-full md:w-96 px-4 py-2 pl-10 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          🔍
        </span>
        {searchTerm && (
          <button
            onClick={() => {
              setSearchTerm('');
              setIsOpen(false);
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        )}
      </div>

      {isOpen && searchTerm.length >= 2 && (
        <div className="absolute top-full mt-2 w-full md:w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">Qidirilmoqda...</div>
          ) : searchResults ? (
            <div>
              {searchResults.leads && searchResults.leads.length > 0 && (
                <div className="p-2">
                  <div className="text-xs font-semibold text-gray-500 px-2 py-1">Lidlar</div>
                  {searchResults.leads.map((lead: any) => (
                    <button
                      key={lead.id}
                      onClick={() => handleResultClick('leads', lead.id)}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 rounded flex items-center space-x-3"
                    >
                      <span>📋</span>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{lead.title || lead.id}</div>
                        <div className="text-sm text-gray-500">{lead.contact?.fullName || lead.contact?.phone}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {searchResults.contacts && searchResults.contacts.length > 0 && (
                <div className="p-2 border-t">
                  <div className="text-xs font-semibold text-gray-500 px-2 py-1">Mijozlar</div>
                  {searchResults.contacts.map((contact: any) => (
                    <button
                      key={contact.id}
                      onClick={() => handleResultClick('contacts', contact.id)}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 rounded flex items-center space-x-3"
                    >
                      <span>👤</span>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{contact.fullName}</div>
                        <div className="text-sm text-gray-500">{contact.phone || contact.email}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {searchResults.deals && searchResults.deals.length > 0 && (
                <div className="p-2 border-t">
                  <div className="text-xs font-semibold text-gray-500 px-2 py-1">Bitimlar</div>
                  {searchResults.deals.map((deal: any) => (
                    <button
                      key={deal.id}
                      onClick={() => handleResultClick('deals', deal.id)}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 rounded flex items-center space-x-3"
                    >
                      <span>💼</span>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{deal.title || deal.id}</div>
                        <div className="text-sm text-gray-500">{deal.amount ? `${deal.amount} so'm` : deal.status}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {(!searchResults.leads || searchResults.leads.length === 0) &&
                (!searchResults.contacts || searchResults.contacts.length === 0) &&
                (!searchResults.deals || searchResults.deals.length === 0) && (
                  <div className="p-4 text-center text-gray-500">Hech narsa topilmadi</div>
                )}
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500">Qidirish natijalari...</div>
          )}
        </div>
      )}
    </div>
  );
}

