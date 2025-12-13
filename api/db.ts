import { sql } from '@vercel/postgres';

// Initialize database table if it doesn't exist
export async function initDatabase() {
  try {
    // Check if POSTGRES_URL is set
    // Note: @vercel/postgres uses POSTGRES_URL by default (not VITE_POSTGRES_URL)
    // VITE_* prefix is only for client-side variables, NOT for server-side API routes
    if (!process.env.POSTGRES_URL) {
      throw new Error('POSTGRES_URL environment variable is not set. Please set it in Vercel dashboard or .env file.');
    }

    await sql`
      CREATE TABLE IF NOT EXISTS cloudinary_files (
        id SERIAL PRIMARY KEY,
        file_url TEXT NOT NULL,
        public_id VARCHAR(255) NOT NULL,
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    
    // Create index on public_id for faster lookups
    await sql`
      CREATE INDEX IF NOT EXISTS idx_public_id ON cloudinary_files(public_id);
    `;
    
    console.log('Database table initialized successfully');
    return { success: true };
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
}

// Save or update Cloudinary file URL
export async function saveCloudinaryUrl(fileUrl: string, publicId: string = 'project_data_master') {
  try {
    await initDatabase();
    
    // Check if record exists
    const existing = await sql`
      SELECT id FROM cloudinary_files WHERE public_id = ${publicId} LIMIT 1;
    `;
    
    if (existing.rows.length > 0) {
      // Update existing record
      await sql`
        UPDATE cloudinary_files 
        SET file_url = ${fileUrl}, updated_at = CURRENT_TIMESTAMP 
        WHERE public_id = ${publicId};
      `;
    } else {
      // Insert new record
      await sql`
        INSERT INTO cloudinary_files (file_url, public_id) 
        VALUES (${fileUrl}, ${publicId});
      `;
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error saving Cloudinary URL:', error);
    throw error;
  }
}

// Get latest Cloudinary file URL
export async function getCloudinaryUrl(publicId: string = 'project_data_master') {
  try {
    await initDatabase();
    
    const result = await sql`
      SELECT file_url, updated_at 
      FROM cloudinary_files 
      WHERE public_id = ${publicId} 
      ORDER BY updated_at DESC 
      LIMIT 1;
    `;
    
    if (result.rows.length > 0) {
      return { 
        url: result.rows[0].file_url,
        updatedAt: result.rows[0].updated_at
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error getting Cloudinary URL:', error);
    throw error;
  }
}

