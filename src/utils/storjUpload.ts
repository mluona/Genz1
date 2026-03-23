export async function uploadToStorj(
  base64Data: string, 
  filename: string, 
  contentType: string = 'image/jpeg',
  onProgress?: (progress: number) => void
): Promise<string | null> {
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

    // 3. Upload directly to Storj using XMLHttpRequest for progress tracking
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', uploadUrl);
      xhr.setRequestHeader('Content-Type', contentType);

      if (onProgress) {
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percentComplete = (event.loaded / event.total) * 100;
            onProgress(percentComplete);
          }
        };
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          console.log(`[Storj] Upload successful: ${url}`);
          resolve(url);
        } else {
          console.error(`[Storj] Upload error:`, xhr.status, xhr.statusText);
          reject(new Error(`Failed to upload to Storj: ${xhr.statusText}`));
        }
      };

      xhr.onerror = () => {
        console.error(`[Storj] Network error during upload`);
        reject(new Error('Network error during upload to Storj'));
      };

      xhr.send(blob);
    });
  } catch (error) {
    console.error('Storj Upload Error:', error);
    throw error;
  }
}
