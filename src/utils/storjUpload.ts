export async function uploadToStorj(base64Data: string, filename: string, contentType: string = 'image/jpeg'): Promise<string | null> {
  try {
    // 1. Get presigned URL from our backend
    console.log(`[Storj] Getting presigned URL for ${filename}...`);
    const response = await fetch('/api/storj-presign', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ filename, contentType }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`[Storj] Presign error:`, errorData);
      throw new Error(errorData.error || `Failed to get presigned URL: ${response.statusText}`);
    }

    const { uploadUrl, url } = await response.json();
    console.log(`[Storj] Presigned URL obtained. Uploading blob...`);

    // 2. Convert base64 to blob
    const base64Response = await fetch(base64Data);
    const blob = await base64Response.blob();
    console.log(`[Storj] Blob size: ${blob.size} bytes`);

    // 3. Upload directly to Storj using the presigned URL
    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': contentType,
      },
      body: blob,
    });

    if (!uploadResponse.ok) {
      console.error(`[Storj] Upload error:`, uploadResponse.status, uploadResponse.statusText);
      throw new Error(`Failed to upload to Storj: ${uploadResponse.statusText}`);
    }

    console.log(`[Storj] Upload successful: ${url}`);
    // 4. Return the public URL
    return url;
  } catch (error) {
    console.error('Storj Upload Error:', error);
    throw error;
  }
}
