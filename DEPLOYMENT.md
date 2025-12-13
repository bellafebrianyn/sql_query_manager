# Deployment Guide - Vercel

## Environment Variables yang Perlu Diset di Vercel

Setelah import project ke Vercel, pastikan untuk menambahkan environment variables berikut di **Vercel Dashboard > Project Settings > Environment Variables**:

### Frontend Variables (VITE_*)
- `VITE_API_KEY` - Gemini API Key
- `VITE_CLOUDINARY_CLOUD_NAME` - Cloudinary Cloud Name
- `VITE_CLOUDINARY_API_KEY` - Cloudinary API Key
- `VITE_CLOUDINARY_API_SECRET` - Cloudinary API Secret

### Database Variables (untuk API Routes)
- `POSTGRES_URL` - Neon Database URL (dari informasi yang diberikan)
  ```
  postgresql://neondb_owner:npg_BHCdOa3K6tDv@ep-bold-cloud-ad4j255y-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require
  ```

**Catatan Penting:** 
- ⚠️ **JANGAN** gunakan prefix `VITE_` untuk `POSTGRES_URL`! 
- `VITE_*` prefix hanya untuk client-side variables yang di-expose ke browser
- `POSTGRES_URL` adalah server-side variable yang TIDAK boleh di-expose ke browser
- Set semua variables untuk **Production**, **Preview**, dan **Development** environments
- `@vercel/postgres` akan otomatis menggunakan `POSTGRES_URL` dari environment variables
- Untuk local development, set `POSTGRES_URL` di file `.env` (tanpa prefix `VITE_`)

## Cara Deploy

1. Push code ke GitHub/GitLab/Bitbucket
2. Import project di Vercel
3. Vercel akan auto-detect Vite dan menggunakan `vercel.json`
4. Set semua environment variables di Vercel Dashboard
5. Deploy!

## Initialize Database

### Cara 1: Menggunakan Script (Recommended untuk Local Development)
```bash
npm run init-db
```
Script ini akan membuat tabel `cloudinary_files` di database Neon.

### Cara 2: Menggunakan API Endpoint (Setelah Deploy ke Vercel)
Setelah deploy, buka:
```
GET https://your-app.vercel.app/api/init-db
```

### Cara 3: Otomatis (Saat Pertama Kali Save/Get)
Tabel akan otomatis dibuat saat pertama kali memanggil `/api/save-file-url` atau `/api/get-file-url`.

## Database Schema

Tabel `cloudinary_files` akan dibuat dengan struktur:
- `id` (SERIAL PRIMARY KEY)
- `file_url` (TEXT) - URL file dari Cloudinary
- `public_id` (VARCHAR) - Public ID Cloudinary (default: 'project_data_master')
- `uploaded_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

## API Endpoints

- `GET /api/get-file-url?publicId=project_data_master` - Ambil URL file terbaru dari database
- `POST /api/save-file-url` - Simpan/update URL file ke database
  ```json
  {
    "fileUrl": "https://res.cloudinary.com/...",
    "publicId": "project_data_master"
  }
  ```

## Testing

Setelah deploy, test dengan:
1. Upload file Excel melalui UI
2. Refresh halaman - file seharusnya masih ada (load dari database)
3. File URL tersimpan di database Neon dan tidak hilang setelah refresh

