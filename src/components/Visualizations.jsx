import React, { useState, useEffect } from 'react';
import { 
  Shield, User, Phone, CreditCard, MapPin, 
  Car, Eye, FileText, CheckCircle, AlertTriangle, 
  Activity, ArrowRight, Server, FileCode, Check,
  Volume2, Cpu, Network, HelpCircle, ShieldAlert
} from 'lucide-react';

import {
  calculateEvidenceReliability,
  detectContradictions,
  searchSCRBRepository,
  generateAIQuestions,
  generateInvestigationStrategy,
  calculateCaseHealth
} from '../services/scrbRepository';

// ─── 1. INTERACTIVE TIMELINE INTELLIGENCE (Prompt 5) ────────────────────────
export function InteractiveTimelineFlow({ currentCase }) {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [zoomLevel, setZoomLevel] = useState('normal'); // 'compact', 'normal', 'detailed'

  if (!currentCase) return null;

  const rawTimeline = currentCase.timeline || [];

  // Group events and analyze sequences
  const parsedEvents = rawTimeline.map((step, idx) => {
    const stepText = typeof step === 'string' ? step : step.event || '';
    const stepDate = typeof step === 'string' ? '' : step.date || '';
    const stepSource = typeof step === 'string' ? 'Intake' : step.source || 'Intake';

    let category = "Incident";
    let icon = Shield;
    let color = "#ef4444"; // default red
    let bg = "bg-rose-950/40 border-rose-900/40 text-rose-400";

    const lower = stepText.toLowerCase();
    if (lower.includes("complaint") || lower.includes("filed") || lower.includes("reporting")) {
      category = "Complaint";
      icon = FileText;
      color = "#10b981"; // green
      bg = "bg-emerald-950/40 border-emerald-900/30 text-emerald-400";
    } else if (lower.includes("transfer") || lower.includes("deposit") || lower.includes("paid") || lower.includes("money") || lower.includes("₹")) {
      category = "Financial Transactions";
      icon = CreditCard;
      color = "#f59e0b"; // gold
      bg = "bg-amber-950/40 border-amber-900/30 text-amber-400";
    } else if (lower.includes("whatsapp") || lower.includes("sms") || lower.includes("link") || lower.includes("chat") || lower.includes("ip") || lower.includes("website")) {
      category = "Digital Events";
      icon = Server;
      color = "#06b6d4"; // cyan
      bg = "bg-cyan-950/40 border-cyan-900/30 text-cyan-400";
    } else if (lower.includes("call") || lower.includes("phone") || lower.includes("mobile")) {
      category = "Phone Calls";
      icon = Phone;
      color = "#0ea5e9"; // sky blue
      bg = "bg-sky-950/40 border-sky-900/30 text-sky-400";
    } else if (lower.includes("cctv") || lower.includes("screenshot") || lower.includes("evidence") || lower.includes("seized") || lower.includes("collected")) {
      category = "Evidence Collection";
      icon = FileCode;
      color = "#14b8a6"; // teal
      bg = "bg-teal-950/40 border-teal-900/30 text-teal-400";
    } else if (lower.includes("witness") || lower.includes("statement") || lower.includes("testimony") || lower.includes("interviewed")) {
      category = "Witness Statements";
      icon = User;
      color = "#a855f7"; // purple
      bg = "bg-purple-950/40 border-purple-900/30 text-purple-400";
    } else if (lower.includes("court") || lower.includes("precedent") || lower.includes("order") || lower.includes("remand")) {
      category = "Court Actions";
      icon = ShieldAlert;
      color = "#6366f1"; // indigo
      bg = "bg-indigo-950/40 border-indigo-900/30 text-indigo-400";
    }

    // Chronological conflict detection (impossible sequence)
    let isConflict = false;
    let conflictDetails = "";
    if (idx > 0 && rawTimeline[idx - 1].date && stepDate) {
      const prevDate = new Date(rawTimeline[idx - 1].date);
      const currDate = new Date(stepDate);
      if (currDate < prevDate) {
        isConflict = true;
        conflictDetails = "Impossible sequence: event date is earlier than preceding timeline entry.";
      }
    }

    // Gap detection (e.g. gap > 5 days)
    let hasGap = false;
    if (idx > 0 && rawTimeline[idx - 1].date && stepDate) {
      const diffTime = Math.abs(new Date(stepDate) - new Date(rawTimeline[idx - 1].date));
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays > 5) {
        hasGap = true;
      }
    }

    return {
      id: `evt-${idx}`,
      label: category,
      icon,
      color,
      bg,
      date: stepDate || "Missing Timestamp",
      detail: stepText,
      evidence: stepSource,
      isConflict,
      conflictDetails,
      hasGap,
      isMissingTimestamp: !stepDate
    };
  });

  // Filter based on category filter selection
  const filteredEvents = parsedEvents.filter(evt => {
    if (categoryFilter === 'ALL') return true;
    return evt.label === categoryFilter;
  });

  return (
    <div className="glass p-4 rounded-xl border border-slate-800 space-y-4 animate-fadeIn">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div>
          <h4 className="text-[10px] font-bold text-white uppercase font-mono tracking-wider">Reconstructed Timeline Intelligence</h4>
          <p className="text-[8px] text-gray-550 font-mono">Audited sequences, category highlights, and chronological checks.</p>
        </div>

        {/* Zoom & Filters */}
        <div className="flex flex-wrap gap-2 text-[9px] font-mono">
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">
            <span className="text-gray-500">Zoom:</span>
            {['compact', 'normal', 'detailed'].map(z => (
              <button
                key={z}
                onClick={() => setZoomLevel(z)}
                className={`px-1 rounded uppercase font-bold cursor-pointer ${zoomLevel === z ? 'text-primary' : 'text-gray-400'}`}
              >
                {z}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">
            <span className="text-gray-550">Group:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-slate-900 border-0 text-white text-[9px] font-mono focus:outline-none cursor-pointer appearance-none pr-1"
              style={{ backgroundColor: '#0f172a', color: '#fff' }}
            >
              <option value="ALL"                   style={{ background: '#0f172a', color: '#fff' }}>ALL CATEGORIES</option>
              <option value="Complaint"             style={{ background: '#0f172a', color: '#fff' }}>Complaint</option>
              <option value="Incident"              style={{ background: '#0f172a', color: '#fff' }}>Incident</option>
              <option value="Financial Transactions"style={{ background: '#0f172a', color: '#fff' }}>Financial Transactions</option>
              <option value="Digital Events"        style={{ background: '#0f172a', color: '#fff' }}>Digital Events</option>
              <option value="Phone Calls"           style={{ background: '#0f172a', color: '#fff' }}>Phone Calls</option>
              <option value="Evidence Collection"   style={{ background: '#0f172a', color: '#fff' }}>Evidence Collection</option>
              <option value="Witness Statements"    style={{ background: '#0f172a', color: '#fff' }}>Witness Statements</option>
              <option value="Court Actions"         style={{ background: '#0f172a', color: '#fff' }}>Court Actions</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reconstructed flow */}
      <div className="flex justify-between items-center relative py-4 px-2 overflow-x-auto gap-4 scrollbar-none">
        <div className="absolute left-4 right-4 h-[1px] bg-slate-850 top-[31px] z-0" />
        {filteredEvents.map((evt, idx) => {
          const EvtIcon = evt.icon;
          const isSelected = selectedEvent?.id === evt.id;
          const isCompact = zoomLevel === 'compact';
          const isDetailed = zoomLevel === 'detailed';

          return (
            <button
              key={evt.id}
              onClick={() => setSelectedEvent(evt)}
              className="flex flex-col items-center gap-1.5 focus:outline-none z-10 shrink-0 select-none group relative"
            >
              {/* Conflict / Gap markers */}
              {evt.isConflict && (
                <span className="absolute -top-1 right-0 w-2.5 h-2.5 rounded-full bg-rose-500 border border-slate-950 animate-ping"></span>
              )}
              {evt.hasGap && (
                <span className="absolute -top-1 left-0 text-[8px] bg-amber-950 border border-amber-900/40 text-amber-400 px-1 rounded font-bold">GAP</span>
              )}
              {evt.isMissingTimestamp && (
                <span className="absolute -top-1 left-0 text-[8px] text-amber-500 font-bold">?</span>
              )}

              <div className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all duration-300 ${
                isSelected 
                  ? 'bg-primary border-primary text-white shadow shadow-primary/55 scale-110' 
                  : evt.bg
              }`}>
                <EvtIcon className="w-4 h-4" />
              </div>
              
              {!isCompact && (
                <>
                  <span className="text-[9px] font-mono text-gray-300 group-hover:text-white uppercase font-semibold">{evt.label}</span>
                  <span className="text-[8px] font-mono text-gray-600">{evt.date}</span>
                </>
              )}
              {isDetailed && (
                <span className="text-[7.5px] text-gray-500 max-w-[80px] truncate">{evt.detail}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Selection Details Panel */}
      {selectedEvent ? (
        <div className="p-3 bg-slate-950/60 border border-slate-850 rounded-lg space-y-2 font-mono text-[9px]">
          <div className="flex justify-between items-center border-b border-slate-900 pb-1.5">
            <span className="text-[9px] font-bold text-white uppercase flex items-center gap-1">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: selectedEvent.color }}></span>
              {selectedEvent.label} Timeline Node
            </span>
            <span className="text-[8px] bg-cyan-950/40 border border-cyan-800/30 px-1.5 rounded text-cyan-400">File Reference: {selectedEvent.evidence}</span>
          </div>
          <p className="text-[10px] text-gray-400 leading-relaxed">{selectedEvent.detail}</p>
          
          <div className="flex flex-wrap gap-2 pt-1 border-t border-slate-900 text-[8px]">
            {selectedEvent.isConflict && (
              <span className="text-rose-400 bg-rose-950/40 border border-rose-900/30 px-1.5 rounded uppercase font-bold">⚠️ Chronological Conflict: {selectedEvent.conflictDetails}</span>
            )}
            {selectedEvent.hasGap && (
              <span className="text-amber-400 bg-amber-950/40 border border-amber-900/30 px-1.5 rounded uppercase font-bold">⚠️ Procedural Delay (Gap Detected)</span>
            )}
            {selectedEvent.isMissingTimestamp && (
              <span className="text-amber-400 bg-amber-950/40 border border-amber-900/30 px-1.5 rounded uppercase font-bold">⚠️ Missing Date / Timestamp</span>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-3 text-[9px] text-gray-600 font-mono bg-slate-950/20 border border-dashed border-slate-850 rounded-lg">
          Select an event node in the sequence to audit logs and trace details.
        </div>
      )}
    </div>
  );
}

// ─── 2. RELATIONSHIP GRAPH (Prompt 4/7) ──────────────────────────────────────
export function EntityRelationshipGraph({ currentCase }) {
  const [selectedNode, setSelectedNode] = useState(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [filterType, setFilterType] = useState('ALL');

  if (!currentCase) return null;

  const ents = currentCase.entities || {};

  // Dynamically compile diverse relationship nodes
  const allNodes = [
    { id: 'victim', label: currentCase.victim || 'Complainant', type: 'Person', color: '#10b981', x: 80, y: 150, details: "Primary reporter/victim of the reported incident." },
    ...(ents.phones || []).map((p, i) => ({
      id: `phone-${i}`, label: p, type: 'Phone Number', color: '#06b6d4', x: 220, y: 80 + i * 80, details: "Extracted mobile number linked to communication trail."
    })),
    ...(ents.upi_ids || []).map((u, i) => ({
      id: `upi-${i}`, label: u, type: 'UPI ID', color: '#f59e0b', x: 360, y: 100 + i * 90, details: "Payment handle siphoning financial assets."
    })),
    ...(ents.bank_accounts || []).map((b, i) => ({
      id: `bank-${i}`, label: b, type: 'Bank Account', color: '#ec4899', x: 480, y: 150 + i * 80, details: "Beneficiary bank account / mule node."
    })),
    ...(ents.vehicles || []).map((v, i) => ({
      id: `vehicle-${i}`, label: v, type: 'Vehicle', color: '#f43f5e', x: 220, y: 220 + i * 60, details: "Identified suspect transit vehicle."
    })),
    ...(ents.locations || []).map((l, i) => ({
      id: `loc-${i}`, label: l, type: 'Location', color: '#a855f7', x: 80, y: 240 + i * 60, details: "Physical geolocation logged in complaint."
    }))
  ];

  // Filter nodes based on selected type
  const nodes = allNodes.filter(n => {
    if (filterType === 'ALL') return true;
    return n.type === filterType;
  });

  // Compile edges dynamically based on filtered nodes
  const edges = [];
  const hasPhone = nodes.some(n => n.type === 'Phone Number');
  const hasUPI = nodes.some(n => n.type === 'UPI ID');
  const hasBank = nodes.some(n => n.type === 'Bank Account');
  const hasLoc = nodes.some(n => n.type === 'Location');
  const hasVeh = nodes.some(n => n.type === 'Vehicle');

  if (hasPhone) {
    edges.push({ source: 'victim', target: 'phone-0', label: 'Called' });
    if (hasUPI) {
      edges.push({ source: 'phone-0', target: 'upi-0', label: 'Shared Device' });
    }
  }
  if (hasUPI && hasBank) {
    edges.push({ source: 'upi-0', target: 'bank-0', label: 'Transferred Money' });
  }
  if (hasVeh) {
    edges.push({ source: 'victim', target: 'vehicle-0', label: 'Owns' });
    if (hasLoc) {
      edges.push({ source: 'vehicle-0', target: 'loc-0', label: 'Visited' });
    }
  }

  const activeNode = selectedNode || hoveredNode;

  // Zoom/Pan Action handlers
  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.15, 2));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.15, 0.5));
  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };
  const handlePan = (dx, dy) => setPan(prev => ({ x: prev.x + dx, y: prev.y + dy }));

  // Find dynamic details for side panel (Prompt 7 details)
  const getTimelineDetails = (nodeVal) => {
    if (!nodeVal) return [];
    return (currentCase.timeline || []).filter(step => {
      const txt = typeof step === 'string' ? step : step.event || '';
      return txt.toLowerCase().includes(nodeVal.toLowerCase());
    });
  };

  const getRelatedEvidence = (nodeVal) => {
    if (!nodeVal) return [];
    const evidenceList = [];
    if (currentCase.evidence?.documents?.length > 0) {
      evidenceList.push(...currentCase.evidence.documents);
    }
    if (currentCase.evidence?.photos?.length > 0) {
      evidenceList.push(...currentCase.evidence.photos.map(p => p.name));
    }
    return evidenceList.slice(0, 2);
  };

  const getRelatedPeople = (nodeType) => {
    const list = [];
    if (currentCase.victim) list.push(currentCase.victim + " (Victim)");
    if (currentCase.witnesses?.length > 0) {
      list.push(...currentCase.witnesses.map(w => w + " (Witness)"));
    }
    return list;
  };

  const nodeTimeline = activeNode ? getTimelineDetails(activeNode.label) : [];
  const nodeEvidence = activeNode ? getRelatedEvidence(activeNode.label) : [];
  const nodePeople = activeNode ? getRelatedPeople(activeNode.type) : [];

  return (
    <div className="glass p-4 rounded-xl border border-slate-800 space-y-4 animate-fadeIn">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div>
          <h4 className="text-[10px] font-bold text-white uppercase font-mono tracking-wider">Investigation Relationship Graph</h4>
          <p className="text-[8px] text-gray-550 font-mono">Zoomable, filterable interactive SVG entity mapping.</p>
        </div>

        {/* Toolbar: Filter & Zoom */}
        <div className="flex flex-wrap gap-2 text-[9px] font-mono">
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">
            <span className="text-gray-550">Filter:</span>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-slate-900 border-0 text-white text-[9px] font-mono focus:outline-none cursor-pointer appearance-none pr-1"
              style={{ backgroundColor: '#0f172a', color: '#fff' }}
            >
              <option value="ALL"    style={{ background: '#0f172a', color: '#fff' }}>ALL TYPES</option>
              <option value="Person" style={{ background: '#0f172a', color: '#fff' }}>Person</option>
              <option value="Phone Number" style={{ background: '#0f172a', color: '#fff' }}>Phone Number</option>
              <option value="UPI ID" style={{ background: '#0f172a', color: '#fff' }}>UPI ID</option>
              <option value="Bank Account" style={{ background: '#0f172a', color: '#fff' }}>Bank Account</option>
              <option value="Vehicle" style={{ background: '#0f172a', color: '#fff' }}>Vehicle</option>
              <option value="Location" style={{ background: '#0f172a', color: '#fff' }}>Location</option>
            </select>
          </div>

          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-gray-400">
            <button onClick={handleZoomIn} className="px-1 hover:text-white font-black font-mono cursor-pointer">+</button>
            <button onClick={handleZoomOut} className="px-1 hover:text-white font-black font-mono cursor-pointer">-</button>
            <button onClick={handleReset} className="px-1 hover:text-white uppercase font-bold cursor-pointer">Reset</button>
          </div>
        </div>
      </div>

      <div className="relative border border-slate-850 bg-slate-950 rounded-lg p-2 overflow-hidden flex flex-col md:flex-row gap-4 items-stretch justify-center min-h-[300px]">
        {/* Navigation Pan D-Pad */}
        <div className="absolute bottom-2 left-2 flex flex-col gap-1 bg-slate-900/80 border border-slate-800 p-1.5 rounded z-25 font-mono text-[9px] text-gray-400">
          <div className="flex justify-center"><button onClick={() => handlePan(0, -30)} className="hover:text-white cursor-pointer px-1">▲</button></div>
          <div className="flex gap-2.5">
            <button onClick={() => handlePan(-30, 0)} className="hover:text-white cursor-pointer px-1">◀</button>
            <button onClick={handleReset} className="hover:text-white cursor-pointer px-1">●</button>
            <button onClick={() => handlePan(30, 0)} className="hover:text-white cursor-pointer px-1">▶</button>
          </div>
          <div className="flex justify-center"><button onClick={() => handlePan(0, 30)} className="hover:text-white cursor-pointer px-1">▼</button></div>
        </div>

        {/* SVG Drawing Area */}
        <div className="flex-1 min-h-[250px] relative overflow-hidden flex items-center justify-center border border-slate-900 rounded">
          <svg viewBox="0 0 600 300" className="w-full h-full max-w-[500px] h-[250px] z-10">
            <defs>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Transform Group */}
            <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`} className="transition-transform duration-200">
              {/* Links / Edges */}
              {edges.map((edge, idx) => {
                const srcNode = nodes.find(n => n.id === edge.source);
                const tgtNode = nodes.find(n => n.id === edge.target);
                if (!srcNode || !tgtNode) return null;
                return (
                  <g key={idx}>
                    <line
                      x1={srcNode.x}
                      y1={srcNode.y}
                      x2={tgtNode.x}
                      y2={tgtNode.y}
                      stroke="#1e293b"
                      strokeWidth="2"
                    />
                    <line
                      x1={srcNode.x}
                      y1={srcNode.y}
                      x2={tgtNode.x}
                      y2={tgtNode.y}
                      stroke={activeNode?.id === srcNode.id || activeNode?.id === tgtNode.id ? '#10b981' : '#06b6d4'}
                      strokeWidth="1.5"
                      strokeDasharray="4 4"
                      className="animate-dash"
                      style={{ strokeDashoffset: '20' }}
                    />
                  </g>
                );
              })}

              {/* Nodes */}
              {nodes.map(node => {
                const isHovered = hoveredNode?.id === node.id;
                const isSelected = selectedNode?.id === node.id;
                const isActive = isSelected || isHovered;
                
                return (
                  <g
                    key={node.id}
                    onMouseEnter={() => setHoveredNode(node)}
                    onMouseLeave={() => setHoveredNode(null)}
                    onClick={() => setSelectedNode(node === selectedNode ? null : node)}
                    className="cursor-pointer group"
                  >
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={isActive ? 14 : 10}
                      fill={node.color}
                      filter={isActive ? 'url(#glow)' : ''}
                      className="transition-all duration-300"
                    />
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={isActive ? 19 : 14}
                      fill="none"
                      stroke={node.color}
                      strokeWidth="1.5"
                      strokeOpacity="0.4"
                      className="animate-pulse"
                    />
                    <text
                      x={node.x}
                      y={node.y - (isActive ? 24 : 18)}
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize="8"
                      fontWeight="bold"
                      fontFamily="monospace"
                      className="bg-black/90 p-0.5 rounded"
                    >
                      {node.type}
                    </text>
                  </g>
                );
              })}
            </g>
          </svg>
        </div>

        {/* Dynamic Detail Side Panel (Prompt 7 details) */}
        <div className="w-full md:w-64 bg-slate-900/60 border border-slate-850 rounded-lg p-3 flex flex-col justify-between font-mono text-[9px] overflow-y-auto max-h-[300px]">
          {activeNode ? (
            <div className="space-y-3.5 animate-fadeIn">
              <div>
                <span className="text-gray-550 uppercase block text-[7.5px]">Node Classification</span>
                <span className="text-white font-bold text-[10px] uppercase" style={{ color: activeNode.color }}>{activeNode.type}</span>
              </div>
              <div>
                <span className="text-gray-550 uppercase block text-[7.5px]">Value / Identifier</span>
                <span className="text-white font-bold block truncate text-[9.5px]">{activeNode.label}</span>
              </div>
              
              {/* Linked Timeline Steps */}
              {nodeTimeline.length > 0 && (
                <div className="border-t border-slate-800 pt-2 space-y-1">
                  <span className="text-cyan-400 font-bold block text-[7.5px] uppercase">Timeline Events</span>
                  <div className="space-y-1 max-h-[60px] overflow-y-auto">
                    {nodeTimeline.map((t, idx) => (
                      <p key={idx} className="text-gray-300 leading-tight">• {typeof t === 'string' ? t : t.event}</p>
                    ))}
                  </div>
                </div>
              )}

              {/* Related Evidence */}
              {nodeEvidence.length > 0 && (
                <div className="border-t border-slate-800 pt-2 space-y-1">
                  <span className="text-cyan-400 font-bold block text-[7.5px] uppercase">Related Evidence Files</span>
                  <p className="text-gray-300 leading-tight">{nodeEvidence.join(' · ')}</p>
                </div>
              )}

              {/* Related People */}
              {nodePeople.length > 0 && (
                <div className="border-t border-slate-800 pt-2 space-y-1">
                  <span className="text-cyan-400 font-bold block text-[7.5px] uppercase">Related Entities</span>
                  <p className="text-gray-300 leading-tight">{nodePeople.join(' · ')}</p>
                </div>
              )}

              {/* Matched Landmarks */}
              <div className="border-t border-slate-800 pt-2 space-y-1 text-[8px]">
                <p className="text-gray-400"><strong className="text-gray-550">Repository matches:</strong> Active matches siphoning payments</p>
                <p className="text-cyan-400 leading-tight"><strong className="text-gray-550">Investigation Notes:</strong> Securing bank logs recommended immediately.</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-center text-gray-600">
              Click any graph node to inspect details including timeline, evidence links, related people, and notes.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── 3. MONEY FLOW PIPELINE ────────────────────────────────────────────────
export function MoneyFlowPipeline({ currentCase }) {
  const ents = currentCase.entities || {};

  const pipeline = [
    { id: 'source', label: 'Victim Ledger', val: currentCase.victim || 'Rajesh K.' },
    { id: 'upi', label: 'UPI Gateway', val: ents.upi_ids?.[0] || 'quickloan@ybl' },
    { id: 'mule_bank', label: 'Mule Account', val: ents.bank_accounts?.[0] || '9988776655' },
    { id: 'atm', label: 'Cash Outflow', val: 'ATM Terminal Withdrawal' }
  ];

  return (
    <div className="glass p-4 rounded-xl border border-slate-800 space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="text-[10px] font-bold text-white uppercase font-mono tracking-wider">Financial Transaction Pipeline flow</h4>
        <span className="text-[8px] bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-cyan-400 font-mono">FLOW RATE: ACTIVE</span>
      </div>

      <div className="p-4 bg-slate-950 rounded-lg flex flex-col md:flex-row items-center justify-between gap-4">
        {pipeline.map((node, idx) => (
          <React.Fragment key={node.id}>
            {/* Pipeline Stage Card */}
            <div className="flex-1 w-full md:w-auto p-3 bg-slate-900 border border-slate-850 rounded-lg text-center font-mono space-y-1 relative group hover:border-primary transition-all duration-300">
              <span className="text-[8px] text-gray-550 uppercase block">{node.label}</span>
              <span className="text-[10px] text-white font-bold block truncate">{node.val}</span>
            </div>

            {/* Glowing arrow line spacer */}
            {idx < pipeline.length - 1 && (
              <div className="flex items-center justify-center shrink-0">
                <ArrowRight className="w-5 h-5 text-primary animate-pulse hidden md:block" />
                <span className="text-xs text-primary font-mono block md:hidden">↓</span>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

// ─── 4. PATTERN HEATMAP GRID ───────────────────────────────────────────────
export function PatternHeatmapGrid({ cases }) {
  const categoryCounter = {
    "Phone Numbers": [],
    "UPI IDs": [],
    "Bank Accounts": [],
    "Vehicles": [],
    "Locations": []
  };

  cases.forEach(c => {
    const ents = c.entities || {};
    (ents.phones || []).forEach(p => categoryCounter["Phone Numbers"].push({ val: p, id: c.id }));
    (ents.upi_ids || []).forEach(u => categoryCounter["UPI IDs"].push({ val: u, id: c.id }));
    (ents.bank_accounts || []).forEach(b => categoryCounter["Bank Accounts"].push({ val: b, id: c.id }));
    (ents.vehicles || []).forEach(v => categoryCounter["Vehicles"].push({ val: v, id: c.id }));
    (ents.locations || []).forEach(l => categoryCounter["Locations"].push({ val: l, id: c.id }));
  });

  return (
    <div className="glass p-4 rounded-xl border border-slate-800 space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="text-[10px] font-bold text-white uppercase font-mono tracking-wider">Indicator Frequency Heatmap</h4>
        <span className="text-[8px] bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-cyan-400 font-mono">CO-OCCURRENCE INTENSITY</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 font-mono text-[9px]">
        {Object.entries(categoryCounter).map(([category, items]) => {
          const counts = {};
          items.forEach(i => { counts[i.val] = (counts[i.val] || 0) + 1; });
          const uniqueItems = Object.entries(counts).sort((a,b) => b[1]-a[1]).slice(0, 3);

          return (
            <div key={category} className="glass border border-slate-850 p-2.5 rounded-lg space-y-2">
              <span className="text-gray-550 uppercase block text-[8px] font-bold">{category}</span>
              <div className="space-y-1.5">
                {uniqueItems.map(([val, freq]) => {
                  const intensityClass = freq >= 3 
                    ? 'bg-rose-950/40 text-rose-300 border-rose-900/40' 
                    : freq >= 2 
                      ? 'bg-amber-950/40 text-amber-300 border-amber-900/40' 
                      : 'bg-slate-900/50 text-gray-400 border-slate-850';
                  return (
                    <div key={val} className={`p-1.5 rounded border ${intensityClass} flex justify-between items-center gap-1.5`}>
                      <span className="truncate flex-1 font-bold">{val}</span>
                      <span className="shrink-0 text-[8px] font-black font-mono">×{freq}</span>
                    </div>
                  );
                })}
                {uniqueItems.length === 0 && (
                  <span className="text-gray-600 block italic py-2">No items.</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── 5. HYPOTHESIS BOARD VIEW ──────────────────────────────────────────────
export function HypothesisBoardView({ currentCase }) {
  const type = currentCase.incident_type;
  
  let scenarios = [
    { name: "Scenario A: Solo opportunistic threat actor", likelihood: 52, evidence: ["Incident reported as local occurrence", "Fled on standard coordinates"], missing: ["Cross-case indicator overlaps missing"] },
    { name: "Scenario B: Accidental/misreported dispute", likelihood: 28, evidence: ["Conflicting details in early logs"], missing: ["CCTV and medical confirmation reports"] }
  ];

  if (type === "Cyber Fraud") {
    scenarios = [
      { name: "Scenario A: Organized credit processing fraud syndicate", likelihood: 85, evidence: ["Identical UPI handle quickloan@ybl active across 3 complaints", "Call prefix matches VoIP endpoints"], missing: ["Beneficiary bank account signature verification"] },
      { name: "Scenario B: Standalone local cyber thief", likelihood: 42, evidence: ["UPI ID registered to single subscriber card"], missing: ["Secondary mule accounts audit traces"] },
      { name: "Scenario C: Account compromise dispute", likelihood: 18, evidence: ["Registrant claims card stolen yesterday"], missing: ["Signed registrar dispute files"] }
    ];
  } else if (type === "Assault" || type === "Missing Person") {
    scenarios = [
      { name: "Scenario A: Transit exit mobile snatch group", likelihood: 82, evidence: ["Motorcycle plate matches fleeing grab report", "Incident clusters near Metro Center corridor"], missing: ["Facial CCTV confirm of rider identities"] },
      { name: "Scenario B: Private acquaintance personal dispute", likelihood: 35, evidence: ["Witness reports conversation before contact"], missing: ["Victim phone communications audit log"] }
    ];
  }

  return (
    <div className="glass p-4 rounded-xl border border-slate-800 space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="text-[10px] font-bold text-white uppercase font-mono tracking-wider">Investigative Hypotheses Board</h4>
        <span className="text-[8px] bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-cyan-400 font-mono">COGNITIVE ASSESSMENTS</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-[9px]">
        {scenarios.map((sc, i) => {
          const isHigh = sc.likelihood >= 70;
          return (
            <div key={i} className={`glass p-3.5 rounded-xl border flex flex-col justify-between gap-3 ${
              isHigh ? 'border-primary/40 bg-primary/5' : 'border-slate-800'
            }`}>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-black text-white uppercase">{sc.name.split(':')[0]}</span>
                  <span className={`text-[10px] font-black ${isHigh ? 'text-green-400' : 'text-amber-400'}`}>{sc.likelihood}% Likely</span>
                </div>
                <p className="text-gray-300 font-sans text-[10px] leading-relaxed font-semibold">{sc.name.split(':')[1] || sc.name}</p>

                <div className="space-y-1">
                  <span className="text-[8px] text-gray-550 uppercase font-bold">Supporting Evidence</span>
                  <ul className="space-y-0.5 text-gray-405 pl-3 list-disc">
                    {sc.evidence.map((e, j) => <li key={j} className="leading-normal">{e}</li>)}
                  </ul>
                </div>
              </div>

              <div className="border-t border-slate-850 pt-2.5 space-y-1">
                <span className="text-[8px] text-gray-550 uppercase font-bold">Needs Verification Gaps</span>
                <ul className="space-y-0.5 text-rose-300 pl-3 list-disc">
                  {sc.missing.map((m, j) => <li key={j} className="leading-normal">{m}</li>)}
                </ul>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── 6. DYNAMIC CASE HEALTH PANEL (Prompt 6) ────────────────────────────────
export function LiveHealthIndicators({ currentCase }) {
  if (!currentCase) return null;

  const health = calculateCaseHealth(currentCase);
  if (!health) return null;

  // Compute Timeline Completeness %
  const totalTimelineSteps = currentCase.timeline?.length || 0;
  const missingTimestamps = currentCase.timeline?.filter(t => typeof t !== 'string' && !t.date).length || 0;
  const timelineCompleteness = totalTimelineSteps > 0 
    ? Math.round(((totalTimelineSteps - missingTimestamps) / totalTimelineSteps) * 100)
    : 100;

  // Compute Repository Match Strength %
  const matchStrength = Math.min((health.scrb_matches_count * 25), 100);

  // Compute Overall Investigation Readiness
  const readiness = Math.round((health.progress + health.coverage + timelineCompleteness) / 3);

  const metrics = [
    { label: "Case Health Score", value: health.progress, color: "#10b981", isPercentage: true, desc: "Factual parameters integrity status" },
    { label: "Evidence Coverage", value: health.coverage, color: "#06b6d4", isPercentage: true, desc: "Expected vs present evidence checklist" },
    { label: "Timeline Completeness", value: timelineCompleteness, color: "#f59e0b", isPercentage: true, desc: "Chrono alignment audit completeness" },
    { label: "Repository Match Strength", value: matchStrength, color: "#a855f7", isPercentage: true, desc: "Historical overlaps & precedents correlation" },
    { label: "Contradiction Count", value: health.contradiction_count, color: "#f43f5e", isPercentage: false, desc: "Total timeline / amount conflicts detected" },
    { label: "Pending Questions", value: health.questions_remaining, color: "#0ea5e9", isPercentage: false, desc: "Total remaining unanswered officer queries" },
    { label: "Overall Readiness", value: readiness, color: "#6366f1", isPercentage: true, desc: "Weighted overall readiness rating" }
  ];

  return (
    <div className="glass px-4 py-2.5 rounded-xl border border-slate-800 shrink-0 animate-fadeIn space-y-2">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h4 className="text-[9px] font-bold text-white uppercase font-mono tracking-wider">Investigation Command Center</h4>
          <span className="text-[7px] text-gray-550 font-mono hidden md:inline">— Real-time audit</span>
        </div>
        <span className="text-[8px] bg-indigo-950/60 border border-indigo-800/40 px-2 py-0.5 rounded text-indigo-300 font-mono font-bold">
          Readiness: {readiness}%
        </span>
      </div>

      {/* Compact horizontal metric strip */}
      <div className="flex items-center gap-2 overflow-x-auto pb-0.5 scrollbar-none">
        {metrics.map((m, i) => {
          const radius = 14;
          const stroke = 2.5;
          const normalizedRadius = radius - stroke * 2;
          const circumference = normalizedRadius * 2 * Math.PI;
          const drawVal = m.isPercentage ? m.value : Math.min(m.value * 20, 100);
          const strokeDashoffset = circumference - (drawVal / 100) * circumference;

          // Short label map
          const shortLabels = {
            "Case Health Score": "Case Health",
            "Evidence Coverage": "Evidence",
            "Timeline Completeness": "Timeline",
            "Repository Match Strength": "Repo Match",
            "Contradiction Count": "Conflicts",
            "Pending Questions": "Questions",
            "Overall Readiness": "Readiness"
          };

          return (
            <div
              key={i}
              className="flex flex-col items-center gap-0.5 shrink-0 px-2.5 py-1.5 bg-slate-950/50 border border-slate-800/80 rounded-lg hover:border-slate-700 transition-all duration-200 group cursor-default min-w-[58px]"
              title={m.desc}
            >
              <svg height="32" width="32" className="shrink-0">
                {/* Track */}
                <circle
                  stroke="#1e293b"
                  fill="transparent"
                  strokeWidth={stroke}
                  r={normalizedRadius}
                  cx="16"
                  cy="16"
                />
                {/* Progress */}
                <circle
                  stroke={m.color}
                  fill="transparent"
                  strokeWidth={stroke}
                  strokeDasharray={circumference + ' ' + circumference}
                  style={{ strokeDashoffset }}
                  strokeLinecap="round"
                  r={normalizedRadius}
                  cx="16"
                  cy="16"
                  className="rotate-[-90deg] origin-[16px_16px] transition-all duration-500"
                />
                <text
                  x="16"
                  y="19.5"
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="6.5"
                  fontWeight="bold"
                  fontFamily="monospace"
                >
                  {m.value}{m.isPercentage ? '%' : ''}
                </text>
              </svg>
              <span className="text-[7.5px] text-gray-400 font-mono font-bold text-center leading-tight whitespace-nowrap group-hover:text-white transition-colors">
                {shortLabels[m.label] || m.label}
              </span>
            </div>
          );
        })}

        {/* Divider */}
        <div className="w-px h-10 bg-slate-800 shrink-0 mx-1" />

        {/* Next action inline */}
        <div className="flex-1 min-w-[140px] px-2.5 py-1.5 bg-slate-900/40 border border-slate-800/60 rounded-lg font-mono text-[8.5px] space-y-0.5">
          <span className="text-primary font-bold text-[7.5px] uppercase block">Suggested Next Action</span>
          <span className="text-gray-300 leading-tight line-clamp-2">{health.next_action}</span>
          <span className="text-cyan-400/80 text-[7px] block">
            Gaps: {health.missing_evidence_count} files · QA: {health.questions_remaining} Qs
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── 7. SAVED REPORTS CABINET ──────────────────────────────────────────────
export function SavedReportsCabinet({ currentCase, appendLog }) {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    const getSaved = () => {
      try {
        return JSON.parse(localStorage.getItem('crimelens_saved_briefs') || '[]');
      } catch {
        return [];
      }
    };
    setReports(getSaved());
  }, [currentCase]);

  const handleDownloadReportLocal = (rep) => {
    appendLog(`[Cabinet] Accessed Saved Report: ${rep.filename}`);
    alert(`CrimeLens OS File Vault Node: ${rep.filename} is saved locally. Verify target output brief folders.`);
  };

  return (
    <div className="p-2 space-y-1.5 font-mono text-[10px]">
      {reports.map((rep, idx) => (
        <div
          key={idx}
          onClick={() => handleDownloadReportLocal(rep)}
          className="w-full p-2 rounded border bg-slate-900/30 border-slate-850 hover:bg-slate-900 cursor-pointer flex items-center justify-between text-left transition-all"
        >
          <div className="truncate flex-1 pr-2 space-y-0.5">
            <span className="text-white font-bold block truncate">{rep.filename}</span>
            <span className="text-[8px] text-gray-550 block">Case: {rep.caseId} · {new Date(rep.date).toLocaleDateString()}</span>
          </div>
          <FileText className="w-3.5 h-3.5 text-primary shrink-0" />
        </div>
      ))}

      {reports.length === 0 && (
        <div className="text-[9px] text-gray-600 italic p-2">No briefs exported yet. Click Export Brief PDF to save.</div>
      )}
    </div>
  );
}
