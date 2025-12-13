# Development Setup

## Cara Menjalankan Development Server

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Database
```bash
npm run init-db
```
Ini akan membuat tabel `cloudinary_files` di database Neon.

### 3. Jalankan Development Server
```bash
npm run dev
```

Ini akan menjalankan:
- **API Server** di `http://localhost:3001` (untuk API routes)
- **Vite Dev Server** di `http://localhost:3000` (untuk React app)

Vite akan otomatis proxy semua request `/api/*` ke API server.

## Alur Kerja

### Upload File:
1. User upload file Excel melalui UI
2. File di-upload ke Cloudinary
3. Dapat URL dari Cloudinary response
4. **Simpan URL ke database** via `/api/save-file-url`
5. File tersimpan di Cloudinary dan URL tersimpan di database

### Load File:
1. Saat aplikasi dibuka/refresh
2. Panggil `/api/get-file-url` untuk ambil URL dari database
3. Jika ada URL di database → load file dari Cloudinary menggunakan URL tersebut
4. Jika tidak ada → fallback ke konstruksi URL default

## API Routes (Development)

Semua API routes tersedia di `http://localhost:3000/api/*` (di-proxy ke `http://localhost:3001/api/*`):

- `GET /api/get-file-url?publicId=project_data_master` - Ambil URL dari database
- `POST /api/save-file-url` - Simpan URL ke database
- `GET /api/init-db` - Initialize database (buat tabel)

## Environment Variables

Pastikan file `.env` berisi:
```env
# Client-side (VITE_*)
VITE_API_KEY=your_gemini_key
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_API_KEY=your_api_key
VITE_CLOUDINARY_API_SECRET=your_api_secret

# Server-side (tanpa VITE_)
POSTGRES_URL=postgresql://neondb_owner:...@.../neondb?sslmode=require
```

## Troubleshooting

### API Server tidak berjalan
- Pastikan port 3001 tidak digunakan aplikasi lain
- Cek console untuk error messages
- Pastikan `POSTGRES_URL` sudah diset di `.env`

### Error "Cannot find module"
- Pastikan semua dependencies sudah di-install: `npm install`
- Pastikan `tsx` sudah terinstall: `npm install tsx --save-dev`

### Database connection error
- Pastikan `POSTGRES_URL` benar di `.env`
- Pastikan database Neon sudah aktif
- Jalankan `npm run init-db` untuk membuat tabel

## Production (Vercel)

Di production, API routes akan otomatis berjalan sebagai Vercel serverless functions. Tidak perlu dev server terpisah.

