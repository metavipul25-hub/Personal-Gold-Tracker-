import React from 'react';
import { ValidationIssue } from '../../types';
import { AlertTriangle, Info, CheckCircle2, ShieldAlert } from 'lucide-react';

interface ValidationSheetProps {
  issues: ValidationIssue[];
}

export const ValidationSheet: React.FC<ValidationSheetProps> = ({ issues }) => {
  const errors = issues.filter(i => i.type === 'ERROR');
  const warnings = issues.filter(i => i.type === 'WARNING');
  const infos = issues.filter(i => i.type === 'INFO');

  return (
    <div id="sheet-validation-container" className="p-4 space-y-4 text-slate-100 flex flex-col h-full overflow-auto pb-20">
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex items-center gap-3 shadow-sm">
        <div className="p-2.5 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-slate-100">Data Quality & Governance Report</h2>
          <p className="text-xs text-slate-400">
            Real-time validation engine identifying missing master references, negative balances, and data integrity issues.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-center items-center">
          <h3 className="text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wider">Critical Errors</h3>
          <span className="text-3xl font-bold text-red-400">{errors.length}</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-center items-center">
          <h3 className="text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wider">Warnings</h3>
          <span className="text-3xl font-bold text-amber-400">{warnings.length}</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-center items-center">
          <h3 className="text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wider">Info / Notices</h3>
          <span className="text-3xl font-bold text-blue-400">{infos.length}</span>
        </div>
      </div>

      {issues.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-slate-900/50 border border-slate-800 border-dashed rounded-xl">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mb-3" />
          <h3 className="text-lg font-bold text-slate-200">System Healthy</h3>
          <p className="text-sm text-slate-400 text-center max-w-sm mt-1">No data integrity or validation issues detected across master data, assets, or transactions.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-800 shadow-sm bg-slate-900/50">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-400 bg-slate-950">
              <tr>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Sheet</th>
                <th className="py-2.5 px-3">Record ID</th>
                <th className="py-2.5 px-3">Field</th>
                <th className="py-2.5 px-3">Message</th>
                <th className="py-2.5 px-3">Recommendation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-300">
              {issues.map((issue, index) => (
                <tr key={`${issue.id}-${index}`} className="hover:bg-slate-800/30">
                  <td className="py-2 px-3">
                    {issue.type === 'ERROR' && <span className="bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded text-[10px] font-bold">ERROR</span>}
                    {issue.type === 'WARNING' && <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded text-[10px] font-bold">WARNING</span>}
                    {issue.type === 'INFO' && <span className="bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded text-[10px] font-bold">INFO</span>}
                  </td>
                  <td className="py-2 px-3 text-xs font-mono">{issue.sheet}</td>
                  <td className="py-2 px-3 text-xs font-mono">{issue.recordId}</td>
                  <td className="py-2 px-3 text-xs font-medium">{issue.field}</td>
                  <td className="py-2 px-3 text-xs">{issue.message}</td>
                  <td className="py-2 px-3 text-xs text-slate-400">{issue.recommendation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
