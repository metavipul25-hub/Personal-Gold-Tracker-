export const validateAppBackup = (backup: any): { valid: boolean; error?: string } => {
  if (!backup || typeof backup !== 'object') {
    return { valid: false, error: 'Invalid JSON format. Expected an object.' };
  }

  if (backup.version !== 1) {
    return { valid: false, error: 'Unsupported backup version.' };
  }

  if (!backup.data || typeof backup.data !== 'object') {
    return { valid: false, error: 'Missing or invalid "data" object in backup.' };
  }

  const { data } = backup;

  // Validate assets
  if (!Array.isArray(data.assets)) {
    return { valid: false, error: 'Missing or invalid "assets" array.' };
  }
  for (const asset of data.assets) {
    if (typeof asset !== 'object' || asset === null) return { valid: false, error: 'Invalid asset record format.' };
    if (typeof asset.assetId !== 'string') return { valid: false, error: 'Asset missing valid assetId.' };
    
    // Financial data integrity check: reject invalid numeric values for weights and amounts
    if (asset.grossWeight !== undefined && (typeof asset.grossWeight !== 'number' || isNaN(asset.grossWeight) || asset.grossWeight < 0)) {
       return { valid: false, error: `Asset ${asset.assetId} has invalid grossWeight.` };
    }
    if (asset.netGoldWeight !== undefined && (typeof asset.netGoldWeight !== 'number' || isNaN(asset.netGoldWeight) || asset.netGoldWeight < 0)) {
       return { valid: false, error: `Asset ${asset.assetId} has invalid netGoldWeight.` };
    }
  }

  // Validate transactions
  if (!Array.isArray(data.transactions)) {
    return { valid: false, error: 'Missing or invalid "transactions" array.' };
  }
  for (const tx of data.transactions) {
    if (typeof tx !== 'object' || tx === null) return { valid: false, error: 'Invalid transaction record format.' };
    if (typeof tx.txId !== 'string') return { valid: false, error: 'Transaction missing valid txId.' };
    if (typeof tx.assetId !== 'string') return { valid: false, error: 'Transaction missing valid assetId.' };
    
    // Legacy / Phase 1 fallback amounts
    if (tx.amount !== undefined && (typeof tx.amount !== 'number' || isNaN(tx.amount) || tx.amount < 0)) {
       return { valid: false, error: `Transaction ${tx.txId} has invalid amount.` };
    }
    if (tx.weightGrams !== undefined && (typeof tx.weightGrams !== 'number' || isNaN(tx.weightGrams))) {
       return { valid: false, error: `Transaction ${tx.txId} has invalid weightGrams.` };
    }
  }

  // Validate lifeGoals (optional, if present must be array)
  if (data.lifeGoals !== undefined) {
    if (!Array.isArray(data.lifeGoals)) return { valid: false, error: 'Invalid "lifeGoals" array.' };
    for (const lg of data.lifeGoals) {
      if (typeof lg !== 'object' || lg === null) return { valid: false, error: 'Invalid lifeGoal record format.' };
      if (typeof lg.id !== 'string') return { valid: false, error: 'Life goal missing valid id.' };
      if (lg.targetValueINR !== undefined && (typeof lg.targetValueINR !== 'number' || isNaN(lg.targetValueINR))) {
        return { valid: false, error: `Life goal ${lg.id} has invalid targetValueINR.` };
      }
    }
  }

  // Validate sipPlans (optional, if present must be array)
  if (data.sipPlans !== undefined) {
    if (!Array.isArray(data.sipPlans)) return { valid: false, error: 'Invalid "sipPlans" array.' };
    for (const sip of data.sipPlans) {
      if (typeof sip !== 'object' || sip === null) return { valid: false, error: 'Invalid SIP plan record format.' };
      if (typeof sip.id !== 'string') return { valid: false, error: 'SIP plan missing valid id.' };
      if (sip.monthlyAmount !== undefined && (typeof sip.monthlyAmount !== 'number' || isNaN(sip.monthlyAmount) || sip.monthlyAmount < 0)) {
        return { valid: false, error: `SIP plan ${sip.id} has invalid monthlyAmount.` };
      }
    }
  }

  // Check masterData safely
  if (data.masterData && typeof data.masterData !== 'object') {
     return { valid: false, error: 'Invalid masterData format.' };
  }

  return { valid: true };
};
