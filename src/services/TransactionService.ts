import { AssetRecord, TransactionHistoryRecord, PurityKarat, AssetType, LocationType, OwnerType, MetalType, JewelleryCategory } from '../types';
import { calculateNetGoldWeight, calculatePureGoldWeight, FINENESS_MAP, calculateAssetAvailableQuantity, calculateAssetAvailableGrossWeight } from '../utils/calculations';

/**
 * TransactionService handles all business logic for creating and applying transactions.
 * It is the single source of truth for transaction state changes.
 */

// ACQUISITION types create new assets.
export const ACQUISITION_TRANSACTION_TYPES = ['PURCHASE', 'OPENING BALANCE', 'GIFT RECEIVED', 'INHERITANCE RECEIVED'];

// EXISTING_ASSET types act upon an existing asset.
export const EXISTING_ASSET_TRANSACTION_TYPES = ['SALE', 'GIFT GIVEN', 'INHERITANCE TRANSFERRED', 'OWNER TRANSFER', 'LOCATION TRANSFER', 'CORRECTION', 'REVERSAL', 'ASSET SPLIT', 'ASSET MERGE', 'OTHER'];

export class TransactionService {
  
  /**
   * Validates a transaction before processing.
   */
  static validateTransaction(txData: Partial<TransactionHistoryRecord>, isAcquisition: boolean, existingTransactions: TransactionHistoryRecord[]): string | null {
    if (!txData.type) return "Transaction type is required.";
    if (!isAcquisition && !txData.assetId) return "Asset ID is required for this transaction type.";
    if (Number(txData.weightGrams || 0) <= 0) return "Weight must be greater than zero.";
    
    // Validate available quantity for negative inventory
    if (['SALE', 'GIFT GIVEN', 'INHERITANCE TRANSFERRED'].includes(txData.type)) {
      if (!txData.assetId) return "Asset ID missing for withdrawal.";
      // We should validate whatever they provided. If they provide grossWeight, check grossWeight. If quantity, check quantity.
      // For backward compatibility, txData.weightGrams represents grossWeight.
      
      const assetFake = { assetId: txData.assetId, grossWeight: 0, netGoldWeight: 0, fineness: 0 };
      
      const qtyRemoving = Number(txData.quantity || 0);
      if (qtyRemoving > 0) {
        const currentQty = calculateAssetAvailableQuantity(txData.assetId, existingTransactions, assetFake);
        if (qtyRemoving > currentQty) {
          return `Insufficient available quantity. You are trying to remove ${qtyRemoving} units, but only ${currentQty} is available.`;
        }
      }
      
      const grossRemoving = Number(txData.grossWeightGrams || txData.weightGrams || 0);
      if (grossRemoving > 0) {
         const currentGross = calculateAssetAvailableGrossWeight(assetFake, existingTransactions);
         if (grossRemoving > currentGross) {
            return `Insufficient available gross weight. You are trying to remove ${grossRemoving}g, but only ${currentGross}g is available.`;
         }
      }
    }
    
    return null; // No errors
  }

  /**
   * Creates a new Asset and Transaction for an acquisition event.
   */
  static createAcquisition(
    txData: Partial<TransactionHistoryRecord>, 
    assetData: Partial<AssetRecord>, 
    currentUserEmail: string = 'System'
  ): { newAsset: AssetRecord, transaction: TransactionHistoryRecord } {
    
    const finalAssetId = txData.assetId || `AST-${Date.now().toString().slice(-6)}`;
    const txId = txData.txId || `TX-${Date.now().toString().slice(-6)}`;
    const txDate = txData.date || new Date().toISOString().split('T')[0];
    const txType = txData.type || 'PURCHASE';
    
    const gross = Number(txData.grossWeightGrams ?? txData.weightGrams ?? 0);
    const stone = Number(txData.stoneWeightGrams ?? assetData.stoneWeight ?? 0);
    const net = calculateNetGoldWeight(gross, stone);
    const purity = (txData.purity as PurityKarat) || '22K';
    const fineness = FINENESS_MAP[purity] || 916;
    const pure = calculatePureGoldWeight(net, purity);
            
    const purchaseRate = Number(assetData.purchaseRate || 0);
    const totalPurchaseCost = (txType === 'PURCHASE' || txType === 'GIFT RECEIVED' || txType === 'INHERITANCE RECEIVED') ? Number(txData.amount || 0) : 0;
    
    const assetName = txData.assetName || `${assetData.jewelleryCategory} (${assetData.metal})`;

    const transaction: TransactionHistoryRecord = {
      txId,
      date: txDate,
      type: txType as any,
      assetId: finalAssetId,
      assetName,
      weightGrams: gross, // Back-compat
      quantity: Number(txData.quantity || 1),
      grossWeightGrams: gross,
      stoneWeightGrams: stone,
      netWeightGrams: net,
      fineness: fineness,
      fineWeightGrams: pure,
      purity,
      amount: Number(txData.amount || 0),
      details: txData.details || '',
      performedBy: currentUserEmail,
      fromPerson: txData.fromPerson,
      toPerson: txData.toPerson,
      supplier: txData.supplier,
      buyer: txData.buyer,
      previousOwner: txData.previousOwner,
      newOwner: txData.newOwner,
      location: txData.location,
      documentReference: txData.documentReference || '',
      paymentMode: txData.paymentMode,
      reason: txData.reason
    };

    const newAsset: AssetRecord = {
      assetId: finalAssetId,
      assetName,
      assetType: (assetData.assetType as AssetType) || 'Jewellery',
      metal: (assetData.metal as MetalType) || 'Gold',
      jewelleryCategory: (assetData.jewelleryCategory as JewelleryCategory) || 'Other',
      description: txData.details || '',
      grossWeight: gross,
      stoneWeight: stone,
      netGoldWeight: net,
      purity,
      fineness,
      pureGoldWeight: pure,
      purchaseDate: txDate,
      acquisitionType: txType as any,
      purchaseSource: transaction.supplier || transaction.fromPerson || transaction.previousOwner || '',
      purchaseRate: txType === 'PURCHASE' ? purchaseRate : 0,
      makingCharges: Number(assetData.makingCharges || 0),
      otherCharges: Number(assetData.otherCharges || 0),
      gst: Number(assetData.gst || 0),
      totalPurchaseCost,
      location: (assetData.location as LocationType) || '',
      locker: assetData.locker || '',
      owner: (assetData.owner as OwnerType) || 'Self',
      ownershipPct: 100,
      nominee: assetData.nominee || '',
      status: (assetData.status as any) || 'In Vault',
      notes: txData.details || '',
      documentReference: transaction.documentReference || '',
      lastUpdated: new Date().toISOString(),
      quantityAvailable: net,
      hasInvoice: assetData.hasInvoice || false,
      hasPhoto: assetData.hasPhoto || false,
      hasHallmarkCert: assetData.hasHallmarkCert || false,
      isInherited: txType === 'INHERITANCE RECEIVED',
    };

    return { newAsset, transaction };
  }

  /**
   * Applies an existing-asset transaction to an asset and returns the updated asset.
   */
  static applyTransactionToAsset(
    asset: AssetRecord, 
    transaction: TransactionHistoryRecord, 
    allTransactions: TransactionHistoryRecord[] // Need this to calculate available quantity
  ): AssetRecord {
    
    let updatedAsset = { ...asset, lastUpdated: new Date().toISOString() };
    const allTxsIncludingNew = [transaction, ...allTransactions];

    // 1. Handle withdrawals (Sale, Gift Given, etc)
    if (['SALE', 'GIFT GIVEN', 'INHERITANCE TRANSFERRED'].includes(transaction.type)) {
      const avail = calculateAssetAvailableQuantity(asset.assetId, allTxsIncludingNew);
      const newStatus = avail <= 0 ? 'Sold' : 'Partially Sold';
      updatedAsset.quantityAvailable = avail;
      updatedAsset.status = newStatus as any;
    }

    // 2. Handle Additions/Corrections to quantity
    if (['CORRECTION', 'REVERSAL'].includes(transaction.type)) {
      const avail = calculateAssetAvailableQuantity(asset.assetId, allTxsIncludingNew);
      updatedAsset.quantityAvailable = avail;
      if (avail > 0 && ['Sold', 'Partially Sold'].includes(updatedAsset.status)) {
        updatedAsset.status = 'In Vault'; // Revert status if we get inventory back
      } else if (avail <= 0) {
        updatedAsset.status = 'Sold';
      }
    }

    // 3. Handle Location Change
    if (transaction.type === 'LOCATION TRANSFER' && transaction.location) {
      updatedAsset.location = transaction.location;
    }

    // 4. Handle Owner Change
    if (['OWNER TRANSFER', 'INHERITANCE TRANSFERRED'].includes(transaction.type) && transaction.newOwner) {
      updatedAsset.owner = transaction.newOwner;
    }
    
    // Note: PLEDGE/RELEASE can be added here if/when they exist as transaction types.
    
    return updatedAsset;
  }
}
