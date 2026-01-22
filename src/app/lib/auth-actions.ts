// app/lib/auth-actions.ts
'use server';

import { signIn, signOut } from '../../auth'; // Import dari file auth.ts yang baru kita buat
import { AuthError } from 'next-auth';

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    // Memanggil fungsi signIn bawaan NextAuth
    // 'credentials' sesuai dengan provider yang kita set di auth.ts
    await signIn('credentials', formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials. User not found.';
        default:
          return 'Something went wrong.';
      }
    }
    throw error;
  }
}

export async function logout() {
  await signOut();
}