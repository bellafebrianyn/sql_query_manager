# Database Setup Guide

## ✅ Database Sudah Di-Init!

Tabel `cloudinary_files` sudah berhasil dibuat di database Neon Anda.

## Cara Kerja

1. **Upload File** → File di-upload ke Cloudinary → URL disimpan ke database
2. **Refresh Page** → Aplikasi mengambil URL dari database → Load file dari Cloudinary
3. **File Tidak Hilang** → URL tersimpan permanen di database

## Environment Variables

### Di File `.env` (Local Development):
```env
# Client-side variables (dengan prefix VITE_)
VITE_API_KEY=your_gemini_key
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_API_KEY=your_api_key
VITE_CLOUDINARY_API_SECRET=your_api_secret

# Server-side variable (TANPA prefix VITE_)
POSTGRES_URL=postgresql://neondb_owner:npg_BHCdOa3K6tDv@ep-bold-cloud-ad4j255y-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require
```

### Di Vercel Dashboard:
Set semua variables di atas (termasuk `POSTGRES_URL` tanpa prefix `VITE_`)

## Initialize Database

### Local Development:
```bash
npm run init-db
```

### Setelah Deploy ke Vercel:
1. Buka: `https://your-app.vercel.app/api/init-db`
2. Atau tabel akan otomatis dibuat saat pertama kali upload file

## Test Database Connection

### 1. Test Init Database:
```bash
npm run init-db
```

### 2. Test Save URL (setelah deploy):
```bash
curl -X POST https://your-app.vercel.app/api/save-file-url \
  -H "Content-Type: application/json" \
  -d '{"fileUrl":"https://res.cloudinary.com/...","publicId":"project_data_master"}'
```

### 3. Test Get URL:
```bash
curl https://your-app.vercel.app/api/get-file-url?publicId=project_data_master
```

## Troubleshooting

### Error: "POSTGRES_URL is not set"
- Pastikan `POSTGRES_URL` ada di `.env` (local) atau Vercel Dashboard (production)
- **JANGAN** gunakan `VITE_POSTGRES_URL` - itu salah dan tidak aman!

### Error: "Table does not exist"
- Jalankan: `npm run init-db`
- Atau buka: `/api/init-db` setelah deploy

### API Routes Return 404 (Local Development)
- API routes hanya berjalan di Vercel (production/preview) atau dengan `vercel dev`
- Untuk test local, gunakan `vercel dev` atau deploy ke Vercel

## Database Schema

```sql
CREATE TABLE cloudinary_files (
  id SERIAL PRIMARY KEY,
  file_url TEXT NOT NULL,
  public_id VARCHAR(255) NOT NULL,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_public_id ON cloudinary_files(public_id);
```

