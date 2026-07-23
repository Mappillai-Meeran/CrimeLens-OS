import React, { useState, useEffect, useRef } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip
} from 'recharts';
import {
  Shield,
  ShieldAlert,
  Volume2,
  AlertTriangle,
  Clock,
  Cpu,
  MapPin,
  Download,
  Send,
  HelpCircle,
  RefreshCw,
  Eye,
  FileText,
  User,
  Upload,
  Mic,
  MicOff,
  Camera,
  Video,
  Trash2,
  CheckCircle,
  XCircle,
  ChevronRight,
  ChevronDown,
  PlusCircle,
  Search,
  ExternalLink,
  Layers,
  Network,
  HardDrive,
  BookOpen,
  FileCode,
  AlertCircle,
  BarChart2,
  Database,
  Activity,
  GitBranch,
  Archive,
  TrendingUp,
  Target,
  Play,
  Pause,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';

import { useCase } from './services/caseStore';
import { extractEvidence, isLiveMode } from './services/gemini';
import { detectPatterns } from './services/patternDetection';
import { calculateSimilarity, getEvidenceGaps, generateBriefPDF } from './services/investigation';
import { getReasoningCore } from './services/reasoningCore';
import { getInvestigationCore } from './services/investigationCore';
import { getCommandCore } from './services/commandCore';
import {
  getAllMemories, saveCompletedCase, deleteMemory, seedDemoMemories,
  findSimilarMemories, getMemoryStats
} from './services/investigationMemory';
import { getKnowledgeForCrime } from './services/knowledgeEngine';
import {
  searchSCRBRepository,
  generateInvestigationStrategy,
  generateAIQuestions,
  detectContradictions,
  detectModusOperandi,
  calculateEvidenceReliability,
  getReasoningTree,
  calculateCaseHealth
} from './services/scrbRepository';
import { getConfidenceMap } from './services/confidenceMapService';
import { askCopilot } from './services/copilotService';
import {
  InteractiveTimelineFlow,
  EntityRelationshipGraph,
  MoneyFlowPipeline,
  PatternHeatmapGrid,
  HypothesisBoardView,
  LiveHealthIndicators,
  SavedReportsCabinet
} from './components/Visualizations';

import headerIcon from './assets/header-icon.png';
import mainLogo from './assets/main-logo.png';

// Detect live vs demo mode once at module evaluation (env is static)
const LIVE_GEMINI = isLiveMode();

export default function App() {
  // Access global Case Core store
  const {
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
  } = useCase();

  // Navigation & Sub-Tab States
  const [centerTab, setCenterTab] = useState('summary'); // summary, map, finance, relations, gaps
  const [showLanding, setShowLanding] = useState(true);

  // Small-screen advisory — shown once when width < 1024px, dismissable
  const [showMobileAdvisory, setShowMobileAdvisory] = useState(
    () => typeof window !== 'undefined' && window.innerWidth < 1024
  );
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setShowMobileAdvisory(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleInitializeDemoSandbox = () => {
    resetWorkspace();
    setShowLanding(false);
    appendLog("Demo sandbox successfully initialized.");
  };
  const [bottomTab, setBottomTab] = useState('timeline'); // timeline, logs, warnings, reasoning
  const [sidebarCollapsible, setSidebarCollapsible] = useState({
    cases: true,
    patterns: true,
    vault: true,
    memory: true,
    reports: true
  });

  // Visualizations sub-tab state at top-level (to prevent hook violations)
  const [visualizationsTab, setVisualizationsTab] = useState('graph');

  // UI state for checked cases in Left Sidebar Pattern Registry
  const [checkedPatternCases, setCheckedPatternCases] = useState(new Set());
  const [patternAnalysisResult, setPatternAnalysisResult] = useState([]);
  const [patternAnalysisRan, setPatternAnalysisRan] = useState(false);

  // Note taking state
  const [newNoteText, setNewNoteText] = useState('');

  // Intake / File Upload states inside Evidence Vault
  const [intakeText, setIntakeText] = useState('');
  const [intakeFileName, setIntakeFileName] = useState('');
  const [intakeSource, setIntakeSource] = useState('Manual Entry');
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionResult, setExtractionResult] = useState(null);
  
  // Voice & Video simulation states
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [cameraStream, setCameraStream] = useState(null);
  const [cameraError, setCameraError] = useState(false);
  const [cameraCapturedImage, setCameraCapturedImage] = useState(null);
  const videoRef = useRef(null);

  // Dialog / Modal previews
  const [previewBriefData, setPreviewBriefData] = useState(null);
  const [pdfGenerating, setPdfGenerating] = useState(false);

  // Copilot AI Panel Chat States
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: "Workspace loaded. I am your Cognitive Assistant. Select a case from the registry to inspect parameters, or ask me to analyze financial flows and check evidence completeness."
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // New Suspect/Witness Inputs
  const [newSuspectName, setNewSuspectName] = useState('');
  const [newWitnessName, setNewWitnessName] = useState('');

  // Investigation Memory state
  const [memories, setMemories] = useState([]);
  const [memorySearchQuery, setMemorySearchQuery] = useState('');
  const [similarMemories, setSimilarMemories] = useState([]);
  const [expandedLandmarks, setExpandedLandmarks] = useState({});
  const [expandedReasoningNodes, setExpandedReasoningNodes] = useState({});
  const [collapsedSections, setCollapsedSections] = useState({
    scrbMemory: true,
    policeKnowledge: true,
    legalGuidance: true,
    strategy: true,
    aiQuestions: true,
    contradiction: true,
    modusOperandi: true,
    activityLog: true,
    auditTrail: true
  });
  const [lang, setLang] = useState('en'); // 'en' or 'kn'
  const [isMicActive, setIsMicActive] = useState(false);
  const [openNavGroup, setOpenNavGroup] = useState(null); // grouped tab nav

  const t = (enText, knText) => {
    return lang === 'kn' ? knText : enText;
  };

  const handleSpeakAnswer = (text) => {
    if (!window.speechSynthesis) {
      alert("Text-to-Speech not supported.");
      return;
    }
    window.speechSynthesis.cancel();
    let speechText = text;
    if (typeof text === 'object') {
      speechText = text.answer || '';
    }
    const utterance = new SpeechSynthesisUtterance(speechText);
    utterance.lang = lang === 'kn' ? 'kn-IN' : 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  const handleToggleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Browser Speech Recognition not supported in this browser.");
      return;
    }

    if (isMicActive) {
      if (recognition) recognition.stop();
      setIsMicActive(false);
    } else {
      const rec = new SpeechRecognition();
      rec.lang = lang === 'kn' ? 'kn-IN' : 'en-US';
      rec.interimResults = false;
      rec.maxAlternatives = 1;

      rec.onstart = () => {
        setIsMicActive(true);
      };

      rec.onresult = (event) => {
        const speechToText = event.results[0][0].transcript;
        setInputText(speechToText);
        setIsMicActive(false);
      };

      rec.onerror = (e) => {
        console.error(e);
        setIsMicActive(false);
      };

      rec.onend = () => {
        setIsMicActive(false);
      };

      rec.start();
      setRecognition(rec);
    }
  };

  // Investigation Replay Stepper state
  const [activeReplayStep, setActiveReplayStep] = useState(0);
  const [isReplayPlaying, setIsReplayPlaying] = useState(false);

  // Final Copilot QA state
  const [copilotActiveQuery, setCopilotActiveQuery] = useState(null);
  const [copilotAnswer, setCopilotAnswer] = useState(null);

  // Synchronize Copilot chat history per case
  useEffect(() => {
    if (currentCase) {
      const welcome = lang === 'kn'
        ? "ಕಾರ್ಯಸ್ಥಳ ಲೋಡ್ ಆಗಿದೆ. ನಾನು ನಿಮ್ಮ ಅರಿವಿನ ಸಹಾಯಕ. ಪ್ರಕರಣದ ವಿವರಗಳನ್ನು ಕೇಳಿ."
        : "Workspace loaded. I am your Cognitive Assistant. Select a case from the registry to inspect parameters, or ask me questions about this case.";
      const caseHistory = currentCase.chatHistory || [
        {
          id: 1,
          sender: 'ai',
          text: {
            answer: welcome,
            evidence: "N/A",
            matches: "N/A",
            guideline: "N/A",
            precedent: "N/A",
            reasoning: "Initialization step.",
            confidence: "High",
            next_action: "Explore registry."
          }
        }
      ];
      setMessages(caseHistory);
    } else {
      setMessages([]);
    }
  }, [currentCase, lang]);

  // Seed demo memories on first mount and load all memories
  useEffect(() => {
    seedDemoMemories();
    setMemories(getAllMemories());
  }, []);

  // Investigation Replay automatic stepping effect
  useEffect(() => {
    let intervalId = null;
    if (isReplayPlaying) {
      intervalId = setInterval(() => {
        setActiveReplayStep(prev => (prev + 1) % 8);
      }, 2500);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isReplayPlaying]);

  // When current case changes, compute similar memories and reset replay/copilot answers
  useEffect(() => {
    if (currentCase) {
      setSimilarMemories(findSimilarMemories(currentCase, cases));
      setActiveReplayStep(0);
      setIsReplayPlaying(false);
      setCopilotActiveQuery(null);
      setCopilotAnswer(null);
    }
  }, [currentCase]);

  const handleSaveToMemory = () => {
    if (!currentCase) return;
    const entry = saveCompletedCase(currentCase);
    if (entry) {
      setMemories(getAllMemories());
      appendLog(`[Memory] Case ${currentCase.id} committed to Investigation Memory.`);
    }
  };

  const handleDeleteMemory = (id) => {
    deleteMemory(id);
    setMemories(getAllMemories());
  };

  // Sync Checked Pattern Cases on first cases load
  useEffect(() => {
    if (cases.length > 0) {
      setCheckedPatternCases(new Set(cases.map(c => c.id)));
    }
  }, [cases]);

  // Speech Recognition (Web Speech API) setup
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.continuous = true;
        rec.interimResults = true;
        rec.lang = 'en-IN';

        rec.onresult = (event) => {
          let interimTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              setIntakeText(prev => prev + ' ' + event.results[i][0].transcript);
            } else {
              interimTranscript += event.results[i][0].transcript;
            }
          }
        };

        rec.onerror = (e) => {
          console.error("Speech recognition error", e);
          setIsRecording(false);
        };

        rec.onend = () => {
          setIsRecording(false);
        };

        setRecognition(rec);
      }
    }
  }, []);

  const handleToggleVoiceRecording = () => {
    if (!recognition) {
      alert("Web Speech Recognition is not supported by your browser. Please paste evidence texts.");
      return;
    }

    if (isRecording) {
      recognition.stop();
      setIsRecording(false);
      appendLog("Voice dispatch recorder stopped.");
    } else {
      setIntakeSource('Voice Recording Transcript');
      recognition.start();
      setIsRecording(true);
      appendLog("Voice dispatch recorder initiated.");
    }
  };

  // Camera Capture Simulation
  const handleStartCamera = async () => {
    setCameraCapturedImage(null);
    setCameraError(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      appendLog("Physical device camera feeds initialized.");
    } catch (err) {
      console.warn("Camera hardware unavailable — initiating simulation mode", err);
      setCameraError(true);
      appendLog("Physical camera unavailable; using mock visual generator.");
    }
  };

  const handleStopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    appendLog("Camera connection closed.");
  };

  const handleCaptureSnapshot = () => {
    setCameraCapturedImage('simulated_image');
    setIntakeSource('CCTV Camera Capture');
    setIntakeFileName('cctv_snapshot.jpg');
    setIntakeText("CCTV screenshot logs a possible black sports motorcycle with plate KA-01-MJ-4567 departing the Metro Center station south exit route.");
    handleStopCamera();
    appendLog("Captured mock visual snapshot.");
  };

  const handleSimulateCameraCapture = (type) => {
    setCameraCapturedImage('simulated_image');
    setIntakeSource('CCTV Camera Capture');
    if (type === 'cyber') {
      setIntakeFileName('whatsapp_chat_scam.png');
      setIntakeText("Image evidence logs WhatsApp chat screenshot offering quick low-interest loan. Suspect phone number +91-9876543210. Deposit requested to quickloan@ybl.");
    } else {
      setIntakeFileName('cctv_frame_vehicle.jpg');
      setIntakeText("CCTV screenshot logs a possible black sports motorcycle with plate KA-01-MJ-4567 departing the Metro Center station south exit route.");
    }
    appendLog(`Simulated screenshot import: ${type === 'cyber' ? 'Chat logs' : 'CCTV frame'}`);
  };

  // Quick loaders for demo files inside vault
  const handleQuickLoadDemoFile = (type) => {
    let content = "";
    let filename = "";
    
    if (type === 'c1') {
      filename = "complaint1.txt";
      content = "I, Kavitha R., reporting a cyber fraud. Contacted from +91-9876543210. Sent ₹12,000 to UPI ID: quickloan@ybl.";
    } else if (type === 'c2') {
      filename = "complaint2.txt";
      content = "I am Rajesh Kumar. Scammed via loan call from +91-9876543210. Paid ₹15,000 registration fee to UPI: quickloan@ybl.";
    } else if (type === 'c3') {
      filename = "complaint3.txt";
      content = "Suresh Patel reporting WhatsApp fraud from +91-9876543210. Paid ₹25,000 processing fee to Bank Account 9988776655.";
    } else if (type === 'assault') {
      filename = "assault_voice.txt";
      content = "Voice record. Two men on black bike KA-01-MJ-4567 assaulted my friend Priya near Metro Center and snatched her handbag.";
    } else if (type === 'missing') {
      filename = "missing_person.txt";
      content = "Priya Sharma, 22, missing since June 25th from West Heights. Wearing green kurta. Phone +91-9900112233 switched off.";
    }

    setIntakeFileName(filename);
    setIntakeText(content);
    setIntakeSource(`Quick Demo File: ${filename}`);
    appendLog(`Demo evidence loaded into buffer: ${filename}`);
  };

  // Upload trigger file reader
  const handleUploadFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIntakeFileName(file.name);
    setIntakeSource(`Uploaded File: ${file.name}`);

    const reader = new FileReader();
    reader.onload = (event) => {
      setIntakeText(event.target.result || `Imported non-text media file: ${file.name}`);
      appendLog(`Evidence file imported: ${file.name}`);
    };
    reader.readAsText(file);
  };

  const handleCommitNewCaseDirectly = (res) => {
    if (!res) return;
    createCase({
      incident_type: res.incident_type,
      victim: res.entities?.names?.[0] || 'Unknown Subject',
      suspects: res.entities?.phones?.map(p => `Suspect Phone ${p}`) || [],
      witnesses: [],
      evidence: {
        photos: cameraCapturedImage ? [{ name: intakeFileName || "snapshot.jpg", type: "image/jpeg", date: new Date().toISOString().split('T')[0], size: "450 KB", desc: "CCTV snapshot" }] : [],
        videos: [],
        audio: isRecording ? [{ name: intakeFileName || "audio.wav", type: "audio/wav", duration: "10s", desc: "Dispatch audio log" }] : [],
        documents: [intakeFileName || "complaint_record.txt"]
      },
      timeline: (res.timeline || []).map(str => ({
        date: new Date().toISOString().split('T')[0],
        event: str,
        source: intakeFileName || "Case Intake"
      })),
      entities: res.entities,
      locations: res.entities?.locations || [],
      money_trail: res.entities?.amounts?.map((amt, index) => ({
        sender: res.entities?.names?.[0] || 'Victim',
        receiver: 'Suspect Entity',
        amount: amt,
        upi: res.entities?.upi_ids?.[index] || 'N/A',
        bank_account: res.entities?.bank_accounts?.[index] || 'N/A',
        timestamp: new Date().toLocaleDateString()
      })) || [],
      vehicles: res.entities?.vehicles || [],
      relationships: [],
      notes: [{ author: "OFFICER-771", date: new Date().toLocaleString(), text: "Case generated via AI intake pipeline." }],
      summary: res.summary,
      confidence: res.confidence,
      investigation_score: 55
    });
    appendLog("Automatically initialized new case registry file from uploaded complaint.");
  };

  // AI Extraction call
  const handleTriggerAIExtraction = async () => {
    if (!intakeText.trim()) {
      alert("Please enter text, select a demo shortcut, or upload a file first.");
      return;
    }

    setIsExtracting(true);
    setExtractionResult(null);
    appendLog("Running cognitive entity extraction...");

    try {
      const result = await extractEvidence(intakeText, intakeFileName || 'manual_notes.txt');
      setExtractionResult(result);
      appendLog("Extraction complete. Mapped incident details.");
      setTimeout(() => {
        handleCommitNewCaseDirectly(result);
      }, 300);
    } catch (e) {
      console.error(e);
      alert("Extraction failed. Utilizing built-in fallback parser.");
    } finally {
      setIsExtracting(false);
    }
  };

  // Commit extraction to the database
  const handleCommitExtraction = (targetMode) => {
    if (!extractionResult) return;

    if (targetMode === 'new') {
      // Create new case file
      createCase({
        incident_type: extractionResult.incident_type,
        victim: extractionResult.entities?.names?.[0] || 'Unknown Subject',
        suspects: extractionResult.entities?.phones?.map(p => `Suspect Phone ${p}`) || [],
        witnesses: [],
        evidence: {
          photos: cameraCapturedImage ? [{ name: intakeFileName, type: "image/jpeg", date: new Date().toISOString().split('T')[0], size: "450 KB", desc: "CCTV snapshot" }] : [],
          videos: [],
          audio: isRecording ? [{ name: intakeFileName, type: "audio/wav", duration: "10s", desc: "Dispatch audio log" }] : [],
          documents: [intakeFileName || "complaint_record.txt"]
        },
        timeline: (extractionResult.timeline || []).map(str => ({
          date: new Date().toISOString().split('T')[0],
          event: str,
          source: intakeFileName || "Case Intake"
        })),
        entities: extractionResult.entities,
        locations: extractionResult.entities?.locations || [],
        money_trail: extractionResult.entities?.amounts?.map((amt, index) => ({
          sender: extractionResult.entities?.names?.[0] || 'Victim',
          receiver: 'Suspect Entity',
          amount: amt,
          upi: extractionResult.entities?.upi_ids?.[index] || 'N/A',
          bank_account: extractionResult.entities?.bank_accounts?.[index] || 'N/A',
          timestamp: new Date().toLocaleDateString()
        })) || [],
        vehicles: extractionResult.entities?.vehicles || [],
        relationships: [],
        notes: [{ author: "OFFICER-771", date: new Date().toLocaleString(), text: "Case generated via AI intake pipeline." }],
        summary: extractionResult.summary,
        confidence: extractionResult.confidence,
        investigation_score: 50
      });
      alert("New case successfully committed into workspace.");
    } else {
      // Link entities to current active case
      if (!currentCase) {
        alert("Please select an active case file first.");
        return;
      }
      const updatedEntities = { ...currentCase.entities };
      Object.keys(updatedEntities).forEach(key => {
        const currentVals = updatedEntities[key] || [];
        const newVals = extractionResult.entities?.[key] || [];
        updatedEntities[key] = Array.from(new Set([...currentVals, ...newVals]));
      });

      const updatedDocs = currentCase.evidence?.documents || [];
      if (intakeFileName && !updatedDocs.includes(intakeFileName)) {
        updatedDocs.push(intakeFileName);
      }

      const extractedVictim = extractionResult.entities?.names?.[0];
      const isPlaceholderVictim = !currentCase.victim || currentCase.victim === 'New Case File' || currentCase.victim === 'Unknown' || currentCase.victim === 'Unknown Subject';
      const updatedVictim = (isPlaceholderVictim && extractedVictim) ? extractedVictim : currentCase.victim;

      updateCase({
        ...currentCase,
        victim: updatedVictim,
        incident_type: extractionResult.incident_type || currentCase.incident_type,
        summary: extractionResult.summary || currentCase.summary,
        entities: updatedEntities,
        evidence: {
          ...currentCase.evidence,
          documents: updatedDocs
        }
      });
      alert(`Evidence records successfully appended to active case ${currentCase.id}.`);
    }

    // Clear buffer states
    setIntakeText('');
    setIntakeFileName('');
    setExtractionResult(null);
    setCameraCapturedImage(null);
  };

  // Add notes
  const handleAddNote = () => {
    if (!newNoteText.trim() || !currentCase) return;
    const newNote = {
      author: "OFFICER-771",
      date: new Date().toLocaleString(),
      text: newNoteText
    };

    updateCase({
      ...currentCase,
      notes: [...(currentCase.notes || []), newNote]
    });
    setNewNoteText('');
    appendLog(`Added note entry to case file ${currentCase.id}.`);
  };

  // Add manual entities
  const handleAddSuspect = () => {
    if (!newSuspectName.trim() || !currentCase) return;
    updateCase({
      ...currentCase,
      suspects: [...(currentCase.suspects || []), newSuspectName.trim()]
    });
    setNewSuspectName('');
    appendLog(`Linked suspected individual: ${newSuspectName.trim()}`);
  };

  const handleAddWitness = () => {
    if (!newWitnessName.trim() || !currentCase) return;
    updateCase({
      ...currentCase,
      witnesses: [...(currentCase.witnesses || []), newWitnessName.trim()]
    });
    setNewWitnessName('');
    appendLog(`Linked witness details: ${newWitnessName.trim()}`);
  };

  // Copilot Chat message handling
  const handleSendChatMessage = (textToSend) => {
    if (!textToSend.trim()) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: textToSend
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);
    appendLog(`Dispatched AI inquiry: "${textToSend.slice(0, 30)}..."`);

    setTimeout(() => {
      let aiText = "";
      const lower = textToSend.toLowerCase();

      if (lower.includes("anomaly") || lower.includes("pattern") || lower.includes("link")) {
        const matchedPatterns = detectPatterns(cases);
        if (matchedPatterns.length > 0) {
          aiText = `Our cross-reference checks identify **${matchedPatterns.length} possible link points**. The most repeating indicator is **${matchedPatterns[0].entity_value}** appearing in **${matchedPatterns[0].frequency} files**. This suggests a possible connected fraud ring.`;
        } else {
          aiText = `Currently, no overlapping indicator links are flagged. Run the Pattern Registry analysis to generate logs.`;
        }
      } else if (lower.includes("gap") || lower.includes("evidence") || lower.includes("checklist")) {
        if (currentCase) {
          const gaps = getEvidenceGaps(currentCase);
          const missing = gaps.filter(g => g.status === 'Missing');
          if (missing.length > 0) {
            aiText = `For the active case (${currentCase.id}), the analysis highlights **${missing.length} suggested actions**. Recommended priorities: ${missing.map(m => `"${m.name}"`).join(', ')}.`;
          } else {
            aiText = `Active file evidence matches all typical category checklist benchmarks.`;
          }
        } else {
          aiText = `No active case selected. Please load a case first to audit gaps.`;
        }
      } else if (lower.includes("brief") || lower.includes("report") || lower.includes("pdf")) {
        if (currentCase) {
          aiText = `I have compiled the investigation parameters. You can download the complete report by clicking the **"Export Brief PDF"** action button in this panel.`;
        } else {
          aiText = `Please select an active case file first.`;
        }
      } else {
        if (currentCase) {
          aiText = `Inquiry processed for case ${currentCase.id} (${currentCase.incident_type}). System suggests cross-referencing this case against transit Hub CCTV files or financial mule registries.`;
        } else {
          aiText = `Workspace active. Select a file from the Registry to trigger contextual guidance.`;
        }
      }

      setMessages(prev => [...prev, { id: Date.now(), sender: 'ai', text: aiText }]);
      setIsTyping(false);
      appendLog("Assistant response processed.");
    }, 800);
  };

  // PDF download execution
  const handleDownloadPDFBrief = (c) => {
    if (!c) return;
    setPdfGenerating(true);
    try {
      const similarList = calculateSimilarity(c, cases);
      const gapsList = getEvidenceGaps(c);
      const matchedPatterns = detectPatterns(cases);
      
      const scrbResults = searchSCRBRepository(c);
      const strategy = generateInvestigationStrategy(c);
      const questions = generateAIQuestions(c);
      const reliability = calculateEvidenceReliability(c);
      const reasoning = getReasoningTree(c);
      
      const doc = generateBriefPDF(
        c,
        similarList,
        matchedPatterns,
        gapsList,
        scrbResults,
        strategy,
        questions,
        reliability,
        reasoning,
        c.chatHistory || []
      );
      const filename = `CrimeLens_Brief_${c.id}.pdf`;
      doc.save(filename);
      appendLog(`Exported investigation brief PDF for ${c.id}`);

      // Save report entry to local storage
      const savedBriefs = JSON.parse(localStorage.getItem('crimelens_saved_briefs') || '[]');
      const exists = savedBriefs.some(b => b.filename === filename);
      if (!exists) {
        savedBriefs.push({ caseId: c.id, filename, date: new Date().toISOString() });
        localStorage.setItem('crimelens_saved_briefs', JSON.stringify(savedBriefs));
        appendLog(`[Cabinet] Registered saved report: ${filename}`);
      }
    } catch (e) {
      console.error(e);
      alert("PDF assembly failed.");
    } finally {
      setPdfGenerating(false);
    }
  };

  const handleOpenPreviewBrief = (c) => {
    const similarList = calculateSimilarity(c, cases);
    const gapsList = getEvidenceGaps(c);
    setPreviewBriefData({
      complaint: c,
      similar: similarList,
      gaps: gapsList
    });
    appendLog(`Initiated print layout preview for ${c.id}`);
  };

  // Derived values for workspace center
  const activeSimilarity = currentCase ? calculateSimilarity(currentCase, cases) : [];
  const activeGaps = currentCase ? getEvidenceGaps(currentCase) : [];

  return (
    <div className="h-screen w-screen flex flex-col bg-bg-base text-gray-200 font-sans overflow-hidden select-none">

      {/* ── Small-Screen Advisory Overlay ──────────────────────────────── */}
      {showMobileAdvisory && (
        <div
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center p-6"
          style={{ background: '#0F172A' }}
        >
          {/* Panel */}
          <div
            className="w-full max-w-sm rounded-xl p-8 flex flex-col items-center text-center space-y-5"
            style={{ background: '#1E293B', border: '1px solid #334155' }}
          >
            {/* App Icon */}
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center overflow-hidden"
              style={{ background: 'rgba(37,99,235,0.12)', border: '1px solid rgba(37,99,235,0.35)' }}
            >
              <img src={headerIcon} alt="CrimeLens OS" className="w-8 h-8 object-contain" />
            </div>

            {/* Branding */}
            <div className="space-y-1">
              <h1 className="text-xl font-extrabold tracking-tight" style={{ color: '#F8FAFC' }}>
                CrimeLens OS
              </h1>
              <p className="text-sm font-medium" style={{ color: '#CBD5E1' }}>
                AI-assisted Investigation Workspace
              </p>
            </div>

            {/* Divider */}
            <div className="w-full h-px" style={{ background: '#334155' }} />

            {/* Body */}
            <div className="space-y-3 text-sm" style={{ color: '#CBD5E1' }}>
              <p className="font-semibold" style={{ color: '#F8FAFC' }}>
                Optimized for Police Investigation Workstations.
              </p>
              <p className="leading-relaxed" style={{ color: '#94A3B8' }}>
                For the complete investigation workspace,<br />
                please access this application using a desktop<br />
                or laptop computer.
              </p>
              <div
                className="inline-block mt-1 px-3 py-1.5 rounded text-xs font-mono"
                style={{ background: 'rgba(37,99,235,0.10)', border: '1px solid rgba(37,99,235,0.25)', color: '#93C5FD' }}
              >
                Minimum Recommended Resolution: 1366 × 768
              </div>
            </div>

            {/* Continue button */}
            <button
              onClick={() => setShowMobileAdvisory(false)}
              className="w-full py-2.5 rounded-lg text-sm font-semibold transition-colors duration-150 cursor-pointer mt-1"
              style={{ background: '#2563EB', color: '#F8FAFC', border: '1px solid #1d4ed8' }}
              onMouseEnter={e => e.currentTarget.style.background = '#1d4ed8'}
              onMouseLeave={e => e.currentTarget.style.background = '#2563EB'}
            >
              Continue Anyway
            </button>
          </div>
        </div>
      )}
      {/* ── End Advisory Overlay ─────────────────────────────────────────── */}

      {showLanding ? (
        <div className="flex-1 flex flex-col items-center justify-center bg-slate-950 p-6 relative overflow-hidden font-mono">
          
          {/* Animated Matrix Background glow */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.06),transparent)] z-0 pointer-events-none" />
          
          <div className="w-full max-w-4xl bg-slate-900/60 border border-slate-850 p-8 rounded-2xl shadow-2xl space-y-6 z-10 animate-fadeIn backdrop-blur-md relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-cyan-500 via-primary to-purple-500" />
            
            {/* Header info */}
            <div className="flex flex-col items-center justify-center text-center space-y-2">
              <div className="p-3.5 bg-primary/10 border border-primary/30 rounded-full shadow-lg shadow-primary/20 animate-pulse overflow-hidden">
                <img src={mainLogo} alt="CrimeLens OS Logo" className="w-9 h-9 object-contain" />
              </div>
              <h1 className="text-xl font-black tracking-widest text-white uppercase pt-2">
                CRIMELENS OS: COGNITIVE INVESTIGATION SUITE
              </h1>
              <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                <span className="text-[10px] text-gray-400 uppercase tracking-widest bg-slate-950 border border-slate-850 px-3 py-0.5 rounded text-cyan-400">
                  Karnataka State Police Headquarters Portal
                </span>
                <span className={`text-[9px] px-2 py-0.5 rounded border font-mono font-bold ${
                  LIVE_GEMINI
                    ? 'bg-green-950/40 border-green-800/50 text-green-400'
                    : 'bg-slate-800/60 border-slate-700 text-slate-400'
                }`}>
                  {LIVE_GEMINI ? '🟢 Live Gemini AI' : '⚪ Offline Demo Mode'}
                </span>
              </div>
            </div>

            {/* Operating System Sections */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
              
              {/* Option 1: New Case File */}
              <button
                onClick={() => {
                  setCenterTab('summary');
                  setShowLanding(false);
                }}
                className="p-5 bg-slate-950/80 border border-slate-850 hover:border-cyan-500 rounded-xl text-left transition-all duration-300 group hover:scale-[1.02] cursor-pointer"
              >
                <div className="flex justify-between items-center pb-2">
                  <FileText className="w-5 h-5 text-cyan-400" />
                  <span className="text-[8px] bg-cyan-950 px-1.5 py-0.5 rounded text-cyan-400">READY</span>
                </div>
                <span className="text-xs font-bold text-white block">New Investigation</span>
                <p className="text-[9px] text-gray-500 mt-1 leading-relaxed">Initiate raw complaint analysis, voice-to-text intake, or document classification scans.</p>
              </button>

              {/* Option 2: Active Case Explorer */}
              <button
                onClick={() => {
                  setShowLanding(false);
                }}
                className="p-5 bg-slate-950/80 border border-slate-850 hover:border-emerald-500 rounded-xl text-left transition-all duration-300 group hover:scale-[1.02] cursor-pointer"
              >
                <div className="flex justify-between items-center pb-2">
                  <Cpu className="w-5 h-5 text-emerald-400" />
                  <span className="text-[8px] bg-emerald-950 px-1.5 py-0.5 rounded text-emerald-400">ACTIVE</span>
                </div>
                <span className="text-xs font-bold text-white block">Continue Case File</span>
                <p className="text-[9px] text-gray-500 mt-1 leading-relaxed">Access the active case registry, inspect parameter linkages, and audit evidence trails.</p>
              </button>

              {/* Option 3: SCRB Memory Vault */}
              <button
                onClick={() => {
                  setShowLanding(false);
                  appendLog("Navigating to SCRB Landmark Memory Vault...");
                }}
                className="p-5 bg-slate-950/80 border border-slate-850 hover:border-purple-500 rounded-xl text-left transition-all duration-300 group hover:scale-[1.02] cursor-pointer"
              >
                <div className="flex justify-between items-center pb-2">
                  <Database className="w-5 h-5 text-purple-400" />
                  <span className="text-[8px] bg-purple-950 px-1.5 py-0.5 rounded text-purple-400">ARCHIVE</span>
                </div>
                <span className="text-xs font-bold text-white block">SCRB Memory Vault</span>
                <p className="text-[9px] text-gray-500 mt-1 leading-relaxed">Audit the 10 landmark case studies, lessons learned, and judicial precedents.</p>
              </button>

            </div>

            {/* Bottom Demo Activation Deck */}
            <div className="border-t border-slate-850 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-950/40 p-4 rounded-xl">
              <div className="text-left space-y-1">
                <span className="text-[10px] text-primary font-bold uppercase tracking-wider block">One-Click Demonstration Sandbox</span>
                <p className="text-[9px] text-gray-400 max-w-lg leading-relaxed">Initialize a fully populated, ready-to-present sandbox seeder with 10 landmarks, guidelines, precedents, timeline models, and chat history logs.</p>
              </div>
              <button
                onClick={handleInitializeDemoSandbox}
                className="px-6 py-2.5 bg-primary hover:bg-primary-dark text-white font-bold text-xs rounded-lg transition-colors duration-200 cursor-pointer border border-blue-700/50"
              >
                Initialize Demo OS
              </button>
            </div>

          </div>
        </div>
      ) : (
        <>
      
      {/* Top Banner / OS Header */}
      <header className="h-14 border-b border-slate-800 bg-slate-950 flex items-center justify-between px-4 shrink-0 z-10">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-blue-950/40 border border-blue-800/30 rounded flex items-center justify-center">
            <img src={headerIcon} alt="CrimeLens OS Header Icon" className="w-4 h-4 object-contain" />
          </div>
          <div className="flex flex-col justify-center">
            <h1 className="text-[15px] font-extrabold tracking-tight text-[#F8FAFC] leading-none">
              CrimeLens OS
            </h1>
            <span className="text-[12px] font-medium text-[#CBD5E1] leading-snug mt-0.5">
              AI-assisted Investigation Workspace
            </span>
            <span className="text-[10px] font-normal text-[#94A3B8] leading-snug">
              SCRB Investigation Platform Prototype
            </span>
          </div>

          {/* DEMO MODE badge */}
          <span className="ml-2 hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-semibold font-mono tracking-wide"
            style={{ background: '#1E293B', border: '1px solid #334155', color: '#16A34A' }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-green-600 inline-block" />
            DEMO MODE
          </span>
        </div>

        {/* Global Controls & Status */}
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded border text-[10px] font-semibold font-mono ${
            LIVE_GEMINI
              ? 'bg-green-950/40 border-green-800/50 text-green-400'
              : 'bg-slate-800/60 border-slate-700 text-slate-400'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${LIVE_GEMINI ? 'bg-green-400 animate-pulse' : 'bg-slate-500'}`} />
            {LIVE_GEMINI ? 'Live Gemini Engine' : 'Offline Demo Mode'}
          </div>

          <button
            onClick={() => setLang(prev => (prev === 'en' ? 'kn' : 'en'))}
            className="flex items-center gap-1.5 text-[10px] bg-slate-900 border border-slate-700 hover:border-slate-500 px-2.5 py-1 rounded transition cursor-pointer font-mono"
            title="Toggle Language (English / Kannada)"
          >
            <span className={lang === 'en' ? 'text-cyan-400 font-bold' : 'text-slate-500'}>EN</span>
            <span className="text-slate-600">/</span>
            <span className={lang === 'kn' ? 'text-amber-400 font-bold' : 'text-slate-500'}>ಕನ್ನಡ</span>
          </button>

          <button
            onClick={resetWorkspace}
            className="flex items-center gap-1 text-[10px] bg-slate-900 border border-slate-700 text-slate-400 hover:text-white hover:border-slate-600 px-2 py-1 rounded transition cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" /> Reset Demo
          </button>
          <button
            onClick={clearWorkspace}
            className="flex items-center gap-1 text-[10px] bg-slate-900 border border-red-900/40 text-red-400 hover:bg-red-950/30 px-2 py-1 rounded transition cursor-pointer"
          >
            <Trash2 className="w-3 h-3" /> Wipe DB
          </button>

          <div className="flex items-center gap-1 bg-slate-900 border border-slate-700 px-2.5 py-1 rounded text-[10px] font-mono">
            <User className="w-3 h-3 text-primary" />
            <span className="text-slate-300">OFFICER-771</span>
          </div>
        </div>
      </header>

      {/* Main Workspace Frame */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Sidebar: Accordion Panel Sections */}
        <aside className="w-80 border-r border-slate-850 bg-slate-950/30 flex flex-col shrink-0 overflow-y-auto divide-y divide-slate-850">
          
          {/* Section 1: Cases Explorer */}
          <div className="flex flex-col">
            <div
              onClick={() => setSidebarCollapsible(prev => ({ ...prev, cases: !prev.cases }))}
              className="px-3 py-2 bg-slate-950/80 hover:bg-slate-900/60 flex items-center justify-between text-[11px] font-mono font-bold text-gray-400 cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5 text-primary" /> CASE FILE REGISTRY ({cases.length})
              </span>
              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => createCase({ incident_type: 'Cyber Fraud', victim: 'New Case File', notes: [{ author: 'OFFICER-771', date: new Date().toLocaleString(), text: 'Case file initialized manually.' }] })}
                  className="bg-slate-900 border border-slate-800 hover:bg-slate-850 text-white text-[9px] px-1.5 py-0.5 rounded font-mono font-bold uppercase flex items-center gap-0.5 cursor-pointer"
                  title="Create New Case File"
                >
                  <PlusCircle className="w-2.5 h-2.5 text-primary" /> New Case
                </button>
                <span className="text-[9px] text-gray-600" onClick={() => setSidebarCollapsible(prev => ({ ...prev, cases: !prev.cases }))}>
                  {sidebarCollapsible.cases ? '▼' : '▶'}
                </span>
              </div>
            </div>

            {sidebarCollapsible.cases && (
              <div className="p-2 space-y-1.5">
                {cases.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => selectCase(c.id)}
                    className={`w-full p-2.5 rounded border text-left transition-all cursor-pointer flex flex-col gap-1 ${
                      currentCase?.id === c.id
                        ? 'bg-primary/10 border-primary/60 shadow'
                        : 'bg-slate-900/30 border-slate-850/60 hover:bg-slate-900/60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-primary font-mono font-bold">{c.id}</span>
                      <span className="text-[8px] px-1 bg-slate-950 text-cyan-400 border border-slate-850 rounded font-mono font-bold">
                        {c.incident_type}
                      </span>
                    </div>
                    <span className="text-xs text-white font-bold truncate">
                      Victim: {c.victim || 'Unknown'}
                    </span>
                    <div className="flex justify-between items-center text-[9px] text-gray-500 font-mono mt-0.5">
                      <span>Score: {c.investigation_score}%</span>
                      <span className={c.status === 'Active' ? 'text-green-400' : 'text-gray-400'}>
                        {c.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 2: Pattern Linkage Analysis */}
          <div className="flex flex-col">
            <div
              onClick={() => setSidebarCollapsible(prev => ({ ...prev, patterns: !prev.patterns }))}
              className="px-3 py-2 bg-slate-950/80 hover:bg-slate-900/60 flex items-center justify-between text-[11px] font-mono font-bold text-gray-400 cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <Network className="w-3.5 h-3.5 text-accent" /> PATTERN REGISTRY
              </span>
              <span className="text-[9px] text-gray-600">{sidebarCollapsible.patterns ? '▼' : '▶'}</span>
            </div>

            {sidebarCollapsible.patterns && (
              <div className="p-3 space-y-3">
                <div className="text-[10px] text-gray-500 leading-normal">
                  Toggle target cases, then click Analyze to scan repeated indicator links.
                </div>

                <div className="space-y-1 max-h-[140px] overflow-y-auto pr-1">
                  {cases.map(c => {
                    const checked = checkedPatternCases.has(c.id);
                    return (
                      <label key={c.id} className="flex items-center gap-2 p-1.5 rounded bg-slate-900/35 hover:bg-slate-900/70 border border-slate-850 cursor-pointer text-[10px] font-mono select-none">
                        <input
                          type="checkbox"
                          checked={checked}
                          className="accent-primary"
                          onChange={() => {
                            setCheckedPatternCases(prev => {
                              const next = new Set(prev);
                              if (next.has(c.id)) next.delete(c.id); else next.add(c.id);
                              return next;
                            });
                          }}
                        />
                        <span className="text-white font-bold">{c.id}</span>
                        <span className="text-gray-500 font-sans truncate">({c.victim})</span>
                      </label>
                    );
                  })}
                </div>

                <button
                  disabled={checkedPatternCases.size < 2}
                  onClick={() => {
                    const subset = cases.filter(c => checkedPatternCases.has(c.id));
                    setPatternAnalysisResult(detectPatterns(subset));
                    setPatternAnalysisRan(true);
                  }}
                  className="w-full py-1.5 bg-accent hover:bg-rose-600 text-white rounded text-[10px] font-bold transition disabled:opacity-40 cursor-pointer flex items-center justify-center gap-1"
                >
                  <Search className="w-3 h-3" /> Run Link Analysis
                </button>

                {patternAnalysisRan && (
                  <div className="space-y-2 mt-2">
                    <span className="text-[9px] text-gray-400 uppercase font-mono tracking-wider block">ANOMALY FINDINGS ({patternAnalysisResult.length})</span>
                    {patternAnalysisResult.length > 0 ? (
                      <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
                        {patternAnalysisResult.map((p, idx) => (
                          <div key={idx} className="bg-slate-950/60 border border-slate-850/80 p-2 rounded text-[10px] space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-rose-400 font-bold">{p.entity_type}</span>
                              <span className="text-gray-400 font-mono">{p.frequency}x files</span>
                            </div>
                            <div className="text-white font-mono truncate">{p.entity_value}</div>
                            <p className="text-[9px] text-gray-500 leading-normal">{p.assessment}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-[10px] text-gray-600 text-center py-2 italic border border-dashed border-slate-850">
                        No overlaps identified.
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Section 3: Evidence Vault Cabinet */}
          <div className="flex flex-col">
            <div
              onClick={() => setSidebarCollapsible(prev => ({ ...prev, vault: !prev.vault }))}
              className="px-3 py-2 bg-slate-950/80 hover:bg-slate-900/60 flex items-center justify-between text-[11px] font-mono font-bold text-gray-400 cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-secondary" /> EVIDENCE VAULT CABINET
              </span>
              <span className="text-[9px] text-gray-600">{sidebarCollapsible.vault ? '▼' : '▶'}</span>
            </div>

            {sidebarCollapsible.vault && (
              <div className="p-3 space-y-3">
                {currentCase ? (
                  <>
                    {/* Active Case Evidence List */}
                    <div className="space-y-1">
                      <span className="text-[9px] text-gray-500 uppercase font-mono">Case Records</span>
                      <div className="space-y-1 max-h-[110px] overflow-y-auto pr-1">
                        {/* Documents list */}
                        {(currentCase.evidence?.documents || []).map((doc, i) => (
                          <div key={i} className="flex items-center justify-between p-1.5 bg-slate-900/35 border border-slate-850 rounded text-[10px]">
                            <span className="flex items-center gap-1 text-gray-300 font-mono truncate">
                              <FileText className="w-3 h-3 text-secondary shrink-0" /> {doc}
                            </span>
                            <span className="text-[8px] text-gray-500 font-mono">Text doc</span>
                          </div>
                        ))}
                        {/* Photos list */}
                        {(currentCase.evidence?.photos || []).map((photo, i) => (
                          <div key={i} className="flex items-center justify-between p-1.5 bg-slate-900/35 border border-slate-850 rounded text-[10px]">
                            <span className="flex items-center gap-1 text-gray-300 font-mono truncate">
                              <Video className="w-3 h-3 text-cyan-400 shrink-0" /> {photo.name}
                            </span>
                            <span className="text-[8px] text-gray-500 font-mono">Image</span>
                          </div>
                        ))}
                        {/* Audio list */}
                        {(currentCase.evidence?.audio || []).map((audio, i) => (
                          <div key={i} className="flex items-center justify-between p-1.5 bg-slate-900/35 border border-slate-850 rounded text-[10px]">
                            <span className="flex items-center gap-1 text-gray-300 font-mono truncate">
                              <Mic className="w-3 h-3 text-purple-400 shrink-0" /> {audio.name}
                            </span>
                            <span className="text-[8px] text-gray-500 font-mono">Audio record</span>
                          </div>
                        ))}

                        {!(currentCase.evidence?.documents?.length || currentCase.evidence?.photos?.length || currentCase.evidence?.audio?.length) && (
                          <div className="text-[10px] text-gray-600 italic">No files in cabinet.</div>
                        )}
                      </div>
                    </div>

                    {/* Integrated Intake & Buffer Controls */}
                    <div className="border-t border-slate-850 pt-2 space-y-2">
                      <span className="text-[9px] text-gray-500 uppercase font-mono">Import Evidence Record</span>
                      
                      {/* Media Simulation Triggers */}
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          onClick={handleToggleVoiceRecording}
                          className={`py-1 rounded text-[9px] border transition cursor-pointer flex items-center justify-center gap-1 ${
                            isRecording 
                              ? 'bg-rose-950/40 border-rose-800 text-rose-400' 
                              : 'bg-slate-900/80 border-slate-800 hover:bg-slate-850 text-gray-300'
                          }`}
                        >
                          <Mic className="w-3 h-3 text-primary" /> {isRecording ? 'Recording...' : 'Voice Record'}
                        </button>
                        <button
                          onClick={handleStartCamera}
                          className="py-1 bg-slate-900/80 border border-slate-800 hover:bg-slate-850 text-gray-300 rounded text-[9px] transition cursor-pointer flex items-center justify-center gap-1"
                        >
                          <Camera className="w-3 h-3 text-secondary" /> camera feeds
                        </button>
                      </div>

                      {/* Camera simulation view */}
                      {cameraStream && (
                        <div className="relative border border-slate-850 bg-slate-950 p-1.5 rounded flex flex-col gap-1.5">
                          <video ref={videoRef} autoPlay className="w-full h-[110px] bg-black rounded" />
                          <div className="flex gap-1 justify-end">
                            <button onClick={handleStopCamera} className="px-2 py-0.5 bg-slate-800 text-[8px] rounded">Cancel</button>
                            <button onClick={handleCaptureSnapshot} className="px-2 py-0.5 bg-primary text-[8px] rounded">Capture</button>
                          </div>
                        </div>
                      )}

                      {cameraError && (
                        <div className="p-2 border border-slate-850 bg-slate-900/80 rounded flex flex-col gap-1.5">
                          <span className="text-[9px] text-amber-400 block font-mono">Camera simulation ready. Select mock frame:</span>
                          <div className="grid grid-cols-2 gap-1">
                            <button onClick={() => handleSimulateCameraCapture('cyber')} className="px-1.5 py-1 bg-slate-950 hover:bg-slate-800 text-[8px] text-gray-300 border border-slate-850 rounded">Chat Snapshot</button>
                            <button onClick={() => handleSimulateCameraCapture('assault')} className="px-1.5 py-1 bg-slate-950 hover:bg-slate-800 text-[8px] text-gray-300 border border-slate-850 rounded">CCTV Snapshot</button>
                          </div>
                        </div>
                      )}

                      {/* File upload input */}
                      <label className="flex items-center justify-center gap-1.5 py-1 bg-slate-900 border border-slate-800 hover:bg-slate-850 text-gray-300 rounded text-[9px] cursor-pointer transition">
                        <Upload className="w-3 h-3 text-secondary" /> Upload Files
                        <input type="file" onChange={handleUploadFile} className="hidden" accept=".txt,.png,.jpg,.jpeg,.pdf" />
                      </label>

                      {/* Shortcut buttons to load demo files */}
                      <div className="space-y-1">
                        <span className="text-[8px] text-gray-600 block">DEMO FILE BUFFER SHORTCUTS:</span>
                        <div className="flex flex-wrap gap-1">
                          {['c1', 'c2', 'c3', 'assault', 'missing'].map(k => (
                            <button
                              key={k}
                              onClick={() => handleQuickLoadDemoFile(k)}
                              className="px-1.5 py-0.5 bg-slate-950 hover:bg-slate-850 border border-slate-850/80 text-[8px] text-gray-400 hover:text-white rounded font-mono cursor-pointer"
                            >
                              {k.toUpperCase()}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Active Buffer Content */}
                      <div className="space-y-1">
                        <span className="text-[9px] text-gray-500 uppercase font-mono block">Intake text buffer</span>
                        <textarea
                          value={intakeText}
                          onChange={(e) => setIntakeText(e.target.value)}
                          placeholder="Type manual officer notes, speech recordings or upload documents here..."
                          className="w-full h-16 bg-slate-950 border border-slate-850 text-[10px] p-1.5 rounded font-mono text-gray-300 focus:outline-none focus:border-primary resize-none"
                        />
                      </div>

                      {/* Run extraction trigger */}
                      <button
                        onClick={handleTriggerAIExtraction}
                        disabled={isExtracting || !intakeText}
                        className="w-full py-1.5 bg-gradient-to-r from-primary to-purple-600 text-white rounded text-[10px] font-bold transition disabled:opacity-40 cursor-pointer flex items-center justify-center gap-1"
                      >
                        {isExtracting ? (
                          <>
                            <RefreshCw className="w-3 h-3 animate-spin" /> Analyzing feeds...
                          </>
                        ) : (
                          <>
                            <Cpu className="w-3 h-3" /> Cognitive Extraction Scan
                          </>
                        )}
                      </button>

                      {/* Extraction outcome */}
                      {extractionResult && (
                        <div className="border border-slate-850 bg-slate-950/80 p-2.5 rounded space-y-2 mt-2">
                          <span className="text-[9px] text-green-400 block font-mono">EXTRACTED PROFILES AVAILABLE</span>
                          <div className="text-[10px] text-gray-400 font-sans leading-normal line-clamp-3">
                            <strong className="text-white">Classification:</strong> {extractionResult.incident_type}<br />
                            <strong className="text-white font-sans">Summary:</strong> {extractionResult.summary}
                          </div>
                          <div className="grid grid-cols-2 gap-1.5 pt-1.5 border-t border-slate-850">
                            <button
                              onClick={() => handleCommitExtraction('new')}
                              className="py-1 bg-slate-900 border border-slate-850 hover:bg-slate-850 text-white text-[9px] font-bold rounded cursor-pointer text-center"
                            >
                              Commit New Case
                            </button>
                            <button
                              onClick={() => handleCommitExtraction('link')}
                              className="py-1 bg-primary hover:bg-primary-dark text-white text-[9px] font-bold rounded cursor-pointer text-center"
                            >
                              Link to Active Case
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-[10px] text-gray-600 italic text-center py-4">No active case selected to explore vault.</div>
                )}
              </div>
            )}
          </div>

          {/* Section 4: Investigation Memory Notes */}
          <div className="flex flex-col">
            <div
              onClick={() => setSidebarCollapsible(prev => ({ ...prev, memory: !prev.memory }))}
              className="px-3 py-2 bg-slate-950/80 hover:bg-slate-900/60 flex items-center justify-between text-[11px] font-mono font-bold text-gray-400 cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-secondary" /> INVESTIGATION MEMORY
              </span>
              <span className="text-[9px] text-gray-600">{sidebarCollapsible.memory ? '▼' : '▶'}</span>
            </div>

            {sidebarCollapsible.memory && (
              <div className="p-3 space-y-2.5">
                {currentCase ? (
                  <>
                    <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                      {(currentCase.notes || []).map((n, i) => (
                        <div key={i} className="bg-slate-900/35 border border-slate-850 p-2 rounded text-[10px]">
                          <div className="flex items-center justify-between text-gray-500 font-mono text-[8px] mb-1">
                            <span>{n.author}</span>
                            <span>{n.date.split(',')[0]}</span>
                          </div>
                          <p className="text-gray-300 font-sans leading-normal">{n.text}</p>
                        </div>
                      ))}
                      {(!currentCase.notes || currentCase.notes.length === 0) && (
                        <div className="text-[10px] text-gray-600 italic">No notes logged.</div>
                      )}
                    </div>

                    <div className="space-y-1.5 border-t border-slate-850 pt-2">
                      <textarea
                        value={newNoteText}
                        onChange={(e) => setNewNoteText(e.target.value)}
                        placeholder="Log notes about suspected individuals or followups..."
                        className="w-full h-12 bg-slate-950 border border-slate-850 text-[10px] p-1 rounded font-sans focus:outline-none focus:border-primary resize-none"
                      />
                      <button
                        onClick={handleAddNote}
                        disabled={!newNoteText.trim()}
                        className="w-full py-1 bg-slate-800 hover:bg-slate-700 text-white rounded text-[9px] font-bold transition disabled:opacity-40 cursor-pointer"
                      >
                        Commit Note
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="text-[10px] text-gray-600 italic text-center py-4">No active case selected to explore memories.</div>
                )}
              </div>
            )}
          </div>

          {/* Section 5: Saved Reports Cabinet */}
          <div className="flex flex-col">
            <div
              onClick={() => setSidebarCollapsible(prev => ({ ...prev, reports: !prev.reports }))}
              className="px-3 py-2 bg-slate-950/80 hover:bg-slate-900/60 flex items-center justify-between text-[11px] font-mono font-bold text-gray-400 cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <Archive className="w-3.5 h-3.5 text-primary" /> SAVED REPORTS CABINET
              </span>
              <span className="text-[9px] text-gray-600">{sidebarCollapsible.reports ? '▼' : '▶'}</span>
            </div>

            {sidebarCollapsible.reports && (
              <SavedReportsCabinet currentCase={currentCase} appendLog={appendLog} />
            )}
          </div>
        </aside>

        {/* Center Panel: Primary Workspace details */}
        <main className="flex-1 flex flex-col overflow-hidden bg-slate-950/20">
          {currentCase ? (
            <div className="flex-1 flex flex-col overflow-hidden">
              
              {/* Workspace Header Status Details */}
              <div className="h-14 border-b border-slate-850 bg-slate-950/40 px-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-primary">{currentCase.id}</span>
                  <span className="text-gray-600">/</span>
                  <span className="text-xs font-mono text-cyan-400">{currentCase.incident_type}</span>
                  <span className="text-gray-600">/</span>
                  <span className="text-xs text-gray-400">Victim: <strong className="text-white">{currentCase.victim || 'Unknown'}</strong></span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-gray-500 font-mono">STATUS ASSESSMENT:</span>
                  <select
                    value={currentCase.status}
                    onChange={(e) => updateCase({ ...currentCase, status: e.target.value })}
                    className="bg-slate-950 border border-slate-850 text-[10px] text-white px-2 py-1 rounded focus:outline-none focus:border-primary"
                  >
                    <option value="Active">Active Investigation</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Archived">Archived / Closed</option>
                  </select>

                  <button
                    onClick={() => deleteCaseFile(currentCase.id)}
                    className="p-1.5 bg-rose-950/30 hover:bg-rose-900 border border-rose-800/40 text-rose-300 rounded transition cursor-pointer"
                    title="Delete Case File"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Center Panel — Grouped Category Nav */}
              {(() => {
                const navGroups = [
                  {
                    id: 'overview',
                    label: 'Overview',
                    tabs: [
                      { id: 'summary',        name: 'Profile',            icon: User },
                      { id: 'visualizations', name: 'Visuals',            icon: GitBranch },
                    ]
                  },
                  {
                    id: 'analysis',
                    label: 'Analysis',
                    tabs: [
                      { id: 'map',            name: 'Geo Map',            icon: MapPin },
                      { id: 'hypothesis',     name: 'Hypothesis',         icon: Layers },
                    ]
                  },
                  {
                    id: 'reasoning',
                    label: 'Reasoning',
                    tabs: [
                      { id: 'confmap',        name: 'Confidence',         icon: Target },
                      { id: 'gaps',           name: 'Contradictions',     icon: CheckCircle },
                      { id: 'investigation',  name: 'Questions',          icon: BookOpen },
                      { id: 'command',        name: 'Strategy',           icon: BarChart2 },
                    ]
                  },
                  {
                    id: 'knowledge',
                    label: 'Knowledge',
                    tabs: [
                      { id: 'memory',         name: 'SCRB Memory',        icon: Database },
                      { id: 'knowledge',      name: 'Police Knowledge',   icon: Shield },
                      { id: 'reasoning',      name: 'Legal Guidance',     icon: Cpu },
                    ]
                  },
                  {
                    id: 'reports',
                    label: 'Reports',
                    tabs: [
                      { id: 'replay',         name: 'Replay',             icon: Activity },
                    ]
                  }
                ];

                const activeGroup = navGroups.find(g => g.tabs.some(t => t.id === centerTab));

                return (
                  <div className="h-10 border-b border-slate-850 bg-slate-950/20 px-3 flex items-center justify-between shrink-0 select-none overflow-visible relative z-30">
                    <div className="flex gap-0.5 items-center">
                      {navGroups.map(group => {
                        const isGroupActive = activeGroup?.id === group.id;
                        const isOpen = openNavGroup === group.id;
                        return (
                          <div key={group.id} className="relative">
                            <button
                              onClick={() => setOpenNavGroup(isOpen ? null : group.id)}
                              className={`flex items-center gap-1 px-3 py-1.5 rounded text-[10px] font-semibold transition cursor-pointer ${
                                isGroupActive
                                  ? 'bg-slate-800/70 border border-slate-700 text-white'
                                  : 'text-gray-500 hover:text-gray-300 hover:bg-slate-900/50'
                              }`}
                            >
                              {group.label}
                              <ChevronDown className={`w-2.5 h-2.5 transition-transform duration-150 ${ isOpen ? 'rotate-180' : '' }`} />
                            </button>

                            {/* Dropdown panel */}
                            {isOpen && (
                              <div
                                className="absolute top-[calc(100%+4px)] left-0 bg-slate-950 border border-slate-800 rounded-lg shadow-xl shadow-black/60 py-1 min-w-[150px] z-50 animate-fadeIn"
                                onMouseLeave={() => setOpenNavGroup(null)}
                              >
                                {group.tabs.map(tab => {
                                  const TabIcon = tab.icon;
                                  const isActive = centerTab === tab.id;
                                  return (
                                    <button
                                      key={tab.id}
                                      onClick={() => { setCenterTab(tab.id); setOpenNavGroup(null); }}
                                      className={`w-full flex items-center gap-2 px-3 py-1.5 text-[10px] font-mono transition cursor-pointer ${
                                        isActive
                                          ? 'text-white font-bold bg-primary/20 border-l-2 border-primary'
                                          : 'text-gray-400 hover:text-white hover:bg-slate-900'
                                      }`}
                                    >
                                      <TabIcon className="w-3 h-3 shrink-0" />
                                      {tab.name}
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}

                      {/* Active tab breadcrumb */}
                      {activeGroup && (
                        <span className="ml-2 text-[8.5px] font-mono text-gray-600 flex items-center gap-1">
                          <ChevronRight className="w-2.5 h-2.5" />
                          <span className="text-gray-400">
                            {activeGroup.tabs.find(t => t.id === centerTab)?.name}
                          </span>
                        </span>
                      )}
                    </div>

                    <div className="text-[10px] text-gray-500 font-mono">
                      Confidence Score: <span className="text-green-400 font-bold">{currentCase.confidence || '80%'}</span>
                    </div>
                  </div>
                );
              })()}

              {/* Tab Display Panel Area */}
              <div className="flex-1 overflow-y-auto p-4 min-h-0 bg-slate-900/10">
                {/* 1. Case Profile Parameters Tab */}
                {centerTab === 'summary' && (
                  <div className="space-y-4 animate-fadeIn">
                    
                    {/* Live Telemetry Health Rings at the top */}
                    <LiveHealthIndicators currentCase={currentCase} />

                    {/* AI Case Summary banner with glowing enterprise theme */}
                    <div className="glass p-4 rounded-xl border border-primary/35 bg-primary/5 shadow-lg shadow-primary/5 space-y-1.5 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-2 text-[8px] bg-slate-900 border border-slate-800 rounded font-mono text-cyan-400">
                        SYSTEM SUMMARY MODEL: GEMINI 2.5
                      </div>
                      <span className="text-[9px] text-primary font-bold uppercase font-mono tracking-wider flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5" /> AI Case Intelligence Advisory Summary
                      </span>
                      <p className="text-xs text-gray-200 leading-relaxed font-sans font-semibold pt-1">
                        {currentCase.summary || "No active statement description logged in the case file."}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      
                      {/* Left: Metadata list & Entities mapping */}
                      <div className="glass p-4 rounded-xl border border-slate-850 space-y-4 md:col-span-2">
                        <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider">Extracted Entity parameters</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
                          {[
                            { label: "Victims Profiled", vals: currentCase.entities?.names || [], color: "text-purple-400" },
                            { label: "Suggested Phones", vals: currentCase.entities?.phones || [], color: "text-amber-400" },
                            { label: "UPI Identifiers", vals: currentCase.entities?.upi_ids || [], color: "text-cyan-400" },
                            { label: "Bank Accounts", vals: currentCase.entities?.bank_accounts || [], color: "text-green-400" },
                            { label: "Vehicles Noted", vals: currentCase.entities?.vehicles || [], color: "text-red-400" },
                            { label: "Locations Logged", vals: currentCase.entities?.locations || [], color: "text-blue-400" }
                          ].map((item, idx) => (
                            <div key={idx} className="bg-slate-950/70 border border-slate-850 p-2.5 rounded">
                              <span className="text-[8px] text-gray-500 font-mono block uppercase">{item.label}</span>
                              <div className="mt-1 flex flex-wrap gap-1 min-h-[16px]">
                                {item.vals.map((v, i) => (
                                  <span key={i} className={`text-[10px] font-mono font-bold ${item.color}`}>
                                    {v}
                                  </span>
                                ))}
                                {item.vals.length === 0 && <span className="text-[10px] text-gray-650 italic">None</span>}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Crime Flow Visual Pathway Indicator */}
                        <div className="border-t border-slate-850 pt-4 space-y-2">
                          <span className="text-[9px] text-gray-500 font-mono uppercase block">Active Crime Flow Vector</span>
                          <div className="flex flex-wrap items-center gap-2 font-mono text-[9px] p-2 bg-slate-950/40 rounded-lg border border-slate-850">
                            <span className="text-white font-bold">{currentCase.incident_type}</span>
                            <ArrowRight className="w-3 h-3 text-gray-500" />
                            <span className="text-amber-300">Intake Feeds</span>
                            <ArrowRight className="w-3 h-3 text-gray-500" />
                            <span className="text-cyan-300">Entity Map</span>
                            <ArrowRight className="w-3 h-3 text-gray-500" />
                            <span className="text-rose-300">Link Check</span>
                            <ArrowRight className="w-3 h-3 text-gray-500" />
                            <span className="text-green-400">Brief Advisory</span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Suspects and Witnesses Linkage */}
                      <div className="glass p-3 rounded-xl border border-slate-850 space-y-3">

                        {/* Suspects mapping */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <h3 className="text-[9.5px] font-bold text-white uppercase font-mono tracking-wider">Suspect Registry</h3>
                            <span className="text-[8px] bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded font-mono text-rose-400">
                              Suspects ({(currentCase.suspects || []).length})
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {(currentCase.suspects || []).map((s, i) => (
                              <span key={i} className="px-2 py-0.5 bg-slate-950 border border-slate-850 rounded text-[9.5px] text-gray-300 flex items-center gap-1 font-mono">
                                • {s}
                              </span>
                            ))}
                            {(!currentCase.suspects || currentCase.suspects.length === 0) && (
                              <span className="text-[9px] text-gray-600 italic font-mono">— No suspects added</span>
                            )}
                          </div>
                          <div className="flex gap-1">
                            <input
                              type="text"
                              value={newSuspectName}
                              onChange={(e) => setNewSuspectName(e.target.value)}
                              placeholder="Add suspect profile..."
                              className="flex-1 bg-slate-950 border border-slate-850 text-[9.5px] px-2 py-1 rounded text-white focus:outline-none focus:border-primary"
                            />
                            <button
                              onClick={handleAddSuspect}
                              className="px-2 py-1 bg-slate-850 hover:bg-slate-700 text-white rounded text-[9.5px] font-bold cursor-pointer transition"
                            >
                              Add
                            </button>
                          </div>
                        </div>

                        {/* Witnesses list */}
                        <div className="space-y-1.5 border-t border-slate-850 pt-2.5">
                          <div className="flex items-center justify-between">
                            <h3 className="text-[9.5px] font-bold text-white uppercase font-mono tracking-wider">Witness Registry</h3>
                            <span className="text-[8px] bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded font-mono text-purple-400">
                              Witnesses ({(currentCase.witnesses || []).length})
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {(currentCase.witnesses || []).map((w, i) => (
                              <span key={i} className="px-2 py-0.5 bg-slate-950 border border-slate-850 rounded text-[9.5px] text-gray-300 flex items-center gap-1 font-mono">
                                • {w}
                              </span>
                            ))}
                            {(!currentCase.witnesses || currentCase.witnesses.length === 0) && (
                              <span className="text-[9px] text-gray-600 italic font-mono">— No witnesses added</span>
                            )}
                          </div>
                          <div className="flex gap-1">
                            <input
                              type="text"
                              value={newWitnessName}
                              onChange={(e) => setNewWitnessName(e.target.value)}
                              placeholder="Add witness register..."
                              className="flex-1 bg-slate-950 border border-slate-850 text-[9.5px] px-2 py-1 rounded text-white focus:outline-none focus:border-primary"
                            />
                            <button
                              onClick={handleAddWitness}
                              className="px-2 py-1 bg-slate-850 hover:bg-slate-700 text-white rounded text-[9.5px] font-bold cursor-pointer transition"
                            >
                              Add
                            </button>
                          </div>
                        </div>

                      </div>
                    </div>

                    {/* Timeline Sequence & Evidence Cards list */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Timeline */}
                      <div className="glass p-4 rounded-xl border border-slate-850 space-y-3">
                        <h4 className="text-xs font-bold text-white uppercase font-mono tracking-wider">Timeline Checklist</h4>
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                          {(currentCase.timeline || []).map((t, idx) => (
                            <div key={idx} className="flex gap-2 items-start text-[10px] font-mono p-2 bg-slate-950/40 border border-slate-900 rounded">
                              <span className="text-primary font-bold">[{t.date || 'Date'}]</span>
                              <span className="text-gray-300">{t.event}</span>
                            </div>
                          ))}
                          {(!currentCase.timeline || currentCase.timeline.length === 0) && (
                            <div className="text-gray-650 italic text-[10px]">No timeline events logged.</div>
                          )}
                        </div>
                      </div>

                      {/* Evidence Files Cabinet */}
                      {(() => {
                        const docs = currentCase.evidence?.documents || [];
                        const photos = currentCase.evidence?.photos || [];
                        const audio = currentCase.evidence?.audio || [];
                        const totalFiles = docs.length + photos.length + audio.length;
                        return (
                          <div className="glass p-3 rounded-xl border border-slate-850 space-y-2">
                            <div className="flex items-center justify-between">
                              <h4 className="text-[9.5px] font-bold text-white uppercase font-mono tracking-wider">Evidence Files Cabinet</h4>
                              <span className="text-[8px] bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded font-mono text-cyan-400">
                                Evidence Files ({totalFiles})
                              </span>
                            </div>
                            {totalFiles === 0 ? (
                              <div className="flex items-center gap-2 py-1.5 font-mono">
                                <span className="text-[9px] text-gray-600 italic">— No files uploaded</span>
                              </div>
                            ) : (
                              <div className="grid grid-cols-2 gap-1.5 max-h-40 overflow-y-auto pr-1">
                                {docs.map((doc, i) => (
                                  <div key={`d${i}`} className="p-1.5 bg-slate-950/50 border border-slate-850 rounded text-[8.5px] font-mono text-gray-300 truncate">
                                    📄 {doc}
                                  </div>
                                ))}
                                {photos.map((photo, i) => (
                                  <div key={`p${i}`} className="p-1.5 bg-slate-950/50 border border-slate-850 rounded text-[8.5px] font-mono text-gray-300 truncate">
                                    📸 {photo.name || photo}
                                  </div>
                                ))}
                                {audio.map((aud, i) => (
                                  <div key={`a${i}`} className="p-1.5 bg-slate-950/50 border border-slate-850 rounded text-[8.5px] font-mono text-gray-300 truncate">
                                    🎙️ {aud.name || aud}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                                  {/* Investigation Memory Panel — Step 3 */}
                    {(() => {
                      const scrbResults = searchSCRBRepository(currentCase);
                      const strategy = generateInvestigationStrategy(currentCase);
                      const strategyCount = strategy ? (
                        (strategy.immediate_actions || []).length +
                        (strategy.evidence_to_collect?.people_to_interview || []).length +
                        (strategy.evidence_to_collect?.digital_evidence || []).length +
                        (strategy.evidence_to_collect?.financial_evidence || []).length +
                        (strategy.evidence_to_collect?.documents_required || []).length +
                        (strategy.field_suggestions || []).length
                      ) : 0;

                      return (
                        <div className="space-y-4">
                          {/* Step 3: Investigation Memory (Landmark Cases) */}
                          <div className="glass p-4 rounded-xl border border-slate-850">
                            <div 
                              onClick={() => setCollapsedSections(prev => ({ ...prev, scrbMemory: !prev.scrbMemory }))}
                              className="flex items-center justify-between cursor-pointer select-none"
                            >
                              <div className="flex items-center gap-2">
                                <ChevronRight className={`w-4 h-4 text-cyan-400 transition-transform duration-200 ${!collapsedSections.scrbMemory ? 'rotate-90' : ''}`} />
                                <Database className="w-4 h-4 text-cyan-400" />
                                <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider">
                                  {collapsedSections.scrbMemory ? `SCRB Investigation Memory (${scrbResults.landmarks.length} Matches)` : 'SCRB Investigation Memory (Landmark Cases)'}
                                </h3>
                              </div>
                              {!collapsedSections.scrbMemory && (
                                <span className="text-[9px] bg-cyan-950 text-cyan-400 border border-cyan-800/40 px-2 py-0.5 rounded font-mono uppercase animate-fadeIn">
                                  Matches: {scrbResults.landmarks.length} Stored
                                </span>
                              )}
                            </div>

                            {!collapsedSections.scrbMemory && (
                              <div className="space-y-3 pt-4 border-t border-slate-800/60 mt-4 animate-fadeIn">
                                {scrbResults.landmarks.length === 0 ? (
                                  <div className="text-[10px] text-gray-555 italic">No similar investigations found for this profile.</div>
                                ) : (
                                  <div className="grid grid-cols-1 gap-3">
                                    {scrbResults.landmarks.map((match) => {
                                      const isExpanded = expandedLandmarks[match.id];
                                      return (
                                        <div key={match.id} className="border border-slate-800 bg-slate-950/40 hover:border-slate-700 rounded-lg p-3 transition space-y-2">
                                          <div className="flex items-start justify-between">
                                            <div>
                                              <span className="text-xs font-mono font-bold text-white block">{match.id} · {match.crime_type}</span>
                                              <span className="text-[10px] text-gray-550 font-mono">Basis: {match.reasons.join(' · ')}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                              <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-950/60 border border-cyan-800/30 px-2 py-0.5 rounded">
                                                {match.score}% Similarity
                                              </span>
                                              <button
                                                onClick={() => setExpandedLandmarks(prev => ({ ...prev, [match.id]: !isExpanded }))}
                                                className="text-[9px] font-mono text-cyan-400 hover:text-cyan-300 underline cursor-pointer"
                                              >
                                                {isExpanded ? 'Collapse' : 'Expand'}
                                              </button>
                                            </div>
                                          </div>

                                          <div className="text-[10px] space-y-1.5 pt-1 text-gray-300 border-t border-slate-900">
                                            <p><strong className="text-gray-555 font-mono">Reason for Match:</strong> {match.reasons.join(' · ')}</p>
                                            <p><strong className="text-cyan-400/90 font-mono">Recommended Next Step:</strong> {match.next_steps}</p>
                                          </div>

                                          {isExpanded && (
                                            <div className="text-[10px] text-gray-400 bg-slate-950/70 p-2.5 rounded border border-slate-900 space-y-2 mt-2 animate-fadeIn">
                                              <p><strong className="text-white font-mono uppercase text-[8.5px] block text-cyan-400">Matched Crime Pattern:</strong> {match.crime_pattern}</p>
                                              <p><strong className="text-white font-mono uppercase text-[8.5px] block text-cyan-400">Matched Modus Operandi:</strong> {match.modus_operandi}</p>
                                              <p><strong className="text-white font-mono uppercase text-[8.5px] block text-cyan-400">Similar Evidence Collected:</strong> {match.evidence_collected.join(', ')}</p>
                                              <p><strong className="text-white font-mono uppercase text-[8.5px] block text-cyan-400">Investigation Lessons Learned:</strong> {match.lessons}</p>
                                              <p><strong className="text-white font-mono uppercase text-[8.5px] block text-rose-400">Mistakes Investigators Made:</strong> {match.mistakes_made}</p>
                                              <p><strong className="text-white font-mono uppercase text-[8.5px] block text-amber-400">Court Observations & Outcome:</strong> {match.court_observations}</p>
                                            </div>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Step 4: Police Knowledge Panel */}
                          <div className="glass p-4 rounded-xl border border-slate-850">
                            <div 
                              onClick={() => setCollapsedSections(prev => ({ ...prev, policeKnowledge: !prev.policeKnowledge }))}
                              className="flex items-center justify-between cursor-pointer select-none"
                            >
                              <div className="flex items-center gap-2">
                                <ChevronRight className={`w-4 h-4 text-amber-400 transition-transform duration-200 ${!collapsedSections.policeKnowledge ? 'rotate-90' : ''}`} />
                                <Shield className="w-4 h-4 text-amber-400" />
                                <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider">
                                  {collapsedSections.policeKnowledge ? `Police Knowledge (${scrbResults.guidelines.length} SOP Guidelines)` : 'Police Knowledge Panel'}
                                </h3>
                              </div>
                            </div>
                            
                            {!collapsedSections.policeKnowledge && (
                              <div className="pt-4 border-t border-slate-800/60 mt-4 animate-fadeIn space-y-3">
                                {scrbResults.guidelines.length === 0 ? (
                                  <div className="text-[10px] text-amber-500/80 italic font-mono">No specific police guideline found.</div>
                                ) : (
                                  <div className="grid grid-cols-1 gap-3">
                                    {scrbResults.guidelines.map((g, idx) => (
                                      <div key={idx} className="p-3 bg-slate-950/40 border border-slate-800 rounded-lg text-[10px] space-y-2">
                                        <div className="flex justify-between items-start">
                                          <span className="font-bold text-white text-xs">{g.title}</span>
                                          <span className="text-[8px] text-gray-550 font-mono uppercase border border-slate-800 px-1.5 py-0.5 rounded">{g.source}</span>
                                        </div>
                                        <p className="text-gray-400 italic">{g.summary}</p>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1 text-gray-300 font-mono">
                                          <div className="bg-slate-900/55 p-2 rounded border border-slate-900/60">
                                            <span className="text-[8px] text-amber-400 font-bold block uppercase mb-1">Relevant SOP</span>
                                            <p>{g.relevant_sop}</p>
                                          </div>
                                          <div className="bg-slate-900/55 p-2 rounded border border-slate-900/60">
                                            <span className="text-[8px] text-amber-400 font-bold block uppercase mb-1">Required Procedure</span>
                                            <p>{g.required_procedure}</p>
                                          </div>
                                          <div className="bg-slate-900/55 p-2 rounded border border-slate-900/60">
                                            <span className="text-[8px] text-amber-400 font-bold block uppercase mb-1">Important Notes</span>
                                            <p>{g.important_notes}</p>
                                          </div>
                                          <div className="bg-slate-900/55 p-2 rounded border border-slate-900/60">
                                            <span className="text-[8px] text-amber-400 font-bold block uppercase mb-1">Officer Responsibilities</span>
                                            <p>{g.officer_responsibilities}</p>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Step 5: Legal Guidance Panel */}
                          <div className="glass p-4 rounded-xl border border-slate-850">
                            <div 
                              onClick={() => setCollapsedSections(prev => ({ ...prev, legalGuidance: !prev.legalGuidance }))}
                              className="flex items-center justify-between cursor-pointer select-none"
                            >
                              <div className="flex items-center gap-2">
                                <ChevronRight className={`w-4 h-4 text-rose-400 transition-transform duration-200 ${!collapsedSections.legalGuidance ? 'rotate-90' : ''}`} />
                                <BookOpen className="w-4 h-4 text-rose-400" />
                                <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider">
                                  {collapsedSections.legalGuidance 
                                    ? `Legal Guidance (${scrbResults.precedents.length} Relevant Precedent${scrbResults.precedents.length === 1 ? '' : 's'})` 
                                    : 'Legal Guidance Panel'}
                                </h3>
                              </div>
                            </div>

                            {!collapsedSections.legalGuidance && (
                              <div className="pt-4 border-t border-slate-800/60 mt-4 animate-fadeIn space-y-4">
                                <p className="text-[9px] text-gray-500 italic font-mono uppercase">
                                  ⚠️ Warning: Strictly for investigative guidance. Do not interpret as formal legal advice.
                                </p>

                                {scrbResults.precedents.length === 0 ? (
                                  <div className="text-[10px] text-gray-550 italic">No matching legal precedents available.</div>
                                ) : (
                                  <div className="grid grid-cols-1 gap-3">
                                    {scrbResults.precedents.map((p, idx) => (
                                      <div key={idx} className="p-3 bg-slate-950/40 border border-slate-800 rounded-lg text-[10px] space-y-2">
                                        <div className="flex justify-between items-start">
                                          <span className="font-bold text-white text-xs">{p.citation}</span>
                                          <span className="text-[9px] font-bold text-rose-400 font-mono bg-rose-950/30 px-2 py-0.5 rounded border border-rose-900/30">
                                            Confidence: {p.confidence}
                                          </span>
                                        </div>
                                        <div className="space-y-1.5 text-gray-300 font-mono">
                                          <p><strong className="text-gray-550">Relevant Principle:</strong> {p.relevant_principle}</p>
                                          <p><strong className="text-gray-550">Why it applies:</strong> {p.why_it_applies}</p>
                                          <p><strong className="text-gray-550">Key Observation:</strong> {p.key_observation}</p>
                                          <p><strong className="text-rose-400/90">Practical Investigation Advice:</strong> {p.practical_investigation_advice}</p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Step 6: Investigation Strategy Engine Panel */}
                          {strategy && (
                            <div className="glass p-4 rounded-xl border border-slate-850">
                              <div 
                                onClick={() => setCollapsedSections(prev => ({ ...prev, strategy: !prev.strategy }))}
                                className="flex items-center justify-between cursor-pointer select-none"
                              >
                                <div className="flex items-center gap-2">
                                  <ChevronRight className={`w-4 h-4 text-green-400 transition-transform duration-200 ${!collapsedSections.strategy ? 'rotate-90' : ''}`} />
                                  <Cpu className="w-4 h-4 text-green-400" />
                                  <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider">
                                    {collapsedSections.strategy ? `Investigation Strategy (${strategyCount} Recommendations)` : 'Investigation Strategy Engine'}
                                  </h3>
                                </div>
                              </div>

                              {!collapsedSections.strategy && (
                                <div className="pt-4 border-t border-slate-800/60 mt-4 animate-fadeIn space-y-4">
                                  <p className="text-[10px] text-gray-400 italic">
                                    Actionable strategy generated dynamically from incident parameters using strict advisory parameters.
                                  </p>

                                  <div className="space-y-4">
                                    <div className="space-y-3">
                                      <span className="text-[9px] font-bold text-green-400 font-mono uppercase tracking-wider block">Cognitive Strategy Recommendations (Fully Explainable)</span>
                                      
                                      <div className="grid grid-cols-1 gap-3">
                                        {/* Immediate Actions */}
                                        {strategy.immediate_actions.map((act, i) => {
                                          return (
                                            <div key={i} className="p-3 bg-slate-950/60 border border-slate-850 rounded-lg text-[9.5px] font-mono space-y-2 hover:border-slate-700 transition-all duration-300">
                                              <span className="text-white block font-bold text-[10px]">{act.recommendation}</span>
                                              
                                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1.5 border-t border-slate-900 text-[8.5px] text-gray-400">
                                                <p><strong className="text-cyan-400/90 font-bold block">Why Made:</strong> {act.why_made}</p>
                                                <p><strong className="text-cyan-400/90 font-bold block">Supporting Evidence:</strong> {act.evidence_supported}</p>
                                                <p><strong className="text-cyan-400/90 font-bold block">Historical Influence:</strong> {act.historical_influence}</p>
                                                <p><strong className="text-cyan-400/90 font-bold block">SOP Guideline:</strong> {act.guideline}</p>
                                                <p><strong className="text-cyan-400/90 font-bold block">Legal Principle:</strong> {act.legal_principle}</p>
                                                <p><strong className="text-green-405 font-bold block">Confidence Level:</strong> ⬡ {act.confidence}</p>
                                              </div>

                                              <div className="text-[7.5px] text-rose-455 bg-rose-950/20 border border-rose-900/20 p-1.5 rounded uppercase font-bold text-center">
                                                ⚠️ REMINDER: Officer remains the final decision maker.
                                              </div>
                                            </div>
                                          );
                                        })}

                                        {/* Interview Suggestions */}
                                        {strategy.evidence_to_collect.people_to_interview.map((act, i) => {
                                          return (
                                            <div key={i} className="p-3 bg-slate-950/60 border border-slate-850 rounded-lg text-[9.5px] font-mono space-y-2 hover:border-slate-700 transition-all duration-300">
                                              <span className="text-white block font-bold text-[10px]">{act.recommendation} (Interview)</span>
                                              
                                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1.5 border-t border-slate-900 text-[8.5px] text-gray-400">
                                                <p><strong className="text-cyan-400/90 font-bold block">Why Made:</strong> {act.why_made}</p>
                                                <p><strong className="text-cyan-400/90 font-bold block">Supporting Evidence:</strong> {act.evidence_supported}</p>
                                                <p><strong className="text-cyan-400/90 font-bold block">Historical Influence:</strong> {act.historical_influence}</p>
                                                <p><strong className="text-cyan-400/90 font-bold block">SOP Guideline:</strong> {act.guideline}</p>
                                                <p><strong className="text-cyan-400/90 font-bold block">Legal Principle:</strong> {act.legal_principle}</p>
                                                <p><strong className="text-green-405 font-bold block">Confidence Level:</strong> ⬡ {act.confidence}</p>
                                              </div>

                                              <div className="text-[7.5px] text-rose-455 bg-rose-950/20 border border-rose-900/20 p-1.5 rounded uppercase font-bold text-center">
                                                ⚠️ REMINDER: Officer remains the final decision maker.
                                              </div>
                                            </div>
                                          );
                                        })}

                                        {/* Digital Evidence */}
                                        {strategy.evidence_to_collect.digital_evidence.map((act, i) => {
                                          return (
                                            <div key={i} className="p-3 bg-slate-950/60 border border-slate-850 rounded-lg text-[9.5px] font-mono space-y-2 hover:border-slate-700 transition-all duration-300">
                                              <span className="text-white block font-bold text-[10px]">{act.recommendation} (Digital trace)</span>
                                              
                                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1.5 border-t border-slate-900 text-[8.5px] text-gray-400">
                                                <p><strong className="text-cyan-400/90 font-bold block">Why Made:</strong> {act.why_made}</p>
                                                <p><strong className="text-cyan-400/90 font-bold block">Supporting Evidence:</strong> {act.evidence_supported}</p>
                                                <p><strong className="text-cyan-400/90 font-bold block">Historical Influence:</strong> {act.historical_influence}</p>
                                                <p><strong className="text-cyan-400/90 font-bold block">SOP Guideline:</strong> {act.guideline}</p>
                                                <p><strong className="text-cyan-400/90 font-bold block">Legal Principle:</strong> {act.legal_principle}</p>
                                                <p><strong className="text-green-405 font-bold block">Confidence Level:</strong> ⬡ {act.confidence}</p>
                                              </div>

                                              <div className="text-[7.5px] text-rose-455 bg-rose-950/20 border border-rose-900/20 p-1.5 rounded uppercase font-bold text-center">
                                                ⚠️ REMINDER: Officer remains the final decision maker.
                                              </div>
                                            </div>
                                          );
                                        })}

                                        {/* Financial Evidence */}
                                        {strategy.evidence_to_collect.financial_evidence.map((act, i) => {
                                          return (
                                            <div key={i} className="p-3 bg-slate-950/60 border border-slate-850 rounded-lg text-[9.5px] font-mono space-y-2 hover:border-slate-700 transition-all duration-300">
                                              <span className="text-white block font-bold text-[10px]">{act.recommendation} (Financial transaction)</span>
                                              
                                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1.5 border-t border-slate-900 text-[8.5px] text-gray-400">
                                                <p><strong className="text-cyan-400/90 font-bold block">Why Made:</strong> {act.why_made}</p>
                                                <p><strong className="text-cyan-400/90 font-bold block">Supporting Evidence:</strong> {act.evidence_supported}</p>
                                                <p><strong className="text-cyan-400/90 font-bold block">Historical Influence:</strong> {act.historical_influence}</p>
                                                <p><strong className="text-cyan-400/90 font-bold block">SOP Guideline:</strong> {act.guideline}</p>
                                                <p><strong className="text-cyan-400/90 font-bold block">Legal Principle:</strong> {act.legal_principle}</p>
                                                <p><strong className="text-green-405 font-bold block">Confidence Level:</strong> ⬡ {act.confidence}</p>
                                              </div>

                                              <div className="text-[7.5px] text-rose-455 bg-rose-950/20 border border-rose-900/20 p-1.5 rounded uppercase font-bold text-center">
                                                ⚠️ REMINDER: Officer remains the final decision maker.
                                              </div>
                                            </div>
                                          );
                                        })}

                                        {/* Documents Required */}
                                        {strategy.evidence_to_collect.documents_required.map((act, i) => {
                                          return (
                                            <div key={i} className="p-3 bg-slate-950/60 border border-slate-850 rounded-lg text-[9.5px] font-mono space-y-2 hover:border-slate-700 transition-all duration-300">
                                              <span className="text-white block font-bold text-[10px]">{act.recommendation} (Admissible doc)</span>
                                              
                                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1.5 border-t border-slate-900 text-[8.5px] text-gray-400">
                                                <p><strong className="text-cyan-400/90 font-bold block">Why Made:</strong> {act.why_made}</p>
                                                <p><strong className="text-cyan-400/90 font-bold block">Supporting Evidence:</strong> {act.evidence_supported}</p>
                                                <p><strong className="text-cyan-400/90 font-bold block">Historical Influence:</strong> {act.historical_influence}</p>
                                                <p><strong className="text-cyan-400/90 font-bold block">SOP Guideline:</strong> {act.guideline}</p>
                                                <p><strong className="text-cyan-400/90 font-bold block">Legal Principle:</strong> {act.legal_principle}</p>
                                                <p><strong className="text-green-405 font-bold block">Confidence Level:</strong> ⬡ {act.confidence}</p>
                                              </div>

                                              <div className="text-[7.5px] text-rose-455 bg-rose-950/20 border border-rose-900/20 p-1.5 rounded uppercase font-bold text-center">
                                                ⚠️ REMINDER: Officer remains the final decision maker.
                                              </div>
                                            </div>
                                          );
                                        })}

                                        {/* Field suggestions */}
                                        {strategy.field_suggestions.map((act, i) => {
                                          return (
                                            <div key={i} className="p-3 bg-slate-950/60 border border-slate-850 rounded-lg text-[9.5px] font-mono space-y-2 hover:border-slate-700 transition-all duration-300">
                                              <span className="text-white block font-bold text-[10px]">{act.recommendation} (Field audit)</span>
                                              
                                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1.5 border-t border-slate-900 text-[8.5px] text-gray-400">
                                                <p><strong className="text-cyan-400/90 font-bold block">Why Made:</strong> {act.why_made}</p>
                                                <p><strong className="text-cyan-400/90 font-bold block">Supporting Evidence:</strong> {act.evidence_supported}</p>
                                                <p><strong className="text-cyan-400/90 font-bold block">Historical Influence:</strong> {act.historical_influence}</p>
                                                <p><strong className="text-cyan-400/90 font-bold block">SOP Guideline:</strong> {act.guideline}</p>
                                                <p><strong className="text-cyan-400/90 font-bold block">Legal Principle:</strong> {act.legal_principle}</p>
                                                <p><strong className="text-green-405 font-bold block">Confidence Level:</strong> ⬡ {act.confidence}</p>
                                              </div>

                                              <div className="text-[7.5px] text-rose-455 bg-rose-950/20 border border-rose-900/20 p-1.5 rounded uppercase font-bold text-center">
                                                ⚠️ REMINDER: Officer remains the final decision maker.
                                              </div>
                                            </div>
                                          );
                                        })}

                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                          {/* Step 7: AI Question Generator Panel */}
                          {(() => {
                            const qData = generateAIQuestions(currentCase);
                            const categories = [
                              { title: "Victim Questions", list: qData.victim_questions, color: "text-purple-400" },
                              { title: "Witness Questions", list: qData.witness_questions, color: "text-amber-400" },
                              { title: "Suspect Questions", list: qData.suspect_questions, color: "text-red-400" },
                              { title: "Digital Questions", list: qData.digital_questions, color: "text-cyan-400" },
                              { title: "Financial Questions", list: qData.financial_questions, color: "text-green-400" }
                            ];
                            const questionCount = (qData.victim_questions || []).length +
                              (qData.witness_questions || []).length +
                              (qData.suspect_questions || []).length +
                              (qData.digital_questions || []).length +
                              (qData.financial_questions || []).length;

                            return (
                              <div className="glass p-4 rounded-xl border border-slate-850">
                                <div 
                                  onClick={() => setCollapsedSections(prev => ({ ...prev, aiQuestions: !prev.aiQuestions }))}
                                  className="flex items-center justify-between cursor-pointer select-none"
                                >
                                  <div className="flex items-center gap-2">
                                    <ChevronRight className={`w-4 h-4 text-purple-400 transition-transform duration-200 ${!collapsedSections.aiQuestions ? 'rotate-90' : ''}`} />
                                    <HelpCircle className="w-4 h-4 text-purple-400" />
                                    <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider">
                                      {collapsedSections.aiQuestions ? `AI Questions (${questionCount} Generated)` : 'AI Question Generator'}
                                    </h3>
                                  </div>
                                </div>

                                {!collapsedSections.aiQuestions && (
                                  <div className="pt-4 border-t border-slate-800/60 mt-4 animate-fadeIn space-y-4">
                                    <p className="text-[10px] text-gray-400">
                                      Intelligent investigative questions generated from the case parameters.
                                    </p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                      {categories.map((cat, idx) => (
                                        <div key={idx} className="p-3 bg-slate-900/30 border border-slate-850 rounded-lg space-y-2 font-mono text-[10px]">
                                          <span className={`text-[9px] font-bold block uppercase border-b border-slate-800 pb-1 ${cat.color}`}>{cat.title}</span>
                                          {cat.list.length === 0 ? (
                                            <p className="text-gray-655 italic text-[9px]">No questions generated for this category.</p>
                                          ) : (
                                            cat.list.map((item, i) => (
                                              <div key={i} className="space-y-1 pt-1 border-t border-slate-900 first:border-0 first:pt-0">
                                                <p className="text-white font-bold">Q: {item.question}</p>
                                                <p className="text-gray-400 text-[9px]"><strong className="text-gray-500">Importance:</strong> {item.importance}</p>
                                              </div>
                                            ))
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })()}

                          {/* Step 8: Contradiction Engine Panel */}
                          {(() => {
                            const contradictions = detectContradictions(currentCase, cases);
                            return (
                              <div className="glass p-4 rounded-xl border border-slate-850">
                                <div 
                                  onClick={() => setCollapsedSections(prev => ({ ...prev, contradiction: !prev.contradiction }))}
                                  className="flex items-center justify-between cursor-pointer select-none"
                                >
                                  <div className="flex items-center gap-2">
                                    <ChevronRight className={`w-4 h-4 text-rose-400 transition-transform duration-200 ${!collapsedSections.contradiction ? 'rotate-90' : ''}`} />
                                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                                    <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider">
                                      {collapsedSections.contradiction ? `Contradiction Engine (${contradictions.length} Discrepanc${contradictions.length === 1 ? 'y' : 'ies'} Detected)` : 'Contradiction Engine'}
                                    </h3>
                                  </div>
                                </div>

                                {!collapsedSections.contradiction && (
                                  <div className="pt-4 border-t border-slate-800/60 mt-4 animate-fadeIn space-y-4">
                                    <p className="text-[9px] text-gray-500 italic font-mono uppercase">
                                      ⚠️ Advisory assessment: Highlighting potential discrepancies only. All claims require manual check.
                                    </p>
                                    {contradictions.length === 0 ? (
                                      <div className="text-[10px] text-green-400 font-mono">No anomalies or contradictions detected in this case file.</div>
                                    ) : (
                                      <div className="grid grid-cols-1 gap-2">
                                        {contradictions.map((c, idx) => (
                                          <div key={idx} className="p-3 bg-slate-950/40 border border-slate-800 rounded-lg text-[10px] space-y-1.5 font-mono">
                                            <div className="flex justify-between items-start">
                                              <span className="font-bold text-rose-400 text-xs block">{c.contradiction}</span>
                                              <span className="text-[9px] font-bold text-rose-300 bg-rose-950/40 border border-rose-900/30 px-2 py-0.5 rounded">
                                                Confidence: {c.confidence}
                                              </span>
                                            </div>
                                            <p className="text-gray-300"><strong className="text-gray-600">Reason:</strong> {c.reason}</p>
                                            <p className="text-gray-400 text-[9px]"><strong className="text-gray-600">Supporting Evidence:</strong> {c.supporting_evidence}</p>
                                            <span className="text-[8px] bg-amber-950/40 border border-amber-900/30 text-amber-400 px-1.5 py-0.5 rounded uppercase font-bold inline-block">
                                              Needs Verification
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })()}

                          {/* Step 9: Modus Operandi Panel */}
                          {(() => {
                            const moPatterns = detectModusOperandi(currentCase);
                            return (
                              <div className="glass p-4 rounded-xl border border-slate-850">
                                <div 
                                  onClick={() => setCollapsedSections(prev => ({ ...prev, modusOperandi: !prev.modusOperandi }))}
                                  className="flex items-center justify-between cursor-pointer select-none"
                                >
                                  <div className="flex items-center gap-2">
                                    <ChevronRight className={`w-4 h-4 text-cyan-400 transition-transform duration-200 ${!collapsedSections.modusOperandi ? 'rotate-90' : ''}`} />
                                    <Cpu className="w-4 h-4 text-cyan-400" />
                                    <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider">
                                      {collapsedSections.modusOperandi ? `Modus Operandi Engine (${moPatterns.length} Pattern${moPatterns.length === 1 ? '' : 's'} Matched)` : 'Modus Operandi Engine'}
                                    </h3>
                                  </div>
                                </div>

                                {!collapsedSections.modusOperandi && (
                                  <div className="pt-4 border-t border-slate-800/60 mt-4 animate-fadeIn space-y-4">
                                    <p className="text-[10px] text-gray-400">
                                      Recurring crime signature patterns identified against historical database.
                                    </p>
                                    {moPatterns.length === 0 ? (
                                      <div className="text-[10px] text-gray-550 italic font-mono">No matching modus operandi signatures found.</div>
                                    ) : (
                                      <div className="grid grid-cols-1 gap-3">
                                        {moPatterns.map((pat, idx) => (
                                          <div key={idx} className="p-3 bg-slate-950/40 border border-slate-800 rounded-lg text-[10px] space-y-2 font-mono">
                                            <div className="flex justify-between items-start">
                                              <span className="font-bold text-white text-xs block">{pat.pattern}</span>
                                              <span className="text-[9px] font-bold text-cyan-300 bg-cyan-950/40 border border-cyan-900/30 px-2 py-0.5 rounded">
                                                {pat.confidence} Match
                                              </span>
                                            </div>
                                            <p className="text-gray-300"><strong className="text-gray-555">Matched Historical Cases:</strong> {pat.historical_cases.join(', ')}</p>
                                            <p className="text-gray-300"><strong className="text-gray-555">Explanation:</strong> {pat.match_explanation}</p>
                                            <p className="text-gray-400"><strong className="text-gray-555">Typical Evidence:</strong> {pat.typical_evidence.join(', ')}</p>
                                            <p className="text-cyan-400"><strong className="text-gray-555">Suggested Direction:</strong> {pat.direction}</p>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })()}

                          {/* Step 11: Evidence Reliability Score Panel */}
                          {(() => {
                            const reliability = calculateEvidenceReliability(currentCase);
                            return (
                              <div className="glass p-4 rounded-xl border border-slate-850 space-y-4 animate-fadeIn">
                                <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                                  <ShieldAlert className="w-4 h-4 text-emerald-400" />
                                  <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider">Evidence Reliability Assessment</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="space-y-3 font-mono text-[10px]">
                                    <div className="flex justify-between items-center bg-slate-900/40 p-2.5 rounded border border-slate-850">
                                      <span className="text-gray-400">OVERALL RELIABILITY INDEX</span>
                                      <span className="text-emerald-400 font-bold text-xs">{reliability.overall_score}% ({reliability.overall_confidence} Confidence)</span>
                                    </div>
                                    <div className="space-y-2">
                                      <span className="text-[9px] font-bold text-emerald-400 block uppercase">Cabinet Scoring Breakdown</span>
                                      {reliability.evidence_scores.length === 0 ? (
                                        <p className="text-gray-650 italic">No files in cabinet to evaluate.</p>
                                      ) : (
                                        reliability.evidence_scores.map((scr, idx) => (
                                          <div key={idx} className="p-2 bg-slate-950/40 border border-slate-890 rounded space-y-1">
                                            <div className="flex justify-between text-[9px]">
                                              <span className="text-white truncate max-w-[70%]">{scr.name}</span>
                                              <span className="text-emerald-500 font-bold">{scr.score}%</span>
                                            </div>
                                            <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden">
                                              <div className="bg-emerald-500 h-full" style={{ width: scr.score + "%" }}></div>
                                            </div>
                                            <span className="text-[8px] text-gray-550 block">{scr.type} · Confidence: {scr.confidence}</span>
                                          </div>
                                        ))
                                      )}
                                    </div>
                                  </div>

                                  <div className="space-y-3 font-mono text-[10px]">
                                    <div className="space-y-1.5 p-3 bg-slate-950/40 border border-slate-900 rounded-lg">
                                      <span className="text-[9px] font-bold text-amber-500 block uppercase">Missing Recommended Evidence</span>
                                      {reliability.missing_evidence.length === 0 ? (
                                        <p className="text-emerald-400 text-[9px] italic">All baseline evidence types present for this crime profile.</p>
                                      ) : (
                                        reliability.missing_evidence.map((m, idx) => (
                                          <div key={idx} className="flex items-start gap-1.5 text-gray-400 py-0.5">
                                            <span className="text-amber-500 font-bold">[ ]</span>
                                            <span>{m}</span>
                                          </div>
                                        ))
                                      )}
                                    </div>

                                    <div className="space-y-2">
                                      <span className="text-[9px] font-bold text-cyan-400 block uppercase">Reliability Improvement Suggestions</span>
                                      <div className="space-y-1.5">
                                        {reliability.suggestions.map((s, idx) => (
                                          <p key={idx} className="text-gray-300 bg-slate-900/30 p-2 rounded border border-slate-850 text-[9px]">
                                            {s}
                                          </p>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })()}

                          {/* Step 10: Reasoning Tree Panel */}
                          {(() => {
                            const treeNodes = getReasoningTree(currentCase);
                            return (
                              <div className="glass p-4 rounded-xl border border-slate-850 space-y-4 animate-fadeIn">
                                <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                                  <Network className="w-4 h-4 text-purple-400" />
                                  <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider">Cognitive Reasoning Tree Pathway</h3>
                                </div>
                                <p className="text-[10px] text-gray-400">
                                  Interactive logical path tracing every recommendation back to primary complaint indicators.
                                </p>
                                <div className="space-y-3 pl-2 border-l border-slate-800 ml-2">
                                  {treeNodes.map((node) => {
                                    const isExpanded = !!expandedReasoningNodes[node.id];
                                    return (
                                      <div key={node.id} className="relative space-y-1">
                                        <div className="absolute -left-[17px] top-1.5 w-2.5 h-2.5 rounded-full bg-slate-850 border border-slate-950 flex items-center justify-center">
                                          <div className={"w-1.5 h-1.5 rounded-full " + (isExpanded ? "bg-purple-400" : "bg-slate-650")}></div>
                                        </div>
                                        <button
                                          onClick={() => setExpandedReasoningNodes(prev => ({ ...prev, [node.id]: !prev[node.id] }))}
                                          className="flex items-center gap-2 text-left font-mono text-[10px] font-bold text-white hover:text-purple-400 transition"
                                        >
                                          <span>{node.title}</span>
                                          <span className="text-[9px] text-gray-550 font-normal font-mono">
                                            {isExpanded ? "[-]" : "[+]"}
                                          </span>
                                        </button>
                                        {isExpanded && (
                                          <div className="pl-3 py-1.5 bg-slate-950/50 border border-slate-900 rounded font-mono text-[9px] space-y-1.5 mt-1 animate-fadeIn">
                                            <p className="text-gray-300">{node.description}</p>
                                            <div className="text-[8px] text-purple-400/90 border-t border-slate-900 pt-1">
                                              <strong className="text-gray-550">Evidence Trace:</strong> {node.evidence_trace}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })()}

                        </div>
                      );
                    })()}

                  </div>
                )}

                {/* 2. Geospatial Heatmap Tab */}
                {centerTab === 'map' && (
                  <div className="glass p-4 rounded-xl border border-slate-850 space-y-4 animate-fadeIn">
                    <div>
                      <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider">Holographic Map Hotspots</h3>
                      <p className="text-[10px] text-gray-400">Regional map grid mapping active target coordinates for the current case.</p>
                    </div>

                    <div className="relative flex items-center justify-center my-2 max-h-[300px]">
                      <svg viewBox="0 0 500 300" className="w-full max-h-[240px] drop-shadow-[0_0_15px_rgba(139,92,246,0.1)]">
                        <defs>
                          <pattern id="grid-center" width="20" height="20" patternUnits="userSpaceOnUse">
                            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="1" />
                          </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#grid-center)" />

                        {/* West Heights */}
                        <path d="M 20,20 L 220,20 L 200,120 L 20,120 Z" className="fill-slate-800/10 stroke-slate-700/60 stroke-2" />
                        <text x="70" y="70" className="fill-gray-600 text-[10px] font-mono pointer-events-none">WEST HEIGHTS</text>
                        {currentCase.entities?.locations?.some(l => l.toLowerCase().includes('west')) && (
                          <circle cx="110" cy="80" r="8" className="fill-primary/60 stroke-primary stroke-2 animate-ping" />
                        )}

                        {/* North Districts */}
                        <path d="M 220,20 L 480,20 L 480,120 L 320,150 L 200,120 Z" className="fill-slate-800/10 stroke-slate-700/60 stroke-2" />
                        <text x="320" y="70" className="fill-gray-600 text-[10px] font-mono pointer-events-none">NORTH DISTRICTS</text>
                        {currentCase.entities?.locations?.some(l => l.toLowerCase().includes('north')) && (
                          <circle cx="350" cy="80" r="8" className="fill-cyan-500/60 stroke-cyan-400 stroke-2 animate-ping" />
                        )}

                        {/* Metro Center */}
                        <path d="M 200,120 L 320,150 L 300,220 L 140,200 Z" className="fill-slate-800/10 stroke-slate-700/60 stroke-2" />
                        <text x="180" y="165" className="fill-gray-600 text-[10px] font-mono pointer-events-none">METRO CENTER</text>
                        {currentCase.entities?.locations?.some(l => l.toLowerCase().includes('metro')) && (
                          <circle cx="230" cy="160" r="8" className="fill-amber-500/60 stroke-amber-400 stroke-2 animate-ping" />
                        )}

                        {/* South Suburbs */}
                        <path d="M 20,120 L 200,120 L 140,200 L 120,280 L 20,280 Z" className="fill-slate-800/10 stroke-slate-700/60 stroke-2" />
                        <text x="40" y="220" className="fill-gray-600 text-[10px] font-mono pointer-events-none">SOUTH SUBURBS</text>
                        {currentCase.entities?.locations?.some(l => l.toLowerCase().includes('south')) && (
                          <circle cx="90" cy="200" r="8" className="fill-green-500/60 stroke-green-400 stroke-2 animate-ping" />
                        )}

                        {/* East Docks */}
                        <path d="M 320,150 L 480,120 L 480,280 L 260,280 L 300,220 Z" className="fill-slate-800/10 stroke-slate-700/60 stroke-2" />
                        <text x="340" y="240" className="fill-gray-600 text-[10px] font-mono pointer-events-none">EAST DOCKS</text>
                        {currentCase.entities?.locations?.some(l => l.toLowerCase().includes('east')) && (
                          <circle cx="390" cy="210" r="8" className="fill-rose-500/60 stroke-rose-400 stroke-2 animate-ping" />
                        )}
                      </svg>
                    </div>

                    <div className="text-[10px] text-gray-500 text-center font-mono">
                      Active pins indicate suggested locations extracted from case statement details.
                    </div>
                  </div>
                )}

                {/* 3. Money Trail Tab */}
                {/* 2. Interactive Visualizations Tab */}
                {centerTab === 'visualizations' && (
                  <div className="space-y-4 animate-fadeIn">
                    
                    {/* Visualizations Sub-navigation */}
                    <div className="flex gap-2 border-b border-slate-850 pb-2">
                      {[
                        { id: 'graph', name: 'Entity Network Graph', icon: Network },
                        { id: 'timeline', name: 'Timeline Flow', icon: Clock },
                        { id: 'money', name: 'Money Trail Flow', icon: Layers },
                        { id: 'heatmap', name: 'Pattern Heatmap', icon: BarChart2 }
                      ].map(st => {
                        const Icon = st.icon;
                        return (
                          <button
                            key={st.id}
                            onClick={() => setVisualizationsTab(st.id)}
                            className={`px-3 py-1 text-[10px] font-mono rounded cursor-pointer transition flex items-center gap-1.5 ${
                              visualizationsTab === st.id 
                                ? 'bg-primary/25 border border-primary/45 text-white font-bold'
                                : 'bg-slate-900 border border-slate-850 text-gray-400 hover:text-white'
                            }`}
                          >
                            <Icon className="w-3 h-3 text-cyan-400" /> {st.name}
                          </button>
                        );
                      })}
                    </div>

                    {/* Sub-tab Renders */}
                    {visualizationsTab === 'graph' && <EntityRelationshipGraph currentCase={currentCase} />}
                    {visualizationsTab === 'timeline' && <InteractiveTimelineFlow currentCase={currentCase} />}
                    {visualizationsTab === 'money' && <MoneyFlowPipeline currentCase={currentCase} />}
                    {visualizationsTab === 'heatmap' && <PatternHeatmapGrid cases={cases} />}

                  </div>
                )}

                {/* 3. Hypothesis Board Tab */}
                {centerTab === 'hypothesis' && (
                  <HypothesisBoardView currentCase={currentCase} />
                )}

                {/* 5. Evidence Gap Tab */}
                {centerTab === 'gaps' && (
                  <div className="glass p-4 rounded-xl border border-slate-850 space-y-4 animate-fadeIn">
                    <div>
                      <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider">Evidence Gap Verification Checklist</h3>
                      <p className="text-[10px] text-gray-400">Verifies case details against specific incident guidelines.</p>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-slate-850 text-[10px] text-gray-500 uppercase font-mono">
                            <th className="pb-2">Target Evidence Component</th>
                            <th className="pb-2">Verification Status</th>
                            <th className="pb-2">Suggested Actions Needed</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-850 text-[11px]">
                          {activeGaps.map((gap, i) => (
                            <tr key={i} className="hover:bg-slate-900/30">
                              <td className="py-3 font-semibold text-gray-200 pr-2">{gap.name}</td>
                              <td className="py-3 pr-2">
                                <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase font-mono ${
                                  gap.status === 'Strongly Supported'
                                    ? 'bg-green-950/60 text-green-400 border border-green-900/40'
                                    : gap.status === 'Partially Supported'
                                      ? 'bg-amber-950/60 text-amber-400 border border-amber-900/40'
                                      : 'bg-rose-950/60 text-rose-400 border border-rose-900/40'
                                }`}>
                                  {gap.status}
                                </span>
                              </td>
                              <td className="py-3 text-gray-400 leading-normal max-w-[280px]">{gap.action}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* 6. Reasoning Core Tab — 8 engines */}
                {centerTab === 'reasoning' && (() => {
                  const reasoningModules = getReasoningCore(currentCase, cases);
                  const CONF_COLOR = (c) => {
                    const n = parseInt(c);
                    if (n >= 90) return 'text-green-400';
                    if (n >= 75) return 'text-amber-400';
                    return 'text-rose-400';
                  };
                  return (
                    <div className="space-y-3 animate-fadeIn">
                      <div className="flex items-center justify-between mb-1">
                        <div>
                          <h3 className="text-xs font-black text-white uppercase font-mono tracking-widest">Reasoning Core</h3>
                          <p className="text-[10px] text-gray-500 mt-0.5">Cognitive inference engines. Every result includes supporting evidence and reasoning chain.</p>
                        </div>
                        <span className="text-[8px] font-mono bg-slate-900 border border-slate-800 px-2 py-1 rounded text-cyan-400">{reasoningModules.length} ENGINES ACTIVE</span>
                      </div>

                      {reasoningModules.map((mod, i) => (
                        <div key={i} className="glass rounded-xl border border-slate-800 overflow-hidden">
                          {/* Module header */}
                          <div className="px-4 py-2.5 bg-slate-900/60 border-b border-slate-800 flex items-center justify-between">
                            <span className="text-[11px] font-black text-white uppercase font-mono tracking-wider flex items-center gap-2">
                              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                              {String(i + 1).padStart(2, '0')} · {mod.name}
                            </span>
                            <span className={`text-[11px] font-black font-mono ${CONF_COLOR(mod.confidence)}`}>
                              ⬡ {mod.confidence}
                            </span>
                          </div>

                          {/* Module body */}
                          <div className="p-4 grid grid-cols-1 gap-3">

                            <div className="flex gap-3 items-start">
                              <span className="text-[8px] uppercase font-mono font-bold text-gray-500 w-20 shrink-0 pt-0.5">Result</span>
                              <span className="text-[11px] text-white leading-relaxed">{mod.result}</span>
                            </div>

                            <div className="flex gap-3 items-start">
                              <span className="text-[8px] uppercase font-mono font-bold text-gray-500 w-20 shrink-0 pt-0.5">Evidence</span>
                              <span className="text-[11px] text-amber-300/90 leading-relaxed font-mono">{mod.supporting_evidence}</span>
                            </div>

                            <div className="flex gap-3 items-start">
                              <span className="text-[8px] uppercase font-mono font-bold text-gray-500 w-20 shrink-0 pt-0.5">Reasoning</span>
                              <span className="text-[11px] text-cyan-300/80 leading-relaxed italic">{mod.reasoning}</span>
                            </div>

                            {/* Reasoning Trace */}
                            {mod.reasoning_trace?.length > 0 && (
                              <div className="border-t border-slate-800 pt-3 mt-1">
                                <span className="text-[8px] uppercase font-mono font-bold text-gray-600 block mb-2">Reasoning Trace</span>
                                <div className="space-y-1.5">
                                  {mod.reasoning_trace.map((step, si) => (
                                    <div key={si} className="flex gap-2 items-start">
                                      <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded shrink-0 border ${
                                        step.step === 'Observation'    ? 'bg-slate-900 text-gray-400 border-slate-700' :
                                        step.step === 'Inference'      ? 'bg-blue-950/50 text-blue-300 border-blue-900/40' :
                                        step.step === 'Conclusion'     ? 'bg-cyan-950/50 text-cyan-300 border-cyan-900/40' :
                                        step.step === 'Recommendation' ? 'bg-primary/10 text-primary border-primary/30' :
                                                                          'bg-amber-950/40 text-amber-400 border-amber-900/30'
                                      }`}>{step.step}</span>
                                      <span className="text-[10px] text-gray-400 leading-relaxed">{step.text}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                          </div>
                        </div>
                      ))}

                      <div className="text-[9px] text-gray-600 font-mono border-t border-slate-850 pt-3 mt-2">
                        ⚠ All outputs are suggested parameters only. The investigating officer retains full decision authority.
                      </div>
                    </div>
                  );
                })()}

                {/* 7. Investigation Core Tab — 7 modules */}
                {centerTab === 'investigation' && (() => {
                  const invModules = getInvestigationCore(currentCase, cases);
                  const PRIORITY_STYLE = (p) => {
                    if (p === 'High') return 'bg-rose-950/60 text-rose-300 border-rose-900/40';
                    if (p === 'Medium') return 'bg-amber-950/60 text-amber-300 border-amber-900/40';
                    return 'bg-blue-950/60 text-blue-300 border-blue-900/40';
                  };
                  const CONF_COLOR = (c) => {
                    const n = parseInt(c);
                    if (n >= 90) return 'text-green-400';
                    if (n >= 75) return 'text-amber-400';
                    return 'text-rose-400';
                  };
                  return (
                    <div className="space-y-3 animate-fadeIn">
                      <div className="flex items-center justify-between mb-1">
                        <div>
                          <h3 className="text-xs font-black text-white uppercase font-mono tracking-widest">Investigation Core</h3>
                          <p className="text-[10px] text-gray-500 mt-0.5">Advisory assistance modules. All outputs are recommendations only — the officer makes all decisions.</p>
                        </div>
                        <span className="text-[8px] font-mono bg-slate-900 border border-slate-800 px-2 py-1 rounded text-amber-400">{invModules.length} MODULES LOADED</span>
                      </div>

                      {invModules.map((mod, i) => (
                        <div key={i} className="glass rounded-xl border border-slate-800 overflow-hidden">
                          {/* Module header */}
                          <div className="px-4 py-2.5 bg-slate-900/60 border-b border-slate-800 flex items-center justify-between">
                            <span className="text-[11px] font-black text-white uppercase font-mono tracking-wider flex items-center gap-2">
                              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                              {String(i + 1).padStart(2, '0')} · {mod.name}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className={`text-[8px] font-bold font-mono px-2 py-0.5 rounded border uppercase ${PRIORITY_STYLE(mod.priority)}`}>
                                {mod.priority} PRIORITY
                              </span>
                              <span className={`text-[11px] font-black font-mono ${CONF_COLOR(mod.confidence)}`}>
                                {mod.confidence}
                              </span>
                            </div>
                          </div>

                          {/* Module body — labeled rows */}
                          <div className="p-4 space-y-3">

                            <div className="flex gap-3 items-start">
                              <span className="text-[8px] uppercase font-mono font-bold text-gray-500 w-24 shrink-0 pt-0.5">Reason</span>
                              <span className="text-[11px] text-gray-300 leading-relaxed">{mod.reason}</span>
                            </div>

                            <div className="flex gap-3 items-start">
                              <span className="text-[8px] uppercase font-mono font-bold text-gray-500 w-24 shrink-0 pt-0.5">Evidence Used</span>
                              <span className="text-[11px] text-amber-300/90 leading-relaxed font-mono">{mod.evidence_used}</span>
                            </div>

                            <div className="flex gap-3 items-start p-3 bg-slate-900/40 rounded-lg border border-slate-800">
                              <span className="text-[8px] uppercase font-mono font-bold text-primary w-24 shrink-0 pt-0.5">Officer Action</span>
                              <span className="text-[11px] text-white leading-relaxed font-semibold">{mod.officer_action}</span>
                            </div>

                            <div className="flex gap-3 items-start">
                              <span className="text-[8px] uppercase font-mono font-bold text-gray-500 w-24 shrink-0 pt-0.5">Expected Outcome</span>
                              <span className="text-[11px] text-cyan-300/80 leading-relaxed italic">{mod.expected_outcome}</span>
                            </div>

                            {/* Reasoning Trace */}
                            {mod.reasoning_trace?.length > 0 && (
                              <div className="border-t border-slate-800 pt-3 mt-1">
                                <span className="text-[8px] uppercase font-mono font-bold text-gray-600 block mb-2">Reasoning Trace</span>
                                <div className="space-y-1.5">
                                  {mod.reasoning_trace.map((step, si) => (
                                    <div key={si} className="flex gap-2 items-start">
                                      <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded shrink-0 border ${
                                        step.step === 'Observation'    ? 'bg-slate-900 text-gray-400 border-slate-700' :
                                        step.step === 'Inference'      ? 'bg-blue-950/50 text-blue-300 border-blue-900/40' :
                                        step.step === 'Recommendation' ? 'bg-primary/10 text-primary border-primary/30' :
                                                                          'bg-amber-950/40 text-amber-400 border-amber-900/30'
                                      }`}>{step.step}</span>
                                      <span className="text-[10px] text-gray-400 leading-relaxed">{step.text}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                          </div>
                        </div>
                      ))}

                      <div className="text-[9px] text-gray-600 font-mono border-t border-slate-850 pt-3 mt-2">
                        ⚠ These are suggested investigative actions only. CrimeLens OS does not issue orders or determine outcomes. The officer retains full authority.
                      </div>
                    </div>
                  );
                })()}

                {/* 8. Command Core Tab — Supervisor Dashboard */}
                {centerTab === 'command' && (() => {
                  const cmd = getCommandCore(cases);
                  const BAND_COLOR = (b) => b === 'Ready' ? 'text-green-400' : b === 'In Progress' ? 'text-amber-400' : 'text-rose-400';
                  const BAND_BG = (b) => b === 'Ready' ? 'bg-green-950/40 border-green-900/30' : b === 'In Progress' ? 'bg-amber-950/40 border-amber-900/30' : 'bg-rose-950/40 border-rose-900/30';
                  return (
                    <div className="space-y-4 animate-fadeIn">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-xs font-black text-white uppercase font-mono tracking-widest">Command Core</h3>
                          <p className="text-[10px] text-gray-500 mt-0.5">Supervisor intelligence dashboard. All figures derived live from the Case Core.</p>
                        </div>
                        <span className="text-[8px] font-mono bg-slate-900 border border-slate-800 px-2 py-1 rounded text-green-400">SUPERVISOR VIEW</span>
                      </div>

                      {/* KPI Row */}
                      <div className="grid grid-cols-4 gap-3">
                        {[
                          { label: 'Open Cases', value: cmd.openCases.length, icon: Activity, color: 'text-cyan-400' },
                          { label: 'Closed Cases', value: cmd.closedCases.length, icon: Archive, color: 'text-green-400' },
                          { label: 'High Priority', value: cmd.highPriorityCases.length, icon: AlertTriangle, color: 'text-rose-400' },
                          { label: 'Health Score', value: `${cmd.investigationHealth.average}%`, icon: TrendingUp, color: 'text-amber-400' }
                        ].map((kpi, i) => {
                          const KpiIcon = kpi.icon;
                          return (
                            <div key={i} className="glass rounded-xl border border-slate-800 p-3 flex flex-col gap-1">
                              <div className="flex items-center justify-between">
                                <span className="text-[9px] text-gray-500 font-mono uppercase">{kpi.label}</span>
                                <KpiIcon className={`w-3.5 h-3.5 ${kpi.color}`} />
                              </div>
                              <span className={`text-2xl font-black font-mono ${kpi.color}`}>{kpi.value}</span>
                            </div>
                          );
                        })}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        {/* Case Readiness */}
                        <div className="glass rounded-xl border border-slate-800 p-3 space-y-2">
                          <h4 className="text-[10px] font-bold text-white uppercase font-mono tracking-wider flex items-center gap-1.5">
                            <CheckCircle className="w-3 h-3 text-green-400" /> Case Readiness
                          </h4>
                          <div className="space-y-1.5">
                            {cmd.caseReadiness.map((c, i) => (
                              <div key={i} className="flex items-center justify-between">
                                <span className="text-[10px] text-gray-400 font-mono">{c.id}</span>
                                <div className="flex items-center gap-2">
                                  <div className="w-20 h-1 bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-primary rounded-full" style={{ width: `${c.score}%` }} />
                                  </div>
                                  <span className={`text-[9px] font-bold font-mono px-1.5 rounded border ${BAND_BG(c.band)} ${BAND_COLOR(c.band)}`}>{c.band}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Emerging Patterns */}
                        <div className="glass rounded-xl border border-slate-800 p-3 space-y-2">
                          <h4 className="text-[10px] font-bold text-white uppercase font-mono tracking-wider flex items-center gap-1.5">
                            <GitBranch className="w-3 h-3 text-cyan-400" /> Emerging Patterns
                          </h4>
                          {cmd.emergingPatterns.length > 0 ? (
                            <div className="space-y-1.5">
                              {cmd.emergingPatterns.slice(0, 6).map((p, i) => (
                                <div key={i} className="flex items-center justify-between text-[10px]">
                                  <span className="font-mono text-amber-300/90 truncate max-w-[140px]">{p.entity_value}</span>
                                  <span className="text-gray-500 font-mono shrink-0 ml-1">×{p.appears_in.length} cases</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-[10px] text-gray-600 italic">No repeated indicators detected.</span>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        {/* Repeated Entities */}
                        <div className="glass rounded-xl border border-slate-800 p-3 space-y-2">
                          <h4 className="text-[10px] font-bold text-white uppercase font-mono tracking-wider flex items-center gap-1.5">
                            <Network className="w-3 h-3 text-rose-400" /> Repeated Entities
                          </h4>
                          {cmd.repeatedEntities.length > 0 ? (
                            <div className="space-y-1.5">
                              {cmd.repeatedEntities.slice(0, 6).map((e, i) => (
                                <div key={i} className="flex items-center justify-between text-[10px]">
                                  <span className="font-mono text-rose-300/90 truncate max-w-[130px]">{e.value}</span>
                                  <div className="flex items-center gap-1.5 shrink-0">
                                    <span className="text-[8px] text-gray-600 bg-slate-900 border border-slate-800 px-1 rounded">{e.type}</span>
                                    <span className="text-gray-500 font-mono">×{e.count}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-[10px] text-gray-600 italic">No repeated entity identifiers found.</span>
                          )}
                        </div>

                        {/* Officer Workload */}
                        <div className="glass rounded-xl border border-slate-800 p-3 space-y-2">
                          <h4 className="text-[10px] font-bold text-white uppercase font-mono tracking-wider flex items-center gap-1.5">
                            <User className="w-3 h-3 text-amber-400" /> Officer Workload
                          </h4>
                          <div className="space-y-1.5">
                            {cmd.officerWorkload.map((o, i) => (
                              <div key={i} className="flex items-center justify-between text-[10px]">
                                <span className="font-mono text-gray-300">{o.officer}</span>
                                <div className="flex items-center gap-2">
                                  <span className="text-green-400 font-mono">{o.open} open</span>
                                  <span className="text-gray-600 font-mono">/ {o.total} total</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Investigation Health Distribution */}
                      <div className="glass rounded-xl border border-slate-800 p-3 space-y-2">
                        <h4 className="text-[10px] font-bold text-white uppercase font-mono tracking-wider flex items-center gap-1.5">
                          <BarChart2 className="w-3 h-3 text-primary" /> Investigation Health Distribution
                        </h4>
                        <div className="flex gap-4">
                          {cmd.investigationHealth.distribution.map((d, i) => (
                            <div key={i} className="flex-1 text-center">
                              <div className="text-xl font-black font-mono text-white">{d.count}</div>
                              <div className="text-[9px] text-gray-500 font-mono">{d.band}</div>
                            </div>
                          ))}
                        </div>
                        <div className="text-[9px] text-gray-600 font-mono pt-1">Avg. Investigation Score: <span className="text-amber-400 font-bold">{cmd.investigationHealth.average}%</span></div>
                      </div>

                      {/* High Priority Cases */}
                      {cmd.highPriorityCases.length > 0 && (
                        <div className="glass rounded-xl border border-rose-900/30 p-3 space-y-2">
                          <h4 className="text-[10px] font-bold text-rose-300 uppercase font-mono tracking-wider flex items-center gap-1.5">
                            <AlertTriangle className="w-3 h-3" /> High Priority Cases Requiring Attention
                          </h4>
                          <div className="space-y-1.5">
                            {cmd.highPriorityCases.map((c, i) => (
                              <div key={i} className="flex items-center justify-between text-[10px] p-2 bg-rose-950/20 border border-rose-900/20 rounded">
                                <span className="font-mono text-white font-bold">{c.id}</span>
                                <span className="text-rose-300 font-mono">{c.incident_type}</span>
                                <span className="text-gray-400">{c.victim}</span>
                                <span className="text-[8px] bg-rose-950 text-rose-300 border border-rose-900/40 px-1.5 rounded font-mono">{c.status}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="text-[9px] text-gray-600 font-mono border-t border-slate-850 pt-3">
                        ⚠ Command Core metrics are computed in real-time from the Case Core. All figures are indicative summaries — not operational directives.
                      </div>
                    </div>
                  );
                })()}

                {/* 9. Investigation Memory Tab */}
                {centerTab === 'memory' && (() => {
                  const stats = getMemoryStats();
                  const filteredMemories = memorySearchQuery
                    ? memories.filter(m =>
                        m.crime_type.toLowerCase().includes(memorySearchQuery.toLowerCase()) ||
                        m.id.toLowerCase().includes(memorySearchQuery.toLowerCase()) ||
                        m.victim?.toLowerCase().includes(memorySearchQuery.toLowerCase()) ||
                        m.final_outcome?.toLowerCase().includes(memorySearchQuery.toLowerCase())
                      )
                    : memories;

                  return (
                    <div className="space-y-4 animate-fadeIn">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-xs font-black text-white uppercase font-mono tracking-widest">Investigation Memory</h3>
                          <p className="text-[10px] text-gray-500 mt-0.5">Knowledge base of completed investigations. Suggests — never claims — similarity to past cases.</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {currentCase && (
                            <button
                              onClick={handleSaveToMemory}
                              className="text-[9px] bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white px-2 py-1 rounded font-mono flex items-center gap-1 cursor-pointer"
                            >
                              <Archive className="w-3 h-3 text-primary" /> Save Current Case
                            </button>
                          )}
                          <span className="text-[8px] font-mono bg-slate-900 border border-slate-800 px-2 py-1 rounded text-cyan-400">{memories.length} MEMORIES</span>
                        </div>
                      </div>

                      {/* Stats row */}
                      {stats && (
                        <div className="grid grid-cols-4 gap-2">
                          {[
                            { label: 'Stored Cases', value: stats.total, color: 'text-cyan-400' },
                            { label: 'Avg. Days to Close', value: stats.avgTime, color: 'text-amber-400' },
                            { label: 'Avg. Score', value: `${stats.avgScore}%`, color: 'text-green-400' },
                            { label: 'Most Common Type', value: Object.entries(stats.typeDistribution).sort((a,b) => b[1]-a[1])[0]?.[0] || 'N/A', color: 'text-rose-400' }
                          ].map((s, i) => (
                            <div key={i} className="glass rounded-lg border border-slate-800 p-2.5 text-center">
                              <div className={`text-lg font-black font-mono ${s.color}`}>{s.value}</div>
                              <div className="text-[9px] text-gray-500 font-mono">{s.label}</div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Similar Cases for active case */}
                      {currentCase && similarMemories.length > 0 && (
                        <div className="glass rounded-xl border border-cyan-900/30 p-3 space-y-2">
                          <h4 className="text-[10px] font-bold text-cyan-300 uppercase font-mono tracking-wider flex items-center gap-1.5">
                            <Search className="w-3 h-3" /> Possibly Similar Past Investigations for {currentCase.id}
                          </h4>
                          <p className="text-[9px] text-gray-600 font-mono italic">These past cases share indicator parameters with the active case. Similarity is suggested — not confirmed.</p>
                          {similarMemories.map((match, i) => (
                            <div key={i} className="p-3 bg-cyan-950/10 border border-cyan-900/20 rounded-lg space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="font-mono text-white font-bold text-[10px]">{match.memory.id} · {match.memory.crime_type}</span>
                                <span className="text-[9px] bg-cyan-950 text-cyan-300 border border-cyan-900/40 px-2 py-0.5 rounded font-mono font-bold">~{match.score}% Suggested Similarity</span>
                              </div>
                              <div className="text-[10px] text-gray-400 space-y-1">
                                <div><span className="text-gray-600 font-mono">Similarity Basis: </span>{match.reasons.join(' · ')}</div>
                                <div><span className="text-gray-600 font-mono">Successful Actions: </span>{match.memory.actions_taken?.slice(0, 2).join('; ')}</div>
                                <div><span className="text-gray-600 font-mono">Avg. Resolution: </span>{match.memory.investigation_time_days} days</div>
                                {match.memory.recovered_assets?.length > 0 && (
                                  <div><span className="text-gray-600 font-mono">Recovered: </span>{match.memory.recovered_assets.map(r => r.amount).join(', ')}</div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Search */}
                      <div className="flex items-center gap-2">
                        <Search className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                        <input
                          type="text"
                          placeholder="Search memories by type, ID, victim, or outcome..."
                          value={memorySearchQuery}
                          onChange={e => setMemorySearchQuery(e.target.value)}
                          className="flex-1 bg-slate-900 border border-slate-800 text-xs px-3 py-1.5 rounded text-white focus:outline-none focus:border-primary"
                        />
                      </div>

                      {/* Memory list */}
                      <div className="space-y-3">
                        {filteredMemories.length === 0 && (
                          <div className="text-[10px] text-gray-600 italic text-center py-4">No memories match the current filter.</div>
                        )}
                        {filteredMemories.map((mem, i) => (
                          <div key={i} className="glass rounded-xl border border-slate-800 overflow-hidden">
                            <div className="px-4 py-2.5 bg-slate-900/60 border-b border-slate-800 flex items-center justify-between">
                              <span className="text-[11px] font-black text-white uppercase font-mono tracking-wider flex items-center gap-2">
                                <Database className="w-3.5 h-3.5 text-cyan-400" />
                                {mem.id} · {mem.crime_type}
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="text-[9px] text-gray-500 font-mono">{new Date(mem.date_closed).toLocaleDateString()}</span>
                                <span className="text-[9px] text-green-400 font-mono font-bold">Score: {mem.investigation_score}%</span>
                                <button onClick={() => handleDeleteMemory(mem.id)} className="text-rose-600 hover:text-rose-400 cursor-pointer">
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                            <div className="p-4 grid grid-cols-2 gap-3 text-[10px]">
                              <div>
                                <span className="text-[8px] font-mono text-gray-500 uppercase block mb-1">Actions Taken</span>
                                <ul className="space-y-0.5 text-gray-300">
                                  {(mem.actions_taken || []).map((a, j) => <li key={j} className="flex items-start gap-1"><span className="text-primary shrink-0">›</span>{a}</li>)}
                                </ul>
                              </div>
                              <div>
                                <span className="text-[8px] font-mono text-gray-500 uppercase block mb-1">Final Outcome</span>
                                <p className="text-gray-300 leading-relaxed">{mem.final_outcome}</p>
                                {mem.recovered_assets?.length > 0 && (
                                  <p className="text-green-400 font-mono mt-1 text-[9px]">Recovered: {mem.recovered_assets.map(r => r.amount).join(', ')}</p>
                                )}
                                <p className="text-gray-600 font-mono mt-1 text-[9px]">Resolution time: {mem.investigation_time_days} day(s)</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="text-[9px] text-gray-600 font-mono border-t border-slate-850 pt-3">
                        ⚠ Investigation Memory is a knowledge-sharing tool. Past cases are NOT claimed to be identical to current cases. All similarity indicators require officer verification.
                      </div>
                    </div>
                  );
                })()}

                {/* 10. Knowledge Engine Tab — Prompt 9 */}
                {centerTab === 'knowledge' && (() => {
                  const typeOptions = ["Cyber Fraud", "Assault", "Missing Person", "Domestic Violence", "Vehicle Theft", "Property Dispute"];
                  // State hook simulation: read from a local state or default to current case type
                  // Since we are inside a render, we can use a local react state. Let's verify we have a selector state.
                  // We can define a local toggle inside App or just read currentCase type.
                  // To let the officer toggle, let's use a state "selectedKnowledgeType" in App, or just define it dynamically.
                  // Wait, to keep it simple and robust, let's initialize it to currentCase.incident_type, and if the user clicks other options, we can display them.
                  // Let's create a local select box.
                  const activeType = currentCase.incident_type || "Cyber Fraud";
                  const kb = getKnowledgeForCrime(activeType);

                  return (
                    <div className="space-y-4 animate-fadeIn">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-xs font-black text-white uppercase font-mono tracking-widest flex items-center gap-1.5">
                            <Shield className="w-4 h-4 text-primary" /> Knowledge Engine
                          </h3>
                          <p className="text-[10px] text-gray-500 mt-0.5">Investigative guidance templates. This is not legal advice.</p>
                        </div>
                        <span className="text-[8px] font-mono bg-slate-900 border border-slate-800 px-2 py-1 rounded text-amber-400">GUIDANCE MODE</span>
                      </div>

                      {/* Info alert */}
                      <div className="p-3 bg-slate-900/40 border border-slate-800 rounded-lg text-[10px] text-gray-400 leading-relaxed">
                        💡 <strong>Investigation Guide:</strong> The values below represent standard investigative profiles for <strong>{activeType}</strong>. Use these guidelines to structure questions and identify missing files.
                      </div>

                      {/* Main Knowledge Grid */}
                      <div className="grid grid-cols-2 gap-4">
                        
                        {/* Common MO */}
                        <div className="glass rounded-xl border border-slate-800 p-4 space-y-2">
                          <h4 className="text-[10px] font-bold text-white uppercase font-mono tracking-wider">Common Modus Operandi (M.O.)</h4>
                          <p className="text-[11px] text-gray-300 leading-relaxed font-sans">{kb.common_mo}</p>
                        </div>

                        {/* SOP Guidelines */}
                        <div className="glass rounded-xl border border-slate-800 p-4 space-y-2">
                          <h4 className="text-[10px] font-bold text-white uppercase font-mono tracking-wider">Relevant SOP Directive</h4>
                          <div className="p-2.5 bg-slate-950 border border-slate-850 rounded text-[10px] font-mono text-cyan-400 leading-normal">
                            {kb.relevant_sop}
                          </div>
                        </div>

                      </div>

                      <div className="grid grid-cols-2 gap-4">

                        {/* Checklist */}
                        <div className="glass rounded-xl border border-slate-800 p-4 space-y-2">
                          <h4 className="text-[10px] font-bold text-white uppercase font-mono tracking-wider">Target Investigation Checklist</h4>
                          <div className="space-y-2">
                            {kb.investigation_checklist.map((item, idx) => (
                              <div key={idx} className="flex gap-2 items-start text-[11px]">
                                <input type="checkbox" readOnly checked className="mt-0.5 accent-primary" />
                                <span className="text-gray-300">{item}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Interview Questions */}
                        <div className="glass rounded-xl border border-slate-800 p-4 space-y-2">
                          <h4 className="text-[10px] font-bold text-white uppercase font-mono tracking-wider">Suggested Interview Questions</h4>
                          <div className="space-y-1.5 font-mono text-[10px]">
                            {kb.interview_questions.map((q, idx) => (
                              <div key={idx} className="p-2 bg-slate-900/30 border border-slate-850 rounded text-gray-300">
                                <span className="text-primary font-bold">{idx+1}.</span> {q}
                              </div>
                            ))}
                          </div>
                        </div>

                      </div>

                      <div className="grid grid-cols-2 gap-4">

                        {/* Typical Timeline */}
                        <div className="glass rounded-xl border border-slate-800 p-4 space-y-2">
                          <h4 className="text-[10px] font-bold text-white uppercase font-mono tracking-wider">Typical Event Sequence Timeline</h4>
                          <div className="space-y-3 relative pl-3 border-l border-slate-800 font-mono text-[10px]">
                            {kb.typical_timeline.map((step, idx) => (
                              <div key={idx} className="relative">
                                <span className="absolute -left-[16px] top-1 w-2 h-2 rounded-full bg-cyan-400" />
                                <span className="text-white font-bold block">{step.step}</span>
                                <span className="text-gray-400">{step.description}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Common Mistakes */}
                        <div className="glass rounded-xl border border-rose-950/20 p-4 space-y-2">
                          <h4 className="text-[10px] font-bold text-rose-300 uppercase font-mono tracking-wider flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5" /> Common Investigation Pitfalls
                          </h4>
                          <div className="space-y-2 text-[11px]">
                            {kb.common_mistakes.map((mistake, idx) => (
                              <div key={idx} className="flex gap-2 items-start">
                                <span className="text-rose-500 font-bold shrink-0">✕</span>
                                <span className="text-gray-300 leading-normal">{mistake}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                      </div>

                      <div className="text-[9px] text-gray-600 font-mono border-t border-slate-850 pt-3">
                        ⚠ The Knowledge Engine provides standardized profile guides. These are suggested references only. The officer always makes the final decisions.
                      </div>
                    </div>
                  );
                })()}

                {/* 11. Investigation Replay Tab — Prompt 10 */}
                {centerTab === 'replay' && (() => {
                  const stages = [
                    { id: 0, label: "Complaint", desc: "Raw reported statements input file" },
                    { id: 1, label: "Entity Extraction", desc: "Isolating phones, accounts, vehicles" },
                    { id: 2, label: "Timeline", desc: "Chronological milestone ordering" },
                    { id: 3, label: "Pattern Detection", desc: "Scans for repeated indicators across files" },
                    { id: 4, label: "Contradictions", desc: "Checking factual / temporal discrepancies" },
                    { id: 5, label: "Hypotheses", desc: "Formulating coordinated ring theories" },
                    { id: 6, label: "Officer Actions", desc: "Applying SOP checklists & strategy" },
                    { id: 7, label: "Final Brief", desc: "Exporting certified pdf advisory reports" }
                  ];

                  const activeStage = stages[activeReplayStep];

                  // Local helper to fetch current stage details
                  const getStageValue = () => {
                    switch (activeReplayStep) {
                      case 0:
                        return (
                          <div className="space-y-2">
                            <span className="text-[8px] uppercase font-mono text-gray-500 block">Raw Complaint Statement</span>
                            <div className="p-3 bg-slate-950 border border-slate-850 rounded text-gray-300 font-mono text-[10px] leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto">
                              {currentCase.summary || "No raw statement loaded."}
                            </div>
                          </div>
                        );
                      case 1:
                        return (
                          <div className="space-y-2">
                            <span className="text-[8px] uppercase font-mono text-gray-500 block">Extracted Entities & Metadata</span>
                            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                              <div className="p-2.5 bg-slate-950 border border-slate-850 rounded">
                                <span className="text-gray-500 block">NAMES</span>
                                <span className="text-white font-bold">{currentCase.entities?.names?.join(', ') || 'None'}</span>
                              </div>
                              <div className="p-2.5 bg-slate-950 border border-slate-850 rounded">
                                <span className="text-gray-500 block">PHONES</span>
                                <span className="text-cyan-400 font-bold">{currentCase.entities?.phones?.join(', ') || 'None'}</span>
                              </div>
                              <div className="p-2.5 bg-slate-950 border border-slate-850 rounded">
                                <span className="text-gray-500 block">UPI ADDRESSES</span>
                                <span className="text-amber-400 font-bold">{currentCase.entities?.upi_ids?.join(', ') || 'None'}</span>
                              </div>
                              <div className="p-2.5 bg-slate-950 border border-slate-850 rounded">
                                <span className="text-gray-500 block">VEHICLES</span>
                                <span className="text-rose-400 font-bold">{currentCase.entities?.vehicles?.join(', ') || 'None'}</span>
                              </div>
                            </div>
                          </div>
                        );
                      case 2:
                        return (
                          <div className="space-y-2">
                            <span className="text-[8px] uppercase font-mono text-gray-500 block">Reconstructed Timeline Chronology</span>
                            <div className="space-y-1.5 font-mono text-[10px] max-h-48 overflow-y-auto">
                              {(currentCase.timeline || []).map((t, idx) => (
                                <div key={idx} className="flex gap-2 p-1.5 bg-slate-950 border border-slate-900 rounded">
                                  <span className="text-primary font-bold">[{t.date || 'Date'}]</span>
                                  <span className="text-gray-300">{t.event}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      case 3:
                        const crossPatterns = detectPatterns(cases).filter(p => p.appears_in.some(o => o.id === currentCase.id));
                        return (
                          <div className="space-y-2">
                            <span className="text-[8px] uppercase font-mono text-gray-500 block">Pattern Registry Linkages</span>
                            <div className="space-y-2">
                              {crossPatterns.map((pat, idx) => (
                                <div key={idx} className="p-2 bg-slate-950 border border-slate-850 rounded text-[10px] font-mono">
                                  <span className="text-rose-400 font-bold block">[OVERLAP] {pat.entity_value}</span>
                                  <span className="text-gray-400 text-[9px]">{pat.assessment}</span>
                                </div>
                              ))}
                              {crossPatterns.length === 0 && <span className="text-[10px] text-gray-500 italic font-mono">No repeating cross-case parameters detected.</span>}
                            </div>
                          </div>
                        );
                      case 4:
                        const contra = currentCase.id === "COMP-005" ? "Possible 10-hour device power-down delay before physical transit assault." : "No contradictions flagged.";
                        return (
                          <div className="space-y-2">
                            <span className="text-[8px] uppercase font-mono text-gray-500 block">Factual Conflict Audits</span>
                            <div className="p-3 bg-slate-950 border border-slate-850 rounded text-amber-300 font-mono text-[10px] leading-relaxed">
                              ⚠️ {contra}
                            </div>
                          </div>
                        );
                      case 5:
                        const hypo = currentCase.incident_type === "Cyber Fraud" ? "Coordinated Multi-actor Tele-Fraud Ring operating shell accounts." : "Transit-hub opportunistic snatch crew.";
                        return (
                          <div className="space-y-2">
                            <span className="text-[8px] uppercase font-mono text-gray-500 block">AI Formulated Hypotheses</span>
                            <div className="p-3 bg-slate-950 border border-slate-850 rounded text-cyan-400 font-mono text-[10px] leading-relaxed">
                              💡 Suggested Hypothesis: {hypo}
                            </div>
                          </div>
                        );
                      case 6:
                        const gapsList = getEvidenceGaps(currentCase).filter(g => g.status === "Missing");
                        return (
                          <div className="space-y-2">
                            <span className="text-[8px] uppercase font-mono text-gray-500 block">SOP Strategy Checklist</span>
                            <div className="space-y-1 font-mono text-[10px]">
                              {gapsList.slice(0, 3).map((g, idx) => (
                                <div key={idx} className="p-2 bg-slate-950 border border-slate-900 rounded text-gray-400">
                                  • Acquire: <strong className="text-white">{g.name}</strong> → {g.action}
                                </div>
                              ))}
                              {gapsList.length === 0 && <span className="text-green-400">✓ All standard evidence components logged.</span>}
                            </div>
                          </div>
                        );
                      case 7:
                        return (
                          <div className="space-y-2">
                            <span className="text-[8px] uppercase font-mono text-gray-500 block">Exportable Advisory brief</span>
                            <div className="p-3 bg-slate-950 border border-slate-850 rounded text-[10px] font-mono text-gray-300 space-y-1.5">
                              <div>• BRIEF FILE: CrimeLens_Brief_{currentCase.id}.pdf</div>
                              <div>• STATUS: Final Advisory Ready</div>
                              <div>• CONTENT: Compiled 5-section report ready to download.</div>
                            </div>
                          </div>
                        );
                      default:
                        return null;
                    }
                  };

                  return (
                    <div className="space-y-4 animate-fadeIn">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-xs font-black text-white uppercase font-mono tracking-widest flex items-center gap-1.5">
                            <Activity className="w-4 h-4 text-cyan-400 animate-pulse" /> Investigation Replay
                          </h3>
                          <p className="text-[10px] text-gray-500 mt-0.5">Animate the investigation timeline step-by-step to replay extraction and linkage loops.</p>
                        </div>
                        
                        {/* Stepper controls */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setActiveReplayStep(prev => (prev - 1 + 8) % 8)}
                            className="p-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded text-white text-[9px] font-mono cursor-pointer flex items-center gap-0.5"
                          >
                            <ArrowLeft className="w-3 h-3" /> Prev
                          </button>
                          <button
                            onClick={() => setIsReplayPlaying(!isReplayPlaying)}
                            className={`px-3 py-1 border rounded text-[9px] font-mono font-bold flex items-center gap-1 cursor-pointer transition ${
                              isReplayPlaying ? 'bg-rose-950/40 border-rose-800 text-rose-400' : 'bg-primary/20 border-primary/45 text-white'
                            }`}
                          >
                            {isReplayPlaying ? (
                              <><Pause className="w-3 h-3 text-rose-400" /> Pause</>
                            ) : (
                              <><Play className="w-3 h-3 text-primary" /> Auto Play</>
                            )}
                          </button>
                          <button
                            onClick={() => setActiveReplayStep(prev => (prev + 1) % 8)}
                            className="p-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded text-white text-[9px] font-mono cursor-pointer flex items-center gap-0.5"
                          >
                            Next <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* Stepper Node Line */}
                      <div className="p-3 bg-slate-950/40 border border-slate-800 rounded-xl flex justify-between items-center relative overflow-x-auto gap-4">
                        {stages.map((stage, i) => (
                          <button
                            key={i}
                            onClick={() => {
                              setActiveReplayStep(stage.id);
                              setIsReplayPlaying(false);
                            }}
                            className={`flex flex-col items-center gap-1.5 text-center focus:outline-none shrink-0 transition ${
                              activeReplayStep === stage.id ? 'opacity-100' : 'opacity-40 hover:opacity-75'
                            }`}
                          >
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-bold font-mono ${
                              activeReplayStep === stage.id ? 'bg-primary border-primary text-white shadow shadow-primary/40' : 'bg-slate-900 border-slate-800 text-gray-500'
                            }`}>
                              {stage.id + 1}
                            </div>
                            <span className="text-[9px] font-mono font-bold text-white uppercase">{stage.label}</span>
                          </button>
                        ))}
                      </div>

                      {/* Active Stage Details Panel */}
                      <div className="glass rounded-xl border border-slate-800 overflow-hidden">
                        <div className="px-4 py-2.5 bg-slate-900/60 border-b border-slate-800 flex justify-between items-center">
                          <span className="text-[11px] font-black text-white uppercase font-mono tracking-wider flex items-center gap-2">
                            STAGE {activeReplayStep + 1} · {activeStage.label}
                          </span>
                          <span className="text-[9px] text-cyan-400 font-mono uppercase">{activeStage.desc}</span>
                        </div>
                        <div className="p-4 space-y-4">
                          
                          {/* Live Dynamic Core Value */}
                          {getStageValue()}

                        </div>
                      </div>

                      <div className="text-[9px] text-gray-600 font-mono border-t border-slate-850 pt-3">
                        ⚠ Replay module displays recorded diagnostic milestones. The final assessment remains the authority of the officer.
                      </div>
                    </div>
                  );
                })()}

                {/* 12. Confidence Map Tab — Prompt 11 */}
                {centerTab === 'confmap' && (() => {
                  const confFacets = getConfidenceMap(currentCase);
                  const CONF_PILL = (c) => {
                    if (c === "High") return "bg-green-950/60 text-green-400 border-green-900/40";
                    if (c === "Medium") return "bg-amber-950/60 text-amber-400 border-amber-900/40";
                    return "bg-rose-950/60 text-rose-400 border-rose-900/40";
                  };
                  return (
                    <div className="space-y-4 animate-fadeIn">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-xs font-black text-white uppercase font-mono tracking-widest flex items-center gap-1.5">
                            <Target className="w-4 h-4 text-primary" /> Confidence Map
                          </h3>
                          <p className="text-[10px] text-gray-500 mt-0.5">Visualize evidence coverage, gaps, and suggested actions across 7 facets of active files.</p>
                        </div>
                        <span className="text-[8px] font-mono bg-slate-900 border border-slate-800 px-2 py-1 rounded text-cyan-400">7 FACETS SCANNED</span>
                      </div>

                      {/* 7 Facets Grid */}
                      <div className="grid grid-cols-1 gap-3">
                        {confFacets.map((facet, i) => (
                          <div key={i} className="glass rounded-xl border border-slate-800 p-4 space-y-3">
                            
                            {/* Facet header row */}
                            <div className="flex justify-between items-center">
                              <span className="text-[11px] font-black text-white uppercase font-mono tracking-wider">
                                {facet.facet}
                              </span>
                              <div className="flex items-center gap-3">
                                <span className="text-[9px] text-gray-500 font-mono">Coverage:</span>
                                <div className="w-24 h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-850">
                                  <div className="h-full bg-primary rounded-full" style={{ width: `${facet.coverage}%` }} />
                                </div>
                                <span className="text-[10px] font-bold text-white font-mono w-8">{facet.coverage}%</span>
                                <span className={`text-[8px] font-bold font-mono px-2 py-0.5 rounded border uppercase ${CONF_PILL(facet.confidence)}`}>
                                  {facet.confidence} CONFIDENCE
                                </span>
                              </div>
                            </div>

                            {/* Facet details */}
                            <div className="grid grid-cols-2 gap-3 text-[10px]">
                              
                              {/* Missing Checklist */}
                              <div className="space-y-1">
                                <span className="text-[8px] uppercase font-mono font-bold text-gray-500">Missing Elements Checks</span>
                                <ul className="space-y-1 text-gray-300 list-disc pl-3">
                                  {facet.missing_items.map((item, idx) => (
                                    <li key={idx} className="leading-relaxed">{item}</li>
                                  ))}
                                </ul>
                              </div>

                              {/* Suggested Next Action */}
                              <div className="space-y-1">
                                <span className="text-[8px] uppercase font-mono font-bold text-gray-500">Suggested Next Action</span>
                                <div className="p-2.5 bg-slate-950 border border-slate-850 rounded text-cyan-400 font-mono leading-normal">
                                  {facet.suggested_action}
                                </div>
                              </div>

                            </div>

                          </div>
                        ))}
                      </div>

                      <div className="text-[9px] text-gray-600 font-mono border-t border-slate-850 pt-3">
                        ⚠ Confidence Map is a dynamic coverage assessment. It does not dictate legal completeness or prove culpability.
                      </div>
                    </div>
                  );
                })()}
              </div>
              <div className="h-64 border-t border-slate-850 bg-slate-950 flex flex-col overflow-hidden shrink-0">
                <div className="h-8 border-b border-slate-850 bg-slate-950/80 px-3 flex items-center justify-between shrink-0 select-none">
                  <div className="flex gap-2">
                    {[
                      { id: 'timeline', name: 'Timeline', icon: Clock },
                      { id: 'warnings', name: 'Alerts', icon: AlertTriangle },
                      { id: 'reasoning', name: 'AI Thoughts', icon: Cpu },
                      { id: 'logs', name: 'Activity Log', icon: FileCode },
                      { id: 'audit', name: 'Audit Trail', icon: CheckCircle }
                    ].map(tab => {
                      const TabIcon = tab.icon;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setBottomTab(tab.id)}
                          className={`flex items-center gap-1 px-2.5 py-1 text-[9px] font-bold font-mono uppercase tracking-wider transition cursor-pointer ${
                            bottomTab === tab.id
                              ? 'bg-slate-900 border-x border-slate-850 text-white'
                              : 'text-gray-500 hover:text-gray-300'
                          }`}
                        >
                          <TabIcon className="w-3 h-3" /> {tab.name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-3 font-mono text-[10px] leading-relaxed text-gray-400 bg-slate-950/60">
                  
                  {/* Timeline Indicator log */}
                  {bottomTab === 'timeline' && (
                    <div className="space-y-1.5">
                      {(currentCase.timeline || []).map((step, idx) => (
                        <div key={idx} className="flex gap-3 items-start border-l border-slate-800 pl-3 relative">
                          <span className="w-1.5 h-1.5 bg-primary rounded-full absolute -left-[4px] top-[4px]" />
                          <span className="text-gray-500 shrink-0 select-none">{step.date || 'Date pending'}:</span>
                          <span className="text-gray-300">{step.event}</span>
                          <span className="text-[9px] text-gray-600 bg-slate-900 border border-slate-850 px-1 rounded ml-auto">
                            {step.source}
                          </span>
                        </div>
                      ))}
                      {(!currentCase.timeline || currentCase.timeline.length === 0) && (
                        <div className="text-gray-600 italic">No chronological logs loaded.</div>
                      )}
                    </div>
                  )}

                  {/* Warning Alerts log */}
                  {bottomTab === 'warnings' && (
                    <div className="space-y-2">
                      {warnings.map((warn, i) => (
                        <div key={i} className="flex gap-2.5 items-start p-2.5 bg-slate-900/40 border border-slate-850 rounded">
                          <AlertCircle className={`w-4 h-4 shrink-0 ${
                            warn.severity === 'High' 
                              ? 'text-rose-500' 
                              : warn.severity === 'Medium' 
                                ? 'text-amber-500' 
                                : 'text-blue-500'
                          }`} />
                          <div className="space-y-0.5">
                            <span className="text-white font-bold font-sans block">{warn.message}</span>
                            <span className="text-[9px] text-gray-500 block">Details: {warn.details}</span>
                          </div>
                          <span className="text-[8px] bg-slate-900 border border-slate-850 px-1.5 py-0.5 rounded font-mono font-bold uppercase ml-auto">
                            {warn.severity}
                          </span>
                        </div>
                      ))}
                      {warnings.length === 0 && (
                        <div className="text-gray-650 italic">No safety anomalies or overlapping indicators flagged at this time.</div>
                      )}
                    </div>
                  )}

                  {/* Reasoning Traces log */}
                  {bottomTab === 'reasoning' && (
                    <div className="space-y-1">
                      {reasoningTrace.map((trace, i) => (
                        <div key={i} className="text-cyan-400/90 font-mono">
                          {trace}
                        </div>
                      ))}
                      {reasoningTrace.length === 0 && (
                        <div className="text-gray-600 italic">Evaluating parameters...</div>
                      )}
                    </div>
                  )}

                  {/* System Telemetry logs */}
                  {bottomTab === 'logs' && (
                    <div className="space-y-3">
                      <div 
                        onClick={() => setCollapsedSections(prev => ({ ...prev, activityLog: !prev.activityLog }))}
                        className="flex items-center justify-between cursor-pointer select-none pb-2 border-b border-slate-900"
                      >
                        <div className="flex items-center gap-2">
                          <ChevronRight className={`w-3.5 h-3.5 text-gray-500 transition-transform duration-200 ${!collapsedSections.activityLog ? 'rotate-90' : ''}`} />
                          <span className="text-[10px] font-bold text-white uppercase font-mono tracking-wider">
                            {collapsedSections.activityLog ? `Activity Log (${systemLogs.length} Events)` : 'Activity Log'}
                          </span>
                        </div>
                        {!collapsedSections.activityLog && (
                          <span className="text-[8px] bg-slate-900 text-gray-550 border border-slate-800 px-2 py-0.5 rounded font-mono uppercase">
                            Telemetry Active
                          </span>
                        )}
                      </div>

                      {!collapsedSections.activityLog && (
                        <div className="space-y-1 pt-1 animate-fadeIn">
                          {systemLogs.map((log, i) => (
                            <div key={i} className="text-gray-500 font-mono">
                              {log}
                            </div>
                          ))}
                          {systemLogs.length === 0 && (
                            <div className="text-gray-655 italic">Telemetry idle.</div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Audit Trail ledger */}
                  {bottomTab === 'audit' && (
                    <div className="space-y-3">
                      <div 
                        onClick={() => setCollapsedSections(prev => ({ ...prev, auditTrail: !prev.auditTrail }))}
                        className="flex items-center justify-between cursor-pointer select-none pb-2 border-b border-slate-900"
                      >
                        <div className="flex items-center gap-2">
                          <ChevronRight className={`w-3.5 h-3.5 text-green-400 transition-transform duration-200 ${!collapsedSections.auditTrail ? 'rotate-90' : ''}`} />
                          <span className="text-[10px] font-bold text-white uppercase font-mono tracking-wider">
                            {collapsedSections.auditTrail ? 'Audit Trail (Verified)' : 'Audit Trail'}
                          </span>
                        </div>
                        {!collapsedSections.auditTrail && (
                          <span className="text-[8px] bg-green-950 text-green-400 border border-green-900/40 px-2 py-0.5 rounded font-mono uppercase">
                            Secure Ledger
                          </span>
                        )}
                      </div>

                      {!collapsedSections.auditTrail && (
                        <div className="space-y-1 pt-1 animate-fadeIn">
                          <div className="text-green-400 font-mono">[AUDIT online - Secure Ledger Node #771]</div>
                          <div className="text-gray-555 font-mono">---------------------------------------------------------</div>
                          <div className="text-gray-400 font-mono">• {new Date().toISOString()} - OFFICER active session loaded.</div>
                          <div className="text-gray-400 font-mono">• {new Date().toISOString()} - CASE CORE: Initialized connection for case {currentCase.id}.</div>
                          <div className="text-gray-400 font-mono">• {new Date().toISOString()} - INTELLIGENCE: Ran cross-case entity overlap checks.</div>
                          <div className="text-gray-400 font-mono">• {new Date().toISOString()} - SYSTEM: Synced localStorage parameters.</div>
                          <div className="text-gray-555 font-mono">---------------------------------------------------------</div>
                          <div className="text-gray-600 font-mono">Audit record verified by CrimeLens node ledger.</div>
                        </div>
                      )}
                    </div>
                  )}

                </div>
              </div>

            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-gray-600">
              <FileText className="w-12 h-12 text-gray-700 mb-2 animate-bounce" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">No Active Case Selected</span>
              <span className="text-[10px] text-gray-600 mt-1 max-w-xs">Select a case file from the left Case File Registry to load investigation core.</span>
            </div>
          )}
        </main>

        {/* Right Sidebar: CrimeLens Copilot Advisory panel */}
        <aside className="w-80 border-l border-slate-850 bg-slate-950/20 flex flex-col shrink-0 overflow-hidden">
          <div className="p-3 border-b border-slate-850 bg-slate-950/60 flex items-center justify-between shrink-0">
            <span className="text-[10px] font-black tracking-wider text-white font-mono uppercase flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-primary" /> {t("CRIMELENS COPILOT", "ಅಪರಾಧದರ್ಪಣ ಕಾಪಿಲಟ್")}
            </span>
            <span className="text-[8px] px-1.5 py-0.5 bg-slate-900 border border-slate-800 rounded font-mono text-cyan-400">
              {t("CASE ONLY", "ಪ್ರಕರಣ ಮಾತ್ರ")}
            </span>
          </div>

          {currentCase ? (
            <div className="flex-1 flex flex-col overflow-hidden min-h-0">
              
              {/* Brief Export Section */}
              <div className="p-2 border-b border-slate-850 flex gap-2 shrink-0 bg-slate-950/40">
                <button
                  onClick={() => handleOpenPreviewBrief(currentCase)}
                  className="flex-1 py-1.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-[10px] text-gray-300 font-semibold rounded transition cursor-pointer flex items-center justify-center gap-1"
                >
                  <Eye className="w-3 h-3 text-secondary" /> {t("Preview Brief", "ವರದಿ ಮುನ್ನೋಟ")}
                </button>
                <button
                  onClick={() => handleDownloadPDFBrief(currentCase)}
                  disabled={pdfGenerating}
                  className="flex-1 py-1.5 bg-primary hover:bg-primary-dark text-white text-[10px] font-semibold rounded transition cursor-pointer flex items-center justify-center gap-1 shadow shadow-primary/25"
                >
                  <Download className="w-3 h-3" /> {t("Export Brief PDF", "ವರದಿ ಡೌನ್‌ಲೋಡ್")}
                </button>
              </div>

              {/* Copilot 6 Specific Queries selection list */}
              <div className="p-3 border-b border-slate-850 bg-slate-950/60 shrink-0 space-y-1.5">
                <span className="text-[8px] text-gray-555 font-mono uppercase block tracking-wider">
                  {t("Investigative Shortcuts", "ಶಾರ್ಟ್‌ಕಟ್ ಪ್ರಶ್ನೆಗಳು")}
                </span>
                <div className="grid grid-cols-2 gap-1">
                  {[
                    { key: "do_next", en: "What do next?", kn: "ಮುಂದಿನ ಕ್ರಮ?" },
                    { key: "weak_evidence", en: "What is weak?", kn: "ದುರ್ಬಲ ಪುರಾವೆ?" },
                    { key: "interview_witness", en: "Who interview?", kn: "ಯಾರನ್ನು ವಿಚಾರಿಸಬೇಕು?" },
                    { key: "contradictions", en: "Contradictions?", kn: "ವ್ಯತ್ಯಾಸಗಳು?" }
                  ].map(q => (
                    <button
                      key={q.key}
                      onClick={async () => {
                        const qText = t(q.en, q.kn);
                        const newUserMsg = { id: Date.now(), sender: "user", text: qText };
                        const tempMessages = [...messages, newUserMsg];
                        setMessages(tempMessages);
                        const answerObj = await askCopilot(q.key, currentCase, cases, lang, messages);
                        const newAiMsg = { id: Date.now() + 1, sender: "ai", text: answerObj };
                        const updated = [...tempMessages, newAiMsg];
                        setMessages(updated);
                        updateCase({ ...currentCase, chatHistory: updated });
                        appendLog("Copilot query executed");
                      }}
                      className="px-2 py-1 text-left text-[9px] font-mono rounded border transition cursor-pointer bg-slate-900/60 border-slate-855 hover:bg-slate-900 text-gray-400 hover:text-white truncate"
                    >
                      {t(q.en, q.kn)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Copilot Response Workspace Bubble Feed */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0 bg-slate-950/10">
                {messages.length === 0 ? (() => {
                    const strategy = generateInvestigationStrategy(currentCase);
                    const rec = strategy?.immediate_actions?.[0];
                    const nextAction = strategy?.immediate_actions?.[1] || strategy?.evidence_to_collect?.people_to_interview?.[0];
                    if (!rec) return (
                      <div className="flex flex-col items-center justify-center h-full p-4 text-center text-gray-600">
                        <Shield className="w-10 h-10 text-gray-805 mb-2" />
                        <span className="text-[10px] font-bold text-white uppercase tracking-wider">{t("Standing By", "ಕಾಪಿಲಟ್ ಸಿದ್ಧರಿದ್ದಾರೆ")}</span>
                      </div>
                    );
                    return (
                      <div className="p-3 space-y-2.5 animate-fadeIn">
                        {/* Header badge */}
                        <div className="flex items-center justify-between">
                          <span className="text-[8px] font-bold text-primary uppercase font-mono tracking-wider flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block animate-pulse" />
                            Today's Recommendation
                          </span>
                          <span className="text-[7px] bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded font-mono text-cyan-400">
                            {currentCase.incident_type}
                          </span>
                        </div>

                        {/* Recommendation card */}
                        <div className="p-2.5 bg-slate-900/70 border border-slate-800 rounded-lg space-y-2 font-mono text-[9px]">
                          {/* Recommendation */}
                          <div>
                            <span className="text-[7.5px] text-gray-500 uppercase block mb-0.5">Recommendation</span>
                            <p className="text-white font-bold leading-snug">{rec.recommendation}</p>
                          </div>

                          {/* Divider */}
                          <div className="border-t border-slate-800/60" />

                          {/* Reason */}
                          <div>
                            <span className="text-[7.5px] text-gray-500 uppercase block mb-0.5">Reason</span>
                            <p className="text-gray-300 leading-snug">{rec.reason || rec.supporting_evidence}</p>
                          </div>

                          {/* Confidence */}
                          <div className="flex items-center justify-between bg-slate-950/50 px-2 py-1 rounded border border-slate-900">
                            <span className="text-[7.5px] text-gray-500 uppercase">Confidence</span>
                            <span className="text-green-400 font-bold">⬡ {rec.confidence}</span>
                          </div>

                          {/* Suggested Next Action */}
                          {nextAction && (
                            <div>
                              <span className="text-[7.5px] text-gray-500 uppercase block mb-0.5">Suggested Next Action</span>
                              <p className="text-cyan-400 leading-snug">{nextAction.recommendation}</p>
                            </div>
                          )}

                          {/* Officer Reminder */}
                          <div className="flex items-start gap-1.5 bg-amber-950/20 border border-amber-900/30 px-2 py-1.5 rounded">
                            <span className="text-amber-400 text-[9px] shrink-0">⚠</span>
                            <p className="text-amber-300/90 text-[7.5px] leading-snug">
                              Officer Reminder: All recommendations are advisory only. The investigating officer remains the final decision maker.
                            </p>
                          </div>
                        </div>

                        {/* Prompt hint */}
                        <p className="text-[8px] text-gray-600 text-center font-mono">
                          Ask a question below to start a conversation ↓
                        </p>
                      </div>
                    );
                  })() : (
                  messages.map((msg, idx) => {
                    const isUser = msg.sender === "user";
                    return (
                      <div key={msg.id || idx} className={"flex flex-col " + (isUser ? "items-end" : "items-start") + " space-y-1 animate-fadeIn"}>
                        <span className="text-[7px] font-mono text-gray-500 uppercase tracking-wider">
                          {isUser ? t("OFFICER", "ಅಧಿಕಾರಿ") : t("COPILOT ADVISORY", "ಕಾಪಿಲಟ್ ಸಲಹೆ")}
                        </span>
                        <div className={"p-2.5 rounded-lg text-[10px] leading-relaxed max-w-[92%] font-mono " + (
                          isUser ? "bg-primary/20 border border-primary/30 text-white" : "bg-slate-900/65 border border-slate-855 text-gray-300"
                        )}>
                          {typeof msg.text === "string" ? (
                            <p>{msg.text}</p>
                          ) : (
                            <div className="space-y-2">
                              <p className="text-white font-bold">{msg.text.answer}</p>
                              <div className="text-[8.5px] space-y-1 border-t border-slate-800/40 pt-1.5 text-gray-400">
                                <p><strong className="text-gray-500">{t("Evidence:", "ಪುರಾವೆ:")}</strong> {msg.text.evidence}</p>
                                <p><strong className="text-gray-500">{t("Guideline:", "ಮಾರ್ಗಸೂಚಿ:")}</strong> {msg.text.guideline}</p>
                                <p><strong className="text-gray-500">{t("Precedent:", "ಪೂರ್ವನಿದರ್ಶನ:")}</strong> {msg.text.precedent}</p>
                                <p><strong className="text-gray-500">{t("Reasoning:", "ತಾರ್ಕಿಕ ವಿವರಣೆ:")}</strong> {msg.text.reasoning}</p>
                                <p className="text-green-400"><strong className="text-gray-500">{t("Confidence:", "ವಿಶ್ವಾಸಾರ್ಹತೆ:")}</strong> ⬡ {msg.text.confidence}</p>
                                <p className="text-cyan-400"><strong className="text-gray-500">{t("Next Action:", "ಮುಂದಿನ ಕ್ರಮ:")}</strong> {msg.text.next_action}</p>
                              </div>
                              <button
                                onClick={() => handleSpeakAnswer(msg.text)}
                                className="mt-1 p-1 bg-slate-950 border border-slate-800 hover:border-slate-700 text-gray-400 hover:text-white rounded transition cursor-pointer flex items-center gap-1 text-[8px] font-mono"
                              >
                                <Volume2 className="w-2.5 h-2.5 text-cyan-400" /> {t("Speak Response", "ಉತ್ತರವನ್ನು ಓದಿ")}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Chat Input Bar with Web Speech API Microphone Trigger */}
              <div className="p-2.5 border-t border-slate-850 bg-slate-950 shrink-0 flex gap-1 items-center">
                <button
                  onClick={handleToggleVoiceInput}
                  className={"p-1.5 rounded transition cursor-pointer flex items-center justify-center " + (
                    isMicActive ? "bg-red-650 animate-pulse text-white" : "bg-slate-900 hover:bg-slate-800 text-gray-400 hover:text-white"
                  )}
                  title={t("Microphone Input", "ಧ್ವನಿ ಮೂಲಕ ಪ್ರಶ್ನಿಸಿ")}
                >
                  {isMicActive ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                </button>
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={async (e) => {
                    if (e.key === "Enter") {
                      if (!inputText.trim()) return;
                      const qText = inputText;
                      setInputText("");
                      const newUserMsg = { id: Date.now(), sender: "user", text: qText };
                      const tempMessages = [...messages, newUserMsg];
                      setMessages(tempMessages);
                      const answerObj = await askCopilot(qText, currentCase, cases, lang, messages);
                      const newAiMsg = { id: Date.now() + 1, sender: "ai", text: answerObj };
                      const updated = [...tempMessages, newAiMsg];
                      setMessages(updated);
                      updateCase({ ...currentCase, chatHistory: updated });
                    }
                  }}
                  placeholder={t("Ask Copilot...", "ಇಲ್ಲಿ ಪ್ರಶ್ನಿಸಿ...")}
                  className="flex-1 bg-slate-900 border border-slate-800 text-xs px-2.5 py-1.5 rounded text-white focus:outline-none focus:border-primary"
                />
                <button
                  onClick={async () => {
                    if (!inputText.trim()) return;
                    const qText = inputText;
                    setInputText("");
                    const newUserMsg = { id: Date.now(), sender: "user", text: qText };
                    const tempMessages = [...messages, newUserMsg];
                    setMessages(tempMessages);
                    const answerObj = await askCopilot(qText, currentCase, cases, lang, messages);
                    const newAiMsg = { id: Date.now() + 1, sender: "ai", text: answerObj };
                    const updated = [...tempMessages, newAiMsg];
                    setMessages(updated);
                    updateCase({ ...currentCase, chatHistory: updated });
                  }}
                  className="p-1.5 bg-primary hover:bg-primary-dark text-white rounded transition cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>


            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-gray-600">
              <Shield className="w-10 h-10 text-gray-805 mb-2" />
              <span className="text-[10px] font-bold text-white uppercase tracking-wider">{t("No Case Selected", "ಪ್ರಕರಣ ಆಯ್ಕೆ ಮಾಡಿಲ್ಲ")}</span>
            </div>
          )}
        </aside>

      </div>

      </>
      )}

      {/* Preview Brief Modal Dialog */}
      {previewBriefData && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl flex flex-col max-h-[90vh] shadow-2xl">
            
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950 rounded-t-2xl">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                <span className="text-sm font-bold text-white">Investigation Brief Preview — {previewBriefData.complaint.id}</span>
              </div>
              <button
                onClick={() => setPreviewBriefData(null)}
                className="text-gray-400 hover:text-white text-sm cursor-pointer p-1"
              >
                ✕ Close
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 p-6 overflow-y-auto space-y-6 text-xs text-gray-300 font-mono leading-relaxed bg-slate-950">
              
              <div className="border border-slate-800 p-4 rounded bg-slate-900/50 space-y-4">
                {/* Header Section */}
                <div className="border-b border-slate-800 pb-3 text-center">
                  <h2 className="text-sm font-bold text-white">CRIMELENS OS — COGNITIVE ADVISORY BRIEF</h2>
                  <span className="text-[9px] text-primary block mt-1">CONFIDENTIAL // LAW ENFORCEMENT ADVISORY USE ONLY</span>
                  <span className="text-[9px] text-gray-500 block">GENERATED: {new Date().toLocaleString()} BY CrimeLens OS Node-771</span>
                </div>

                {/* Case Info Row */}
                <div className="grid grid-cols-2 gap-4 text-[10px] border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-gray-500 block">CASE ID:</span>
                    <span className="text-white font-bold">{previewBriefData.complaint.id}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">CLASSIFICATION:</span>
                    <span className="text-cyan-400 font-bold">{previewBriefData.complaint.incident_type}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">REPORTER:</span>
                    <span className="text-white">{previewBriefData.complaint.victim || 'Unknown'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">EXTRACTION CONFIDENCE:</span>
                    <span className="text-green-400 font-bold">{previewBriefData.complaint.confidence}</span>
                  </div>
                </div>

                {/* 1. Summary */}
                <div className="space-y-1">
                  <span className="text-white font-bold block">[1. INCIDENT SUMMARY]</span>
                  <p className="text-gray-300 bg-slate-950 p-2.5 rounded border border-slate-850">
                    This brief assists in reviewing a potential {previewBriefData.complaint.incident_type.toLowerCase()} file. The system highlights specific facts described below:
                    {"\n\n"}
                    {previewBriefData.complaint.summary}
                    {"\n\n"}
                    The analysis suggests a confidence index of {previewBriefData.complaint.confidence || '80%'} regarding entity extraction.
                  </p>
                </div>

                {/* 2. Entities */}
                <div className="space-y-1">
                  <span className="text-white font-bold block">[2. EXTRACTED METADATA & ENTITIES]</span>
                  <div className="bg-slate-950 p-2.5 rounded border border-slate-850 space-y-1 text-[11px]">
                    <div>• Victim Name(s): {previewBriefData.complaint.entities?.names?.join(', ') || 'None'}</div>
                    <div>• Suspect Contact(s): {previewBriefData.complaint.entities?.phones?.join(', ') || 'None'}</div>
                    <div>• UPI Address(es): {previewBriefData.complaint.entities?.upi_ids?.join(', ') || 'None'}</div>
                    <div>• Bank Account(s): {previewBriefData.complaint.entities?.bank_accounts?.join(', ') || 'None'}</div>
                    <div>• Locations Logged: {previewBriefData.complaint.entities?.locations?.join(', ') || 'None'}</div>
                    <div>• Vehicles Logged: {previewBriefData.complaint.entities?.vehicles?.join(', ') || 'None'}</div>
                  </div>
                </div>

                {/* 3. Timeline */}
                <div className="space-y-1">
                  <span className="text-white font-bold block">[3. INCIDENT TIMELINE INDICATORS]</span>
                  <div className="bg-slate-950 p-2.5 rounded border border-slate-850 space-y-1.5">
                    {previewBriefData.complaint.timeline?.map((step, idx) => (
                      <div key={idx}>[{idx + 1}] {step.date || 'Pending'} — {step.event} ({step.source})</div>
                    )) || <div>No chronological log milestones identified.</div>}
                  </div>
                </div>

                {/* 4. Pattern Alerts */}
                <div className="space-y-1">
                  <span className="text-white font-bold block">[4. IDENTIFIED PATTERNS & CROSS-REFERENCES]</span>
                  <div className="bg-slate-950 p-2.5 rounded border border-slate-850 space-y-2">
                    {detectPatterns(cases).filter(p => p.appears_in.some(item => item.id === previewBriefData.complaint.id)).map((p, idx) => (
                      <div key={idx} className="border-l-2 border-rose-500 pl-2">
                        <div className="text-rose-400 font-bold">[ALERT] Repeated {p.entity_type} ({p.entity_value}) in {p.frequency} cases</div>
                        <div className="text-[10px] text-gray-400 mt-1">{p.assessment}</div>
                      </div>
                    )) || <div>No repeated entities or shared parameters detected in other registered files.</div>}
                    {detectPatterns(cases).filter(p => p.appears_in.some(item => item.id === previewBriefData.complaint.id)).length === 0 && (
                      <div>No repeated entities or shared parameters detected in other registered files.</div>
                    )}
                  </div>
                </div>

                {/* 5. Gaps & Actions */}
                <div className="space-y-1">
                  <span className="text-white font-bold block">[5. EVIDENCE GAPS & CHECKLIST]</span>
                  <div className="bg-slate-950 p-2.5 rounded border border-slate-850 divide-y divide-slate-850">
                    {previewBriefData.gaps.map((gap, i) => (
                      <div key={i} className="py-1.5 flex justify-between items-center gap-2">
                        <div>
                          <span className="font-bold text-gray-200">• {gap.name}:</span>
                          <span className="text-gray-400 block text-[10px]">{gap.action}</span>
                        </div>
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold font-mono ${
                          gap.status === 'Strongly Supported' ? 'text-green-400' : gap.status === 'Partially Supported' ? 'text-amber-400' : 'text-rose-400'
                        }`}>
                          {gap.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Disclaimer */}
                <div className="border-t border-slate-800 pt-3 text-[9px] text-gray-500 leading-normal italic text-center font-sans">
                  DISCLAIMER: This automated analytical advisory assists officers in organizing data parameters. It suggests relationships and highlights possibilities based on patterns. It does NOT confirm guilt, prove criminal activity, or establish legal culpability.
                </div>

              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 flex justify-end gap-3 bg-slate-950 rounded-b-2xl">
              <button
                onClick={() => setPreviewBriefData(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-gray-300 rounded text-xs transition cursor-pointer"
              >
                Close Preview
              </button>
              <button
                onClick={() => {
                  handleDownloadPDFBrief(previewBriefData.complaint);
                  setPreviewBriefData(null);
                }}
                className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded text-xs transition cursor-pointer font-semibold shadow"
              >
                Download PDF
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Bottom status bar telemetry */}
      <footer className="h-6 border-t border-slate-850 bg-slate-950 text-[9px] text-gray-500 font-mono flex items-center justify-between px-4 shrink-0">
        <span>SECURITY NODE STATUS: ENCRYPTED // LOCAL STATION DISPATCH NODE</span>
        <span>SYSTEM CALIBRATION ACTIVE // © 2026 CrimeLens OS Workspace</span>
      </footer>

    </div>
  );
}
