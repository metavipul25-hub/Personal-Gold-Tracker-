import React from 'react';
import { 
  FileSpreadsheet, 
  Download, 
  PlusCircle, 
  ShoppingBag, 
  BadgePercent, 
  Coins, 
  Vault,
  RotateCcw
, ArrowRightLeft } from 'lucide-react';

interface WorkbookHeaderProps {
  totalAssetsCount: number;
  totalPureGoldWeight: number;
  totalPurchaseCost: number;
  onExportExcel: () => void;
  onOpenAddAsset: () => void;
  onOpenQuickTransaction: () => void;
  onOpenAddPurchase: () => void;
  onOpenAddSale: () => void;
  onRunAudit: () => void;
  onResetData: () => void;
  onBackup: () => void;
  onRestore: (file: File) => void;
  
  
}

export const WorkbookHeader: React.FC<WorkbookHeaderProps> = ({
  totalAssetsCount,
  totalPureGoldWeight,
  totalPurchaseCost,
  onExportExcel,
  onOpenAddAsset,
  onOpenQuickTransaction,
  onOpenAddPurchase,
  onOpenAddSale,
  onRunAudit,
  onResetData,
  onBackup,
  onRestore
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  return (
    <header id="workbook-header-ribbon" className="bg-slate-900 border-b border-slate-800 text-slate-100 px-4 py-2.5 flex flex-col lg:flex-row lg:items-center justify-between gap-3 shadow-md">
      {/* Left: Branding and Workbook status */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-950/40 border border-amber-400/40">
          <Vault className="w-5 h-5 text-slate-950" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-base text-slate-100 tracking-tight flex items-center gap-1.5">
              <span>Gold Tracker System</span>
              <span className="text-[11px] font-mono bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 px-1.5 py-0.5 rounded font-normal">
                v2.5.0 (Simplified)
              </span>
            </h1>
          </div>
          <p className="text-xs text-slate-400">
            Financial Gold Portfolio • Multi-Sheet Architecture
          </p>
        </div>
      </div>

      {/* Center: Live Snapshot KPIs */}
      <div className="hidden xl:flex items-center gap-4 bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-1.5 text-xs">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-semibold text-slate-400">Total Items</span>
          <span className="font-mono font-bold text-slate-200">{totalAssetsCount}</span>
        </div>
        <div className="w-px h-6 bg-slate-800" />
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-semibold text-slate-400">Pure Gold (24K Eq.)</span>
          <span className="font-mono font-bold text-amber-400">{(totalPureGoldWeight ?? 0).toFixed(2)} g</span>
        </div>
        <div className="w-px h-6 bg-slate-800" />
        <div className="flex flex-col">
          <span className="text-[10px] uppercase font-semibold text-slate-400">Total Cost Basis</span>
          <span className="font-mono font-bold text-slate-100">₹{(totalPurchaseCost ?? 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
        </div>
      </div>

      {/* Right: Excel Actions & Quick Modals */}
      <div className="flex items-center flex-wrap gap-1.5">
        <button
          id="btn-quick-add-asset"
          onClick={onOpenAddAsset}
          className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-semibold px-2.5 py-1.5 rounded text-xs shadow transition-colors cursor-pointer"
          title="Add new physical gold asset to Register"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>+ Asset</span>
        </button>

                <button
          id="btn-quick-add-transaction"
          onClick={onOpenQuickTransaction}
          className="flex items-center gap-1.5 bg-indigo-600/90 hover:bg-indigo-600 text-white font-medium px-2.5 py-1.5 rounded text-xs transition-colors cursor-pointer"
          title="Quick Transaction Entry (Mobile First)"
        >
          <ArrowRightLeft className="w-3.5 h-3.5" />
          <span>+ Quick Tx</span>
        </button>

        <button
          id="btn-adv-add-transaction"
          onClick={onOpenAddPurchase}
          className="flex items-center gap-1.5 bg-emerald-600/90 hover:bg-emerald-600 text-white font-medium px-2.5 py-1.5 rounded text-xs transition-colors cursor-pointer"
          title="Advanced Transaction"
        >
          <ArrowRightLeft className="w-3.5 h-3.5" />
          <span>+ Adv. Tx</span>
        </button>

        <div className="w-px h-5 bg-slate-800 mx-0.5" />

        
        <div className="w-px h-5 bg-slate-800 mx-0.5" />
        <button
          onClick={onBackup}
          className="flex items-center gap-1.5 bg-slate-700 hover:bg-slate-600 text-slate-100 font-semibold px-2.5 py-1.5 rounded text-xs transition-colors cursor-pointer"
          title="Download JSON Backup"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Backup</span>
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1.5 bg-slate-700 hover:bg-slate-600 text-slate-100 font-semibold px-2.5 py-1.5 rounded text-xs transition-colors cursor-pointer"
          title="Restore JSON Backup"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Restore</span>
        </button>
        <input 
          type="file" 
          accept=".json" 
          ref={fileInputRef} 
          className="hidden" 
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              onRestore(e.target.files[0]);
            }
            e.target.value = '';
          }} 
        />

        <button id="btn-export-excel"
          onClick={onExportExcel}
          className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold px-3 py-1.5 rounded text-xs shadow-md transition-colors cursor-pointer"
          title="Export complete 9-sheet Excel Workbook (.xlsx)"
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          <Download className="w-3.5 h-3.5" />
          <span>Export .XLSX</span>
        </button>

        <button
          id="btn-reset-sample-data"
          onClick={onResetData}
          className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors cursor-pointer"
          title="Reset to verified standard sample workbook"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
};
