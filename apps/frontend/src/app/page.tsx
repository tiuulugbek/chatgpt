import { redirect } from 'next/navigation';
import { LoginForm } from '@/components/auth/LoginForm';

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">Soundz CRM</h1>
          <p className="text-gray-600">Tizimga kirish</p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}


