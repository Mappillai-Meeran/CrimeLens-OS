import { calculateSimilarity, getEvidenceGaps } from './investigation';
import { detectPatterns } from './patternDetection';

/**
 * Investigation Core — 7 advisory assistance modules.
 * Every module output includes:
 *   name, reason, priority, confidence, evidence_used,
 *   officer_action, expected_outcome, reasoning_trace[]
 *
 * reasoning_trace: structured chain of
 *   { step: "Observation" | "Inference" | "Recommendation" | "Caveat", text: "..." }
 *
 * Rule: The AI never orders officers. It only recommends.
 * Vocabulary: "Possible", "Suggested", "Likely", "Needs verification", "Confidence".
 */
export const getInvestigationCore = (currentCase, allCases = []) => {
  if (!currentCase) return [];

  const type = currentCase.incident_type;
  const entities = currentCase.entities || {};

  // ── 1. Investigation Strategy ─────────────────────────────────────────────
  let strategyAction, strategyOutcome, strategyReason, strategyTrace;
  if (type === "Cyber Fraud") {
    strategyAction  = "Request cellular provider subscriber KYC for suspect phone(s) and coordinate with UPI gateway to flag suspicious accounts.";
    strategyOutcome = "Obtain SIM registration details and secure transaction logs before data retention window closes.";
    strategyReason  = "Suspect communication vector relies on mobile phone and UPI. KYC lookup is the most direct suggested path to a physical identity.";
    strategyTrace = [
      { step: "Observation",      text: `Phone(s) detected: ${entities.phones?.join(', ') || 'N/A'}. UPI handle(s): ${entities.upi_ids?.join(', ') || 'N/A'}.` },
      { step: "Inference",        text: "Both phone and UPI endpoints are registered to an identity. Provider KYC records are obtainable via legal process." },
      { step: "Recommendation",   text: strategyAction },
      { step: "Caveat",           text: "Data retention windows vary by provider (typically 90 days). Early action is suggested to prevent record loss." }
    ];
  } else if (type === "Assault") {
    strategyAction  = "Trace vehicle registration for plate(s) detected and query local rental agency contract records.";
    strategyOutcome = "Identify the registered owner or renter active during the incident window.";
    strategyReason  = "The suspect vehicle is the primary identified link. Registration lookup is a suggested low-complexity first step.";
    strategyTrace = [
      { step: "Observation",      text: `Vehicle plate(s) detected: ${entities.vehicles?.join(', ') || 'N/A'}.` },
      { step: "Inference",        text: "A registered vehicle provides an identity anchor. Rental records may reveal a driver if the plate is assigned to a fleet." },
      { step: "Recommendation",   text: strategyAction },
      { step: "Caveat",           text: "Vehicle may have been stolen or fitted with cloned plates. Registration result should be cross-verified with physical description." }
    ];
  } else if (type === "Missing Person") {
    strategyAction  = "Deploy search teams near last known location and request cell tower dump logs surrounding the last active device coordinates.";
    strategyOutcome = "Narrow the physical search zone and identify other devices active in proximity at the relevant time.";
    strategyReason  = "Cell tower data provides a real-world anchor for the search perimeter. Early deployment reduces location uncertainty exponentially.";
    strategyTrace = [
      { step: "Observation",      text: `Last known device: ${entities.phones?.[0] || 'N/A'}. Likely last location: transit corridor.` },
      { step: "Inference",        text: "Cell tower records can establish a geographic radius of 200–800m for the last active device ping." },
      { step: "Recommendation",   text: strategyAction },
      { step: "Caveat",           text: "Cell tower data requires carrier cooperation and legal authorisation. Begin request immediately to avoid data expiry." }
    ];
  } else {
    strategyAction  = "Obtain a full victim statement, log all entities, and map the incident to a geographic coordinate.";
    strategyOutcome = "Establish a baseline case profile for pattern comparison and evidence gap assessment.";
    strategyReason  = "A complete initial profile enables all downstream analysis modules to function at full capacity.";
    strategyTrace = [
      { step: "Observation",      text: `Incident type: ${type}. Minimal entity data currently available.` },
      { step: "Inference",        text: "Insufficient entity density to suggest a specific investigation vector." },
      { step: "Recommendation",   text: strategyAction },
      { step: "Caveat",           text: "Strategy will become more specific as case entity data is populated." }
    ];
  }
  const investigationStrategy = {
    name: "Investigation Strategy", reason: strategyReason, priority: "High", confidence: "90%",
    evidence_used: `Incident type: ${type}. Entities: ${[...(entities.phones || []), ...(entities.upi_ids || []), ...(entities.vehicles || [])].join(', ') || 'N/A'}.`,
    officer_action: strategyAction, expected_outcome: strategyOutcome, reasoning_trace: strategyTrace
  };

  // ── 2. Question Generator ─────────────────────────────────────────────────
  let questionAction, questionReason, questionTrace;
  if (type === "Cyber Fraud") {
    questionAction = "Ask the victim: Did the caller speak with a specific regional accent? What platform hosted the original advertisement?";
    questionReason = "Dialect and platform data can help identify call-centre operational geography or online advertising campaigns.";
    questionTrace = [
      { step: "Observation",    text: "Victim was contacted via an inbound or outbound phone call." },
      { step: "Inference",      text: "Regional accent may indicate a geographic cluster for the call centre. Advertisement platform data narrows suspect acquisition strategy." },
      { step: "Recommendation", text: questionAction },
      { step: "Caveat",         text: "Accent assessment by victim may not be reliable. Use as a directional signal only." }
    ];
  } else if (type === "Assault") {
    questionAction = "Ask witness(es): Did either suspect speak? Describe helmet type, clothing colour, and the direction of egress after the incident.";
    questionReason = "Physical descriptor detail enables a suspect profile for CCTV cross-referencing and suspect identification.";
    questionTrace = [
      { step: "Observation",    text: "Two suspects on motorcycle were present at the scene." },
      { step: "Inference",      text: "Helmet markings and clothing colour may be visible on CCTV footage and can help identify suspects before facial recognition is available." },
      { step: "Recommendation", text: questionAction },
      { step: "Caveat",         text: "Witness recollection under stress may be imprecise. Cross-reference with CCTV before finalising physical description." }
    ];
  } else if (type === "Missing Person") {
    questionAction = "Ask the reporting relative: Had the missing person mentioned feeling followed, receiving unusual messages, or expressed concerns about any individual recently?";
    questionReason = "Pre-incident communication anomalies can surface stalker patterns or coercive contact that preceded the disappearance.";
    questionTrace = [
      { step: "Observation",    text: "Missing person's movements were normal until device shutdown near transit zone." },
      { step: "Inference",      text: "Voluntary disappearance and coerced disappearance have different pre-incident social indicators." },
      { step: "Recommendation", text: questionAction },
      { step: "Caveat",         text: "Family members may omit sensitive information. Conduct follow-up questioning individually if needed." }
    ];
  } else {
    questionAction = "Ask the victim to describe any recurring contacts, locations, or communications preceding the incident.";
    questionReason = "Recurring patterns in pre-incident contact may reveal suspect identity or modus operandi.";
    questionTrace = [
      { step: "Observation",    text: `Incident type: ${type}. Narrative needs supplementary witness/victim data.` },
      { step: "Inference",      text: "Pre-incident context often contains identifiers not captured in initial statements." },
      { step: "Recommendation", text: questionAction },
      { step: "Caveat",         text: "Questions should remain open-ended to avoid leading witness responses." }
    ];
  }
  const questionGenerator = {
    name: "Question Generator", reason: questionReason, priority: "Medium", confidence: "85%",
    evidence_used: "Victim statement and available entity data.",
    officer_action: questionAction, expected_outcome: "Isolate dialect cues, platform origins, or pre-incident contact markers.",
    reasoning_trace: questionTrace
  };

  // ── 3. Evidence Gap Analysis ──────────────────────────────────────────────
  const gaps = getEvidenceGaps(currentCase);
  const missingGaps = gaps.filter(g => g.status === "Missing");
  const gapAction = missingGaps.length > 0
    ? `Collect outstanding records for: ${missingGaps.map(g => g.name).join(', ')}.`
    : "All standard evidence categories appear adequately covered for this incident type.";
  const gapReason = missingGaps.length > 0
    ? `${missingGaps.length} evidence category(ies) currently unverified, reducing case completeness.`
    : "Case evidence coverage meets the expected standard for this category.";
  const evidenceGapAnalysis = {
    name: "Evidence Gap Analysis", reason: gapReason, priority: "High", confidence: "95%",
    evidence_used: `${gaps.length} standard parameters audited against incident type '${type}'.`,
    officer_action: gapAction,
    expected_outcome: "Reduce evidence gaps to strengthen case file before escalation or review.",
    reasoning_trace: [
      { step: "Observation",    text: `${gaps.length} standard evidence categories checked. ${missingGaps.length} missing.` },
      { step: "Inference",      text: missingGaps.length > 0 ? `Missing items: ${missingGaps.map(g => g.name).join(', ')}.` : "All standard categories covered." },
      { step: "Recommendation", text: gapAction },
      { step: "Caveat",         text: "Gap analysis reflects standard category checklists only. Unique case-specific evidence may not be covered by this framework." }
    ]
  };

  // ── 4. AI Mentor ──────────────────────────────────────────────────────────
  let mentorAction, mentorReason, mentorTrace;
  if (type === "Cyber Fraud") {
    mentorAction = "Consider issuing a bank account freeze request within 24 hours of the reported transaction — recovery rates decline sharply after 48 hours.";
    mentorReason = "Financial proceeds in UPI fraud cases are typically routed through multiple mule accounts and withdrawn within hours.";
    mentorTrace = [
      { step: "Observation",    text: "UPI or bank transfer detected. Transaction timestamp available." },
      { step: "Inference",      text: "Funds are likely still in transit through mule accounts if the case is reported within 24 hours of transfer." },
      { step: "Recommendation", text: mentorAction },
      { step: "Caveat",         text: "Freeze request requires proper legal authorisation. This is an advisory reminder — not an instruction." }
    ];
  } else if (type === "Assault") {
    mentorAction = "Prioritise recovery of CCTV footage from municipal traffic cameras within 48 hours — many systems auto-overwrite on a 3–7 day cycle.";
    mentorReason = "Once overwritten, CCTV footage is unrecoverable and constitutes a permanent evidence loss.";
    mentorTrace = [
      { step: "Observation",    text: "Assault occurred at or near a transit hub with likely CCTV coverage." },
      { step: "Inference",      text: "Municipal and commercial CCTV systems commonly run 3–7 day rolling loops. Footage older than 7 days may no longer exist." },
      { step: "Recommendation", text: mentorAction },
      { step: "Caveat",         text: "Confirm camera operational status and retention policy with facility management before relying on availability." }
    ];
  } else if (type === "Missing Person") {
    mentorAction = "Query local transport ticketing systems (bus, metro) for the victim's name, travel card, or route from the last known location.";
    mentorReason = "Missing individuals under duress often use public transport, which creates trackable ticketing records.";
    mentorTrace = [
      { step: "Observation",    text: "Victim last active near transit hub. Device subsequently powered down." },
      { step: "Inference",      text: "If the victim boarded public transport after device shutdown, ticketing databases may still contain a record." },
      { step: "Recommendation", text: mentorAction },
      { step: "Caveat",         text: "Ticketing data access requires formal coordination with transport authorities. Informal queries are not admissible." }
    ];
  } else {
    mentorAction = "Ensure all physical evidence items are bagged, labelled, and entered into the evidence register within 24 hours.";
    mentorReason = "Evidence integrity chain-of-custody requirements mandate documented handling at every stage.";
    mentorTrace = [
      { step: "Observation",    text: `Incident type: ${type}.` },
      { step: "Inference",      text: "Physical evidence integrity depends on timely, documented handling." },
      { step: "Recommendation", text: mentorAction },
      { step: "Caveat",         text: "This is a general advisory. Refer to the specific SOP for this incident category for full procedural guidance." }
    ];
  }
  const aiMentor = {
    name: "AI Mentor", reason: mentorReason, priority: "Low", confidence: "80%",
    evidence_used: `Incident type: ${type}. Time-sensitive evidence considerations.`,
    officer_action: mentorAction, expected_outcome: "Maximise preservation of time-sensitive evidence and asset recovery opportunities.",
    reasoning_trace: mentorTrace
  };

  // ── 5. Risk Prioritization ────────────────────────────────────────────────
  let riskPriority, riskAction, riskReason, riskTrace;
  if (type === "Missing Person") {
    riskPriority = "High";
    riskAction   = "Initiate immediate search operations and cell-tower tracking — physical safety risk escalates with each hour the device remains offline.";
    riskReason   = "Potential ongoing risk to life. Delay in response directly reduces likelihood of a safe outcome.";
    riskTrace = [
      { step: "Observation",    text: "Missing person report filed. Device offline. Last location: transit zone." },
      { step: "Inference",      text: "Offline device in a transit corridor is a possible indicator of physical constraint or coercion. Each hour increases risk." },
      { step: "Recommendation", text: riskAction },
      { step: "Caveat",         text: "Voluntary departure must remain a working hypothesis. Do not presuppose foul play without corroborating evidence." }
    ];
  } else if (type === "Assault") {
    riskPriority = "High";
    riskAction   = "Consider deploying patrol resources near the incident corridor — suspect group may repeat activity in the same zone.";
    riskReason   = "Snatch-and-grab crews often repeat operations in the same high-footfall locations due to familiarity with escape routes.";
    riskTrace = [
      { step: "Observation",    text: "Violent assault reported near high-commute transit exit. Suspects fled on motorcycle." },
      { step: "Inference",      text: "Knowledge of transit patterns and escape routes suggests possible repeat operation in the same zone." },
      { step: "Recommendation", text: riskAction },
      { step: "Caveat",         text: "Resource deployment is an officer and supervisor decision. This is a risk signal, not an operational order." }
    ];
  } else if (type === "Cyber Fraud") {
    riskPriority = "Medium";
    riskAction   = "Coordinate with the victim's bank to flag the beneficiary account — financial recovery is time-sensitive.";
    riskReason   = "UPI and banking fraud losses are most recoverable within 24–48 hours of the transfer.";
    riskTrace = [
      { step: "Observation",    text: `Financial transaction to ${entities.upi_ids?.[0] || 'unknown UPI handle'} reported.` },
      { step: "Inference",      text: "Funds likely still in transit or recently received by the beneficiary account." },
      { step: "Recommendation", text: riskAction },
      { step: "Caveat",         text: "Recovery is not guaranteed. Coordinate via official cybercrime portal channels." }
    ];
  } else {
    riskPriority = "Medium";
    riskAction   = "Conduct standard case review and prioritise based on victim vulnerability and evidence time-sensitivity.";
    riskReason   = "No immediate elevated risk indicators identified from current case data.";
    riskTrace = [
      { step: "Observation",    text: `Incident type: ${type}. No acute safety indicators flagged.` },
      { step: "Inference",      text: "Standard risk level assessed. Routine processing suggested." },
      { step: "Recommendation", text: riskAction },
      { step: "Caveat",         text: "Risk level may change as additional case data is entered." }
    ];
  }
  const riskPrioritization = {
    name: "Risk Prioritization", reason: riskReason, priority: riskPriority, confidence: "92%",
    evidence_used: `Incident type: ${type}. Case status: ${currentCase.status}.`,
    officer_action: riskAction, expected_outcome: "Protect citizen safety and mitigate ongoing financial or physical harm.",
    reasoning_trace: riskTrace
  };

  // ── 6. SOP Assistant ──────────────────────────────────────────────────────
  let sopAction, sopReason, sopTrace;
  if (type === "Cyber Fraud") {
    sopAction = "Register the case on the National Cybercrime Reporting Portal and issue a formal notice to the UPI service provider.";
    sopReason = "Standard Operating Procedure mandates central registry logging for all financial cybercrime cases.";
    sopTrace = [
      { step: "Observation",    text: "Cyber fraud incident involving UPI transaction reported." },
      { step: "Inference",      text: "National Cybercrime portal registration is mandatory for FIR eligibility and inter-agency coordination." },
      { step: "Recommendation", text: sopAction },
      { step: "Caveat",         text: "Portal registration does not replace physical FIR filing at the local station. Both steps are required." }
    ];
  } else if (type === "Assault") {
    sopAction = "Obtain a medical certification report for the victim and submit CCTV backup files to the physical evidence locker within 48 hours.";
    sopReason = "SOP requires verified medical assessment to support assault charge documentation.";
    sopTrace = [
      { step: "Observation",    text: "Physical assault reported. Victim has alleged injuries." },
      { step: "Inference",      text: "Medical certification creates an evidentiary record of injury that is admissible in subsequent legal proceedings." },
      { step: "Recommendation", text: sopAction },
      { step: "Caveat",         text: "Medical certification must be obtained from a registered medical officer. Informal assessments are not admissible." }
    ];
  } else if (type === "Missing Person") {
    sopAction = "Issue a missing person advisory bulletin to all district units and enter the report into the missing persons tracking system immediately.";
    sopReason = "SOP mandates district-wide advisory distribution within 6 hours of a missing person report filing.";
    sopTrace = [
      { step: "Observation",    text: "Missing person report filed. Victim has not been located." },
      { step: "Inference",      text: "District-wide advisory expands the effective search perimeter without requiring additional physical resource deployment." },
      { step: "Recommendation", text: sopAction },
      { step: "Caveat",         text: "Bulletin should include physical description and last known clothing only. Do not include speculative information about the cause of disappearance." }
    ];
  } else {
    sopAction = "Complete all mandatory FIR fields, assign a case number, and dispatch acknowledgement receipt to the complainant.";
    sopReason = "Standard registration SOP applies to all reported incidents regardless of type.";
    sopTrace = [
      { step: "Observation",    text: `Incident type: ${type}. Standard registration procedure applies.` },
      { step: "Inference",      text: "Full FIR registration ensures legal admissibility and enables inter-unit case tracking." },
      { step: "Recommendation", text: sopAction },
      { step: "Caveat",         text: "Refer to the specific SOP document for this incident category for field-specific requirements." }
    ];
  }
  const sopAssistant = {
    name: "SOP Assistant", reason: sopReason, priority: "High", confidence: "95%",
    evidence_used: "Applicable SOP guidelines and procedural compliance framework.",
    officer_action: sopAction, expected_outcome: "Legal compliance, administrative standardisation, and inter-agency coordination.",
    reasoning_trace: sopTrace
  };

  // ── 7. Case Similarity ────────────────────────────────────────────────────
  const similarities = calculateSimilarity(currentCase, allCases);
  const simAction = similarities.length > 0
    ? `Consider cross-referencing findings with linked case files: ${similarities.map(s => s.complaint.id).join(', ')}.`
    : "No similar cases identified in the current database. Continue independent investigation.";
  const simReason = similarities.length > 0
    ? `${similarities.length} case(s) share indicator parameters (highest similarity: ${similarities[0]?.similarity}%).`
    : "Current database contains no cases with matching entity or incident parameters.";
  const caseSimilarity = {
    name: "Case Similarity", reason: simReason, priority: "Medium",
    confidence: similarities.length > 0 ? `${similarities[0]?.similarity}%` : "N/A",
    evidence_used: `${allCases.length} case file(s) in database.`,
    officer_action: simAction,
    expected_outcome: "Identify opportunities for a unified multi-complainant investigation strategy.",
    reasoning_trace: [
      { step: "Observation",    text: `${allCases.length} case file(s) scanned. ${similarities.length} scored above similarity threshold.` },
      { step: "Inference",      text: similarities.length > 0
          ? `Shared parameters detected with: ${similarities.map(s => `${s.complaint.id} (${s.similarity}%)`).join(', ')}.`
          : "No matching parameters found." },
      { step: "Recommendation", text: simAction },
      { step: "Caveat",         text: "Similarity scoring is indicative only. Cases are NOT claimed to be identical. Officer must verify whether shared parameters represent a genuine operational link." }
    ]
  };

  return [
    investigationStrategy,
    questionGenerator,
    evidenceGapAnalysis,
    aiMentor,
    riskPrioritization,
    sopAssistant,
    caseSimilarity
  ];
};
