# Testing Database Connection

## Masalah: API Routes Tidak Berjalan di Development Mode

Vite dev server (`npm run dev`) **TIDAK** menjalankan Vercel serverless functions. API routes hanya berjalan di:
1. **Vercel production/preview** (setelah deploy)
2. **Local dengan Vercel CLI** (`vercel dev`)

## Solusi: Test Database Connection

### Opsi 1: Deploy ke Vercel (Recommended)

1. Push code ke GitHub
2. Deploy ke Vercel
3. Set environment variables di Vercel Dashboard:
   - `POSTGRES_URL` (dari Neon database)
   - `VITE_API_KEY`
   - `VITE_CLOUDINARY_CLOUD_NAME`
   - `VITE_CLOUDINARY_API_KEY`
   - `VITE_CLOUDINARY_API_SECRET`
4. Setelah deploy, buka: `https://your-app.vercel.app/api/init-db`
   - Ini akan membuat tabel di database
5. Test upload file melalui UI

### Opsi 2: Test Local dengan Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Login ke Vercel:
   ```bash
   vercel login
   ```

3. Link project:
   ```bash
   vercel link
   ```

4. Set environment variables local:
   ```bash
   vercel env add POSTGRES_URL
   # Paste: postgresql://neondb_owner:npg_BHCdOa3K6tDv@ep-bold-cloud-ad4j255y-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require
   ```

5. Run dev server dengan Vercel:
   ```bash
   vercel dev
   ```

6. Buka: `http://localhost:3000/api/init-db` untuk init database
7. Test upload file

## Test Database Connection Manual

Setelah deploy, test dengan:

1. **Init Database:**
   ```
   GET https://your-app.vercel.app/api/init-db
   ```

2. **Save File URL:**
   ```bash
   curl -X POST https://your-app.vercel.app/api/save-file-url \
     -H "Content-Type: application/json" \
     -d '{"fileUrl":"https://res.cloudinary.com/...","publicId":"project_data_master"}'
   ```

3. **Get File URL:**
   ```
   GET https://your-app.vercel.app/api/get-file-url?publicId=project_data_master
   ```

## Troubleshooting

### Error: "POSTGRES_URL is not set"
- Pastikan environment variable `POSTGRES_URL` sudah diset di Vercel Dashboard
- Set untuk semua environments: Production, Preview, Development

### Error: "Table does not exist"
- Panggil `/api/init-db` terlebih dahulu untuk membuat tabel
- Atau tabel akan otomatis dibuat saat pertama kali save/get dipanggil

### API Routes Return 404
- Pastikan `vercel.json` sudah benar (exclude `/api/*` dari rewrite)
- Pastikan file API routes ada di folder `api/`
- Restart Vercel dev server jika menggunakan `vercel dev`

### Database Connection Failed
- Cek apakah `POSTGRES_URL` benar
- Pastikan database Neon sudah aktif
- Cek apakah connection string menggunakan pooler (recommended)

