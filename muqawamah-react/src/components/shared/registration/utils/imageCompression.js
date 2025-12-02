            /**
 * Compress an image file and convert to WebP format before converting to base64
 * @param {File} file - The image file to compress (JPEG, PNG, etc.)
 * @param {Object} options - Compression options
 * @returns {Promise<string>} - Base64 string of compressed WebP image
 */
export async function compressImage(file, options = {}) {
  const {
    maxWidth = 800,
    maxHeight = 800,
    quality = 0.8,
    outputFormat = 'image/webp' // Default to WebP for better compression
  } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    
    reader.onload = (event) => {
      const img = new Image();
      
      img.onerror = () => reject(new Error('Failed to load image'));
      
      img.onload = () => {
        try {
          // Calculate new dimensions while maintaining aspect ratio
          let { width, height } = img;
          
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = Math.floor(width * ratio);
            height = Math.floor(height * ratio);
          }

          // Create canvas and draw resized image
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          
          // Enable image smoothing for better quality
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          
          ctx.drawImage(img, 0, 0, width, height);

          // Convert to base64 with compression
          // WebP provides superior compression compared to JPEG/PNG
          const compressedBase64 = canvas.toDataURL(outputFormat, quality);
          
          // Log compression stats
          const originalSizeKB = Math.round(file.size / 1024);
          const compressedSizeKB = getBase64SizeKB(compressedBase64);
          console.log(`Image compressed (${outputFormat}): ${originalSizeKB}KB → ${compressedSizeKB}KB (${Math.round((1 - compressedSizeKB/originalSizeKB) * 100)}% reduction)`);
          
          resolve(compressedBase64);
        } catch (error) {
          reject(new Error('Failed to compress image: ' + error.message));
        }
      };
      
      img.src = event.target.result;
    };
    
    reader.readAsDataURL(file);
  });
}

/**
 * Get the compressed size in KB
 * @param {string} base64String - Base64 string
 * @returns {number} - Size in KB
 */
export function getBase64SizeKB(base64String) {
  const base64Length = base64String.length - (base64String.indexOf(',') + 1);
  return Math.round((base64Length * 0.75) / 1024);
}

