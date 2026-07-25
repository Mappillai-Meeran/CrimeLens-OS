import {
  searchSCRBRepository,
  generateInvestigationStrategy,
  detectContradictions,
  calculateEvidenceReliability,
  getReasoningTree
} from './scrbRepository';

const RESPONSES_KN = {
  no_case: "ಯಾವುದೇ ಸಕ್ರಿಯ ಪ್ರಕರಣವನ್ನು ಲೋಡ್ ಮಾಡಲಾಗಿಲ್ಲ. ದಯವಿಟ್ಟು ಪ್ರಕರಣವನ್ನು ಆಯ್ಕೆಮಾಡಿ.",
  confidence_label: "ವಿಶ್ವಾಸಾರ್ಹತೆ ಮಟ್ಟ",
  unsupported: "ಸೂಚಿಸಲಾದ ಪ್ರಶ್ನೆಗೆ ಸೂಕ್ತ ಉತ್ತರ ಲಭ್ಯವಿಲ್ಲ. ದಯವಿಟ್ಟು ನಿಮ್ಮ ಪ್ರಶ್ನೆಯನ್ನು ಸ್ಪಷ್ಟಪಡಿಸಿ.",
  no_evidence: "ಯಾವುದೇ ಪೋಷಕ ಪುರಾವೆಗಳಿಲ್ಲ.",
  no_matches: "ಹೋಲುವ ಐತಿಹಾಸಿಕ ಪ್ರಕರಣಗಳು ಕಂಡುಬಂದಿಲ್ಲ."
};

/**
 * Synchronous Rule-Based Fallback Copilot Response.
 * 100% Dynamic for ANY case (COMP-001, COMP-002, COMP-003, COMP-004, COMP-005, or custom uploaded cases).
 * Never hardcodes any case-specific parameters.
 */
export const askCopilotRuleBased = (questionText, currentCase, allCases = [], lang = "en", chatHistory = []) => {
  if (!currentCase) {
    return {
      answer: lang === "kn" ? RESPONSES_KN.no_case : "No case is currently loaded.",
      evidence: "N/A",
      matches: "N/A",
      guideline: "N/A",
      precedent: "N/A",
      reasoning: "Workspace empty.",
      confidence: "Needs verification",
      next_action: "Please load a case."
    };
  }

  let query = (questionText || "").toLowerCase().trim();
  const type = currentCase.incident_type || "Cyber Fraud";

  const scrbResults = searchSCRBRepository(currentCase);
  const strategy = generateInvestigationStrategy(currentCase);
  const contradictions = detectContradictions(currentCase, allCases);
  const reliability = calculateEvidenceReliability(currentCase);
  const reasoningTree = getReasoningTree(currentCase);

  const ents = currentCase.entities || {};
  const phoneList = (ents.phones || []).length > 0 ? ents.phones.join(', ') : null;
  const upiList = (ents.upi_ids || []).length > 0 ? ents.upi_ids.join(', ') : null;
  const bankList = (ents.bank_accounts || []).length > 0 ? ents.bank_accounts.join(', ') : null;
  const vehicleList = (ents.vehicles || []).concat(currentCase.vehicles || []).length > 0 
    ? (ents.vehicles || []).concat(currentCase.vehicles || []).join(', ') 
    : null;
  const victimName = currentCase.victim || ents.names?.[0] || 'Complainant';
  const suspectList = (currentCase.suspects || []).length > 0 ? currentCase.suspects.join(', ') : 'Unidentified suspect';
  const witnessList = (currentCase.witnesses || []).length > 0 ? currentCase.witnesses.join(', ') : 'Witnesses under statement review';
  const summaryText = currentCase.summary || 'Incident reported to police.';
  const nextActionText = strategy.immediate_actions?.[0]?.recommendation || 'Verify complaint parameters.';
  const evidenceList = (currentCase.evidence?.documents || []).concat(currentCase.evidence?.photos?.map(p=>p.name) || []).concat(currentCase.evidence?.audio?.map(a=>a.name) || []).join(', ') || 'Complaint logs';

  let answer = "";
  let evidence = `Primary evidence files: ${evidenceList}`;
  let matches = scrbResults.landmarks.map(m => m.id).join(", ") || "None";
  let guideline = scrbResults.guidelines.map(g => `${g.title} SOP`).join("; ") || "Standard Police SOP";
  let precedent = scrbResults.precedents.map(p => p.relevant_principle).join("; ") || "Mandatory FIR registration under Section 154 CrPC";
  let reasoning = `Evaluated parameters for active case ${currentCase.id} (${type}).`;
  let confidence = "Likely";
  let next_action = nextActionText;

  // ── 100% Dynamic Case-Specific Intent Routing ─────────────────────────────

  // 1. Vehicle & Mobility Queries
  if (query.includes("vehicle") || query.includes("motorcycle") || query.includes("bike") || query.includes("plate") || query.includes("registration") || query.includes("ka-") || query.includes("car")) {
    if (vehicleList) {
      answer = `Vehicle Intelligence for Case ${currentCase.id} (${type}):
Extracted vehicle registration is ${vehicleList}. Suspects operated vehicle ${vehicleList} in connection with victim ${victimName}. Priority procedure: Submit RTO vehicle registration lookup notice for owner identification.`;
      evidence = `Vehicle Registration: ${vehicleList}, ${evidenceList}`;
      next_action = `Issue RTO ownership verification notice for vehicle ${vehicleList}.`;
    } else {
      answer = `No suspect vehicle indicators are logged for Case ${currentCase.id} (${type}).
This incident operates primarily via telecom/digital channels (${phoneList ? 'Phone: ' + phoneList + '; ' : ''}${upiList ? 'UPI: ' + upiList + '; ' : ''}${bankList ? 'Bank: ' + bankList : ''}). Priority actions focus on bank beneficiary account freezing and telecom CDR nodal tracing.`;
      evidence = `Digital handles: ${phoneList ? 'Phone (' + phoneList + '), ' : ''}${upiList ? 'UPI (' + upiList + ')' : 'Complaint text'}`;
    }

  // 2. Medical / Injury / Hospital / Wound Queries
  } else if (query.includes("wound") || query.includes("medical") || query.includes("hospital") || query.includes("injury") || query.includes("certificate") || query.includes("doctor")) {
    if (type.toLowerCase().includes("assault") || type.toLowerCase().includes("injury") || type.toLowerCase().includes("violence")) {
      answer = `Medical & Injury Assessment for Case ${currentCase.id} (${type}):
Physical assault was reported involving victim ${victimName} and witness (${witnessList}). Priority investigative procedure: Request an official Wound Certificate / Medical Injury Assessment from the local government hospital to establish physical injury proof under court prosecution.`;
      evidence = `Witness statement of ${witnessList}, hospital casualty dispatch log`;
      next_action = `Request immediate injury certificate from local government hospital.`;
    } else {
      answer = `Physical wound certificates are not applicable for Case ${currentCase.id} (${type}).
Investigation priorities for this ${type} file focus on securing certified bank transaction statements, telecom CDR logs, and digital chat transcripts.`;
      next_action = nextActionText;
    }

  // 3. Legal SOP / Guideline / Section Queries
  } else if (query.includes("sop") || query.includes("guideline") || query.includes("law") || query.includes("section") || query.includes("bns") || query.includes("ipc") || query.includes("procedure")) {
    answer = `Applicable Legal SOP & Guidelines for Case ${currentCase.id} (${type}):
• Applied SOP Guideline: ${guideline}
• Relevant Legal Precedent: ${precedent}
• Mandatory Statutory Procedure: Preserve digital & documentary evidence (${evidenceList}) under Sec 65B Evidence Certificate and follow Crime Branch investigation standards for ${type}.`;

  // 4. Suspect & Witness Queries
  } else if (query.includes("suspect") || query.includes("witness") || query.includes("who") || query.includes("people") || query.includes("person") || query.includes("grabber") || query.includes("rider") || query.includes("actor")) {
    answer = `Suspect & Witness Registry for Case ${currentCase.id} (${type}):
• Logged Suspects: ${suspectList}
• Logged Witness(es): ${witnessList}
• Victim / Complainant: ${victimName}
• Incident Category: ${type}`;
    evidence = `Statements of ${victimName} and ${witnessList}`;

  // 5. Timeline / Chronology Queries
  } else if (query.includes("timeline") || query.includes("sequence") || query.includes("chronology") || query.includes("time") || query.includes("when") || query.includes("event")) {
    answer = `Reconstructed Timeline for Case ${currentCase.id} (${type}):
${(currentCase.timeline || []).map(t => '• ' + (typeof t === 'string' ? t : (t.date ? t.date + ': ' : '') + t.event)).join('\n') || '• Timeline steps registered in file.'}`;

  // 6. Missing Evidence / Readiness Queries
  } else if (query.includes("missing") || query.includes("gap") || query.includes("readiness") || query.includes("weak") || query.includes("collect")) {
    answer = `Evidence Cabinet & Readiness Audit for Case ${currentCase.id} (${type}):
• Investigation Readiness Score: ${currentCase.investigation_score || 75}%
• Missing Recommended Evidence: ${(reliability.missing_evidence || []).join(', ') || 'None'}
• Active Cabinet Evidence: ${evidenceList}`;
    next_action = `Acquire missing evidence: ${(reliability.missing_evidence || [])[0] || nextActionText}`;

  // 7. Main Findings Queries
  } else if (query.includes("finding") || query.includes("main finding") || query.includes("key finding")) {
    answer = `Key Investigation Findings for Case ${currentCase.id} (${type}):

1. Primary Incident Finding:
Incident classified as '${type}' concerning victim ${victimName}. ${summaryText}

2. Key Extracted Identifiers:
Extracted parameters: ${phoneList ? 'Phone: ' + phoneList + '; ' : ''}${upiList ? 'UPI: ' + upiList + '; ' : ''}${bankList ? 'Bank: ' + bankList + '; ' : ''}${vehicleList ? 'Vehicle: ' + vehicleList + '; ' : 'Digital logs'}

3. Priority Action Finding:
Suggested immediate action: ${nextActionText}`;

    evidence = `Supported by extracted parameters and complaint narrative logs.`;

  // 8. Key Facts Queries
  } else if (query.includes("fact") || query.includes("important fact") || query.includes("key fact")) {
    answer = `Key Facts Logged for Case ${currentCase.id}:
• File ID: ${currentCase.id}
• Category: ${type}
• Victim / Complainant: ${victimName}
• Suspects: ${suspectList}
• Identifiers: ${phoneList ? 'Phone ' + phoneList + ' ' : ''}${upiList ? 'UPI ' + upiList + ' ' : ''}${bankList ? 'Bank ' + bankList + ' ' : ''}${vehicleList ? 'Vehicle ' + vehicleList : ''}
• Incident Summary: ${summaryText}`;

  // 9. Three Major Points Queries
  } else if (query.includes("three") || query.includes("3") || query.includes("important point")) {
    answer = `Three Major Important Points for Case ${currentCase.id}:

1. Incident Classification & Modus Operandi:
Case ${currentCase.id} is registered as '${type}' concerning victim ${victimName}. ${summaryText}

2. Primary Extracted Evidence:
Key parameters: ${phoneList ? 'Phone: ' + phoneList + '; ' : ''}${upiList ? 'UPI: ' + upiList + '; ' : ''}${bankList ? 'Bank: ' + bankList + '; ' : ''}${vehicleList ? 'Vehicle: ' + vehicleList + '; ' : 'Complaint files'}

3. Immediate Priority Action:
${nextActionText}`;

  // 10. Summary Queries
  } else if (query.includes("summary") || query.includes("summarize") || query.includes("overview")) {
    answer = `Executive Summary for Case ${currentCase.id}:
Case ${currentCase.id} is an active ${type} investigation. ${summaryText} Key endpoints: ${phoneList ? 'Phone: ' + phoneList + ' ' : ''}${upiList ? 'UPI: ' + upiList + ' ' : ''}${bankList ? 'Bank: ' + bankList + ' ' : ''}${vehicleList ? 'Vehicle: ' + vehicleList : ''}. Priority next step: ${nextActionText}`;

  // 11. Reasoning / Why Queries
  } else if (query === "why?" || query === "why" || query.includes("explain why") || query.includes("reason")) {
    answer = `Advisory Reasoning Path for Case ${currentCase.id} (${type}):
The recommendation of "${nextActionText}" is established by CrimeLens reasoning core based on active guideline SOPs and parameters extracted for ${type}.`;
    reasoning = reasoningTree.map(n => n.evidence_trace).join(" -> ");

  // 12. Dynamic Contextual Fallback (Catch-all for any question)
  } else {
    answer = `Investigative Advisory for Case ${currentCase.id} (${type}):
Concerning victim ${victimName}. ${summaryText} Key parameters: ${phoneList ? 'Phone: ' + phoneList + '; ' : ''}${upiList ? 'UPI: ' + upiList + '; ' : ''}${bankList ? 'Bank: ' + bankList + '; ' : ''}${vehicleList ? 'Vehicle: ' + vehicleList + '; ' : ''} Recommended next step: ${nextActionText}`;
  }

  if (lang === "kn") {
    return {
      answer: `[ಕನ್ನಡ] ${answer}`,
      evidence: `ಪುರಾವೆ: ${evidence}`,
      matches: `ಹೊಂದಾಣಿಕೆಗಳು: ${matches}`,
      guideline: `ಮಾರ್ಗಸೂಚಿ: ${guideline}`,
      precedent: `ಪೂರ್ವನಿದರ್ಶನ: ${precedent}`,
      reasoning: `ತಾರ್ಕಿಕ ವಿವರಣೆ: ${reasoning}`,
      confidence: `ವಿಶ್ವಾಸಾರ್ಹತೆ: ${confidence}`,
      next_action: `ಮುಂದಿನ ಕ್ರಮ: ${next_action}`
    };
  }

  return {
    answer,
    evidence,
    matches,
    guideline,
    precedent,
    reasoning,
    confidence,
    next_action
  };
};

/**
 * Helper: Call Gemini API directly (for client-side / local dev fallback when proxy is offline).
 */
const callGeminiDirectly = async (apiKey, prompt) => {
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey.trim()}`;
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 1024,
        responseMimeType: 'application/json'
      }
    })
  });

  if (!response.ok) throw new Error(`Gemini Direct API returned ${response.status}`);
  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Empty text candidate from Gemini API');
  const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
  return JSON.parse(cleaned);
};

/**
 * Conversational Investigation Copilot with Live Gemini AI Integration & Offline Fallback.
 */
export const askCopilot = async (questionText, currentCase, allCases = [], lang = "en", chatHistory = []) => {
  if (!currentCase) {
    return askCopilotRuleBased(questionText, currentCase, allCases, lang, chatHistory);
  }

  const proxyUrl = import.meta.env.VITE_CATALYST_PROXY_URL || '/server/geminiProxy';
  const directApiKey = import.meta.env.VITE_GEMINI_API_KEY || (typeof window !== 'undefined' && window.localStorage?.getItem('gemini_api_key'));

  // Pre-calculate structured context from CrimeLens internal engines
  const scrbResults = searchSCRBRepository(currentCase);
  const strategy = generateInvestigationStrategy(currentCase);
  const contradictions = detectContradictions(currentCase, allCases);
  const reliability = calculateEvidenceReliability(currentCase);
  const reasoningTree = getReasoningTree(currentCase);

  const prompt = `System: You are CrimeLens Copilot, an AI-assisted reasoning layer for the Karnataka State Police (KSP) investigation workspace.

RULES & POLICY:
1. You NEVER solve cases, determine guilt, make legal conclusions, or name suspects as criminals.
2. NEVER use forbidden words: "guilty", "criminal", "solved", "confirmed", "proved", "definitely".
3. Use ONLY advisory and probabilistic language: "suggested", "likely", "possible", "may indicate", "requires verification", "advisory".
4. The CrimeLens internal engines provided below are the primary source of truth. Explain and summarize their findings clearly.
5. Answer the officer's question directly using the specific case context below:
   - For vehicle queries: State vehicle license plate and details logged for THIS case (or state if no vehicle logged).
   - For medical/injury queries: State medical assessment status for THIS case.
   - For SOP/guidelines: State applicable guidelines and precedents for THIS case.
   - For main findings, 3 points, or summary: Provide a structured breakdown tailored specifically to THIS case.
6. ALWAYS remind the user: "The AI assists. The investigating officer remains the final decision maker."
7. Keep response concise (under 250 words).

STRUCTURED CRIMELENS ENGINE OUTPUTS:
- Case ID: ${currentCase.id} (${currentCase.incident_type || 'General'})
- Summary: ${currentCase.summary || 'N/A'}
- Victim: ${currentCase.victim || 'Complainant'}
- Witnesses: ${JSON.stringify(currentCase.witnesses || [])}
- Suspects: ${JSON.stringify(currentCase.suspects || [])}
- Vehicle Vectors: ${JSON.stringify(currentCase.vehicles || currentCase.entities?.vehicles || [])}
- Extracted Entities: ${JSON.stringify(currentCase.entities || {})}
- Timeline Events: ${JSON.stringify(currentCase.timeline || [])}
- Historical Landmark Matches: ${JSON.stringify(scrbResults.landmarks.map(l => ({ id: l.id, title: l.title, similarity: l.similarity })))}
- Police Guidelines / SOPs: ${JSON.stringify(scrbResults.guidelines.map(g => g.title))}
- Legal Precedents / Principles: ${JSON.stringify(scrbResults.precedents.map(p => ({ title: p.title, principle: p.relevant_principle })))}
- Strategy Recommendations: ${JSON.stringify(strategy.immediate_actions || [])}

OFFICER QUESTION: "${questionText}"
RESPONSE LANGUAGE: ${lang === 'kn' ? 'Kannada' : 'English'}

Return ONLY a valid JSON object matching this schema. Do NOT use markdown code fences.
{
  "answer": "Case-specific natural language answer directly addressing the officer's question.",
  "evidence": "Brief list of supporting evidence items.",
  "matches": "${scrbResults.landmarks.map(m => m.id).join(', ') || 'None'}",
  "guideline": "${scrbResults.guidelines.map(g => g.title).join('; ') || 'Standard SOP'}",
  "precedent": "${scrbResults.precedents.map(p => p.relevant_principle).join('; ') || 'Standard Procedure'}",
  "reasoning": "Explanation of the reasoning chain from CrimeLens engines.",
  "confidence": "Likely",
  "next_action": "${strategy.immediate_actions?.[0]?.recommendation || 'Verify complaint parameters.'}"
}`;

  // ── Step 1: Try Catalyst Serverless Function Proxy ──
  try {
    const res = await fetch(proxyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'copilot',
        prompt
      })
    });

    if (res.ok) {
      const result = await res.json();
      if (result && result.success && result.data) {
        const parsed = result.data;
        return {
          answer: parsed.answer || "Advisory summary available from CrimeLens engines.",
          evidence: parsed.evidence || "Primary complaint logs.",
          matches: parsed.matches || scrbResults.landmarks.map(m => m.id).join(", "),
          guideline: parsed.guideline || scrbResults.guidelines.map(g => `${g.title} SOP`).join("; "),
          precedent: parsed.precedent || scrbResults.precedents.map(p => p.relevant_principle).join("; "),
          reasoning: parsed.reasoning || "Reasoning chain evaluated from parameters.",
          confidence: parsed.confidence || "Likely",
          next_action: parsed.next_action || strategy.immediate_actions?.[0]?.recommendation || "Verify parameters."
        };
      }
    }
  } catch (err) {
    console.warn("[CrimeLens Copilot] Catalyst geminiProxy call failed:", err.message);
  }

  // ── Step 2: Try Direct Gemini API Call (if key is set in local env/storage) ──
  if (directApiKey && directApiKey.trim()) {
    try {
      const parsed = await callGeminiDirectly(directApiKey, prompt);
      if (parsed) {
        return {
          answer: parsed.answer || "Advisory summary available from CrimeLens engines.",
          evidence: parsed.evidence || "Primary complaint logs.",
          matches: parsed.matches || scrbResults.landmarks.map(m => m.id).join(", "),
          guideline: parsed.guideline || scrbResults.guidelines.map(g => `${g.title} SOP`).join("; "),
          precedent: parsed.precedent || scrbResults.precedents.map(p => p.relevant_principle).join("; "),
          reasoning: parsed.reasoning || "Reasoning chain evaluated from parameters.",
          confidence: parsed.confidence || "Likely",
          next_action: parsed.next_action || strategy.immediate_actions?.[0]?.recommendation || "Verify parameters."
        };
      }
    } catch (err) {
      console.warn("[CrimeLens Copilot] Direct Gemini API call failed:", err.message);
    }
  }

  // ── Step 3: Fallback to 100% Dynamic Rule-Based Engine ──
  return askCopilotRuleBased(questionText, currentCase, allCases, lang, chatHistory);
};
