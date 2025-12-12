// Cloudinary Configuration
const CLOUD_NAME = process.env.VITE_CLOUDINARY_CLOUD_NAME;
const API_KEY = process.env.VITE_CLOUDINARY_API_KEY;
const API_SECRET = process.env.VITE_CLOUDINARY_API_SECRET;
const PUBLIC_ID = 'project_data_master.xlsx'; // Fixed ID to overwrite the file

// Helper to create SHA-1 signature for Cloudinary API
async function generateSignature(params: Record<string, string>): Promise<string> {
  if (!API_SECRET) {
    throw new Error("CLOUDINARY_API_SECRET is missing in environment variables");
  }
  const sortedKeys = Object.keys(params).sort();
  const stringToSign = sortedKeys.map(key => `${key}=${params[key]}`).join('&') + API_SECRET;
  
  const enc = new TextEncoder();
  const hash = await crypto.subtle.digest('SHA-1', enc.encode(stringToSign));
  return Array.from(new Uint8Array(hash))
    .map(v => v.toString(16).padStart(2, '0'))
    .join('');
}


export const uploadToCloudinary = async (file: File): Promise<void> => {
  if (!CLOUD_NAME || !API_KEY) {
    throw new Error(`Cloudinary credentials (CLOUD_NAME ${CLOUD_NAME} or API_KEY ${API_KEY}) are missing.`);
  }

  const timestamp = Math.floor(Date.now() / 1000).toString();
  
  const params = {
    public_id: 'project_data_master', // Removing extension for ID parameter usually safer, but resource_type raw handles it
    timestamp: timestamp,
  };

  const signature = await generateSignature(params);

  const formData = new FormData();
  formData.append('file', file);
  formData.append('api_key', API_KEY);
  formData.append('timestamp', timestamp);
  formData.append('public_id', 'project_data_master');
  formData.append('signature', signature);
  // Resource type 'raw' is required for Excel files
  formData.append('resource_type', 'raw'); 

  const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/raw/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorBody = await response.json();
    throw new Error(`Cloudinary Upload Failed: ${errorBody.error?.message || response.statusText}`);
  }
};

/**
 * Fetches the raw Excel file from Cloudinary.
 * Returns an ArrayBuffer to be parsed by XLSX.
 */
export const fetchFromCloudinary = async (): Promise<ArrayBuffer> => {
  if (!CLOUD_NAME) {
    throw new Error("CLOUDINARY_CLOUD_NAME is missing.");
  }

  // Add a cache-busting timestamp to ensure we get the latest version
  const url = `https://res.cloudinary.com/${CLOUD_NAME}/raw/upload/project_data_master.xlsx?t=${Date.now()}`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch file: ${response.statusText}`);
  }

  return await response.arrayBuffer();
};