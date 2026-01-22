🐸 Leap.io - Gamified Project Management Platform

Leap.io adalah platform SaaS revolusioner untuk manajemen proyek berbasis AI dan gamifikasi. Dibangun untuk memisahkan operasional Agency (Swakarsa) dan Product, Leap.io memberikan pengalaman kerja seperti bermain RPG bagi developer (Freelancer) dan kontrol penuh bagi admin (Captain).

🚀 Fitur Utama (Features)

1. 🏰 Guild Hall (Dashboard Profil)

Gamified Stats: Menampilkan Level, XP, dan atribut RPG (Logic, Speed, Aesthetic) yang diambil real-time dari database.

Progress Bar: Visualisasi XP bar yang dinamis.

Activity Log: Riwayat aktivitas user (menyelesaikan quest, naik level).

Role-Based View: Tampilan berbeda untuk 'Freelancer' dan 'Captain'.

2. ⚔️ Quest Board (Manajemen Tugas)

Kanban System: Papan tugas interaktif dengan kolom: To Do, In Combat, Loot Drop, dan Completed.

Protocol: No Proof, No Loot: Freelancer wajib mengunggah link Github Commit dan Video Demo saat submit tugas.

Visual Cues: Indikator kesulitan (Easy, Medium, Hard) dengan kode warna.

Optimistic UI: Perubahan status terasa instan di UI sambil sinkronisasi ke database di latar belakang.

3. ❄️ Cryosleep (Passive Income Module)

Maintenance Mode: Daftar proyek lama yang sedang "tidur" (stasis).

Emergency Summon: Simulasi klien menekan tombol darurat. Kartu berubah merah, rate per jam naik.

Retainer Fee: Menampilkan potensi pendapatan pasif dari proyek yang stabil.

4. 🛡️ Client Shield (Secure Communication)

Exclusive Channel: Fitur chat khusus yang hanya bisa diakses oleh Captain.

Encrypted UI: Desain antarmuka bergaya terminal/hacker.

Freelancer Barrier: Mencegah freelancer berkomunikasi langsung dengan klien untuk menghindari scope creep.

5. 👑 Captain's Bridge (Admin Panel)

Review System: Captain bisa menyetujui (Approve) atau menolak (Refactor Hammer) tugas yang masuk.

Level Up Engine: Sistem otomatis yang menaikkan level user jika XP mencukupi setelah approval.

Access Control: Halaman ini dilindungi Middleware, tidak bisa diakses oleh user biasa.

6. 🧠 The Lab (AI Interface)

AI Simulation: Antarmuka chat dengan efek mengetik (streaming text) untuk brainstorming arsitektur sistem (Simulasi).

🛠️ Teknologi (Tech Stack)

Framework: Next.js 15 (App Router) - React Framework modern.

Database: PostgreSQL (via Neon/Supabase) - Database relasional yang kuat.

ORM: Prisma - Untuk interaksi database yang aman (Type-safe).

Auth: NextAuth.js v5 (Beta) - Sistem login aman dengan Role-based Access Control (RBAC).

Styling: Tailwind CSS - Utility-first CSS framework.

Icons: Lucide React - Ikon vektor yang ringan.

📂 Struktur Proyek (Project Structure)

leap-io-app/
├── app/
│   ├── (platform)/          # Group route (opsional)
│   ├── api/                 # API Routes (NextAuth)
│   ├── captain/             # Halaman khusus Admin (Bridge, Shield)
│   ├── guild/               # Halaman Profil & Cryosleep
│   ├── lab/                 # Halaman AI Tools
│   ├── lib/                 # Konfigurasi Backend (Prisma, Actions)
│   ├── login/               # Halaman Login
│   ├── quests/              # Halaman Kanban Board
│   ├── components/          # Komponen UI (Sidebar, Cards, Modal)
│   ├── layout.tsx           # Layout global + Auth Check
│   └── page.tsx             # Homepage Redirect
├── prisma/
│   ├── schema.prisma        # Definisi Database (User, Quest, Project)
│   └── seed.ts              # Data awal (Dummy Data)
├── public/                  # Aset statis
├── types/                   # Definisi TypeScript custom
├── auth.ts                  # Konfigurasi NextAuth Utama
├── auth.config.ts           # Logika Middleware Auth
├── middleware.ts            # Satpam rute (Proteksi Halaman)
└── .env                     # Variabel Lingkungan (Rahasia)


⚡ Cara Menjalankan (Getting Started)

Ikuti langkah ini untuk menjalankan proyek di komputer lokal:

1. Persiapan Lingkungan

Pastikan Node.js sudah terinstal. Buat file .env di root folder:

# .env
DATABASE_URL="postgres://user:password@host/db..." # Ganti dengan URL Database Cloud (Neon/Supabase)
AUTH_SECRET="rahasia_super_panjang_dan_acak_1234567890" # Generate pakai `npx auth secret`


2. Install Dependencies

npm install


3. Setup Database

Sinkronisasi skema Prisma ke database cloud dan isi data awal:

npx prisma db push
npx prisma db seed


4. Jalankan Server

npm run dev


Buka http://localhost:3000 di browser.

🔑 Akun Demo (Credentials)

Gunakan akun ini untuk masuk dan mencoba fitur yang berbeda:

Role

Email

Akses Fitur

Freelancer

dev@leap.io

Guild, Quests, Lab, Cryosleep

Captain

captain@leap.io

Semua di atas + Captain's Bridge, Client Shield

(Password tidak diperlukan dalam mode dev ini, sistem menggunakan email-only login simulation).

📜 Log Pengerjaan (Changelog)

Inisiasi: Pemisahan repo dari Agency, setup Next.js App Router.

UI/UX: Implementasi Sidebar responsif, tema gelap (Dark Mode), dan maskot Kodok.

Database: Migrasi dari SQLite lokal ke PostgreSQL Cloud.

Fitur:

Implementasi Server Actions untuk mutasi data (Submit Loot, Approve Quest).

Integrasi NextAuth v5 untuk proteksi halaman dan sidebar dinamis.

Pembuatan modul gamifikasi (XP Calculation & Level Up Logic).

Documentation generated by Leap.io AI Assistant.