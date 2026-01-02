import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Debug: API URL'ni console'ga chiqarish
if (typeof window !== 'undefined') {
  console.log('[API] API URL:', API_URL);
}

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - token qo'shish va debug
api.interceptors.request.use(
  (config) => {
    // Debug: So'rov URL'ni ko'rsatish
    if (typeof window !== 'undefined') {
      console.log('[API] So\'rov URL:', config.baseURL + config.url);
      
      // Token olish - localStorage yoki cookie'dan
      let token = localStorage.getItem('access_token');
      
      // Agar localStorage'da token yo'q bo'lsa, cookie'dan olishga harakat qilish
      if (!token) {
        const cookies = document.cookie.split(';');
        const tokenCookie = cookies.find(c => c.trim().startsWith('access_token='));
        if (tokenCookie) {
          token = tokenCookie.split('=')[1];
        }
      }
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - xatoliklarni boshqarish
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - login sahifasiga yo'naltirish
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

export default api;



