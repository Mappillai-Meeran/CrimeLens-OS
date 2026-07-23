const STORAGE_KEY = 'crimelens_complaints';

// Preloaded demo complaints based on Phase 0 requirements
const DEMO_COMPLAINTS = [
  {
    id: "COMP-001",
    incident_type: "Cyber Fraud",
    summary: "Victim Kavitha R. was contacted by scammers from phone +91-9876543210 offering a quick loan. She paid a ₹12,000 fee to UPI ID quickloan@ybl, after which the scammers blocked her.",
    confidence: "98%",
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
    timeline: [
      "2026-06-25: Received loan offer message",
      "2026-06-25: Contacted suspect at +91-9876543210",
      "2026-06-25: Transferred ₹12,000 processing fee to quickloan@ybl",
      "2026-06-25: Suspect requested more money and blocked victim's number"
    ],
    evidence_submitted: ["complaint1.txt"],
    created_at: "2026-06-25T10:00:00.000Z",
    status: "Active",
    officer: "OFFICER-771"
  },
  {
    id: "COMP-002",
    incident_type: "Cyber Fraud",
    summary: "Victim Rajesh Kumar was scammed of ₹15,000 by a caller at +91-9876543210 who promised a business loan. The payment was sent to UPI ID quickloan@ybl.",
    confidence: "98%",
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
    timeline: [
      "2026-06-25: Looking for business loan online",
      "2026-06-26: Received call from +91-9876543210",
      "2026-06-26: Paid ₹15,000 via PhonePe to quickloan@ybl",
      "2026-06-26: Suspect disappeared and switched off phone"
    ],
    evidence_submitted: ["complaint2.txt"],
    created_at: "2026-06-26T11:30:00.000Z",
    status: "Active",
    officer: "OFFICER-771"
  },
  {
    id: "COMP-003",
    incident_type: "Cyber Fraud",
    summary: "Victim Suresh Patel was scammed of ₹25,000 for a loan verification fee by a suspect calling from +91-9876543210. Payment was sent to National Bank account 9988776655.",
    confidence: "95%",
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
    timeline: [
      "2026-06-27: Received WhatsApp message from +91-9876543210",
      "2026-06-27: Instructed to transfer ₹25,000 processing fee",
      "2026-06-27: Paid ₹25,000 to National Bank account 9988776655",
      "2026-06-27: Suspect ceased communication"
    ],
    evidence_submitted: ["complaint3.txt"],
    created_at: "2026-06-27T09:15:00.000Z",
    status: "Active",
    officer: "OFFICER-771"
  },
  {
    id: "COMP-004",
    incident_type: "Assault",
    summary: "Assault and robbery of a victim near Metro Center station. Two suspects on a black sports motorcycle (KA-01-MJ-4567) assaulted the victim's friend and snatched her handbag.",
    confidence: "92%",
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
    timeline: [
      "2026-06-25 20:30: Walking near Metro Center station",
      "2026-06-25 20:31: Confronted by two men on black motorcycle",
      "2026-06-25 20:32: Passenger assaulted Priya and grabbed bag",
      "2026-06-25 20:33: Suspects fled on motorcycle KA-01-MJ-4567"
    ],
    evidence_submitted: ["assault_voice.txt"],
    created_at: "2026-06-26T21:15:00.000Z",
    status: "Active",
    officer: "OFFICER-771"
  },
  {
    id: "COMP-005",
    incident_type: "Missing Person",
    summary: "Priya Sharma, 22, missing from West Heights since June 25th after leaving for college. Last seen wearing a green kurta. Phone +91-9900112233 switched off.",
    confidence: "96%",
    entities: {
      names: ["Priya Sharma", "Ramesh Sharma"],
      phones: ["+91-9900112233"],
      upi_ids: [],
      bank_accounts: [],
      locations: ["West Heights"],
      dates: ["2026-06-25"],
      amounts: [],
      vehicles: [],
      urls: [],
      usernames: []
    },
    timeline: [
      "2026-06-25 09:00: Left home in West Heights for college",
      "2026-06-25 10:30: Phone (+91-9900112233) switched off",
      "2026-06-26: Family reported missing after checking with friends"
    ],
    evidence_submitted: ["missing_person.txt"],
    created_at: "2026-06-26T15:00:00.000Z",
    status: "Active",
    officer: "OFFICER-771"
  }
];

export const getComplaints = () => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    // Seed with demo data if storage is empty
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEMO_COMPLAINTS));
    return DEMO_COMPLAINTS;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    console.error("Failed to parse complaints data", e);
    return [];
  }
};

export const getComplaint = (id) => {
  const complaints = getComplaints();
  return complaints.find(c => c.id === id) || null;
};

export const saveComplaint = (complaint) => {
  const complaints = getComplaints();
  let updatedComplaints;

  if (complaint.id) {
    // Update existing
    updatedComplaints = complaints.map(c => c.id === complaint.id ? { ...c, ...complaint } : c);
  } else {
    // Create new
    const nextNum = complaints.length > 0 
      ? Math.max(...complaints.map(c => parseInt(c.id.split('-')[1]) || 0)) + 1 
      : 1;
    const newId = `COMP-${String(nextNum).padStart(3, '0')}`;
    const newComplaint = {
      ...complaint,
      id: newId,
      created_at: complaint.created_at || new Date().toISOString(),
      status: complaint.status || 'Active',
      officer: complaint.officer || 'OFFICER-771'
    };
    updatedComplaints = [newComplaint, ...complaints];
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedComplaints));
  // Return the specific complaint list or the item
  return complaint.id ? complaint : updatedComplaints[0];
};

export const deleteComplaint = (id) => {
  const complaints = getComplaints();
  const filtered = complaints.filter(c => c.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  return filtered;
};

export const clearComplaints = () => {
  localStorage.removeItem(STORAGE_KEY);
  return [];
};

export const resetToDemo = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(DEMO_COMPLAINTS));
  return DEMO_COMPLAINTS;
};
