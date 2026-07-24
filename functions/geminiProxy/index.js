const express = require('express');
const app = express();

app.use(express.json({ limit: '10mb' }));

// Enable CORS for frontend requests
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Helper function to call Gemini REST API
async function callGeminiAPI(apiKey, promptText) {
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey.trim()}`;
  
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: promptText }] }]
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API HTTP ${response.status}: ${errText}`);
  }

  const result = await response.json();
  const rawText = result?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

  if (!rawText) {
    throw new Error("Empty response from Gemini API");
  }

  const cleaned = rawText
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  return JSON.parse(cleaned);
}

// Health check endpoint
app.get('/health', (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_KEY;
  res.json({ status: 'ok', live: Boolean(apiKey && apiKey.trim()) });
});

// Main POST handler supporting action routing
app.post('/', async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_KEY;

  if (!apiKey || !apiKey.trim()) {
    return res.status(400).json({
      error: 'GEMINI_API_KEY is missing in Catalyst function environment variables',
      live: false
    });
  }

  const { action, text, filename, prompt } = req.body || {};

  try {
    if (action === 'health') {
      return res.json({ status: 'ok', live: true });
    }

    if (action === 'extract') {
      if (!text) {
        return res.status(400).json({ error: 'Missing required field: text' });
      }
      const extractionPrompt = `Analyze the following crime incident description or evidence and extract all relevant entities, metadata, and a chronological event timeline.

Return ONLY a valid JSON object matching this schema. Do NOT use markdown code fences. Return raw JSON only.

{
  "incident_type": "string (one of: Cyber Fraud, Assault, Domestic Violence, Missing Person, Vehicle Theft, Property Dispute)",
  "summary": "string (concise 1-2 sentence summary of the incident)",
  "confidence": "string (e.g. 92%)",
  "entities": {
    "names": ["victim and suspect names"],
    "phones": ["mobile or telephone numbers with country code if present"],
    "upi_ids": ["UPI handles e.g. quickloan@ybl"],
    "bank_accounts": ["bank account numbers"],
    "locations": ["specific areas, streets, or districts mentioned"],
    "dates": ["dates and times mentioned"],
    "amounts": ["monetary amounts with currency symbol"],
    "vehicles": ["vehicle license plate numbers e.g. KA-01-MJ-4567"],
    "urls": ["websites, IP addresses, or links"],
    "usernames": ["social media handles or profile names"]
  },
  "timeline": ["chronological ordered steps describing the incident progression"],
  "evidence_submitted": ["${filename || 'manual_notes.txt'}"]
}

Evidence text to analyze:
"""
${text}
"""`;

      const parsed = await callGeminiAPI(apiKey, extractionPrompt);
      parsed.evidence_submitted = [filename || 'manual_notes.txt'];
      return res.json({ success: true, data: parsed });
    }

    if (action === 'copilot') {
      if (!prompt) {
        return res.status(400).json({ error: 'Missing required field: prompt' });
      }
      const parsed = await callGeminiAPI(apiKey, prompt);
      return res.json({ success: true, data: parsed });
    }

    return res.status(400).json({ error: `Unknown action: ${action}` });
  } catch (err) {
    console.error('[geminiProxy Error]:', err.message);
    return res.status(500).json({ error: err.message, success: false });
  }
});

// Support direct route paths as well
app.post('/extract', async (req, res) => {
  req.body = { ...req.body, action: 'extract' };
  return app._router.handle(req, res);
});

app.post('/copilot', async (req, res) => {
  req.body = { ...req.body, action: 'copilot' };
  return app._router.handle(req, res);
});

module.exports = app;
