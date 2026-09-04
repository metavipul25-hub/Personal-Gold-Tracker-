import React from 'react';
import { GoldSipPlan } from '../../types';
import { Landmark, TrendingUp, Calendar, AlertCircle } from 'lucide-react';

interface SipPlansSheetProps {
  sipPlans: GoldSipPlan[];
}

export const SipPlansSheet: React.FC<SipPlansSheetProps> = ({ sipPlans }) => {
  return (
    <div id="sheet-sip-container" className="p-4 space-y-4 text-slate-100 flex flex-col h-full">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 border border-indigo-500/30 rounded-lg text-indigo-400">
            <Landmark className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-100">Gold SIP & Digital Savings Plans</h2>
              <span className="text-[10px] bg-slate-800 text-slate-300 border border-slate-700 px-1.5 py-0.5 rounded font-mono">Table: tbl_SipPlans</span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Active schemes for systematic gold accumulation (e.g. Golden Harvest, Digital Gold)
            </p>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-sm overflow-hidden flex-1 flex flex-col">
        <div className="overflow-x-auto overflow-y-auto flex-1">
          <table className="w-full text-left border-collapse text-xs whitespace-nowrap">
            <thead className="bg-slate-950/80 text-slate-400 font-semibold sticky top-0 z-10 border-b border-slate-800">
              <tr>
                <th className="p-2.5 border-r border-slate-800 font-mono text-[10px] uppercase">Plan ID</th>
                <th className="p-2.5 border-r border-slate-800">Plan Name</th>
                <th className="p-2.5 border-r border-slate-800">Provider</th>
                <th className="p-2.5 border-r border-slate-800 text-right">Inst. Amount (₹)</th>
                <th className="p-2.5 border-r border-slate-800">Status</th>
                <th className="p-2.5 border-r border-slate-800">Progress</th>
                <th className="p-2.5 border-r border-slate-800 text-right">Accumulated (g)</th>
                <th className="p-2.5">Total Invested (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-mono text-slate-300">
              {sipPlans.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500 font-sans">
                    No active SIP plans found.
                  </td>
                </tr>
              ) : (
                sipPlans.map(plan => (
                  <tr key={plan.id} className="hover:bg-slate-800/40 group transition-colors">
                    <td className="p-2.5 border-r border-slate-800/60 font-medium text-slate-400">{plan.id}</td>
                    <td className="p-2.5 border-r border-slate-800/60 font-sans font-medium text-slate-200">{plan.planName}</td>
                    <td className="p-2.5 border-r border-slate-800/60 font-sans">{plan.provider}</td>
                    <td className="p-2.5 border-r border-slate-800/60 text-right text-emerald-400">
                      ₹{plan.monthlyAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="p-2.5 border-r border-slate-800/60">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${plan.status === 'ACTIVE' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-slate-800 text-slate-400 border border-slate-700'}`}>
                        {plan.status}
                      </span>
                    </td>
                    <td className="p-2.5 border-r border-slate-800/60 font-sans">
                      {plan.completedInstallments} / {plan.tenureMonths} Months
                    </td>
                    <td className="p-2.5 border-r border-slate-800/60 text-right text-amber-300 font-bold">
                      {plan.accumulatedGrams > 0 ? `${plan.accumulatedGrams.toFixed(2)} g` : '-'}
                    </td>
                    <td className="p-2.5 text-slate-200">
                      ₹{plan.totalInvested.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
