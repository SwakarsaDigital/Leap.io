import NextAuth from 'next-auth';
import { authConfig } from './auth.config';

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const userRole = req.auth?.user?.role; // Asumsi role tersimpan di session
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
    if (path.startsWith('/client') && userRole !== 'client') {
      // Jika bukan client, kembalikan ke dashboard yang benar
      const target = userRole === 'captain' ? '/captain' : '/guild';
      return Response.redirect(new URL(target, nextUrl));
    }

    // b. Proteksi Halaman Captain
    if (path.startsWith('/captain') && userRole !== 'captain') {
      const target = userRole === 'client' ? '/client' : '/guild';
      return Response.redirect(new URL(target, nextUrl));
    }

    // c. Proteksi Halaman Guild (Freelancer) - Opsional: Apakah Captain boleh intip?
    // Disini kita buat ketat: Hanya freelancer yang boleh di /guild root, 
    // tapi mungkin Captain butuh akses di masa depan. Untuk sekarang kita strict.
    if (path.startsWith('/guild') && userRole !== 'freelancer' && userRole !== 'captain') { // Captain usually has supervision rights
       if (userRole === 'client') return Response.redirect(new URL('/client', nextUrl));
    }
  }

  return;
});

export const config = {
  // Matcher untuk menentukan route mana yang kena middleware
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};