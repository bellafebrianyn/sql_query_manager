import type { VercelRequest, VercelResponse } from '@vercel/node';
import { initDatabase } from './db.js';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  // Enable CORS
  response.setHeader('Access-Control-Allow-Credentials', 'true');
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  if (request.method !== 'GET' && request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await initDatabase();
    return response.status(200).json({ 
      success: true,
      message: 'Database initialized successfully' 
    });
  } catch (error) {
    console.error('Error initializing database:', error);
    return response.status(500).json({ 
      error: 'Failed to initialize database',
      message: error instanceof Error ? error.message : 'Unknown error',
      details: process.env.POSTGRES_URL ? 'POSTGRES_URL is set' : 'POSTGRES_URL is NOT set'
    });
  }
}

