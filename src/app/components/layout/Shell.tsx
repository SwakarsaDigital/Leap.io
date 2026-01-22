'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';

export default function Shell({ 
  children, 
  userRole, 
  isLoggedIn 
}: { 
  children: React.ReactNode, 
  userRole?: string, 
  isLoggedIn: boolean 
}) {
  const pathname = usePathname();

  // Daftar halaman yang TIDAK boleh ada Sidebar (walaupun sudah login)
  // 1. Landing Page (/)
  // 2. Login Page (/login)
  const isPublicPage = pathname === '/' || pathname === '/login';

  // Tampilkan Sidebar HANYA JIKA: User Login DAN Bukan di halaman public
  const showSidebar = isLoggedIn && !isPublicPage;

  return (
    <div className="min-h-screen flex">
      {/* Sidebar (Fixed Position) */}
      {showSidebar && <Sidebar userRole={userRole} />}

      {/* Main Content */}
      {/* Jika Sidebar aktif, beri padding kiri (pl-64) agar konten tidak tertutup sidebar */}
      <main className={`flex-1 min-h-screen relative transition-all duration-300 ${showSidebar ? 'pl-64 p-8' : ''}`}>
        {children}
      </main>
    </div>
  );
}