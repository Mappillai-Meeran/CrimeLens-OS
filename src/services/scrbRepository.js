/**
 * SCRB Investigation Repository
 * Backed by static seed collections and search matching logic.
 * Adheres to advisory language (Possible, Likely, Suggested, Needs verification).
 */

// ─── COLLECTION 1: Investigation Memory (10 Landmark Case Studies) ───────────
export const landmarkCaseStudies = [
  {
    case_id: "LAND-001",
    crime_type: "Cyber Fraud",
    complaint_summary: "Victim received a phone call from an individual claiming to be a bank official offering instant credit card upgrades. The victim shared a one-time password (OTP), resulting in an unauthorized transfer of ₹45,000 to a suspect wallet.",
    timeline: [
      "10:00 AM: Caller contacted victim posing as bank staff.",
      "10:15 AM: OTP requested and shared by victim.",
      "10:18 AM: Transaction alert received by victim; debit of ₹45,000.",
      "11:30 AM: Complaint lodged at nearest cyber desk."
    ],
    entities: {
      phones: ["+91-9876500001"],
      upi_ids: ["upgradecard@ybl"],
      bank_accounts: ["987654321001"],
      names: ["Ravi Kumar"],
      locations: ["Online", "Metro Center"]
    },
    modus_operandi: "Social engineering call leveraging credit card limit upgrades. Uses quick disposable UPI handles siphoning funds before detection.",
    investigation_challenges: "Fast withdrawal of funds to e-wallets; fake KYC credentials on the calling SIM.",
    evidence_collected: ["Call detail records (CDR)", "Bank statement showing debit transaction", "Screenshots of OTP messages"],
    court_outcome: "Suspect account frozen. Trial pending. Accused identified through IP log tracing.",
    investigation_lessons: "Speed of siphoning requires immediate contact with bank nodal officers within the first golden hour.",
    recommended_next_actions: "Suggested: Issue Section 91 CrPC notice to UPI gateway provider. Coordinate with telecom provider for cell tower location of the IMEI.",
    search_keywords: ["credit card", "OTP", "social engineering", "UPI transfer", "phishing"]
  },
  {
    case_id: "LAND-002",
    crime_type: "Assault",
    complaint_summary: "Victim was assaulted by two unidentified individuals on a black motorcycle during a late-night commute near a dimly lit transit corridor. The attackers snatched the victim's gold chain and laptop bag before fleeing.",
    timeline: [
      "11:15 PM: Victim was walking from metro exit.",
      "11:17 PM: Two suspects blocked path on motorcycle.",
      "11:18 PM: Physical assault and chain snatching occurred.",
      "11:30 PM: Nearby shop owner called emergency services."
    ],
    entities: {
      phones: [],
      upi_ids: [],
      bank_accounts: [],
      vehicles: ["KA-01-MJ-9999"],
      names: ["Lokesh H."],
      locations: ["Metro Center", "Transit Corridor"]
    },
    modus_operandi: "Shadowing lone commuters in unlit subway or transit passages. Fast egress on motorcycles with registration plates obscured.",
    investigation_challenges: "Low-quality CCTV footage; night lighting prevented immediate identification of faces.",
    evidence_collected: ["Medical certificate detailing abrasions", "Street CCTV footage", "Eyewitness sketch of passenger"],
    court_outcome: "Accused convicted to 3 years rigorous imprisonment under IPC Section 392 (Robbery).",
    investigation_lessons: "Route map mapping of adjacent traffic junctions helps track vehicle escape routes even if plate is obscured.",
    recommended_next_actions: "Suggested: Acquire footage from next sequential camera downstream of escape route. Interview local tea stall vendors.",
    search_keywords: ["snatch", "motorcycle", "night assault", "transit corridor", "chain snatching"]
  },
  {
    case_id: "LAND-003",
    crime_type: "Missing Person",
    complaint_summary: "A 16-year-old student left home for tuition classes and did not return. Family search revealed that her mobile device was switched off shortly after her scheduled class time.",
    timeline: [
      "04:00 PM: Left home for tuition.",
      "04:30 PM: Arrived at tuition class center.",
      "06:00 PM: Tuition dismissed; last seen heading to metro station.",
      "06:15 PM: Phone went switched off."
    ],
    entities: {
      phones: ["+91-9900119900"],
      upi_ids: [],
      bank_accounts: [],
      vehicles: [],
      names: ["Aditi Rao", "Sanjay Rao"],
      locations: ["West Heights", "Metro Center"]
    },
    modus_operandi: "Voluntary departure following academic stress. Subject boarded regional train to neighbor district.",
    investigation_challenges: "No digital footprints; phone remained offline for 48 hours.",
    evidence_collected: ["Metro gate exit logs", "Tuition attendance register", "Last 3 days social media logs"],
    court_outcome: "Subject located safely at a relative's house in Mysore. Welfare counseling conducted.",
    investigation_lessons: "Early verification of friends' network and digital search histories often reveals target travel destinations.",
    recommended_next_actions: "Suggested: Request cell tower dump around metro station. Interview classmates.",
    search_keywords: ["minor", "student", "tuition", "switched off", "runaway"]
  },
  {
    case_id: "LAND-004",
    crime_type: "Domestic Violence",
    complaint_summary: "Victim reported physical abuse and confinement by her spouse and in-laws over dowry demands. Neighbors confirmed hearing frequent arguments and calls for assistance.",
    timeline: [
      "June 10: Victim restricted from leaving the house.",
      "June 12: Severe physical abuse incident reported by neighbor.",
      "June 13: Local police team dispatched; victim escorted to safety.",
      "June 14: Medical examination completed."
    ],
    entities: {
      phones: ["+91-9845012345"],
      upi_ids: [],
      bank_accounts: [],
      vehicles: [],
      names: ["Preethi S.", "Harish S."],
      locations: ["West Heights"]
    },
    modus_operandi: "Continuous physical intimidation, restriction of communication devices, and mental harassment in domestic quarters.",
    investigation_challenges: "Reluctance of immediate family to act as witnesses; private nature of domestic setup.",
    evidence_collected: ["Medical certificate detailing contusions", "Neighbor audio recording of arguments", "Helpline call log"],
    court_outcome: "Bail denied to main suspect; protection orders issued under domestic violence regulations.",
    investigation_lessons: "Secure victim safety immediately before starting detailed evidence collection.",
    recommended_next_actions: "Possible: Ensure safe shelter placement. Suggested: Record detailed witness statement from neighbor who recorded audio.",
    search_keywords: ["domestic abuse", "spouse", "dowry", "confinement", "harassment"]
  },
  {
    case_id: "LAND-005",
    crime_type: "Vehicle Theft",
    complaint_summary: "A parked luxury SUV was stolen from outside a residential apartment complex. The thieves bypassed the electronic ignition lock system within 4 minutes using a signal duplicator device.",
    timeline: [
      "02:00 AM: SUV parked in visitor slot.",
      "02:15 AM: Two suspects approach wearing masks.",
      "02:19 AM: Engine started remotely; vehicle driven away.",
      "07:00 AM: Owner noticed theft and raised alarm."
    ],
    entities: {
      phones: [],
      upi_ids: [],
      bank_accounts: [],
      vehicles: ["KA-03-HA-8888"],
      names: ["Vikram Sen"],
      locations: ["East Docks"]
    },
    modus_operandi: "High-tech signal grabbing of keyless entry remote codes using specialized frequency scanners.",
    investigation_challenges: "Obscured faces; high-speed transit via toll gates using forged vehicle plates.",
    evidence_collected: ["CCTV capture of keyless override", "RTO registration papers", "Toll entry logs"],
    court_outcome: "Vehicle recovered at interstate border checkpoint. Gang dismantled.",
    investigation_lessons: "Alerting highway toll plazas (FASTag database) immediately can intercept stolen vehicles in transit.",
    recommended_next_actions: "Suggested: Send registration details to FASTag nodal network for real-time tracking.",
    search_keywords: ["luxury SUV", "electronic lock", "keyless entry", "signal duplicate", "FASTag"]
  },
  {
    case_id: "LAND-006",
    crime_type: "Property Dispute",
    complaint_summary: "Complainant alleged that a neighbor forcibly demolished a shared boundary fence and attempted to erect a permanent structure on the complainant's registered land parcel.",
    timeline: [
      "May 01: Verbal dispute regarding plot boundary.",
      "May 05: Construction workers cleared fence under suspect's instruction.",
      "May 06: Police visited site and issued stop-work memo.",
      "May 08: Revenue land survey conducted."
    ],
    entities: {
      phones: [],
      upi_ids: [],
      bank_accounts: [],
      vehicles: [],
      names: ["Srinivas G.", "Anil Reddy"],
      locations: ["South Suburbs"]
    },
    modus_operandi: "Encroachment by physical force during owner's absence, followed by filing of matching civil applications to stall action.",
    investigation_challenges: "Conflicting land records at municipal office; delay in official government surveyor visits.",
    evidence_collected: ["Land deed registered in 2012", "Survey maps", "Photos of demolished boundary"],
    court_outcome: "Civil court confirmed ownership; police enforced order maintaining peace.",
    investigation_lessons: "Verify deed authenticity via sub-registrar records first rather than relying on municipal tax receipts.",
    recommended_next_actions: "Needs verification: Acquire official survey record from Sub-Registrar. Suggested: Advise parties to maintain status quo.",
    search_keywords: ["encroachment", "boundary", "land deed", "fence", "surveyor"]
  },
  {
    case_id: "LAND-007",
    crime_type: "Cyber Fraud",
    complaint_summary: "Victim siphoned of ₹1,50,000 after downloading an unverified investment application that promised 200% daily returns. Money was sent to multiple dummy UPI ids.",
    timeline: [
      "11:00 AM: Victim saw investment ad on Telegram.",
      "12:00 PM: App downloaded and register completed.",
      "01:00 PM: Made three payments of ₹50,000 each.",
      "05:00 PM: App account blocked; support non-responsive."
    ],
    entities: {
      phones: ["+91-9988770022"],
      upi_ids: ["investprofit@okaxis", "dailyreturn@paytm"],
      bank_accounts: [],
      vehicles: [],
      names: ["Karan Shah"],
      locations: ["Online"]
    },
    modus_operandi: "High-yield investment scheme marketed via chat rooms. Uses multiple shell accounts to split transactions instantly.",
    investigation_challenges: "Layered transactions across 4 banks; Telegram suspect accounts deleted.",
    evidence_collected: ["UPI payment receipts", "Telegram chat screenshots", "App download link log"],
    court_outcome: "Accounts frozen at primary bank level. Investigation open.",
    investigation_lessons: "Transaction trace must follow the initial beneficiary account to identify the cash-out ATM location.",
    recommended_next_actions: "Suggested: Submit emergency request to Telegram nodal officer. Possible: Trace cashout coordinates.",
    search_keywords: ["investment app", "Telegram", "high return", "layering", "shell accounts"]
  },
  {
    case_id: "LAND-008",
    crime_type: "Assault",
    complaint_summary: "Victim attacked outside a local restaurant in South Suburbs by a group of four men following a minor argument over parking space. The victim suffered a fractured collarbone.",
    timeline: [
      "09:30 PM: Parking dispute occurred.",
      "09:35 PM: Suspects confronted victim outside restaurant.",
      "09:37 PM: Assault with wooden rods.",
      "10:00 PM: Victim shifted to general hospital."
    ],
    entities: {
      phones: [],
      upi_ids: [],
      bank_accounts: [],
      vehicles: ["KA-05-MM-1234"],
      names: ["Siddharth Sen", "Girish (Suspect)"],
      locations: ["South Suburbs"]
    },
    modus_operandi: "Aggressive escalation over minor disputes. Attack conducted using locally sourced blunt instruments.",
    investigation_challenges: "Suspects fled scene; restaurant staff reluctant to testify for safety reasons.",
    evidence_collected: ["X-Ray and medical injury report", "Parking valet logbook", "Restaurant billing records"],
    court_outcome: "Suspects identified, arrested, and charge-sheeted within 15 days.",
    investigation_lessons: "Valet logs and credit card slips from restaurants help identify visitors during that specific hour.",
    recommended_next_actions: "Suggested: Collect restaurant credit card swipe details from merchant gateway. Map license plate.",
    search_keywords: ["parking dispute", "wooden rods", "fracture", "valet logs", "restaurant CCTV"]
  },
  {
    case_id: "LAND-009",
    crime_type: "Missing Person",
    complaint_summary: "An 82-year-old suffering from mild dementia walked out of the residence at 06:00 AM and went missing. He did not carry a mobile device or identification cards.",
    timeline: [
      "06:00 AM: Left residence through main gate.",
      "08:00 AM: Family noticed disappearance.",
      "09:00 AM: Registered complain at local desk.",
      "12:00 PM: Alert broadcasted to patrol vehicles."
    ],
    entities: {
      phones: [],
      upi_ids: [],
      bank_accounts: [],
      vehicles: [],
      names: ["Madhava Rao"],
      locations: ["North Districts"]
    },
    modus_operandi: "Disorientation leading to walking along highway corridors or seeking familiar old residences.",
    investigation_challenges: "No electronic tracking possible; subject unable to communicate identity.",
    evidence_collected: ["Recent photo of subject", "Apartment exit CCTV grab", "Patrol report log"],
    court_outcome: "Subject located safely at a transit terminal station 15km away by a patrol officer.",
    investigation_lessons: "Immediate coordination with local transit security and bus terminals is critical for elderly individuals.",
    recommended_next_actions: "Suggested: Initiate public advisory with photo. Alert local public bus conductors and railway police.",
    search_keywords: ["elderly", "dementia", "disoriented", "no phone", "transit terminal"]
  },
  {
    case_id: "LAND-010",
    crime_type: "Vehicle Theft",
    complaint_summary: "Commercial transport truck carrying electronic cargo hijacked by a group of suspects posing as toll operators. The truck was abandoned without cargo 50km away.",
    timeline: [
      "01:00 AM: Detour checkpoint stop.",
      "01:10 AM: Driver restrained.",
      "03:00 AM: Cargo transferred.",
      "06:00 AM: Driver freed and reported."
    ],
    entities: {
      phones: [],
      upi_ids: [],
      bank_accounts: [],
      vehicles: ["KA-04-TR-5678", "KA-01-XX-1122"],
      names: ["Devaraj (Driver)"],
      locations: ["North Districts"]
    },
    modus_operandi: "Targeting freight vehicles at fake checkpoints. Pre-planned logistics to unload and distribute cargo instantly.",
    investigation_challenges: "Remote highway location; driver was blindfolded; delay in reporting.",
    evidence_collected: ["Abandoned vehicle fingerprint sweep", "GPS route tracking history", "Toll plaza transaction receipt"],
    court_outcome: "Receivers of stolen property arrested; cargo partially recovered in local warehouse.",
    investigation_lessons: "GPS tracker logs usually show exact stoppage coordinates, which helps pinpoint the unloading warehouse.",
    recommended_next_actions: "Suggested: Query the GPS service provider server for the route mapping history.",
    search_keywords: ["hijack", "freight", "checkpoint", "cargo", "GPS tracker"]
  }
];

// ─── COLLECTION 2: Police Knowledge (Karnataka Police Guidelines) ───────────
export const policeGuidelines = [
  {
    title: "Immediate Action in UPI Cyber Fraud Cases",
    category: "Cyber Fraud",
    keywords: ["UPI", "freeze", "golden hour", "fraudulent transfer", "bank", "RRN"],
    summary: "Guidelines on securing fast transaction freezes inside the initial 'Golden Hour' of cyber-enabled monetary scams.",
    relevant_sop: "SOP-CYBER-04: Immediate notification to the nodal bank within 2 hours of report. Log transaction reference in national cyber portal.",
    required_procedure: "1. Obtain the 12-digit Retrieval Reference Number (RRN). 2. Submit the freeze request directly to the Bank Nodal Officer or the cyber helpline portal. 3. Avoid waiting for full FIR registration to initiate bank holds. 4. Record suspect UPI handle details.",
    important_notes: "Do not wait for full FIR registration to initiate bank holds. The golden hour determines the probability of asset recovery.",
    officer_responsibilities: "Nodal bank communication, transaction registration in portal, initial evidence documentation.",
    source: "SCRB Circular 2025/11"
  },
  {
    title: "SOP for Snatching and Street Assaults",
    category: "Assault",
    keywords: ["snatch", "motorcycle", "CCTV mapping", "escape route", "medical checkup"],
    summary: "Procedures for gathering physical evidence and setting up escape route checkpoints following physical street assault or snatchings.",
    relevant_sop: "SOP-PHYS-12: Immediate medical checkup for the victim. Scene sketch and photo logs. Fast-track recovery of traffic camera footages before auto-overwrites occur.",
    required_procedure: "1. Dispatch immediate medical team for victim. 2. Secure CCTV records from private shops along the escape vector. 3. Input vehicle description into the highway patrol dashboard. 4. Sweep assault coordinates for dropped articles.",
    important_notes: "Secure video logs within 48 hours to prevent shop overwrites. Obscure vehicle identification checks are critical.",
    officer_responsibilities: "Victim protection, scene cordoning, street shop outreach, registry checkup.",
    source: "Karnataka Police Manual Sec 12"
  },
  {
    title: "Protocols for Trace of Missing Minors",
    category: "Missing Person",
    keywords: ["minor", "missing child", "CDR dump", "advisory", "railway station"],
    summary: "Emergency tracking guidelines when children or minors go missing, prioritizing immediate public and transit hub alerts.",
    relevant_sop: "SOP-MIS-08: Immediate filing in central missing desk database. Tower ping requests prioritized under 'endangerment' exception. Transport terminals alert.",
    required_procedure: "1. Log profile parameters in missing child database instantly. 2. Trigger cell tower coordinate checks under endangerment guidelines. 3. Alert terminal safety desks (Railway, Airport, Bus Stands). 4. Do NOT wait 24 hours.",
    important_notes: "Delaying registry database entries reduces tracing chance by 60%. Coordinate closely with adjacent stations.",
    officer_responsibilities: "Regional transit alerts, friends circle screening, coordination with terminal security teams.",
    source: "SC Directive / KSP Standing Order 03"
  },
  {
    title: "Response Guidelines for Domestic Violence Incidents",
    category: "Domestic Violence",
    keywords: ["domestic dispute", "abuse", "safety check", "medical report", "protection order"],
    summary: "Instructions for police officers responding to domestic abuse reports, prioritizing immediate safety and trauma recording.",
    relevant_sop: "SOP-DOM-02: Safety assessment prioritized. Mandatory medical documentation. Inform victim of rights and legal shelter options. Temporary protection coordination.",
    required_procedure: "1. Secure the victim's immediate safety and relocate if threat persists. 2. Mandatory physical assessment at government hospital. 3. Record statements of neighbors independently. 4. Coordinate with Protection Officer under Domestic Violence Act.",
    important_notes: "Maintain neutral position on domestic issues while firmly enforcing safety protocols and protection rights.",
    officer_responsibilities: "Ensure victim safety, hospital coordination, independent neighbor interviews.",
    source: "Gender Sensitization Circular 2024"
  },
  {
    title: "Anti-Theft Protocols for Automobile Recovery",
    category: "Vehicle Theft",
    keywords: ["FASTag", "Vahan check", "chassis tracker", "border checkpoint"],
    summary: "Steps to trace stolen vehicles by linking vehicle tracking databases and toll checkpoints.",
    relevant_sop: "SOP-VEH-05: Log registration number in stolen vehicle database immediately to alert highway toll systems. Map exit routes from the theft coordinates.",
    required_procedure: "1. Log engine and chassis details in Vahan portal. 2. Issue automated flag request to regional highway toll gates (FASTag database). 3. Conduct immediate patrol checks of local auto dismantle zones.",
    important_notes: "Trigger database alerts before the vehicle reaches interstate border tolls.",
    officer_responsibilities: "RTO query generation, highway patrol coordination, FASTag gateway alert dispatch.",
    source: "Automobile Theft Desk Guidelines"
  },
  {
    title: "Handling Boundary Disputes and Land Encroachment",
    category: "Property Dispute",
    keywords: ["boundary dispute", "land deed", "surveyor", "order preservation"],
    summary: "Guidelines on preventing breaches of public peace while land title ownership remains under civil review.",
    relevant_sop: "SOP-PROP-11: Verify title deeds through government registrar database first. Enforce peace (prevent breach of public order) without settling land title, which remains a civil matter.",
    required_procedure: "1. Order both parties to maintain status quo. 2. Request certified survey maps from Sub-Registrar. 3. Avoid passing order on ownership title; refer to Civil court. 4. Register preventive case if breach of peace is threatened.",
    important_notes: "Police officers must not settle title ownership. Maintain law and order pending civil resolution.",
    officer_responsibilities: "Site peace maintenance, surveyor dispatch follow-up, civil stay registry review.",
    source: "Police Officer Field Manual Section 145"
  }
];

// ─── COLLECTION 3: Legal Precedents ──────────────────────────────────────────
export const legalPrecedents = [
  {
    citation: "Arnesh Kumar v. State of Bihar (2014)",
    court: "Supreme Court of India",
    relevant_principle: "Mandatory compliance with Section 41A CrPC before arrest for offenses punishable by less than 7 years, designed to prevent arbitrary arrests.",
    why_it_applies: "Applicable as the current incident concerns domestic disputes or property violations where punishments do not exceed 7 years.",
    key_observation: "The court observed that arrest must not be the first choice. Arrest should only occur when concrete justification (e.g. risk of escape or tampering) is present.",
    practical_investigation_advice: "Issue a notice under Section 41A CrPC. Log response and compliance before initiating any coercive action.",
    applicable_crimes: ["Domestic Violence", "Property Dispute"],
    confidence: "95%"
  },
  {
    citation: "Lalita Kumari v. Govt. of U.P. (2014)",
    court: "Supreme Court of India",
    relevant_principle: "Mandatory FIR registration under Section 154 CrPC if information discloses a cognizable offense.",
    why_it_applies: "Directly relates to the intake phase of the reported cognizable offense, necessitating instant registration.",
    key_observation: "The Supreme Court noted that the code's language leaves no room for police discretion when a cognizable incident is reported.",
    practical_investigation_advice: "Proceed with immediate registration of FIR. Avoid conducting detailed investigations prior to logging the formal record.",
    applicable_crimes: ["Assault", "Cyber Fraud", "Missing Person", "Vehicle Theft"],
    confidence: "98%"
  },
  {
    citation: "Sanjay Chandra v. CBI (2012)",
    court: "Supreme Court of India",
    relevant_principle: "Liberty parameters and bail eligibility. Detention during trial should not be punitive.",
    why_it_applies: "Applies to financial crimes and non-violent properties where key suspects have verified local residences.",
    key_observation: "Pre-trial detention should not be utilized as punishment when the suspect's court attendance can be secured via bonds.",
    practical_investigation_advice: "Focus on gathering documentary proof to build a strong case sheet rather than prioritizing custodial arrest.",
    applicable_crimes: ["Cyber Fraud", "Property Dispute", "Vehicle Theft"],
    confidence: "90%"
  }
];

// ─── ENGINE ───
/**
 * Search the SCRB Investigation Repository.
 */
export const searchSCRBRepository = (caseData) => {
  if (!caseData) return { landmarks: [], guidelines: [], precedents: [] };

  const crimeType = caseData.incident_type || "Unknown";
  const summary = (caseData.summary || "").toLowerCase();
  
  const activeEntities = caseData.entities || {};
  const activePhones = activeEntities.phones || [];
  const activeUPIs = activeEntities.upi_ids || [];
  const activeVehicles = activeEntities.vehicles || [];
  const activeLocations = activeEntities.locations || [];

  // Landmark cases match
  const matchedLandmarks = landmarkCaseStudies.map(landmark => {
    let score = 0;
    const reasons = [];

    if (landmark.crime_type === crimeType) {
      score += 40;
      reasons.push(`Likely matching incident category (${crimeType})`);
    }

    activePhones.forEach(phone => {
      if (landmark.entities.phones.includes(phone)) {
        score += 30;
        reasons.push(`Shared contact telephone: ${phone}`);
      }
    });

    activeUPIs.forEach(upi => {
      if (landmark.entities.upi_ids.includes(upi)) {
        score += 30;
        reasons.push(`Shared transaction UPI: ${upi}`);
      }
    });

    activeVehicles.forEach(vehicle => {
      if (landmark.entities.vehicles?.includes(vehicle)) {
        score += 30;
        reasons.push(`Shared vehicle marker: ${vehicle}`);
      }
    });

    landmark.search_keywords.forEach(keyword => {
      if (summary.includes(keyword.toLowerCase())) {
        score += 10;
        reasons.push(`Suggested keyword match: "${keyword}"`);
      }
    });

    activeLocations.forEach(loc => {
      if (landmark.entities.locations.includes(loc)) {
        score += 10;
        reasons.push(`Possible location proximity: ${loc}`);
      }
    });

    return {
      type: "Landmark Case",
      id: landmark.case_id,
      crime_type: landmark.crime_type,
      score: Math.min(score, 100),
      reasons,
      summary: landmark.complaint_summary,
      modus_operandi: landmark.modus_operandi,
      lessons: landmark.investigation_lessons,
      evidence_collected: landmark.evidence_collected,
      court_outcome: landmark.court_outcome,
      next_steps: landmark.recommended_next_actions,
      crime_pattern: landmark.crime_type === "Cyber Fraud" ? "UPI Phishing Campaign Syndicate" : "Opportunistic Snatch Group",
      mistakes_made: landmark.crime_type === "Cyber Fraud" 
        ? "Delay in issuing Section 91 CrPC notice to payment gateways allowed the siphoned funds to be withdrawn via multiple ATM layers."
        : "Failed to secure immediate CCTV footage from adjacent traffic junctions within 24 hours, leading to footage overwrite.",
      court_observations: landmark.court_outcome
    };
  }).filter(m => m.score > 0)
    .sort((a, b) => b.score - a.score);

  // Guidelines match
  const matchedGuidelines = policeGuidelines.map(guideline => {
    let score = 0;
    const reasons = [];

    if (guideline.category === crimeType) {
      score += 50;
      reasons.push(`Suggested guideline for ${crimeType}`);
    }

    guideline.keywords.forEach(kw => {
      if (summary.includes(kw.toLowerCase())) {
        score += 15;
        reasons.push(`Possible guideline keyword overlap: "${kw}"`);
      }
    });

    return {
      type: "Police Guideline",
      title: guideline.title,
      category: guideline.category,
      score: Math.min(score, 100),
      reasons,
      summary: guideline.summary,
      relevant_sop: guideline.relevant_sop,
      required_procedure: guideline.required_procedure,
      important_notes: guideline.important_notes,
      officer_responsibilities: guideline.officer_responsibilities,
      source: guideline.source
    };
  }).filter(g => g.score > 0)
    .sort((a, b) => b.score - a.score);

  // Precedents match
  const matchedPrecedents = legalPrecedents.map(precedent => {
    let score = 0;
    const reasons = [];

    if (precedent.applicable_crimes.includes(crimeType)) {
      score += 50;
      reasons.push(`Suggested precedent applicable to ${crimeType}`);
    }

    return {
      type: "Legal Precedent",
      citation: precedent.citation,
      court: precedent.court,
      score: Math.min(score, 100),
      reasons,
      relevant_principle: precedent.relevant_principle,
      why_it_applies: precedent.why_it_applies,
      key_observation: precedent.key_observation,
      practical_investigation_advice: precedent.practical_investigation_advice,
      confidence: precedent.confidence
    };
  }).filter(p => p.score > 0)
    .sort((a, b) => b.score - a.score);

  return {
    landmarks: matchedLandmarks.slice(0, 3),
    guidelines: matchedGuidelines.slice(0, 3),
    precedents: matchedPrecedents.slice(0, 3)
  };
};

/**
 * Generate Investigation Strategy based on active case data.
 * Adheres to advisory language and required subdivisions.
 */
export const generateInvestigationStrategy = (caseData) => {
  if (!caseData) return null;

  const type = caseData.incident_type || "Unknown";
  const entities = caseData.entities || {};
  const hasPhones = entities.phones && entities.phones.length > 0;
  const hasUPIs = entities.upi_ids && entities.upi_ids.length > 0;
  const hasVehicles = entities.vehicles && entities.vehicles.length > 0;

  let immediate_actions = [];
  let people_to_interview = [];
  let digital_evidence = [];
  let financial_evidence = [];
  let documents_required = [];
  let field_suggestions = [];

  if (type === "Cyber Fraud") {
    immediate_actions = [
      {
        recommendation: "Suggested: Issue transaction hold alert to beneficiary payment gateway.",
        reason: "Likely to prevent further siphoning of siphoned assets.",
        confidence: "95%",
        supporting_evidence: `Complaint logs detailing payments to target ${entities.upi_ids?.[0] || 'UPI account'}.`
      },
      {
        recommendation: "Suggested: Draft and dispatch formal Section 91 CrPC notice to nodal bank.",
        reason: "Required to secure complete transaction logs and KYC of suspect holder.",
        confidence: "90%",
        supporting_evidence: "Transaction reference receipts."
      }
    ];

    people_to_interview = [
      {
        recommendation: "Suggested: Record victim's statement regarding exact timeline and call details.",
        reason: "Likely to extract hidden details regarding caller accent, background noise, or fake identity.",
        confidence: "85%",
        supporting_evidence: "Victim's preliminary intake file."
      }
    ];

    digital_evidence = [
      {
        recommendation: "Suggested: Download complete raw email headers or WhatsApp message exports.",
        reason: "Necessary to trace server-side IP addresses and verify digital identities.",
        confidence: "80%",
        supporting_evidence: "Victim's chat screenshots."
      }
    ];

    financial_evidence = [
      {
        recommendation: "Suggested: Request certified beneficiary account statement mapping downstream transfers.",
        reason: "Helps trace siphoned funds through secondary and tertiary dummy accounts.",
        confidence: "92%",
        supporting_evidence: `Transaction UPI ID: ${entities.upi_ids?.[0] || 'N/A'}`
      }
    ];

    documents_required = [
      {
        recommendation: "Suggested: Collect authenticated bank account ledger and bank passbook copies.",
        reason: "Required to format formal charge-sheet evidence pack.",
        confidence: "98%",
        supporting_evidence: "Original bank statements."
      }
    ];

    field_suggestions = [
      {
        recommendation: "Possible: Visit telecom registered kiosk coordinates of suspect SIM registration.",
        reason: "Likely to verify if SIM was purchased via cloned KYC documents at a retail store.",
        confidence: "70%",
        supporting_evidence: `Suspect number registry: ${entities.phones?.[0] || 'N/A'}`
      }
    ];
  } else if (type === "Assault") {
    immediate_actions = [
      {
        recommendation: "Suggested: Request immediate injury certificate from local government hospital.",
        reason: "Mandatory to classify injury category under IPC code sections.",
        confidence: "98%",
        supporting_evidence: "Victim's visible abrasion details."
      },
      {
        recommendation: "Suggested: Issue vehicle search alert to regional checkpoint patrol units.",
        reason: "Likely to intercept suspect vehicle in transit.",
        confidence: "85%",
        supporting_evidence: `Reported vehicle license: ${entities.vehicles?.[0] || 'N/A'}`
      }
    ];

    people_to_interview = [
      {
        recommendation: "Suggested: Interview transit gate security attendants and adjacent tea stall owners.",
        reason: "Possible identification of suspects who may have loitered before the incident.",
        confidence: "75%",
        supporting_evidence: "Incident location coordinates."
      }
    ];

    digital_evidence = [
      {
        recommendation: "Suggested: Secure municipal traffic control CCTV feeds along escape route.",
        reason: "Required to trace motorcycle path and capture clear helmet-less images of suspects.",
        confidence: "90%",
        supporting_evidence: `Vehicle trace: ${entities.vehicles?.[0] || 'N/A'}`
      }
    ];

    financial_evidence = [
      {
        recommendation: "Suggested: Verify rental or purchase transactions linked to the vehicle.",
        reason: "Likely to identify suspect profiles through KYC records at rental agencies.",
        confidence: "85%",
        supporting_evidence: `License plate: ${entities.vehicles?.[0] || 'N/A'}`
      }
    ];

    documents_required = [
      {
        recommendation: "Suggested: Secure certified vehicle registry details from Vahan.",
        reason: "Required to confirm owner details or duplicate plate markers.",
        confidence: "95%",
        supporting_evidence: "Stolen vehicle reports."
      }
    ];

    field_suggestions = [
      {
        recommendation: "Suggested: Conduct physical search of target corridors for dropped accessories or devices.",
        reason: "Possible recovery of physical tools or items left behind by suspects during escape.",
        confidence: "65%",
        supporting_evidence: "Assault coordinates."
      }
    ];
  } else {
    // Default fallback strategy
    immediate_actions = [
      {
        recommendation: "Suggested: Record formal statement under standard police parameters.",
        reason: "Necessary to initiate official docket entry.",
        confidence: "98%",
        supporting_evidence: "Case intake."
      }
    ];
    people_to_interview = [
      {
        recommendation: "Suggested: Identify and question individuals present near the reported location.",
        reason: "Possible witness trace.",
        confidence: "70%",
        supporting_evidence: "Location parameters."
      }
    ];
    digital_evidence = [
      {
        recommendation: "Suggested: Check local camera installations near coordinates.",
        reason: "Possible capture of incident timeline.",
        confidence: "60%",
        supporting_evidence: "Geospatial markers."
      }
    ];
    financial_evidence = [];
    documents_required = [
      {
        recommendation: "Suggested: Obtain identity verification document copy.",
        reason: "Required to authenticate victim parameters.",
        confidence: "99%",
        supporting_evidence: "Intake file."
      }
    ];
    field_suggestions = [
      {
        recommendation: "Possible: Dispatch patrol unit to inspect reported coordinates.",
        reason: "Suggested to maintain public order and verify claims.",
        confidence: "80%",
        supporting_evidence: "Scene parameters."
      }
    ];
  }

  return {
    immediate_actions,
    evidence_to_collect: {
      people_to_interview,
      digital_evidence,
      financial_evidence,
      documents_required
    },
    field_suggestions
  };
};

/**
 * STEP 7 — AI Question Generator
 * Generates intelligent investigation questions grouped by category.
 */
export const generateAIQuestions = (caseData) => {
  if (!caseData) return { victim_questions: [], witness_questions: [], suspect_questions: [], digital_questions: [], financial_questions: [] };

  const type = caseData.incident_type || "Unknown";
  const entities = caseData.entities || {};
  const hasUPIs = entities.upi_ids && entities.upi_ids.length > 0;
  const hasPhones = entities.phones && entities.phones.length > 0;

  let victim_questions = [];
  let witness_questions = [];
  let suspect_questions = [];
  let digital_questions = [];
  let financial_questions = [];

  if (type === "Cyber Fraud") {
    victim_questions = [
      {
        question: "Could you specify if the caller mentioned any bank name or employee ID?",
        importance: "Suggested to identify potential insider involvement or specific impersonation patterns."
      },
      {
        question: "Did you click any links sent via SMS, or was the payment initiated directly in your app?",
        importance: "Likely determines if browser-based malware or session hijacking was used."
      }
    ];
    witness_questions = [
      {
        question: "Did anyone else observe the screen or assist the victim during the call?",
        importance: "Suggested to verify emotional state or corroborating audio/visual details."
      }
    ];
    suspect_questions = [
      {
        question: "Under what pretext was this UPI ID registered or leased?",
        importance: "Suggested to check if the suspect is the actual operator or a money mule."
      }
    ];
    digital_questions = [
      {
        question: "What is the network IP location of the device that registered the suspect UPI handle?",
        importance: "Required to trace physical coordinates of the actual perpetrator."
      }
    ];
    financial_questions = [
      {
        question: "Where were the siphoned funds withdrawn or layered downstream?",
        importance: "Critical to freeze secondary bank nodes before ATM cashout."
      }
    ];
  } else if (type === "Assault") {
    victim_questions = [
      {
        question: "Did the suspect speak or shout any specific names or words before the assault?",
        importance: "Suggested to determine if the attack was targeted or a random robbery."
      }
    ];
    witness_questions = [
      {
        question: "Can you confirm the helmet style, visor color, or clothing logos worn by the motorcycle rider?",
        importance: "Possible lead for RTO and CCTV checks along transit route."
      }
    ];
    suspect_questions = [
      {
        question: "Who was in possession of the motorcycle at the reported hour?",
        importance: "Required to establish physical presence at the scene."
      }
    ];
    digital_questions = [
      {
        question: "Are there active mobile tower logs matching the suspect's device around the Metro Center zone?",
        importance: "Likely establishes device coordinates correlation with the scene."
      }
    ];
    financial_questions = [
      {
        question: "Was the stolen laptop or gold chain offered for sale on digital classified platforms?",
        importance: "Suggested to track asset disposal networks."
      }
    ];
  } else {
    victim_questions = [
      {
        question: "What was the last contact or activity noted before the report?",
        importance: "Establishes baseline timeline parameters."
      }
    ];
    witness_questions = [
      {
        question: "Did you notice any unusual movement near the location?",
        importance: "Suggested to trace potential witnesses."
      }
    ];
    suspect_questions = [
      {
        question: "Where were you located during the reported timeline?",
        importance: "Verifies alibi parameters."
      }
    ];
    digital_questions = [
      {
        question: "Are there any digital logs active for the subject's accounts?",
        importance: "Checks online activity traces."
      }
    ];
    financial_questions = [
      {
        question: "Have any cards or accounts logged transactions recently?",
        importance: "Determines physical survival indicators."
      }
    ];
  }

  return {
    victim_questions,
    witness_questions,
    suspect_questions,
    digital_questions,
    financial_questions
  };
};

/**
 * STEP 8 — Contradiction Engine
 * Analyzes case data to identify inconsistencies (Timeline, Entities, Amounts, etc.).
 */
export const detectContradictions = (caseData, allCases = []) => {
  if (!caseData) return [];

  const contradictions = [];
  const entities = caseData.entities || {};
  const timeline = caseData.timeline || [];
  const summary = (caseData.summary || "").toLowerCase();

  // 1. Check for timeline inconsistency (e.g. reporting before transaction)
  if (timeline.length >= 2) {
    const dates = timeline.map(t => t.date || "").filter(Boolean);
    // Check if dates are chronologically disordered
    for (let i = 0; i < timeline.length - 1; i++) {
      if (timeline[i].date && timeline[i+1].date && timeline[i].date > timeline[i+1].date) {
        contradictions.push({
          contradiction: "Timeline Chronology Inconsistency",
          reason: "Event logged as occurring after it was reported or processed.",
          supporting_evidence: `Event 1: ${timeline[i].event} on ${timeline[i].date} vs Event 2: ${timeline[i+1].event} on ${timeline[i+1].date}`,
          confidence: "High",
          needs_verification: true
        });
      }
    }
  }

  // 2. Check for UPI/Phone discrepancy in other case files
  const otherCases = allCases.filter(c => c.id !== caseData.id);
  const activePhones = entities.phones || [];
  const activeUPIs = entities.upi_ids || [];

  otherCases.forEach(c => {
    const otherPhones = c.entities?.phones || [];
    const otherUPIs = c.entities?.upi_ids || [];

    // Shared UPI but different crime types or names
    activeUPIs.forEach(upi => {
      if (otherUPIs.includes(upi) && c.incident_type !== caseData.incident_type) {
        contradictions.push({
          contradiction: "Cross-Case Incident Discrepancy",
          reason: "Suggested UPI handle is linked to two different crime categories across cases.",
          supporting_evidence: `UPI ${upi} shared between active case ${caseData.id} (${caseData.incident_type}) and case ${c.id} (${c.incident_type}).`,
          confidence: "Likely",
          needs_verification: true
        });
      }
    });
  });

  // 3. Amount verification
  const amounts = entities.amounts || [];
  if (amounts.length > 0 && summary) {
    amounts.forEach(amt => {
      const cleanAmt = amt.replace(/[^\d]/g, "");
      if (cleanAmt && !summary.includes(cleanAmt)) {
        contradictions.push({
          contradiction: "Extracted Amount Discrepancy",
          reason: "Target amount extracted in entities is not matching details in the official statement.",
          supporting_evidence: `Amount: ${amt} listed in entity parameters but not matching values in summary text.`,
          confidence: "Possible",
          needs_verification: true
        });
      }
    });
  }

  return contradictions;
};

/**
 * STEP 9 — Modus Operandi Engine
 * Identifies recurring patterns by comparing active case parameters to landmark case studies.
 */
export const detectModusOperandi = (caseData) => {
  if (!caseData) return [];

  const type = caseData.incident_type || "Unknown";
  const summary = (caseData.summary || "").toLowerCase();
  const matchedPatterns = [];

  landmarkCaseStudies.forEach(landmark => {
    if (landmark.crime_type !== type) return;

    let matchScore = 0;
    const matchedIndicators = [];

    // Compare modus operandi / summary keywords
    landmark.search_keywords.forEach(keyword => {
      if (summary.includes(keyword.toLowerCase())) {
        matchScore += 25;
        matchedIndicators.push(keyword);
      }
    });

    if (matchScore >= 25) {
      matchedPatterns.push({
        pattern: landmark.modus_operandi,
        historical_cases: [landmark.case_id],
        typical_evidence: landmark.evidence_collected,
        direction: landmark.recommended_next_actions,
        confidence: matchScore >= 50 ? "Likely" : "Possible",
        match_explanation: `Observed matching key indicators: "${matchedIndicators.join(', ')}" corresponding to Modus Operandi in landmark case ${landmark.case_id}.`
      });
    }
  });

  return matchedPatterns;
};

/**
 * STEP 11 — Evidence Reliability Score Engine
 * Evaluates and scores evidence based on type (Official, Bank, CDR, Witness, Screenshot, etc.).
 * Does not score people.
 */
export const calculateEvidenceReliability = (caseData) => {
  if (!caseData) return { evidence_scores: [], overall_score: 0, overall_confidence: "Low", missing_evidence: [], suggestions: [] };

  const evidence = caseData.evidence || {};
  const docs = evidence.documents || [];
  const photos = evidence.photos || [];
  const audios = evidence.audio || [];
  const allFiles = [...docs, ...photos.map(p => p.name || p), ...audios.map(a => a.name || a)];

  const scores = [];
  let totalScore = 0;

  allFiles.forEach(file => {
    const name = String(file).toLowerCase();
    let score = 70;
    let confidence = "Medium";
    let type = "General File";

    if (name.includes("bank") || name.includes("receipt") || name.includes("ledger") || name.includes("statement")) {
      score = 98;
      confidence = "High";
      type = "Bank Record";
    } else if (name.includes("medical") || name.includes("injury") || name.includes("hospital") || name.includes("clinic")) {
      score = 96;
      confidence = "High";
      type = "Medical Record";
    } else if (name.includes("official") || name.includes("fir") || name.includes("gov") || name.includes("survey")) {
      score = 95;
      confidence = "High";
      type = "Official Document";
    } else if (name.includes("ip") || name.includes("server") || name.includes("log")) {
      score = 92;
      confidence = "High";
      type = "Digital Log";
    } else if (name.includes("cdr") || name.includes("call") || name.includes("phone")) {
      score = 90;
      confidence = "High";
      type = "Call Record";
    } else if (name.includes("witness") || name.includes("statement")) {
      score = 80;
      confidence = "Medium";
      type = "Witness Statement";
    } else if (name.includes("screenshot") || name.includes("chat") || name.endsWith(".png") || name.endsWith(".jpg") || name.endsWith(".jpeg")) {
      score = 60;
      confidence = "Medium";
      type = "Screenshot";
    }

    scores.push({ name: String(file), score, confidence, type });
    totalScore += score;
  });

  const avgScore = scores.length > 0 ? Math.round(totalScore / scores.length) : 0;
  const overallConf = avgScore >= 90 ? "High" : avgScore >= 70 ? "Medium" : "Low";

  // Check missing evidence based on crime category
  const missing = [];
  const suggestions = [];
  const type_cat = caseData.incident_type;

  if (type_cat === "Cyber Fraud") {
    if (!scores.some(s => s.type === "Bank Record")) {
      missing.push("Certified Bank Statement / Transaction Ledger");
      suggestions.push("Suggested: Request the victim submit an official bank-certified statement detailing downstream beneficiaries.");
    }
    if (!scores.some(s => s.type === "Call Record")) {
      missing.push("Nodal ISP / Telecom Call Detail Records (CDR)");
      suggestions.push("Suggested: Issue telecom query for target SIM lookup logs.");
    }
  } else if (type_cat === "Assault") {
    if (!scores.some(s => s.type === "Medical Record")) {
      missing.push("Official Wound Certificate / Hospital Assessment");
      suggestions.push("Suggested: Direct victim to regional government health officer for certified wound evaluation.");
    }
    if (!scores.some(s => s.type === "Digital Log" || s.name.includes("cctv"))) {
      missing.push("Transit Highway CCTV Video Recording");
      suggestions.push("Suggested: Retrieve road surveillance footage along predicted egress routes.");
    }
  }

  return {
    evidence_scores: scores,
    overall_score: avgScore || 50,
    overall_confidence: overallConf,
    missing_evidence: missing,
    suggestions: suggestions.length > 0 ? suggestions : ["Suggested: Secure official government agency validations to increase general docket reliability."]
  };
};

/**
 * STEP 10 — Reasoning Tree Engine
 * Computes structured reasoning steps tracing final recommendations back to complaint details.
 */
export const getReasoningTree = (caseData) => {
  if (!caseData) return [];

  const type = caseData.incident_type || "Unknown";
  const entities = caseData.entities || {};
  const docs = caseData.evidence?.documents || [];
  
  // Search matches
  const matches = searchSCRBRepository(caseData);
  const matchedLandmark = matches.landmarks[0] || null;
  const matchedGuideline = matches.guidelines[0] || null;
  const strategy = generateInvestigationStrategy(caseData);
  const nextStep = matchedLandmark ? matchedLandmark.next_steps : "Proceed with standard statement records verification.";

  return [
    {
      id: "node-1",
      title: "Complaint",
      description: `Active complaint file logged for incident type: "${type}".`,
      evidence_trace: `Primary intake summary: "${caseData.summary || 'N/A'}"`
    },
    {
      id: "node-2",
      title: "Entities",
      description: `Extracted parameters: ${entities.names?.length || 0} names, ${entities.phones?.length || 0} phones, ${entities.upi_ids?.length || 0} UPIs.`,
      evidence_trace: `Entities extracted: [Phones: ${entities.phones?.join(', ') || 'None'} · UPIs: ${entities.upi_ids?.join(', ') || 'None'}]`
    },
    {
      id: "node-3",
      title: "Timeline",
      description: `Sequence events timeline mapping ${caseData.timeline?.length || 0} chronologies.`,
      evidence_trace: `First event: "${caseData.timeline?.[0]?.event || 'Intake logged'}"`
    },
    {
      id: "node-4",
      title: "Evidence",
      description: `Case cabinet holds: ${docs.length} documents, ${caseData.evidence?.photos?.length || 0} snapshots.`,
      evidence_trace: `Evidence cabinet: [Documents: ${docs.join(', ') || 'None'}]`
    },
    {
      id: "node-5",
      title: "Repository Matches",
      description: `Matched SCRB landmarks: ${matches.landmarks.map(m => m.id).join(', ') || 'None'}.`,
      evidence_trace: `Knowledge guideline reference: "${matchedGuideline ? matchedGuideline.title : 'General Circular'}"`
    },
    {
      id: "node-6",
      title: "Pattern Detection",
      description: `Signature signature matching: "${matchedLandmark ? matchedLandmark.modus_operandi : 'General signature'}".`,
      evidence_trace: `MO matching basis: ${matchedLandmark ? matchedLandmark.reasons.join(' · ') : 'Incident similarity'}`
    },
    {
      id: "node-7",
      title: "Strategy",
      description: `Strategy plan generated with ${strategy?.immediate_actions?.length || 0} immediate actions.`,
      evidence_trace: `Immediate advice: "${strategy?.immediate_actions?.[0]?.recommendation || 'Verify statement'}"`
    },
    {
      id: "node-8",
      title: "Recommendation",
      description: `Final suggested course of action dispatched.`,
      evidence_trace: `Next actionable: "${nextStep}"`
    }
  ];
};

/**
 * Prompt 6: Case Health panel calculation
 */
export const calculateCaseHealth = (caseData, allCases = []) => {
  if (!caseData) return null;
  const reliability = calculateEvidenceReliability(caseData);
  const contradictions = detectContradictions(caseData, allCases);
  const scrbResults = searchSCRBRepository(caseData);
  const questionsObj = generateAIQuestions(caseData);
  const strategy = generateInvestigationStrategy(caseData);

  const expectedItems = 6;
  let presentItems = 0;
  const entities = caseData.entities || {};
  if (entities.names?.length > 0) presentItems++;
  if (entities.phones?.length > 0) presentItems++;
  if (entities.upi_ids?.length > 0 || entities.bank_accounts?.length > 0) presentItems++;
  if (caseData.timeline?.length > 0) presentItems++;
  if (caseData.evidence?.documents?.length > 0) presentItems++;
  if (caseData.notes?.length > 0) presentItems++;

  const coverageScore = Math.round((presentItems / expectedItems) * 100);
  const progressScore = Math.round(
    (coverageScore * 0.4) + 
    (reliability.overall_score * 0.4) + 
    (caseData.status === "Closed" ? 20 : 10)
  );

  const totalQuestions = (questionsObj.victim_questions?.length || 0) + 
                         (questionsObj.witness_questions?.length || 0) + 
                         (questionsObj.suspect_questions?.length || 0) + 
                         (questionsObj.digital_questions?.length || 0) + 
                         (questionsObj.financial_questions?.length || 0);

  return {
    progress: Math.min(progressScore, 100),
    coverage: coverageScore,
    contradiction_count: contradictions.length,
    scrb_matches_count: scrbResults.landmarks.length,
    missing_evidence_count: reliability.missing_evidence.length,
    questions_remaining: totalQuestions,
    next_action: strategy?.immediate_actions?.[0]?.recommendation || "Verify complainant parameters.",
    overall_confidence: reliability.overall_confidence
  };
};

