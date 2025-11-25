import Busboy from 'busboy';
import fetch from 'node-fetch';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const prompts = {
  'team-logo':
    'Using the provided image, remove any background from this team logo and place it on a clean solid white background. Keep the original colors crisp and preserve all details.',
  'player-photo':
    'Using the provided image of this person, remove the background and replace it with a professional studio gradient background (dark gray to light gray). Keep the person sharp and enhance lighting subtly for a professional headshot look.'
};

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Allow', 'POST');
    res.end(JSON.stringify({ error: 'Method Not Allowed' }));
    return;
  }

  if (!GEMINI_API_KEY) {
    res.statusCode = 500;
    res.end(JSON.stringify({ error: 'Gemini API key is not configured.' }));
    return;
  }

  try {
    const { buffer, mimeType, context } = await parseForm(req);

    const prompt = prompts[context] || prompts['player-photo'];
    const base64Data = buffer.toString('base64');

    // Use gemini-2.5-flash-image (Nano Banana) - the native image generation model
    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': GEMINI_API_KEY
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [
                { text: prompt },
                {
                  inline_data: {
                    mime_type: mimeType,
                    data: base64Data
                  }
                }
              ]
            }
          ],
          generationConfig: {
            responseModalities: ['TEXT', 'IMAGE']
          }
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', errorText);
      res.statusCode = 500;
      res.end(JSON.stringify({ error: 'Gemini API error', details: errorText }));
      return;
    }

    const result = await response.json();
    const inlinePart =
      result?.candidates?.[0]?.content?.parts?.find((part) => part.inline_data) ?? null;

    if (!inlinePart?.inline_data?.data) {
      console.error('Unexpected Gemini response:', JSON.stringify(result, null, 2));
      res.statusCode = 500;
      res.end(JSON.stringify({ error: 'Gemini did not return an edited image.' }));
      return;
    }

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(
      JSON.stringify({
        mimeType: inlinePart.inline_data.mime_type || mimeType,
        data: inlinePart.inline_data.data
      })
    );
  } catch (error) {
    console.error('Image enhancement failed:', error);
    res.statusCode = 500;
    res.end(JSON.stringify({ error: error.message || 'Failed to enhance image.' }));
  }
}

function parseForm(req) {
  return new Promise((resolve, reject) => {
    const busboy = Busboy({
      headers: req.headers,
      limits: { fileSize: 2 * 1024 * 1024 }
    });

    let fileBuffer = null;
    let mimeType = null;
    let context = 'player-photo';

    busboy.on('file', (name, file, info) => {
      const chunks = [];
      mimeType = info.mimeType;

      file.on('data', (data) => chunks.push(data));
      file.on('limit', () => reject(new Error('File too large (max 2MB).')));
      file.on('end', () => {
        fileBuffer = Buffer.concat(chunks);
      });
    });

    busboy.on('field', (name, value) => {
      if (name === 'context') {
        context = value;
      }
    });

    busboy.on('finish', () => {
      if (!fileBuffer) {
        reject(new Error('Image file is required.'));
      } else {
        resolve({ buffer: fileBuffer, mimeType, context });
      }
    });

    busboy.on('error', (err) => reject(err));

    req.pipe(busboy);
  });
}

