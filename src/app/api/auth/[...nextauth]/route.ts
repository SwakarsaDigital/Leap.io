import { handlers } from "../../../../auth"; // Menggunakan alias @ agar path selalu tepat ke root

// Mengambil fungsi GET dan POST dari handlers yang sudah kita konfigurasi di auth.ts
export const { GET, POST } = handlers;