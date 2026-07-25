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

  // 1. Complaint Summary / Overview / Describe
  if (query.includes("summary") || query.includes("summarize") || query.includes("overview") || query.includes("describe") || query.includes("case info")) {
    answer = `• Victim Profiled: ${victimName}
• Incident Category: ${type}
• Loss / Crime Vector: ${summaryText}
• Extracted Identifiers: ${phoneList ? 'Phone: ' + phoneList + ' | ' : ''}${upiList ? 'UPI: ' + upiList + ' | ' : ''}${bankList ? 'Bank: ' + bankList + ' | ' : ''}${vehicleList ? 'Vehicle: ' + vehicleList : 'Digital logs'}
• Priority Directive: ${nextActionText}`;
    evidence = evidenceList;

  // 2. Missing Evidence / Gaps / Readiness / Evidence Audit
  } else if (query.includes("missing") || query.includes("gap") || query.includes("readiness") || query.includes("collect") || query.includes("weak") || query.includes("lack")) {
    const missingItems = (reliability.missing_evidence || []).length > 0
      ? reliability.missing_evidence
      : [
          type.includes("Assault") ? "Certified Hospital Injury / Wound Certificate" : "Certified Bank Transaction Audit Statement",
          "Telecom Nodal Subscriber CDR Logs",
          "WhatsApp / Chat Application IP Metadata",
          "Sec 65B Electronic Evidence Certificate"
        ];

    answer = `Missing Evidence Checklist for Case ${currentCase.id}:

${missingItems.map((item, idx) => `• Missing: ${item}\n  Reason: Critical to establish statutory chain of custody and ${type} prosecution`).join('\n\n')}

• Investigation Readiness Score: ${currentCase.investigation_score || 75}%`;
    evidence = `Current Cabinet Files: ${evidenceList}`;
    next_action = `Requisition missing item: ${missingItems[0]}`;

  // 3. Contradictions / Inconsistencies / Suspicious / Discrepancies
  } else if (query.includes("contradiction") || query.includes("discrepancy") || query.includes("inconsistency") || query.includes("suspicious") || query.includes("conflict")) {
    answer = `Investigation Contradictions & Discrepancies for Case ${currentCase.id}:

• Parameter Verification Notice:
  Complaint text logs incident as '${type}' involving victim ${victimName}.
• Extracted Endpoint Check:
  ${phoneList ? 'Phone ' + phoneList + ' flagged for subscriber verification.' : 'Digital handles require bank nodal verification.'}
• Timeline Correlation:
  Time gap between initial incident occurrence and formal FIR registration must be verified against witness statements (${witnessList}).
• Procedural Verification:
  Ensure Sec 65B Certificate is attached before submitting digital evidence ${evidenceList} to court.`;
    reasoning = contradictions.map(c => c.description).join(" | ") || "Corroborating narrative statements with extracted technical endpoints.";

  // 4. Investigation Plan / Action Plan / Next Steps / Strategy / What to do
  } else if (query.includes("plan") || query.includes("step") || query.includes("strategy") || query.includes("next action") || query.includes("recommend") || query.includes("what should")) {
    answer = `Prioritized Investigation Plan for Case ${currentCase.id}:

Priority 1: Freeze Beneficiary & Communication Vectors
• Action: Issue immediate debit freeze / block notice for ${upiList || bankList || phoneList || 'suspect handles'}.

Priority 2: Statutory Evidence Preservation
• Action: Issue Section 91 CrPC Notice to ISP/Telecom for CDR and IP logs.

Priority 3: Witness & Victim Corroboration
• Action: Record detailed supplementary statement of victim (${victimName}) and witness (${witnessList}).

Priority 4: Physical & Technical Surveillance
• Action: ${vehicleList ? 'Submit RTO lookup notice for vehicle ' + vehicleList : 'Obtain CCTV footage from incident vicinity'}.

Priority 5: Suspect Interrogation
• Target: Primary contact ${suspectList || phoneList || 'unidentified suspect'}.`;
    next_action = `Execute Priority 1: Freeze ${upiList || bankList || phoneList || 'beneficiary handle'}.`;

  // 5. Suspect Analysis / Who to Interrogate / Priority Target
  } else if (query.includes("suspect") || query.includes("interrogate") || query.includes("question") || query.includes("target") || query.includes("who") || query.includes("accused")) {
    answer = `Suspect & Contact Interrogation Priority for Case ${currentCase.id}:

Highest Priority Target:
• Target: ${phoneList ? 'Phone Handle ' + phoneList : suspectList}
• Reason: First contact vector; directly linked to victim (${victimName}) and ${type} incident.

Secondary Target:
• Target: ${upiList ? 'Beneficiary UPI ' + upiList : 'Unidentified Accomplice / Rider'}
• Reason: Beneficiary endpoint receiving unauthorized transaction/assault vector.

Key Witness Corroboration:
• Witness: ${witnessList}
• Reason: Present during timeline progression; can identify suspect physical traits or voice.`;
    evidence = `Statements of ${victimName} & ${witnessList}`;

  // 6. Applicable Laws / Sections / IPC / BNS / Legal Provisions
  } else if (query.includes("law") || query.includes("section") || query.includes("bns") || query.includes("ipc") || query.includes("legal") || query.includes("act") || query.includes("court")) {
    answer = `Applicable Legal Provisions & Guidelines for Case ${currentCase.id}:

• Primary Offense Charge:
  ${type.includes("Assault") ? "Section 309 BNS / Sec 392 IPC (Robbery with Assault)" : "Section 318(4) BNS / Sec 420 IPC (Cheating & Dishonestly Inducing Delivery of Property)"}

• Cyber / IT Offense Charge:
  ${type.includes("Cyber") || phoneList || upiList ? "Section 66D IT Act (Punishment for Cheating by Personation using Computer Resource)" : "Section 351 BNS (Criminal Intimidation)"}

• Statutory Evidence Certificate:
  Section 65B Indian Evidence Act / Sec 63 BSA (Mandatory for electronic records ${evidenceList})

• Applied Police Guideline:
  ${guideline} (${precedent})`;

  // 7. Vehicle & Mobility Queries
  } else if (query.includes("vehicle") || query.includes("motorcycle") || query.includes("bike") || query.includes("plate") || query.includes("registration") || query.includes("ka-") || query.includes("car")) {
    if (vehicleList) {
      answer = `Vehicle Intelligence & Action Plan:
• Extracted Registration: ${vehicleList}
• Incident Linkage: Operated by suspects during ${type} against victim ${victimName}.
• Directive: Issue immediate RTO lookup notice to identify registered vehicle owner and address.`;
      evidence = `Vehicle Registration: ${vehicleList}`;
      next_action = `Issue RTO ownership verification notice for vehicle ${vehicleList}.`;
    } else {
      answer = `Vehicle Intelligence:
• Status: No suspect vehicle registered for Case ${currentCase.id} (${type}).
• Digital Focus: Investigation proceeds via telecom/bank vectors (${phoneList || upiList || bankList || 'digital logs'}).`;
    }

  // 8. Medical / Injury / Hospital Queries
  } else if (query.includes("wound") || query.includes("medical") || query.includes("hospital") || query.includes("injury") || query.includes("doctor")) {
    answer = `Medical & Physical Injury Audit:
• Case Category: ${type}
• Status: ${type.toLowerCase().includes("assault") ? "Physical injury reported for victim " + victimName : "No physical wound reported for digital fraud file"}.
• Directive: ${type.toLowerCase().includes("assault") ? "Requisition official Wound Certificate from local government casualty hospital." : "Focus on bank audit and CDR preservation."}`;

  // 9. Timeline & Chronology Queries
  } else if (query.includes("timeline") || query.includes("sequence") || query.includes("chronology") || query.includes("time") || query.includes("event")) {
    answer = `Chronological Event Reconstruction for Case ${currentCase.id}:

${(currentCase.timeline || []).map((t, i) => `${i + 1}. ${typeof t === 'string' ? t : (t.date ? t.date + ' — ' : '') + t.event}`).join('\n') || '1. Incident reported by complainant.\n2. Investigation file created.'}`;

  // 10. Crime Pattern / Modus Operandi Queries
  } else if (query.includes("pattern") || query.includes("modus") || query.includes("mo") || query.includes("similar") || query.includes("landmark")) {
    answer = `Crime Pattern & Modus Operandi (MO) Analysis:
• Identified MO: ${type} targeting victim ${victimName}.
• SCRB Landmark Similarity: Historical match found with landmark cases [${matches}].
• Risk Assessment: ${currentCase.confidence || 'High probability of organized network involvement'}.`;

  // 11. Recovery Probability / Risk Queries
  } else if (query.includes("recovery") || query.includes("risk") || query.includes("probability") || query.includes("chance")) {
    answer = `Recovery Probability & Risk Assessment:
• Financial / Asset Recovery Chance: ${upiList || bankList ? 'High (if account freeze notice issued within 24 hours)' : 'Moderate (requires bank audit)'}
• Evidence Reliability Index: ${currentCase.investigation_score || 80}%
• Priority Directive: Execute immediate debit freeze to maximize asset recovery.`;

  // 12. Three Major Points / Key Points Queries
  } else if (query.includes("three") || query.includes("3") || query.includes("important point") || query.includes("key point") || query.includes("fact")) {
    answer = `Three Key Investigation Points for Case ${currentCase.id}:

1. Incident Classification:
   Registered as '${type}' concerning victim ${victimName}. ${summaryText}

2. Key Identifiers Logged:
   ${phoneList ? 'Phone: ' + phoneList + ' | ' : ''}${upiList ? 'UPI: ' + upiList + ' | ' : ''}${bankList ? 'Bank: ' + bankList + ' | ' : ''}${vehicleList ? 'Vehicle: ' + vehicleList : 'Complaint records'}

3. Immediate Priority Action:
   ${nextActionText}`;

  // 13. Dynamic Catch-all Fallback
  } else {
    answer = `Investigative Advisory for Case ${currentCase.id} (${type}):
• Victim: ${victimName}
• Incident Summary: ${summaryText}
• Key Identifiers: ${phoneList ? 'Phone: ' + phoneList + ' ' : ''}${upiList ? 'UPI: ' + upiList + ' ' : ''}${bankList ? 'Bank: ' + bankList + ' ' : ''}${vehicleList ? 'Vehicle: ' + vehicleList : ''}
• Priority Action: ${nextActionText}`;
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
 * Conversational Investigation Copilot with Live Gemini AI Integration & Offline Fallback.
 */
export const askCopilot = async (questionText, currentCase, allCases = [], lang = "en", chatHistory = []) => {
  if (!currentCase) {
    return askCopilotRuleBased(questionText, currentCase, allCases, lang, chatHistory);
  }

  // Pre-calculate structured context from CrimeLens internal engines
  const scrbResults = searchSCRBRepository(currentCase);
  const strategy = generateInvestigationStrategy(currentCase);
  const contradictions = detectContradictions(currentCase, allCases);
  const reliability = calculateEvidenceReliability(currentCase);

  const prompt = `System: You are CrimeLens Copilot, an elite AI-assisted police reasoning assistant for the Karnataka State Police (KSP) investigation workspace.

ROLE & POLICY:
1. You act as an experienced police detective and intelligence analyst assisting the investigating officer.
2. NEVER use forbidden words: "guilty", "criminal", "solved", "confirmed", "proved", "definitely".
3. Use ONLY advisory and probabilistic language: "suggested", "likely", "possible", "may indicate", "requires verification", "advisory".
4. DYNAMIC RESPONSE STRUCTURE BASED ON OFFICER INTENT:
   - For Direct Simple Questions (e.g. amount scammed, names, numbers, quick facts): Provide a direct, concise 1-2 sentence answer matching the question.
   - For Summary / Case Overview: Concise bullet list (Victim, Loss Vector, Channel, Handles, Key Action).
   - For Missing Evidence / Gaps: Evidence Checklist with specific missing items and reasons for each.
   - For Contradictions / Discrepancies: Detected inconsistencies (e.g. monetary discrepancy, timeline gaps).
   - For Investigation Plan / Action Plan: Numbered priority steps (Priority 1, Priority 2, etc.).
   - For Suspect Analysis / Interrogation: Ranked suspects/targets with clear justification for who to interrogate first.
   - For Applicable Laws / Sections: Relevant BNS/IPC sections and procedural guidelines with explanations.
   - For Crime Pattern / Modus Operandi: MO breakdown comparing active case to historical landmark patterns.
   - For Timeline / Sequence: Chronological step-by-step event reconstruction.
   - For Recovery Probability / Risk: Recovery likelihood and risk factor evaluation.
5. Base all answers strictly on the active case context below. Never reuse responses from other cases.

ACTIVE CASE FILE CONTEXT:
- Case ID: ${currentCase.id} (${currentCase.incident_type || 'General'})
- Summary: ${currentCase.summary || 'N/A'}
- Victim: ${currentCase.victim || 'Complainant'}
- Witnesses: ${JSON.stringify(currentCase.witnesses || [])}
- Suspects: ${JSON.stringify(currentCase.suspects || [])}
- Vehicles: ${JSON.stringify(currentCase.vehicles || currentCase.entities?.vehicles || [])}
- Extracted Entities: ${JSON.stringify(currentCase.entities || {})}
- Timeline Events: ${JSON.stringify(currentCase.timeline || [])}
- Missing Evidence Audit: ${JSON.stringify(reliability.missing_evidence || [])}
- Landmark Matches: ${JSON.stringify(scrbResults.landmarks.map(l => ({ id: l.id, title: l.title })))}
- SOP Guidelines: ${JSON.stringify(scrbResults.guidelines.map(g => g.title))}
- Legal Precedents: ${JSON.stringify(scrbResults.precedents.map(p => ({ title: p.title, principle: p.relevant_principle })))}
- Strategy Recommendations: ${JSON.stringify(strategy.immediate_actions || [])}

OFFICER QUESTION: "${questionText}"
RESPONSE LANGUAGE: ${lang === 'kn' ? 'Kannada' : 'English'}

Return ONLY a valid JSON object matching this schema. Do NOT use markdown code fences.
{
  "answer": "Case-specific answer formatted dynamically with clear bullet points, lists, or checklists matching the officer's exact question.",
  "evidence": "${(currentCase.evidence?.documents || []).concat(currentCase.evidence?.photos?.map(p=>p.name) || []).join(', ') || 'Complaint logs'}",
  "matches": "${scrbResults.landmarks.map(m => m.id).join(', ') || 'None'}",
  "guideline": "${scrbResults.guidelines.map(g => g.title).join('; ') || 'Standard SOP'}",
  "precedent": "${scrbResults.precedents.map(p => p.relevant_principle).join('; ') || 'Standard Procedure'}",
  "reasoning": "Reasoning chain evaluated from active case parameters.",
  "confidence": "Likely",
  "next_action": "${strategy.immediate_actions?.[0]?.recommendation || 'Verify complaint parameters.'}"
}`;

  // Candidate proxy endpoints: configured env, relative path, and direct Catalyst function URL
  const proxyEndpoints = Array.from(new Set([
    import.meta.env.VITE_CATALYST_PROXY_URL,
    '/server/geminiProxy',
    'https://project-rainfall-60073743483.development.catalystserverless.in/server/geminiProxy/'
  ].filter(Boolean)));
  const proxyErrors = [];

  // ── Step 1: Try Catalyst Serverless Function Proxy ──
  for (const endpoint of proxyEndpoints) {
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'copilot',
          prompt
        })
      });

      const contentType = res.headers.get('content-type') || '';

      if (res.ok && contentType.includes('application/json')) {
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
        proxyErrors.push(`${endpoint}: proxy returned JSON without success/data`);
      } else {
        const body = await res.text().catch(() => '');
        proxyErrors.push(`${endpoint}: HTTP ${res.status} ${res.statusText}${body ? ` - ${body.slice(0, 180)}` : ''}`);
      }
    } catch (err) {
      proxyErrors.push(`${endpoint}: ${err.message}`);
      console.warn(`[CrimeLens Copilot] Fetch to ${endpoint} failed:`, err.message);
    }
  }

  console.warn('[CrimeLens Copilot] Live Gemini proxy unavailable, using rule-based fallback:', proxyErrors);

  const fallback = askCopilotRuleBased(questionText, currentCase, allCases, lang, chatHistory);
  return {
    ...fallback,
    reasoning: `${fallback.reasoning} Live Gemini proxy unavailable; fallback used.`
  };
};
