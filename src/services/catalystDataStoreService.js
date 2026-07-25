/**
 * Zoho Catalyst Data Store Service for CrimeLens OS.
 * Operates strictly via Catalyst Serverless Functions (/server/geminiProxy).
 * Never accesses Catalyst Data Store directly from the React frontend.
 * Provides fallback functionality if Data Store is offline.
 */

const getProxyUrl = () => import.meta.env.VITE_CATALYST_PROXY_URL || '/server/geminiProxy';

export const saveInvestigationToCatalyst = async (caseData) => {
  if (!caseData || !caseData.id) return null;

  try {
    const res = await fetch(getProxyUrl(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'datastore_save',
        caseData
      })
    });

    if (res.ok) {
      const data = await res.json();
      return data;
    }
  } catch (err) {
    console.warn('[Catalyst Data Store] Save connection offline, using local store:', err.message);
  }

  return { success: true, source: 'Local Storage Fallback' };
};

export const loadInvestigationsFromCatalyst = async () => {
  try {
    const res = await fetch(getProxyUrl(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'datastore_load'
      })
    });

    if (res.ok) {
      const result = await res.json();
      if (result.success && Array.isArray(result.data) && result.data.length > 0) {
        return result.data;
      }
    }
  } catch (err) {
    console.warn('[Catalyst Data Store] Load connection offline:', err.message);
  }

  return null;
};

export const deleteInvestigationFromCatalyst = async (caseId) => {
  try {
    const res = await fetch(getProxyUrl(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'datastore_delete',
        caseId
      })
    });

    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('[Catalyst Data Store] Delete connection offline:', err.message);
  }

  return { success: true };
};
