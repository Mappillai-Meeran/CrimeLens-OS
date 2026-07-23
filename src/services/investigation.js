import jsPDF from 'jspdf';
import { pdfLogoBase64 } from '../assets/pdfLogoBase64';

// ----------------------------------------------------
// Phase 7 — Similar Complaint Finder
// ----------------------------------------------------
export const calculateSimilarity = (target, list = []) => {
  if (!target) return [];
  
  return list
    .filter(c => c.id !== target.id)
    .map((c) => {
      let score = 0;
      const reasons = [];

      // 1. Same incident type
      if (c.incident_type === target.incident_type) {
        score += 20;
        reasons.push(`Same incident type (${target.incident_type})`);
      }

      // 2. Check entity overlaps
      const overlapFields = ['phones', 'upi_ids', 'bank_accounts', 'vehicles', 'urls', 'usernames'];
      overlapFields.forEach((field) => {
        const targetVals = target.entities?.[field] || [];
        const cVals = c.entities?.[field] || [];
        
        const intersection = targetVals.filter(v => cVals.includes(v));
        if (intersection.length > 0) {
          score += 40 * intersection.length;
          const displayField = field === 'phones' 
            ? 'phone' 
            : field === 'upi_ids' 
              ? 'UPI ID' 
              : field === 'bank_accounts' 
                ? 'bank account' 
                : field === 'vehicles'
                  ? 'vehicle plate'
                  : 'entity';
          reasons.push(`Shared ${displayField}: ${intersection.join(', ')}`);
        }
      });

      // 3. Location overlap
      const targetLocs = target.entities?.locations || [];
      const cLocs = c.entities?.locations || [];
      const locIntersection = targetLocs.filter(v => cLocs.includes(v));
      if (locIntersection.length > 0) {
        score += 10;
        reasons.push(`Overlapping location: ${locIntersection[0]}`);
      }

      // 4. Name overlap
      const targetNames = target.entities?.names || [];
      const cNames = c.entities?.names || [];
      const nameIntersection = targetNames.filter(v => cNames.includes(v));
      if (nameIntersection.length > 0) {
        score += 10;
        reasons.push(`Shared name reference: ${nameIntersection[0]}`);
      }

      const finalScore = Math.min(score, 100);

      return {
        complaint: c,
        similarity: finalScore,
        reasons
      };
    })
    .filter(item => item.similarity > 0)
    .sort((a, b) => b.similarity - a.similarity);
};

// ----------------------------------------------------
// Phase 8 — Evidence Gap Analysis
// ----------------------------------------------------
export const getEvidenceGaps = (complaint) => {
  if (!complaint) return [];
  
  const type = complaint.incident_type;
  const entities = complaint.entities || {};
  const summary = (complaint.summary || '').toLowerCase();
  
  const checkList = [];
  const addCheck = (id, name, status, action) => {
    checkList.push({ id, name, status, action });
  };

  if (type === 'Cyber Fraud') {
    // Suspect Phone
    if (entities.phones && entities.phones.length > 0) {
      addCheck('suspect_phone', 'Suspect Phone Number', 'Strongly Supported', 'Verified suspect contact details logged.');
    } else {
      addCheck('suspect_phone', 'Suspect Phone Number', 'Missing', 'Obtain phone logs and call history from the victim\'s provider.');
    }
    
    // Transaction Proof
    if ((entities.upi_ids && entities.upi_ids.length > 0) || (entities.bank_accounts && entities.bank_accounts.length > 0)) {
      addCheck('trans_proof', 'Financial Endpoint (UPI/Bank)', 'Strongly Supported', 'Verified bank account or UPI endpoint extracted.');
    } else {
      addCheck('trans_proof', 'Financial Endpoint (UPI/Bank)', 'Missing', 'Request transaction statement and bank transfer receipt from the victim.');
    }

    // Website URL
    if (entities.urls && entities.urls.length > 0) {
      addCheck('url_logged', 'Fraudulent URL/Website', 'Strongly Supported', 'Verified phishing/scam link registered.');
    } else {
      addCheck('url_logged', 'Fraudulent URL/Website', 'Missing', 'Identify and log any website URLs used in the phishing or fraud scheme.');
    }

    // Chat Records
    if (summary.includes('chat') || summary.includes('message') || summary.includes('whatsapp') || summary.includes('telegram')) {
      addCheck('chat_records', 'Chat Records', 'Partially Supported', 'Confirm if backup file or formal screenshots of chats are in evidence.');
    } else {
      addCheck('chat_records', 'Chat Records', 'Missing', 'Request chat backup (WhatsApp/Telegram) from the victim\'s device.');
    }

  } else if (type === 'Assault') {
    // Suspect Description
    if (entities.names && entities.names.length > 0) {
      addCheck('suspect_desc', 'Suspect Description', 'Strongly Supported', 'Suspect names/descriptors identified.');
    } else {
      addCheck('suspect_desc', 'Suspect Description', 'Missing', 'Interview victim and witnesses to construct a physical description profile.');
    }

    // Weapon Info
    if (summary.includes('weapon') || summary.includes('knife') || summary.includes('gun') || summary.includes('stick') || summary.includes('iron')) {
      addCheck('weapon_info', 'Weapon Details', 'Partially Supported', 'Establish type, materials, and size of any weapon reported.');
    } else {
      addCheck('weapon_info', 'Weapon Details', 'Missing', 'Inquire if any weapon was used or shown during the incident.');
    }

    // Location CCTV
    if (entities.locations && entities.locations.length > 0) {
      addCheck('cctv_footage', 'CCTV Footage at Scene', 'Partially Supported', 'Locate surrounding street cameras or commercial security rigs.');
    } else {
      addCheck('cctv_footage', 'CCTV Footage at Scene', 'Missing', 'Identify nearby public and private CCTV cameras to request footage.');
    }

    // Medical Report
    if (summary.includes('injury') || summary.includes('hurt') || summary.includes('hospital') || summary.includes('wound')) {
      addCheck('medical_report', 'Medical Injury Report', 'Partially Supported', 'Retrieve clinical verification forms from treatment center.');
    } else {
      addCheck('medical_report', 'Medical Injury Report', 'Missing', 'Request medical/forensic report if the victim sustained physical injuries.');
    }

  } else if (type === 'Domestic Violence') {
    // Abuse History
    if (summary.includes('prior') || summary.includes('history') || summary.includes('always') || summary.includes('past')) {
      addCheck('history', 'Prior Incident History', 'Partially Supported', 'Query dispatch database for previous service calls to the residence.');
    } else {
      addCheck('history', 'Prior Incident History', 'Missing', 'Verify prior domestic dispatch logs for the same address/parties.');
    }

    // Medical exam
    addCheck('med_exam', 'Medical Injury Evidence', 'Missing', 'Obtain forensic medical examination details to log physical distress.');

    // Witness Statement
    addCheck('witness_stmt', 'Witness Statements', 'Missing', 'Interview neighbors or family members who may have witnessed the incident.');

    // Protection Order
    addCheck('restraining', 'Active Protection Orders', 'Missing', 'Verify if there are any active restraining or protection orders in county records.');

  } else if (type === 'Missing Person') {
    // Physical Description
    if (summary.includes('height') || summary.includes('kurta') || summary.includes('wear') || summary.includes('hair') || summary.includes('tall')) {
      addCheck('desc_photo', 'Physical Description & Photo', 'Strongly Supported', 'Subject description and recent photograph logged.');
    } else {
      addCheck('desc_photo', 'Physical Description & Photo', 'Missing', 'Acquire a high-resolution recent photograph and detailed physical description.');
    }

    // Last Seen CCTV
    if (entities.locations && entities.locations.length > 0) {
      addCheck('last_cctv', 'CCTV logs at Last Coordinates', 'Partially Supported', 'Trace public feeds near departure location.');
    } else {
      addCheck('last_cctv', 'CCTV logs at Last Coordinates', 'Missing', 'Trace and review CCTV logs from the last known location.');
    }

    // Cell Tower Triangulation
    if (entities.phones && entities.phones.length > 0) {
      addCheck('cell_tower', 'Cell Tower Triangulation', 'Partially Supported', 'Submit network triangulation request for logged device.');
    } else {
      addCheck('cell_tower', 'Cell Tower Triangulation', 'Missing', 'Request emergency tower logs for the missing person\'s cell phone.');
    }

    // Social Accounts
    addCheck('social_audit', 'Social & Financial Activity', 'Missing', 'Audit recent social media log-ins and bank account activities for location signs.');

  } else if (type === 'Vehicle Theft') {
    // Vehicle Number
    if (entities.vehicles && entities.vehicles.length > 0) {
      addCheck('vehicle_reg', 'Registration / License Plate', 'Strongly Supported', 'License plate details logged.');
    } else {
      addCheck('vehicle_reg', 'Registration / License Plate', 'Missing', 'Obtain the vehicle registration certificate and license plate details.');
    }

    // Status of keys
    addCheck('spare_keys', 'Spare Keys Status', 'Missing', 'Verify if all keys are accounted for and confirm if the vehicle was locked.');

    // Toll Plaza
    if (entities.vehicles && entities.vehicles.length > 0) {
      addCheck('toll_logs', 'Toll Plaza / Fastag Logs', 'Partially Supported', 'Inquire with regional transit authorities for toll checkpoints.');
    } else {
      addCheck('toll_logs', 'Toll Plaza / Fastag Logs', 'Missing', 'Check toll plaza and Fastag transit history for the stolen vehicle.');
    }

    // Exit CCTV
    addCheck('exit_cctv', 'CCTV of Exit Gates', 'Missing', 'Request footage from exit gates or surrounding street cameras.');

  } else if (type === 'Property Dispute') {
    // Deeds
    if (summary.includes('deed') || summary.includes('title') || summary.includes('sale') || summary.includes('land')) {
      addCheck('title_deeds', 'Land Title Deeds', 'Partially Supported', 'Review document registry records submitted by parties.');
    } else {
      addCheck('title_deeds', 'Land Title Deeds', 'Missing', 'Request registered sale deeds or land ownership documents.');
    }

    // Survey Map
    addCheck('survey_map', 'Official Survey Map', 'Missing', 'Obtain the layout plan or survey map from the local municipal authority.');

    // Police history
    addCheck('prior_history', 'Prior Dispute Logs', 'Missing', 'Check for previous local complaints or boundary disputes involving the parties.');

    // Neutral neighbors
    addCheck('neighbor_stmt', 'Neighbor Statements', 'Missing', 'Interview adjacent property owners to establish historical possession.');

  } else {
    // General Default
    addCheck('identity_verif', 'Reporter Identity Verification', 'Strongly Supported', 'Officer checked ID credentials.');
    addCheck('scene_visit', 'Scene Visual Verification', 'Missing', 'Dispatch patrol unit to perform a visual review of incident scene.');
  }

  return checkList;
};

// ----------------------------------------------------
// Phase 6 — Investigation Brief (PDF Generator)
// ----------------------------------------------------
export const generateBriefPDF = (
  complaint,
  similar = [],
  patterns = [],
  gaps = [],
  scrbResults = null,
  strategy = null,
  questions = null,
  reliability = null,
  reasoning = null,
  chatHistory = []
) => {
  const doc = new jsPDF();
  const dateStr = new Date().toLocaleString();
  const victimName = complaint.entities?.names?.[0] || "Unknown Victim";

  // Document Styling - Light background, print-friendly layout with purple/cyan accents
  const applyPageTemplate = (pageNum, titleText) => {
    doc.setFillColor(250, 250, 252);
    doc.rect(0, 0, 210, 297, 'F');

    // Header Banner
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, 210, 38, 'F');

    // Logo & Title
    try {
      if (pdfLogoBase64) {
        doc.addImage(pdfLogoBase64, 'PNG', 12, 6, 26, 14.5);
      }
    } catch (e) {
      console.warn("Could not render PDF header logo:", e);
    }

    doc.setTextColor(167, 139, 250); // Primary purple accent
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("CRIMELENS AI — INVESTIGATIVE BRIEF", 42, 17);

    doc.setTextColor(156, 163, 175);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text("TADA / AUTOMATED ADVISORY DISPATCH ENGINE", 42, 23);

    // Meta information
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text(`File ID: ${complaint.id}`, 145, 12);
    doc.text(`Date: ${dateStr}`, 145, 18);
    doc.text(`Officer ID: ${complaint.officer || 'OFFICER-771'}`, 145, 24);
    doc.text(`Class: ${complaint.incident_type}`, 145, 30);

    // Footer
    doc.setDrawColor(209, 213, 219);
    doc.line(15, 272, 195, 272);
    doc.setFont("helvetica", "italic");
    doc.setFontSize(7);
    doc.setTextColor(107, 114, 128);
    const disclaimer = "DISCLAIMER: Automated analytical advisory tool to assist officers. Highlights possibilities based on patterns. Does NOT confirm guilt or legal culpability.";
    doc.text(disclaimer, 15, 278);
    doc.text(`Page ${pageNum}`, 190, 278);
  };

  let page = 1;
  applyPageTemplate(page, "CASE REPORT");
  let currentY = 50;

  // 1. INCIDENT SUMMARY
  doc.setFillColor(139, 92, 246); // purple-500
  doc.rect(15, currentY - 5, 3, 7, 'F');
  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("1. INCIDENT SUMMARY", 22, currentY);
  currentY += 8;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(55, 65, 81);
  const rawSummary = complaint.summary || "No description logged.";
  const formattedSummary = `This advisory brief assists in reviewing a potential ${complaint.incident_type.toLowerCase()} file. The system highlights specific facts described below:\n\n${rawSummary}`;
  const splitSummary = doc.splitTextToSize(formattedSummary, 180);
  doc.text(splitSummary, 15, currentY);
  currentY += splitSummary.length * 5 + 8;

  // 2. EXTRACTED METADATA & ENTITIES
  doc.setFillColor(6, 182, 212); // cyan-500
  doc.rect(15, currentY - 5, 3, 7, 'F');
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("2. EXTRACTED METADATA & ENTITIES", 22, currentY);
  currentY += 8;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  const entities = complaint.entities || {};
  const entityLabels = [
    { label: "Victim Name(s)", key: "names" },
    { label: "Suspect Contact(s)", key: "phones" },
    { label: "UPI Address(es)", key: "upi_ids" },
    { label: "Bank Account(s)", key: "bank_accounts" },
    { label: "Locations Logged", key: "locations" },
    { label: "Vehicles Logged", key: "vehicles" }
  ];
  let entityDetails = "";
  entityLabels.forEach((item) => {
    const vals = entities[item.key] || [];
    if (vals.length > 0) {
      entityDetails += `• ${item.label}: ${vals.join(', ')}\n`;
    }
  });
  if (!entityDetails) entityDetails = "No specific entities extracted.";
  const splitEntities = doc.splitTextToSize(entityDetails, 180);
  doc.text(splitEntities, 15, currentY);
  currentY += splitEntities.length * 4.5 + 8;

  // 3. TIMELINE INDICATORS
  doc.setFillColor(100, 116, 139); // slate-500
  doc.rect(15, currentY - 5, 3, 7, 'F');
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("3. INCIDENT TIMELINE INDICATORS", 22, currentY);
  currentY += 8;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  const timeline = complaint.timeline || [];
  if (timeline.length > 0) {
    timeline.forEach((step) => {
      const stepText = typeof step === 'string' ? step : `${step.date || 'Event'}: ${step.event}`;
      const splitStep = doc.splitTextToSize(`• ${stepText}`, 180);
      doc.text(splitStep, 15, currentY);
      currentY += splitStep.length * 4.5;
    });
  } else {
    doc.text("No chronological milestones identified.", 15, currentY);
    currentY += 6;
  }

  // ── PAGE 2: SCRB MATCHES & EVIDENCE RELIABILITY ──
  doc.addPage();
  page++;
  applyPageTemplate(page, "SCRB MATCHES");
  currentY = 50;

  // 4. SIMILAR INVESTIGATION MEMORY
  doc.setFillColor(139, 92, 246);
  doc.rect(15, currentY - 5, 3, 7, 'F');
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("4. SIMILAR HISTORICAL INVESTIGATIONS", 22, currentY);
  currentY += 8;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  if (scrbResults && scrbResults.landmarks && scrbResults.landmarks.length > 0) {
    scrbResults.landmarks.forEach((match) => {
      doc.setFont("helvetica", "bold");
      doc.text(`[Case Match] ${match.id} · ${match.crime_type} (Similarity: ${match.score}%)`, 15, currentY);
      doc.setFont("helvetica", "normal");
      currentY += 5;
      const matchDesc = `• Reason: ${match.reasons.join(' · ')}\n• Lessons: ${match.lessons}\n• Evidence Used: ${match.evidence_collected.join(', ')}\n• Next Step: ${match.next_steps}`;
      const splitMatch = doc.splitTextToSize(matchDesc, 180);
      doc.text(splitMatch, 18, currentY);
      currentY += splitMatch.length * 4.5 + 4;
    });
  } else {
    doc.text("No matching landmark investigations found.", 15, currentY);
    currentY += 6;
  }
  currentY += 6;

  // 5. EVIDENCE RELIABILITY ASSESSMENT
  if (reliability) {
    doc.setFillColor(6, 182, 212);
    doc.rect(15, currentY - 5, 3, 7, 'F');
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("5. EVIDENCE RELIABILITY ASSESSMENT", 22, currentY);
    currentY += 8;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(`• Overall Reliability Index: ${reliability.overall_score}% (${reliability.overall_confidence} Confidence)`, 15, currentY);
    currentY += 6;

    reliability.evidence_scores.forEach((scr) => {
      doc.text(`  - [${scr.type}] ${scr.name}: Score ${scr.score}% (Conf: ${scr.confidence})`, 15, currentY);
      currentY += 5;
    });
    currentY += 3;

    if (reliability.missing_evidence.length > 0) {
      doc.setFont("helvetica", "bold");
      doc.text("• Detected Missing Evidence Checklist:", 15, currentY);
      doc.setFont("helvetica", "normal");
      currentY += 5;
      reliability.missing_evidence.forEach(m => {
        doc.text(`  [ ] ${m}`, 15, currentY);
        currentY += 5;
      });
    }
  }

  // ── PAGE 3: GUIDELINES, PRECEDENTS & STRATEGY ──
  doc.addPage();
  page++;
  applyPageTemplate(page, "STRATEGY & ADVISORY");
  currentY = 50;

  // 6. POLICE GUIDELINES & LEGAL GUIDANCE
  doc.setFillColor(245, 158, 11);
  doc.rect(15, currentY - 5, 3, 7, 'F');
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("6. POLICE GUIDELINES & LEGAL PRECEDENTS", 22, currentY);
  currentY += 8;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  if (scrbResults && scrbResults.guidelines && scrbResults.guidelines.length > 0) {
    scrbResults.guidelines.forEach(g => {
      doc.setFont("helvetica", "bold");
      doc.text(`• Guideline: ${g.title} (${g.relevant_sop})`, 15, currentY);
      doc.setFont("helvetica", "normal");
      currentY += 5;
      const gText = `Procedure: ${g.required_procedure}\nImportant Notes: ${g.important_notes}`;
      const splitG = doc.splitTextToSize(gText, 180);
      doc.text(splitG, 18, currentY);
      currentY += splitG.length * 4.5 + 4;
    });
  } else {
    doc.text("No specific police guidelines mapped.", 15, currentY);
    currentY += 6;
  }

  if (scrbResults && scrbResults.precedents && scrbResults.precedents.length > 0) {
    scrbResults.precedents.forEach(p => {
      doc.setFont("helvetica", "bold");
      doc.text(`• Precedent Citation: ${p.citation} (Court: ${p.court})`, 15, currentY);
      doc.setFont("helvetica", "normal");
      currentY += 5;
      const pText = `Principle: ${p.relevant_principle}\nObservation: ${p.key_observation}\nAdvice: ${p.practical_investigation_advice}`;
      const splitP = doc.splitTextToSize(pText, 180);
      doc.text(splitP, 18, currentY);
      currentY += splitP.length * 4.5 + 4;
    });
  }

  // 7. STRATEGY ENGINE DIRECTIVES
  if (strategy) {
    doc.setFillColor(16, 185, 129); // emerald-500
    doc.rect(15, currentY - 5, 3, 7, 'F');
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("7. ACTIONABLE STRATEGY & ADVISORY DIRECTIVES", 22, currentY);
    currentY += 8;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    strategy.immediate_actions.forEach(act => {
      const actText = `• Action: ${act.recommendation}\n  Reason: ${act.reason} (Conf: ${act.confidence})`;
      const splitAct = doc.splitTextToSize(actText, 180);
      doc.text(splitAct, 15, currentY);
      currentY += splitAct.length * 4.5 + 2;
    });
  }

  // ── PAGE 4: QUESTIONS & REASONING SUMMARY ──
  doc.addPage();
  page++;
  applyPageTemplate(page, "QUESTIONS & LOGIC");
  currentY = 50;

  // 8. INVESTIGATIVE QUESTIONS
  if (questions) {
    doc.setFillColor(139, 92, 246);
    doc.rect(15, currentY - 5, 3, 7, 'F');
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("8. SUGGESTED PROFILE INVESTIGATION QUESTIONS", 22, currentY);
    currentY += 8;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);

    const printQ = (label, list) => {
      if (list.length === 0) return;
      doc.setFont("helvetica", "bold");
      doc.text(`[${label}]`, 15, currentY);
      doc.setFont("helvetica", "normal");
      currentY += 4.5;
      list.forEach(q => {
        const qText = `Q: ${q.question}\n   Importance: ${q.importance}`;
        const splitQ = doc.splitTextToSize(qText, 180);
        doc.text(splitQ, 15, currentY);
        currentY += splitQ.length * 4.5 + 1.5;
      });
      currentY += 2;
    };

    printQ("Victim Questions", questions.victim_questions);
    printQ("Witness Questions", questions.witness_questions);
    printQ("Suspect Questions", questions.suspect_questions);
    printQ("Digital Questions", questions.digital_questions);
    printQ("Financial Questions", questions.financial_questions);
  }

  // 9. REASONING TREE SUMMARY
  if (reasoning) {
    doc.setFillColor(100, 116, 139);
    doc.rect(15, currentY - 5, 3, 7, 'F');
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("9. DECISION REASONING TREE PATHWAY", 22, currentY);
    currentY += 8;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    reasoning.forEach(node => {
      doc.text(`• ${node.title}: ${node.description}`, 15, currentY);
      currentY += 4;
      doc.text(`  Trace basis: ${node.evidence_trace}`, 15, currentY);
      currentY += 5;
    });
  }

  // ── PAGE 5: COPILOT QA TRANSCRIPT ──
  if (chatHistory && chatHistory.length > 0) {
    doc.addPage();
    page++;
    applyPageTemplate(page, "COPILOT TRANSCRIPT");
    currentY = 50;

    doc.setFillColor(139, 92, 246);
    doc.rect(15, currentY - 5, 3, 7, 'F');
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("10. INVESTIGATION COPILOT QA TRANSCRIPT", 22, currentY);
    currentY += 8;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);

    chatHistory.forEach((msg) => {
      if (msg.text && (msg.sender === 'user' || msg.sender === 'ai')) {
        const prefix = msg.sender === 'user' ? "OFFICER: " : "COPILOT: ";
        doc.setFont("helvetica", msg.sender === 'user' ? "bold" : "normal");
        
        let msgText = msg.text;
        if (typeof msgText === 'object') {
          msgText = `Answer: ${msgText.answer || ''}\nReasoning: ${msgText.reasoning || ''}\nNext Action: ${msgText.next_action || ''}`;
        }
        
        const splitText = doc.splitTextToSize(`${prefix}${msgText}`, 180);
        
        if (currentY + (splitText.length * 4) > 260) {
          doc.addPage();
          page++;
          applyPageTemplate(page, "COPILOT TRANSCRIPT");
          currentY = 50;
        }

        doc.text(splitText, 15, currentY);
        currentY += splitText.length * 4 + 3;
      }
    });
  }

  return doc;
};
