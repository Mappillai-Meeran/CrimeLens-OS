import React, { useState, useEffect } from 'react';
import { fetchCatalystUserAuth } from '../services/catalystAuthService';
import {
  Shield,
  ShieldAlert,
  AlertTriangle,
  Activity,
  TrendingUp,
  MapPin,
  User,
  Phone,
  CreditCard,
  Building,
  Briefcase,
  Layers,
  CheckCircle,
  Clock,
  HelpCircle,
  Lock,
  ChevronDown,
  ChevronUp,
  FileText
} from 'lucide-react';

import {
  getCrimePatternInsights,
  getSocioDemographicInsights,
  getBehavioralProfile,
  getProactiveRecommendations,
  getCrimeTrendDetection,
  getHotspotDetection,
  getPredictiveAnalytics,
  getEarlyWarningAlerts,
  getRoleBasedAccessInfo
} from '../services/kspIntelligenceService';

// ─── 1. CRIME PATTERN INSIGHTS CARD ─────────────────────────────────────────
export function CrimePatternInsightsCard({ currentCase, cases = [] }) {
  const insights = getCrimePatternInsights(currentCase, cases);
  if (!insights) return null;

  return (
    <div className="glass p-4 rounded-xl border border-cyan-900/40 bg-cyan-950/10 shadow-md space-y-3 animate-fadeIn">
      <div className="flex items-center justify-between border-b border-cyan-900/30 pb-2">
        <span className="text-[10px] font-bold text-cyan-400 uppercase font-mono tracking-wider flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-cyan-400" /> Crime Pattern Insights
        </span>
        <span className="text-[8px] bg-cyan-950 border border-cyan-800/40 text-cyan-300 px-2 py-0.5 rounded font-mono">
          Confidence: {insights.confidence}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-[9.5px]">
        <div className="space-y-1 bg-slate-950/60 p-2 rounded border border-slate-850">
          <span className="text-gray-500 uppercase block text-[8px]">Fraud Type</span>
          <span className="text-white font-bold block">{insights.fraud_type}</span>
        </div>

        <div className="space-y-1 bg-slate-950/60 p-2 rounded border border-slate-850">
          <span className="text-gray-500 uppercase block text-[8px]">Payment Method</span>
          <span className="text-amber-400 font-bold block truncate">{insights.payment_method}</span>
        </div>

        <div className="space-y-1 bg-slate-950/60 p-2 rounded border border-slate-850 md:col-span-2">
          <span className="text-gray-500 uppercase block text-[8px]">Modus Operandi</span>
          <span className="text-gray-200 block leading-relaxed">{insights.modus_operandi}</span>
        </div>

        <div className="space-y-1 bg-slate-950/60 p-2 rounded border border-slate-850">
          <span className="text-gray-500 uppercase block text-[8px]">Similar Cases Linkage</span>
          <span className="text-cyan-300 font-bold block">
            {insights.similar_cases_count > 0 
              ? `${insights.similar_cases_count} Case(s) Matched in Registry` 
              : "No Direct Case Overlap"}
          </span>
        </div>

        <div className="space-y-1 bg-slate-950/60 p-2 rounded border border-slate-850">
          <span className="text-gray-500 uppercase block text-[8px]">AI Summary</span>
          <span className="text-gray-300 block truncate">{insights.summary}</span>
        </div>
      </div>
    </div>
  );
}

// ─── 2. SOCIO-DEMOGRAPHIC INSIGHTS CARD ──────────────────────────────────────
export function SocioDemographicCard({ currentCase }) {
  const socio = getSocioDemographicInsights(currentCase);
  if (!socio) return null;

  const renderBadge = (val, color = "text-white") => {
    const isNA = val === "Not Available";
    return (
      <span className={`font-mono text-[9.5px] font-bold ${isNA ? "text-gray-600 italic" : color}`}>
        {val}
      </span>
    );
  };

  return (
    <div className="glass p-3.5 rounded-xl border border-slate-850 space-y-3 animate-fadeIn">
      <div className="flex items-center justify-between border-b border-slate-850 pb-1.5">
        <h3 className="text-[9.5px] font-bold text-white uppercase font-mono tracking-wider flex items-center gap-1.5">
          <User className="w-3.5 h-3.5 text-purple-400" /> Socio-Demographic Insights
        </h3>
        <span className="text-[8px] text-gray-500 font-mono">Demographic Profile</span>
      </div>

      <div className="grid grid-cols-2 gap-2 font-mono text-[9px]">
        <div className="bg-slate-950/70 p-2 rounded border border-slate-850">
          <span className="text-[8px] text-gray-500 uppercase block">Victim Age Group</span>
          {renderBadge(socio.age_group, "text-purple-300")}
        </div>

        <div className="bg-slate-950/70 p-2 rounded border border-slate-850">
          <span className="text-[8px] text-gray-500 uppercase block">Gender</span>
          {renderBadge(socio.gender, "text-purple-300")}
        </div>

        <div className="bg-slate-950/70 p-2 rounded border border-slate-850">
          <span className="text-[8px] text-gray-500 uppercase block">Occupation</span>
          {renderBadge(socio.occupation, "text-cyan-300")}
        </div>

        <div className="bg-slate-950/70 p-2 rounded border border-slate-850">
          <span className="text-[8px] text-gray-500 uppercase block">District</span>
          {renderBadge(socio.district, "text-emerald-300")}
        </div>

        <div className="bg-slate-950/70 p-2 rounded border border-slate-850">
          <span className="text-[8px] text-gray-500 uppercase block">City</span>
          {renderBadge(socio.city, "text-emerald-300")}
        </div>

        <div className="bg-slate-950/70 p-2 rounded border border-slate-850">
          <span className="text-[8px] text-gray-500 uppercase block">Preferred Payment</span>
          {renderBadge(socio.preferred_payment, "text-amber-300")}
        </div>

        <div className="bg-slate-950/70 p-2 rounded border border-slate-850 col-span-2">
          <span className="text-[8px] text-gray-500 uppercase block">Fraud Category</span>
          {renderBadge(socio.fraud_category, "text-rose-400")}
        </div>
      </div>
    </div>
  );
}

// ─── 3. BEHAVIORAL PROFILING CARD ────────────────────────────────────────────
export function BehavioralProfileCard({ currentCase }) {
  const profile = getBehavioralProfile(currentCase);
  if (!profile) return null;

  return (
    <div className="glass p-4 rounded-xl border border-rose-900/40 bg-rose-950/10 space-y-3 animate-fadeIn">
      <div className="flex items-center justify-between border-b border-rose-900/30 pb-2">
        <span className="text-[10px] font-bold text-rose-400 uppercase font-mono tracking-wider flex items-center gap-1.5">
          <ShieldAlert className="w-3.5 h-3.5 text-rose-400" /> Suspect Behavioral Profile
        </span>
        <span className="text-[8px] bg-rose-950 border border-rose-900/40 text-rose-300 px-2 py-0.5 rounded font-mono uppercase font-bold">
          Risk Level: {profile.risk_level}
        </span>
      </div>

      <div className="space-y-2 font-mono text-[9.5px]">
        <div>
          <span className="text-[8px] text-gray-500 uppercase block mb-1">Likely Suspect Tactics & Behaviour</span>
          <div className="space-y-1">
            {profile.likely_behaviors.map((b, i) => (
              <div key={i} className="flex items-start gap-1.5 text-gray-300 bg-slate-950/50 p-1.5 rounded border border-slate-900">
                <span className="text-rose-400 font-bold">•</span>
                <span>{b}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-2 bg-slate-950/70 rounded border border-slate-850 space-y-0.5">
          <span className="text-[8px] text-gray-500 uppercase block">Behavioral Reasoning</span>
          <p className="text-[9px] text-gray-400 leading-relaxed">{profile.reasoning}</p>
        </div>
      </div>
    </div>
  );
}

// ─── 4. PROACTIVE CRIME PREVENTION INTELLIGENCE ──────────────────────────────
export function ProactivePreventionCard({ currentCase }) {
  const recommendations = getProactiveRecommendations(currentCase);
  const [expandedIndex, setExpandedIndex] = useState(null);

  if (!recommendations || recommendations.length === 0) return null;

  return (
    <div className="glass p-4 rounded-xl border border-slate-850 space-y-3 animate-fadeIn">
      <div className="flex items-center justify-between border-b border-slate-850 pb-2">
        <h4 className="text-xs font-bold text-white uppercase font-mono tracking-wider flex items-center gap-1.5">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Proactive Prevention Intelligence
        </h4>
        <span className="text-[8px] bg-emerald-950 border border-emerald-900/30 text-emerald-400 px-2 py-0.5 rounded font-mono">
          {recommendations.length} Immediate Action Items
        </span>
      </div>

      <div className="space-y-2">
        {recommendations.map((rec, idx) => {
          const isExpanded = expandedIndex === idx;
          return (
            <div key={idx} className="bg-slate-950/80 border border-slate-850 rounded p-2.5 space-y-1.5 font-mono text-[9.5px]">
              <div 
                className="flex justify-between items-center cursor-pointer select-none"
                onClick={() => setExpandedIndex(isExpanded ? null : idx)}
              >
                <div className="flex items-center gap-2">
                  <span className={`px-1.5 py-0.5 text-[8px] rounded uppercase font-bold ${
                    rec.urgency === 'Immediate' ? 'bg-rose-950 text-rose-400 border border-rose-900/40' : 'bg-amber-950 text-amber-400 border border-amber-900/40'
                  }`}>
                    {rec.urgency}
                  </span>
                  <span className="text-white font-bold">{rec.action}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-500">
                  <span className="text-[8px] text-cyan-400">{rec.target}</span>
                  {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </div>
              </div>

              {isExpanded && (
                <div className="pt-2 border-t border-slate-900 space-y-1.5 text-[9px]">
                  <p className="text-gray-300 leading-relaxed">{rec.detail}</p>
                  
                  {/* Explainable AI breakdown */}
                  <div className="p-2 bg-slate-900/60 rounded border border-slate-800 space-y-1 text-[8.5px] text-gray-400">
                    <div><span className="text-gray-500 uppercase">Reasoning:</span> Dynamic vector analysis matched active entity indicators.</div>
                    <div><span className="text-gray-500 uppercase">Evidence Used:</span> Extracted complaint narrative and entity mapping.</div>
                    <div><span className="text-gray-500 uppercase">Guideline / Precedent:</span> Standard Operating Procedure (SOP) under IT Act Sec 66D / BNSS Sec 94.</div>
                    <div><span className="text-gray-500 uppercase">Next Action:</span> Serve official electronic notice to nodal officer.</div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── 5. CRIME TREND DETECTION WIDGET ────────────────────────────────────────
export function CrimeTrendWidget({ currentCase, cases = [] }) {
  const trend = getCrimeTrendDetection(currentCase, cases);

  return (
    <div className="glass p-3.5 rounded-xl border border-slate-850 space-y-2.5 animate-fadeIn">
      <div className="flex items-center justify-between border-b border-slate-850 pb-1.5">
        <h4 className="text-[9.5px] font-bold text-white uppercase font-mono tracking-wider flex items-center gap-1.5">
          <TrendingUp className="w-3.5 h-3.5 text-cyan-400" /> Crime Trend Detection
        </h4>
        <span className="text-[8px] text-gray-550 font-mono">Registry Analytics</span>
      </div>

      {!trend.available ? (
        <div className="p-3 text-center text-[9px] font-mono text-gray-500 bg-slate-950/40 rounded border border-dashed border-slate-850">
          ⚠️ {trend.message}
        </div>
      ) : (
        <div className="space-y-2 font-mono text-[9px]">
          <div className="flex justify-between items-center bg-slate-950/70 p-2 rounded border border-slate-850">
            <span className="text-gray-400">Case Frequency:</span>
            <span className="text-white font-bold">{trend.case_frequency}</span>
          </div>

          <div className="flex justify-between items-center bg-slate-950/70 p-2 rounded border border-slate-850">
            <span className="text-gray-400">Trend Direction:</span>
            <span className="text-cyan-300 font-bold">{trend.trend_direction}</span>
          </div>

          <div className="space-y-1">
            <span className="text-[8px] text-gray-500 uppercase block">Top Fraud Types</span>
            {trend.top_fraud_types.map((ft, i) => (
              <div key={i} className="flex justify-between items-center bg-slate-950/40 px-2 py-1 rounded text-[8.5px]">
                <span className="text-gray-300">{ft.type}</span>
                <span className="text-amber-400 font-bold">{ft.count} ({ft.percentage}%)</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── 6. HOTSPOT DETECTION WIDGET ───────────────────────────────────────────
export function HotspotDetectionWidget({ currentCase, cases = [] }) {
  const hotspot = getHotspotDetection(currentCase, cases);

  return (
    <div className="glass p-3.5 rounded-xl border border-slate-850 space-y-2.5 animate-fadeIn">
      <div className="flex items-center justify-between border-b border-slate-850 pb-1.5">
        <h4 className="text-[9.5px] font-bold text-white uppercase font-mono tracking-wider flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-rose-400" /> Hotspot Detection
        </h4>
        <span className="text-[8px] text-gray-550 font-mono">Geographical Intelligence</span>
      </div>

      {!hotspot.available ? (
        <div className="p-3 text-center text-[9px] font-mono text-gray-500 bg-slate-950/40 rounded border border-dashed border-slate-850">
          📍 {hotspot.message}
        </div>
      ) : (
        <div className="space-y-2 font-mono text-[9px]">
          <div className="flex justify-between items-center bg-slate-950/70 p-2 rounded border border-slate-850">
            <span className="text-gray-400">Target Area:</span>
            <span className="text-white font-bold">{hotspot.location}</span>
          </div>

          <div className="flex justify-between items-center bg-slate-950/70 p-2 rounded border border-slate-850">
            <span className="text-gray-400">Hotspot Rating:</span>
            <span className={`font-bold uppercase px-1.5 py-0.5 rounded text-[8px] ${
              hotspot.hotspot_level === 'High' ? 'bg-rose-950 text-rose-400 border border-rose-900/40' : 'bg-amber-950 text-amber-400 border border-amber-900/40'
            }`}>
              {hotspot.hotspot_level}
            </span>
          </div>

          <p className="text-[8.5px] text-gray-400 bg-slate-950/40 p-2 rounded border border-slate-900 leading-relaxed">
            {hotspot.assessment}
          </p>
        </div>
      )}
    </div>
  );
}

// ─── 7. PREDICTIVE ANALYTICS CARD ──────────────────────────────────────────
export function PredictiveAnalyticsCard({ currentCase, cases = [] }) {
  const pred = getPredictiveAnalytics(currentCase, cases);
  if (!pred) return null;

  return (
    <div className="glass p-4 rounded-xl border border-amber-900/40 bg-amber-950/10 space-y-3 animate-fadeIn">
      <div className="flex items-center justify-between border-b border-amber-900/30 pb-2">
        <span className="text-[10px] font-bold text-amber-400 uppercase font-mono tracking-wider flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-amber-400" /> AI Risk Prediction
        </span>
        <span className="text-[8px] bg-amber-950 border border-amber-900/40 text-amber-300 px-2 py-0.5 rounded font-mono uppercase font-bold">
          Risk Score: {pred.risk_score}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2.5 font-mono text-[9px]">
        <div className="bg-slate-950/70 p-2 rounded border border-slate-850">
          <span className="text-[8px] text-gray-500 uppercase block">Repeat Fraud Risk</span>
          <span className="text-amber-300 font-bold block">{pred.repeat_fraud_risk}</span>
        </div>

        <div className="bg-slate-950/70 p-2 rounded border border-slate-850">
          <span className="text-[8px] text-gray-500 uppercase block">Recovery Probability</span>
          <span className="text-cyan-300 font-bold block">{pred.victim_recovery_prob}</span>
        </div>

        <div className="bg-slate-950/70 p-2 rounded border border-slate-850 col-span-2">
          <span className="text-[8px] text-gray-500 uppercase block">Recommended Urgency</span>
          <span className="text-rose-400 font-bold block">{pred.urgency}</span>
        </div>

        <div className="bg-slate-950/70 p-2 rounded border border-slate-850 col-span-2 space-y-0.5">
          <span className="text-[8px] text-gray-500 uppercase block">Explainable Rationale (WHY)</span>
          <p className="text-[8.5px] text-gray-300 leading-relaxed">{pred.why_explanation}</p>
        </div>
      </div>
    </div>
  );
}

// ─── 8. EARLY WARNING ALERTS BANNER ─────────────────────────────────────────
export function EarlyWarningBanner({ currentCase, cases = [] }) {
  const warning = getEarlyWarningAlerts(currentCase, cases);

  if (!warning.alerts || warning.alerts.length === 0) {
    return (
      <div className="glass px-3 py-1.5 rounded-lg border border-slate-850 text-[9px] font-mono text-gray-500 flex items-center gap-1.5">
        <CheckCircle className="w-3 h-3 text-emerald-400" />
        <span>Early Warning Alerts: <strong className="text-gray-400">No active warnings</strong></span>
      </div>
    );
  }

  return (
    <div className="glass px-3 py-2 rounded-lg border border-rose-900/50 bg-rose-950/30 text-[9px] font-mono text-rose-300 space-y-1 animate-pulse">
      <div className="flex items-center justify-between">
        <span className="font-bold uppercase flex items-center gap-1.5 text-rose-400">
          <AlertTriangle className="w-3.5 h-3.5" /> Early Warning Alerts ({warning.alerts.length})
        </span>
        <span className="text-[8px] bg-rose-950 border border-rose-900 px-1.5 rounded text-rose-200">
          CRITICAL REPEAT VECTOR
        </span>
      </div>
      <div className="space-y-0.5">
        {warning.alerts.map((alt, idx) => (
          <div key={idx} className="text-[8.5px] text-rose-200">
            • <strong className="text-white">{alt.type}:</strong> {alt.message}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── 9. ROLE-BASED AUTH BADGE ───────────────────────────────────────────────
export function RoleBasedAuthBadge() {
  const [userRole, setUserRole] = useState('Investigating Officer');
  const [status, setStatus] = useState('Catalyst Auth Ready');

  useEffect(() => {
    let isMounted = true;
    fetchCatalystUserAuth().then(authData => {
      if (isMounted && authData && authData.role_name) {
        setUserRole(authData.role_name);
        setStatus(authData.authenticated ? 'Catalyst Authenticated' : 'Catalyst Auth Ready');
      }
    });
    return () => { isMounted = false; };
  }, []);

  return (
    <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 px-2 py-1 rounded-md text-[8.5px] font-mono">
      <Lock className="w-3 h-3 text-cyan-400" />
      <span className="text-gray-300 font-bold">{userRole}</span>
      <span className="text-gray-600">|</span>
      <span className="text-emerald-400 text-[8px]">{status}</span>
    </div>
  );
}
