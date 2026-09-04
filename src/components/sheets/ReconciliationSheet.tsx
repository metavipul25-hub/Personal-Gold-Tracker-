import React, { useMemo } from 'react';
import { AssetRecord, TransactionHistoryRecord } from '../../types';
import { reconcileAsset, calculateAssetInventory } from '../../utils/calculations';
import { ShieldCheck, AlertCircle, AlertTriangle } from 'lucide-react';

interface ReconciliationSheetProps {
  assets: AssetRecord[];
  transactions: TransactionHistoryRecord[];
}

export const ReconciliationSheet: React.FC<ReconciliationSheetProps> = ({ assets, transactions }) => {

  const reconciliationData = useMemo(() => {
    return assets.map(a => {
      const rec = reconcileAsset(a.assetId, assets, transactions);
      return {
        asset: a,
        ...rec
      };
    }).filter(d => d !== null);
  }, [assets, transactions]);

  const globalTotals = useMemo(() => {
    let quantity = 0;
    let gross = 0;
    let stone = 0;
    let net = 0;
    let fine = 0;

    reconciliationData.forEach(d => {
      if (d) {
         quantity += d.currentQuantity;
         gross += d.currentGross;
         stone += d.currentStone;
         net += d.currentNet;
         fine += d.currentFine;
      }
    });

    return { quantity, gross, stone, net, fine };
  }, [reconciliationData]);

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-hidden">
      <div className="p-4 bg-white border-b border-slate-200">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-blue-600" />
          Audit & Reconciliation Engine
        </h2>
        <p className="text-sm text-slate-600">Verification of mathematical integrity and global inventory.</p>
      </div>
      
      <div className="p-4 bg-blue-50 border-b border-blue-100 flex gap-6 overflow-x-auto shrink-0">
         <div className="flex flex-col">
            <span className="text-xs font-bold text-blue-700 uppercase">Total Items (Qty)</span>
            <span className="text-xl font-bold text-slate-800">{globalTotals.quantity.toFixed(3)}</span>
         </div>
         <div className="flex flex-col">
            <span className="text-xs font-bold text-blue-700 uppercase">Total Gross Wt</span>
            <span className="text-xl font-bold text-slate-800">{globalTotals.gross.toFixed(3)}g</span>
         </div>
         <div className="flex flex-col">
            <span className="text-xs font-bold text-blue-700 uppercase">Total Stone Wt</span>
            <span className="text-xl font-bold text-slate-800">{globalTotals.stone.toFixed(3)}g</span>
         </div>
         <div className="flex flex-col">
            <span className="text-xs font-bold text-blue-700 uppercase">Total Net Wt</span>
            <span className="text-xl font-bold text-slate-800">{globalTotals.net.toFixed(3)}g</span>
         </div>
         <div className="flex flex-col">
            <span className="text-xs font-bold text-blue-700 uppercase">Total Fine Wt</span>
            <span className="text-xl font-bold text-slate-800">{globalTotals.fine.toFixed(3)}g</span>
         </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 font-semibold text-xs uppercase">
              <tr>
                <th className="px-4 py-3">Asset</th>
                <th className="px-4 py-3 text-right">Orig Qty</th>
                <th className="px-4 py-3 text-right">Cur Qty</th>
                <th className="px-4 py-3 text-right">Qty Diff</th>
                
                <th className="px-4 py-3 text-right">Orig Gross</th>
                <th className="px-4 py-3 text-right">Cur Gross</th>
                <th className="px-4 py-3 text-right">Gross Diff</th>
                
                <th className="px-4 py-3 text-right">Orig Net</th>
                <th className="px-4 py-3 text-right">Cur Net</th>
                <th className="px-4 py-3 text-right">Net Diff</th>
                
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reconciliationData.map((d: any) => {
                const isHealthy = d.quantityDiff === 0 || d.asset.status === 'Disposed' || d.asset.status === 'Partially Sold';
                return (
                  <tr key={d.asset.assetId} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900">{d.asset.assetId}</div>
                      <div className="text-xs text-slate-500">{d.asset.assetName}</div>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-slate-600">{d.originalQuantity.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right font-mono font-medium text-slate-800">{d.currentQuantity.toFixed(2)}</td>
                    <td className={`px-4 py-3 text-right font-mono font-bold ${d.quantityDiff < 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                      {d.quantityDiff.toFixed(2)}
                    </td>
                    
                    <td className="px-4 py-3 text-right font-mono text-slate-600">{d.originalGross.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right font-mono font-medium text-slate-800">{d.currentGross.toFixed(2)}</td>
                    <td className={`px-4 py-3 text-right font-mono font-bold ${d.grossDiff < 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                      {d.grossDiff.toFixed(2)}
                    </td>
                    
                    <td className="px-4 py-3 text-right font-mono text-slate-600">{d.originalNet.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right font-mono font-medium text-slate-800">{d.currentNet.toFixed(2)}</td>
                    <td className={`px-4 py-3 text-right font-mono font-bold ${d.netDiff < 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                      {d.netDiff.toFixed(2)}
                    </td>
                    
                    <td className="px-4 py-3">
                       <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold
                          ${isHealthy ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                          {isHealthy ? <ShieldCheck className="w-3 h-3"/> : <AlertTriangle className="w-3 h-3"/>}
                          {isHealthy ? 'Healthy' : 'Mismatch'}
                       </span>
                       <div className="text-[10px] text-slate-500 mt-0.5">{d.asset.status}</div>
                    </td>
                  </tr>
                );
              })}
              {reconciliationData.length === 0 && (
                <tr>
                  <td colSpan={11} className="px-4 py-8 text-center text-slate-500">
                    No assets to reconcile.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
