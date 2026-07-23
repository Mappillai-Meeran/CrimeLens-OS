import { detectPatterns } from './patternDetection';

/**
 * Command Core — Supervisor Intelligence Dashboard
 * Computes all supervisor-level metrics purely from the Case Core (allCases).
 * Nothing is stored here; all figures are derived in real-time.
 */
export const getCommandCore = (allCases = []) => {
  if (!allCases || allCases.length === 0) {
    return {
      openCases: [], closedCases: [], officerWorkload: [],
      caseReadiness: [], highPriorityCases: [], emergingPatterns: [],
      repeatedEntities: [], recoveredAssets: { total: 0, items: [] },
      investigationHealth: { average: 0, distribution: [] }
    };
  }

  // 1. Open vs Closed Cases
  const openCases = allCases.filter(c => c.status !== 'Closed');
  const closedCases = allCases.filter(c => c.status === 'Closed');

  // 2. Officer Workload — group cases per officer
  const workloadMap = {};
  allCases.forEach(c => {
    const officer = c.officer || 'Unassigned';
    if (!workloadMap[officer]) workloadMap[officer] = { officer, total: 0, open: 0, closed: 0 };
    workloadMap[officer].total++;
    if (c.status === 'Closed') workloadMap[officer].closed++;
    else workloadMap[officer].open++;
  });
  const officerWorkload = Object.values(workloadMap).sort((a, b) => b.total - a.total);

  // 3. Case Readiness — investigation_score bands
  const caseReadiness = allCases.map(c => ({
    id: c.id,
    score: c.investigation_score || 0,
    status: c.status,
    type: c.incident_type,
    band: (c.investigation_score || 0) >= 80 ? 'Ready'
        : (c.investigation_score || 0) >= 50 ? 'In Progress'
        : 'Needs Attention'
  })).sort((a, b) => b.score - a.score);

  // 4. High Priority Cases — Missing Person or Assault, still open
  const HIGH_PRIORITY_TYPES = ['Missing Person', 'Assault', 'Murder', 'Kidnapping'];
  const highPriorityCases = allCases.filter(
    c => HIGH_PRIORITY_TYPES.includes(c.incident_type) && c.status !== 'Closed'
  );

  // 5. Emerging Patterns — from pattern detection service
  const patterns = detectPatterns(allCases);
  const emergingPatterns = patterns
    .filter(p => p.appears_in.length >= 2)
    .sort((a, b) => b.appears_in.length - a.appears_in.length)
    .slice(0, 10);

  // 6. Repeated Entities — flatten all entity fields
  const entityCount = {};
  const entityType = {};
  allCases.forEach(c => {
    const ents = c.entities || {};
    const addEntities = (arr, type) => (arr || []).forEach(val => {
      const key = String(val).trim();
      if (!key) return;
      entityCount[key] = (entityCount[key] || 0) + 1;
      entityType[key] = type;
    });
    addEntities(ents.phones, 'Phone');
    addEntities(ents.upi_ids, 'UPI ID');
    addEntities(ents.bank_accounts, 'Bank Account');
    addEntities(ents.vehicles, 'Vehicle');
    addEntities(ents.names, 'Name');
  });
  const repeatedEntities = Object.entries(entityCount)
    .filter(([, count]) => count >= 2)
    .map(([value, count]) => ({ value, count, type: entityType[value] }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 15);

  // 7. Recovered Assets — from money_trail entries flagged as recovered
  let recoveredTotal = 0;
  const recoveredItems = [];
  allCases.forEach(c => {
    (c.money_trail || []).forEach(tx => {
      if (tx.status === 'Recovered' || tx.recovered) {
        const amt = parseFloat(String(tx.amount || '0').replace(/[^\d.]/g, '')) || 0;
        recoveredTotal += amt;
        recoveredItems.push({ caseId: c.id, description: tx.description || tx.note, amount: tx.amount });
      }
    });
  });
  const recoveredAssets = { total: recoveredTotal, items: recoveredItems };

  // 8. Investigation Health — average score, distribution
  const scores = allCases.map(c => c.investigation_score || 0);
  const avgScore = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  const distribution = [
    { band: 'Ready (≥80%)',      count: scores.filter(s => s >= 80).length },
    { band: 'In Progress (50–79%)', count: scores.filter(s => s >= 50 && s < 80).length },
    { band: 'Needs Attention (<50%)', count: scores.filter(s => s < 50).length }
  ];
  const investigationHealth = { average: avgScore, distribution };

  return {
    openCases,
    closedCases,
    officerWorkload,
    caseReadiness,
    highPriorityCases,
    emergingPatterns,
    repeatedEntities,
    recoveredAssets,
    investigationHealth
  };
};
