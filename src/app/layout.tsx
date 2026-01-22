import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { auth } from '../auth'; // Import auth dari root (sesuaikan path jika perlu, misal '@/auth')
import Shell from './components/layout/Shell'; // Import Shell Wrapper

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Leap.io | Build Apps Faster',
  description: 'AI Project Management & Gamification Platform',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1. Ambil session user saat ini di Server
  const session = await auth();
  
  // 2. Ekstrak data status login & role
  const isLoggedIn = !!session?.user;
  const userRole = session?.user?.role;

  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-950 text-slate-200`}>
        {/* 3. Gunakan Shell sebagai wrapper utama.
          Shell akan menangani logika:
          - Menampilkan Sidebar jika user login & bukan di halaman public
          - Mengatur padding konten
        */}
        <Shell isLoggedIn={isLoggedIn} userRole={userRole}>
          {children}
        </Shell>
      </body>
    </html>
  );
}