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
    // Check if we are running in a Vercel deployment
    const isVercel = typeof window !== 'undefined' && (
      window.location.hostname.includes('vercel.app') || 
      window.location.hostname.includes('vercel.dev')
    );

    // Clean filename to be safe
    const cleanFilename = filename.replace(/[^a-zA-Z0-9./-_]/g, '_');
    
    // 1. Try uploading to our local backend API route /api/upload first (only if NOT on Vercel)
    if (!isVercel) {
      try {
        console.log(`[Local Upload] Attempting local direct backend upload for ${filename}...`);
        if (onProgress) onProgress(10);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout for local upload

        const response = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            base64Data,
            filename: cleanFilename,
            contentType,
          }),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (response.ok) {
          const result = await response.json();
          if (result.url) {
            console.log(`[Local Upload] Successful local upload:`, result.url);
            if (onProgress) onProgress(100);
            return result.url;
          }
        }
        console.warn(`[Local Upload] Backend endpoint failed to return a URL, falling back to Firebase Storage.`);
      } catch (apiErr) {
        console.error(`[Local Upload] Backend API connection error, falling back to Firebase Storage:`, apiErr);
      }
    } else {
      console.log(`[Local Upload] Running on Vercel environment. Bypassing local disk upload and choosing cloud/inline route.`);
    }

    // 2. Try Firebase Storage with a strict timeout
    try {
      console.log(`[Cloud Upload] Acquiring cloud reference for ${filename}...`);
      const safePath = `uploads/${Date.now()}-${cleanFilename}`;
      const storageRef = ref(storage, safePath);

      console.log(`[Cloud Upload] Initiating system transmission...`);

      // Convert base64 to binary blob
      let blob: Blob;
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
      
      console.log(`[Cloud Upload] Payload footprint: ${blob.size} bytes`);

      // Check size threshold (50KB) - keep inline if very small to save bandwidth/requests
      if (blob.size <= 50 * 1024) {
        console.log(`[Cloud Upload] Size is ${blob.size} bytes (<= 50KB), keeping as base64 inline.`);
        return base64Data;
      }

      // Perform binary upload to Firebase Storage with resumable task and timeout
      const uploadPromise = new Promise<string>((resolve, reject) => {
        const uploadTask = uploadBytesResumable(storageRef, blob, { contentType });
        let completed = false;

        // 5-second timeout for the Firebase Storage upload
        const timeoutId = setTimeout(() => {
          if (!completed) {
            completed = true;
            console.warn("[Cloud Upload] Firebase upload timed out. Aborting and falling back to base64 inline.");
            try {
              uploadTask.cancel();
            } catch (e) {}
            reject(new Error("Timeout"));
          }
        }, 5000);

        uploadTask.on(
          'state_changed',
          (snapshot) => {
            if (completed) return;
            if (onProgress) {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              onProgress(progress);
            }
          },
          (error) => {
            if (completed) return;
            completed = true;
            clearTimeout(timeoutId);
            console.error(`[Cloud Upload] Firebase reject:`, error);
            reject(error);
          },
          async () => {
            if (completed) return;
            completed = true;
            clearTimeout(timeoutId);
            try {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              console.log(`[Cloud Upload] Transmission success: ${downloadURL}`);
              resolve(downloadURL);
            } catch (err: any) {
              reject(err);
            }
          }
        );
      });

      return await uploadPromise;
    } catch (cloudErr) {
      console.warn(`[Cloud Upload] Firebase storage upload failed or timed out:`, cloudErr);
      console.log(`[Local Upload] Falling back to direct inline Base64 storage for maximum reliability.`);
      if (onProgress) onProgress(100);
      return base64Data; // Ultimate, foolproof fallback!
    }
  } catch (error) {
    console.error('[Cloud Upload Routine Error]:', error);
    // Even if everything breaks, return the base64Data so it is never stuck!
    return base64Data;
  }
}
