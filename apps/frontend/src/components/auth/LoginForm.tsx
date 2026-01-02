'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

interface LoginData {
  email: string;
  password: string;
}

export function LoginForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<LoginData>({
    email: '',
    password: '',
  });
  const [error, setError] = useState<string>('');

  const loginMutation = useMutation({
    mutationFn: async (data: LoginData) => {
      console.log('[LoginForm] Login so\'rovi yuborilmoqda...', data);
      try {
        const response = await api.post('/auth/login', data);
        console.log('[LoginForm] Login muvaffaqiyatli!', response.data);
        return response.data;
      } catch (error: any) {
        console.error('[LoginForm] Login xatosi:', error);
        console.error('[LoginForm] Xatolik ma\'lumotlari:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        });
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log('[LoginForm] onSuccess chaqirildi:', data);
      // Backend'dan kelgan token nomini tekshirish
      const token = data.accessToken || data.access_token;
      console.log('[LoginForm] Token:', token ? 'Topildi' : 'Topilmadi');
      if (token) {
        localStorage.setItem('access_token', token);
        console.log('[LoginForm] Token localStorage ga saqlandi');
        // User ma'lumotlarini cache'ga qo'shish
        queryClient.setQueryData(['me'], data.user);
        console.log('[LoginForm] Dashboard ga yo\'naltirilmoqda...');
        router.push('/dashboard');
      } else {
        console.error('[LoginForm] Token topilmadi!', data);
        setError('Token olinmadi. Qayta urinib koring.');
      }
    },
    onError: (err: any) => {
      console.error('[LoginForm] onError chaqirildi:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Email yoki parol noto\'g\'ri';
      console.error('[LoginForm] Xatolik xabari:', errorMessage);
      setError(errorMessage);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    loginMutation.mutate(formData);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="admin@soundz.uz"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Parol
          </label>
          <input
            id="password"
            type="password"
            required
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loginMutation.isPending}
          className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {loginMutation.isPending ? 'Kirilmoqda...' : 'Kirish'}
        </button>
      </form>

      <div className="mt-6 text-sm text-gray-600">
        <p className="font-semibold mb-2">Test foydalanuvchilar:</p>
        <ul className="space-y-1">
          <li>• Super Admin: admin@soundz.uz / admin123</li>
          <li>• Filial Rahbari: manager@soundz.uz / manager123</li>
          <li>• Filial Xodimi: staff@soundz.uz / staff123</li>
        </ul>
      </div>
    </div>
  );
}



