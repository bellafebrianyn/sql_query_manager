import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getCloudinaryUrl } from './db.js';


export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  // Enable CORS
  response.setHeader('Access-Control-Allow-Credentials', 'true');
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  if (request.method !== 'GET') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const publicId = (request.query.publicId as string) || 'project_data_master';
    const result = await getCloudinaryUrl(publicId);
    
    if (result) {
      return response.status(200).json(result);
    } else {
      return response.status(404).json({ error: 'File URL not found' });
    }
  } catch (error) {
    console.error('Error in get-file-url:', error);
    return response.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

