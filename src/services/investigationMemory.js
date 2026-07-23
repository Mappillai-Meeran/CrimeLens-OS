/**
 * Investigation Memory — Persistent Case Knowledge Base
 * Stores completed cases and enables similarity-based retrieval.
 * Backed by localStorage under the key "crimelens_memory".
 *
 * Storage schema per memory entry:
 * {
 *   id, crime_type, timeline, evidence, questions_asked, actions_taken,
 *   recovered_assets, final_outcome, investigation_time_days, date_closed,
 *   officer, entities, investigation_score
 * }
 *
 * Vocabulary rule: never claim cases are identical — only suggest similarity.
 */

const STORAGE_KEY = 'crimelens_memory';

// ─── Persistence helpers ────────────────────────────────────────────────────

export const getAllMemories = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
};

const saveMemories = (memories) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(memories));
};

// ─── Save a completed case to memory ───────────────────────────────────────

export const saveCompletedCase = (caseObj) => {
  const memories = getAllMemories();
  // Avoid duplicate entries
  const exists = memories.some(m => m.id === caseObj.id);
  if (exists) return;

  const entry = {
    id: caseObj.id,
    crime_type: caseObj.incident_type || 'Unknown',
    timeline: caseObj.timeline || [],
    evidence: {
      documents: caseObj.evidence?.documents || [],
      photos: caseObj.evidence?.photos || [],
      audio: caseObj.evidence?.audio || []
    },
    questions_asked: caseObj.questions_asked || [],
    actions_taken: caseObj.actions_taken || [
      'Victim statement recorded',
      'Entities extracted',
      'Pattern analysis run'
    ],
    recovered_assets: caseObj.recovered_assets || caseObj.money_trail?.filter(t => t.status === 'Recovered') || [],
    final_outcome: caseObj.final_outcome || caseObj.ai_summary || 'Case closed by officer.',
    investigation_time_days: caseObj.investigation_time_days || Math.round(
      (new Date() - new Date(caseObj.date_opened || Date.now())) / (1000 * 60 * 60 * 24)
    ) || 1,
    date_closed: new Date().toISOString(),
    officer: caseObj.officer || 'OFFICER-771',
    entities: caseObj.entities || {},
    investigation_score: caseObj.investigation_score || 0,
    victim: caseObj.victim || 'Unknown'
  };

  memories.push(entry);
  saveMemories(memories);
  return entry;
};

// ─── Delete a memory entry ──────────────────────────────────────────────────

export const deleteMemory = (id) => {
  const updated = getAllMemories().filter(m => m.id !== id);
  saveMemories(updated);
};

export const clearAllMemories = () => saveMemories([]);

// ─── Seed demo memories if storage is empty ────────────────────────────────

export const seedDemoMemories = () => {
  const existing = getAllMemories();
  if (existing.length > 0) return;

  const demos = [
    {
      id: 'MEM-001',
      crime_type: 'Cyber Fraud',
      timeline: [
        { date: '2026-01-10', event: 'Victim received cold call from unknown UPI operator' },
        { date: '2026-01-10', event: 'Victim transferred ₹20,000 to fraudloan@ybl' },
        { date: '2026-01-12', event: 'Account freeze request issued to bank within 36 hours' },
        { date: '2026-01-15', event: 'Partial recovery: ₹12,000 frozen before withdrawal' }
      ],
      evidence: { documents: ['Bank_Receipt_MEM001.pdf', 'Screenshot_Chat.png'], photos: [], audio: [] },
      questions_asked: [
        'Did the caller use a regional accent?',
        'Which platform did you first see the loan advertisement?',
        'Did you receive any official-looking documents via WhatsApp?'
      ],
      actions_taken: [
        'UPI freeze request issued within 24 hours',
        'Telecom subscriber lookup for +91-9876543210',
        'Cybercrime portal FIR lodged',
        'Bank notified with transaction reference'
      ],
      recovered_assets: [{ description: 'Partial bank freeze', amount: '₹12,000' }],
      final_outcome: 'Partial recovery of ₹12,000. SIM registration traced to courier address. Case forwarded to cybercrime division.',
      investigation_time_days: 14,
      date_closed: '2026-01-24T00:00:00Z',
      officer: 'OFFICER-552',
      entities: { phones: ['+91-9876543210'], upi_ids: ['fraudloan@ybl'], names: [] },
      investigation_score: 82,
      victim: 'Anita Sharma'
    },
    {
      id: 'MEM-002',
      crime_type: 'Assault',
      timeline: [
        { date: '2026-02-03', event: 'Assault reported at Metro Center transit exit' },
        { date: '2026-02-03', event: 'CCTV footage pulled from 3 municipal cameras within 6 hours' },
        { date: '2026-02-05', event: 'Vehicle KA-01-XZ-1234 traced to rental agency in Koramangala' },
        { date: '2026-02-07', event: 'Two suspects identified from rental contract KYC' }
      ],
      evidence: { documents: ['Medical_Certificate.pdf', 'CCTV_Grab_02.png'], photos: ['CCTV_Grab_02.png'], audio: [] },
      questions_asked: [
        'Did either suspect speak before the attack?',
        'Were helmets worn — full-face or open-face?',
        'Did you see the direction they fled after the incident?'
      ],
      actions_taken: [
        'CCTV footage secured from 3 cameras within 6 hours',
        'Vehicle plate traced via RTO database',
        'Rental agency KYC documents obtained'
      ],
      recovered_assets: [],
      final_outcome: 'Suspects identified via rental KYC. Handbag recovered. Case forwarded to court with CCTV evidence.',
      investigation_time_days: 9,
      date_closed: '2026-02-12T00:00:00Z',
      officer: 'OFFICER-771',
      entities: { phones: [], vehicles: ['KA-01-XZ-1234'], names: ['Suspect A', 'Suspect B'] },
      investigation_score: 91,
      victim: 'Priya Mehta'
    },
    {
      id: 'MEM-003',
      crime_type: 'Missing Person',
      timeline: [
        { date: '2026-03-01', event: 'Missing report filed by family member' },
        { date: '2026-03-01', event: 'Cell tower dump requested for last known device location' },
        { date: '2026-03-02', event: 'Bus ticketing database queried — no match' },
        { date: '2026-03-03', event: 'Person located at relative\'s residence in adjoining district' }
      ],
      evidence: { documents: ['Missing_Report_MEM003.pdf'], photos: ['Photo_Victim_MEM003.jpg'], audio: [] },
      questions_asked: [
        'Did the missing person mention any conflict at home or school recently?',
        'Were there any unusual communications or contacts in the past week?',
        'Did they carry any cash or bank card?'
      ],
      actions_taken: [
        'Cell tower dump requested within 2 hours',
        'Advisory bulletin issued to district units',
        'Transport database queried',
        'Coordination with school authorities'
      ],
      recovered_assets: [],
      final_outcome: 'Person located safely at relative\'s house. Voluntary departure confirmed. Case closed with welfare note.',
      investigation_time_days: 3,
      date_closed: '2026-03-04T00:00:00Z',
      officer: 'OFFICER-334',
      entities: { phones: ['+91-9900112233'], vehicles: [], names: ['Priya'] },
      investigation_score: 88,
      victim: 'Priya (Minor)'
    }
  ];

  saveMemories(demos);
};

// ─── Find similar memories ─────────────────────────────────────────────────

/**
 * Returns top matching past investigation memories for a given current case.
 * Scores each memory entry and returns results with similarity metadata.
 * NEVER claims cases are identical — only suggests similarity.
 */
export const findSimilarMemories = (currentCase, limit = 5) => {
  if (!currentCase) return [];
  const memories = getAllMemories();
  if (memories.length === 0) return [];

  const currentEntities = currentCase.entities || {};
  const currentPhones = new Set(currentEntities.phones || []);
  const currentUPIs = new Set(currentEntities.upi_ids || []);
  const currentVehicles = new Set(currentEntities.vehicles || []);

  const scored = memories.map(mem => {
    let score = 0;
    const reasons = [];

    // Same crime type (major signal)
    if (mem.crime_type === currentCase.incident_type) {
      score += 40;
      reasons.push(`Both involve ${mem.crime_type} incidents`);
    }

    // Shared phone numbers
    (mem.entities?.phones || []).forEach(phone => {
      if (currentPhones.has(phone)) {
        score += 30;
        reasons.push(`Shared phone number: ${phone}`);
      }
    });

    // Shared UPI IDs
    (mem.entities?.upi_ids || []).forEach(upi => {
      if (currentUPIs.has(upi)) {
        score += 30;
        reasons.push(`Shared UPI handle: ${upi}`);
      }
    });

    // Shared vehicles
    (mem.entities?.vehicles || []).forEach(v => {
      if (currentVehicles.has(v)) {
        score += 25;
        reasons.push(`Shared vehicle: ${v}`);
      }
    });

    // High investigation score in memory (actionable precedent)
    if (mem.investigation_score >= 80) {
      score += 5;
      reasons.push('Previous investigation reached high completion score');
    }

    // Average recovery time signal
    const avgTime = mem.investigation_time_days;

    return { memory: mem, score: Math.min(score, 100), reasons, avgTime };
  });

  return scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
};

// ─── Compute memory statistics ─────────────────────────────────────────────

export const getMemoryStats = () => {
  const memories = getAllMemories();
  if (memories.length === 0) return null;

  const avgTime = Math.round(
    memories.reduce((acc, m) => acc + (m.investigation_time_days || 0), 0) / memories.length
  );

  const typeDistribution = {};
  memories.forEach(m => {
    typeDistribution[m.crime_type] = (typeDistribution[m.crime_type] || 0) + 1;
  });

  const avgScore = Math.round(
    memories.reduce((acc, m) => acc + (m.investigation_score || 0), 0) / memories.length
  );

  const totalRecovered = memories.reduce((acc, m) => {
    return acc + (m.recovered_assets || []).reduce((sum, r) => {
      return sum + (parseFloat(String(r.amount || '0').replace(/[^\d.]/g, '')) || 0);
    }, 0);
  }, 0);

  return { total: memories.length, avgTime, avgScore, typeDistribution, totalRecovered };
};
