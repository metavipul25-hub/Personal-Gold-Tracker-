import React, { useState, useEffect } from 'react';
import { 
  AssetRecord, MasterDataLists, 
  AssetType, 
  JewelleryCategory, 
  PurityKarat, 
  LocationType, 
  OwnerType, 
  AssetStatus,
  MetalType 
} from '../../types';
import { 
  calculateNetGoldWeight, 
  calculatePureGoldWeight, 
  calculateAssetValuation, 
  FINENESS_MAP
} from '../../utils/calculations';
import { X, PlusCircle, CheckCircle2, Calculator, AlertTriangle, Shield, Award, Landmark, FileText } from 'lucide-react';
import { StonesTab } from './StonesTab';

interface AssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (asset: AssetRecord) => Promise<void>;
  editingAsset?: AssetRecord | null;
  existingAssetCount: number;
  masterData?: MasterDataLists;
}

export const AssetModal: React.FC<AssetModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingAsset,
  existingAssetCount,
  masterData
}) => {
  const [activeTab, setActiveTab] = useState<'BASIC' | 'STONES' | 'FINANCIAL' | 'LOCATION_FAMILY' | 'STATUS_COMPLIANCE'>('BASIC');
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState<Partial<AssetRecord>>({
    assetId: `AST-${(existingAssetCount + 1).toString().padStart(3, '0')}`, // Auto-sequence
    assetName: '',
    assetType: 'Jewellery',
    metal: 'Gold',
    jewelleryCategory: 'Necklace',
    description: '',
    grossWeight: 20.0,
    stoneWeight: 0.0,
    purity: '22K',
    fineness: 916,
    purchaseDate: new Date().toISOString().split('T')[0],
    purchaseSource: '',
    purchaseRate: 7200,
    makingCharges: 3500,
    otherCharges: 0,
    gst: 4500,
    location: 'Bank Locker',
    locker: 'SBI Main Branch - Locker #402',
    owner: 'Self',
    ownershipPct: 100,
    nominee: 'Spouse',
    status: 'In Vault',
    notes: '',
    stones: [],
    documentReference: '',
    quantityAvailable: 1,
    huidNumber: '',
    hasInvoice: true,
    hasPhoto: true,
    hasHallmarkCert: true,
    pledgedLoanAmount: 0,
    pledgedLender: '',
    willReference: '',
    isInherited: false,
    generation: 'Gen 2 (Parents / Current)'
  });

  useEffect(() => {
    if (editingAsset) {
      setFormData(editingAsset);
    } else {
      setFormData({
        assetId: `AST-${(existingAssetCount + 1).toString().padStart(3, '0')}`,
        assetName: '',
        assetType: 'Jewellery',
        metal: 'Gold',
        jewelleryCategory: 'Necklace',
        description: '',
        grossWeight: 20.0,
        stoneWeight: 0.0,
        purity: '22K',
        fineness: 916,
        purchaseDate: new Date().toISOString().split('T')[0],
        purchaseSource: '',
        purchaseRate: 7200,
        makingCharges: 3500,
        otherCharges: 0,
        gst: 4500,
        location: 'Bank Locker',
        locker: 'SBI Main Branch - Locker #402',
        owner: 'Self',
        ownershipPct: 100,
        nominee: 'Spouse',
        status: 'In Vault',
        notes: '',
        documentReference: '',
        quantityAvailable: 1,
        huidNumber: '',
        hasInvoice: true,
        hasPhoto: true,
        hasHallmarkCert: true,
        pledgedLoanAmount: 0,
        pledgedLender: '',
        willReference: '',
        isInherited: false,
        generation: 'Gen 2 (Parents / Current)'
      });
    }
  }, [editingAsset, existingAssetCount]);

  if (!isOpen) return null;

  // Real-time calculation derived values
  const gross = Number(formData.grossWeight || 0);
  const stone = Number(formData.stoneWeight || 0);
  const purity = (formData.purity as PurityKarat) || '22K';
  const netWeight = calculateNetGoldWeight(gross, stone);
  const pureWeight = calculatePureGoldWeight(netWeight, purity);
  const purchaseRate = Number(formData.purchaseRate || 0);
  const makingCharges = Number(formData.makingCharges || 0);
  const otherCharges = Number(formData.otherCharges || 0);
  const gst = Number(formData.gst || 0);
  const goldValue = netWeight * purchaseRate;
  const totalPurchaseCost = goldValue + makingCharges + otherCharges + gst;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.assetId || !formData.assetName || gross <= 0 || isNaN(gross) || !isFinite(gross) || isNaN(stone) || !isFinite(stone) || gross < stone) {
      alert('Please provide valid fields. Gross Weight must be positive and >= Stone Weight.');
      return;
    }

    const fullAsset: AssetRecord = {
      assetId: formData.assetId,
      stones: formData.stones || [],
      assetName: formData.assetName,
      assetType: (formData.assetType as AssetType) || 'Jewellery',
      metal: (formData.metal as MetalType) || 'Gold',
      jewelleryCategory: (formData.jewelleryCategory as JewelleryCategory) || 'Necklace',
      description: formData.description || '',
      grossWeight: gross,
      stoneWeight: stone,
      netGoldWeight: netWeight,
      purity: purity,
      fineness: FINENESS_MAP[purity] || 916,
      pureGoldWeight: pureWeight,
      purchaseDate: formData.purchaseDate || new Date().toISOString().split('T')[0],
      purchaseSource: formData.purchaseSource || '',
      purchaseRate: purchaseRate,
      makingCharges: makingCharges,
      otherCharges: otherCharges,
      gst: gst,
      totalPurchaseCost: totalPurchaseCost,
      location: (formData.location as LocationType) || 'Bank Locker',
      locker: formData.locker || '',
      owner: (formData.owner as OwnerType) || 'Self',
      ownershipPct: Number(formData.ownershipPct || 100),
      nominee: formData.nominee || '',
      status: (formData.status as AssetStatus) || 'In Vault',
      notes: formData.notes || '',
      documentReference: formData.documentReference || '',
      lastUpdated: new Date().toISOString().split('T')[0],
      quantityAvailable: Number(formData.quantityAvailable || 1),
      huidNumber: formData.huidNumber || '',
      hasInvoice: Boolean(formData.hasInvoice),
      hasPhoto: Boolean(formData.hasPhoto),
      hasHallmarkCert: Boolean(formData.hasHallmarkCert),
      pledgedLoanAmount: Number(formData.pledgedLoanAmount || 0),
      pledgedLender: formData.pledgedLender || '',
      willReference: formData.willReference || '',
      isInherited: Boolean(formData.isInherited),
      inheritedCostBasis: Number(formData.inheritedCostBasis || 0),
      generation: formData.generation || 'Gen 2 (Parents / Current)',
      physicalAuditStatus: formData.physicalAuditStatus || 'Verified',
      lastAuditDate: formData.lastAuditDate || new Date().toISOString().split('T')[0]
    };

    try {
      setIsSaving(true);
      await onSave(fullAsset);
      onClose();
    } catch (e: any) {
      console.error("Failed to save:", e);
      alert("Failed to save: " + (e.message || "Please retry."));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div id="modal-asset-container" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-4xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-slate-950 border-b border-slate-800 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-400">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">
                {editingAsset ? `Edit Asset: ${editingAsset.assetId}` : 'Register New Precious Metal Asset'}
              </h3>
              <p className="text-xs text-slate-400">
                Auto-computes Net Gold Weight, 24K Pure Equivalent, and Total Acquisition Cost Basis.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 px-4 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('BASIC')}
            className={`py-2.5 px-3 border-b-2 transition-colors cursor-pointer ${activeTab === 'BASIC' ? 'border-amber-400 text-amber-300' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
          >
            1. Core Details & Weight
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('FINANCIAL')}
            className={`py-2.5 px-3 border-b-2 transition-colors cursor-pointer ${activeTab === 'FINANCIAL' ? 'border-amber-400 text-amber-300' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
          >
            2. Acquisition & Making Charges
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('LOCATION_FAMILY')}
            className={`py-2.5 px-3 border-b-2 transition-colors cursor-pointer ${activeTab === 'LOCATION_FAMILY' ? 'border-amber-400 text-amber-300' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
          >
            3. Vault, Owner & Succession
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('STATUS_COMPLIANCE')}
            className={`py-2.5 px-3 border-b-2 transition-colors cursor-pointer ${activeTab === 'STATUS_COMPLIANCE' ? 'border-amber-400 text-amber-300' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
          >
            4. Status, HUID & Documents
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('STONES')}
            className={`py-2.5 px-3 border-b-2 transition-colors cursor-pointer ${activeTab === 'STONES' ? 'border-amber-400 text-amber-300' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
          >
            5. Gemstones / Stones
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-5 overflow-y-auto flex-1 text-xs">
          {/* Real-time Calculation Preview Header */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono">
            <div className="p-2 bg-slate-900/90 rounded border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Net Gold Weight</span>
              <div className="text-base font-bold text-amber-300 mt-0.5">{(netWeight ?? 0).toFixed(3)}g</div>
              <span className="text-[10px] text-slate-500">Gross ({gross}g) - Stone ({stone}g)</span>
            </div>
            <div className="p-2 bg-slate-900/90 rounded border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Pure Gold Equivalent</span>
              <div className="text-base font-bold text-amber-400 mt-0.5">{(pureWeight ?? 0).toFixed(3)}g</div>
              <span className="text-[10px] text-slate-500">{purity} ({FINENESS_MAP[purity] || 916} ‰ fineness)</span>
            </div>
            <div className="p-2 bg-slate-900/90 rounded border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Acquisition Cost</span>
              <div className="text-base font-bold text-blue-300 mt-0.5">₹{(totalPurchaseCost ?? 0).toLocaleString('en-IN')}</div>
              <span className="text-[10px] text-slate-500">Gold + Making + GST</span>
            </div>
          </div>

          {/* TAB 1: Core Details & Weight */}
          {activeTab === 'BASIC' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Asset ID *</label>
                  <input
                    type="text"
                    required
                    disabled
                    value={formData.assetId}
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-lg p-2 text-amber-400/70 font-mono font-bold cursor-not-allowed"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-300 font-medium mb-1">Asset Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MMTC 24K Minted Bar (50g) or 22K Temple Necklace"
                    value={formData.assetName}
                    onChange={(e) => setFormData({ ...formData, assetName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Metal Type</label>
                  <select
                    value={formData.metal}
                    onChange={(e) => setFormData({ ...formData, metal: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:border-amber-500 focus:outline-none"
                  >
                    {masterData?.metalTypes.filter(m => m.isActive).map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Asset Type</label>
                  <select
                    value={formData.assetType}
                    onChange={(e) => setFormData({ ...formData, assetType: e.target.value as AssetType })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:border-amber-500 focus:outline-none"
                  >
                    {masterData?.assetTypes.filter(c => c.isActive).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Category</label>
                  <select
                    value={formData.jewelleryCategory}
                    onChange={(e) => setFormData({ ...formData, jewelleryCategory: e.target.value as JewelleryCategory })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:border-amber-500 focus:outline-none"
                  >
                    {masterData?.categories.filter(c => c.isActive).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              {/* Weight & Purity */}
              <div className="border-t border-slate-800 pt-4">
                <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-3">Weight & Fineness</h4>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Gross Weight (g) *</label>
                    <input
                      type="number"
                      step="0.001"
                      min="0.001"
                      required
                      value={formData.grossWeight}
                      onChange={(e) => setFormData({ ...formData, grossWeight: Number(e.target.value) })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 font-mono text-slate-100 focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Stone Weight (g)</label>
                    <input
                      type="number"
                      step="0.001"
                      min="0"
                      value={formData.stoneWeight}
                      onChange={(e) => setFormData({ ...formData, stoneWeight: Number(e.target.value) })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 font-mono text-slate-100 focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Other Non-Gold Weight (g)</label>
                    <input
                      type="number" step="0.001"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100"
                      value={formData.otherNonGoldWeight || ''}
                      onChange={e => setFormData({ ...formData, otherNonGoldWeight: Number(e.target.value) })}
                      placeholder="e.g. 1.2"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Purity Karat</label>
                    <select
                      value={formData.purity}
                      onChange={(e) => {
                        const newP = e.target.value as PurityKarat;
                        setFormData({ 
                          ...formData, 
                          purity: newP,
                          fineness: FINENESS_MAP[newP],
                          purchaseRate: 7200
                        });
                      }}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:border-amber-500 focus:outline-none"
                    >
                      <option value="24K">24K (999 Pure Bullion)</option>
                      <option value="22K">22K (916 BIS Hallmark)</option>
                      <option value="21K">21K (875 Gulf Standard)</option>
                      <option value="18K">18K (750 Diamond Setting)</option>
                      <option value="14K">14K (585 Western Wear)</option>
                      <option value="10K">10K (417 Entry Grade)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Fineness (‰)</label>
                    <input
                      type="number"
                      disabled
                      value={FINENESS_MAP[purity] || 916}
                      className="w-full bg-slate-950/60 border border-slate-800 rounded-lg p-2 font-mono text-slate-400 cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Item Description / Hallmarks</label>
                <textarea
                  rows={2}
                  placeholder="Detailed description, crafting style, gemstones embedded, hallmark symbols..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* TAB 2: Acquisition & Making Charges */}
          
          {activeTab === 'STONES' && (
            <StonesTab
              stones={formData.stones || []}
              onChange={(stones) => setFormData({ ...formData, stones })}
              masterData={masterData}
            />
          )}

          {activeTab === 'FINANCIAL' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Purchase Date</label>
                  <input
                    type="date"
                    value={formData.purchaseDate}
                    onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Purchase Source / Jeweller</label>
                  <input
                    type="text"
                    placeholder="e.g. Tanishq / MMTC / Malabar"
                    value={formData.purchaseSource}
                    onChange={(e) => setFormData({ ...formData, purchaseSource: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Purchase Rate (/g)</label>
                  <input
                    type="number"
                    value={formData.purchaseRate}
                    onChange={(e) => setFormData({ ...formData, purchaseRate: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 font-mono text-slate-100 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Making Charges (₹)</label>
                  <input
                    type="number"
                    value={formData.makingCharges}
                    onChange={(e) => setFormData({ ...formData, makingCharges: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 font-mono text-slate-100 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Other / Stone Charges (₹)</label>
                  <input
                    type="number"
                    value={formData.otherCharges}
                    onChange={(e) => setFormData({ ...formData, otherCharges: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 font-mono text-slate-100 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">GST Tax (₹)</label>
                  <input
                    type="number"
                    value={formData.gst}
                    onChange={(e) => setFormData({ ...formData, gst: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 font-mono text-slate-100 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800 text-[11px] text-slate-400">
                <span className="font-bold text-amber-400">Total Purchase Cost Breakdown:</span> (Net Gold Weight × Purchase Rate) + Making Charges + Other Charges + GST = <span className="text-white font-mono font-bold">₹{(totalPurchaseCost || 0).toLocaleString('en-IN')}</span>
              </div>
            </div>
          )}

          {/* TAB 3: Vault, Owner & Succession */}
          {activeTab === 'LOCATION_FAMILY' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Location Type</label>
                  <select
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value as LocationType })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:border-amber-500 focus:outline-none"
                  >
                    {masterData?.locations.filter(l => l.isActive).map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-300 font-medium mb-1">Vault / Locker Identifier</label>
                  <input
                    type="text"
                    placeholder="e.g. SBI Main Branch - Locker #402"
                    value={formData.locker}
                    onChange={(e) => setFormData({ ...formData, locker: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Primary Owner</label>
                  <select
                    value={formData.owner}
                    onChange={(e) => setFormData({ ...formData, owner: e.target.value as OwnerType })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:border-amber-500 focus:outline-none"
                  >
                    {masterData?.owners.filter(o => o.isActive).map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Ownership Share (%)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={formData.ownershipPct}
                    onChange={(e) => setFormData({ ...formData, ownershipPct: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 font-mono text-slate-200 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Designated Nominee</label>
                  <input
                    type="text"
                    placeholder="e.g. Priya Sharma (Daughter)"
                    value={formData.nominee}
                    onChange={(e) => setFormData({ ...formData, nominee: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Generational Tier</label>
                  <select
                    value={formData.generation}
                    onChange={(e) => setFormData({ ...formData, generation: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:border-amber-500 focus:outline-none"
                  >
                    <option value="Gen 1 (Ancestral / Grandparents)">Gen 1 (Ancestral / Grandparents)</option>
                    <option value="Gen 2 (Parents / Current)">Gen 2 (Parents / Current)</option>
                    <option value="Gen 3 (Children / Successors)">Gen 3 (Children / Successors)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Legal Will Reference</label>
                  <input
                    type="text"
                    placeholder="e.g. WILL-2024-CL-4A"
                    value={formData.willReference}
                    onChange={(e) => setFormData({ ...formData, willReference: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 font-mono text-slate-200 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 mt-6">
                  <input
                    type="checkbox"
                    id="isInherited"
                    checked={Boolean(formData.isInherited)}
                    onChange={(e) => setFormData({ ...formData, isInherited: e.target.checked })}
                    className="w-4 h-4 rounded text-amber-500 focus:ring-0 bg-slate-950 border-slate-700 cursor-pointer"
                  />
                  <label htmlFor="isInherited" className="text-slate-300 font-medium cursor-pointer">
                    Inherited / Ancestral Heirloom
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Insurance, HUID & Loans */}
          {activeTab === 'STATUS_COMPLIANCE' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Asset Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as AssetStatus })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 focus:border-amber-500 focus:outline-none"
                  >
                    <option value="In Vault">In Vault</option>
                    <option value="At Home">At Home</option>
                    <option value="Pledged">Pledged (Gold Loan)</option>
                    <option value="In Transit">In Transit</option>
                    <option value="Missing / Under Audit">Missing / Under Audit</option>
                    <option value="Lost">Lost</option>
                    <option value="Stolen">Stolen</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Hallmark Unique ID (HUID)</label>
                  <input
                    type="text"
                    placeholder="e.g. HUID-883921-A"
                    value={formData.huidNumber}
                    onChange={(e) => setFormData({ ...formData, huidNumber: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 font-mono text-slate-200 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Invoice Reference #</label>
                  <input
                    type="text"
                    placeholder="e.g. INV-MMTC-882194"
                    value={formData.documentReference}
                    onChange={(e) => setFormData({ ...formData, documentReference: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 font-mono text-slate-200 focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Pledged Loan Amount (₹)</label>
                  <input
                    type="number"
                    value={formData.pledgedLoanAmount}
                    onChange={(e) => setFormData({ ...formData, pledgedLoanAmount: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 font-mono text-slate-200 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Compliance Checkboxes */}
              <div className="border-t border-slate-800 pt-3">
                <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">Compliance Documentation Checklist</h4>
                <div className="flex flex-wrap gap-4 text-slate-300">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(formData.hasInvoice)}
                      onChange={(e) => setFormData({ ...formData, hasInvoice: e.target.checked })}
                      className="rounded text-amber-500 bg-slate-950 border-slate-700"
                    />
                    <span>Original Invoice Attached</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(formData.hasPhoto)}
                      onChange={(e) => setFormData({ ...formData, hasPhoto: e.target.checked })}
                      className="rounded text-amber-500 bg-slate-950 border-slate-700"
                    />
                    <span>High-Res Photograph Attached</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(formData.hasHallmarkCert)}
                      onChange={(e) => setFormData({ ...formData, hasHallmarkCert: e.target.checked })}
                      className="rounded text-amber-500 bg-slate-950 border-slate-700"
                    />
                    <span>BIS Hallmark / Purity Certificate</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Modal Footer */}
          <div className="border-t border-slate-800 pt-4 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-bold rounded-lg transition-colors flex items-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isSaving ? 'Saving...' : (editingAsset ? 'Update Asset Record' : 'Save Asset to Register')}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
