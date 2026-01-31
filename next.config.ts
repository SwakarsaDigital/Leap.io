import type { NextConfig } from "next";
import dns from "node:dns";

// --- FIX UNTUK ERROR "ENOTFOUND" / FETCH FAILED ---
// Node.js versi 17+ terkadang lebih memprioritaskan IPv6 yang sering gagal di Windows/Localhost.
// Kode ini memaksa Node.js untuk mencari alamat IPv4 terlebih dahulu.
if (process.env.NODE_ENV === 'development') {
  try {
     dns.setDefaultResultOrder('ipv4first');
  } catch (e) {
     // Ignore if not supported in environment
  }
}

const nextConfig: NextConfig = {
  /* config options here */
  // Pastikan image hostname github diizinkan untuk avatar
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com', // Untuk Google Login
      }
    ],
  },
};

export default nextConfig;