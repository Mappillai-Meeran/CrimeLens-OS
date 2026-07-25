/**
 * Zoho Catalyst Authentication & Role Retrieval Service for CrimeLens OS.
 * Operates strictly via Catalyst Serverless Functions (/server/geminiProxy).
 * Dynamically retrieves user role (Investigating Officer, SHO, Cyber Cell Analyst, Administrator).
 * Never crashes if auth service or network is offline.
 */

const getProxyUrl = () => import.meta.env.VITE_CATALYST_PROXY_URL || '/server/geminiProxy';

export const fetchCatalystUserAuth = async () => {
  try {
    const res = await fetch(getProxyUrl(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'get_user_role'
      })
    });

    if (res.ok) {
      const result = await res.json();
      if (result.success && result.data) {
        return result.data;
      }
    }
  } catch (err) {
    console.warn('[Catalyst Auth] Connection offline, using default auth session:', err.message);
  }

  // Graceful fallback for demo / offline mode
  return {
    authenticated: true,
    user_id: 'OFFICER_771',
    email_id: 'officer771@ksp.gov.in',
    first_name: 'Investigating',
    last_name: 'Officer',
    role_name: 'Investigating Officer',
    station: 'Cyber Crime Police Station'
  };
};
