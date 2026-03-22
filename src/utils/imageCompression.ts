export const compressImage = async (file: Blob, maxSizeMB: number = 0.9): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Initial scale down if very large (max 2048px)
        const maxDim = 2048;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        let quality = 0.9;
        let dataUrl = '';
        const maxBytes = maxSizeMB * 1024 * 1024;

        const compress = () => {
          ctx.clearRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);
          dataUrl = canvas.toDataURL('image/jpeg', quality);
          
          // Approximate base64 size in bytes
          const sizeInBytes = Math.round((dataUrl.length * 3) / 4);
          
          if (sizeInBytes <= maxBytes || quality <= 0.1) {
            resolve(dataUrl);
          } else {
            quality -= 0.1;
            // If still too large at low quality, scale down resolution
            if (quality <= 0.3) {
              width = Math.round(width * 0.8);
              height = Math.round(height * 0.8);
              canvas.width = width;
              canvas.height = height;
              quality = 0.8; // reset quality for new size
            }
            compress();
          }
        };
        compress();
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

export const splitAndCompressImage = async (file: Blob, maxSizeMB: number = 0.9): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const MAX_HEIGHT = 2048; // Max height per slice to maintain quality
        const slices: string[] = [];
        
        let currentY = 0;
        const totalHeight = img.height;
        const width = img.width;

        // Scale down width if it's excessively large (e.g., > 1440px)
        const targetWidth = Math.min(width, 1440);
        const scale = targetWidth / width;
        const scaledTotalHeight = Math.round(totalHeight * scale);

        const processSlices = () => {
          while (currentY < scaledTotalHeight) {
            const sliceHeight = Math.min(MAX_HEIGHT, scaledTotalHeight - currentY);
            
            const canvas = document.createElement('canvas');
            canvas.width = targetWidth;
            canvas.height = sliceHeight;
            const ctx = canvas.getContext('2d');
            
            if (!ctx) {
              reject(new Error('Failed to get canvas context'));
              return;
            }

            // Draw the specific slice
            const sourceY = Math.round(currentY / scale);
            const sourceHeight = Math.round(sliceHeight / scale);
            
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, targetWidth, sliceHeight);
            ctx.drawImage(img, 0, sourceY, width, sourceHeight, 0, 0, targetWidth, sliceHeight);

            // Compress this slice
            let quality = 0.9;
            let dataUrl = canvas.toDataURL('image/jpeg', quality);
            const maxBytes = maxSizeMB * 1024 * 1024;
            
            while (Math.round((dataUrl.length * 3) / 4) > maxBytes && quality > 0.1) {
              quality -= 0.1;
              dataUrl = canvas.toDataURL('image/jpeg', quality);
            }
            
            slices.push(dataUrl);
            currentY += sliceHeight;
          }
          resolve(slices);
        };
        
        processSlices();
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};
