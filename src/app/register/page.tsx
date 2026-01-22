'use server';

import { prisma } from './../lib/prisma';
import { redirect } from 'next/navigation';

/**
 * Interface untuk struktur state return
 */
interface RegisterState {
  message?: string | null;
  errors?: {
    name?: string[];
    username?: string[];
    email?: string[];
    password?: string[];
  };
}

/**
 * Server Action untuk mendaftarkan pengguna baru.
 * DIPERBARUI: Sekarang memaksa peran menjadi 'client' untuk semua pendaftar.
 */
export async function registerUser(prevState: RegisterState | undefined, formData: FormData): Promise<RegisterState> {
  const name = formData.get('name') as string;
  const username = formData.get('username') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const company = formData.get('company') as string;

  // Validasi Sederhana
  if (!email || !password || !name || !username) {
    return { message: "Harap isi semua kolom identitas wajib." };
  }

  if (password.length < 6) {
    return { message: "Password minimal harus 6 karakter." };
  }

  try {
    // 1. Cek duplikasi identitas
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }]
      }
    });

    if (existingUser) {
      return { message: "Email atau Codename sudah terdaftar di sistem." };
    }

    // 2. Buat User Baru (Selalu 'client')
    const newUser = await prisma.user.create({
      data: {
        name,
        username,
        email,
        password, // Disarankan menggunakan hashing bcrypt di lingkungan produksi
        role: 'client', // DIPAKSA: Semua pendaftar baru adalah Client
        company: company || null,
        // Inisialisasi Stats RPG Dasar (0 untuk Client)
        level: 1,
        xp: 0,
        maxXp: 100,
        speed: 0,
        logic: 0,
        aesthetic: 0,
      }
    });

    // 3. Catat Log Inisialisasi
    await prisma.activityLog.create({
      data: {
        action: 'IDENTITY_INITIALIZED',
        detail: `Agen baru @${username} telah terdaftar sebagai CLIENT.`,
        userId: newUser.id,
      }
    });

  } catch (error) {
    console.error("Uplink Error:", error);
    return { message: "Gagal menghubungkan ke database. Silakan coba lagi." };
  }

  // Sukses: Arahkan ke login
  redirect('/login?registered=true');
}