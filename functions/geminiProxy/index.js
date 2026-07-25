const express = require('express');
const catalyst = require('zcatalyst-sdk-node');
const path = require('path');

// Load local .env from project root (works whether running from source or .build)
const envPaths = [
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), '../../.env'),
  path.resolve(__dirname, '../../../.env'),
  path.resolve(__dirname, '../../.env'),
];
try {
  const dotenv = require('dotenv');
  for (const p of envPaths) {
    const result = dotenv.config({ path: p, override: false });
    if (!result.error) {
      console.log('[geminiProxy] Loaded .env from:', p);
      break;
    }
  }
} catch (e) {}

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

// In-memory fallback cache for investigations (if Data Store table is offline or initializing)
const memoryInvestigationsStore = new Map();

// Helper to get Catalyst Data Store Table
function getCatalystDataStoreTable(req) {
  try {
    const catalystApp = catalyst.initialize(req);
    return catalystApp.datastore().table('Crime_OS');
  } catch (err) {
    return null;
  }
}

// Helper to get Catalyst User Management / Auth Role
async function getCatalystUserAuth(req) {
  try {
    const catalystApp = catalyst.initialize(req);
    const user = await catalystApp.userManagement().getCurrentUser();
    if (user) {
      return {
        authenticated: true,
        user_id: user.user_id || 'CATALYST_USER_101',
        email_id: user.email_id || 'officer@ksp.gov.in',
        first_name: user.first_name || 'Investigating',
        last_name: user.last_name || 'Officer',
        role_name: user.role_details?.role_name || 'Investigating Officer',
        station: 'Cyber Crime Police Station'
      };
    }
  } catch (err) {
    // SDK offline or preview mode fallback
  }

  return {
    authenticated: true,
    user_id: 'OFFICER_771',
    email_id: 'officer771@ksp.gov.in',
    first_name: 'Investigating',
    last_name: 'Officer',
    role_name: 'Investigating Officer',
    station: 'Cyber Crime Police Station'
  };
}

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
  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_KEY || process.env.VITE_GEMINI_API_KEY;
  res.json({ status: 'ok', live: Boolean(apiKey && apiKey.trim()) });
});

// Main POST handler supporting action routing
app.post('/', async (req, res) => {
  const { action, text, filename, prompt, caseData, caseId, query } = req.body || {};
  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_KEY || process.env.VITE_GEMINI_API_KEY;


  try {
    if (action === 'health') {
      return res.json({ status: 'ok', live: true });
    }

    // ── Task 1: Catalyst Data Store Integration Actions ──
    if (action === 'datastore_save' || action === 'datastore_update') {
      if (!caseData || !caseData.id) {
        return res.status(400).json({ error: 'Missing required field: caseData with id' });
      }

      memoryInvestigationsStore.set(caseData.id, {
        ...caseData,
        updated_at: new Date().toISOString()
      });

      const table = getCatalystDataStoreTable(req);
      if (table) {
        try {
          const rowData = {
            Case_ID: caseData.id,
            FIR_Number: caseData.fir_number || caseData.id,
            Victim_Name: caseData.victim || 'Unknown',
            Complaint_Text: caseData.summary || '',
            Crime_Category: caseData.incident_type || 'Cyber Fraud',
            Extracted_Entities: JSON.stringify(caseData.entities || {}),
            Timeline: JSON.stringify(caseData.timeline || []),
            AI_Summary: caseData.summary || '',
            AI_Confidence: caseData.confidence || '95%',
            Crime_Pattern: JSON.stringify(caseData.patterns || []),
            Behavioral_Profile: JSON.stringify(caseData.behavioral || {}),
            Predictive_Risk: JSON.stringify(caseData.predictive || {}),
            Early_Warning_Status: caseData.warning_status || 'Active',
            Recommendations: JSON.stringify(caseData.recommendations || []),
            Officer_Notes: JSON.stringify(caseData.notes || []),
            Investigation_Status: caseData.status || 'Active',
            Created_Time: caseData.created_at || new Date().toISOString(),
            Updated_Time: new Date().toISOString()
          };

          await table.insertRow(rowData);
          return res.json({ success: true, caseId: caseData.id, source: 'Catalyst Data Store (Crime_OS)' });
        } catch (dsErr) {
          console.warn('[Catalyst DataStore Fallback]:', dsErr.message);
        }
      }

      return res.json({ success: true, caseId: caseData.id, source: 'Catalyst In-Memory Cache' });
    }

    if (action === 'datastore_load') {
      const table = getCatalystDataStoreTable(req);
      if (table) {
        try {
          const catalystApp = catalyst.initialize(req);
          const zqlResponse = await catalystApp.zcql().executeZCQLQuery("SELECT * FROM Crime_OS");
          const rows = zqlResponse.map(r => r.Crime_OS);
          if (rows && rows.length > 0) {
            return res.json({ success: true, data: rows, source: 'Catalyst Data Store' });
          }
        } catch (dsErr) {
          console.warn('[Catalyst DataStore Load Fallback]:', dsErr.message);
        }
      }

      const cached = Array.from(memoryInvestigationsStore.values());
      return res.json({ success: true, data: cached, source: 'Catalyst Memory Engine' });
    }

    if (action === 'datastore_delete') {
      if (caseId) {
        memoryInvestigationsStore.delete(caseId);
      }
      return res.json({ success: true, caseId });
    }

    // ── Task 2: Catalyst Authentication Action ──
    if (action === 'get_user_role') {
      const authInfo = await getCatalystUserAuth(req);
      return res.json({ success: true, data: authInfo });
    }

    // ── Gemini Proxy Actions ──
    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_KEY;

    if (action === 'extract') {
      if (!text) {
        return res.status(400).json({ error: 'Missing required field: text' });
      }
      if (!apiKey || !apiKey.trim()) {
        return res.status(500).json({ success: false, error: 'GEMINI_API_KEY is not configured in backend environment variables.' });
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
      if (!apiKey || !apiKey.trim()) {
        return res.status(500).json({ success: false, error: 'GEMINI_API_KEY is not configured in backend environment variables.' });
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

// Support direct route paths
app.post('/extract', async (req, res) => {
  req.body = { ...req.body, action: 'extract' };
  return app._router.handle(req, res);
});

app.post('/copilot', async (req, res) => {
  req.body = { ...req.body, action: 'copilot' };
  return app._router.handle(req, res);
});

module.exports = app;
