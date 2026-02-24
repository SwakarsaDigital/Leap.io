<p align="center">🐸 <b>Leap.io - Gamified SaaS Platform v4.2</b></p>

<p align="center">
<img src="https://www.google.com/search?q=https://img.shields.io/badge/Version-4.2.0--STABLE-green%3Fstyle%3Dfor-the-badge%26logo%3Dprobot" alt="Version" />
<img src="https://www.google.com/search?q=https://img.shields.io/badge/Framework-Next.js%252015-black%3Fstyle%3Dfor-the-badge%26logo%3Dnext.js" alt="Framework" />
<img src="https://www.google.com/search?q=https://img.shields.io/badge/Database-PostgreSQL-blue%3Fstyle%3Dfor-the-badge%26logo%3Dpostgresql" alt="Database" />
<img src="https://www.google.com/search?q=https://img.shields.io/badge/Auth-NextAuth.js%2520v5-764ABC%3Fstyle%3Dfor-the-badge%26logo%3Dauth0" alt="Auth" />
</p>

🌐 Overview

Leap.io adalah platform manajemen proyek revolusioner yang menggabungkan elemen RPG (Role-Playing Game) dengan alur kerja profesional. Platform ini dirancang secara taktis untuk memisahkan dan mensinergikan peran antara Client, Freelancer, dan Captain (Project Manager) dalam satu ekosistem yang imersif.

🛠️ Arsitektur Teknologi & Spesifikasi

Komponen

Teknologi

Frontend

Next.js 15 (App Router), Tailwind CSS, Lucide Icons

Backend

Server Actions, Prisma ORM

Database

PostgreSQL (Deployed via Supabase/Neon)

Autentikasi

NextAuth.js v5 (Identity & Role Protection)

Animasi

Tailwind Animate & CSS Keyframes (Marquee effect)

🚀 Fitur Utama (System Modules)

🎭 1. Sistem Identitas & RPG (Identity Protocol)

Multi-Role Hierarchy: Pemisahan akses ketat dan aman antara Client, Freelancer, dan Captain.

Onboarding Path: Alur pemilihan "Class" (misal: Frontend Paladin, Backend Necromancer) untuk inisialisasi statistik karakter.

RPG Analytics: Dashboard statistik dinamis (Logic, Speed, Aesthetic) yang berkembang seiring penyelesaian proyek.

Leveling Engine: Akumulasi XP otomatis untuk "Level Up" dengan kurva kesulitan yang meningkat secara algoritmik.

🤖 2. AI Recruitment & Lab

AI Recruiter: Antarmuka terminal cerdas untuk pemindaian database talenta elit berdasarkan kebutuhan misi spesifik.

The AI Lab: Ruang konsultasi arsitektur untuk memvalidasi logika sistem sebelum fase coding dimulai.

Uplink Synchronization: Deteksi agen (freelancer) aktif secara real-time di pangkalan data.

⚔️ 3. Quest Board (Kanban Operations)

Tactical Board: Kanban board interaktif dengan status alur kerja: To Do → In Combat → Loot Drop → Completed.

Proof of Work Protocol: Kewajiban melampirkan GitHub Commit dan Video Demo (Loom/Youtube) sebelum klaim reward/XP.

Optimistic Sync: Perubahan status instan tanpa refresh halaman untuk pengalaman pengguna yang sangat mulus (High-Performance UX).

🛰️ 4. Protokol Komunikasi (Direct Uplink)

Unified Chat System: Jalur komunikasi terenkripsi yang tersimpan permanen di database Prisma.

Active Uplinks Sidebar: Navigasi cerdas yang mendeteksi partner chat terbaru untuk kelanjutan koordinasi instan.

Security Shield: Saluran khusus antara Captain dan Client untuk proteksi operasional tingkat tinggi.

❄️ 5. Cryosleep Chamber (Passive Income)

Stasis Mode: Fitur manajemen proyek jangka panjang yang menghasilkan Retainer Fee bulanan.

Emergency Summon: Mekanisme "mencairkan" proyek dari stasis dengan tarif darurat (Emergency Rate) saat dibutuhkan segera.

📂 Struktur Data & Intelijen (Prisma Schema)

User: Pusat profil, role, kredenisial, dan statistik RPG.

Project: Entitas operasional proyek dan status Cryosleep.

Quest: Unit tugas teknis, reward XP, dan bukti penyelesaian (Loot).

Message: Jalur transmisi data komunikasi antar agen.

ActivityLog: Rekam jejak aktivitas intelijen seluruh sistem (Audit Trail).

📜 Log Operasi Terakhir (Last Sync)

[!IMPORTANT]
Update v4.2.0 Highlights:

Navigation Fix: Perbaikan Duplicate Key Error pada sidebar menggunakan ID unik.

Direct Uplinks: Integrasi navigasi chat langsung ke menu utama sidebar untuk akses cepat.

Path Stability: Standarisasi rute menggunakan @/ alias dan jalur relatif untuk build production yang lebih stabil.

Language Update: Migrasi seluruh UI Label ke Standar Bahasa Inggris Internasional (EN-US).

<p align="center">
<i>Generated & Secured by Leap-OS Intelligence System. All rights reserved.</i>







🐸 <b>LEAP.IO // BUILD FASTER. PLAY HARDER.</b>
</p>
