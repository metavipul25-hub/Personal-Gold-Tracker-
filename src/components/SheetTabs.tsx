import React from 'react';
import { ActiveSheet } from '../types';
import { 
  FileText,
  Landmark,
  Target, 
  LayoutDashboard, 
  Table, 
  ShoppingBag, 
  BadgePercent, 
  Coins, 
  Database, 
  History, 
  Calculator, 
  Grid, 
  BarChart3, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle,
  Crown,
  Vault,
  Activity,
  Layers,
  Sparkles,
  ShieldAlert
} from 'lucide-react';

interface SheetTabsProps {
  activeSheet: ActiveSheet;
  onSelectSheet: (sheet: ActiveSheet) => void;
  validationErrorCount: number;
}

interface SheetTabDef {
  id: ActiveSheet;
  label: string;
  icon: React.ElementType;
  colorClass: string;
  badge?: number;
}

export const SheetTabs: React.FC<SheetTabsProps> = ({
  activeSheet,
  onSelectSheet,
  validationErrorCount
}) => {
  const tabs: SheetTabDef[] = [
    { id: 'README', label: '1. README / Guide', icon: FileText, colorClass: 'border-slate-500 text-slate-300' },
    { id: 'DASHBOARD', label: '2. DASHBOARD', icon: LayoutDashboard, colorClass: 'border-emerald-500 text-emerald-400' },
    { id: 'ASSET_REGISTER', label: '3. ASSET REGISTER', icon: Table, colorClass: 'border-amber-500 text-amber-400' },
    { id: 'MASTER_DATA', label: '7. MASTER DATA', icon: Database, colorClass: 'border-zinc-400 text-zinc-300' },
    { id: 'TRANSACTION_HISTORY', label: '8. TX HISTORY', icon: History, colorClass: 'border-cyan-500 text-cyan-400' },
    { id: 'PIVOTS', label: '10. PIVOTS', icon: Grid, colorClass: 'border-indigo-500 text-indigo-400' },
    
    { id: 'CHARTS', label: '11. CHARTS', icon: BarChart3, colorClass: 'border-teal-500 text-teal-400' },
    { id: 'SIP_PLANS', label: '12. SIP PLANS', icon: Landmark, colorClass: 'border-indigo-500 text-indigo-400' },
    { id: 'LIFE_GOALS', label: '13. LIFE GOALS', icon: Target, colorClass: 'border-pink-500 text-pink-400' },
  
  
    { id: 'RECONCILIATION', label: '8B. RECONCILIATION', icon: CheckCircle2, colorClass: 'border-blue-500 text-blue-400' },
    { id: 'REPORTS', label: '14. REPORTS', icon: FileText, colorClass: 'border-purple-500 text-purple-400' },
    { id: 'VALIDATION', label: '9. VALIDATION', icon: ShieldAlert, colorClass: 'border-red-500 text-red-400', badge: validationErrorCount > 0 ? validationErrorCount : undefined },];

  return (
    <div id="excel-sheet-tabs" className="flex items-center bg-slate-950 border-t border-slate-800 px-2 py-1 overflow-x-auto select-none gap-1 shrink-0 scrollbar-thin">
      <div className="flex items-center gap-1.5 px-2 py-1 text-[11px] font-semibold text-slate-400 tracking-wider uppercase mr-1">
        <span>Sheets:</span>
      </div>

      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeSheet === tab.id;
        return (
          <button
            key={tab.id}
            id={`tab-button-${tab.id}`}
            onClick={() => onSelectSheet(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-t text-xs font-medium whitespace-nowrap transition-all border-b-2 cursor-pointer ${
              isActive
                ? `bg-slate-800 text-white font-semibold border-b-2 shadow-sm ${tab.colorClass.split(' ')[0]}`
                : 'bg-slate-900/60 text-slate-400 hover:bg-slate-800/80 hover:text-slate-200 border-transparent'
            }`}
          >
            <Icon className={`w-3.5 h-3.5 ${isActive ? tab.colorClass.split(' ')[1] : 'text-slate-500'}`} />
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span className="ml-1 bg-red-500/90 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
