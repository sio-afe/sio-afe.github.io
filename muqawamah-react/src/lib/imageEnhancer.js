const API_URL = import.meta.env.VITE_IMAGE_PROCESSOR_URL || '/api/enhance-image';

export async function enhanceImage(file, context = 'player-photo') {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('context', context);

  const response = await fetch(API_URL, {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    let message = 'Failed to enhance image.';
    try {
      const errorData = await response.json();
      message = errorData?.error || message;
    } catch {
      // ignore JSON parsing errors
    }
    throw new Error(message);
  }

  const data = await response.json();
  if (!data?.data) {
    throw new Error('Image processor did not return a result.');
  }

  const mimeType = data.mimeType || file.type || 'image/png';
  return `data:${mimeType};base64,${data.data}`;
}

