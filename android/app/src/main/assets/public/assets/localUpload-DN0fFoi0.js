import { a2 as Capacitor, a3 as ref, a4 as storage, a5 as uploadBytesResumable, a6 as getDownloadURL } from "./index-BNptM8td.js";
async function uploadToLocal(base64Data, filename, contentType = "image/jpeg", onProgress, preFetched) {
  var _a;
  try {
    const isVercelOrNative = Capacitor.isNativePlatform() || typeof window !== "undefined" && (window.location.hostname.includes("vercel.app") || window.location.hostname.includes("vercel.dev"));
    const cleanFilename = filename.replace(/[^a-zA-Z0-9./-_]/g, "_");
    if (!isVercelOrNative) {
      try {
        console.log(`[Local Upload] Attempting local direct backend upload for ${filename}...`);
        if (onProgress) onProgress(10);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 1e4);
        const response = await fetch("/api/upload", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            base64Data,
            filename: cleanFilename,
            contentType
          }),
          signal: controller.signal
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
    try {
      console.log(`[Cloud Upload] Acquiring cloud reference for ${filename}...`);
      const safePath = `uploads/${Date.now()}-${cleanFilename}`;
      const storageRef = ref(storage, safePath);
      console.log(`[Cloud Upload] Initiating system transmission...`);
      let blob;
      if (base64Data.startsWith("data:")) {
        const arr = base64Data.split(",");
        const mime = ((_a = arr[0].match(/:(.*?);/)) == null ? void 0 : _a[1]) || contentType;
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
      if (blob.size <= 50 * 1024) {
        console.log(`[Cloud Upload] Size is ${blob.size} bytes (<= 50KB), keeping as base64 inline.`);
        return base64Data;
      }
      const uploadPromise = new Promise((resolve, reject) => {
        const uploadTask = uploadBytesResumable(storageRef, blob, { contentType });
        let completed = false;
        const timeoutId = setTimeout(() => {
          if (!completed) {
            completed = true;
            console.warn("[Cloud Upload] Firebase upload timed out. Aborting and falling back to base64 inline.");
            try {
              uploadTask.cancel();
            } catch (e) {
            }
            reject(new Error("Timeout"));
          }
        }, 5e3);
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            if (completed) return;
            if (onProgress) {
              const progress = snapshot.bytesTransferred / snapshot.totalBytes * 100;
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
            } catch (err) {
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
      return base64Data;
    }
  } catch (error) {
    console.error("[Cloud Upload Routine Error]:", error);
    return base64Data;
  }
}
export {
  uploadToLocal as u
};
