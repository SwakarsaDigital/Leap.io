import NextAuth from 'next-auth';
import { authConfig } from './auth.config';

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  // Ubah role menjadi UPPERCASE agar selalu cocok dengan enum Prisma (CAPTAIN, CLIENT, GUILD)
  const userRole = req.auth?.user?.role?.toUpperCase(); 
  const { nextUrl } = req;
  const path = nextUrl.pathname;

  // 1. Redirect jika belum login tapi mencoba akses halaman private
  const isPrivatePath = path.startsWith('/client') || path.startsWith('/captain') || path.startsWith('/guild');
  
  if (isPrivatePath && !isLoggedIn) {
    return Response.redirect(new URL('/login', nextUrl));
  }

  // 2. Role-Based Access Control (RBAC)
  // Cegah user masuk ke dashboard yang salah
  if (isLoggedIn) {
    // a. Proteksi Halaman Client
    if (path.startsWith('/client') && userRole !== 'CLIENT') {
      // Jika bukan client, kembalikan ke dashboard yang benar
      const target = userRole === 'CAPTAIN' ? '/captain' : '/guild';
      return Response.redirect(new URL(target, nextUrl));
    }

    // b. Proteksi Halaman Captain
    if (path.startsWith('/captain') && userRole !== 'CAPTAIN') {
      const target = userRole === 'CLIENT' ? '/client' : '/guild';
      return Response.redirect(new URL(target, nextUrl));
    }

    // c. Proteksi Halaman Guild (Freelancer) - Opsional: Apakah Captain boleh intip?
    // Disini kita buat ketat: Hanya GUILD (freelancer) dan CAPTAIN yang boleh di /guild root
    if (path.startsWith('/guild') && userRole !== 'GUILD' && userRole !== 'CAPTAIN') { 
       if (userRole === 'CLIENT') {
           return Response.redirect(new URL('/client', nextUrl));
       }
    }
  }

  return;
});

export const config = {
  // Matcher untuk menentukan route mana yang kena middleware
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};