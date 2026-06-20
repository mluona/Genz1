// Dynamic High-Performance Cloud Upload Engine
// Stores files in Firebase Storage and returns public URLs.

import { ref, uploadString, getDownloadURL, uploadBytesResumable } from 'firebase/storage';
import { storage } from '../firebase';

export async function uploadToLocal(
  base64Data: string, 
  filename: string, 
  contentType: string = 'image/jpeg',
  onProgress?: (progress: number) => void,
  preFetched?: { uploadUrl: string, url: string }
): Promise<string | null> {
  try {
    console.log(`[Cloud Upload] Acquiring cloud reference for ${filename}...`);
    
    // Clean filename to be safe
    const cleanFilename = filename.replace(/[^a-zA-Z0-9./-_]/g, '_');
    const safePath = `uploads/${Date.now()}-${cleanFilename}`;
    
    const storageRef = ref(storage, safePath);

    console.log(`[Cloud Upload] Initiating system transmission...`);

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
    console.log(`[Cloud Upload] Payload footprint: ${blob.size} bytes`);

    // 2.5 Check size threshold (50KB) - keep inline if very small to save bandwidth/requests
    if (blob.size <= 50 * 1024) {
      console.log(`[Cloud Upload] Size is ${blob.size} bytes (<= 50KB), keeping as base64 inline.`);
      return base64Data;
    }

    // 3. Perform binary upload to Firebase Storage with resumable task
    return new Promise((resolve, reject) => {
      const uploadTask = uploadBytesResumable(storageRef, blob, { contentType });

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          if (onProgress) {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            onProgress(progress);
          }
        },
        (error) => {
           console.error(`[Cloud Upload] Backend reject:`, error);
           reject(new Error(`Firebase destination rejected stream: ${error.message}`));
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
             console.log(`[Cloud Upload] Transmission success: ${downloadURL}`);
             resolve(downloadURL);
          } catch (err: any) {
            reject(new Error(`Failed to get download URL: ${err.message}`));
          }
        }
      );
    });
  } catch (error) {
    console.error('[Cloud Upload Routine Error]:', error);
    throw error;
  }
}
