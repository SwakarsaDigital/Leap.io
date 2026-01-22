'use server';

import { z } from 'zod';
import { prisma } from './prisma'; 
import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';

/**
 * 1. Schema Validasi Input (Zod)
 * Memastikan data yang masuk sesuai dengan standar keamanan sistem.
 */
const RegisterSchema = z.object({
  username: z.string()
    .min(3, "Username minimal harus 3 karakter")
    .regex(/^[a-zA-Z0-9_]+$/, "Username hanya boleh berisi huruf, angka, dan garis bawah"),
  email: z.string()
    .email("Format alamat email tidak valid"),
  password: z.string()
    .min(6, "Password minimal harus 6 karakter"),
  name: z.string()
    .min(2, "Nama lengkap harus diisi"),
  company: z.string().optional(),
  dateOfBirth: z.string().optional(),
});

/**
 * 2. Tipe Data untuk State Form
 */
export type RegisterState = {
  errors?: {
    username?: string[];
    email?: string[];
    password?: string[];
    name?: string[];
  };
  message?: string | null;
};

/**
 * 3. Fungsi Utama Server Action: registerUser
 * Dipanggil dari formulir registrasi di sisi Client.
 */
export async function registerUser(prevState: RegisterState | undefined, formData: FormData): Promise<RegisterState> {
  // A. Konversi FormData ke Object
  const rawData = Object.fromEntries(formData.entries());
  
  // B. Validasi data menggunakan Zod
  const validatedFields = RegisterSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Validasi Gagal. Mohon periksa kembali entri Anda.',
    };
  }

  const { email, password, username, name, company, dateOfBirth } = validatedFields.data;

  try {
    // C. Cek duplikasi Identitas (Email & Username)
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username }
        ]
      }
    });

    if (existingUser) {
      const field = existingUser.email === email ? 'Email' : 'Codename';
      return { message: `${field} sudah terhubung dengan identitas lain.` };
    }

    // D. Enkripsi Password menggunakan Bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    // E. Simpan User Baru ke Database
    // Sesuai Instruksi: Default ROLE adalah 'client'
    const newUser = await prisma.user.create({
      data: {
        name,
        username,
        email,
        password: hashedPassword,
        company: company || null,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        role: 'client', // DIPAKSA: Semua pendaftar baru menjadi Client
        image: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=020617&color=3b82f6`,
        
        // Inisialisasi statistik RPG (0 untuk Client)
        level: 1,
        xp: 0,
        maxXp: 1000,
        speed: 0,
        logic: 0,
        aesthetic: 0,
      },
    });

    // F. Catat ke Activity Log sistem
    await prisma.activityLog.create({
      data: {
        action: 'IDENTITY_CREATED',
        detail: `Identitas CLIENT baru dibuat untuk @${username}.`,
        userId: newUser.id,
      }
    });

    console.log(`>>> [SYSTEM] Identity established for @${username} as CLIENT.`);
    
  } catch (error) {
    console.error("Database Registration Error:", error);
    return { message: 'Gagal menghubungkan ke database. Silakan coba lagi nanti.' };
  }

  // G. Redirect ke Login setelah sukses
  redirect('/login?registered=true');
}