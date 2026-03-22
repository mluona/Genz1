export async function uploadToStorj(base64Data: string, filename: string, contentType: string = 'image/jpeg'): Promise<string | null> {
  try {
    // 1. Get presigned URL
    const presignRes = await fetch('/api/storj-presign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename, contentType })
    });
    
    if (!presignRes.ok) {
      const err = await presignRes.json();
      throw new Error(err.error || 'Failed to get presigned URL');
    }
    
    const { uploadUrl, url } = await presignRes.json();
    
    // 2. Convert base64 to blob
    const base64Response = await fetch(base64Data);
    const blob = await base64Response.blob();
    
    // 3. Upload to Storj
    const uploadRes = await fetch(uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': contentType },
      body: blob
    });
    
    if (!uploadRes.ok) {
      throw new Error('Failed to upload to Storj');
    }
    
    return url;
  } catch (error) {
    console.error('Storj Upload Error:', error);
    throw error;
  }
}
