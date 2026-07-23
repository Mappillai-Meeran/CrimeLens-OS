// Pattern Detection Engine for CrimeLens AI

export const detectPatterns = (complaints = []) => {
  const entityMap = {
    phones: {},
    upi_ids: {},
    bank_accounts: {},
    vehicles: {},
    urls: {},
    usernames: {}
  };

  // Populate maps with occurrence data
  complaints.forEach((complaint) => {
    const { entities = {}, id, summary, incident_type, created_at } = complaint;
    
    // Helper to extract victim name
    const victimName = entities.names && entities.names.length > 0 
      ? entities.names[0] 
      : "Unknown Subject";

    const dateStr = created_at ? new Date(created_at).toLocaleDateString() : "Unknown Date";

    Object.keys(entityMap).forEach((field) => {
      const values = entities[field] || [];
      values.forEach((val) => {
        if (!val) return;
        const normalizedVal = val.trim();
        if (!normalizedVal) return;

        if (!entityMap[field][normalizedVal]) {
          entityMap[field][normalizedVal] = [];
        }
        
        // Prevent duplicate logs of the same complaint ID
        if (!entityMap[field][normalizedVal].some(item => item.id === id)) {
          entityMap[field][normalizedVal].push({
            id,
            victim: victimName,
            date: dateStr,
            incident_type,
            summary
          });
        }
      });
    });
  });

  const patterns = [];

  // Helper to translate field names to display names
  const getFieldDisplayName = (field) => {
    switch (field) {
      case 'phones': return 'Phone Number';
      case 'upi_ids': return 'UPI ID';
      case 'bank_accounts': return 'Bank Account';
      case 'vehicles': return 'Vehicle Number';
      case 'urls': return 'Website URL';
      case 'usernames': return 'Username';
      default: return 'Entity';
    }
  };

  // Gather patterns where frequency >= 2
  Object.keys(entityMap).forEach((field) => {
    const map = entityMap[field];
    Object.keys(map).forEach((value) => {
      const occurrences = map[value];
      if (occurrences.length >= 2) {
        const frequency = occurrences.length;
        
        // Determine Confidence
        let confidence = "Medium";
        if (frequency >= 3) {
          confidence = "High";
        }

        // Generate Defensive Investigative Assessment
        let assessment = "";
        const entityTypeStr = getFieldDisplayName(field);
        
        if (field === 'phones') {
          assessment = `Possible linked investigation. The phone number ${value} highlights a shared communication channel across multiple complaints. This suggests a potential shared suspect or coordinate ring.`;
        } else if (field === 'upi_ids') {
          assessment = `Possible linked investigation. The UPI address ${value} has been highlighted in multiple transactions. This suggests a possible shared financial endpoint for receiving illicit proceeds.`;
        } else if (field === 'bank_accounts') {
          assessment = `Possible linked investigation. Bank account ${value} appears in multiple financial transfers. This suggests a possible mule account operation or shared beneficiary.`;
        } else if (field === 'vehicles') {
          assessment = `Possible linked investigation. Vehicle plate ${value} has been noted in multiple reports, suggesting possible repeat transport or mobile suspect activity.`;
        } else {
          assessment = `Possible linked investigation. Identical ${entityTypeStr.toLowerCase()} (${value}) registered across different files. This suggests a potential shared threat actor.`;
        }

        patterns.push({
          entity_value: value,
          entity_type: entityTypeStr,
          raw_type: field,
          frequency,
          confidence,
          assessment,
          appears_in: occurrences
        });
      }
    });
  });

  // Sort by frequency (highest first)
  return patterns.sort((a, b) => b.frequency - a.frequency);
};
