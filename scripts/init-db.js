import { sql } from '@vercel/postgres';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

async function initDatabase() {
  try {
    console.log('Connecting to database...');
    
    // Check if POSTGRES_URL is set
    if (!process.env.POSTGRES_URL) {
      throw new Error('POSTGRES_URL environment variable is not set. Please set it in .env file.');
    }

    console.log('Creating table cloudinary_files...');
    await sql`
      CREATE TABLE IF NOT EXISTS cloudinary_files (
        id SERIAL PRIMARY KEY,
        file_url TEXT NOT NULL,
        public_id VARCHAR(255) NOT NULL,
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    
    console.log('Creating index on public_id...');
    await sql`
      CREATE INDEX IF NOT EXISTS idx_public_id ON cloudinary_files(public_id);
    `;
    
    console.log('✅ Database table initialized successfully!');
    
    // Verify table was created
    const result = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'cloudinary_files';
    `;
    
    if (result.rows.length > 0) {
      console.log('✅ Table "cloudinary_files" exists in database');
    } else {
      console.log('⚠️  Warning: Table not found after creation');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    console.error('Error details:', error.message);
    process.exit(1);
  }
}

initDatabase();

