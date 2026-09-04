import React, { useState, useMemo } from 'react';
import { 
  AssetRecord, 
  JewelleryCategory, 
  OwnerType, 
  LocationType, 
  PurityKarat 
} from '../../types';
import { TransactionHistoryRecord } from '../../types';
import { MasterDataLists } from '../../types';
import { getMasterName } from '../../utils/masterData';

import { calculateAssetAvailableQuantity, calculateAssetAvailableNetWeight } from '../../utils/calculations';
import { 
  Search, 
  Filter, 
  PlusCircle, 
  Edit3, 
  Trash2, 
  Info,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

interface AssetRegisterSheetProps {
  masterData?: MasterDataLists;
  transactions: TransactionHistoryRecord[];
  assets: AssetRecord[];
  onSelectCell: (cellCoord: string, formulaOrValue: string, isFormula: boolean) => void;
  onOpenAddAsset: () => void;
  onEditAsset: (asset: AssetRecord) => void;
  onDeleteAsset: (assetId: string) => void;
  onViewLifecycle: (assetId: string) => void;
}

export const AssetRegisterSheet: React.FC<AssetRegisterSheetProps> = ({
  masterData,
  assets,
  transactions,
  onSelectCell,
  onOpenAddAsset,
  onEditAsset,
  onDeleteAsset,
  onViewLifecycle
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedOwner, setSelectedOwner] = useState<string>('ALL');
  const [selectedLocation, setSelectedLocation] = useState<string>('ALL');
  const [selectedPurity, setSelectedPurity] = useState<string>('ALL');
  const [specialFilter, setSpecialFilter] = useState<'ALL' | 'TOP_COST' | 'HEAVY_WEIGHT' | 'LONG_TERM' | 'SHORT_TERM' | 'INHERITED'>('ALL');

  // Identify Highest Cost and Heaviest Asset
  const highestCostAssetId = useMemo(() => {
    if (assets.length === 0) return null;
    return [...assets].sort((a, b) => (b.totalPurchaseCost || 0) - (a.totalPurchaseCost || 0))[0]?.assetId;
  }, [assets]);

  const heaviestAssetId = useMemo(() => {
    if (assets.length === 0) return null;
    return [...assets].sort((a, b) => (b.pureGoldWeight || 0) - (a.pureGoldWeight || 0))[0]?.assetId;
  }, [assets]);

  // Filtered Assets
  const filteredAssets = useMemo(() => {
    const term = (searchTerm || '').toLowerCase();
    let list = assets.filter(a => {
      const matchSearch = !term || 
        (a.assetName || '').toLowerCase().includes(term) ||
        (a.assetId || '').toLowerCase().includes(term) ||
        (a.description || '').toLowerCase().includes(term) ||
        (a.locker || '').toLowerCase().includes(term) ||
        (a.documentReference || '').toLowerCase().includes(term);
      
      const matchCat = selectedCategory === 'ALL' || a.jewelleryCategory === selectedCategory;
      const matchOwner = selectedOwner === 'ALL' || a.owner === selectedOwner;
      const matchLoc = selectedLocation === 'ALL' || a.location === selectedLocation;
      const matchPurity = selectedPurity === 'ALL' || a.purity === selectedPurity;

      return matchSearch && matchCat && matchOwner && matchLoc && matchPurity;
    });

    // Special enterprise views
    if (specialFilter === 'TOP_COST') {
      list = [...list].sort((a, b) => (b.totalPurchaseCost || 0) - (a.totalPurchaseCost || 0)).slice(0, 10);
    } else if (specialFilter === 'HEAVY_WEIGHT') {
      list = [...list].sort((a, b) => (b.pureGoldWeight || 0) - (a.pureGoldWeight || 0)).slice(0, 10);
    } else if (specialFilter === 'LONG_TERM') {
      list = list.filter(a => {
        const pDate = new Date(a.purchaseDate || '2024-01-01');
        const diffYears = (new Date('2026-08-24').getTime() - pDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
        return diffYears >= 10 || a.isInherited;
      });
    } else if (specialFilter === 'SHORT_TERM') {
      list = list.filter(a => {
        const pDate = new Date(a.purchaseDate || '2024-01-01');
        const diffYears = (new Date('2026-08-24').getTime() - pDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
        return diffYears < 1;
      });
    } else if (specialFilter === 'INHERITED') {
      list = list.filter(a => a.isInherited || a.willReference);
    }

    return list;
  }, [assets, searchTerm, selectedCategory, selectedOwner, selectedLocation, selectedPurity, specialFilter]);

  // Totals for filtered assets
  const totalGross = filteredAssets.reduce((sum, a) => sum + (a.grossWeight ?? 0), 0);
  const totalStone = filteredAssets.reduce((sum, a) => sum + (a.stoneWeight ?? 0), 0);
  const totalNet = filteredAssets.reduce((sum, a) => sum + (a.netGoldWeight ?? 0), 0);
  const totalPure = filteredAssets.reduce((sum, a) => sum + (a.pureGoldWeight ?? 0), 0);
  const totalCost = filteredAssets.reduce((sum, a) => sum + (a.totalPurchaseCost ?? 0), 0);
  const totalAvailQty = filteredAssets.reduce((sum, a) => sum + calculateAssetAvailableQuantity(a.assetId, transactions), 0);

  return (
    <div id="sheet-asset-register-container" className="p-4 space-y-4 text-slate-100 flex flex-col h-full">
      {/* Top Filter and Actions Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-sm">
        {/* Search */}
        <div className="flex items-center gap-2 flex-1 min-w-[240px] max-w-md bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-1.5 text-xs">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            id="search-asset-register"
            type="text"
            placeholder="Search by Asset ID, Name, Locker, Invoice #..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent text-slate-100 focus:outline-none placeholder:text-slate-500"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex items-center flex-wrap gap-2 text-xs">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-300 focus:border-amber-500 focus:outline-none"
          >
            <option value="ALL">All Categories</option>
            <option value="Necklace">Necklace</option>
            <option value="Bangles">Bangles</option>
            <option value="Ring">Ring</option>
            <option value="Chain">Chain</option>
            <option value="Earrings">Earrings</option>
            <option value="Coin / Medallion">Coin / Medallion</option>
            <option value="Minted Bar">Minted Bar</option>
          </select>

          {/* Owner Filter */}
          <select
            value={selectedOwner}
            onChange={(e) => setSelectedOwner(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-300 focus:border-amber-500 focus:outline-none"
          >
            <option value="ALL">All Owners</option>
            {masterData?.owners.filter(o => o.isActive).map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
          </select>

          {/* Location Filter */}
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-300 focus:border-amber-500 focus:outline-none"
          >
            <option value="ALL">All Locations</option>
            {masterData?.locations.filter(l => l.isActive).map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
          </select>

          {/* Purity Filter */}
          <select
            value={selectedPurity}
            onChange={(e) => setSelectedPurity(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-300 focus:border-amber-500 focus:outline-none"
          >
            <option value="ALL">All Purities</option>
            {masterData?.purities.filter(p => p.isActive).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>

          {/* Special Enterprise Views */}
          <select
            value={specialFilter}
            onChange={(e) => setSpecialFilter(e.target.value as any)}
            className="bg-amber-950/60 border border-amber-800 text-amber-300 rounded-lg px-2.5 py-1.5 focus:outline-none font-semibold"
          >
            <option value="ALL">⚡ Quick Filter: All Assets</option>
            <option value="TOP_COST">⭐ Top 10 by Purchase Cost Basis</option>
            <option value="HEAVY_WEIGHT">⚖️ Top 10 by Pure Gold Weight</option>
            <option value="LONG_TERM">⏳ Long-Term Holding &gt;10 Yrs</option>
            <option value="SHORT_TERM">⚡ Short-Term &lt;1 Yr</option>
            <option value="INHERITED">👑 Inherited / Heirloom</option>
          </select>

          {/* Add Asset Button */}
          <button
            id="btn-register-add-asset"
            onClick={onOpenAddAsset}
            className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-1.5 rounded-lg shadow transition-colors cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Add Asset</span>
          </button>
        </div>
      </div>

      {/* Structured Table Container with Excel Grid */}
      <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm flex flex-col">
        <div className="overflow-x-auto overflow-y-auto max-h-[620px] scrollbar-thin">
          <table className="w-full text-xs text-left border-collapse select-none">
            {/* Excel Header */}
            <thead className="bg-slate-950 text-slate-400 font-semibold sticky top-0 z-10 border-b-2 border-slate-800 shadow-sm">
              <tr className="divide-x divide-slate-800/80">
                <th className="py-2.5 px-3 whitespace-nowrap">Asset ID</th>
                <th className="py-2.5 px-3 min-w-[200px] whitespace-nowrap">Asset Name</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Category</th>
                <th className="py-2.5 px-3 text-right whitespace-nowrap">Gross Wt (g)</th>
                <th className="py-2.5 px-3 text-right whitespace-nowrap">Stone Wt (g)</th>
                <th className="py-2.5 px-3 text-right whitespace-nowrap text-amber-300">Net Gold (g) fx</th>
                <th className="py-2.5 px-3 text-center whitespace-nowrap">Purity</th>
                <th className="py-2.5 px-3 text-right whitespace-nowrap text-amber-400">Pure Gold (g) fx</th>
                <th className="py-2.5 px-3 text-right whitespace-nowrap text-emerald-400">Avail Qty (g)</th>
                <th className="py-2.5 px-3 text-right whitespace-nowrap">Purchase Rate</th>
                <th className="py-2.5 px-3 text-right whitespace-nowrap text-slate-300">Making Chgs</th>
                <th className="py-2.5 px-3 text-right whitespace-nowrap text-slate-300">GST</th>
                <th className="py-2.5 px-3 text-right whitespace-nowrap text-blue-300 font-bold">Total Cost fx</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Location</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Locker</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Owner</th>
                <th className="py-2.5 px-3 text-center whitespace-nowrap">Status</th>
                <th className="py-2.5 px-3 text-center whitespace-nowrap">Actions</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-slate-800/80 font-mono text-slate-300">
              {filteredAssets.length === 0 ? (
                <tr>
                  <td colSpan={17} className="py-12 text-center text-slate-500 font-sans text-sm">
                    No gold assets match your search or filter criteria.
                  </td>
                </tr>
              ) : (
                filteredAssets.map((asset, index) => {
                  const rowNum = index + 2;
                  return (
                    <tr 
                      key={`${asset.assetId}-${index}`} 
                      className="hover:bg-slate-800/60 divide-x divide-slate-800/50 transition-colors"
                    >
                      {/* Asset ID */}
                      <td 
                        onClick={() => onSelectCell(`A${rowNum}`, asset.assetId, false)}
                        className="py-2 px-3 font-bold text-amber-400 cursor-pointer hover:bg-slate-800"
                        title="Click to view cell coordinate in Formula Bar"
                      >
                        {asset.assetId}
                      </td>

                      {/* Asset Name */}
                      <td 
                        onClick={() => onSelectCell(`B${rowNum}`, asset.assetName, false)}
                        className="py-2 px-3 font-sans font-medium text-slate-100 cursor-pointer hover:bg-slate-800"
                      >
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span>{asset.assetName}</span>
                          {asset.assetId === highestCostAssetId && (
                            <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] font-mono font-bold px-1.5 py-0.2 rounded" title="Highest Cost Asset">
                              ★ TOP COST BASIS
                            </span>
                          )}
                          {asset.assetId === heaviestAssetId && (
                            <span className="bg-blue-500/20 text-blue-300 border border-blue-500/40 text-[9px] font-mono font-bold px-1.5 py-0.2 rounded" title="Heaviest Pure Gold Asset">
                              HEAVIEST (24K EQ)
                            </span>
                          )}
                          {asset.isInherited && (
                            <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-[9px] font-mono px-1.5 py-0.2 rounded">
                              INHERITED
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Category */}
                      <td 
                        onClick={() => onSelectCell(`C${rowNum}`, getMasterName(masterData?.categories, asset.jewelleryCategory), false)}
                        className="py-2 px-3 font-sans text-slate-300 cursor-pointer hover:bg-slate-800"
                      >
                        {getMasterName(masterData?.categories, asset.jewelleryCategory)}
                      </td>

                      {/* Gross Wt */}
                      <td 
                        onClick={() => onSelectCell(`D${rowNum}`, `${asset.grossWeight ?? 0}`, false)}
                        className="py-2 px-3 text-right cursor-pointer hover:bg-slate-800"
                      >
                        {(asset.grossWeight ?? 0).toFixed(3)}
                      </td>

                      {/* Stone Wt */}
                      <td 
                        onClick={() => onSelectCell(`E${rowNum}`, `${asset.stoneWeight ?? 0}`, false)}
                        className="py-2 px-3 text-right text-slate-400 cursor-pointer hover:bg-slate-800"
                      >
                        {(asset.stoneWeight ?? 0).toFixed(3)}
                      </td>

                      {/* Net Gold Wt (Formula) */}
                      <td 
                        onClick={() => onSelectCell(`F${rowNum}`, `=[@[Gross Weight]]-[@[Stone Weight]]`, true)}
                        className="py-2 px-3 text-right font-bold text-amber-300 cursor-pointer hover:bg-slate-800"
                        title="Formula: =[@[Gross Weight]]-[@[Stone Weight]]"
                      >
                        {(asset.netGoldWeight ?? 0).toFixed(3)}
                      </td>

                      {/* Purity */}
                      <td 
                        onClick={() => onSelectCell(`G${rowNum}`, asset.purity, false)}
                        className="py-2 px-3 text-center cursor-pointer hover:bg-slate-800"
                      >
                        <span className="bg-amber-950/70 border border-amber-800/80 text-amber-300 text-[11px] font-bold px-1.5 py-0.5 rounded">
                          {asset.purity}
                        </span>
                      </td>

                      {/* Pure Gold Wt (Formula) */}
                      <td 
                        onClick={() => onSelectCell(`H${rowNum}`, `=ROUND((F${rowNum}*INDEX(MasterData!$C$4:$C$10, MATCH(G${rowNum}, MasterData!$A$4:$A$10, 0))/1000), 3)`, true)}
                        className="py-2 px-3 text-right font-bold text-amber-400 cursor-pointer hover:bg-slate-800"
                        title="Formula (Excel 2019): =ROUND((F4*INDEX(MasterData!$C$4:$C$10, MATCH(G4, MasterData!$A$4:$A$10, 0))/1000), 3)"
                      >
                        {(asset.pureGoldWeight ?? 0).toFixed(3)}
                      </td>

                      {/* Available Quantity */}
                      <td className="py-2 px-3 text-right font-bold text-emerald-300 border-l border-slate-700/50">
                        {calculateAssetAvailableQuantity(asset.assetId, transactions).toFixed(3)}
                      </td>

                      {/* Purchase Rate */}
                      <td 
                        onClick={() => onSelectCell(`I${rowNum}`, `₹${asset.purchaseRate ?? 0}`, false)}
                        className="py-2 px-3 text-right cursor-pointer hover:bg-slate-800"
                      >
                        ₹{(asset.purchaseRate ?? 0).toLocaleString('en-IN')}
                      </td>

                      {/* Making Charges */}
                      <td 
                        onClick={() => onSelectCell(`J${rowNum}`, `₹${asset.makingCharges ?? 0}`, false)}
                        className="py-2 px-3 text-right text-slate-400 cursor-pointer hover:bg-slate-800"
                      >
                        ₹{(asset.makingCharges ?? 0).toLocaleString('en-IN')}
                      </td>

                      {/* GST */}
                      <td 
                        onClick={() => onSelectCell(`K${rowNum}`, `₹${asset.gst ?? 0}`, false)}
                        className="py-2 px-3 text-right text-slate-400 cursor-pointer hover:bg-slate-800"
                      >
                        ₹{(asset.gst ?? 0).toLocaleString('en-IN')}
                      </td>

                      {/* Total Purchase Cost (Formula) */}
                      <td 
                        onClick={() => onSelectCell(`L${rowNum}`, `=(F${rowNum}*I${rowNum})+J${rowNum}+K${rowNum}`, true)}
                        className="py-2 px-3 text-right font-bold text-blue-300 cursor-pointer hover:bg-slate-800"
                        title="Formula: =(NetWeight * PurchaseRate) + MakingCharges + GST"
                      >
                        ₹{(asset.totalPurchaseCost ?? 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                      </td>

                      {/* Location */}
                      <td 
                        onClick={() => onSelectCell(`M${rowNum}`, getMasterName(masterData?.locations, asset.location), false)}
                        className="py-2 px-3 font-sans text-slate-300 cursor-pointer hover:bg-slate-800"
                      >
                        {getMasterName(masterData?.locations, asset.location)}
                      </td>

                      {/* Locker */}
                      <td 
                        onClick={() => onSelectCell(`N${rowNum}`, asset.locker, false)}
                        className="py-2 px-3 font-sans text-slate-400 text-[11px] truncate max-w-[140px] cursor-pointer hover:bg-slate-800"
                        title={asset.locker}
                      >
                        {asset.locker}
                      </td>

                      {/* Owner */}
                      <td 
                        onClick={() => onSelectCell(`O${rowNum}`, getMasterName(masterData?.owners, asset.owner), false)}
                        className="py-2 px-3 font-sans text-slate-200 cursor-pointer hover:bg-slate-800"
                      >
                        {getMasterName(masterData?.owners, asset.owner)}
                      </td>

                      {/* Status */}
                      <td className="py-2 px-3 text-center font-sans">
                        <span className="bg-emerald-950/70 border border-emerald-800 text-emerald-300 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                          {asset.status}
                        </span>
                      </td>

                      {/* Action buttons */}
                      <td className="py-2 px-3 text-center whitespace-nowrap font-sans">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => onEditAsset(asset)}
                            className="p-1 hover:text-amber-400 text-slate-400 hover:bg-slate-800 rounded transition-colors"
                            title="Edit Asset Details"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteAsset(asset.assetId)}
                            className="p-1 hover:text-rose-400 text-slate-400 hover:bg-slate-800 rounded transition-colors"
                            title="Delete Asset from Register"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onViewLifecycle(asset.assetId)}
                            className="p-1 hover:text-indigo-400 text-slate-400 hover:bg-slate-800 rounded transition-colors"
                            title="View Lifecycle Lineage"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>

            {/* Excel Summary Footer Row */}
            <tfoot className="bg-slate-950 text-slate-200 font-semibold sticky bottom-0 z-10 border-t-2 border-slate-700">
              <tr className="divide-x divide-slate-800">
                <td colSpan={3} className="py-2.5 px-3 text-left font-sans font-bold uppercase tracking-wider text-slate-400">
                  Total Summary ({filteredAssets.length} Assets)
                </td>
                <td className="py-2.5 px-3 text-right font-mono text-slate-200">{totalGross.toFixed(3)}g</td>
                <td className="py-2.5 px-3 text-right font-mono text-slate-400">{totalStone.toFixed(3)}g</td>
                <td className="py-2.5 px-3 text-right font-mono text-amber-300 font-bold">{totalNet.toFixed(3)}g</td>
                <td className="py-2.5 px-3 text-center font-sans text-slate-500">—</td>
                <td className="py-2.5 px-3 text-right font-mono text-amber-400 font-bold">{totalPure.toFixed(3)}g</td>
                <td className="py-2.5 px-3 text-right font-mono text-emerald-400 font-bold">{totalAvailQty.toFixed(3)}g</td>
                <td colSpan={3} className="py-2.5 px-3 text-center font-sans text-slate-500">—</td>
                <td className="py-2.5 px-3 text-right font-mono text-blue-300 font-bold">
                  ₹{totalCost.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </td>
                <td colSpan={5} className="py-2.5 px-3 text-center font-sans text-slate-500">—</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
