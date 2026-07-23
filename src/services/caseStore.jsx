import React, { createContext, useContext, useState, useEffect } from 'react';
import { getComplaints, saveComplaint, deleteComplaint, resetToDemo, clearComplaints } from './storage';
import { detectPatterns } from './patternDetection';
import { calculateSimilarity, getEvidenceGaps } from './investigation';

// Define the React context
const CaseContext = createContext(null);

// Expanded Demo Case Seeder conforming exactly to the new operating system schema
const EXPANDED_DEMO_CASES = [
  {
    id: "COMP-001",
    officer: "OFFICER-771",
    status: "Active",
    incident_type: "Cyber Fraud",
    victim: "Kavitha R.",
    suspects: ["Unidentified Scammer (+91-9876543210)", "UPI Account quickloan@ybl Owner"],
    witnesses: ["Bank Branch Manager (North District)"],
    evidence: {
      photos: [
        { name: "whatsapp_chat_loan_offer.png", type: "image/png", date: "2026-06-25", size: "142 KB", desc: "Screenshot of loan advertisement conversation" }
      ],
      videos: [],
      audio: [],
      documents: ["complaint1.txt"]
    },
    timeline: [
      { date: "2026-06-25 09:30 AM", event: "Received unsolicited SMS offering low-interest loans", source: "complaint1.txt" },
      { date: "2026-06-25 10:15 AM", event: "Initiated WhatsApp contact with suspect phone +91-9876543210", source: "complaint1.txt" },
      { date: "2026-06-25 10:45 AM", event: "Transferred ₹12,000 security deposit to quickloan@ybl", source: "WhatsApp screenshot" },
      { date: "2026-06-25 11:00 AM", event: "Suspect requested an additional ₹8,000 fee and blocked victim's number", source: "complaint1.txt" }
    ],
    entities: {
      names: ["Kavitha R."],
      phones: ["+91-9876543210"],
      upi_ids: ["quickloan@ybl"],
      bank_accounts: [],
      locations: ["Online", "North Districts"],
      dates: ["2026-06-25"],
      amounts: ["₹12,000"],
      vehicles: [],
      urls: [],
      usernames: []
    },
    locations: ["Online", "North Districts"],
    money_trail: [
      { sender: "Kavitha R.", receiver: "quickloan@ybl Owner", amount: "₹12,000", upi: "quickloan@ybl", bank_account: "N/A", timestamp: "2026-06-25 10:45 AM" }
    ],
    vehicles: [],
    relationships: [
      { source: "Kavitha R.", target: "+91-9876543210", type: "Contacted", description: "Exchanged messages regarding personal loan application." },
      { source: "Kavitha R.", target: "quickloan@ybl", type: "Transferred", description: "Paid ₹12,000 processing fee." }
    ],
    notes: [
      { author: "OFFICER-771", date: "2026-06-25 02:30 PM", text: "Verified that phone number +91-9876543210 is active and routing calls through online VoIP gateway." }
    ],
    summary: "Victim Kavitha R. was contacted by scammers from phone +91-9876543210 offering a quick loan. She paid a ₹12,000 fee to UPI ID quickloan@ybl, after which the scammers blocked her.",
    confidence: "98%",
    investigation_score: 68,
    created_at: "2026-06-25T10:00:00.000Z"
  },
  {
    id: "COMP-002",
    officer: "OFFICER-771",
    status: "Active",
    incident_type: "Cyber Fraud",
    victim: "Rajesh Kumar",
    suspects: ["Suspect Phone (+91-9876543210)", "UPI Account quickloan@ybl Owner"],
    witnesses: [],
    evidence: {
      photos: [],
      videos: [],
      audio: [],
      documents: ["complaint2.txt"]
    },
    timeline: [
      { date: "2026-06-25 02:00 PM", event: "Searched online for commercial business loans", source: "complaint2.txt" },
      { date: "2026-06-26 11:00 AM", event: "Received callback from suspect phone +91-9876543210", source: "complaint2.txt" },
      { date: "2026-06-26 11:20 AM", event: "Transferred ₹15,000 commercial registration deposit to quickloan@ybl", source: "PhonePe record" },
      { date: "2026-06-26 11:30 AM", event: "Suspect switched off mobile phone and disappeared", source: "complaint2.txt" }
    ],
    entities: {
      names: ["Rajesh Kumar"],
      phones: ["+91-9876543210"],
      upi_ids: ["quickloan@ybl"],
      bank_accounts: [],
      locations: ["Online", "Metro Center"],
      dates: ["2026-06-26"],
      amounts: ["₹15,000"],
      vehicles: [],
      urls: [],
      usernames: []
    },
    locations: ["Online", "Metro Center"],
    money_trail: [
      { sender: "Rajesh Kumar", receiver: "quickloan@ybl Owner", amount: "₹15,000", upi: "quickloan@ybl", bank_account: "N/A", timestamp: "2026-06-26 11:20 AM" }
    ],
    vehicles: [],
    relationships: [
      { source: "Rajesh Kumar", target: "+91-9876543210", type: "Contacted By", description: "Suspect initiated cold call offering capital financing." },
      { source: "Rajesh Kumar", target: "quickloan@ybl", type: "Transferred", description: "Paid ₹15,000 via UPI application." }
    ],
    notes: [
      { author: "OFFICER-771", date: "2026-06-26 04:00 PM", text: "Suspect UPI handle is identical to COMP-001. Linking cases into Suggested Cyber Fraud ring." }
    ],
    summary: "Victim Rajesh Kumar was scammed of ₹15,000 by a caller at +91-9876543210 who promised a business loan. The payment was sent to UPI ID quickloan@ybl.",
    confidence: "98%",
    investigation_score: 72,
    created_at: "2026-06-26T11:30:00.000Z"
  },
  {
    id: "COMP-003",
    officer: "OFFICER-771",
    status: "Active",
    incident_type: "Cyber Fraud",
    victim: "Suresh Patel",
    suspects: ["Suspect Phone (+91-9876543210)", "National Bank Account 9988776655 Holder"],
    witnesses: [],
    evidence: {
      photos: [],
      videos: [],
      audio: [],
      documents: ["complaint3.txt"]
    },
    timeline: [
      { date: "2026-06-27 08:30 AM", event: "Received WhatsApp message from +91-9876543210 detailing loan options", source: "complaint3.txt" },
      { date: "2026-06-27 09:00 AM", event: "Instructed to deposit ₹25,000 processing fee into National Bank account", source: "complaint3.txt" },
      { date: "2026-06-27 09:15 AM", event: "Completed bank transfer of ₹25,000 to account 9988776655", source: "Bank Receipt" },
      { date: "2026-06-27 10:00 AM", event: "Suspect stopped responding and blocked victim's profile", source: "complaint3.txt" }
    ],
    entities: {
      names: ["Suresh Patel"],
      phones: ["+91-9876543210"],
      upi_ids: [],
      bank_accounts: ["9988776655"],
      locations: ["Online", "East Docks"],
      dates: ["2026-06-27"],
      amounts: ["₹25,000"],
      vehicles: [],
      urls: [],
      usernames: []
    },
    locations: ["Online", "East Docks"],
    money_trail: [
      { sender: "Suresh Patel", receiver: "Account 9988776655 Owner", amount: "₹25,000", upi: "N/A", bank_account: "9988776655", timestamp: "2026-06-27 09:15 AM" }
    ],
    vehicles: [],
    relationships: [
      { source: "Suresh Patel", target: "+91-9876543210", type: "Contacted By", description: "WhatsApp messaging connection established." },
      { source: "Suresh Patel", target: "9988776655", type: "Transferred", description: "Deposited verification fee into National Bank account." }
    ],
    notes: [
      { author: "OFFICER-771", date: "2026-06-27 11:00 AM", text: "Contacted National Bank fraud unit to request freeze on account 9988776655." }
    ],
    summary: "Victim Suresh Patel was scammed of ₹25,000 for a loan verification fee by a suspect calling from +91-9876543210. Payment was sent to National Bank account 9988776655.",
    confidence: "95%",
    investigation_score: 78,
    created_at: "2026-06-27T09:15:00.000Z"
  },
  {
    id: "COMP-004",
    officer: "OFFICER-771",
    status: "Active",
    incident_type: "Assault",
    victim: "Priya Sharma",
    suspects: ["Suspect Passenger (grabber)", "Suspect Rider (motorcycle driver)"],
    witnesses: ["Sanjay K. (Victim's companion present during assault)"],
    evidence: {
      photos: [
        { name: "cctv_frame_12.jpg", type: "image/jpeg", date: "2026-06-25", size: "380 KB", desc: "Black sports motorcycle departing area" }
      ],
      videos: [],
      audio: [
        { name: "officer_dispatch_audio.wav", type: "audio/wav", duration: "12s", desc: "First responder radio transcript log" }
      ],
      documents: ["assault_voice.txt"]
    },
    timeline: [
      { date: "2026-06-25 08:30 PM", event: "Walking along Metro Center station south access road", source: "assault_voice.txt" },
      { date: "2026-06-25 08:31 PM", event: "Two men on a black sports motorcycle blocked pathway", source: "witness Sanjay K." },
      { date: "2026-06-25 08:32 PM", event: "Passenger assaulted Sanjay K. and snatched handbag belonging to Priya Sharma", source: "assault_voice.txt" },
      { date: "2026-06-25 08:33 PM", event: "Suspects fled south on motorcycle with plate KA-01-MJ-4567", source: "witness Sanjay K." }
    ],
    entities: {
      names: ["Priya Sharma"],
      phones: [],
      upi_ids: [],
      bank_accounts: [],
      locations: ["Metro Center"],
      dates: ["2026-06-25"],
      amounts: [],
      vehicles: ["KA-01-MJ-4567"],
      urls: [],
      usernames: []
    },
    locations: ["Metro Center"],
    money_trail: [],
    vehicles: ["KA-01-MJ-4567"],
    relationships: [
      { source: "Priya Sharma", target: "KA-01-MJ-4567", type: "Targeted By", description: "Handbag and phone taken by riders of this motorcycle." },
      { source: "Priya Sharma", target: "Sanjay K.", type: "Companion", description: "Accompanied victim during the transit hub assault." }
    ],
    notes: [
      { author: "OFFICER-771", date: "2026-06-26 09:00 AM", text: "Motorcycle plate KA-01-MJ-4567 is registered to a local rental agency. Querying transaction log." }
    ],
    summary: "Assault and robbery near Metro Center station. Two suspects on a black sports motorcycle (KA-01-MJ-4567) assaulted the victim's companion and snatched her handbag.",
    confidence: "92%",
    investigation_score: 85,
    created_at: "2026-06-26T21:15:00.000Z"
  },
  {
    id: "COMP-005",
    officer: "OFFICER-771",
    status: "Active",
    incident_type: "Missing Person",
    victim: "Priya Sharma",
    suspects: ["Possible Unidentified Abductors"],
    witnesses: ["Ramesh Sharma (Father)", "College Instructor Professor Das"],
    evidence: {
      photos: [
        { name: "priya_sharma_recent_photo.jpg", type: "image/jpeg", date: "2026-06-25", size: "290 KB", desc: "Reference missing person photo" }
      ],
      videos: [],
      audio: [],
      documents: ["missing_person.txt"]
    },
    timeline: [
      { date: "2026-06-25 09:00 AM", event: "Left family residence in West Heights for Metro Center college campus", source: "missing_person.txt" },
      { date: "2026-06-25 10:30 AM", event: "Phone (+91-9900112233) lost cellular connection and powered down", source: "telecom logs" },
      { date: "2026-06-25 08:30 PM", event: "Victim's name matched profile assaulted in COMP-004 at Metro Center", source: "Cognitive cross-link check" },
      { date: "2026-06-26 03:00 PM", event: "Father Ramesh Sharma registered missing report after college verified absence", source: "missing_person.txt" }
    ],
    entities: {
      names: ["Priya Sharma", "Ramesh Sharma"],
      phones: ["+91-9900112233"],
      upi_ids: [],
      bank_accounts: [],
      locations: ["West Heights", "Metro Center"],
      dates: ["2026-06-25"],
      amounts: [],
      vehicles: [],
      urls: [],
      usernames: []
    },
    locations: ["West Heights", "Metro Center"],
    money_trail: [],
    vehicles: [],
    relationships: [
      { source: "Priya Sharma", target: "Ramesh Sharma", type: "Family Link", description: "Daughter of reporter Ramesh Sharma." },
      { source: "Priya Sharma", target: "+91-9900112233", type: "Device Owner", description: "Personal mobile device now switched off." }
    ],
    notes: [
      { author: "OFFICER-771", date: "2026-06-26 05:00 PM", text: "Highly possible linkage between this case and COMP-004. Handbag containing device was grabbed at Metro Center. Priya Sharma has not checked in at residence." }
    ],
    summary: "Priya Sharma, 22, missing from West Heights since June 25th after leaving for college. Last seen wearing a green kurta. Phone +91-9900112233 switched off since 10:30 AM.",
    confidence: "96%",
    investigation_score: 90,
    created_at: "2026-06-26T15:00:00.000Z"
  }
];

export const CaseProvider = ({ children }) => {
  const [cases, setCases] = useState([]);
  const [currentCase, setCurrentCase] = useState(null);
  const [systemLogs, setSystemLogs] = useState([]);
  const [warnings, setWarnings] = useState([]);
  const [reasoningTrace, setReasoningTrace] = useState([]);

  // Load from local storage or pre-populate on startup
  useEffect(() => {
    let stored = localStorage.getItem('crimelens_complaints');
    let casesList = [];
    if (!stored) {
      localStorage.setItem('crimelens_complaints', JSON.stringify(EXPANDED_DEMO_CASES));
      casesList = EXPANDED_DEMO_CASES;
    } else {
      try {
        const parsed = JSON.parse(stored);
        // Ensure cases conform to expanded schema with placeholder defaults
        casesList = parsed.map(c => ({
          id: c.id || "COMP-000",
          officer: c.officer || "OFFICER-771",
          status: c.status || "Active",
          incident_type: c.incident_type || "Cyber Fraud",
          victim: c.victim || c.entities?.names?.[0] || "Unknown",
          suspects: c.suspects || [],
          witnesses: c.witnesses || [],
          evidence: c.evidence || { photos: [], videos: [], audio: [], documents: c.evidence_submitted || [] },
          timeline: Array.isArray(c.timeline) && typeof c.timeline[0] === 'object' 
            ? c.timeline 
            : (c.timeline || []).map(str => ({ date: "Date pending", event: str, source: "AI Extraction" })),
          entities: c.entities || { names: [], phones: [], upi_ids: [], bank_accounts: [], locations: [], dates: [], amounts: [], vehicles: [], urls: [], usernames: [] },
          locations: c.locations || c.entities?.locations || [],
          money_trail: c.money_trail || [],
          vehicles: c.vehicles || c.entities?.vehicles || [],
          relationships: c.relationships || [],
          notes: Array.isArray(c.notes) && typeof c.notes[0] === 'object'
            ? c.notes
            : (c.notes || []).map(str => ({ author: "OFFICER-771", date: new Date().toISOString(), text: str })),
          summary: c.summary || "",
          confidence: c.confidence || "80%",
          investigation_score: c.investigation_score || 50,
          created_at: c.created_at || new Date().toISOString()
        }));
      } catch (e) {
        console.error("Failed to parse storage, using default expanded demo cases", e);
        casesList = EXPANDED_DEMO_CASES;
      }
    }

    setCases(casesList);
    if (casesList.length > 0) {
      setCurrentCase(casesList[0]);
      appendLog(`Workspace initialized. Loaded ${casesList.length} cases. Selected Active Case: ${casesList[0].id}.`);
    } else {
      appendLog(`Workspace initialized. Database is empty.`);
    }
  }, []);

  // Update warnings, traces, and save to store whenever currentCase or cases changes
  useEffect(() => {
    if (!currentCase) return;

    // Save active case state to local storage and update list
    const updatedList = cases.map(c => c.id === currentCase.id ? currentCase : c);
    localStorage.setItem('crimelens_complaints', JSON.stringify(updatedList));

    // Dynamic Reasoning & warnings compilation
    const runReasoningCore = () => {
      const trace = [];
      const warnList = [];

      trace.push(`[Reasoning Core] Evaluating case metrics for ${currentCase.id}...`);

      // 1. Analyze overlaps (Similarity checks)
      const similarCases = calculateSimilarity(currentCase, cases.filter(c => c.id !== currentCase.id));
      trace.push(`[Similarity Engine] Calculated matching indices across ${cases.length - 1} reference cases.`);
      
      similarCases.forEach(match => {
        if (match.score > 40) {
          trace.push(`[Overlapping Linkage] Case ${match.id} correlates with active case at ${match.score}% score.`);
          warnList.push({
            id: `WARN-LINK-${match.id}`,
            severity: match.score > 70 ? "High" : "Medium",
            message: `Possible cross-case correlation: ${currentCase.id} sharing indicators with ${match.id} (Similarity: ${match.score}%)`,
            details: match.reasons.join(", ")
          });
        }
      });

      // 2. Audit Evidence Gaps
      const gaps = getEvidenceGaps(currentCase);
      const missingCount = gaps.filter(g => g.status === "Missing").length;
      trace.push(`[Evidence Audit] Verified ${gaps.length} mandatory indicators. Identified ${missingCount} missing pieces of evidence.`);

      gaps.forEach(gap => {
        if (gap.status === "Missing") {
          warnList.push({
            id: `WARN-GAP-${gap.id}`,
            severity: "Low",
            message: `Suggested investigation step: Acquire missing evidence - "${gap.name}"`,
            details: gap.action
          });
        }
      });

      // 3. Score calculation
      const baseScore = Math.min(100, Math.round(
        (currentCase.entities?.names?.length ? 15 : 0) +
        (currentCase.entities?.phones?.length ? 15 : 0) +
        (currentCase.timeline?.length ? 20 : 0) +
        (currentCase.evidence?.photos?.length || currentCase.evidence?.documents?.length ? 20 : 0) +
        (currentCase.notes?.length ? 15 : 0) +
        (currentCase.relationships?.length ? 15 : 0)
      ));
      
      if (currentCase.investigation_score !== baseScore) {
        // Update currentCase with dynamically verified score
        setCurrentCase(prev => ({ ...prev, investigation_score: baseScore }));
      }

      setReasoningTrace(trace);
      setWarnings(warnList);
    };

    runReasoningCore();
  }, [currentCase, cases]);

  // Utility to append system logs
  const appendLog = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    setSystemLogs(prev => [`[${timestamp}] ${message}`, ...prev].slice(0, 100));
  };

  // Actions exposed to other components
  const selectCase = (caseId) => {
    const target = cases.find(c => c.id === caseId);
    if (target) {
      setCurrentCase(target);
      appendLog(`Case file ${caseId} loaded into workspace.`);
    }
  };

  const updateCase = (updated) => {
    // Merge updates into active case
    setCurrentCase(prev => {
      const next = { ...prev, ...updated };
      return next;
    });
    setCases(prev => prev.map(c => c.id === updated.id ? { ...c, ...updated } : c));
    appendLog(`Case file ${updated.id} parameters updated.`);
  };

  const createCase = (newCaseFields) => {
    const nextNum = cases.length > 0 
      ? Math.max(...cases.map(c => parseInt(c.id.split('-')[1]) || 0)) + 1 
      : 1;
    const newId = `COMP-${String(nextNum).padStart(3, '0')}`;
    const newCase = {
      id: newId,
      officer: newCaseFields.officer || "OFFICER-771",
      status: newCaseFields.status || "Active",
      incident_type: newCaseFields.incident_type || "Cyber Fraud",
      victim: newCaseFields.victim || newCaseFields.entities?.names?.[0] || "Unknown",
      suspects: newCaseFields.suspects || [],
      witnesses: newCaseFields.witnesses || [],
      evidence: newCaseFields.evidence || { photos: [], videos: [], audio: [], documents: newCaseFields.evidence_submitted || [] },
      timeline: newCaseFields.timeline || [],
      entities: newCaseFields.entities || { names: [], phones: [], upi_ids: [], bank_accounts: [], locations: [], dates: [], amounts: [], vehicles: [], urls: [], usernames: [] },
      locations: newCaseFields.locations || [],
      money_trail: newCaseFields.money_trail || [],
      vehicles: newCaseFields.vehicles || [],
      relationships: newCaseFields.relationships || [],
      notes: newCaseFields.notes || [],
      summary: newCaseFields.summary || "",
      confidence: newCaseFields.confidence || "80%",
      investigation_score: newCaseFields.investigation_score || 50,
      created_at: new Date().toISOString()
    };

    setCases(prev => [newCase, ...prev]);
    setCurrentCase(newCase);
    appendLog(`Created new Case ${newId} in operating system.`);
  };

  const deleteCaseFile = (caseId) => {
    const nextList = cases.filter(c => c.id !== caseId);
    setCases(nextList);
    deleteComplaint(caseId); // update low-level storage
    appendLog(`Case ${caseId} deleted from database.`);

    if (currentCase && currentCase.id === caseId) {
      if (nextList.length > 0) {
        setCurrentCase(nextList[0]);
      } else {
        setCurrentCase(null);
      }
    }
  };

  const resetWorkspace = () => {
    const seeded = resetToDemo();
    setCases(EXPANDED_DEMO_CASES);
    setCurrentCase(EXPANDED_DEMO_CASES[0]);
    setSystemLogs([]);
    appendLog(`Workspace reset to factory demo state. Loaded 5 files.`);
  };

  const clearWorkspace = () => {
    clearComplaints();
    setCases([]);
    setCurrentCase(null);
    setSystemLogs([]);
    appendLog(`Workspace wiped. Database empty.`);
  };

  return (
    <CaseContext.Provider value={{
      cases,
      currentCase,
      systemLogs,
      warnings,
      reasoningTrace,
      selectCase,
      updateCase,
      createCase,
      deleteCaseFile,
      resetWorkspace,
      clearWorkspace,
      appendLog
    }}>
      {children}
    </CaseContext.Provider>
  );
};

export const useCase = () => {
  const context = useContext(CaseContext);
  if (!context) {
    throw new Error("useCase must be used within a CaseProvider");
  }
  return context;
};
