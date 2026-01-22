import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  // 1. Definisikan halaman kustom
  pages: {
    signIn: '/login', // Mengarahkan user yang belum login ke sini
  },
  
  callbacks: {
    /**
     * Callback Authorized: 
     * Satpam utama yang mengecek setiap request halaman.
     */
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const userRole = (auth?.user as any)?.role; // Ambil role (captain/freelancer)

      // Tentukan grup rute
      const isOnCaptainBridge = nextUrl.pathname.startsWith('/captain');
      const isOnDashboard = 
        nextUrl.pathname.startsWith('/guild') || 
        nextUrl.pathname.startsWith('/quests') || 
        nextUrl.pathname.startsWith('/lab');
      
      const isAuthPage = nextUrl.pathname === '/login' || nextUrl.pathname === '/register';

      // LOGIKA PROTEKSI:
      
      // 1. Proteksi Halaman Captain (Admin Only)
      if (isOnCaptainBridge) {
        if (isLoggedIn) {
          if (userRole === 'captain') return true; 
          // Jika sudah login tapi bukan captain, lempar ke Guild Hall (cegah loop redirect)
          return Response.redirect(new URL('/guild', nextUrl));
        }
        return false; // Belum login, redirect ke /login
      }

      // 2. Proteksi Dashboard Umum (Butuh Login)
      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // Belum login, redirect ke /login
      }

      // 3. Redirect User yang sudah login agar tidak bisa akses halaman Login/Register
      if (isLoggedIn && isAuthPage) {
        return Response.redirect(new URL('/guild', nextUrl));
      }

      // Halaman publik lainnya diizinkan
      return true;
    },

    /**
     * Callback JWT: 
     * Dipanggil saat token JWT dibuat/diperbarui.
     * Kita memasukkan role ke dalam token di sini.
     */
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.id = user.id;
      }
      return token;
    },

    /**
     * Callback Session: 
     * Memindahkan data dari JWT (token) ke objek session (yang dibaca browser).
     */
    async session({ session, token }) {
      if (session.user && token.role) {
        session.user.role = token.role as string;
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  
  // Providers dibiarkan kosong di sini karena akan diisi di file auth.ts
  providers: [], 
} satisfies NextAuthConfig;