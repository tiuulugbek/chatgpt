'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'SUPER_ADMIN' | 'BRANCH_MANAGER' | 'BRANCH_STAFF' | 'MARKETING' | 'SUPPORT';
  branchId?: string;
  branch?: any;
}

export function useAuth() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { data: userData, isLoading: isFetching } = useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const response = await api.get('/auth/me');
      return response.data;
    },
    retry: false,
    enabled: typeof window !== 'undefined' && !!localStorage.getItem('access_token'),
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const token = localStorage.getItem('access_token');
    if (!token) {
      setIsLoading(false);
      return;
    }

    if (userData) {
      setUser(userData);
      setIsLoading(false);
    } else if (!isFetching) {
      setIsLoading(false);
    }
  }, [userData, isFetching]);

  const logout = () => {
    localStorage.removeItem('access_token');
    setUser(null);
    router.push('/');
  };

  const isAdmin = user?.role === 'SUPER_ADMIN';
  const isBranchManager = user?.role === 'BRANCH_MANAGER';
  const isBranchStaff = user?.role === 'BRANCH_STAFF';

  return {
    user,
    isLoading,
    logout,
    isAdmin,
    isBranchManager,
    isBranchStaff,
    isAuthenticated: !!user,
  };
}

