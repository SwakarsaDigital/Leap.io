import NextAuth, { DefaultSession } from "next-auth"
import { JWT } from "next-auth/jwt"

declare module "next-auth" {
  /**
   * Memperluas tipe 'Session' bawaan untuk menyertakan 'role' dan 'id'
   * Ini digunakan saat memanggil `auth()` atau `useSession()`
   */
  interface Session {
    user: {
      id?: string
      role?: string
    } & DefaultSession["user"]
  }

  /**
   * Memperluas tipe 'User' bawaan (yang dikembalikan dari authorize/adapter)
   */
  interface User {
    role?: string
  }
}

declare module "next-auth/jwt" {
  /**
   * Memperluas tipe 'JWT' bawaan untuk menyimpan 'role' dan 'id' di token
   */
  interface JWT {
    id?: string
    role?: string
  }
}