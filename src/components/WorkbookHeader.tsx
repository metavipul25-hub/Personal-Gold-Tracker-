import React from 'react';
import { 
  LogOut,
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
  onRestore,
  syncStatus = 'SYNCED',
  lastSync = '',
  onLogout
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  return (
    <header id="workbook-header-ribbon" className="bg-slate-900 border-b border-slate-800 text-slate-100 px-4 py-2.5 flex flex-col lg:flex-row lg:items-center justify-between gap-3 shadow-md">
      {/* Left: Branding and Workbook status */}
              <div className="flex items-center gap-3">
          <div className="bg-emerald-600/20 p-2 rounded-lg">
            <Vault className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h1 className="font-semibold text-lg leading-tight tracking-tight text-white flex items-center gap-2">
              Personal Gold Tracker
              {syncStatus === 'SYNCING' && <span className="flex h-2 w-2 relative"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span></span>}
              {syncStatus === 'SYNCED' && <span className="h-2 w-2 rounded-full bg-emerald-500" title="Synced to Cloud"></span>}
              {syncStatus === 'ERROR' && <span className="h-2 w-2 rounded-full bg-red-500" title="Offline or Error"></span>}
              {syncStatus === 'CONFLICT' && <span className="h-2 w-2 rounded-full bg-amber-500" title="Sync Conflict"></span>}
            </h1>
            <div className="text-xs text-slate-400 font-medium tracking-wide">
              {syncStatus === 'SYNCING' ? 'Saving...' : syncStatus === 'CONFLICT' ? 'Sync Conflict' : syncStatus === 'ERROR' ? 'Offline' : (lastSync ? 'Last synced: ' + new Date(lastSync).toLocaleTimeString() : 'Cloud Secured Vault')}
            </div>
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

        <button
          onClick={onLogout}
          className="flex items-center gap-1.5 hover:bg-slate-800 text-slate-300 hover:text-white px-2.5 py-1.5 rounded transition-colors cursor-pointer border border-slate-700 hover:border-slate-600"
          title="Sign Out"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="text-xs font-medium">Sign Out</span>
        </button>
      </div>
    </header>
  );

};
