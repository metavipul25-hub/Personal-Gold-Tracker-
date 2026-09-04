import React, { useState } from 'react';
import { MasterDataLists, TransactionHistoryRecord, AssetType, PurityKarat, PaymentMode, LocationType, AssetRecord, OwnerType, JewelleryCategory, MetalType } from '../../types';
import { calculateNetGoldWeight, calculatePureGoldWeight, FINENESS_MAP, calculateAssetAvailableQuantity, calculateAssetAvailableGrossWeight } from '../../utils/calculations';
import { X, ArrowRight, ArrowLeft, Check, AlertTriangle, ArrowRightLeft } from 'lucide-react';
import { auth } from '../../lib/firebase';
import { uploadInvoice } from '../../lib/firebaseHooks';
import { TransactionService, ACQUISITION_TRANSACTION_TYPES, EXISTING_ASSET_TRANSACTION_TYPES } from '../../services/TransactionService';
import { getMasterName } from '../../utils/masterData';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transactions: TransactionHistoryRecord | TransactionHistoryRecord[], newAssets?: AssetRecord | AssetRecord[]) => Promise<void>;
  existingTxCount: number;
  assets: AssetRecord[];
  transactions: TransactionHistoryRecord[];
  masterData?: MasterDataLists;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  existingTxCount,
  assets,
  transactions,
  masterData
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [txType, setTxType] = useState<TransactionHistoryRecord['type']>('PURCHASE');
  
  const [formData, setFormData] = useState<Partial<TransactionHistoryRecord>>({
    txId: '',
    date: new Date().toISOString().split('T')[0],
    assetId: '',
    assetName: '',
    weightGrams: 0,
    quantity: 1,
    grossWeightGrams: 0,
    stoneWeightGrams: 0,
    purity: '22K',
    amount: 0,
    details: ''
  });

  const [assetData, setAssetData] = useState<Partial<AssetRecord>>({
    assetType: 'Jewellery',
    metal: 'Gold',
    jewelleryCategory: 'Other',
    location: '',
    owner: '',
    status: 'In Vault',
    stoneWeight: 0,
    ratePerGram: 0,
    makingCharges: 0,
    otherCharges: 0,
    gst: 0
  } as any);

  // Workflow specific states
  const [splitQuantities, setSplitQuantities] = useState<number[]>([1, 1]);
  const [splitGrossWeights, setSplitGrossWeights] = useState<number[]>([0, 0]);
  const [mergeAssetIds, setMergeAssetIds] = useState<string[]>([]);
  
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const requiresExistingAsset = EXISTING_ASSET_TRANSACTION_TYPES.includes(txType);
  const isAcquisition = ACQUISITION_TRANSACTION_TYPES.includes(txType);

  const resetForm = () => {
    setStep(1);
    setErrorMsg('');
    setFormData({
      txId: '',
      date: new Date().toISOString().split('T')[0],
      assetId: '',
      assetName: '',
      weightGrams: 0,
      quantity: 1,
      grossWeightGrams: 0,
      stoneWeightGrams: 0,
      purity: '22K',
      amount: 0,
      details: ''
    });
    setSplitQuantities([1, 1]);
    setSplitGrossWeights([0, 0]);
    setMergeAssetIds([]);
    setInvoiceFile(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const generateTxId = (offset = 1) => `TX-2026-${(existingTxCount + offset).toString().padStart(4, '0')}`;
  const generateAssetId = (offset = 1) => `AST-${(Date.now() + offset).toString().slice(-6)}`;

  const validateStep2 = () => {
    setErrorMsg('');
    if (requiresExistingAsset && !formData.assetId && txType !== 'ASSET MERGE') {
      setErrorMsg("Please select an asset.");
      return false;
    }
    
    if (txType === 'ASSET MERGE') {
      if (mergeAssetIds.length < 2) {
        setErrorMsg("Please select at least two assets to merge.");
        return false;
      }
      const selectedAssets = assets.filter(a => mergeAssetIds.includes(a.assetId));
      const metal = selectedAssets[0].metal;
      const purity = selectedAssets[0].purity;
      if (!selectedAssets.every(a => a.metal === metal && a.purity === purity)) {
        setErrorMsg("Assets to be merged must have the same Metal and Purity.");
        return false;
      }
    }
    
    if (txType === 'ASSET SPLIT') {
       const asset = assets.find(a => a.assetId === formData.assetId);
       if (!asset) {
          setErrorMsg("Asset not found"); return false;
       }
       const totalQty = splitQuantities.reduce((a, b) => a + Number(b), 0);
       const totalGross = splitGrossWeights.reduce((a, b) => a + Number(b), 0);
       
       if (totalQty !== calculateAssetAvailableQuantity(asset.assetId, transactions)) {
          setErrorMsg(`Split quantities must equal total available quantity.`); return false;
       }
       // We skip strict gross weight equality check if partial split is allowed, but standard split should match exactly
    }

    if (txType === 'REVERSAL') {
      if (!formData.originalTxId) {
        setErrorMsg("Original Transaction ID is required."); return false;
      }
      const orig = transactions.find(t => t.txId === formData.originalTxId);
      if (!orig) {
        setErrorMsg("Transaction not found."); return false;
      }
      if (transactions.some(t => t.type === 'REVERSAL' && t.originalTxId === formData.originalTxId)) {
         setErrorMsg("Transaction is already reversed."); return false;
      }
    }

    // Call service validation for normal fields
    const serviceError = TransactionService.validateTransaction(
      { ...formData, type: txType, assetId: formData.assetId }, 
      isAcquisition, 
      transactions
    );
    if (serviceError && !['ASSET MERGE', 'ASSET SPLIT', 'REVERSAL', 'CORRECTION'].includes(txType)) {
      setErrorMsg(serviceError);
      return false;
    }

    return true;
  };

  const handleNext = () => {
    if (step === 1) setStep(2);
    else if (step === 2) {
      if (validateStep2()) setStep(3);
    }
  };

  const handleSave = async () => {
    setIsUploading(true);
    let finalDocRef = formData.documentReference || '';
    
    if (invoiceFile && (isAcquisition || txType === 'ASSET MERGE' || txType === 'ASSET SPLIT')) {
      try {
        finalDocRef = await uploadInvoice(`DOC-${Date.now()}`, invoiceFile);
      } catch (e) {
        console.error("Failed to upload file", e);
      }
    }

    const txsToSave: TransactionHistoryRecord[] = [];
    const assetsToSave: AssetRecord[] = [];
    const currentUser = auth.currentUser?.email || 'System';

    if (txType === 'ASSET SPLIT') {
      const parentAsset = assets.find(a => a.assetId === formData.assetId)!;
      const childIds = splitQuantities.map((_, i) => generateAssetId(i + 1));
      
      const splitTx: TransactionHistoryRecord = {
        txId: generateTxId(),
        date: formData.date || new Date().toISOString().split('T')[0],
        type: 'ASSET SPLIT',
        assetId: parentAsset.assetId,
        assetName: parentAsset.assetName,
        weightGrams: -parentAsset.grossWeight,
        quantity: -calculateAssetAvailableQuantity(parentAsset.assetId, transactions),
        grossWeightGrams: -parentAsset.grossWeight,
        stoneWeightGrams: -parentAsset.stoneWeight,
        netWeightGrams: -parentAsset.netGoldWeight,
        fineWeightGrams: -parentAsset.pureGoldWeight,
        splitIntoAssetIds: childIds,
        reason: formData.reason,
        details: 'Split into multiple assets',
        performedBy: currentUser
      } as any;
      txsToSave.push(splitTx);

      splitQuantities.forEach((qty, i) => {
        const childId = childIds[i];
        const childGross = Number(splitGrossWeights[i]);
        // proportional stone weight
        const childStone = parentAsset.grossWeight > 0 ? (parentAsset.stoneWeight * (childGross / parentAsset.grossWeight)) : 0;
        
        const childAsset: AssetRecord = {
           ...parentAsset,
           assetId: childId,
           stones: [],
           notes: parentAsset.stones && parentAsset.stones.length > 0 ? (parentAsset.notes + ' [Needs stone reallocation]') : parentAsset.notes,
           assetName: `${parentAsset.assetName} (Part ${i+1})`,
           quantityAvailable: qty,
           grossWeight: childGross,
           stoneWeight: childStone,
           netGoldWeight: calculateNetGoldWeight(childGross, childStone),
           pureGoldWeight: calculatePureGoldWeight(calculateNetGoldWeight(childGross, childStone), parentAsset.purity),
           lastUpdated: new Date().toISOString()
        };
        assetsToSave.push(childAsset);
        
        // Also create an OPENING BALANCE or split child creation tx
        txsToSave.push({
           txId: generateTxId(i + 2),
           date: splitTx.date,
           type: 'OPENING BALANCE', // Or a custom type for child asset
           assetId: childId,
           assetName: childAsset.assetName,
           weightGrams: childGross,
           quantity: qty,
           grossWeightGrams: childGross,
           stoneWeightGrams: childStone,
           netWeightGrams: childAsset.netGoldWeight,
           fineWeightGrams: childAsset.pureGoldWeight,
           purity: childAsset.purity,
           fineness: childAsset.fineness,
           amount: 0,
           reason: 'Result of Asset Split from ' + parentAsset.assetId,
           details: '',
           performedBy: currentUser
        } as any);
      });

    } else if (txType === 'ASSET MERGE') {
       const selectedAssets = assets.filter(a => mergeAssetIds.includes(a.assetId));
       const mergedAssetId = generateAssetId();
       
       let totalQty = 0;
       let totalGross = 0;
       let totalStone = 0;
       
       selectedAssets.forEach(a => {
          totalQty += calculateAssetAvailableQuantity(a.assetId, transactions);
          totalGross += a.grossWeight;
          totalStone += a.stoneWeight;
          
          txsToSave.push({
             txId: generateTxId(txsToSave.length + 1),
             date: formData.date || new Date().toISOString().split('T')[0],
             type: 'ASSET MERGE',
             assetId: a.assetId,
             assetName: a.assetName,
             weightGrams: -a.grossWeight,
             quantity: -calculateAssetAvailableQuantity(a.assetId, transactions),
             grossWeightGrams: -a.grossWeight,
             stoneWeightGrams: -a.stoneWeight,
             netWeightGrams: -a.netGoldWeight,
             fineWeightGrams: -a.pureGoldWeight,
             mergedFromAssetIds: [mergedAssetId], // Use this to track the target
             reason: formData.reason,
             details: 'Merged into ' + mergedAssetId,
             performedBy: currentUser
          } as any);
       });
       
       const mergedAsset: AssetRecord = {
          ...selectedAssets[0],
          assetId: mergedAssetId,
          assetName: formData.assetName || 'Merged Asset',
          quantityAvailable: totalQty,
          grossWeight: totalGross,
          stoneWeight: totalStone,
          netGoldWeight: calculateNetGoldWeight(totalGross, totalStone),
          pureGoldWeight: calculatePureGoldWeight(calculateNetGoldWeight(totalGross, totalStone), selectedAssets[0].purity),
          lastUpdated: new Date().toISOString()
       };
       assetsToSave.push(mergedAsset);
       
       txsToSave.push({
           txId: generateTxId(txsToSave.length + 1),
           date: formData.date || new Date().toISOString().split('T')[0],
           type: 'OPENING BALANCE',
           assetId: mergedAssetId,
           assetName: mergedAsset.assetName,
           weightGrams: totalGross,
           quantity: totalQty,
           grossWeightGrams: totalGross,
           stoneWeightGrams: totalStone,
           netWeightGrams: mergedAsset.netGoldWeight,
           fineWeightGrams: mergedAsset.pureGoldWeight,
           purity: mergedAsset.purity,
           fineness: mergedAsset.fineness,
           amount: 0,
           reason: 'Result of merging assets',
           details: '',
           performedBy: currentUser
       } as any);
       
    } else if (txType === 'REVERSAL') {
       const origTx = transactions.find(t => t.txId === formData.originalTxId)!;
       const revTx: TransactionHistoryRecord = {
          txId: generateTxId(),
          date: formData.date || new Date().toISOString().split('T')[0],
          type: 'REVERSAL',
          assetId: origTx.assetId,
          assetName: origTx.assetName,
          originalTxId: origTx.txId,
          reason: formData.reason,
          details: 'Reversal of ' + origTx.txId,
          performedBy: currentUser,
          quantity: origTx.quantity,
          grossWeightGrams: origTx.grossWeightGrams,
          stoneWeightGrams: origTx.stoneWeightGrams,
          netWeightGrams: origTx.netWeightGrams,
          fineWeightGrams: origTx.fineWeightGrams,
          amount: origTx.amount,
          purity: origTx.purity
       } as any;
       txsToSave.push(revTx);
    } else if (txType === 'CORRECTION') {
       const correctionTx: TransactionHistoryRecord = {
          txId: generateTxId(),
          date: formData.date || new Date().toISOString().split('T')[0],
          type: 'CORRECTION',
          assetId: formData.assetId!,
          assetName: assets.find(a => a.assetId === formData.assetId)?.assetName || '',
          originalTxId: formData.originalTxId,
          reason: formData.reason,
          details: formData.details || '',
          performedBy: currentUser,
          quantity: Number(formData.quantity || 0),
          grossWeightGrams: Number(formData.grossWeightGrams || 0),
          stoneWeightGrams: Number(formData.stoneWeightGrams || 0),
          amount: Number(formData.amount || 0),
          purity: formData.purity as any
       } as any;
       
       if (correctionTx.grossWeightGrams) {
          correctionTx.netWeightGrams = calculateNetGoldWeight(correctionTx.grossWeightGrams, correctionTx.stoneWeightGrams || 0);
          correctionTx.fineWeightGrams = calculatePureGoldWeight(correctionTx.netWeightGrams, correctionTx.purity!);
       }
       
       txsToSave.push(correctionTx);
    } else {
      // Standard Acquistion or Existing Asset Transaction
      let baseTx = { ...formData, type: txType, documentReference: finalDocRef };
      if (isAcquisition) {
         const { newAsset, transaction } = TransactionService.createAcquisition(baseTx, assetData, currentUser);
         txsToSave.push(transaction);
         assetsToSave.push(newAsset);
      } else {
         const asset = assets.find(a => a.assetId === formData.assetId)!;
         const gross = Number(formData.grossWeightGrams || formData.weightGrams || 0);
         const stone = Number(formData.stoneWeightGrams || 0);
         const net = calculateNetGoldWeight(gross, stone);
         const pure = calculatePureGoldWeight(net, asset.purity);
         const qty = Number(formData.quantity || 1);
         const availQty = calculateAssetAvailableQuantity(asset.assetId, transactions);
         
         if (['OWNER TRANSFER', 'LOCATION TRANSFER'].includes(txType) && qty < availQty) {
            // PARTIAL TRANSFER - Automatic Split
            const newAssetId = generateAssetId();
            
            // 1. Split transaction on parent
            txsToSave.push({
               txId: generateTxId(),
               date: formData.date || new Date().toISOString().split('T')[0],
               type: 'ASSET SPLIT',
               assetId: asset.assetId,
               assetName: asset.assetName,
               weightGrams: -gross,
               quantity: -qty,
               grossWeightGrams: -gross,
               stoneWeightGrams: -stone,
               netWeightGrams: -net,
               fineWeightGrams: -pure,
               purity: asset.purity,
               fineness: asset.fineness,
               splitIntoAssetIds: [newAssetId],
               reason: 'Auto-split for partial transfer',
               details: formData.details || '',
               performedBy: currentUser
            } as any);
            
            // 2. New Asset
            const childAsset: AssetRecord = {
               ...asset,
               assetId: newAssetId,
               assetName: `${asset.assetName} (Transfer)`,
               quantityAvailable: qty,
               grossWeight: gross,
               stoneWeight: stone,
               netGoldWeight: net,
               pureGoldWeight: pure,
               owner: txType === 'OWNER TRANSFER' ? formData.newOwner! : asset.owner,
               location: txType === 'LOCATION TRANSFER' ? formData.location! : asset.location,
               lastUpdated: new Date().toISOString()
            };
            assetsToSave.push(childAsset);
            
            // 3. Opening balance for new asset
            txsToSave.push({
               txId: generateTxId(2),
               date: formData.date || new Date().toISOString().split('T')[0],
               type: 'OPENING BALANCE',
               assetId: newAssetId,
               assetName: childAsset.assetName,
               weightGrams: gross,
               quantity: qty,
               grossWeightGrams: gross,
               stoneWeightGrams: stone,
               netWeightGrams: net,
               fineWeightGrams: pure,
               purity: childAsset.purity,
               fineness: childAsset.fineness,
               amount: 0,
               reason: 'Result of partial transfer split',
               details: '',
               performedBy: currentUser
            } as any);
            
         } else {
             const tx: TransactionHistoryRecord = {
                ...baseTx,
                txId: generateTxId(),
                date: formData.date || new Date().toISOString().split('T')[0],
                assetName: asset.assetName,
                quantity: qty,
                grossWeightGrams: gross,
                weightGrams: gross,
                stoneWeightGrams: stone,
                netWeightGrams: net,
                fineWeightGrams: pure,
                purity: asset.purity,
                fineness: asset.fineness,
                performedBy: currentUser,
                details: formData.details || ''
             } as any;
             txsToSave.push(tx);
         }
      }
    }

    try {
      await onSave(txsToSave, assetsToSave);
      resetForm();
    } catch (e: any) {
      console.error("Save failed:", e);
      alert("Save failed: " + (e.message || "Please retry."));
    } finally {
      setIsUploading(false);
    }
  };

  const activeAssets = assets.filter(a => ['In Vault', 'Pledged'].includes(a.status));

  // Options for master data
  const renderMasterOptions = (list: any[] | undefined) => {
    if (!list) return null;
    if (list.length > 0 && typeof list[0] === 'string') {
       return list.map(item => <option key={item} value={item}>{item}</option>);
    }
    return list.filter(i => i.isActive).map(item => <option key={item.id} value={item.id}>{item.name}</option>);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-slate-50">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5 text-emerald-600" />
            Transaction Workflow {step > 1 && `- Step ${step}`}
          </h2>
          <button onClick={handleClose} className="p-1 hover:bg-slate-200 rounded-full text-slate-500 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start gap-2 text-sm font-medium">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Select Operation Type</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { id: 'PURCHASE', label: 'Purchase' },
                  { id: 'SALE', label: 'Sale' },
                  { id: 'GIFT RECEIVED', label: 'Gift Received' },
                  { id: 'GIFT GIVEN', label: 'Gift Given' },
                  { id: 'INHERITANCE RECEIVED', label: 'Inheritance Received' },
                  { id: 'INHERITANCE TRANSFERRED', label: 'Inheritance Transferred' },
                  { id: 'OWNER TRANSFER', label: 'Transfer Owner' },
                  { id: 'LOCATION TRANSFER', label: 'Transfer Location' },
                  { id: 'ASSET SPLIT', label: 'Split Asset' },
                  { id: 'ASSET MERGE', label: 'Merge Assets' },
                  { id: 'CORRECTION', label: 'Correction' },
                  { id: 'REVERSAL', label: 'Reversal' }
                ].map(op => (
                  <button
                    key={op.id}
                    onClick={() => setTxType(op.id as any)}
                    className={`p-3 text-left border rounded-lg transition-all ${txType === op.id ? 'bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500' : 'bg-white border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/50'}`}
                  >
                    <span className={`block text-sm font-medium ${txType === op.id ? 'text-emerald-900' : 'text-gray-700'}`}>{op.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4">
              
              {/* Asset Selection */}
              {requiresExistingAsset && txType !== 'ASSET MERGE' && (
                <div className="col-span-full">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Asset</label>
                  <select 
                    value={formData.assetId || ''} 
                    onChange={e => setFormData({...formData, assetId: e.target.value})}
                    className="w-full border-gray-300 rounded-lg shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                  >
                    <option value="">-- Select Asset --</option>
                    {activeAssets.map(a => (
                      <option key={a.assetId} value={a.assetId}>
                        {a.assetId} - {a.assetName} (Avail: {calculateAssetAvailableQuantity(a.assetId, transactions)})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Merge Assets Selection */}
              {txType === 'ASSET MERGE' && (
                <div className="col-span-full">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Assets to Merge (min 2)</label>
                  <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-2 space-y-2">
                    {activeAssets.map(a => (
                      <label key={a.assetId} className="flex items-center gap-2 text-sm">
                        <input 
                          type="checkbox" 
                          checked={mergeAssetIds.includes(a.assetId)}
                          onChange={(e) => {
                             if (e.target.checked) setMergeAssetIds([...mergeAssetIds, a.assetId]);
                             else setMergeAssetIds(mergeAssetIds.filter(id => id !== a.assetId));
                          }}
                          className="rounded text-emerald-600 focus:ring-emerald-500" 
                        />
                        {a.assetId} - {a.assetName} (Avail: {calculateAssetAvailableQuantity(a.assetId, transactions)})
                      </label>
                    ))}
                  </div>
                  <div className="mt-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">New Merged Asset Name</label>
                    <input type="text" value={formData.assetName || ''} onChange={e => setFormData({...formData, assetName: e.target.value})} className="w-full border-gray-300 rounded-lg shadow-sm focus:border-emerald-500 focus:ring-emerald-500" placeholder="E.g. Combined Coins" />
                  </div>
                </div>
              )}

              {/* Split Definition */}
              {txType === 'ASSET SPLIT' && (
                <div className="col-span-full space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="block text-sm font-medium text-gray-700">Split into parts:</label>
                    <button 
                      onClick={() => { setSplitQuantities([...splitQuantities, 1]); setSplitGrossWeights([...splitGrossWeights, 0]); }}
                      className="text-xs bg-gray-100 px-2 py-1 rounded font-medium text-gray-700 hover:bg-gray-200"
                    >+ Add Part</button>
                  </div>
                  {splitQuantities.map((_, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <div className="flex-1">
                        <label className="block text-xs text-gray-500">Qty for Part {i+1}</label>
                        <input type="number" min="1" value={splitQuantities[i]} onChange={e => {
                          const newQ = [...splitQuantities]; newQ[i] = Number(e.target.value); setSplitQuantities(newQ);
                        }} className="w-full border-gray-300 rounded-lg shadow-sm text-sm" />
                      </div>
                      <div className="flex-1">
                        <label className="block text-xs text-gray-500">Gross Wt (g) for Part {i+1}</label>
                        <input type="number" step="0.01" value={splitGrossWeights[i]} onChange={e => {
                          const newW = [...splitGrossWeights]; newW[i] = Number(e.target.value); setSplitGrossWeights(newW);
                        }} className="w-full border-gray-300 rounded-lg shadow-sm text-sm" />
                      </div>
                      {splitQuantities.length > 2 && (
                         <button onClick={() => {
                            const newQ = [...splitQuantities]; newQ.splice(i, 1); setSplitQuantities(newQ);
                            const newW = [...splitGrossWeights]; newW.splice(i, 1); setSplitGrossWeights(newW);
                         }} className="mt-4 text-red-500 p-1"><X className="w-4 h-4"/></button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Reversal Original Tx */}
              {txType === 'REVERSAL' && (
                <div className="col-span-full">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Original Transaction ID to Reverse</label>
                  <select 
                    value={formData.originalTxId || ''} 
                    onChange={e => setFormData({...formData, originalTxId: e.target.value})}
                    className="w-full border-gray-300 rounded-lg shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                  >
                     <option value="">-- Select Transaction --</option>
                     {transactions.filter(t => t.type !== 'REVERSAL').map(t => (
                        <option key={t.txId} value={t.txId}>{t.txId} - {t.type} on {t.date}</option>
                     ))}
                  </select>
                </div>
              )}

              {/* Quantities & Weights for standard Tx */}
              {!['ASSET MERGE', 'ASSET SPLIT', 'REVERSAL'].includes(txType) && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                    <input type="number" value={formData.quantity || ''} onChange={e => setFormData({...formData, quantity: Number(e.target.value)})} className="w-full border-gray-300 rounded-lg shadow-sm focus:border-emerald-500 focus:ring-emerald-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {isAcquisition ? 'Gross Weight (g)' : 'Gross Weight to move (g)'}
                    </label>
                    <input type="number" step="0.01" value={formData.grossWeightGrams || ''} onChange={e => setFormData({...formData, grossWeightGrams: Number(e.target.value), weightGrams: Number(e.target.value)})} className="w-full border-gray-300 rounded-lg shadow-sm focus:border-emerald-500 focus:ring-emerald-500" />
                  </div>
                  {isAcquisition && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Stone Weight (g)</label>
                      <input type="number" step="0.01" value={formData.stoneWeightGrams || ''} onChange={e => setFormData({...formData, stoneWeightGrams: Number(e.target.value)})} className="w-full border-gray-300 rounded-lg shadow-sm focus:border-emerald-500 focus:ring-emerald-500" />
                    </div>
                  )}
                  {isAcquisition && (
                    <div>
                       <label className="block text-sm font-medium text-gray-700 mb-1">Purity</label>
                       <select value={formData.purity || '22K'} onChange={e => setFormData({...formData, purity: e.target.value as any})} className="w-full border-gray-300 rounded-lg shadow-sm focus:border-emerald-500 focus:ring-emerald-500">
                          {masterData ? renderMasterOptions(masterData.purities) : Object.keys(FINENESS_MAP).map(k => <option key={k} value={k}>{k}</option>)}
                       </select>
                    </div>
                  )}
                </>
              )}

              {/* Owner / Location Transfers */}
              {txType === 'OWNER TRANSFER' && (
                 <>
                   <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">New Owner</label>
                      <select value={formData.newOwner || ''} onChange={e => setFormData({...formData, newOwner: e.target.value})} className="w-full border-gray-300 rounded-lg shadow-sm focus:border-emerald-500 focus:ring-emerald-500">
                         <option value="">-- Select Owner --</option>
                         {masterData ? renderMasterOptions(masterData.owners) : <option value="Self">Self</option>}
                      </select>
                   </div>
                 </>
              )}
              {txType === 'LOCATION TRANSFER' && (
                 <>
                   <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">New Location</label>
                      <select value={formData.location || ''} onChange={e => setFormData({...formData, location: e.target.value as any})} className="w-full border-gray-300 rounded-lg shadow-sm focus:border-emerald-500 focus:ring-emerald-500">
                         <option value="">-- Select Location --</option>
                         {masterData ? renderMasterOptions(masterData.locations) : <option value="Home">Home</option>}
                      </select>
                   </div>
                 </>
              )}
              
              {/* Common Details / Reason */}
              <div className="col-span-full">
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason / Notes</label>
                <input type="text" value={formData.reason || ''} onChange={e => setFormData({...formData, reason: e.target.value})} className="w-full border-gray-300 rounded-lg shadow-sm focus:border-emerald-500 focus:ring-emerald-500" placeholder="Why is this transaction happening?" />
              </div>

              {/* New Asset Specs for Acquisitions */}
              {isAcquisition && (
                <div className="col-span-full mt-4 p-4 bg-slate-50 border border-slate-200 rounded-lg grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <h4 className="col-span-full text-sm font-bold text-slate-700">New Asset Specifications</h4>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Asset Category</label>
                    <select value={assetData.jewelleryCategory || ''} onChange={e => setAssetData({...assetData, jewelleryCategory: e.target.value as any})} className="w-full border-gray-300 rounded-lg shadow-sm text-sm">
                      {masterData ? renderMasterOptions(masterData.categories) : <option value="Necklace">Necklace</option>}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Owner</label>
                    <select value={assetData.owner || ''} onChange={e => setAssetData({...assetData, owner: e.target.value as any})} className="w-full border-gray-300 rounded-lg shadow-sm text-sm">
                      {masterData ? renderMasterOptions(masterData.owners) : <option value="Self">Self</option>}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <select value={assetData.location || ''} onChange={e => setAssetData({...assetData, location: e.target.value as any})} className="w-full border-gray-300 rounded-lg shadow-sm text-sm">
                      {masterData ? renderMasterOptions(masterData.locations) : <option value="Home Safe">Home Safe</option>}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Total Value/Cost</label>
                    <input type="number" value={formData.amount || ''} onChange={e => setFormData({...formData, amount: Number(e.target.value)})} className="w-full border-gray-300 rounded-lg shadow-sm text-sm" placeholder="₹" />
                  </div>
                </div>
              )}

            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-blue-900">
                <h3 className="font-bold text-blue-900 mb-2">Workflow Preview</h3>
                <p className="text-sm mb-4">Please review the details below before confirming the operation.</p>
                
                <div className="grid grid-cols-2 gap-4 text-sm bg-white p-4 rounded-lg shadow-sm border border-blue-100">
                   <div>
                      <span className="block text-xs font-semibold text-gray-500 uppercase">Operation</span>
                      <span className="font-bold">{txType}</span>
                   </div>
                   {formData.assetId && txType !== 'ASSET MERGE' && (
                      <div>
                         <span className="block text-xs font-semibold text-gray-500 uppercase">Target Asset</span>
                         <span className="font-medium">{formData.assetId} - {assets.find(a => a.assetId === formData.assetId)?.assetName || 'New'}</span>
                      </div>
                   )}
                   {txType === 'ASSET SPLIT' && (
                      <div className="col-span-full">
                         <span className="block text-xs font-semibold text-gray-500 uppercase">Splitting Into</span>
                         <ul className="list-disc pl-5 text-gray-700 mt-1">
                            {splitQuantities.map((q, i) => (
                               <li key={i}>Part {i+1}: {q} qty, {splitGrossWeights[i]}g gross</li>
                            ))}
                         </ul>
                      </div>
                   )}
                   {txType === 'ASSET MERGE' && (
                      <div className="col-span-full">
                         <span className="block text-xs font-semibold text-gray-500 uppercase">Merging Assets</span>
                         <ul className="list-disc pl-5 text-gray-700 mt-1">
                            {mergeAssetIds.map((id) => {
                               const a = assets.find(ast => ast.assetId === id);
                               return <li key={id}>{id} - {a?.assetName}</li>;
                            })}
                         </ul>
                      </div>
                   )}
                   {txType === 'REVERSAL' && (
                      <div className="col-span-full">
                         <span className="block text-xs font-semibold text-gray-500 uppercase">Reversing Transaction</span>
                         <span className="font-medium">{formData.originalTxId}</span>
                      </div>
                   )}
                   {['OWNER TRANSFER', 'LOCATION TRANSFER'].includes(txType) && (
                      <div className="col-span-full text-emerald-700 font-medium">
                         Will transfer {formData.quantity} qty ({formData.grossWeightGrams}g) to {txType === 'OWNER TRANSFER' ? getMasterName(masterData?.owners, formData.newOwner) : getMasterName(masterData?.locations, formData.location)}.
                      </div>
                   )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
          {step > 1 ? (
            <button
              onClick={() => setStep((step - 1) as any)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          ) : <div></div>}
          
          {step < 3 ? (
            <button
              onClick={handleNext}
              className="px-6 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg shadow-sm hover:bg-emerald-700 flex items-center gap-2"
            >
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSave}
              disabled={isUploading}
              className="px-6 py-2 text-sm font-bold text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 flex items-center gap-2"
            >
              {isUploading ? 'Processing...' : (
                <><Check className="w-5 h-5" /> Confirm & Execute</>
              )}
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
