import React, { useState, useMemo } from 'react';
import { MasterDataLists, TransactionHistoryRecord, AssetRecord } from '../../types';
import { calculateNetGoldWeight, calculatePureGoldWeight, FINENESS_MAP, calculateAssetAvailableQuantity, calculateAssetAvailableGrossWeight } from '../../utils/calculations';
import { X, ArrowRight, ArrowLeft, Check, AlertTriangle } from 'lucide-react';
import { TransactionService, ACQUISITION_TRANSACTION_TYPES, EXISTING_ASSET_TRANSACTION_TYPES } from '../../services/TransactionService';
import { getMasterName } from '../../utils/masterData';

interface QuickTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transactions: TransactionHistoryRecord | TransactionHistoryRecord[], newAssets?: AssetRecord | AssetRecord[]) => Promise<void>;
  existingTxCount: number;
  assets: AssetRecord[];
  transactions: TransactionHistoryRecord[];
  masterData?: MasterDataLists;
}

export const QuickTransactionModal: React.FC<QuickTransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  existingTxCount,
  assets,
  transactions,
  masterData
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [txType, setTxType] = useState<TransactionHistoryRecord['type']>('PURCHASE');
  
  const [formData, setFormData] = useState<Partial<TransactionHistoryRecord>>({
    date: new Date().toISOString().split('T')[0],
    assetId: '',
    quantity: 1,
    grossWeightGrams: 0,
    stoneWeightGrams: 0,
    purity: '22K',
    amount: 0,
    details: ''
  });

  const [assetData, setAssetData] = useState<Partial<AssetRecord>>({
    assetName: '',
    assetType: 'Jewellery',
    metal: 'Gold',
    jewelleryCategory: 'Chain',
    purity: '22K',
    owner: '',
    location: ''
  });

  const [errorMsg, setErrorMsg] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const isAcquisition = ACQUISITION_TRANSACTION_TYPES.includes(txType);
  const requiresExistingAsset = EXISTING_ASSET_TRANSACTION_TYPES.includes(txType);

  // Available assets for selection
  const availableAssets = useMemo(() => {
    return assets.filter(a => {
      const qty = calculateAssetAvailableQuantity(a.assetId, transactions);
      return qty > 0;
    });
  }, [assets, transactions]);

  const selectedAsset = useMemo(() => {
    return assets.find(a => a.assetId === formData.assetId);
  }, [formData.assetId, assets]);

  const resetForm = () => {
    setStep(1);
    setErrorMsg('');
    setFormData({
      date: new Date().toISOString().split('T')[0],
      assetId: '',
      quantity: 1,
      grossWeightGrams: 0,
      stoneWeightGrams: 0,
      purity: '22K',
      amount: 0,
      details: ''
    });
    setAssetData({
      assetName: '',
      assetType: 'Jewellery',
      metal: 'Gold',
      jewelleryCategory: 'Chain',
      purity: '22K',
      owner: '',
      location: ''
    });
    setIsSaving(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const nextStep = () => {
    setErrorMsg('');
    
    if (step === 1) {
      if (!txType) return setErrorMsg("Select a transaction type.");
      if (txType === 'ASSET SPLIT' || txType === 'ASSET MERGE') {
        return setErrorMsg("Please use the Advanced Transaction form for complex lifecycle operations like Split or Merge.");
      }
      setStep(2);
    } else if (step === 2) {
      if (isAcquisition) {
        if (!assetData.assetName) return setErrorMsg("Asset Name is required.");
        if (!assetData.owner) return setErrorMsg("Owner is required.");
      } else {
        if (!formData.assetId) return setErrorMsg("Please select an asset.");
      }
      setStep(3);
    } else if (step === 3) {
      // Basic validation handled by service later, but catch basic stuff here
      const error = TransactionService.validateTransaction(formData, isAcquisition, transactions);
      if (error) return setErrorMsg(error);
      
      if (formData.grossWeightGrams && formData.stoneWeightGrams && formData.grossWeightGrams < formData.stoneWeightGrams) {
        return setErrorMsg("Gross weight must be greater than or equal to stone weight.");
      }
      setStep(4);
    }
  };

  
  const handleSave = async () => {
    if (isSaving) return;
    setErrorMsg('');
    setIsSaving(true);

    try {
      const finalTxData = {
        ...formData,
        type: txType,
        weightGrams: formData.grossWeightGrams
      };

      const currentUser = 'System'; // Or get from auth if imported

      if (isAcquisition) {
        const finalAssetData = {
          ...assetData,
          grossWeight: formData.grossWeightGrams,
          stoneWeight: formData.stoneWeightGrams,
          netGoldWeight: calculateNetGoldWeight(formData.grossWeightGrams || 0, formData.stoneWeightGrams || 0),
          purchaseRate: (formData.amount || 0) / (calculateNetGoldWeight(formData.grossWeightGrams || 0, formData.stoneWeightGrams || 0) || 1),
        };
        const { newAsset, transaction } = TransactionService.createAcquisition(finalTxData, finalAssetData, currentUser);
        await onSave(transaction, newAsset);
      } else {
        const asset = assets.find(a => a.assetId === formData.assetId)!;
        const gross = Number(formData.grossWeightGrams || 0);
        const stone = Number(formData.stoneWeightGrams || 0);
        const net = calculateNetGoldWeight(gross, stone);
        const pure = calculatePureGoldWeight(net, asset.purity);
        const qty = Number(formData.quantity || 1);
        const availQty = calculateAssetAvailableQuantity(asset.assetId, transactions);

        if (['OWNER TRANSFER', 'LOCATION TRANSFER'].includes(txType) && qty < availQty) {
          throw new Error("Partial transfers require the Advanced Transaction form.");
        }

        const txId = `TX-2026-${(existingTxCount + 1).toString().padStart(4, '0')}`;

        const tx: TransactionHistoryRecord = {
          ...finalTxData,
          txId,
          date: formData.date || new Date().toISOString().split('T')[0],
          assetName: asset.assetName,
          quantity: qty,
          grossWeightGrams: gross,
          weightGrams: gross,
          stoneWeightGrams: stone,
          netWeightGrams: net,
          fineWeightGrams: pure,
          purity: asset.purity,
          fineness: FINENESS_MAP[asset.purity],
          amount: Number(formData.amount || 0),
          performedBy: currentUser
        } as any;

        await onSave(tx);
      }
      
      resetForm();
      onClose();
    } catch (error: any) {
      setErrorMsg(error.message || "Failed to save transaction.");
      setIsSaving(false);
    }
  };


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-sm sm:items-center sm:p-0">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-indigo-600 px-4 py-3 flex justify-between items-center text-white shrink-0">
          <div>
            <h2 className="text-lg font-bold">Quick Entry</h2>
            <div className="text-xs text-indigo-200">Step {step} of 4</div>
          </div>
          <button onClick={handleClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-800">What type of transaction?</h3>
              <div className="grid grid-cols-2 gap-3">
                {['PURCHASE', 'SALE', 'GIFT RECEIVED', 'GIFT GIVEN', 'OWNER TRANSFER', 'LOCATION TRANSFER'].map(t => (
                  <button
                    key={t}
                    onClick={() => { setTxType(t as any); setStep(2); }}
                    className={`p-3 text-sm font-medium rounded-xl border text-left flex flex-col gap-1 transition-all ${
                      txType === t 
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-600' 
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <span>{t}</span>
                  </button>
                ))}
              </div>
              <p className="text-xs text-slate-500 mt-4">
                Note: For Split, Merge, or detailed Stone management, please use the Advanced Transaction form.
              </p>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-800">Select Asset Context</h3>
              
              {isAcquisition ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">New Asset Name</label>
                    <input 
                      type="text" 
                      value={assetData.assetName} 
                      onChange={e => setAssetData({...assetData, assetName: e.target.value})}
                      placeholder="e.g. Gold Chain 22K"
                      className="w-full border-slate-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Owner</label>
                    <select 
                      value={assetData.owner} 
                      onChange={e => setAssetData({...assetData, owner: e.target.value})}
                      className="w-full border-slate-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
                    >
                      <option value="">Select Owner</option>
                      {masterData?.owners.map(o => (
                        <option key={o.id} value={o.id}>{o.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                      <select 
                        value={assetData.jewelleryCategory} 
                        onChange={e => setAssetData({...assetData, jewelleryCategory: e.target.value as any})}
                        className="w-full border-slate-300 rounded-lg p-2 border"
                      >
                        {masterData?.categories.map(c => (
                          <option key={c.id} value={c.name}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Purity</label>
                      <select 
                        value={assetData.purity} 
                        onChange={e => setAssetData({...assetData, purity: e.target.value as any})}
                        className="w-full border-slate-300 rounded-lg p-2 border"
                      >
                        {masterData?.purities.map(p => (
                          <option key={p.id} value={p.karat}>{p.karat}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Select Existing Asset</label>
                  <select 
                    value={formData.assetId} 
                    onChange={e => setFormData({...formData, assetId: e.target.value})}
                    className="w-full border-slate-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3 border"
                  >
                    <option value="">Select Asset...</option>
                    {availableAssets.map(a => (
                      <option key={a.assetId} value={a.assetId}>
                        {a.assetName} ({calculateAssetAvailableGrossWeight(a, transactions)}g available)
                      </option>
                    ))}
                  </select>
                  
                  {selectedAsset && selectedAsset.stones && selectedAsset.stones.length > 0 && (
                     <div className="mt-3 p-3 bg-amber-50 text-amber-800 rounded-lg text-xs">
                        <strong>Note:</strong> This asset has {selectedAsset.stones.length} detailed stone record(s). These records will be safely preserved.
                     </div>
                  )}
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-800">Transaction Details</h3>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                <input 
                  type="date" 
                  value={formData.date} 
                  onChange={e => setFormData({...formData, date: e.target.value})}
                  className="w-full border-slate-300 rounded-lg p-2 border focus:border-indigo-500 focus:ring-indigo-500" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Gross Wt (g)</label>
                  <input 
                    type="number" step="0.01" 
                    value={formData.grossWeightGrams || ''} 
                    onChange={e => setFormData({...formData, grossWeightGrams: Number(e.target.value)})}
                    placeholder="0.00"
                    className="w-full border-slate-300 rounded-lg p-3 border font-mono text-lg focus:border-indigo-500 focus:ring-indigo-500" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Stone Wt (g)</label>
                  <input 
                    type="number" step="0.01" 
                    value={formData.stoneWeightGrams || ''} 
                    onChange={e => setFormData({...formData, stoneWeightGrams: Number(e.target.value)})}
                    placeholder="0.00"
                    className="w-full border-slate-300 rounded-lg p-3 border font-mono text-lg focus:border-indigo-500 focus:ring-indigo-500" 
                  />
                </div>
              </div>

              {(txType === 'PURCHASE' || txType === 'SALE') && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Total Amount (₹)</label>
                  <input 
                    type="number" 
                    value={formData.amount || ''} 
                    onChange={e => setFormData({...formData, amount: Number(e.target.value)})}
                    placeholder="0"
                    className="w-full border-slate-300 rounded-lg p-3 border font-mono text-lg focus:border-indigo-500 focus:ring-indigo-500" 
                  />
                </div>
              )}

              {txType === 'OWNER TRANSFER' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">New Owner</label>
                  <select 
                    value={formData.newOwner || ''} 
                    onChange={e => setFormData({...formData, newOwner: e.target.value})}
                    className="w-full border-slate-300 rounded-lg p-3 border focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    <option value="">Select New Owner</option>
                    {masterData?.owners.map(o => (
                      <option key={o.id} value={o.id}>{o.name}</option>
                    ))}
                  </select>
                </div>
              )}
              
              {txType === 'LOCATION TRANSFER' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">New Location</label>
                  <select 
                    value={formData.location || ''} 
                    onChange={e => setFormData({...formData, location: e.target.value})}
                    className="w-full border-slate-300 rounded-lg p-3 border focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    <option value="">Select New Location</option>
                    {masterData?.locations.map(o => (
                      <option key={o.id} value={o.id}>{o.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-800">Review & Save</h3>
              
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                <div className="flex justify-between pb-2 border-b border-slate-200">
                  <span className="text-slate-500 text-sm">Type</span>
                  <span className="font-medium text-slate-900">{txType}</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-slate-200">
                  <span className="text-slate-500 text-sm">Asset</span>
                  <span className="font-medium text-slate-900">{isAcquisition ? assetData.assetName : selectedAsset?.assetName}</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-slate-200">
                  <span className="text-slate-500 text-sm">Date</span>
                  <span className="font-medium text-slate-900">{formData.date}</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="block text-slate-500 text-xs uppercase mb-1">Gross Wt</span>
                    <span className="font-mono font-medium">{formData.grossWeightGrams} g</span>
                  </div>
                  <div>
                    <span className="block text-slate-500 text-xs uppercase mb-1">Stone Wt</span>
                    <span className="font-mono font-medium text-amber-600">{formData.stoneWeightGrams} g</span>
                  </div>
                  <div>
                    <span className="block text-slate-500 text-xs uppercase mb-1">Net Gold</span>
                    <span className="font-mono font-bold text-emerald-600">
                      {calculateNetGoldWeight(formData.grossWeightGrams || 0, formData.stoneWeightGrams || 0).toFixed(3)} g
                    </span>
                  </div>
                  <div>
                    <span className="block text-slate-500 text-xs uppercase mb-1">Purity</span>
                    <span className="font-mono font-medium">{isAcquisition ? assetData.purity : selectedAsset?.purity}</span>
                  </div>
                </div>
                {(txType === 'PURCHASE' || txType === 'SALE') && (
                  <div className="flex justify-between pt-2 border-t border-slate-200">
                    <span className="text-slate-500 text-sm">Amount</span>
                    <span className="font-bold text-slate-900 font-mono">₹{formData.amount?.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-4 py-3 sm:px-6 flex justify-between shrink-0">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1 as any)}
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          ) : (
            <div /> // Spacer
          )}
          
          {step < 4 ? (
            <button
              onClick={nextStep}
              className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm flex items-center gap-1.5"
            >
              Next <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors shadow-sm flex items-center gap-1.5"
            >
              {isSaving ? (
                <>Saving...</>
              ) : (
                <><Check className="w-4 h-4" /> Confirm & Save</>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
