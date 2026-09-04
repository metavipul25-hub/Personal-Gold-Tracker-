import React, { useMemo, useState } from 'react';
import { MasterDataLists, AssetRecord, TransactionHistoryRecord } from '../../types';
import { getMasterName } from '../../utils/masterData';
import { reconcileAsset, getTransactionInventoryImpact } from '../../utils/calculations';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import {
  Scale, Coins, TrendingUp, Vault, ShieldCheck, Gem,
  Sparkles, MapPin, Users, Layers, AlertTriangle, ArrowRightLeft, CheckCircle, Activity, Calendar
} from 'lucide-react';

interface DashboardSheetProps {
  masterData?: MasterDataLists;
  assets: AssetRecord[];
  transactions: TransactionHistoryRecord[];
  onNavigateSheet?: (sheet: string) => void;
}

const COLORS = ['#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316', '#64748b'];

export const DashboardSheet: React.FC<DashboardSheetProps> = ({
  masterData,
  assets,
  transactions,
  onNavigateSheet
}) => {
  const [dateFilter, setDateFilter] = useState<'ALL' | 'YTD' | 'MTD'>('ALL');

  const { reconData, globalTotals, ownerMap, locationMap, purityMap, typeMap, categoryMap, activeAssetCount } = useMemo(() => {
    const recon = assets.map(a => ({ asset: a, ...reconcileAsset(a.assetId, assets, transactions) })).filter(d => d.originalQuantity !== undefined);
    
    let gQty = 0, gGross = 0, gStone = 0, gNet = 0, gFine = 0;
    let actAssets = 0;
    
    const oMap = new Map<string, typeof globalTotals>();
    const lMap = new Map<string, typeof globalTotals>();
    const pMap = new Map<string, typeof globalTotals>();
    const tMap = new Map<string, typeof globalTotals>();
    const cMap = new Map<string, typeof globalTotals>();

    const initTotals = () => ({ qty: 0, gross: 0, stone: 0, net: 0, fine: 0, count: 0 });

    recon.forEach(r => {
      gQty += r.currentQuantity;
      gGross += r.currentGross;
      gStone += r.currentStone;
      gNet += r.currentNet;
      gFine += r.currentFine;
      if (r.currentQuantity > 0) actAssets++;

      const o = r.asset.owner || 'Unknown';
      const l = r.asset.location || 'Unknown';
      const p = r.asset.purity || 'Unknown';
      const t = r.asset.assetType || 'Unknown';
      const c = r.asset.jewelleryCategory || 'Unknown';

      const updateMap = (m: Map<string, any>, key: string) => {
        if (!m.has(key)) m.set(key, initTotals());
        const obj = m.get(key)!;
        obj.qty += r.currentQuantity;
        obj.gross += r.currentGross;
        obj.stone += r.currentStone;
        obj.net += r.currentNet;
        obj.fine += r.currentFine;
        if (r.currentQuantity > 0) obj.count++;
      };

      updateMap(oMap, o);
      updateMap(lMap, l);
      updateMap(pMap, p);
      updateMap(tMap, t);
      updateMap(cMap, c);
    });

    return { 
      reconData: recon, 
      globalTotals: { qty: gQty, gross: gGross, stone: gStone, net: gNet, fine: gFine },
      ownerMap: oMap,
      locationMap: lMap,
      purityMap: pMap,
      typeMap: tMap,
      categoryMap: cMap,
      activeAssetCount: actAssets
    };
  }, [assets, transactions]);

  // Transaction Analytics
  const txSummary = useMemo(() => {
    const summary = {
      purchases: { count: 0, qty: 0, gross: 0, net: 0, fine: 0 },
      sales: { count: 0, qty: 0, gross: 0, net: 0, fine: 0 },
      giftsIn: { count: 0, qty: 0, gross: 0, net: 0, fine: 0 },
      giftsOut: { count: 0, qty: 0, gross: 0, net: 0, fine: 0 },
      transfers: { count: 0, qty: 0, gross: 0, net: 0, fine: 0 },
      reversals: { count: 0, qty: 0, gross: 0, net: 0, fine: 0 },
    };
    
    const now = new Date();
    
    transactions.forEach(tx => {
      const txDate = new Date(tx.date);
      if (dateFilter === 'YTD' && txDate.getFullYear() !== now.getFullYear()) return;
      if (dateFilter === 'MTD' && (txDate.getFullYear() !== now.getFullYear() || txDate.getMonth() !== now.getMonth())) return;

      const qty = Number(tx.quantity || 0);
      const gross = Number(tx.grossWeightGrams || tx.weightGrams || 0);
      const net = Number(tx.netWeightGrams || 0); // Approximation if 0
      const fine = Number(tx.fineWeightGrams || 0);

      const add = (target: any) => {
        target.count++;
        target.qty += qty;
        target.gross += gross;
        target.net += net;
        target.fine += fine;
      };

      if (tx.type === 'PURCHASE' || tx.type === 'OPENING BALANCE') add(summary.purchases);
      else if (tx.type === 'SALE') add(summary.sales);
      else if (tx.type === 'GIFT RECEIVED' || tx.type === 'INHERITANCE RECEIVED') add(summary.giftsIn);
      else if (tx.type === 'GIFT GIVEN' || tx.type === 'INHERITANCE TRANSFERRED') add(summary.giftsOut);
      else if (tx.type === 'OWNER TRANSFER' || tx.type === 'LOCATION TRANSFER') add(summary.transfers);
      else if (tx.type === 'REVERSAL') add(summary.reversals);
    });
    return summary;
  }, [transactions, dateFilter]);

  const toChartData = (map: Map<string, any>, lookup?: any[]) => {
    return Array.from(map.entries()).map(([k, v]) => ({
      name: getMasterName(lookup, k) || k,
      net: Number(v.net.toFixed(2)),
      gross: Number(v.gross.toFixed(2))
    })).filter(d => d.net > 0 || d.gross > 0).sort((a, b) => b.net - a.net);
  };

  const ownerChart = toChartData(ownerMap, masterData?.owners);
  const typeChart = toChartData(typeMap, masterData?.assetTypes);

  return (
    <div className="p-4 space-y-6 text-slate-100 flex flex-col min-h-screen pb-20 overflow-y-auto">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-500">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-100 tracking-tight">Executive Dashboard</h1>
            <p className="text-xs text-slate-400">Reconciled Single Source of Truth for Global Inventory.</p>
          </div>
        </div>
        
        <div className="flex bg-slate-800 p-1 rounded-lg">
           <button onClick={() => setDateFilter('ALL')} className={`px-3 py-1 text-xs font-medium rounded ${dateFilter === 'ALL' ? 'bg-slate-700 text-white' : 'text-slate-400'}`}>All Time</button>
           <button onClick={() => setDateFilter('YTD')} className={`px-3 py-1 text-xs font-medium rounded ${dateFilter === 'YTD' ? 'bg-slate-700 text-white' : 'text-slate-400'}`}>YTD</button>
           <button onClick={() => setDateFilter('MTD')} className={`px-3 py-1 text-xs font-medium rounded ${dateFilter === 'MTD' ? 'bg-slate-700 text-white' : 'text-slate-400'}`}>MTD</button>
        </div>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col gap-1 cursor-pointer hover:bg-slate-800 transition" onClick={() => onNavigateSheet?.('ASSET_REGISTER')}>
          <div className="flex items-center gap-2 text-slate-400 mb-1">
            <Layers className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">Active Assets</span>
          </div>
          <div className="text-2xl font-bold text-slate-100">{activeAssetCount}</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col gap-1">
          <div className="flex items-center gap-2 text-slate-400 mb-1">
            <Gem className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">Total Quantity</span>
          </div>
          <div className="text-2xl font-bold text-slate-100">{globalTotals.qty.toFixed(2)}</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col gap-1">
          <div className="flex items-center gap-2 text-slate-400 mb-1">
            <Scale className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">Gross Weight</span>
          </div>
          <div className="text-2xl font-bold text-amber-500">{globalTotals.gross.toFixed(2)}<span className="text-sm text-amber-500/70 ml-1">g</span></div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col gap-1">
          <div className="flex items-center gap-2 text-slate-400 mb-1">
            <Sparkles className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">Net Gold</span>
          </div>
          <div className="text-2xl font-bold text-emerald-400">{globalTotals.net.toFixed(2)}<span className="text-sm text-emerald-400/70 ml-1">g</span></div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col gap-1 cursor-pointer hover:bg-slate-800 transition" onClick={() => onNavigateSheet?.('RECONCILIATION')}>
          <div className="flex items-center gap-2 text-slate-400 mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">Fine Gold</span>
          </div>
          <div className="text-2xl font-bold text-blue-400">{globalTotals.fine.toFixed(2)}<span className="text-sm text-blue-400/70 ml-1">g</span></div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col gap-1">
          <div className="flex items-center gap-2 text-slate-400 mb-1">
            <Users className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">Owners / Locs</span>
          </div>
          <div className="text-2xl font-bold text-purple-400">{ownerMap.size} <span className="text-sm text-slate-500">/</span> {locationMap.size}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         {/* CHART: NET BY OWNER */}
         <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2"><Users className="w-4 h-4 text-slate-400"/> Inventory by Owner</h3>
            <div className="h-64">
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                   <Pie data={ownerChart} dataKey="net" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                     {ownerChart.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                   </Pie>
                   <Tooltip formatter={(val: number) => [`${val}g`, 'Net Weight']} contentStyle={{backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc'}} itemStyle={{color: '#f8fafc'}}/>
                   <Legend />
                 </PieChart>
               </ResponsiveContainer>
            </div>
         </div>
         {/* CHART: NET BY TYPE */}
         <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2"><Coins className="w-4 h-4 text-slate-400"/> Inventory by Asset Type</h3>
            <div className="h-64">
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={typeChart} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                   <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                   <XAxis type="number" stroke="#94a3b8" />
                   <YAxis dataKey="name" type="category" stroke="#94a3b8" width={80} tick={{fontSize: 12}} />
                   <Tooltip formatter={(val: number) => [`${val}g`, 'Net Weight']} cursor={{fill: '#334155'}} contentStyle={{backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc'}}/>
                   <Bar dataKey="net" fill="#10b981" radius={[0, 4, 4, 0]} />
                 </BarChart>
               </ResponsiveContainer>
            </div>
         </div>
      </div>

      
      {/* TEXT BREAKDOWNS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2"><MapPin className="w-4 h-4 text-slate-400"/> Inventory by Location</h3>
            <div className="space-y-2">
               {Array.from(locationMap.entries()).filter(([_,v]) => v.net > 0).map(([k, v]) => (
                  <div key={k} className="flex justify-between items-center text-sm border-b border-slate-800 pb-1">
                     <span className="text-slate-400">{getMasterName(masterData?.locations, k) || k}</span>
                     <span className="font-bold text-slate-200">{v.net.toFixed(2)}g</span>
                  </div>
               ))}
            </div>
         </div>
         <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2"><Sparkles className="w-4 h-4 text-slate-400"/> Inventory by Purity</h3>
            <div className="space-y-2">
               {Array.from(purityMap.entries()).filter(([_,v]) => v.net > 0).map(([k, v]) => (
                  <div key={k} className="flex justify-between items-center text-sm border-b border-slate-800 pb-1">
                     <span className="text-slate-400">{getMasterName(masterData?.purities, k) || k}</span>
                     <span className="font-bold text-slate-200">{v.net.toFixed(2)}g</span>
                  </div>
               ))}
            </div>
         </div>
         <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2"><Layers className="w-4 h-4 text-slate-400"/> Jewellery Categories</h3>
            <div className="space-y-2">
               {Array.from(categoryMap.entries()).filter(([_,v]) => v.net > 0).map(([k, v]) => (
                  <div key={k} className="flex justify-between items-center text-sm border-b border-slate-800 pb-1">
                     <span className="text-slate-400">{getMasterName(masterData?.categories, k) || k}</span>
                     <span className="font-bold text-slate-200">{v.net.toFixed(2)}g</span>
                  </div>
               ))}
            </div>
         </div>
      </div>


      {/* TX SUMMARY */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2"><Activity className="w-4 h-4 text-slate-400"/> Transaction Analytics ({dateFilter})</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
           <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
              <div className="text-xs text-slate-400 mb-1 uppercase tracking-wider">Acquisitions</div>
              <div className="text-xl font-bold text-emerald-400">{txSummary.purchases.count} <span className="text-xs text-slate-500 font-normal">txns</span></div>
              <div className="text-sm text-slate-300 mt-1">{txSummary.purchases.gross.toFixed(2)}g Gross</div>
           </div>
           <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
              <div className="text-xs text-slate-400 mb-1 uppercase tracking-wider">Disposals / Sales</div>
              <div className="text-xl font-bold text-amber-500">{txSummary.sales.count} <span className="text-xs text-slate-500 font-normal">txns</span></div>
              <div className="text-sm text-slate-300 mt-1">{txSummary.sales.gross.toFixed(2)}g Gross</div>
           </div>
           <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
              <div className="text-xs text-slate-400 mb-1 uppercase tracking-wider">Transfers</div>
              <div className="text-xl font-bold text-blue-400">{txSummary.transfers.count} <span className="text-xs text-slate-500 font-normal">txns</span></div>
              <div className="text-sm text-slate-300 mt-1">-</div>
           </div>
           <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
              <div className="text-xs text-slate-400 mb-1 uppercase tracking-wider">Gifts In/Out</div>
              <div className="text-xl font-bold text-purple-400">{txSummary.giftsIn.count} <span className="text-slate-500 text-sm">/</span> {txSummary.giftsOut.count}</div>
              <div className="text-sm text-slate-300 mt-1">In: {txSummary.giftsIn.gross.toFixed(2)}g | Out: {txSummary.giftsOut.gross.toFixed(2)}g</div>
           </div>
        </div>
      </div>
      
    </div>
  );
};
