import type { VercelRequest, VercelResponse } from '@vercel/node';
import { saveCloudinaryUrl } from './db.js';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  // Enable CORS
  response.setHeader('Access-Control-Allow-Credentials', 'true');
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { fileUrl, publicId } = request.body;
    
    if (!fileUrl) {
      return response.status(400).json({ error: 'fileUrl is required' });
    }

    const result = await saveCloudinaryUrl(fileUrl, publicId || 'project_data_master');
    
    return response.status(200).json({ 
      success: true,
      message: 'File URL saved successfully',
      ...result
    });
  } catch (error) {
    console.error('Error in save-file-url:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return response.status(500).json({ 
      error: 'Internal server error',
      message: errorMessage,
      hint: errorMessage.includes('POSTGRES_URL') 
        ? 'Please set POSTGRES_URL in Vercel environment variables'
        : 'Check server logs for more details'
    });
  }
}

