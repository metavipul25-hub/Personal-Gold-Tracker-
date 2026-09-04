import React, { useState, useMemo } from 'react';
import { AssetRecord, TransactionHistoryRecord, MasterDataLists } from '../../types';
import { getMasterName } from '../../utils/masterData';
import { reconcileAsset, getTransactionInventoryImpact } from '../../utils/calculations';
import { FileText, ArrowDownToLine, ArrowUpFromLine, ArrowRightLeft, Edit3, RotateCcw, Clock, Calendar, Download, Split, Merge, Activity } from 'lucide-react';

interface ReportsSheetProps {
  assets: AssetRecord[];
  transactions: TransactionHistoryRecord[];
  masterData?: MasterDataLists;
}

type ReportType = 'ACQUISITION' | 'DISPOSAL' | 'TRANSFER' | 'CORRECTION' | 'REVERSAL' | 'SPLIT' | 'MERGE' | 'LIFECYCLE' | 'STATEMENT' | 'OPENING_CLOSING' | 'STONES';

export const ReportsSheet: React.FC<ReportsSheetProps> = ({ assets, transactions, masterData }) => {
  const [activeReport, setActiveReport] = useState<ReportType>('ACQUISITION');
  const [dateFilter, setDateFilter] = useState<'ALL' | 'YTD' | 'MTD' | 'CUSTOM'>('ALL');
  const [customFrom, setCustomFrom] = useState<string>('');
  const [customTo, setCustomTo] = useState<string>('');

  const filteredTx = useMemo(() => {
    const now = new Date();
    return [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).filter(tx => {
      if (dateFilter === 'ALL') return true;
      const txDate = new Date(tx.date);
      if (dateFilter === 'YTD') return txDate.getFullYear() === now.getFullYear();
      if (dateFilter === 'MTD') return txDate.getFullYear() === now.getFullYear() && txDate.getMonth() === now.getMonth();
      if (dateFilter === 'CUSTOM') {
        if (customFrom && txDate < new Date(customFrom)) return false;
        if (customTo && txDate > new Date(customTo)) return false;
      }
      return true;
    });
  }, [transactions, dateFilter]);

  const reportData = useMemo(() => {
    if (activeReport === 'ACQUISITION') {
      return filteredTx.filter(t => ['PURCHASE', 'OPENING BALANCE', 'GIFT RECEIVED', 'INHERITANCE RECEIVED'].includes(t.type));
    }
    if (activeReport === 'DISPOSAL') {
      return filteredTx.filter(t => ['SALE', 'GIFT GIVEN', 'INHERITANCE TRANSFERRED'].includes(t.type));
    }
    if (activeReport === 'TRANSFER') {
      return filteredTx.filter(t => ['OWNER TRANSFER', 'LOCATION TRANSFER'].includes(t.type));
    }
    if (activeReport === 'CORRECTION') {
      return filteredTx.filter(t => t.type === 'CORRECTION');
    }
    if (activeReport === 'REVERSAL') {
      return filteredTx.filter(t => t.type === 'REVERSAL');
    }
    if (activeReport === 'SPLIT') {
      return filteredTx.filter(t => t.type === 'ASSET SPLIT');
    }
    if (activeReport === 'MERGE') {
      return filteredTx.filter(t => t.type === 'ASSET MERGE');
    }
    return [];
  }, [filteredTx, activeReport]);

  const renderTxTable = (txs: TransactionHistoryRecord[], title: string, showReason = false) => (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col flex-1">
      <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
        <h3 className="font-bold text-slate-800">{title} ({txs.length} records)</h3>
      </div>
      <div className="overflow-auto flex-1">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 font-semibold text-xs uppercase sticky top-0">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Tx ID</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Asset ID</th>
              <th className="px-4 py-3 text-right">Qty</th>
              <th className="px-4 py-3 text-right">Gross Wt</th>
              <th className="px-4 py-3 text-right">Net Wt</th>
              <th className="px-4 py-3 text-right">Fine Wt</th>
              {showReason && <th className="px-4 py-3">Details / Reason</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {txs.map(tx => (
              <tr key={tx.txId} className="hover:bg-slate-50/50">
                <td className="px-4 py-3 text-slate-600 font-mono text-xs">{tx.date}</td>
                <td className="px-4 py-3 text-slate-800 font-mono text-xs">{tx.txId}</td>
                <td className="px-4 py-3">
                  <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-bold">{tx.type}</span>
                </td>
                <td className="px-4 py-3 text-blue-600 font-mono text-xs cursor-pointer">{tx.assetId}</td>
                <td className="px-4 py-3 text-right font-mono">{Number(tx.quantity || 0).toFixed(2)}</td>
                <td className="px-4 py-3 text-right font-mono">{Number(tx.grossWeightGrams || tx.weightGrams || 0).toFixed(2)}g</td>
                <td className="px-4 py-3 text-right font-mono">{Number(tx.netWeightGrams || 0).toFixed(2)}g</td>
                <td className="px-4 py-3 text-right font-mono">{Number(tx.fineWeightGrams || 0).toFixed(2)}g</td>
                {showReason && <td className="px-4 py-3 text-slate-500 text-xs truncate max-w-[200px]">{tx.details || '-'}</td>}
              </tr>
            ))}
            {txs.length === 0 && (
              <tr><td colSpan={10} className="text-center py-8 text-slate-400">No transactions found for this period.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderLifecycle = () => {
     // Simple lifecycle table showing how an asset evolved
     return (
       <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col flex-1 p-4">
          <h3 className="font-bold text-slate-800 mb-4">Asset Lifecycle Audit Trail</h3>
          <p className="text-sm text-slate-500 mb-4">Please select an asset in the Asset Register to view its detailed lifecycle. (Foundation implemented)</p>
          <div className="text-center py-12 text-slate-400 border-2 border-dashed border-slate-200 rounded-lg">
             Select an asset to drill down.
          </div>
       </div>
     );
  };

  
  const renderOpeningClosing = () => {
    // Requires sorting chronologically
    const allChronological = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    let openingQty = 0, openingGross = 0, openingNet = 0, openingFine = 0;
    let inQty = 0, inGross = 0, inNet = 0, inFine = 0;
    let outQty = 0, outGross = 0, outNet = 0, outFine = 0;
    
    allChronological.forEach(tx => {
       const txDate = new Date(tx.date);
       const qty = Number(tx.quantity || 0);
       const gross = Number(tx.grossWeightGrams || tx.weightGrams || 0);
       const net = Number(tx.netWeightGrams || 0);
       const fine = Number(tx.fineWeightGrams || 0);

       // If it's before the period, it goes to Opening Balance
       let isBefore = false;
       if (dateFilter === 'YTD' && txDate.getFullYear() < new Date().getFullYear()) isBefore = true;
       if (dateFilter === 'MTD' && (txDate.getFullYear() < new Date().getFullYear() || (txDate.getFullYear() === new Date().getFullYear() && txDate.getMonth() < new Date().getMonth()))) isBefore = true;
       if (dateFilter === 'CUSTOM' && customFrom && txDate < new Date(customFrom)) isBefore = true;

       if (isBefore) {
          openingQty += qty;
          openingGross += gross;
          openingNet += net;
          openingFine += fine;
       } else {
          // It's in the period (Note: 'ALL' means opening is 0, everything is in the period)
          if (dateFilter === 'CUSTOM' && customTo && txDate > new Date(customTo)) return; // Exclude after period
          
          if (qty > 0 || gross > 0) {
             inQty += qty;
             inGross += gross;
             inNet += net;
             inFine += fine;
          } else {
             outQty += Math.abs(qty);
             outGross += Math.abs(gross);
             outNet += Math.abs(net);
             outFine += Math.abs(fine);
          }
       }
    });

    const closingQty = openingQty + inQty - outQty;
    const closingGross = openingGross + inGross - outGross;
    const closingNet = openingNet + inNet - outNet;
    const closingFine = openingFine + inFine - outFine;

    return (
       <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col p-6">
          <h3 className="font-bold text-slate-800 text-xl mb-6">Period Opening & Closing Report</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
             <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
               <div className="text-xs text-slate-500 font-semibold uppercase mb-2">Opening Balance</div>
               <div className="text-lg font-bold text-slate-800">{openingQty.toFixed(2)} qty</div>
               <div className="text-sm text-slate-600">{openingGross.toFixed(3)}g Gross</div>
               <div className="text-sm text-slate-600">{openingFine.toFixed(3)}g Fine</div>
             </div>
             <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100">
               <div className="text-xs text-emerald-600 font-semibold uppercase mb-2">Total Inbound</div>
               <div className="text-lg font-bold text-emerald-800">+{inQty.toFixed(2)} qty</div>
               <div className="text-sm text-emerald-700">+{inGross.toFixed(3)}g Gross</div>
               <div className="text-sm text-emerald-700">+{inFine.toFixed(3)}g Fine</div>
             </div>
             <div className="bg-red-50 p-4 rounded-lg border border-red-100">
               <div className="text-xs text-red-600 font-semibold uppercase mb-2">Total Outbound</div>
               <div className="text-lg font-bold text-red-800">-{outQty.toFixed(2)} qty</div>
               <div className="text-sm text-red-700">-{outGross.toFixed(3)}g Gross</div>
               <div className="text-sm text-red-700">-{outFine.toFixed(3)}g Fine</div>
             </div>
             <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
               <div className="text-xs text-blue-600 font-semibold uppercase mb-2">Closing Balance</div>
               <div className="text-lg font-bold text-blue-900">{closingQty.toFixed(2)} qty</div>
               <div className="text-sm text-blue-800">{closingGross.toFixed(3)}g Gross</div>
               <div className="text-sm text-blue-800">{closingFine.toFixed(3)}g Fine</div>
             </div>
          </div>
       </div>
    );
  };


  const renderStatement = () => {
    // Basic periodic statement
    return (
       <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col flex-1 p-4">
          <div className="flex justify-between items-center mb-6 border-b border-slate-200 pb-4">
            <div>
              <h3 className="font-bold text-slate-800 text-xl">Gold Holding Statement</h3>
              <p className="text-sm text-slate-500">As of {new Date().toLocaleDateString()}</p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 font-medium text-sm">
              <Download className="w-4 h-4"/> Export PDF
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
             <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
               <div className="text-xs text-slate-500 font-semibold uppercase mb-1">Total Assets</div>
               <div className="text-2xl font-bold text-slate-800">{assets.length}</div>
             </div>
             {/* Totals would be pulled from engine here */}
             <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
               <div className="text-xs text-slate-500 font-semibold uppercase mb-1">Total Transactions</div>
               <div className="text-2xl font-bold text-slate-800">{transactions.length}</div>
             </div>
          </div>
          <div className="text-sm text-slate-600 italic">
             Note: Comprehensive financial reporting foundation is initialized. Valuation calculations require optional manual inputs.
          </div>
       </div>
    );
  };

  return (
    <div className="flex flex-col md:flex-row h-full bg-slate-50 overflow-hidden text-slate-800 pb-20">
      
      {/* SIDEBAR */}
      <div className="w-full md:w-64 bg-white border-r border-slate-200 flex flex-col shrink-0">
        <div className="p-4 border-b border-slate-200">
          <h2 className="font-bold text-lg text-slate-800 flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-600"/> Reports
          </h2>
        </div>
        <div className="p-2 space-y-1 overflow-y-auto">
          {[
            { id: 'ACQUISITION', label: 'Gold Acquisition', icon: ArrowDownToLine },
            { id: 'DISPOSAL', label: 'Gold Disposal', icon: ArrowUpFromLine },
            { id: 'TRANSFER', label: 'Transfer Report', icon: ArrowRightLeft },
            { id: 'CORRECTION', label: 'Corrections', icon: Edit3 },
            { id: 'REVERSAL', label: 'Reversals', icon: RotateCcw },
            { id: 'SPLIT', label: 'Asset Splits', icon: Split },
            { id: 'MERGE', label: 'Asset Merges', icon: Merge },
            { id: 'LIFECYCLE', label: 'Asset Lifecycle', icon: Clock },
            { id: 'OPENING_CLOSING', label: 'Period Opening/Closing', icon: Activity },
            { id: 'STATEMENT', label: 'Holding Statement', icon: Calendar },
            { id: 'STONES', label: 'Stone Inventory', icon: Activity },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveReport(item.id as ReportType)}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeReport === item.id ? 'bg-purple-50 text-purple-700' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <item.icon className={`w-4 h-4 ${activeReport === item.id ? 'text-purple-600' : 'text-slate-400'}`} />
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex-1 flex flex-col p-4 md:p-6 overflow-hidden gap-4">
        
        {/* Filters Top Bar */}
        {['ACQUISITION', 'DISPOSAL', 'TRANSFER', 'CORRECTION', 'REVERSAL'].includes(activeReport) && (
          <div className="bg-white border border-slate-200 rounded-xl p-3 flex justify-between items-center shadow-sm shrink-0">
             <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-500 uppercase tracking-wider text-xs">Date Range:</span>
                <div className="flex bg-slate-100 p-1 rounded-lg gap-1">
                   {['ALL', 'YTD', 'MTD', 'CUSTOM'].map(d => (
                     <button 
                       key={d} 
                       onClick={() => setDateFilter(d as any)}
                       className={`px-3 py-1 text-xs font-medium rounded transition ${dateFilter === d ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
                     >{d}</button>
                   ))}
                </div>
             </div>
             <button className="text-sm text-blue-600 font-medium flex items-center gap-1 hover:bg-blue-50 px-2 py-1 rounded">
               <Download className="w-4 h-4"/> Export Excel
             </button>
          </div>
        )}

        {/* Report Area */}
        {activeReport === 'ACQUISITION' && renderTxTable(reportData, 'Gold Acquisition Report', true)}
        {activeReport === 'DISPOSAL' && renderTxTable(reportData, 'Gold Disposal Report', true)}
        {activeReport === 'TRANSFER' && renderTxTable(reportData, 'Transfers (Location & Owner)', true)}
        {activeReport === 'CORRECTION' && renderTxTable(reportData, 'Corrections Report', true)}
        {activeReport === 'REVERSAL' && renderTxTable(reportData, 'Reversals Report', true)}
        {activeReport === 'SPLIT' && renderTxTable(reportData, 'Asset Split Report', true)}
        {activeReport === 'MERGE' && renderTxTable(reportData, 'Asset Merge Report', true)}
        
        {activeReport === 'LIFECYCLE' && renderLifecycle()}
        {activeReport === 'STATEMENT' && renderStatement()}
        {activeReport === 'OPENING_CLOSING' && renderOpeningClosing()}
      </div>

    </div>
  );
};
