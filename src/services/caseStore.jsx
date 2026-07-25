import React, { createContext, useContext, useState, useEffect } from 'react';
import { getComplaints, saveComplaint, deleteComplaint, resetToDemo, clearComplaints } from './storage';
import { detectPatterns } from './patternDetection';
import { calculateSimilarity, getEvidenceGaps } from './investigation';
import {
  saveInvestigationToCatalyst,
  loadInvestigationsFromCatalyst,
  deleteInvestigationFromCatalyst
} from './catalystDataStoreService';

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
  },
  {
    id: "COMP-006",
    officer: "OFFICER-842",
    status: "Active",
    incident_type: "Vehicle Theft",
    victim: "Anand Nagaraj",
    suspects: ["Ravi D. (identified via CCTV)", "Mohan S. (accomplice)"],
    witnesses: ["Parking Attendant Ganesh", "Security Guard Venkatesh"],
    evidence: {
      photos: [{ name: "parking_cctv_frame_03.jpg", type: "image/jpeg", date: "2026-07-01", size: "512 KB", desc: "Suspect entering victim's vehicle" }],
      videos: [{ name: "building_cctv.mp4", type: "video/mp4", duration: "2m14s", desc: "Full extraction sequence from basement parking" }],
      audio: [],
      documents: ["vehicle_theft_anand.txt"]
    },
    timeline: [
      { date: "2026-07-01 11:00 PM", event: "Anand Nagaraj parked silver Honda City (KA-03-TY-8821) in Prestige Tower B2 basement", source: "Victim statement" },
      { date: "2026-07-02 02:22 AM", event: "Suspects Ravi D. and Mohan S. hot-wired vehicle and fled via north exit", source: "CCTV footage" },
      { date: "2026-07-02 07:00 AM", event: "Anand Nagaraj reported vehicle missing to Rajajinagar PS", source: "FIR Record" },
      { date: "2026-07-02 09:30 AM", event: "Vehicle spotted near Nelamangala bypass — not yet recovered", source: "Traffic Patrol Report" }
    ],
    entities: {
      names: ["Anand Nagaraj", "Ravi D.", "Mohan S.", "Ganesh", "Venkatesh"],
      phones: ["+91-9845001234"],
      upi_ids: [],
      bank_accounts: [],
      locations: ["Rajajinagar", "Prestige Tower B2", "Nelamangala Bypass"],
      dates: ["2026-07-01", "2026-07-02"],
      amounts: ["₹9,50,000"],
      vehicles: ["KA-03-TY-8821"],
      urls: [],
      usernames: []
    },
    locations: ["Rajajinagar", "Nelamangala"],
    money_trail: [],
    vehicles: ["KA-03-TY-8821"],
    relationships: [
      { source: "Anand Nagaraj", target: "KA-03-TY-8821", type: "Owner", description: "Registered owner of stolen Honda City." },
      { source: "Ravi D.", target: "KA-03-TY-8821", type: "Stole", description: "Identified on CCTV hot-wiring vehicle." },
      { source: "Ravi D.", target: "Mohan S.", type: "Accomplice", description: "Both entered parking and fled together." }
    ],
    notes: [{ author: "OFFICER-842", date: "2026-07-02 10:00 AM", text: "RTO confirmed KA-03-TY-8821 belongs to victim. BSNL tower data requested for suspect phone." }],
    summary: "Silver Honda City (KA-03-TY-8821) stolen from Prestige Tower basement at 2:22 AM by suspects Ravi D. and Mohan S. CCTV confirms primary suspect identity. Vehicle worth ₹9.5L.",
    confidence: "94%",
    investigation_score: 81,
    station: "Rajajinagar PS",
    district: "Bengaluru Urban",
    created_at: "2026-07-02T07:00:00.000Z"
  },
  {
    id: "COMP-007",
    officer: "OFFICER-953",
    status: "Active",
    incident_type: "Domestic Violence",
    victim: "Shanthi B.",
    suspects: ["Raju B. (Husband)"],
    witnesses: ["Dr. Meena (Treating Physician)", "Neighbour Lakshmi"],
    evidence: {
      photos: [{ name: "injury_medical_photo_01.jpg", type: "image/jpeg", date: "2026-07-03", size: "220 KB", desc: "Bruises on left arm and face" }],
      videos: [],
      audio: [{ name: "neighbor_complaint_audio.wav", type: "audio/wav", duration: "5m30s", desc: "Neighbour describing sounds heard" }],
      documents: ["domestic_violence_shanthi.txt"]
    },
    timeline: [
      { date: "2026-07-03 09:00 PM", event: "Raju B. arrived home inebriated and began altercation", source: "Neighbour Lakshmi" },
      { date: "2026-07-03 09:15 PM", event: "Physical assault — Shanthi sustained injuries to face and left arm", source: "Medical Report" },
      { date: "2026-07-03 09:20 PM", event: "Neighbour Lakshmi called Mysuru PCR", source: "PCR Log" },
      { date: "2026-07-04 10:00 AM", event: "Shanthi admitted to Kidwai Hospital; medico-legal case opened", source: "Hospital Records" }
    ],
    entities: {
      names: ["Shanthi B.", "Raju B.", "Dr. Meena", "Lakshmi"],
      phones: ["+91-9900887766"],
      upi_ids: [],
      bank_accounts: [],
      locations: ["Saraswathipuram", "Mysuru", "Kidwai Hospital"],
      dates: ["2026-07-03", "2026-07-04"],
      amounts: [],
      vehicles: [],
      urls: [],
      usernames: []
    },
    locations: ["Saraswathipuram", "Mysuru"],
    money_trail: [],
    vehicles: [],
    relationships: [
      { source: "Raju B.", target: "Shanthi B.", type: "Assaulted", description: "Husband physically assaulted wife." },
      { source: "Lakshmi", target: "Shanthi B.", type: "Witness", description: "Neighbour who reported the incident." },
      { source: "Dr. Meena", target: "Shanthi B.", type: "Treating Physician", description: "MLC registered at Kidwai Hospital." }
    ],
    notes: [{ author: "OFFICER-953", date: "2026-07-04 11:00 AM", text: "Victim requested shelter home. BNS Section 115(2) applicable. Coordinating with Women's Commission Mysuru." }],
    summary: "Domestic violence in Mysuru — Shanthi B. sustained injuries from husband Raju B. Medico-legal case registered. Suspect in custody. Women's Commission alerted.",
    confidence: "97%",
    investigation_score: 92,
    station: "Saraswathipuram PS",
    district: "Mysuru",
    created_at: "2026-07-04T10:00:00.000Z"
  },
  {
    id: "COMP-008",
    officer: "OFFICER-612",
    status: "Active",
    incident_type: "Cyber Fraud",
    victim: "Manjunath T.",
    suspects: ["Fake Trading Platform @TradeProfitKing", "Accomplice +91-8765432109"],
    witnesses: [],
    evidence: {
      photos: [{ name: "fake_trading_app.png", type: "image/png", date: "2026-07-05", size: "430 KB", desc: "Screenshot of counterfeit broker app" }],
      videos: [],
      audio: [],
      documents: ["investment_fraud_manju.txt"]
    },
    timeline: [
      { date: "2026-07-01", event: "Discovered Telegram channel @TradeProfitKing promising 40% monthly returns", source: "Victim statement" },
      { date: "2026-07-02", event: "Invested ₹50,000 via NEFT to HDFC account 123456789012", source: "Bank records" },
      { date: "2026-07-05", event: "Invested additional ₹1,20,000 — total ₹1,70,000", source: "NEFT records" },
      { date: "2026-07-07", event: "Withdrawal blocked; app went offline; Telegram channel deleted", source: "Victim statement" }
    ],
    entities: {
      names: ["Manjunath T."],
      phones: ["+91-8765432109"],
      upi_ids: ["tradekingpro@axl"],
      bank_accounts: ["123456789012"],
      locations: ["Hubli", "Online — Telegram"],
      dates: ["2026-07-01", "2026-07-07"],
      amounts: ["₹1,70,000"],
      vehicles: [],
      urls: ["t.me/TradeProfitKing"],
      usernames: ["@TradeProfitKing"]
    },
    locations: ["Hubli"],
    money_trail: [
      { sender: "Manjunath T.", receiver: "HDFC Account 123456789012", amount: "₹50,000", upi: "N/A", bank_account: "123456789012", timestamp: "2026-07-02" },
      { sender: "Manjunath T.", receiver: "tradekingpro@axl", amount: "₹1,20,000", upi: "tradekingpro@axl", bank_account: "N/A", timestamp: "2026-07-05" }
    ],
    vehicles: [],
    relationships: [
      { source: "Manjunath T.", target: "@TradeProfitKing", type: "Victim of Fraud", description: "Deceived by fake investment returns." },
      { source: "Manjunath T.", target: "123456789012", type: "Transferred Funds", description: "₹50,000 NEFT to suspect HDFC account." }
    ],
    notes: [{ author: "OFFICER-612", date: "2026-07-08 09:00 AM", text: "HDFC account flagged to CBI Cyber Wing. Telegram handle referred to CERT-In for takedown." }],
    summary: "Investment fraud ₹1,70,000 — Hubli victim Manjunath T. deceived by fake trading Telegram channel @TradeProfitKing promising 40% returns. App disappeared with funds.",
    confidence: "96%",
    investigation_score: 75,
    station: "Hubli Cyber PS",
    district: "Dharwad",
    created_at: "2026-07-08T09:00:00.000Z"
  },
  {
    id: "COMP-009",
    officer: "OFFICER-334",
    status: "Active",
    incident_type: "Cyber Fraud",
    victim: "Dr. Padmavathi S.",
    suspects: ["KYC Phisher +91-7766554433", "SBI Impersonator"],
    witnesses: [],
    evidence: {
      photos: [{ name: "fake_sbi_sms.png", type: "image/png", date: "2026-07-10", size: "80 KB", desc: "Fake SBI KYC update SMS" }],
      videos: [],
      audio: [],
      documents: ["kyc_fraud_padmavathi.txt"]
    },
    timeline: [
      { date: "2026-07-10 03:00 PM", event: "Received SMS from spoofed SBI number requesting KYC update via phishing link", source: "Victim's mobile" },
      { date: "2026-07-10 03:10 PM", event: "Victim entered OTP and debit card details on fake site", source: "Victim statement" },
      { date: "2026-07-10 03:12 PM", event: "₹88,500 debited from SBI account 445566778899 in 3 transactions within 2 minutes", source: "SBI SMS" },
      { date: "2026-07-10 03:20 PM", event: "Victim called SBI helpline — account frozen within 10 minutes", source: "SBI records" }
    ],
    entities: {
      names: ["Dr. Padmavathi S."],
      phones: ["+91-7766554433", "+91-9988123456"],
      upi_ids: ["payfraud@paytm"],
      bank_accounts: ["445566778899"],
      locations: ["Mangaluru", "Online"],
      dates: ["2026-07-10"],
      amounts: ["₹88,500"],
      vehicles: [],
      urls: ["bit.ly/sbi-kyc-upd8"],
      usernames: []
    },
    locations: ["Mangaluru"],
    money_trail: [
      { sender: "Dr. Padmavathi S.", receiver: "payfraud@paytm", amount: "₹88,500", upi: "payfraud@paytm", bank_account: "445566778899", timestamp: "2026-07-10 03:12 PM" }
    ],
    vehicles: [],
    relationships: [
      { source: "Dr. Padmavathi S.", target: "+91-7766554433", type: "Phished By", description: "Fraudulent KYC SMS received from suspect." },
      { source: "+91-7766554433", target: "payfraud@paytm", type: "Funds Routed", description: "Stolen funds transferred to suspect Paytm wallet." }
    ],
    notes: [{ author: "OFFICER-334", date: "2026-07-11 09:30 AM", text: "Phishing URL reported to CERT-In. SBI account frozen. Paytm wallet freeze requested." }],
    summary: "KYC phishing fraud Mangaluru — ₹88,500 stolen from Dr. Padmavathi S. through fake SBI website. Funds moved via Paytm. Account frozen within 10 minutes of discovery.",
    confidence: "99%",
    investigation_score: 88,
    station: "Mangaluru Cyber PS",
    district: "Dakshina Kannada",
    created_at: "2026-07-11T09:30:00.000Z"
  },
  {
    id: "COMP-010",
    officer: "OFFICER-519",
    status: "Active",
    incident_type: "Assault",
    victim: "Mohammed Farhan",
    suspects: ["Gang Leader Syed X (absconding)", "Aadil K. (arrested)", "Zafar M. (arrested)"],
    witnesses: ["Tea Stall Vendor Raju", "Auto Driver Basavanna"],
    evidence: {
      photos: [{ name: "assault_site_photo.jpg", type: "image/jpeg", date: "2026-07-12", size: "420 KB", desc: "Scene evidence near City Market" }],
      videos: [{ name: "street_cctv_assault.mp4", type: "video/mp4", duration: "47s", desc: "Suspects attacking victim with rods" }],
      audio: [],
      documents: ["gang_assault_farhan.txt"]
    },
    timeline: [
      { date: "2026-07-12 07:33 PM", event: "3 suspects confronted Mohammed Farhan near City Market over property dispute", source: "Witness Raju" },
      { date: "2026-07-12 07:35 PM", event: "Aadil K. and Zafar M. attacked victim with rods while Syed X supervised", source: "CCTV footage" },
      { date: "2026-07-12 07:45 PM", event: "Farhan admitted to Victoria Hospital — fractured arm and head injury", source: "Hospital records" },
      { date: "2026-07-12 10:00 PM", event: "Aadil K. and Zafar M. arrested near Shivajinagar. Syed X absconding.", source: "Shivajinagar PS" }
    ],
    entities: {
      names: ["Mohammed Farhan", "Syed X", "Aadil K.", "Zafar M.", "Raju", "Basavanna"],
      phones: ["+91-9843211234", "+91-8899001122"],
      upi_ids: [],
      bank_accounts: [],
      locations: ["City Market", "Bengaluru", "Victoria Hospital", "Shivajinagar"],
      dates: ["2026-07-12"],
      amounts: [],
      vehicles: ["KA-05-GH-3322"],
      urls: [],
      usernames: []
    },
    locations: ["City Market", "Bengaluru"],
    money_trail: [],
    vehicles: ["KA-05-GH-3322"],
    relationships: [
      { source: "Syed X", target: "Aadil K.", type: "Commands", description: "Gang leader directing assault." },
      { source: "Syed X", target: "Zafar M.", type: "Commands", description: "Second suspect acting under orders." },
      { source: "Aadil K.", target: "Mohammed Farhan", type: "Assaulted", description: "Attack with rod — arrested." },
      { source: "Zafar M.", target: "Mohammed Farhan", type: "Assaulted", description: "Attack with rod — arrested." }
    ],
    notes: [{ author: "OFFICER-519", date: "2026-07-12 11:00 PM", text: "Lookout Circular issued for Syed X. Two suspects remanded to custody. BNS Section 115 applicable." }],
    summary: "Organised gang assault at Bengaluru City Market. Three suspects attacked Mohammed Farhan with rods. Two arrested; gang leader Syed X absconding. Victim hospitalised.",
    confidence: "98%",
    investigation_score: 87,
    station: "Shivajinagar PS",
    district: "Bengaluru Central",
    created_at: "2026-07-12T22:00:00.000Z"
  },
  {
    id: "COMP-011",
    officer: "OFFICER-771",
    status: "Active",
    incident_type: "Cyber Fraud",
    victim: "Suma Reddy",
    suspects: ["OLX Scammer +91-8800990011 (posing as Army Officer)"],
    witnesses: [],
    evidence: {
      photos: [{ name: "olx_fake_listing.png", type: "image/png", date: "2026-07-14", size: "195 KB", desc: "Fake OLX furniture listing" }],
      videos: [],
      audio: [],
      documents: ["olx_fraud_suma.txt"]
    },
    timeline: [
      { date: "2026-07-14 11:00 AM", event: "Suma Reddy found sofa set on OLX by seller claiming to be Army Officer in Pune", source: "OLX platform" },
      { date: "2026-07-14 11:35 AM", event: "₹4,500 advance transferred to officerdeal@gpay", source: "Google Pay transaction" },
      { date: "2026-07-14 11:40 AM", event: "Seller demanded ₹9,000 more for 'Army Movement Clearance'. Victim refused.", source: "Chat screenshot" },
      { date: "2026-07-14 12:00 PM", event: "OLX listing removed; seller blocked victim", source: "OLX platform" }
    ],
    entities: {
      names: ["Suma Reddy"],
      phones: ["+91-8800990011"],
      upi_ids: ["officerdeal@gpay"],
      bank_accounts: [],
      locations: ["Belagavi", "Online — OLX"],
      dates: ["2026-07-14"],
      amounts: ["₹4,500"],
      vehicles: [],
      urls: ["olx.in/item/fake-sofa-001"],
      usernames: []
    },
    locations: ["Belagavi"],
    money_trail: [
      { sender: "Suma Reddy", receiver: "officerdeal@gpay", amount: "₹4,500", upi: "officerdeal@gpay", bank_account: "N/A", timestamp: "2026-07-14 11:35 AM" }
    ],
    vehicles: [],
    relationships: [
      { source: "Suma Reddy", target: "+91-8800990011", type: "Defrauded By", description: "Army impersonator advance-fee fraud." },
      { source: "+91-8800990011", target: "officerdeal@gpay", type: "Received Funds", description: "Advance payment collected before vanishing." }
    ],
    notes: [{ author: "OFFICER-771", date: "2026-07-15 09:00 AM", text: "OLX seller reported to OLX India fraud team. GPay handle reported to Google Pay fraud cell. BNS Section 319 (military impersonation) applicable." }],
    summary: "OLX military impersonation fraud Belagavi — Suma Reddy defrauded ₹4,500 by scammer posing as Army Officer. Classic advance-fee fraud. UPI traced to officerdeal@gpay.",
    confidence: "97%",
    investigation_score: 79,
    station: "Belagavi Cyber PS",
    district: "Belagavi",
    created_at: "2026-07-15T09:00:00.000Z"
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
    // Re-seed if no data or if stored has fewer cases than current demo set (new cases added)
    const parsed_check = stored ? JSON.parse(stored) : null;
    if (!stored || (Array.isArray(parsed_check) && parsed_check.length < EXPANDED_DEMO_CASES.length)) {
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

    // Save active case state to local storage
    const updatedList = cases.map(c => c.id === currentCase.id ? currentCase : c);
    try {
      localStorage.setItem('crimelens_complaints', JSON.stringify(updatedList));
    } catch (e) {
      console.warn("localStorage quota exceeded", e);
    }

    // Dynamic Reasoning & warnings compilation
    const runReasoningCore = () => {
      const trace = [];
      const warnList = [];

      trace.push(`[Reasoning Core] Evaluating case metrics for ${currentCase.id}...`);

      // 1. Analyze overlaps (Similarity checks)
      const similarCases = calculateSimilarity(currentCase, cases.filter(c => c.id !== currentCase.id));
      trace.push(`[Similarity Engine] Calculated matching indices across ${Math.max(0, cases.length - 1)} reference cases.`);
      
      similarCases.forEach(match => {
        const matchId = match.complaint?.id || match.id;
        const score = match.similarity ?? match.score ?? 0;
        if (score > 40) {
          trace.push(`[Overlapping Linkage] Case ${matchId} correlates with active case at ${score}% score.`);
          warnList.push({
            id: `WARN-LINK-${matchId}`,
            severity: score > 70 ? "High" : "Medium",
            message: `Possible cross-case correlation: ${currentCase.id} sharing indicators with ${matchId} (Similarity: ${score}%)`,
            details: (match.reasons || []).join(", ")
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

      setReasoningTrace(trace);
      setWarnings(warnList);
    };

    runReasoningCore();
  }, [currentCase?.id, cases.length]);

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
      saveInvestigationToCatalyst(next);
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
    saveInvestigationToCatalyst(newCase);
    appendLog(`Created new Case ${newId} in operating system.`);
  };

  const deleteCaseFile = (caseId) => {
    const nextList = cases.filter(c => c.id !== caseId);
    setCases(nextList);
    deleteComplaint(caseId); // update low-level storage
    deleteInvestigationFromCatalyst(caseId);
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
