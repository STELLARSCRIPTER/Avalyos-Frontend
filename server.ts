import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Gemini AI Client lazily/safely
  const getAiClient = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is missing.');
    }
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  };

  // API Route: Health Check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'Avalyos Intelligence Ops API' });
  });

  // API Route: Generate AI Intelligence Brief
  app.post('/api/generate-brief', async (req, res) => {
    try {
      const { topic, category, region, timeframe } = req.body;

      if (!topic) {
        return res.status(400).json({ error: 'Topic parameter is required.' });
      }

      const ai = getAiClient();

      const prompt = `You are Avalyos Chief Intelligence AI, a elite geopolitical and financial intelligence analyst.
Generate a structured, high-stakes military/geopolitical/market intelligence assessment for the following request:
- Topic: ${topic}
- Category: ${category || 'Geopolitical'}
- Region: ${region || 'Global'}
- Timeframe: ${timeframe || 'Immediate (0-30 days)'}

Analyze root drivers, market impact across equities, commodities, and FX, threat level (CRITICAL, ELEVATED, or STABLE), and actionable strategic recommendations for institutional investors and defense planners.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: 'Executive title of the intelligence brief' },
              threatLevel: { type: Type.STRING, description: 'CRITICAL, ELEVATED, or STABLE' },
              summary: { type: Type.STRING, description: '2-3 sentence executive intelligence summary' },
              keyDrivers: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Key catalysts or geopolitical drivers',
              },
              marketImpact: {
                type: Type.OBJECT,
                properties: {
                  equities: { type: Type.STRING, description: 'Impact on global equity markets' },
                  commodities: { type: Type.STRING, description: 'Impact on oil, minerals, gold, gas' },
                  fx: { type: Type.STRING, description: 'Impact on currencies' },
                },
                required: ['equities', 'commodities', 'fx'],
              },
              strategicRecommendations: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Actionable hedging or mitigation steps',
              },
            },
            required: ['title', 'threatLevel', 'summary', 'keyDrivers', 'marketImpact', 'strategicRecommendations'],
          },
        },
      });

      const responseText = response.text || '{}';
      const briefData = JSON.parse(responseText);

      return res.json({ success: true, data: briefData });
    } catch (error: any) {
      console.error('Error generating intel brief:', error);
      return res.status(500).json({
        error: 'Failed to generate intelligence brief',
        details: error?.message || String(error),
      });
    }
  });

  // Vite Middleware for development mode
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Avalyos Server] Running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[Avalyos Server] Initialization failed:', err);
});
