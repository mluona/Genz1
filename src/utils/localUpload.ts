// Dynamic High-Performance Local-First Upload Engine
// Stores files locally under /uploads and references them cleanly using SQLite.

export async function uploadToLocal(
  base64Data: string, 
  filename: string, 
  contentType: string = 'image/jpeg',
  onProgress?: (progress: number) => void,
  preFetched?: { uploadUrl: string, url: string }
): Promise<string | null> {
  try {
    let uploadUrl: string;
    let url: string;

    if (preFetched) {
      uploadUrl = preFetched.uploadUrl;
      url = preFetched.url;
    } else {
      console.log(`[Local Upload] Acquiring local upload link for ${filename}...`);
      const response = await fetch('/api/local-presign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filename, contentType }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error(`[Local Upload] Presign error:`, errorData);
        throw new Error(errorData.error || `Failed to acquire upload path: ${response.statusText}`);
      }

      const data = await response.json();
      uploadUrl = data.uploadUrl;
      url = data.url;
    }

    console.log(`[Local Upload] Initiating system transmission of blob...`);

    // 2. Convert base64 to binary blob
    let blob: Blob;
    try {
      if (base64Data.startsWith('data:')) {
        const arr = base64Data.split(',');
        const mime = arr[0].match(/:(.*?);/)?.[1] || contentType;
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        blob = new Blob([u8arr], { type: mime });
      } else {
        blob = await (await fetch(base64Data)).blob();
      }
    } catch (err: any) {
      throw new Error(`Data URI binary mapping error: ${err.message}`);
    }
    console.log(`[Local Upload] Payload footprint: ${blob.size} bytes`);

    // 2.5 Check size threshold (50KB)
    if (blob.size <= 50 * 1024) {
      console.log(`[Local Upload] Size is ${blob.size} bytes (<= 50KB), keeping as base64 inline for Firebase.`);
      // If we pre-fetched an endpoint but didn't need it, we just ignore it.
      return base64Data;
    }

    // 3. Perform binary PUT uploading via XMLHttpRequest for real-time progress callbacks
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
          console.log(`[Local Upload] Transmission success: ${url}`);
          resolve(url);
        } else {
          console.error(`[Local Upload] Backend reject:`, xhr.status, xhr.statusText, xhr.responseText);
          reject(new Error(`Local destination rejected stream: ${xhr.statusText} - ${xhr.responseText}`));
        }
      };

      xhr.onerror = () => {
        console.error(`[Local Upload] Communication network exception`);
        reject(new Error('Persistent local network transmission interrupted'));
      };

      xhr.send(blob);
    });
  } catch (error) {
    console.error('[Local Upload Routine Error]:', error);
    throw error;
  }
}
