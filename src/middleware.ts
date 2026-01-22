import NextAuth from 'next-auth';
import { authConfig } from './auth.config';

// 1. Inisialisasi NextAuth dengan konfigurasi
const { auth } = NextAuth(authConfig);

/**
 * Next.js terkadang gagal mendeteksi fungsi jika diekspor langsung dari objek.
 * Dengan membungkusnya dalam fungsi default, Next.js/Turbopack akan 
 * mengenalinya dengan pasti sebagai middleware.
 */
export default auth((req) => {
  // Anda bisa menambahkan logika tambahan di sini jika diperlukan nantinya
});

export const config = {
  /**
   * Matcher untuk menyaring rute.
   * Memastikan middleware tidak berjalan di file statis atau API internal.
   */
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};