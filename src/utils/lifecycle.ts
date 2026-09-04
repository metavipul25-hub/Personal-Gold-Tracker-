import { AssetRecord, TransactionHistoryRecord } from '../types';
import { calculateAssetInventory } from './calculations';

export interface LifecycleEvent {
  txId: string;
  date: string;
  type: string;
  description: string;
  impactQuantity: number;
  impactGross: number;
  impactNet: number;
  impactFine: number;
  balanceQuantity: number;
  balanceGross: number;
  balanceNet: number;
  balanceFine: number;
  owner: string;
  location: string;
  originalTxId?: string;
  details?: string;
}

export interface AssetLifecycle {
  assetId: string;
  assetName: string;
  originTx?: TransactionHistoryRecord;
  originDate: string;
  originType: string;
  originalQuantity: number;
  originalGross: number;
  originalNet: number;
  originalFine: number;
  originalOwner: string;
  originalLocation: string;
  
  timeline: LifecycleEvent[];
  
  currentState: {
    quantity: number;
    gross: number;
    net: number;
    fine: number;
    owner: string;
    location: string;
    status: string;
  };
  
  parentIds: string[]; // From splits or transfers
  mergeSourceIds: string[]; // From merges
  splitIntoIds: string[]; // Did this split into others?
  mergedIntoId?: string; // Did this merge into something else?
}

export const getAssetLifecycle = (
  assetId: string, 
  assets: AssetRecord[], 
  transactions: TransactionHistoryRecord[]
): AssetLifecycle | null => {
  const asset = assets.find(a => a.assetId === assetId);
  if (!asset) return null;
  
  // Sort all txs globally first to ensure chronological order
  const sortedGlobalTxs = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  const assetTxs = sortedGlobalTxs.filter(t => t.assetId === assetId);
  
  // Identify Origin
  let originTx = assetTxs.find(t => ['PURCHASE', 'OPENING BALANCE', 'GIFT RECEIVED', 'INHERITANCE RECEIVED'].includes(t.type));
  if (!originTx && assetTxs.length > 0) {
     originTx = assetTxs[0]; // fallback
  }

  // Identify Relationships
  const parentIds: string[] = [];
  const mergeSourceIds: string[] = [];
  const splitIntoIds: string[] = [];
  let mergedIntoId: string | undefined;

  // Look for splits creating this asset
  sortedGlobalTxs.forEach(t => {
    if (t.type === 'ASSET SPLIT' && t.splitIntoAssetIds?.includes(assetId)) {
      if (!parentIds.includes(t.assetId)) parentIds.push(t.assetId);
    }
    if (t.type === 'ASSET MERGE' && t.mergedFromAssetIds?.includes(assetId)) {
      if (!mergeSourceIds.includes(t.assetId)) mergeSourceIds.push(t.assetId);
    }
  });

  // Look for splits/merges originated by this asset
  assetTxs.forEach(t => {
     if (t.type === 'ASSET SPLIT' && t.splitIntoAssetIds) {
        t.splitIntoAssetIds.forEach(id => {
           if (!splitIntoIds.includes(id)) splitIntoIds.push(id);
        });
     }
     if (t.type === 'ASSET MERGE' && t.mergedFromAssetIds) {
        t.mergedFromAssetIds.forEach(id => {
           mergedIntoId = id;
        });
     }
  });

  // Build Timeline and track running balances
  const timeline: LifecycleEvent[] = [];
  let currentQty = 0;
  let currentGross = 0;
  let currentNet = 0;
  let currentFine = 0;
  let currentOwner = originTx?.newOwner || asset.owner || 'Unknown';
  let currentLocation = originTx?.location || asset.location || 'Unknown';

  assetTxs.forEach(tx => {
    const qty = Number(tx.quantity || 0);
    const gross = Number(tx.grossWeightGrams || tx.weightGrams || 0);
    const net = Number(tx.netWeightGrams || 0);
    const fine = Number(tx.fineWeightGrams || 0);

    currentQty += qty;
    currentGross += gross;
    currentNet += net;
    currentFine += fine;
    
    if (tx.newOwner) currentOwner = tx.newOwner;
    if (tx.location) currentLocation = tx.location;

    timeline.push({
      txId: tx.txId,
      date: tx.date,
      type: tx.type,
      description: tx.reason || tx.details || tx.type,
      impactQuantity: qty,
      impactGross: gross,
      impactNet: net,
      impactFine: fine,
      balanceQuantity: currentQty,
      balanceGross: currentGross,
      balanceNet: currentNet,
      balanceFine: currentFine,
      owner: currentOwner,
      location: currentLocation,
      originalTxId: tx.originalTxId,
      details: tx.details
    });
  });

  return {
    assetId,
    assetName: asset.assetName,
    originTx,
    originDate: originTx?.date || asset.purchaseDate || '',
    originType: originTx?.type || 'UNKNOWN',
    originalQuantity: Number(originTx?.quantity || 1),
    originalGross: Number(originTx?.grossWeightGrams || originTx?.weightGrams || 0),
    originalNet: Number(originTx?.netWeightGrams || 0),
    originalFine: Number(originTx?.fineWeightGrams || 0),
    originalOwner: originTx?.newOwner || originTx?.previousOwner || asset.owner || 'Unknown',
    originalLocation: originTx?.location || asset.location || 'Unknown',
    
    timeline,
    
    currentState: {
      quantity: currentQty,
      gross: currentGross,
      net: currentNet,
      fine: currentFine,
      owner: currentOwner,
      location: currentLocation,
      status: asset.status
    },
    
    parentIds,
    mergeSourceIds,
    splitIntoIds,
    mergedIntoId
  };
};
