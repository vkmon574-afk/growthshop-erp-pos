import express from 'express';
import path from 'path';
const __dirname = process.cwd();
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = process.cwd();
const __dirname = process.cwd();
async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '15mb' }));

  // Initialize Gemini API client if API key is present
  const getGeminiClient = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return null;
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  };

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  // Receipt OCR / AI Scanner route
  app.post('/api/scan-receipt', async (req, res) => {
    try {
      const { imageBase64, mimeType = 'image/jpeg' } = req.body;
      if (!imageBase64) {
        return res.status(400).json({ error: 'imageBase64 parameter is required' });
      }

      if (!['image/jpeg', 'image/png', 'image/webp'].includes(mimeType)) {
        return res.status(400).json({ error: 'Unsupported image type' });
      }

      const ai = getGeminiClient();
      if (!ai) {
        // Fallback response if GEMINI_API_KEY is missing
        return res.json({
          extracted: {
            amount: 145.50,
            vatAmount: 7.28,
            category: 'Stock',
            merchant: 'Al Madina Wholesalers',
            date: new Date().toISOString().split('T')[0],
            notes: 'Batch receipt scanned (Demo Mode: API Key pending)',
            confidence: 0.85
          }
        });
      }

      // Clean base64 string if data URL prefix exists
      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          {
            parts: [
              {
                inlineData: {
                  data: cleanBase64,
                  mimeType,
                },
              },
              {
                text: 'Analyze this receipt image for a UAE business expense. Extract the total amount, the VAT amount (or calculate 5% if unspecified), business expense category (Stock, Rent, Salary, Electricity, or Other), merchant name, date, and brief summary of items.',
              },
            ],
          },
        ],
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              amount: { type: Type.NUMBER, description: 'Total expense amount in AED' },
              vatAmount: { type: Type.NUMBER, description: 'VAT amount in AED (5% in UAE)' },
              category: { type: Type.STRING, description: 'One of: Stock, Rent, Salary, Electricity, Other' },
              merchant: { type: Type.STRING, description: 'Store or vendor name' },
              date: { type: Type.STRING, description: 'Date in YYYY-MM-DD format' },
              notes: { type: Type.STRING, description: 'Brief description or list of main items' },
            },
            required: ['amount', 'vatAmount', 'category', 'merchant'],
          },
        },
      });

      const text = response.text;
      if (!text) {
        throw new Error('No analysis generated from Gemini model');
      }

      let parsedData;
      try {
        parsedData = JSON.parse(text);
      } catch {
        return res.status(500).json({ error: 'Invalid AI response' });
      }

      return res.json({ extracted: parsedData });
    } catch (err: any) {
      console.error('Error scanning receipt with Gemini:', err);
      return res.status(500).json({
        error: err?.message || 'Failed to analyze receipt image',
      });
    }
  });

  // Vite middleware or static serving
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
