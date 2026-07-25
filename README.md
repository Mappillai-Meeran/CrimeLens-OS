# CrimeLens OS

![CrimeLens OS Banner](./public/github-banner.jpg)

![React](https://img.shields.io/badge/React-19-blue?logo=react)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?logo=tailwind-css)
![Zoho Catalyst](https://img.shields.io/badge/Zoho_Catalyst-Slate_%26_Functions-FF6B00?logo=zoho)
![Google Gemini](https://img.shields.io/badge/Google_Gemini-2.5_Flash-8E75B2?logo=google)
![JavaScript](https://img.shields.io/badge/JavaScript-ES2024-F7DF1E?logo=javascript)
![License](https://img.shields.io/badge/License-KSP_Hackathon-green)

**AI-assisted Investigation Workspace**  
*SCRB Investigation Platform Prototype*

---

> **"The AI assists. The officer decides."**

---

## 🌐 Live Deployment

CrimeLens OS is deployed and active in production:

- **Production URL**: [https://crimelens-os.onslate.in](https://crimelens-os.onslate.in)
- **Web Hosting**: Zoho Catalyst Slate (Static Web Distribution)
- **Continuous Deployment**: Auto-deployed directly from GitHub `main` branch
- **Serverless AI Backend**: Powered by Zoho Catalyst Serverless HTTP Function (`geminiProxy`)

---

## Problem Statement

**KSP Hackathon — Challenge 1: AI-Assisted Investigation Workspace**

Karnataka State Police investigators handle a high volume of complaints — especially cybercrime cases involving digital fraud, UPI scams, and online impersonation. Officers must rapidly:

- Extract structured evidence from unstructured complaint narratives
- Identify patterns across multiple cases
- Reconstruct chronological timelines
- Match against historical SCRB case studies
- Generate investigation strategies with supporting legal precedents

Currently, this work is manual, time-consuming, and dependent on individual officer experience. CrimeLens OS provides a structured AI-assisted workspace to accelerate and standardize this process.

---

## Solution

CrimeLens OS provides a complete AI-assisted investigation workflow:

```
Complaint Intake
     ↓
Entity Extraction
(Names, Phones, UPI IDs, Bank Accounts, Vehicles, Locations)
     ↓
Timeline Reconstruction
(Chronological event sequencing with gap and conflict detection)
     ↓
SCRB Investigation Memory
(Similarity matching against 10 structured historical case studies)
     ↓
Contradiction Detection
(Cross-case anomaly identification)
     ↓
Modus Operandi Analysis
(Pattern matching against known crime MO profiles)
     ↓
Strategy Generation
(Immediate actions, leads, evidence priorities)
     ↓
Copilot Assistance
(Natural language Q&A in English and Kannada)
     ↓
Investigation Brief
(PDF report with full evidence, strategy, and reasoning trace)
     ↓
Officer Decision
(The AI advises. The officer remains the final decision maker.)
```

---

## Architecture

### Application Architecture

```
CrimeLens OS
│
├── CASE CORE
│   ├── Complaint Intake (Manual Entry / File Upload / AI Extraction)
│   ├── Evidence Cabinet (Documents, Photos, Audio)
│   ├── Timeline Engine
│   └── Entity Extraction
│
├── REASONING CORE
│   ├── SCRB Investigation Memory (10 historical case studies)
│   ├── Contradiction Detection Engine
│   ├── Modus Operandi Detection
│   ├── AI Question Generator
│   └── Strategy Engine
│
├── COPILOT CORE
│   ├── Natural Language Q&A
│   ├── Voice Input (English / Kannada)
│   ├── Text-to-Speech
│   └── Explainability Layer
│
└── COMMAND CORE
    ├── Investigation Brief (PDF Export)
    ├── Audit Trail
    ├── Confidence Map
    └── Officer Decision Support
```

### End-to-End Deployment & AI Flow Architecture

```
User / Officer
      │
      ▼
React + Vite Frontend (CrimeLens OS Client)
      │
      ▼
Zoho Catalyst Slate (Production Web Hosting)
      │
      │ POST /server/geminiProxy
      ▼
Catalyst Serverless Function (geminiProxy)
   [Securely reads: process.env.GEMINI_API_KEY]
      │
      │ HTTPS API Request
      ▼
Google Gemini 2.5 Flash API
      │
      ▼
AI Response (Sanitized JSON -> Frontend Workspace)
```

#### Architectural Layers Explained:
- **React Frontend**: Client application running in the browser. Renders the interactive workspace, timeline visualizations, and entity graph. Never exposes the Gemini API key.
- **Zoho Catalyst Slate**: Production web application hosting platform for CrimeLens OS, auto-deploying updates from GitHub.
- **Catalyst Serverless Function (`geminiProxy`)**: Node.js Express Advanced I/O HTTP function that acts as a secure API gateway between CrimeLens OS and Google Gemini.
- **Google Gemini 2.5 Flash**: Cognitive AI engine providing structured entity extraction and bilingual copilot assistance.
- **Offline Fallback Engine**: If cloud AI is unreachable or unconfigured, CrimeLens OS automatically switches to built-in regex entity extraction and rule-based copilot Q&A without breaking the user experience.

---

## Features

| Module | Description |
|---|---|
| **Case File Registry** | Create, view, and manage multiple concurrent case files |
| **AI Extraction** | Live Gemini 2.5 Flash via `geminiProxy` serverless function or built-in regex parser (offline) |
| **Entity Network Graph** | Interactive SVG graph — zoom, pan, filter by entity type |
| **Timeline Flow** | Chronological reconstruction with gap detection and conflict highlighting |
| **SCRB Investigation Memory** | Similarity-scored retrieval from 10 curated historical case studies |
| **Contradiction Engine** | Cross-case anomaly and timeline conflict identification |
| **Modus Operandi Engine** | MO pattern matching against known crime profiles |
| **AI Question Generator** | Context-specific investigation questions for officer-led interviews |
| **Strategy Engine** | Prioritized investigation roadmap with legal SOP alignment |
| **Legal Guidance** | Applicable IPC/IT Act sections and precedents from curated knowledge base |
| **Police Knowledge Base** | SCRB-curated SOPs and guidelines per crime type |
| **Reasoning Core** | Multi-module inference engine with evidence trace and confidence scoring |
| **Hypothesis Board** | Structured hypothesis testing workspace |
| **Confidence Map** | 7-facet evidence coverage assessment |
| **Copilot** | Conversational AI assistant — English and Kannada |
| **Voice Interface** | Browser Speech Recognition + Speech Synthesis |
| **Investigation Replay** | Step-by-step case reconstruction viewer |
| **Command Center** | Live investigation health metrics strip |
| **PDF Generator** | Comprehensive investigation brief with disclaimer |
| **Audit Trail** | Chronological officer activity log |
| **Demo Mode** | Fully pre-loaded sandbox with 11 demo cases across 7 districts |

---

## Technology Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | React 19 |
| **Build Tool** | Vite 8 |
| **Styling** | Tailwind CSS v4 |
| **Web Hosting** | Zoho Catalyst Slate |
| **Serverless Backend** | Zoho Catalyst Serverless Functions (`geminiProxy` - Node 18 Express) |
| **AI Engine (Live)** | Google Gemini 2.5 Flash (accessed via `geminiProxy` serverless HTTP function) |
| **Icons** | Lucide React |
| **Charts** | Recharts |
| **PDF Generation** | jsPDF + html2canvas |
| **State Management** | React Context API (`CaseProvider`) |
| **Persistence** | Browser localStorage |
| **Speech** | Web Speech API (native browser) |
| **Fonts** | Google Fonts — Outfit, Inter |

---

## Zoho Catalyst Integration

CrimeLens OS is built natively on the Zoho Catalyst serverless cloud ecosystem:

### Active Catalyst Components

- ✅ **Zoho Catalyst Slate**: Static web app distribution and production hosting environment.
- ✅ **Zoho Catalyst Serverless Functions (`geminiProxy`)**: Node.js Express Advanced I/O HTTP Function mounted at `/server/geminiProxy`, securely bridging the frontend with Google Gemini AI.

### Planned Catalyst Enhancements (Future Scope)

- ⏳ **Catalyst Data Store**: Relational persistent storage replacing localStorage for multi-station database sync.
- ⏳ **Catalyst Authentication**: Multi-factor officer login and role-based access control (IO / SHO / DySP).
- ⏳ **Catalyst API Gateway**: Advanced rate-limiting, custom domain routing, and security policies.
- ⏳ **Catalyst SmartBrowz**: Automated PDF snapshot generation and Web document rendering.
- ⏳ **Catalyst QuickML**: Machine learning model hosting for offline automated CDR/IPDR pattern detection.

---

## Security & Privacy

CrimeLens OS implements strict security best practices for law enforcement software:

- **Zero Client Secret Exposure**: The frontend client contains no API keys or secret credentials.
- **Serverless API Proxy**: All AI communication is proxied through the Zoho Catalyst Serverless Function (`geminiProxy`).
- **Encrypted Environment Variables**: The Gemini API key is stored securely in Zoho Catalyst Function Environment Variables (`GEMINI_API_KEY`).
- **Offline Resilience**: Built-in regex and rule-based fallback engines allow full offline functionality without cloud dependencies.
- **Clean Repository**: No credentials, tokens, or environment files are committed to GitHub.

---

## Folder Structure

```
CrimeLens-OS/
├── public/                     # Static assets (favicons, banners, splash screens, OG image)
├── functions/                  # Zoho Catalyst Serverless Functions
│   └── geminiProxy/            # Serverless HTTP API proxy for Gemini AI
│       ├── catalyst-config.json # Function metadata (type: advancedio, stack: node18)
│       ├── index.js            # Express router handling /extract, /copilot, /health
│       └── package.json        # Function node dependencies (express)
│
├── src/
│   ├── App.jsx                 # Main application (all UI, tabs, panels)
│   ├── main.jsx                # React entry point
│   ├── index.css               # Enterprise theme (CSS custom properties)
│   │
│   ├── components/
│   │   └── Visualizations.jsx  # Timeline, Entity Graph, Money Flow, Heatmap
│   │
│   ├── services/
│   │   ├── caseStore.jsx        # Global case state (React Context)
│   │   ├── storage.js           # localStorage CRUD
│   │   ├── gemini.js            # Calls /server/geminiProxy with regex fallback
│   │   ├── scrbRepository.js    # SCRB Memory, Strategy, Questions, Contradictions
│   │   ├── investigationMemory.js # Case memory persistence + similarity scoring
│   │   ├── copilotService.js    # Calls /server/geminiProxy with rule-based fallback
│   │   ├── knowledgeEngine.js   # Police guidelines + legal precedents
│   │   ├── reasoningCore.js     # Multi-module reasoning engine
│   │   ├── investigationCore.js # Investigation workflow engine
│   │   ├── commandCore.js       # Command Center metrics
│   │   ├── confidenceMapService.js # 7-facet confidence scoring
│   │   ├── investigation.js     # Evidence gaps + similarity scoring
│   │   └── patternDetection.js  # Pattern analysis
│   │
│   └── data/
│       └── demo/               # Demo complaint text files
│
├── .env.example                # Environment variable template
├── catalyst.json               # Catalyst manifest (linking Slate & Functions)
├── index.html                  # HTML entry point with metadata
├── package.json                # Dependencies
├── vite.config.js              # Vite configuration
└── README.md                   # Project documentation
```

---

## Setup Instructions

### Prerequisites
- Node.js ≥ 18
- npm ≥ 9

### Installation

```bash
# Clone the repository
git clone https://github.com/Mappillai-Meeran/CrimeLens-OS.git
cd CrimeLens-OS

# Install dependencies
npm install
```

### Development

```bash
npm run dev
```
Opens at `http://localhost:5173`

### Production Build

```bash
npm run build
```
Output generated in `dist/`

### Preview Production Build Locally

```bash
npm run preview
```

### Live Gemini Setup (Zoho Catalyst Serverless Function)

The frontend client no longer requires any Gemini API key in local `.env` files.

To configure Live Gemini AI processing:

1. Open **Zoho Catalyst Console** → **Functions** → **geminiProxy**.
2. Go to **Environment Variables**.
3. Add variable:
   - **Key**: `GEMINI_API_KEY`
   - **Value**: `your_google_gemini_api_key`
4. Save and deploy the function.

> **Security Note**: Moving the API key to Catalyst Serverless Function environment variables ensures that `GEMINI_API_KEY` is never exposed in browser requests or client JavaScript bundles. Without a key, CrimeLens OS operates seamlessly in **Demo Mode** using the built-in regex parser and rule-based copilot.

---

## Running CrimeLens OS

### Quick Start (Windows)

Double-click `Start CrimeLens.bat`

### Demo Mode

1. Launch the application or visit [https://crimelens-os.onslate.in](https://crimelens-os.onslate.in)
2. Click **"Initialize Demo OS"** on the landing screen
3. The workspace loads with 11 demo cases across 7 districts, 10 SCRB memory entries, guidelines, and precedents

### Live Investigation

1. Click **"New Case"** in the Case File Registry
2. Paste complaint text in the Intake area
3. Click **Extract Evidence** (AI or regex parsing)
4. Navigate tabs: Overview → Analysis → Reasoning → Knowledge → Reports

---

## Screenshots

> *Screenshots to be added prior to final submission.*

| View | Description |
|---|---|
| Landing Screen | CrimeLens OS initialization and demo sandbox |
| Workspace | Main investigation workspace with case loaded |
| Entity Graph | Interactive entity relationship network |
| Timeline | Reconstructed chronological timeline with conflict detection |
| Copilot | Conversational AI assistant panel |
| PDF Brief | Investigation brief export |

---

## Known Limitations

> This is a **prototype implementation** built for the KSP Hackathon Challenge 1.

- Uses a **curated SCRB Investigation Memory dataset** of 10 structured historical case studies, police guidelines, and legal precedents
- **Not connected to live SCRB databases** or any external police information systems
- All AI recommendations are **advisory only** — the investigating officer remains the final decision maker
- Voice recognition requires a **modern Chromium-based browser** (Chrome, Edge)
- PDF export does not support **right-to-left scripts** or **Kannada Unicode** in the generated document
- localStorage is used for persistence — clearing browser data will reset the workspace
- Live AI extraction uses the Catalyst `geminiProxy` serverless HTTP function; offline demo mode works without any cloud connection

---

## Future Scope

The following enhancements are candidates for a production version:

- Integration with live SCRB case database via secure API
- Role-based access control (IO / SHO / DySP dashboards)
- Multi-officer collaborative workspace
- IPC/BNSS 2023 updated legal section mapping
- Geospatial crime cluster mapping (GIS integration)
- Automated CDR / IPDR analysis import
- Integration with CCTNS (Crime and Criminal Tracking Network)
- Audit-grade PDF with digital signature and chain-of-custody tracking
- Native Android / iOS app for field officers
- Secure offline-first PWA with sync capability

---

## Disclaimer

**CrimeLens OS is a prototype developed for the KSP Hackathon.**  
All data used in Demo Mode is fictional and created solely for demonstration purposes.  
This system does not replace officer judgment, legal process, or established investigation procedures.  
All AI outputs are advisory suggestions only.

**The AI assists. The officer decides.**

---

## License

Developed for the **Karnataka State Police Hackathon — Challenge 1**.  
Internal use only. Not for public distribution.
