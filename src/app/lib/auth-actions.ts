'use server';

import { signIn, signOut } from '../../auth';
import { AuthError } from 'next-auth';

// Authenticate user
export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    // Mengubah FormData menjadi object agar kita bisa menyisipkan properti redirectTo
    const data = Object.fromEntries(formData);

    await signIn('credentials', {
      ...data,
      redirectTo: '/', // PENTING: Redirect ke landing page ('/') setelah login berhasil
    });
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
  // PENTING: Redirect ke landing page ('/') setelah logout
  await signOut({ redirectTo: '/' });
}