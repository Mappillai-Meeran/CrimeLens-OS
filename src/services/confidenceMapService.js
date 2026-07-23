/**
 * Confidence Map Service for CrimeLens OS.
 * Computes coverage, confidence, missing items, and suggested next actions
 * across 7 facets of evidence for a given current case.
 *
 * Vocabulary: "Possible", "Suggested", "Likely", "Needs verification".
 */

export const getConfidenceMap = (currentCase) => {
  if (!currentCase) return [];

  const type = currentCase.incident_type || "Default";
  const entities = currentCase.entities || {};
  const evidence = currentCase.evidence || {};
  const timeline = currentCase.timeline || [];
  const relationships = currentCase.relationships || [];

  // Helper arrays for verification
  const docs = evidence.documents || [];
  const photos = evidence.photos || [];
  const audios = evidence.audio || [];

  // 1. Digital Evidence
  const hasDigital = entities.phones?.length > 0 || docs.some(d => d.toLowerCase().includes('chat') || d.toLowerCase().includes('screenshot'));
  const digitalMissing = [];
  if (!entities.phones?.length) digitalMissing.push("Suspect phone number subscriber registration card (KYC)");
  if (!docs.some(d => d.toLowerCase().includes('screenshot') || d.toLowerCase().includes('chat'))) digitalMissing.push("Verified digital chat screenshots / logs");
  const digitalCoverage = hasDigital ? (entities.phones?.length > 0 && digitalMissing.length === 0 ? 100 : 60) : 0;
  const digitalConf = digitalCoverage >= 80 ? "High" : digitalCoverage > 0 ? "Medium" : "Low";
  const digitalAction = digitalCoverage < 100 
    ? `Request subscriber KYC records for phone: ${entities.phones?.[0] || 'suspect identifier'}`
    : "Review call data records (CDR) for cell site overlaps.";

  const digitalEvidenceFacet = {
    facet: "Digital Evidence",
    coverage: digitalCoverage,
    confidence: digitalConf,
    missing_items: digitalMissing.length > 0 ? digitalMissing : ["No missing standard items identified."],
    suggested_action: digitalAction
  };

  // 2. Financial Evidence
  const hasFinancial = entities.upi_ids?.length > 0 || entities.bank_accounts?.length > 0;
  const financialMissing = [];
  if (!entities.upi_ids?.length) financialMissing.push("Target UPI handle registry registration");
  if (!entities.bank_accounts?.length) financialMissing.push("Certified bank statement ledger matching transaction");
  const financialCoverage = hasFinancial ? (entities.bank_accounts?.length > 0 && entities.upi_ids?.length > 0 ? 100 : 50) : 0;
  const financialConf = financialCoverage >= 80 ? "High" : financialCoverage > 0 ? "Medium" : "Low";
  const financialAction = financialCoverage < 100
    ? `Issue notification to request certified ledger records for: ${entities.upi_ids?.[0] || 'UPI handle'}`
    : "Examine subsequent transfers to identify secondary mule accounts.";

  const financialEvidenceFacet = {
    facet: "Financial Evidence",
    coverage: financialCoverage,
    confidence: financialConf,
    missing_items: financialMissing.length > 0 ? financialMissing : ["No missing standard items identified."],
    suggested_action: financialAction
  };

  // 3. Witness Statements
  const witnessCount = currentCase.witnesses?.length || 0;
  const witnessMissing = [];
  if (witnessCount === 0) witnessMissing.push("Firsthand observer or independent bystander statement");
  if (type === "Assault" && witnessCount < 2) witnessMissing.push("Secondary eyewitness scene statement");
  const witnessCoverage = witnessCount >= 2 ? 100 : witnessCount > 0 ? 60 : 0;
  const witnessConf = witnessCoverage >= 80 ? "High" : witnessCoverage > 0 ? "Medium" : "Low";
  const witnessAction = witnessCoverage < 100
    ? "Locate and record statements from bystanders or adjacent shop owners."
    : "Cross-reference witness narratives for timeline consistency.";

  const witnessStatementsFacet = {
    facet: "Witness Statements",
    coverage: witnessCoverage,
    confidence: witnessConf,
    missing_items: witnessMissing.length > 0 ? witnessMissing : ["No missing standard items identified."],
    suggested_action: witnessAction
  };

  // 4. Forensics
  // For standard domestic / cyber / missing: forensics means medical certificates, cyber signatures, IP logs
  const hasForensics = docs.some(d => d.toLowerCase().includes('cert') || d.toLowerCase().includes('medical')) || audios.length > 0;
  const forensicsMissing = [];
  if (type === "Assault" && !docs.some(d => d.toLowerCase().includes('cert') || d.toLowerCase().includes('medical'))) {
    forensicsMissing.push("Certified medical examination report detailing physical injuries");
  }
  if (type === "Cyber Fraud" && !docs.some(d => d.toLowerCase().includes('pdf') || d.toLowerCase().includes('receipt'))) {
    forensicsMissing.push("Digitally signed gateway transaction receipt");
  }
  const forensicsCoverage = hasForensics ? 100 : 0;
  const forensicsConf = forensicsCoverage >= 80 ? "High" : "Low";
  const forensicsAction = forensicsCoverage < 100
    ? `Request official certified document matching category: ${type === 'Assault' ? 'Medical Certificate' : 'Signed Gateway Receipt'}`
    : "Review signatures and file for official prosecutorial record.";

  const forensicsFacet = {
    facet: "Forensics",
    coverage: forensicsCoverage,
    confidence: forensicsConf,
    missing_items: forensicsMissing.length > 0 ? forensicsMissing : ["No missing standard items identified."],
    suggested_action: forensicsAction
  };

  // 5. CCTV
  const hasCctv = photos.some(p => p.toLowerCase().includes('cctv') || p.toLowerCase().includes('grab')) || currentCase.evidence?.photos?.length > 0;
  const cctvMissing = [];
  if (!hasCctv) cctvMissing.push("CCTV exit corridor video clip / grab matching event timestamp");
  const cctvCoverage = hasCctv ? 100 : 0;
  const cctvConf = cctvCoverage >= 80 ? "High" : "Low";
  const cctvAction = cctvCoverage < 100
    ? "Submit request to municipal traffic control to recover CCTV camera feeds near location exit."
    : "Verify CCTV system clock calibration against telecom timestamp logs.";

  const cctvFacet = {
    facet: "CCTV",
    coverage: cctvCoverage,
    confidence: cctvConf,
    missing_items: cctvMissing.length > 0 ? cctvMissing : ["No missing standard items identified."],
    suggested_action: cctvAction
  };

  // 6. Timeline
  const hasTimeline = timeline.length >= 3;
  const timelineMissing = [];
  if (timeline.length === 0) timelineMissing.push("Chronological milestone log");
  else if (timeline.length < 4) timelineMissing.push("Detailed secondary chronological anchor points");
  const timelineCoverage = timeline.length >= 4 ? 100 : timeline.length > 0 ? 50 : 0;
  const timelineConf = timelineCoverage >= 80 ? "High" : timelineCoverage > 0 ? "Medium" : "Low";
  const timelineAction = timelineCoverage < 100
    ? "Trace exact timestamps from digital receipts to establish chronological sequence."
    : "Review chronological trace for potential contradictions.";

  const timelineFacet = {
    facet: "Timeline",
    coverage: timelineCoverage,
    confidence: timelineConf,
    missing_items: timelineMissing.length > 0 ? timelineMissing : ["No missing standard items identified."],
    suggested_action: timelineAction
  };

  // 7. Relationships
  const hasRelationships = relationships.length > 0;
  const relationshipsMissing = [];
  if (relationships.length === 0) relationshipsMissing.push("Cross-case indicator association link");
  const relationshipsCoverage = hasRelationships ? 100 : 0;
  const relationshipsConf = relationshipsCoverage >= 80 ? "High" : "Low";
  const relationshipsAction = relationshipsCoverage < 100
    ? "Execute linkage check in the Pattern Registry to trace possible cross-case links."
    : "Review link graph nodes to isolate secondary suspect vectors.";

  const relationshipsFacet = {
    facet: "Relationships",
    coverage: relationshipsCoverage,
    confidence: relationshipsConf,
    missing_items: relationshipsMissing.length > 0 ? relationshipsMissing : ["No missing standard items identified."],
    suggested_action: relationshipsAction
  };

  return [
    digitalEvidenceFacet,
    financialEvidenceFacet,
    witnessStatementsFacet,
    forensicsFacet,
    cctvFacet,
    timelineFacet,
    relationshipsFacet
  ];
};
