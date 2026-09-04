import React, { useState, useMemo } from 'react';
import { AssetRecord, TransactionHistoryRecord } from '../../types';
import { reconcileAsset, calculateAssetAvailableQuantity } from '../../utils/calculations';
import { Grid, RotateCw, Filter, Layers, Users, MapPin, Coins, Calendar, Sparkles, Activity } from 'lucide-react';

interface PivotsSheetProps {
  assets: AssetRecord[];
  transactions: TransactionHistoryRecord[];
}

const pivotDefinitions = [
    // --- INVENTORY PIVOTS ---
    { id: 1, name: '64. Asset Count', source: 'ASSETS', row: 'status', val: 'count' },
    { id: 2, name: '65. Asset Status', source: 'ASSETS', row: 'status', val: 'availableWeight' },
    { id: 3, name: '66. Available Wt by Asset Type', source: 'ASSETS', row: 'assetType', val: 'availableWeight' },
    { id: 4, name: '67. Available Wt by Category', source: 'ASSETS', row: 'jewelleryCategory', val: 'availableWeight' },
    { id: 5, name: '68. Available Wt by Purity', source: 'ASSETS', row: 'purity', val: 'availableWeight' },
    { id: 6, name: '69. Available Wt by Location', source: 'ASSETS', row: 'location', val: 'availableWeight' },
    { id: 7, name: '70. Available Wt by Owner', source: 'ASSETS', row: 'owner', val: 'availableWeight' },
    
    // --- 2D PIVOTS ---
    { id: 8, name: '71. Owner + Location', source: 'ASSETS', row: 'owner', col: 'location', val: 'availableWeight' },
    { id: 9, name: '72. Asset Type + Purity', source: 'ASSETS', row: 'assetType', col: 'purity', val: 'availableWeight' },
    { id: 10, name: '73. Category + Location', source: 'ASSETS', row: 'jewelleryCategory', col: 'location', val: 'availableWeight' },

    // --- TRANSACTION PIVOTS ---
    { id: 11, name: '74. TXN Count by Type', source: 'TRANSACTIONS', row: 'type', val: 'count' },
    { id: 12, name: '75. TXN Weight by Type', source: 'TRANSACTIONS', row: 'type', val: 'transactionWeight' },
    { id: 13, name: '76. TXN Trend by Year', source: 'TRANSACTIONS', row: 'transactionYear', val: 'transactionWeight' },
    { id: 14, name: '77. TXN Trend by Month', source: 'TRANSACTIONS', row: 'transactionMonth', val: 'transactionWeight' },
    
    // --- SPECIFIC ACTIVITIES ---
    { id: 15, name: '57. Purchase Pivot', source: 'TRANSACTIONS', row: 'transactionMonth', val: 'transactionWeight', filter: { field: 'type', value: 'PURCHASE' } },
    { id: 16, name: '58. Gift Received Pivot', source: 'TRANSACTIONS', row: 'transactionMonth', val: 'transactionWeight', filter: { field: 'type', value: 'GIFT RECEIVED' } },
    { id: 17, name: '59. Gift Given Pivot', source: 'TRANSACTIONS', row: 'transactionMonth', val: 'transactionWeight', filter: { field: 'type', value: 'GIFT GIVEN' } },
    { id: 18, name: '60. Inheritance Pivot', source: 'TRANSACTIONS', row: 'transactionMonth', val: 'transactionWeight', filter: { field: 'type', value: 'INHERITANCE RECEIVED' } },
    { id: 19, name: '61. Sale Pivot', source: 'TRANSACTIONS', row: 'transactionMonth', val: 'transactionWeight', filter: { field: 'type', value: 'SALE' } },
    { id: 20, name: '62. Owner Transfer Pivot', source: 'TRANSACTIONS', row: 'transactionMonth', val: 'transactionWeight', filter: { field: 'type', value: 'OWNER TRANSFER' } },
    { id: 21, name: '63. Location Transfer Pivot', source: 'TRANSACTIONS', row: 'transactionMonth', val: 'transactionWeight', filter: { field: 'type', value: 'LOCATION TRANSFER' } },
  ];

export const PivotsSheet: React.FC<PivotsSheetProps> = ({
  assets,
  transactions
}) => {
  const [activePivot, setActivePivot] = useState<number>(1);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  

  const currentDef = pivotDefinitions.find(p => p.id === activePivot)!;

  // Compute Pivot Aggregations
  const pivotData = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _trigger = refreshTrigger; // To force re-calc if needed
    
    if (currentDef.col) {
      // 2D PIVOT
      const map = new Map<string, Map<string, number>>();
      const colsSet = new Set<string>();

      assets.forEach(a => {
        const recon = reconcileAsset(a.assetId, assets, transactions);
        if (recon.currentQuantity <= 0) return;
        
        let rowKey = 'Unknown';
        if (currentDef.row === 'owner') rowKey = a.owner || 'Unknown';
        else if (currentDef.row === 'assetType') rowKey = a.assetType || 'Other';
        else if (currentDef.row === 'jewelleryCategory') rowKey = a.jewelleryCategory || 'Other';
        
        let colKey = 'Unknown';
        if (currentDef.col === 'location') colKey = a.location || 'Unknown';
        else if (currentDef.col === 'purity') colKey = a.purity || 'Unknown';
        colsSet.add(colKey);
        
        const val = currentDef.val === 'count' ? 1 : recon.currentFine;
        
        if (!map.has(rowKey)) map.set(rowKey, new Map());
        const rowMap = map.get(rowKey)!;
        rowMap.set(colKey, (rowMap.get(colKey) || 0) + val);
      });

      return { is2D: true, data2D: map, cols: Array.from(colsSet).sort() };
    } else {
      // 1D PIVOT
      const map = new Map<string, number>();

      if (currentDef.source === 'ASSETS') {
        assets.forEach(a => {
          const recon = reconcileAsset(a.assetId, assets, transactions);
          if (recon.currentQuantity <= 0) return;

          let key = 'Unknown';
          if (currentDef.row === 'status') key = a.status || 'UNKNOWN';
          else if (currentDef.row === 'assetType') key = a.assetType || 'Other';
          else if (currentDef.row === 'jewelleryCategory') key = a.jewelleryCategory || 'Other';
          else if (currentDef.row === 'purity') key = a.purity || 'Unknown';
          else if (currentDef.row === 'location') key = a.location || 'Unknown';
          else if (currentDef.row === 'owner') key = a.owner || 'Unknown';
          
          const val = currentDef.val === 'count' ? 1 : recon.currentFine;
          map.set(key, (map.get(key) || 0) + val);
        });
      } else {
        transactions.forEach(t => {
          if (currentDef.filter && (t as any)[currentDef.filter.field] !== currentDef.filter.value) return;

          let key = 'Unknown';
          if (currentDef.row === 'type') key = t.type || 'Unknown';
          else if (currentDef.row === 'transactionMonth') key = t.date ? t.date.substring(0, 7) : 'Unknown';
          else if (currentDef.row === 'transactionYear') key = t.date ? t.date.substring(0, 4) : 'Unknown';
          
          const val = currentDef.val === 'count' ? 1 : (t.weightGrams ?? 0);
          map.set(key, (map.get(key) || 0) + Number(val));
        });
      }

      const arr = Array.from(map.entries()).map(([name, value]) => ({ name, value }));
      arr.sort((a, b) => b.value - a.value); // sort descending by value
      return { is2D: false, data1D: arr };
    }
  }, [activePivot, assets, transactions, refreshTrigger, currentDef]);

  const valLabel = currentDef.val === 'count' ? 'Count / Units' : 'Total Weight (g)';

  return (
    <div id="sheet-pivots-container" className="p-4 space-y-4 text-slate-100 flex flex-col h-full">
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 border border-indigo-500/30 rounded-lg text-indigo-400">
            <Grid className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100">Pivot Engine & Recon</h2>
            <p className="text-xs text-slate-400">Multi-dimensional aggregation of physical inventory and historical transactions.</p>
          </div>
        </div>
        <button 
          onClick={() => setRefreshTrigger(prev => prev + 1)}
          className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-bold transition-colors"
        >
          <RotateCw className="w-3.5 h-3.5" />
          Refresh Data
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-140px)] min-h-[500px]">
        
        {/* Sidebar: Pivot List */}
        <div className="w-full lg:w-72 flex-shrink-0 bg-slate-900/50 border border-slate-800 rounded-xl flex flex-col overflow-hidden">
          <div className="p-3 border-b border-slate-800 bg-slate-900/80">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Filter className="w-4 h-4" /> Available Pivots
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
            {pivotDefinitions.map(def => (
              <button
                key={def.id}
                onClick={() => setActivePivot(def.id)}
                className={`w-full text-left px-3 py-2 text-xs font-medium rounded-lg transition-colors flex items-center justify-between group ${
                  activePivot === def.id 
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-transparent'
                }`}
              >
                <span className="truncate pr-2">{def.name}</span>
                {def.source === 'ASSETS' ? (
                  <Layers className={`w-3.5 h-3.5 flex-shrink-0 ${activePivot === def.id ? 'text-indigo-400' : 'text-slate-600 group-hover:text-slate-400'}`} />
                ) : (
                  <Activity className={`w-3.5 h-3.5 flex-shrink-0 ${activePivot === def.id ? 'text-indigo-400' : 'text-slate-600 group-hover:text-slate-400'}`} />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content: Pivot Result */}
        <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl flex flex-col overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/80">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                {currentDef.name}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Source: {currentDef.source === 'ASSETS' ? 'Current Asset State' : 'Historical Transactions'}
              </p>
            </div>
            <div className="px-3 py-1 bg-slate-950 border border-slate-800 rounded text-[10px] font-mono text-slate-400">
              AGGREGATION: {valLabel}
            </div>
          </div>
          
          <div className="flex-1 overflow-auto p-4 custom-scrollbar">
            {pivotData.is2D ? (
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead>
                  <tr className="border-b border-slate-800">
                    <th className="py-3 px-4 font-semibold text-slate-400 uppercase tracking-wider text-xs bg-slate-950/50 sticky top-0">
                      {currentDef.row} \ {currentDef.col}
                    </th>
                    {pivotData.cols!.map(c => (
                      <th key={c} className="py-3 px-4 text-right font-semibold text-slate-400 uppercase tracking-wider text-xs bg-slate-950/50 sticky top-0">
                        {c}
                      </th>
                    ))}
                    <th className="py-3 px-4 text-right font-bold text-indigo-400 uppercase tracking-wider text-xs bg-slate-950/50 sticky top-0">
                      Grand Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {Array.from(pivotData.data2D!.entries()).map(([rowName, colMap], idx) => {
                    let rowTotal = 0;
                    return (
                      <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3 px-4 font-medium text-slate-300">{rowName}</td>
                        {pivotData.cols!.map(c => {
                          const val = colMap.get(c) || 0;
                          rowTotal += val;
                          return (
                            <td key={c} className="py-3 px-4 text-right font-mono text-slate-400">
                              {val > 0 ? (currentDef.val === 'count' ? val : val.toFixed(3)) : '-'}
                            </td>
                          );
                        })}
                        <td className="py-3 px-4 text-right font-mono font-bold text-indigo-400">
                          {currentDef.val === 'count' ? rowTotal : rowTotal.toFixed(3)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-800">
                    <th className="py-3 px-4 font-semibold text-slate-400 uppercase tracking-wider text-xs bg-slate-950/50 sticky top-0">
                      {currentDef.row}
                    </th>
                    <th className="py-3 px-4 text-right font-semibold text-slate-400 uppercase tracking-wider text-xs bg-slate-950/50 sticky top-0">
                      {valLabel}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {pivotData.data1D!.length === 0 ? (
                    <tr>
                      <td colSpan={2} className="py-12 text-center text-slate-500 font-sans text-sm">
                        No data available for this aggregation.
                      </td>
                    </tr>
                  ) : (
                    pivotData.data1D!.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3 px-4 font-medium text-slate-300 flex items-center gap-2">
                          {item.name}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-medium text-amber-500">
                          {currentDef.val === 'count' ? item.value : item.value.toFixed(3)}
                        </td>
                      </tr>
                    ))
                  )}
                  {pivotData.data1D!.length > 0 && (
                    <tr className="bg-slate-950/30 border-t-2 border-slate-700">
                      <td className="py-3 px-4 font-bold text-slate-200">Grand Total</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-indigo-400">
                        {currentDef.val === 'count' 
                          ? pivotData.data1D!.reduce((sum, item) => sum + item.value, 0)
                          : pivotData.data1D!.reduce((sum, item) => sum + item.value, 0).toFixed(3)
                        }
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
