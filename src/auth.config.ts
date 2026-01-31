import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  // 1. Definisikan halaman kustom
  pages: {
    signIn: '/login', // Mengarahkan user yang belum login ke sini
    newUser: '/register',
  },
  
  callbacks: {
    /**
     * Callback Authorized: 
     * Satpam utama yang mengecek setiap request halaman.
     */
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      // Menggunakan 'as any' sementara untuk menghindari error type jika interface User belum diupdate
      const userRole = (auth?.user as any)?.role; 

      // Tentukan grup rute
      const isOnCaptainBridge = nextUrl.pathname.startsWith('/captain');
      
      const isOnDashboard = 
        nextUrl.pathname.startsWith('/guild') || 
        nextUrl.pathname.startsWith('/quests') || 
        nextUrl.pathname.startsWith('/lab') ||
        nextUrl.pathname.startsWith('/client'); // Ditambahkan agar area Client juga terproteksi
      
      const isAuthPage = nextUrl.pathname === '/login' || nextUrl.pathname === '/register';

      // LOGIKA PROTEKSI:
      
      // 1. Proteksi Halaman Captain (Admin Only)
      if (isOnCaptainBridge) {
        if (isLoggedIn) {
          // Cek role (support uppercase/lowercase untuk keamanan)
          if (userRole === 'captain' || userRole === 'CAPTAIN') return true; 
          
          // Jika sudah login tapi bukan captain, lempar ke Guild Hall (cegah loop redirect)
          return Response.redirect(new URL('/guild', nextUrl));
        }
        return false; // Belum login, redirect ke /login handled by NextAuth
      }

      // 2. Proteksi Dashboard Umum (Butuh Login)
      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // Belum login, redirect ke /login
      }

      // 3. Redirect User yang sudah login agar tidak bisa akses halaman Login/Register
      if (isLoggedIn && isAuthPage) {
        // Redirect cerdas berdasarkan role
        if (userRole === 'captain' || userRole === 'CAPTAIN') {
          return Response.redirect(new URL('/captain', nextUrl));
        }
        if (userRole === 'CLIENT') {
          return Response.redirect(new URL('/client', nextUrl));
        }
        // Default untuk Freelancer
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
        (session.user as any).role = token.role as string;
        (session.user as any).id = token.id as string;
      }
      return session;
    },
  },
  
  // Providers dibiarkan kosong di sini karena akan diisi di file auth.ts
  providers: [], 
} satisfies NextAuthConfig;