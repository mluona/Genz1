export async function uploadToStorj(base64Data: string, filename: string, contentType: string = 'image/jpeg'): Promise<string | null> {
  try {
    // 1. Get presigned URL from our backend
    const response = await fetch('/api/storj-presign', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ filename, contentType }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to get presigned URL: ${response.statusText}`);
    }

    const { uploadUrl, url } = await response.json();

    // 2. Convert base64 to blob
    const base64Response = await fetch(base64Data);
    const blob = await base64Response.blob();

    // 3. Upload directly to Storj using the presigned URL
    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': contentType,
      },
      body: blob,
    });

    if (!uploadResponse.ok) {
      throw new Error(`Failed to upload to Storj: ${uploadResponse.statusText}`);
    }

    // 4. Return the public URL
    return url;
  } catch (error) {
    console.error('Storj Upload Error:', error);
    throw error;
  }
}
