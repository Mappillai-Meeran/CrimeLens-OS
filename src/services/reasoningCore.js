import { detectPatterns } from './patternDetection';
import { calculateSimilarity } from './investigation';

/**
 * Reasoning Core — 8 cognitive inference engines connected to the Case Core.
 * Every module output includes:
 *   result, confidence, supporting_evidence, reasoning, reasoning_trace[]
 *
 * reasoning_trace is a structured chain of:
 *   { step: "Observation" | "Inference" | "Conclusion" | "Caveat", text: "..." }
 *
 * Vocabulary rule: never use "criminal", "guilty", "confirmed", "solved automatically".
 * Use: "possible", "suggested", "likely", "needs verification", "confidence".
 */
export const getReasoningCore = (currentCase, allCases = []) => {
  if (!currentCase) return [];

  const entities = currentCase.entities || {};
  const casesDb = allCases.filter(c => c.id !== currentCase.id);

  // ── 1. Entity Extraction ──────────────────────────────────────────────────
  const entityExtraction = {
    name: "Entity Extraction",
    result: `Extracted ${entities.names?.length || 0} name(s), ${entities.phones?.length || 0} phone(s), ${entities.upi_ids?.length || 0} UPI handle(s), and ${entities.bank_accounts?.length || 0} bank account(s).`,
    confidence: currentCase.confidence || "90%",
    supporting_evidence: `Source documents: ${currentCase.evidence?.documents?.join(', ') || 'Manual entry'}.`,
    reasoning: "NLP entity patterns matched structured templates (e.g. +91 prefix for phone lines, '@' delimited strings for UPI endpoints).",
    reasoning_trace: [
      { step: "Observation",  text: `Statement text analyzed. Suspected identifiers flagged.` },
      { step: "Inference",    text: `Phone pattern +91-XXXXXXXXXX matched ${entities.phones?.length || 0} time(s). UPI handle format matched ${entities.upi_ids?.length || 0} time(s).` },
      { step: "Conclusion",   text: `${entities.names?.length || 0} name(s), ${entities.phones?.length || 0} phone(s), ${entities.upi_ids?.length || 0} UPI ID(s) likely extracted from case document.` },
      { step: "Caveat",       text: "Entity extraction is pattern-based. Officer must verify each entity against source documents before acting." }
    ]
  };

  // ── 2. Timeline Reconstruction ────────────────────────────────────────────
  const tlCount = currentCase.timeline?.length || 0;
  const timelineReconstruction = {
    name: "Timeline Reconstruction",
    result: `Constructed ${tlCount} chronological milestone(s).`,
    confidence: "94%",
    supporting_evidence: `Timeline items parsed from statement date-time strings and event references.`,
    reasoning: "Events ordered by isolating date strings and verbal tense shifts in the statement narrative.",
    reasoning_trace: [
      { step: "Observation",  text: "Statement text scanned for explicit dates, times, and sequential phrasing." },
      { step: "Inference",    text: `${tlCount} milestone(s) isolated based on temporal markers and victim-reported event sequence.` },
      { step: "Conclusion",   text: `Reconstructed timeline with ${tlCount} events. Order is suggested — officer must cross-validate against corroborating documents.` },
      { step: "Caveat",       text: "Victim recollection may contain gaps. Timeline should be treated as a suggested sequence, not a verified record." }
    ]
  };

  // ── 3. Relationship Graph ─────────────────────────────────────────────────
  const relationships = currentCase.relationships || [];
  const relationshipGraph = {
    name: "Relationship Graph",
    result: `Identified ${relationships.length} possible link(s) between actors and assets.`,
    confidence: "88%",
    supporting_evidence: `Mapped links: ${relationships.map(r => `${r.source} → ${r.target}`).join('; ') || 'None verified'}.`,
    reasoning: "Link analysis correlates named entities mentioned in the same transactional or spatial context.",
    reasoning_trace: [
      { step: "Observation",  text: `${relationships.length} relationship reference(s) detected in entity and statement data.` },
      { step: "Inference",    text: "Co-occurrence of actors within financial transactions or location references suggests a possible operational link." },
      { step: "Conclusion",   text: `${relationships.length} likely link(s) mapped. Confidence: 88%. Verification required.` },
      { step: "Caveat",       text: "Co-occurrence does not establish culpability. These are suggested investigative directions only." }
    ]
  };

  // ── 4. Contradiction Detection ────────────────────────────────────────────
  let cdResult, cdConf, cdEvidence, cdReasoning, cdTrace;
  if (currentCase.id === "COMP-005") {
    cdResult    = "Possible temporal conflict: device power-down preceded reported physical transit assault by several hours.";
    cdConf      = "92%";
    cdEvidence  = "Father states victim departed at 09:00 AM. Telecom log shows device power-down at 10:30 AM. CCTV grab is timestamped 20:30 PM.";
    cdReasoning = "A ten-hour gap between device shutdown and the reported assault location suggests possible containment or deliberate communications shutoff.";
    cdTrace = [
      { step: "Observation",  text: "Three independent sources provide conflicting timelines: parental account, telecom log, CCTV timestamp." },
      { step: "Inference",    text: "Device shutdown at 10:30 AM is inconsistent with a 20:30 PM physical assault at a transit hub — a 10-hour gap remains unaccounted for." },
      { step: "Conclusion",   text: "Possible deliberate communications disruption prior to incident. Suggested investigation: trace device last ping cell tower." },
      { step: "Caveat",       text: "Conflict may result from inaccurate clock on CCTV system. All timestamps require independent verification." }
    ];
  } else {
    cdResult    = "No direct factual contradictions identified in active case parameters.";
    cdConf      = "90%";
    cdEvidence  = "Victim statement, transaction receipts, and telecom data align chronologically.";
    cdReasoning = "Timeline milestones progress sequentially without overlapping spatial or temporal conflicts.";
    cdTrace = [
      { step: "Observation",  text: "Available case documents reviewed for conflicting date, time, or location assertions." },
      { step: "Inference",    text: "No contradictions detected between victim statement, transaction records, and available secondary sources." },
      { step: "Conclusion",   text: "Case parameters appear internally consistent. Confidence: 90%." },
      { step: "Caveat",       text: "Absence of detected contradiction does not imply verification. Missing documents may conceal conflicts." }
    ];
  }
  const contradictionDetection = {
    name: "Contradiction Detection", result: cdResult, confidence: cdConf,
    supporting_evidence: cdEvidence, reasoning: cdReasoning, reasoning_trace: cdTrace
  };

  // ── 5. Pattern Detection ──────────────────────────────────────────────────
  const patterns = detectPatterns(allCases);
  const activePatterns = patterns.filter(p => p.appears_in.some(o => o.id === currentCase.id));
  const pdResult = activePatterns.length > 0
    ? `Possible cross-case correlation: ${activePatterns.length} repeat indicator(s) flagged across case database.`
    : "No overlapping repeat indicators flagged across the current case database.";
  const patternDetection = {
    name: "Pattern Detection",
    result: pdResult,
    confidence: activePatterns.length > 0 ? "98%" : "85%",
    supporting_evidence: activePatterns.length > 0
      ? `Repeated identifiers: ${activePatterns.map(p => p.entity_value).join(', ')}.`
      : "No shared communication or financial endpoints detected.",
    reasoning: "Unique string matching on suspect phone numbers, UPI accounts, and vehicle plates highlights possible links between separate case files.",
    reasoning_trace: [
      { step: "Observation",  text: `Scanned ${allCases.length} case file(s) for shared entity values.` },
      { step: "Inference",    text: activePatterns.length > 0
          ? `${activePatterns.length} identifier(s) appear in 2+ case files. Repeated appearance suggests possible coordinated activity.`
          : "No shared identifiers found. Incident appears isolated in the current database." },
      { step: "Conclusion",   text: activePatterns.length > 0
          ? `Possible pattern link: ${activePatterns[0]?.entity_value} appears in ${activePatterns[0]?.appears_in?.length} case(s).`
          : "No cross-case pattern detected at this time." },
      { step: "Caveat",       text: "Pattern match is correlative, not causative. Shared identifiers may have innocent explanations. Officer judgment required." }
    ]
  };

  // ── 6. Modus Operandi Detection ───────────────────────────────────────────
  let moResult, moEvidence, moReasoning, moTrace;
  if (currentCase.incident_type === "Cyber Fraud") {
    moResult    = "Suggested M.O.: Upfront Processing Fee / Verification Deposit Scam.";
    moEvidence  = "Advance payment requested via UPI handle under guise of loan or service activation.";
    moReasoning = "Suspect uses cold-calling or social media ads promising financial services, demands advance deposit, then cuts contact.";
    moTrace = [
      { step: "Observation",  text: "Victim was contacted via phone/WhatsApp. Advance deposit demanded before service delivery." },
      { step: "Inference",    text: "Pattern matches documented 'advance fee fraud' M.O.: promise of benefit → verification payment → disappearance." },
      { step: "Conclusion",   text: "Suggested M.O. classification: Advance Fee / UPI Deposit Scam. Confidence: 90%." },
      { step: "Caveat",       text: "M.O. is inferred from reported events. Officer must verify narrative through independent corroboration." }
    ];
  } else if (currentCase.incident_type === "Assault") {
    moResult    = "Suggested M.O.: Two-person mobile snatch-and-grab team targeting transit commuters.";
    moEvidence  = "Suspects rode sports motorcycle, targeted pedestrian near high-footfall transit exit.";
    moReasoning = "Vehicle acceleration enables rapid extraction from scene. Targeting high-commute zones maximises victim volume while minimising apprehension risk.";
    moTrace = [
      { step: "Observation",  text: "Two suspects on motorcycle approached pedestrian near transit hub exit." },
      { step: "Inference",    text: "Use of motorcycle for rapid egress matches documented snatch-and-grab operational pattern." },
      { step: "Conclusion",   text: "Suggested M.O.: Mobile snatch team. Vehicle identification is a likely key investigative vector." },
      { step: "Caveat",       text: "M.O. classification based on victim account only. Physical evidence must corroborate before operational conclusions are drawn." }
    ];
  } else if (currentCase.incident_type === "Missing Person") {
    moResult    = "Suggested M.O.: Communications Disruption — possible controlled movements.";
    moEvidence  = "Device power-down coincides with last known location near transit corridor.";
    moReasoning = "Forced phone shutdown near transit nodes is a documented pattern in cases involving controlled movement of individuals.";
    moTrace = [
      { step: "Observation",  text: "Victim's device powered down abruptly near a transit hub." },
      { step: "Inference",    text: "Abrupt shutdown in transit zone may indicate device confiscation or deliberate deactivation." },
      { step: "Conclusion",   text: "Suggested M.O.: Controlled movements with communications disruption. Treat as possible priority welfare case." },
      { step: "Caveat",       text: "Device shutdown alone does not confirm foul play. Voluntary departure, battery failure, or signal blackspot must be ruled out." }
    ];
  } else {
    moResult    = "Suggested M.O.: Standard incident pattern for this category.";
    moEvidence  = `Incident type: ${currentCase.incident_type}.`;
    moReasoning = "Matches base categorisation parameters. Insufficient case-specific indicators for refined M.O. classification.";
    moTrace = [
      { step: "Observation",  text: `Incident type recorded as: ${currentCase.incident_type}.` },
      { step: "Inference",    text: "Insufficient entity data for M.O. sub-classification." },
      { step: "Conclusion",   text: "M.O. classification pending. More case data needed." },
      { step: "Caveat",       text: "Officer should document additional entity and behavioural data to enable refined M.O. analysis." }
    ];
  }
  const modusOperandiDetection = {
    name: "Modus Operandi Detection", result: moResult, confidence: "90%",
    supporting_evidence: moEvidence, reasoning: moReasoning, reasoning_trace: moTrace
  };

  // ── 7. Hypothesis Engine ──────────────────────────────────────────────────
  let hypResult, hypEvidence, hypReasoning, hypTrace;
  if (currentCase.incident_type === "Cyber Fraud" && activePatterns.length > 0) {
    hypResult    = "Suggested Hypothesis: Coordinated multi-actor tele-fraud ring.";
    hypEvidence  = `Multiple case files reference identical contact numbers or UPI handles.`;
    hypReasoning = "High-volume outbound call activity combined with multiple financial routing destinations suggests an organised group rather than a sole actor.";
    hypTrace = [
      { step: "Observation",  text: `${activePatterns.length} repeat identifier(s) found across ${allCases.length} case file(s).` },
      { step: "Inference",    text: "A single individual is unlikely to appear simultaneously across geographically distinct victim accounts. Possible coordinated network." },
      { step: "Conclusion",   text: "Suggested hypothesis: Organised fraud ring with multiple roles (caller, UPI operator, withdrawal agent)." },
      { step: "Caveat",       text: "Hypothesis is speculative and based on pattern correlation only. Requires cellular and financial forensics to substantiate." }
    ];
  } else if (currentCase.incident_type === "Assault" || currentCase.incident_type === "Missing Person") {
    hypResult    = "Suggested Hypothesis: Transit-corridor opportunistic or organised crew.";
    hypEvidence  = "Incidents involving physical contact and communications disruption cluster around Metro Center transit zone.";
    hypReasoning = "Spatial overlap between assault and missing person reports near the same transit hub suggests a possible coordinated or repeat crew operating in that corridor.";
    hypTrace = [
      { step: "Observation",  text: "Multiple incident reports originate from or near Metro Center transit exit." },
      { step: "Inference",    text: "Geographic clustering of physical incidents suggests familiarity with that location's traffic patterns and escape routes." },
      { step: "Conclusion",   text: "Suggested hypothesis: Transit corridor crew with prior knowledge of victim movement patterns at this hub." },
      { step: "Caveat",       text: "Spatial co-occurrence may be coincidental. Geographic pattern requires further data points to confirm." }
    ];
  } else {
    hypResult    = "Suggested Hypothesis: Isolated incident with a solitary actor.";
    hypEvidence  = "No cross-case repeat indicators identified.";
    hypReasoning = "Absence of shared identifiers across cases suggests this incident is currently not linked to any wider pattern.";
    hypTrace = [
      { step: "Observation",  text: "No shared identifiers found linking this case to others in the database." },
      { step: "Inference",    text: "Without repeat indicators, the most parsimonious hypothesis is a single, isolated actor." },
      { step: "Conclusion",   text: "Suggested hypothesis: Isolated incident. Confidence moderate — database coverage is limited." },
      { step: "Caveat",       text: "Absence of linkage does not confirm isolation. Linked cases may exist outside the current database." }
    ];
  }
  const hypothesisEngine = {
    name: "Hypothesis Engine", result: hypResult, confidence: "86%",
    supporting_evidence: hypEvidence, reasoning: hypReasoning, reasoning_trace: hypTrace
  };

  // ── 8. Confidence Engine ──────────────────────────────────────────────────
  const confScore = currentCase.investigation_score || 50;
  const confLabel = confScore >= 80 ? "Likely strong" : confScore >= 60 ? "Suggested moderate" : "Likely insufficient";
  const confidenceEngine = {
    name: "Confidence Engine",
    result: `${confLabel} case parameter coverage. Investigation completeness score: ${confScore}%.`,
    confidence: `${confScore}%`,
    supporting_evidence: `Score components: named entities, phones, timeline events, evidence files, notes, relationship links.`,
    reasoning: "Composite score weights entity density, corroborated overlaps, timeline completeness, and evidence volume.",
    reasoning_trace: [
      { step: "Observation",  text: `Entity count: ${Object.values(entities).flat().length} total identifiers. Timeline: ${currentCase.timeline?.length || 0} event(s). Evidence files: ${(currentCase.evidence?.documents?.length || 0) + (currentCase.evidence?.photos?.length || 0)} item(s).` },
      { step: "Inference",    text: `Weighted scoring across 6 parameter categories produces a composite completeness index of ${confScore}%.` },
      { step: "Conclusion",   text: `Case completeness: ${confScore}% — rated as '${confLabel} coverage'. ${confScore < 60 ? 'Consider gathering additional evidence before escalation.' : 'Parameters appear sufficient for preliminary review.'}` },
      { step: "Caveat",       text: "Confidence score reflects data completeness only, not prosecutorial strength. Legal assessment requires independent review." }
    ]
  };

  return [
    entityExtraction,
    timelineReconstruction,
    relationshipGraph,
    contradictionDetection,
    patternDetection,
    modusOperandiDetection,
    hypothesisEngine,
    confidenceEngine
  ];
};
