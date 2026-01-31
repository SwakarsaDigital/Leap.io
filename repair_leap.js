const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log("🚀 MEMULAI PERBAIKAN OTOMATIS LEAP.IO...");

// 1. Daftar file yang HARUS dihapus
const filesToDelete = [
    'postcss.config.mjs',
    'postcss.config.js',
    'package-lock.json',
    '.next',
    'node_modules'
];

filesToDelete.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
        console.log(`🗑️  Menghapus: ${file}...`);
        try {
            fs.rmSync(filePath, { recursive: true, force: true });
        } catch (e) {
            console.warn(`⚠️  Gagal menghapus ${file} (Mungkin sedang dikunci). Silakan hapus manual jika script gagal.`);
        }
    }
});

// 2. Buat ulang postcss.config.js yang BENAR (Versi 3)
const postcssConfig = `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`;
fs.writeFileSync(path.join(__dirname, 'postcss.config.js'), postcssConfig);
console.log("✅ Membuat ulang postcss.config.js (Versi 3)");

// 3. Pastikan package.json menggunakan versi 3
const packageJsonPath = path.join(__dirname, 'package.json');
if (fs.existsSync(packageJsonPath)) {
    const pkg = require(packageJsonPath);
    // Paksa devDependencies ke versi 3
    if (!pkg.devDependencies) pkg.devDependencies = {};
    pkg.devDependencies['tailwindcss'] = '^3.4.17';
    pkg.devDependencies['postcss'] = '^8.4.31';
    pkg.devDependencies['autoprefixer'] = '^10.4.16';
    
    // Hapus dependensi v4 jika ada
    if (pkg.devDependencies['@tailwindcss/postcss']) {
        delete pkg.devDependencies['@tailwindcss/postcss'];
    }
    
    fs.writeFileSync(packageJsonPath, JSON.stringify(pkg, null, 2));
    console.log("✅ Memperbaiki package.json (Memaksa Tailwind v3)");
}

// 4. Install ulang
console.log("📦 Menginstall ulang dependensi (ini mungkin memakan waktu)...");
try {
    execSync('npm install', { stdio: 'inherit' });
    console.log("🎉 PERBAIKAN SELESAI!");
    console.log("👉 Silakan jalankan: npm run dev");
} catch (e) {
    console.error("❌ Gagal saat npm install. Coba jalankan 'npm install' secara manual.");
}