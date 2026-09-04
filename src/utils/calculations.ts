import { 
  PurityKarat, 
  PurityMaster, 
  AssetRecord, TransactionHistoryRecord, 
  ValidationIssue 
} from '../types';

export const PURITY_MASTER_DATA: PurityMaster[] = [
  { karat: '24K', fineness: 999, percentage: 99.9, description: 'Pure Gold (Bullion/Minted Bars, 99.9%)' },
  { karat: '22K', fineness: 916, percentage: 91.67, description: 'Standard Jewellery Hallmark (91.6% purity)' },
  { karat: '21K', fineness: 875, percentage: 87.5, description: 'Arabian / Middle Eastern Standard (87.5%)' },
  { karat: '20K', fineness: 833, percentage: 83.33, description: 'Antique & Vintage Standard (83.33%)' },
  { karat: '18K', fineness: 750, percentage: 75.0, description: 'Diamond & Gemstone Setting Gold (75.0%)' },
  { karat: '14K', fineness: 585, percentage: 58.5, description: 'Western Daily Wear & Durable (58.5%)' },
  { karat: '10K', fineness: 417, percentage: 41.7, description: 'Entry Grade Minimum Karat (41.7%)' }
];

export const FINENESS_MAP: Record<PurityKarat, number> = {
  '24K': 999,
  '22K': 916,
  '21K': 875,
  '20K': 833,
  '18K': 750,
  '14K': 585,
  '10K': 417
};

export const KARAT_FROM_FINENESS = (fineness: number): PurityKarat => {
  if (fineness >= 990) return '24K';
  if (fineness >= 900) return '22K';
  if (fineness >= 850) return '21K';
  if (fineness >= 800) return '20K';
  if (fineness >= 700) return '18K';
  if (fineness >= 550) return '14K';
  return '10K';
};

/**
 * Formula: Net Gold Weight = Gross Weight - Stone Weight
 */
export const calculateNetGoldWeight = (grossWeight: number, stoneWeight: number = 0, otherNonGoldWeight: number = 0): number => {
  const net = Number((grossWeight - (stoneWeight || 0) - (otherNonGoldWeight || 0)).toFixed(3));
  return net > 0 ? net : 0;
};

/**
 * Formula: Pure Gold Weight (24K Equivalent) = Net Gold Weight * (Fineness / 1000)
 * Or = Net Gold Weight * (Karat / 24)
 */
export const calculatePureGoldWeight = (netGoldWeight: number, purity: PurityKarat | number): number => {
  let fineness = 916;
  if (typeof purity === 'string') {
    fineness = FINENESS_MAP[purity] || 916;
  } else {
    fineness = purity > 24 ? purity : Math.round((purity / 24) * 1000);
  }
  const pure = Number((netGoldWeight * (fineness / 1000)).toFixed(3));
  return pure > 0 ? pure : 0;
};

/**
 * Computes asset dynamic valuation:
 * - Net Gold Weight
 * - Pure Gold Weight
 * - Total Purchase Cost
 */
export const calculateAssetValuation = (
  asset: Partial<AssetRecord>
): {
  netGoldWeight: number;
  pureGoldWeight: number;
  totalPurchaseCost: number;
} => {
  const gross = Number(asset.grossWeight ?? 0) || 0;
  const stone = Number(asset.stoneWeight ?? 0) || 0;
  const other = Number(asset.otherNonGoldWeight ?? 0) || 0;
  const netGoldWeight = calculateNetGoldWeight(gross, stone, other);
  const purity = (asset.purity as PurityKarat) || '22K';
  const pureGoldWeight = calculatePureGoldWeight(netGoldWeight, purity);
  
  const purchaseRate = Number(asset.purchaseRate ?? 0) || 0;
  const goldValue = Number((netGoldWeight * purchaseRate).toFixed(2)) || 0;
  const makingCharges = Number(asset.makingCharges ?? 0) || 0;
  const otherCharges = Number(asset.otherCharges ?? 0) || 0;
  const gst = Number(asset.gst ?? 0) || 0;
  const totalPurchaseCost = Number((goldValue + makingCharges + otherCharges + gst).toFixed(2)) || 0;

  return {
    netGoldWeight,
    pureGoldWeight,
    totalPurchaseCost
  };
};

/**
 * Validates the entire workbook and returns a comprehensive list of validation issues.
 * Implements all 15 QA rules.
 */
import { MasterDataLists } from "../types";

export const runAuditAndValidation = (
  assets: AssetRecord[],
  transactions: TransactionHistoryRecord[],
  masterData?: MasterDataLists
): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];

  // 1. Check Asset ID duplicates
  const assetIdCounts = new Map<string, number>();
  assets.forEach(a => {
    assetIdCounts.set(a.assetId, (assetIdCounts.get(a.assetId) || 0) + 1);
  });

  const txIdCounts = new Map<string, number>();
  transactions.forEach(t => {
    txIdCounts.set(t.txId, (txIdCounts.get(t.txId) || 0) + 1);
  });

  assets.forEach(a => {
    if ((assetIdCounts.get(a.assetId) || 0) > 1) {
      issues.push({
        id: `ERR-DUP-AST-${a.assetId}`,
        type: 'ERROR',
        sheet: 'ASSET REGISTER',
        recordId: a.assetId,
        field: 'Asset ID',
        message: `Duplicate Asset ID "${a.assetId}" detected.`,
        recommendation: 'Each asset must have a unique identifier.'
      });
    }

    // 2. Negative weight checks
    if (a.grossWeight <= 0) {
      issues.push({
        id: `ERR-WT-NEG-${a.assetId}`,
        type: 'ERROR',
        sheet: 'ASSET REGISTER',
        recordId: a.assetId,
        field: 'Gross Weight',
        message: `Asset "${a.assetName}" has non-positive gross weight (${a.grossWeight}g).`,
        recommendation: 'Gross weight must be greater than 0.'
      });
    }

    if (a.stoneWeight < 0) {
      issues.push({
        id: `ERR-STN-NEG-${a.assetId}`,
        type: 'ERROR',
        sheet: 'ASSET REGISTER',
        recordId: a.assetId,
        field: 'Stone Weight',
        message: `Stone weight is negative (${a.stoneWeight}g).`,
        recommendation: 'Stone weight cannot be negative.'
      });
    }
    
    if ((a.otherNonGoldWeight || 0) < 0) {
      issues.push({
        id: `ERR-OTH-NEG-${a.assetId}`,
        type: 'ERROR',
        sheet: 'ASSET REGISTER',
        recordId: a.assetId,
        field: 'Other Non-Gold Weight',
        message: `Other Non-Gold Weight is negative (${a.otherNonGoldWeight}g).`,
        recommendation: 'Weight cannot be negative.'
      });
    }

    
    if (a.stones && Array.isArray(a.stones)) {
      let calcStoneGrams = 0;
      a.stones.forEach((stone, i) => {
        if (!stone.stoneType) {
          issues.push({
            id: `ERR-STN-TYPE-${a.assetId}-${i}`,
            type: 'ERROR', sheet: 'ASSET REGISTER', recordId: a.assetId, field: 'Stone Type',
            message: `Stone record ${i+1} is missing a stone type.`,
            recommendation: 'Select a valid stone type.'
          });
        }
        if (stone.weight < 0 || stone.quantity < 0) {
          issues.push({
            id: `ERR-STN-NEG-QTY-${a.assetId}-${i}`,
            type: 'ERROR', sheet: 'ASSET REGISTER', recordId: a.assetId, field: 'Stone Quantity/Weight',
            message: `Stone record ${i+1} has negative quantity or weight.`,
            recommendation: 'Quantity and weight must be positive.'
          });
        }
        if (stone.weightUnit === 'g') {
          calcStoneGrams += (stone.weight || 0);
        } else if (stone.weightUnit === 'ct' && stone.physicalWeightGrams) {
          calcStoneGrams += (stone.physicalWeightGrams || 0);
        }
      });
      // Optionally warn if calcStoneGrams doesn't match a.stoneWeight? We won't strictly error since legacy may differ
    }

    if ((a.stoneWeight + (a.otherNonGoldWeight || 0)) >= a.grossWeight && a.grossWeight > 0) {
      issues.push({
        id: `ERR-STN-EXCEED-${a.assetId}`,
        type: 'ERROR',
        sheet: 'ASSET REGISTER',
        recordId: a.assetId,
        field: 'Non-Gold Weight',
        message: `Combined non-gold weight (${(a.stoneWeight + (a.otherNonGoldWeight || 0))}g) is equal to or exceeds gross weight (${a.grossWeight}g).`,
        recommendation: 'Non-gold weight must be strictly less than gross weight for a gold item.'
      });
    }
    
    if (a.netGoldWeight < 0) {
      issues.push({
        id: `ERR-NET-NEG-${a.assetId}`,
        type: 'ERROR',
        sheet: 'ASSET REGISTER',
        recordId: a.assetId,
        field: 'Net Gold Weight',
        message: `Net gold weight is negative (${a.netGoldWeight}g).`,
        recommendation: 'Net gold weight cannot be negative.'
      });
    }

    
    // Extra Step 22 Audits

    const currentInventory = calculateAssetInventory(a, transactions);
    
    // Negative inventory checks
    if (currentInventory.quantity < 0) {
      issues.push({
        id: `ERR-INV-QTY-NEG-${a.assetId}`,
        type: 'ERROR', sheet: 'ASSET REGISTER', recordId: a.assetId, field: 'Quantity',
        message: `Asset ${a.assetId} has negative available quantity (${currentInventory.quantity}).`,
        recommendation: 'Reconcile transactions so quantity >= 0.'
      });
    }
    if (currentInventory.gross < 0) {
      issues.push({
        id: `ERR-INV-GROSS-NEG-${a.assetId}`,
        type: 'ERROR', sheet: 'ASSET REGISTER', recordId: a.assetId, field: 'Gross Weight',
        message: `Asset ${a.assetId} has negative available gross weight (${currentInventory.gross}g).`,
        recommendation: 'Reconcile transactions so gross weight >= 0.'
      });
    }
    if (currentInventory.stone < 0) {
      issues.push({
        id: `ERR-INV-STONE-NEG-${a.assetId}`,
        type: 'ERROR', sheet: 'ASSET REGISTER', recordId: a.assetId, field: 'Stone Weight',
        message: `Asset ${a.assetId} has negative available stone weight (${currentInventory.stone}g).`,
        recommendation: 'Reconcile transactions so stone weight >= 0.'
      });
    }
    if (currentInventory.net < 0) {
      issues.push({
        id: `ERR-INV-NET-NEG-${a.assetId}`,
        type: 'ERROR', sheet: 'ASSET REGISTER', recordId: a.assetId, field: 'Net Weight',
        message: `Asset ${a.assetId} has negative available net weight (${currentInventory.net}g).`,
        recommendation: 'Reconcile transactions so net weight >= 0.'
      });
    }
    if (currentInventory.fine < 0) {
      issues.push({
        id: `ERR-INV-FINE-NEG-${a.assetId}`,
        type: 'ERROR', sheet: 'ASSET REGISTER', recordId: a.assetId, field: 'Fine Weight',
        message: `Asset ${a.assetId} has negative available fine weight (${currentInventory.fine}g).`,
        recommendation: 'Reconcile transactions so fine weight >= 0.'
      });
    }

    // Lifecycle checks
    if (a.status === 'Sold' && currentInventory.quantity > 0) {
      issues.push({
        id: `ERR-LIFE-DISP-${a.assetId}`,
        type: 'ERROR', sheet: 'ASSET REGISTER', recordId: a.assetId, field: 'Status',
        message: `Asset ${a.assetId} is Disposed but has available quantity (${currentInventory.quantity}).`,
        recommendation: 'Correct asset status or add disposal transactions.'
      });
    }


    // 3. Ownership % check
    if (a.ownershipPct !== 100) {
      issues.push({
        id: `WARN-OWN-${a.assetId}`,
        type: a.ownershipPct > 100 ? 'ERROR' : 'WARNING',
        sheet: 'ASSET REGISTER',
        recordId: a.assetId,
        field: 'Ownership %',
        message: `Ownership percentage is ${a.ownershipPct}% (Expected 100%).`,
        recommendation: 'Total ownership across owners should sum to exactly 100%.'
      });
    }

    // 4. Missing location
    if (!a.location) {
      issues.push({
        id: `WARN-LOC-${a.assetId}`,
        type: 'WARNING',
        sheet: 'ASSET REGISTER',
        recordId: a.assetId,
        field: 'Location',
        message: `Asset "${a.assetName}" has no assigned physical location.`,
        recommendation: 'Assign a secure location such as Bank Locker or Home Safe.'
      });
    }
  });

  // 6. Transaction Engine Validations
  transactions.forEach(t => {
    if ((txIdCounts.get(t.txId) || 0) > 1) {
      issues.push({
        id: `ERR-DUP-TX-${t.txId}`,
        type: 'ERROR',
        sheet: 'TRANSACTIONS',
        recordId: t.txId,
        field: 'Transaction ID',
        message: `Duplicate Transaction ID "${t.txId}".`,
        recommendation: 'Each transaction must have a unique ID.'
      });
    }
    
    if (!t.date) {
      issues.push({
        id: `ERR-DATE-REQ-${t.txId}`,
        type: 'ERROR',
        sheet: 'TRANSACTIONS',
        recordId: t.txId,
        field: 'Transaction Date',
        message: `Transaction ${t.txId} is missing a date.`,
        recommendation: 'Transaction Date is required.'
      });
    }
    
    if (!t.assetId) {
      issues.push({
        id: `ERR-AST-REQ-${t.txId}`,
        type: 'ERROR',
        sheet: 'TRANSACTIONS',
        recordId: t.txId,
        field: 'Asset ID',
        message: `Transaction ${t.txId} is missing an Asset ID.`,
        recommendation: 'Asset ID is required.'
      });
    }

    
    if (t.weightGrams < 0) {
      issues.push({
        id: `ERR-TX-WT-NEG-${t.txId}`,
        type: 'ERROR',
        sheet: 'TRANSACTIONS',
        recordId: t.txId,
        field: 'Weight',
        message: `Transaction ${t.txId} has a negative weight (${t.weightGrams}g).`,
        recommendation: 'Transaction weight cannot be negative.'
      });
    } else if (t.weightGrams === 0 && t.type !== 'LOCATION TRANSFER' && t.type !== 'OWNER TRANSFER') {
       issues.push({
        id: `WARN-TX-WT-ZERO-${t.txId}`,
        type: 'WARNING',
        sheet: 'TRANSACTIONS',
        recordId: t.txId,
        field: 'Weight',
        message: `Transaction ${t.txId} has 0g weight.`,
        recommendation: 'A purchase/sale typically requires a positive quantity.'
      });
    }

    
    // Extra Transaction Relational Checks
    if (t.type === 'REVERSAL' && !t.originalTxId) {
      issues.push({
        id: `ERR-REV-MISSING-${t.txId}`,
        type: 'ERROR', sheet: 'TRANSACTIONS', recordId: t.txId, field: 'Original Tx ID',
        message: `Reversal ${t.txId} is missing originalTxId.`,
        recommendation: 'Provide originalTxId for Reversal.'
      });
    }
    if (t.type === 'REVERSAL' && t.originalTxId) {
       const orig = transactions.find(x => x.txId === t.originalTxId);
       if (!orig) {
         issues.push({
           id: `ERR-REV-ORPHAN-${t.txId}`,
           type: 'ERROR', sheet: 'TRANSACTIONS', recordId: t.txId, field: 'Original Tx ID',
           message: `Reversal ${t.txId} refers to unknown originalTxId ${t.originalTxId}.`,
           recommendation: 'Reversal must refer to an existing transaction.'
         });
       }
    }
    if (t.type === 'ASSET SPLIT' && (!t.splitIntoAssetIds || t.splitIntoAssetIds.length === 0)) {
       issues.push({
         id: `ERR-SPLIT-CHILDREN-${t.txId}`,
         type: 'ERROR', sheet: 'TRANSACTIONS', recordId: t.txId, field: 'Split Into',
         message: `Split ${t.txId} has no target child assets.`,
         recommendation: 'Split must define target child assets.'
       });
    }
    if (t.type === 'ASSET MERGE' && (!t.mergedFromAssetIds || t.mergedFromAssetIds.length === 0)) {
       issues.push({
         id: `ERR-MERGE-TARGET-${t.txId}`,
         type: 'ERROR', sheet: 'TRANSACTIONS', recordId: t.txId, field: 'Merged From',
         message: `Merge ${t.txId} has no target merged asset.`,
         recommendation: 'Merge must define the target merged asset.'
       });
    }


    const assetExists = assets.some(a => a.assetId === t.assetId);
    if (!assetExists && t.assetId) {
      issues.push({
        id: `ERR-ORPHAN-TX-${t.txId}`,
        type: 'ERROR',
        sheet: 'TRANSACTIONS',
        recordId: t.txId,
        field: 'Asset ID',
        message: `Transaction ${t.txId} refers to unknown Asset ID "${t.assetId}".`,
        recommendation: 'Transaction must refer to an existing asset.'
      });
    }
    
    if (t.type === 'OWNER TRANSFER' && t.fromPerson === t.newOwner && t.fromPerson) {
      issues.push({
        id: `ERR-OWN-SAME-${t.txId}`,
        type: 'ERROR',
        sheet: 'TRANSACTIONS',
        recordId: t.txId,
        field: 'Owner',
        message: `Owner Transfer ${t.txId} has the same sender and receiver.`,
        recommendation: 'Sender and Receiver must be different.'
      });
    }
    
    if (t.type === 'LOCATION TRANSFER' && t.location === t.details /* basic hack */) {
      issues.push({
        id: `WARN-LOC-SAME-${t.txId}`,
        type: 'WARNING',
        sheet: 'TRANSACTIONS',
        recordId: t.txId,
        field: 'Location',
        message: `Location Transfer ${t.txId} might have no location change.`,
        recommendation: 'Verify location change.'
      });
    }
  });

  // Calculate dynamic quantities to find negative inventory
  const availabilityMap = new Map<string, number>();
  
  // Sort transactions chronologically
  const sortedTxs = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  sortedTxs.forEach(tx => {
    const w = Number(tx.weightGrams) || 0;
    let current = availabilityMap.get(tx.assetId) || 0;
    
    current += getTransactionNetWeightImpact(tx.type, w);
    
    if (current < -0.001) {
      issues.push({
        id: `ERR-NEG-INV-${tx.txId}`,
        type: 'ERROR',
        sheet: 'TRANSACTIONS',
        recordId: tx.txId,
        field: 'Quantity',
        message: `Transaction ${tx.txId} caused inventory for ${tx.assetId} to drop below zero (${current.toFixed(3)}g).`,
        recommendation: 'Inventory cannot be negative. Ensure purchases precede sales/gifts.'
      });
    }
    
    availabilityMap.set(tx.assetId, current);
  });

  
  // 6. Master Data Validation
  if (masterData) {
    // Helper to check if a reference is valid
    const isRefValid = (list: any[], id: string) => {
      if (!id) return true; // Optional fields might be empty, handled elsewhere if required
      if (list.length > 0 && typeof list[0] === 'string') {
        return list.includes(id);
      }
      return list.some(item => item.id === id);
    };

    const isRefActive = (list: any[], id: string) => {
      if (!id) return true;
      if (list.length > 0 && typeof list[0] === 'string') {
        return true; // Strings don't have active/inactive
      }
      const record = list.find(item => item.id === id);
      return record ? record.isActive : true; // If not found, handled by isRefValid
    };

    assets.forEach(a => {
      // Check Owner
      if (!isRefValid(masterData.owners, a.owner)) {
        issues.push({
          id: `ERR-MST-OWN-${a.assetId}`,
          type: 'WARNING', // Warning because we allow legacy strings
          sheet: 'ASSET REGISTER',
          recordId: a.assetId,
          field: 'Owner',
          message: `Owner "${a.owner}" is not a recognized master data reference.`,
          recommendation: 'Update asset to use a valid owner from Master Data.'
        });
      } else if (!isRefActive(masterData.owners, a.owner)) {
         issues.push({
          id: `WARN-MST-OWN-INACTIVE-${a.assetId}`,
          type: 'WARNING',
          sheet: 'ASSET REGISTER',
          recordId: a.assetId,
          field: 'Owner',
          message: `Owner "${a.owner}" is marked as Inactive in Master Data.`,
          recommendation: 'Consider updating asset to an active owner.'
        });
      }

      // Check Location
      if (!isRefValid(masterData.locations, a.location)) {
        issues.push({
          id: `ERR-MST-LOC-${a.assetId}`,
          type: 'WARNING',
          sheet: 'ASSET REGISTER',
          recordId: a.assetId,
          field: 'Location',
          message: `Location "${a.location}" is not a recognized master data reference.`,
          recommendation: 'Update asset to use a valid location from Master Data.'
        });
      }
      
      // Check Category
      if (!isRefValid(masterData.categories, a.jewelleryCategory)) {
        issues.push({
          id: `ERR-MST-CAT-${a.assetId}`,
          type: 'WARNING',
          sheet: 'ASSET REGISTER',
          recordId: a.assetId,
          field: 'Category',
          message: `Category "${a.jewelleryCategory}" is not a recognized master data reference.`,
          recommendation: 'Update asset to use a valid category from Master Data.'
        });
      }
    });
  }


  // 5. Lifecycle Integrity Checks (Phase 7)
  transactions.forEach(tx => {
    // Parent/Child valid
    if (tx.type === 'ASSET SPLIT' && tx.splitIntoAssetIds) {
      tx.splitIntoAssetIds.forEach(childId => {
        if (!assets.find(a => a.assetId === childId)) {
          issues.push({
            id: `ERR-ORPHAN-CHILD-${tx.txId}-${childId}`,
            type: 'ERROR',
            sheet: 'TRANSACTIONS',
            recordId: tx.txId,
            field: 'splitIntoAssetIds',
            message: `Split transaction references child asset ${childId} that does not exist.`,
            recommendation: 'Ensure child asset exists in register.'
          });
        }
      });
    }

    if (tx.type === 'ASSET MERGE' && tx.mergedFromAssetIds) {
      tx.mergedFromAssetIds.forEach(sourceId => {
        if (!assets.find(a => a.assetId === sourceId)) {
          issues.push({
            id: `ERR-MISSING-SOURCE-${tx.txId}-${sourceId}`,
            type: 'ERROR',
            sheet: 'TRANSACTIONS',
            recordId: tx.txId,
            field: 'mergedFromAssetIds',
            message: `Merge transaction references source asset ${sourceId} that does not exist.`,
            recommendation: 'Ensure source asset exists in register.'
          });
        }
      });
    }

    // Circular/Orphan handling could be more complex, but we'll flag Reversal target checks
    if (tx.type === 'REVERSAL' && tx.originalTxId) {
       if (!transactions.find(t => t.txId === tx.originalTxId)) {
          issues.push({
            id: `ERR-REV-MISSING-${tx.txId}`,
            type: 'ERROR',
            sheet: 'TRANSACTIONS',
            recordId: tx.txId,
            field: 'originalTxId',
            message: `Reversal references missing original transaction ${tx.originalTxId}.`,
            recommendation: 'Ensure original transaction exists.'
          });
       }
    }

    if (tx.type === 'CORRECTION' && tx.originalTxId) {
       if (!transactions.find(t => t.txId === tx.originalTxId)) {
          issues.push({
            id: `ERR-COR-MISSING-${tx.txId}`,
            type: 'ERROR',
            sheet: 'TRANSACTIONS',
            recordId: tx.txId,
            field: 'originalTxId',
            message: `Correction references missing original transaction ${tx.originalTxId}.`,
            recommendation: 'Ensure original transaction exists.'
          });
       }
    }
  });

  return issues;
};



/**
 * Calculates asset aging and holding period (GT-146, GT-147, GT-148).
 */
export const calculateAssetAging = (purchaseDateStr: string, asOfDateStr: string = '2026-08-24'): {
  days: number;
  months: number;
  years: number;
  isLongTerm: boolean; // > 10 years (GT-147)
  isShortTerm: boolean; // < 1 year (GT-148)
  categoryLabel: string;
} => {
  if (!purchaseDateStr) {
    return { days: 0, months: 0, years: 0, isLongTerm: false, isShortTerm: true, categoryLabel: 'Unrecorded' };
  }
  const pDate = new Date(purchaseDateStr);
  const cDate = new Date(asOfDateStr);
  const diffTime = Math.max(0, cDate.getTime() - pDate.getTime());
  const days = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const years = Number((days / 365.25).toFixed(2));
  const months = Math.floor(days / 30.4375);

  const isLongTerm = years >= 10;
  const isShortTerm = years < 1;
  const categoryLabel = isLongTerm 
    ? 'Long-Term (>10 Yrs)' 
    : isShortTerm 
      ? 'Short-Term (<1 Yr)' 
      : 'Medium-Term (1-10 Yrs)';

  return { days, months, years, isLongTerm, isShortTerm, categoryLabel };
};

/**
 * Calculates asset appreciation and depreciation (GT-149, GT-150).
 */


/**
 * Calculates the available quantity for an asset based on Transaction History.
 * 
 * Rules:
 * - Positive: PURCHASE, GIFT RECEIVED, INHERITANCE RECEIVED, CORRECTION (if amount > 0)
 * - Negative: SALE, GIFT GIVEN, INHERITANCE TRANSFERRED, CORRECTION (if amount < 0)
 * - No Change: OWNER TRANSFER, LOCATION TRANSFER, REVERSAL, ASSET SPLIT, ASSET MERGE
 */







/**
 * Calculates the categorical Inventory Impact (IN, OUT, NO IMPACT, ADJUSTMENT)
 * Point 51 in functional specs.
 */
export const getTransactionInventoryImpact = (type: string): 'IN' | 'OUT' | 'NO IMPACT' | 'ADJUSTMENT' | 'TRANSFER' => {
  switch (type) {
    case 'PURCHASE':
    case 'OPENING BALANCE':
    case 'GIFT RECEIVED':
    case 'INHERITANCE RECEIVED':
      return 'IN';
    case 'SALE':
    case 'GIFT GIVEN':
    case 'INHERITANCE TRANSFERRED':
      return 'OUT';
    case 'OWNER TRANSFER':
    case 'LOCATION TRANSFER':
      return 'NO IMPACT';
    case 'CORRECTION':
    case 'REVERSAL':
    case 'ASSET SPLIT':
    case 'ASSET MERGE':
      return 'ADJUSTMENT';
    default:
      return 'NO IMPACT';
  }
};

/**
 * Calculates the Net Weight Impact (numeric) for an individual transaction.
 * Point 52.
 */
export const getTransactionNetWeightImpact = (type: string, weightGrams: number): number => {
  const impact = getTransactionInventoryImpact(type);
  if (impact === 'IN') return weightGrams;
  if (impact === 'OUT') return -weightGrams;
  if (type === 'CORRECTION') return weightGrams; // Assumed signed
  return 0;
};

/**
 * Calculates the Fine Gold Impact for an individual transaction.
 * Point 53.
 */
export const getTransactionFineGoldImpact = (type: string, weightGrams: number, purityFineness: number): number => {
  const netWeight = getTransactionNetWeightImpact(type, weightGrams);
  return Number((netWeight * purityFineness).toFixed(3));
};

export const parsePurityToFineness = (purity: string | undefined | null): number => {
  if (!purity) return 0;
  if (purity.includes('24K')) return 0.999;
  if (purity.includes('22K')) return 0.916;
  if (purity.includes('18K')) return 0.750;
  if (purity.includes('14K')) return 0.583;
  return 0; // fallback
};


export const calculateAssetInventory = (asset: any, transactions: any[]) => {
  const assetTxs = transactions.filter(t => t.assetId === asset.assetId);
  
  let quantity = 0;
  let gross = 0;
  let stone = 0;
  let net = 0;
  let fine = 0;
  
  // Sort chronologically
  const sorted = [...assetTxs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  for (const tx of sorted) {
    if (tx.type === 'REVERSAL') {
       // Look up original tx
       const orig = sorted.find(t => t.txId === tx.originalTxId);
       if (orig) {
         // Apply exact opposite
         quantity -= getTxVal(orig, 'quantity', orig.weightGrams ? null : 1); 
         gross -= getTxVal(orig, 'grossWeightGrams', orig.weightGrams);
         stone -= getTxVal(orig, 'stoneWeightGrams', 0);
         net -= getTxVal(orig, 'netWeightGrams', calculateProratedNet(orig.weightGrams, asset));
         fine -= getTxVal(orig, 'fineWeightGrams', calculateProratedFine(orig.weightGrams, asset));
       }
       continue;
    }
    
    const mult = getTransactionImpactMultiplier(tx.type);
    
    // Explicit Phase 2 values
    let txQty = getTxVal(tx, 'quantity');
    let txGross = getTxVal(tx, 'grossWeightGrams');
    let txStone = getTxVal(tx, 'stoneWeightGrams');
    let txNet = getTxVal(tx, 'netWeightGrams');
    let txFine = getTxVal(tx, 'fineWeightGrams');
    
    // Fallback to Phase 1 values if explicit Phase 2 values are missing
    if (txGross === 0 && tx.weightGrams) {
       txGross = tx.weightGrams;
    }
    if (txNet === 0 && txGross > 0 && tx.weightGrams) {
       txNet = calculateProratedNet(txGross, asset);
    }
    if (txFine === 0 && txNet > 0 && tx.weightGrams) {
       txFine = calculateProratedFine(txGross, asset);
    }
    
    // If it's a phase 1 purchase and quantity wasn't recorded, default to 1
    if (txQty === 0 && tx.type === 'PURCHASE') {
       txQty = 1;
    }
    // For phase 1 sale, if quantity wasn't recorded, prorate based on weight
    if (txQty === 0 && ['SALE', 'GIFT GIVEN'].includes(tx.type) && asset.grossWeight > 0) {
       txQty = txGross / asset.grossWeight;
    }
    
    quantity += (txQty * mult);
    gross += (txGross * mult);
    stone += (txStone * mult);
    net += (txNet * mult);
    fine += (txFine * mult);
  }
  
  return {
    quantity: Number(quantity.toFixed(3)),
    gross: Number(gross.toFixed(3)),
    stone: Number(stone.toFixed(3)),
    net: Number(net.toFixed(3)),
    fine: Number(fine.toFixed(3))
  };
};

const getTxVal = (tx: any, key: string, fallback: number = 0) => {
  return tx[key] !== undefined && tx[key] !== null ? Number(tx[key]) : fallback;
};

const calculateProratedNet = (txGross: number, asset: any) => {
  if (!asset.grossWeight || asset.grossWeight === 0) return txGross;
  return txGross * (asset.netGoldWeight / asset.grossWeight);
};

const calculateProratedFine = (txGross: number, asset: any) => {
  const net = calculateProratedNet(txGross, asset);
  return net * ((asset.fineness || 0) / 1000);
};

export const getTransactionImpactMultiplier = (type: string): number => {
  if (['PURCHASE', 'OPENING BALANCE', 'GIFT RECEIVED', 'INHERITANCE RECEIVED'].includes(type)) return 1;
  if (['SALE', 'GIFT GIVEN', 'INHERITANCE TRANSFERRED'].includes(type)) return -1;
  if (['CORRECTION', 'ASSET SPLIT', 'ASSET MERGE'].includes(type)) return 1; // Deltas
  return 0; // TRANSFER
};


export const calculateAssetAvailableQuantity = (assetId: string, transactions: any[], assetContext?: any): number => {
  // If we don't have assetContext, we just fake one with grossWeight = 0 to avoid breaking old calls
  const asset = assetContext || { assetId, grossWeight: 0, netGoldWeight: 0, fineness: 0 };
  return calculateAssetInventory(asset, transactions).quantity;
};

export const calculateAssetAvailableGrossWeight = (asset: any, transactions: any[]): number => {
  return calculateAssetInventory(asset, transactions).gross;
};

export const calculateAssetAvailableStoneWeight = (asset: any, transactions: any[]): number => {
  return calculateAssetInventory(asset, transactions).stone;
};

export const calculateAssetAvailableNetWeight = (asset: any, transactions: any[]): number => {
  return calculateAssetInventory(asset, transactions).net;
};

export const calculateAssetAvailableFineWeight = (asset: any, transactions: any[]): number => {
  return calculateAssetInventory(asset, transactions).fine;
};


export const reconcileAsset = (assetId: string, assets: any[], transactions: any[]) => {
  const asset = assets.find(a => a.assetId === assetId);
  if (!asset) return null;
  
  const assetTxs = transactions.filter(t => t.assetId === assetId);
  
  let originalQuantity = 0;
  let originalGross = 0;
  let originalStone = 0;
  let originalNet = 0;
  let originalFine = 0;

  // Acquisition txs
  const acqTxs = assetTxs.filter(t => ['PURCHASE', 'OPENING BALANCE', 'GIFT RECEIVED', 'INHERITANCE RECEIVED'].includes(t.type));
  acqTxs.forEach(tx => {
     originalQuantity += Number(tx.quantity || 1);
     originalGross += Number(tx.grossWeightGrams || tx.weightGrams || 0);
     originalStone += Number(tx.stoneWeightGrams || 0);
     let txNet = Number(tx.netWeightGrams || 0);
     if (txNet === 0) txNet = (Number(tx.grossWeightGrams || tx.weightGrams || 0) * (asset.netGoldWeight / (asset.grossWeight || 1)));
     originalNet += txNet;
     let txFine = Number(tx.fineWeightGrams || 0);
     if (txFine === 0) txFine = txNet * (asset.fineness / 1000);
     originalFine += txFine;
  });

  const inventory = calculateAssetInventory(asset, transactions);

  return {
    originalQuantity,
    originalGross,
    originalStone,
    originalNet,
    originalFine,
    currentQuantity: inventory.quantity,
    currentGross: inventory.gross,
    currentStone: inventory.stone,
    currentNet: inventory.net,
    currentFine: inventory.fine,
    quantityDiff: inventory.quantity - originalQuantity,
    grossDiff: inventory.gross - originalGross,
    stoneDiff: inventory.stone - originalStone,
    netDiff: inventory.net - originalNet,
    fineDiff: inventory.fine - originalFine,
    financialValue: inventory.net * (asset.purchaseRate || 0)
  };
};
