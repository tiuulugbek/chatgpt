import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin', 'cyrillic'] });

export const metadata: Metadata = {
  title: 'Soundz CRM',
  description: 'CRM tizimi - Mijozlar bilan munosabatlarni boshqarish',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uz">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}



