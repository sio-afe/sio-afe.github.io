import express from 'express';
import cors from 'cors';
import multer from 'multer';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.warn('⚠️  GEMINI_API_KEY is not set. Image enhancement requests will fail.');
}

app.use(cors({ origin: true }));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 }
});

const prompts = {
  'team-logo':
    'You are a professional sports graphic editor. Remove any background from this team logo and place it on a clean transparent or solid white background. Balance exposure and keep edges crisp.',
  'player-photo':
    'You are a professional sports photographer. Remove the background from this player portrait and replace it with a clean, well-lit studio gradient. Keep the player colors accurate and enhance contrast subtly.'
};

app.post('/api/enhance-image', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Image file is required' });
  }

  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: 'Gemini API key is not configured' });
  }

  const context = req.body.context || 'player-photo';
  const prompt = prompts[context] || prompts['player-photo'];
  const base64Data = req.file.buffer.toString('base64');

  try {
    const geminiResponse = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
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
                    mime_type: req.file.mimetype,
                    data: base64Data
                  }
                }
              ]
            }
          ]
        })
      }
    );

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error('Gemini API error:', errorText);
      return res.status(500).json({ error: 'Gemini API error', details: errorText });
    }

    const geminiJson = await geminiResponse.json();
    const inlinePart = geminiJson?.candidates?.[0]?.content?.parts?.find(
      (part) => part.inline_data
    );

    if (!inlinePart?.inline_data?.data) {
      console.error('Unexpected Gemini response:', JSON.stringify(geminiJson, null, 2));
      return res.status(500).json({ error: 'Gemini did not return an edited image' });
    }

    return res.json({
      mimeType: inlinePart.inline_data.mime_type || req.file.mimetype,
      data: inlinePart.inline_data.data
    });
  } catch (error) {
    console.error('Image enhancement failed:', error);
    return res.status(500).json({ error: 'Failed to enhance image' });
  }
});

app.listen(PORT, () => {
  console.log(`✨ Gemini image enhancement server running on http://localhost:${PORT}`);
});

