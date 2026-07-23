/**
 * Knowledge Engine for CrimeLens OS.
 * Stores standard investigation profiles, MOs, checklists, SOPs, and pitfalls
 * for all 6 core crime types.
 *
 * This is not legal advice. This is investigative guidance.
 * Adheres to neutral vocabulary: "Possible", "Suggested", "Likely", "Needs verification".
 */

export const crimeKnowledgeBase = {
  "Cyber Fraud": {
    common_mo: "Suspect cold-calls or sends fraudulent digital alerts (SMS, WhatsApp, social media ads) promising cheap loans, lotteries, or parts. Demands advance payments via UPI handles or bank transfers for 'processing fees' or 'security verification', then ceases contact.",
    typical_evidence: [
      "Bank account statements / Ledgers",
      "UPI transaction logs & reference numbers (RRN)",
      "IP logs from login endpoints",
      "Phone call logs & subscriber KYC details",
      "Chat messages & payment links screenshots"
    ],
    investigation_checklist: [
      "Verify transaction trace with UPI gateway provider",
      "Issue formal bank ledger request (Section 91 CrPC equivalent) for suspect account",
      "Obtain subscriber registry records (KYC) for phone number used",
      "Query national cybercrime portal for matching fraud complaints",
      "File freezing request for beneficiary account funds within 24 hours"
    ],
    interview_questions: [
      "Did the suspect speak with any specific regional accent or use specific terms?",
      "Which platform or app hosted the initial link or advertisement?",
      "Did you receive any official-looking documents via digital chat?",
      "How long after the call was the payment executed?"
    ],
    relevant_sop: "SOP-CYBER-04: Immediate notification to the nodal bank within 2 hours of report. Log transaction reference in national cyber portal. Request KYC records under telecommunication advisory guidelines.",
    typical_timeline: [
      { step: "Initial Contact", description: "Suspect targets victim via social media link or cold call." },
      { step: "Inducement", description: "Suspect offers loan or reward, requesting minor fee." },
      { step: "Transfer", description: "Victim transfers registration fee to UPI account." },
      { step: "Cutoff", description: "Suspect discontinues communication; device is powered down." }
    ],
    common_mistakes: [
      "Delaying the freeze request to the bank beyond 24 hours.",
      "Neglecting to collect the full 12-digit UPI transaction reference number (RRN).",
      "Focusing only on the phone number without requesting the actual SIM registration card."
    ]
  },
  "Assault": {
    common_mo: "Suspects target victims in low-lit, high-commute transit zones (exits, corridors). Often operate in pairs using a motor vehicle (like a motorcycle) for quick snatch-and-grab or physical intimidation to execute robberies.",
    typical_evidence: [
      "Medical examination report / Injury certificate",
      "CCTV footage from public or private cameras near scene",
      "Eyewitness testimonies / Witness statements",
      "Physical evidence (torn clothing, weapons left behind)",
      "Suspect vehicle registration / Rental agency logs"
    ],
    investigation_checklist: [
      "Secure medical certificate detailing victim injury severity",
      "Map and download local CCTV feeds within 500m radius of scene",
      "Record eyewitness statement of nearby shop owners or commuters",
      "Trace reported license plate in national vehicle registry (Vahan)",
      "Search area for dropped physical evidence (e.g. phones, accessories)"
    ],
    interview_questions: [
      "What were the exact words or demands spoken by the assailants?",
      "Can you describe helmet colors, jacket logos, or vehicle markings?",
      "What direction did they head after the incident?",
      "Was there anyone else nearby who witnessed the assault?"
    ],
    relevant_sop: "SOP-PHYS-12: Immediate medical checkup for the victim. Scene sketch and photo logs. Fast-track recovery of traffic camera footages before auto-overwrites occur.",
    typical_timeline: [
      { step: "Observation", description: "Suspects shadow victim near transit corridor exit." },
      { step: "Confrontation", description: "Suspects physically approach and snatch item or strike victim." },
      { step: "Egress", description: "Suspects flee on a sports motorcycle or on foot." },
      { step: "Medical Alert", description: "Victim seeks assistance; emergency call is placed." }
    ],
    common_mistakes: [
      "Failing to request CCTV from nearby shops before their weekly overwrite cycle.",
      "Omiting detailed medical description of victim injuries in the preliminary record.",
      "Tracing only license plates without verifying if the plates were cloned or stolen."
    ]
  },
  "Missing Person": {
    common_mo: "Victims depart voluntarily or under duress. Often involves abrupt communications shutdown (mobile device powered down), leaving minimal physical footprint. Frequently centers around major transport corridors or transit hubs.",
    typical_evidence: [
      "Recent photographs of the missing individual",
      "Device call detail records (CDR) & last tower location ping",
      "Social media account logs & chats",
      "Public transit ticket logs or metro card swipings",
      "Statement of reporting parent, friends, or companions"
    ],
    investigation_checklist: [
      "Enter missing person details into the district network database",
      "Request cell tower dump logs for the device's last active zone",
      "Check with local railway, bus, and metro security desks",
      "Acquire statements from classmates, coworkers, or relatives",
      "Verify if any bank cards or accounts have been active since disappearance"
    ],
    interview_questions: [
      "Did they mention any recent arguments, conflicts, or plans to travel?",
      "Did you observe any changes in behavior or dress in the past 7 days?",
      "What items (keys, clothes, cash, cards) did they carry with them?",
      "Who was the last person they communicated with?"
    ],
    relevant_sop: "SOP-MIS-08: Immediate filing in central missing desk database. Tower ping requests prioritized under 'endangerment' exception. Transport terminals alert.",
    typical_timeline: [
      { step: "Departure", description: "Individual leaves home or workplace normal hour." },
      { step: "Offline Alert", description: "Family attempts contact; device goes offline abruptly." },
      { step: "Sightings", description: "Last physical sighting logged near transport node." },
      { step: "Report", description: "Missing file registered after family search fails." }
    ],
    common_mistakes: [
      "Delaying database registration under the assumption of voluntary return.",
      "Treating the disappearance as voluntary without checking last-seen transit CCTV.",
      "Failing to secure the victim's search history or active social logs early."
    ]
  },
  "Domestic Violence": {
    common_mo: "Suspect exerts physical or psychological control in domestic environments. Often characterized by escalating episodes, restrictions on communication, and recurring incidents of verbal or physical coercion.",
    typical_evidence: [
      "Victim medical injury report",
      "Emergency helpline call logs",
      "Audio/Video recordings of domestic arguments",
      "Statements of neighbors or family members",
      "Prior protective orders or civil disputes documents"
    ],
    investigation_checklist: [
      "Ensure victim's immediate physical safety and shelter access",
      "Record detailed medical examination of physical trauma",
      "Collect neighbor testimonies regarding recurring disturbances",
      "Log digital messages or recordings of threatening nature",
      "Verify history of domestic call dispatches to the address"
    ],
    interview_questions: [
      "How long has this behavior been occurring?",
      "Are there child dependents present at the residence?",
      "Has the suspect threatened you with physical objects or weapons?",
      "Do you have a safe location to reside during this inquiry?"
    ],
    relevant_sop: "SOP-DOM-02: Safety assessment prioritized. Mandatory medical documentation. Inform victim of rights and legal shelter options. Temporary protection coordination.",
    typical_timeline: [
      { step: "Tension", description: "Escalation of domestic arguments and restrictions on victim." },
      { step: "Incident", description: "Physical or severe verbal dispute occurs; neighbors alert." },
      { step: "Helpline Call", description: "Emergency call placed to local emergency service." },
      { step: "Separation", description: "Victim relocates temporarily; files formal complaint statement." }
    ],
    common_mistakes: [
      "Treating domestic disputes as minor family matters without formal documentation.",
      "Failing to interview children or adjacent neighbors who may have heard the incident.",
      "Failing to conduct a safety risk check for the victim upon filing."
    ]
  },
  "Vehicle Theft": {
    common_mo: "Suspects bypass vehicle lock mechanisms or duplicate ignition signals. Target vehicles parked in unmonitored spots or public transit parking lots, using specialized tools or transport trucks to relocate the asset.",
    typical_evidence: [
      "Vehicle registration certificate (RC) and insurance copy",
      "CCTV footage from parking lot or exit toll gates",
      "Physical keys (to verify duplication status)",
      "GPS tracking logs if active on vehicle",
      "Statements from parking attendants or security guard"
    ],
    investigation_checklist: [
      "Log vehicle chassis, engine, and registration numbers in national database",
      "Obtain parking ticket receipts and verify entry/exit timestamps",
      "Review road transport CCTV or toll gate logs in predicted escape routes",
      "Query local mechanics and scrap yard operators for target models",
      "Verify vehicle keys in possession of the owner"
    ],
    interview_questions: [
      "Where exactly did you park the vehicle, and at what time?",
      "Did you leave any valuables, duplicate keys, or RC copies inside?",
      "Did the vehicle have active GPS tracker, alarm, or mechanical lock?",
      "Did you notice anyone loitering near the parking zone?"
    ],
    relevant_sop: "SOP-VEH-05: Log registration number in stolen vehicle database immediately to alert highway toll systems. Map exit routes from the theft coordinates.",
    typical_timeline: [
      { step: "Parking", description: "Victim parks vehicle in public spot or transit lot." },
      { step: "Tampering", description: "Suspect bypasses ignition switch or picks lock." },
      { step: "Egress", description: "Suspect drives vehicle out of zone via regional roads." },
      { step: "Discovery", description: "Victim returns, discovers empty spot, files police complaint." }
    ],
    common_mistakes: [
      "Failing to check vehicle duplicate key custody.",
      "Delaying entry of vehicle engine numbers in regional highway alerts.",
      "Assuming the vehicle left under its own power without checking for flatbed trucks."
    ]
  },
  "Property Dispute": {
    common_mo: "Disputes over boundaries, title documents, or inheritance rights. Often leads to physical trespassing, fraudulent document submission (cloned deeds, false power of attorney), or blockades of access points.",
    typical_evidence: [
      "Registered property deeds / Land revenue records",
      "Property boundary surveys and maps",
      "Local municipal tax payment receipts",
      "Prior civil court decrees or injunction orders",
      "Trespass/Encroachment CCTV or photo logs"
    ],
    investigation_checklist: [
      "Verify property registration status with the sub-registrar portal",
      "Obtain government land survey maps detailing disputed boundaries",
      "Check for existing civil court status (injunctions or stay orders)",
      "Record statements of adjacent land owners regarding possession",
      "Log any physical damage or trespassing markers on site"
    ],
    interview_questions: [
      "How long have you held physical possession of the disputed site?",
      "What documents does the opposing party claim to hold?",
      "Has there been any physical altercation or threat regarding access?",
      "Are there active civil court cases regarding this plot?"
    ],
    relevant_sop: "SOP-PROP-11: Verify title deeds through government registrar database first. Enforce peace (prevent breach of public order) without settling land title, which remains a civil matter.",
    typical_timeline: [
      { step: "Acquisition", description: "Victim purchases or inherits land parcel." },
      { step: "Encroachment", description: "Opposing party asserts claim or erects boundary marker." },
      { step: "Filing", description: "Civil dispute filed or police complaint lodged regarding trespass." },
      { step: "Mediation", description: "Revenue officer reviews survey maps; police secure order." }
    ],
    common_mistakes: [
      "Attempting to determine actual property ownership, which is a civil court matter.",
      "Failing to verify title registration with sub-registrar registries.",
      "Ignoring prior civil court injunction orders active on the site."
    ]
  }
};

/**
 * Returns knowledge details for a specific crime/incident category.
 * If category is unrecognized, falls back to a default standard structure.
 */
export const getKnowledgeForCrime = (crimeType) => {
  const normalized = crimeType || "Default";
  if (crimeKnowledgeBase[normalized]) {
    return crimeKnowledgeBase[normalized];
  }

  // Fallback default investigative guidelines
  return {
    common_mo: "Standard incident pattern for this category type.",
    typical_evidence: ["Incident statement logs", "Primary participant identity records"],
    investigation_checklist: ["Record victim statement", "Collect identity details", "Verify locations"],
    interview_questions: ["Describe details of the event.", "Who was present?", "Are there any records?"],
    relevant_sop: "SOP-GEN-01: Verify identities, log primary statement, evaluate safety risks, and file report.",
    typical_timeline: [
      { step: "Incident", description: "The reported event occurs." },
      { step: "Report", description: "Complaint file is registered." }
    ],
    common_mistakes: ["Failing to log initial statement parameters completely."]
  };
};
