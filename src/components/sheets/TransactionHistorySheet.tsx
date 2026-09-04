import React, { useState } from 'react';
import { TransactionHistoryRecord } from '../../types';
import { getTransactionInventoryImpact, getTransactionNetWeightImpact, getTransactionFineGoldImpact, parsePurityToFineness } from '../../utils/calculations';

import { History, Search, Filter, ShoppingBag, BadgePercent, ArrowRightLeft, TrendingUp } from 'lucide-react';

interface TransactionHistorySheetProps {
  transactions: TransactionHistoryRecord[];
  onSelectCell: (cellCoord: string, formulaOrValue: string, isFormula: boolean) => void;
  onAddTransaction?: () => void;
}

export const TransactionHistorySheet: React.FC<TransactionHistorySheetProps> = ({
  transactions,
  onSelectCell,
  onAddTransaction
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');

  const term = (searchTerm || '').toLowerCase();
  const filteredTx = transactions.filter(t => {
    const matchSearch = !term ||
      (t.txId || '').toLowerCase().includes(term) ||
      (t.assetId || '').toLowerCase().includes(term) ||
      (t.assetName || '').toLowerCase().includes(term) ||
      (t.details || '').toLowerCase().includes(term);
    
    const matchType = filterType === 'ALL' || t.type === filterType;
    return matchSearch && matchType;
  });

  const getTypeBadge = (type: TransactionHistoryRecord['type']) => {
    switch (type) {
      case 'PURCHASE':
        return <span className="bg-blue-950 text-blue-300 border border-blue-800 text-[10px] font-bold px-2 py-0.5 rounded">PURCHASE</span>;
      case 'SALE':
        return <span className="bg-purple-950 text-purple-300 border border-purple-800 text-[10px] font-bold px-2 py-0.5 rounded">SALE</span>;
      case 'LOCATION TRANSFER':
        return <span className="bg-rose-950 text-rose-300 border border-rose-800 text-[10px] font-bold px-2 py-0.5 rounded">TRANSFER</span>;
      case 'OPENING BALANCE':
        return <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">OPENING BAL</span>;
      default:
        return <span className="bg-slate-800 text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded">{type}</span>;
    }
  };

  return (
    <div id="sheet-tx-history-container" className="p-4 space-y-4 text-slate-100 flex flex-col h-full">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-cyan-400">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100">Consolidated Audit Trail & Transaction Ledger</h2>
            <p className="text-xs text-slate-400">
              Complete chronological timeline of asset additions, liquidations, transfers, and spot re-valuations.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-2 bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-1.5 min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search TX ID, Details..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent text-slate-100 focus:outline-none placeholder:text-slate-500"
            />
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-300 focus:border-cyan-500 focus:outline-none"
          >
            <option value="ALL">All Transaction Types</option>
            <option value="PURCHASE">Purchases</option>
            <option value="SALE">Sales</option>
            <option value="LOCATION_TRANSFER">Location Transfers</option>
            <option value="OPENING BALANCE">Opening Balance</option>
            <option value="REVERSAL">Reversals</option>
            <option value="ASSET SPLIT">Asset Split</option>
            <option value="ASSET MERGE">Asset Merge</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm flex flex-col">
        <div className="overflow-x-auto overflow-y-auto max-h-[620px] scrollbar-thin">
          <table className="w-full text-xs text-left border-collapse select-none">
            <thead className="bg-slate-950 text-slate-400 font-semibold sticky top-0 z-10 border-b-2 border-slate-800">
              <tr className="divide-x divide-slate-800">
                <th className="py-2.5 px-3 whitespace-nowrap">TX ID</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Date</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Event Type</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Asset ID</th>
                <th className="py-2.5 px-3 min-w-[180px] whitespace-nowrap">Asset Name</th>
                <th className="py-2.5 px-3 text-right whitespace-nowrap">Weight (g)</th>
                <th className="py-2.5 px-3 text-center whitespace-nowrap">Impact</th>
                <th className="py-2.5 px-3 text-right whitespace-nowrap">Fine Gold Impt (g)</th>
                <th className="py-2.5 px-3 text-center whitespace-nowrap">Purity</th>
                <th className="py-2.5 px-3 text-right whitespace-nowrap">Amount (₹)</th>
                <th className="py-2.5 px-3 min-w-[240px]">Audit Details & Notes</th>
                <th className="py-2.5 px-3 whitespace-nowrap">Logged By</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/80 font-mono text-slate-300">
              {filteredTx.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-12 text-center text-slate-500 font-sans text-sm">
                    No transactions match your search filter.
                  </td>
                </tr>
              ) : (
                filteredTx.map((t, index) => {
                  const rowNum = index + 2;
                  return (
                    <tr key={`${t.txId}-${index}`} className="hover:bg-slate-800/60 divide-x divide-slate-800/50">
                      <td 
                        onClick={() => onSelectCell(`A${rowNum}`, t.txId, false)}
                        className="py-2 px-3 font-bold text-cyan-400 cursor-pointer hover:bg-slate-800"
                      >
                        {t.txId}
                      </td>
                      <td 
                        onClick={() => onSelectCell(`B${rowNum}`, t.date, false)}
                        className="py-2 px-3 text-slate-300 cursor-pointer hover:bg-slate-800"
                      >
                        {t.date}
                      </td>
                      <td className="py-2 px-3">{getTypeBadge(t.type)}</td>
                      <td 
                        onClick={() => onSelectCell(`D${rowNum}`, t.assetId, false)}
                        className="py-2 px-3 font-bold text-amber-400 cursor-pointer hover:bg-slate-800"
                      >
                        {t.assetId}
                      </td>
                      <td 
                        onClick={() => onSelectCell(`E${rowNum}`, t.assetName, false)}
                        className="py-2 px-3 font-sans font-medium text-slate-200 cursor-pointer hover:bg-slate-800"
                      >
                        {t.assetName}
                      </td>
                      <td className="py-2 px-3 text-right text-amber-300">{(t.weightGrams ?? 0) > 0 ? `${(t.weightGrams ?? 0).toFixed(2)}g` : '—'}</td>
                      <td className="py-2 px-3 text-center">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          getTransactionInventoryImpact(t.type) === 'IN' ? 'bg-emerald-900/50 text-emerald-400' :
                          getTransactionInventoryImpact(t.type) === 'OUT' ? 'bg-rose-900/50 text-rose-400' :
                          getTransactionInventoryImpact(t.type) === 'ADJUSTMENT' ? 'bg-amber-900/50 text-amber-400' :
                          'bg-slate-800 text-slate-400'
                        }`}>
                          {getTransactionInventoryImpact(t.type)}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right text-amber-300 font-bold">
                        {getTransactionFineGoldImpact(t.type, t.weightGrams ?? 0, parsePurityToFineness(t.purity)) !== 0 
                          ? `${getTransactionFineGoldImpact(t.type, t.weightGrams ?? 0, parsePurityToFineness(t.purity)).toFixed(2)}g` 
                          : '—'}
                      </td>
                      <td className="py-2 px-3 text-center">{t.purity}</td>
                      <td className="py-2 px-3 text-right font-bold text-slate-100">
                        {(t.amount ?? 0) > 0 ? `₹${(t.amount ?? 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}` : '—'}
                      </td>
                      <td className="py-2 px-3 font-sans text-slate-300 text-[11px] leading-relaxed">{t.details}</td>
                      <td className="py-2 px-3 font-sans text-slate-400">{t.performedBy}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
