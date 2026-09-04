import React from 'react';
import { 
  BookOpen, 
  Table, 
  Coins, 
  ShieldCheck, 
  Layers, 
  CheckCircle,
  FileSpreadsheet
} from 'lucide-react';

export const ReadmeSheet: React.FC = () => {
  return (
    <div id="sheet-readme-container" className="p-6 max-w-6xl mx-auto space-y-8 text-slate-200">
      {/* Title Hero */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-400">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100">Microsoft Excel Gold Tracker System — User Guide & Architecture</h2>
            <p className="text-xs text-slate-400 font-mono">Document Reference: ARCH-XLSX-GOLD-v2.4.0 • Enterprise Edition</p>
          </div>
        </div>
        <p className="text-sm text-slate-300 leading-relaxed mt-3">
          This system is engineered for long-term personal, family, and multi-vault physical gold asset tracking.
          Built following strict financial modeling and Excel best practices with separated presentation, structured tables, 
          modular calculation engines, comprehensive purity conversions, and automated audit validation.
        </p>
      </div>

      {/* Sheet Directory Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
        <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
          <Layers className="w-4 h-4 text-emerald-400" />
          <span>Workbook Sheet Index & Architecture</span>
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-slate-800">
            <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="p-2.5">#</th>
                <th className="p-2.5">Worksheet Name</th>
                <th className="p-2.5">Type</th>
                <th className="p-2.5">Primary Purpose & Key Tables</th>
                <th className="p-2.5">Key Formulas Used</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-mono text-slate-300">
              <tr className="hover:bg-slate-800/40">
                <td className="p-2.5 text-slate-500">1</td>
                <td className="p-2.5 font-bold text-slate-200">README / Guide</td>
                <td className="p-2.5 text-slate-400">Doc</td>
                <td className="p-2.5 font-sans">System manual, formula reference, and architecture standards.</td>
                <td className="p-2.5 text-slate-500">—</td>
              </tr>
              <tr className="hover:bg-slate-800/40">
                <td className="p-2.5 text-slate-500">2</td>
                <td className="p-2.5 font-bold text-emerald-400">DASHBOARD</td>
                <td className="p-2.5 text-emerald-400">Presentation</td>
                <td className="p-2.5 font-sans">Executive KPIs,  purity/location/owner splits.</td>
                <td className="p-2.5 text-amber-300">SUM, SUMIFS, COUNTIFS, AVERAGE</td>
              </tr>
              <tr className="hover:bg-slate-800/40">
                <td className="p-2.5 text-slate-500">3</td>
                <td className="p-2.5 font-bold text-amber-400">ASSET REGISTER</td>
                <td className="p-2.5 text-amber-400">Master Data</td>
                <td className="p-2.5 font-sans">All physical gold items (bars, coins, jewellery) with 33 structured fields.</td>
                <td className="p-2.5 text-amber-300">LET, XLOOKUP, IFERROR, ROUND</td>
              </tr>
              <tr className="hover:bg-slate-800/40">
                <td className="p-2.5 text-slate-500">4</td>
                <td className="p-2.5 font-bold text-blue-400">PURCHASES</td>
                <td className="p-2.5 text-blue-400">Ledger</td>
                <td className="p-2.5 font-sans">Detailed acquisition ledger tracking gold value, making charges, and GST.</td>
                <td className="p-2.5 text-amber-300">SUM, [@[Gross Wt]]-[@[Stone Wt]]</td>
              </tr>
              <tr className="hover:bg-slate-800/40">
                <td className="p-2.5 text-slate-500">5</td>
                <td className="p-2.5 font-bold text-purple-400">SALES</td>
                <td className="p-2.5 text-purple-400">Ledger</td>
                <td className="p-2.5 font-sans">Sales register for tracking asset disposals and liquidation proceeds.</td>
                <td className="p-2.5 text-amber-300">[@[Net Proceeds]]</td>
              </tr>
              <tr className="hover:bg-slate-800/40">
                <td className="p-2.5 text-slate-500">7</td>
                <td className="p-2.5 font-bold text-zinc-300">MASTER DATA</td>
                <td className="p-2.5 text-zinc-400">Lookup</td>
                <td className="p-2.5 font-sans">Purity karat-to-fineness lookup table, locations, lockers, owners.</td>
                <td className="p-2.5 text-slate-500">Validation Tables</td>
              </tr>
              <tr className="hover:bg-slate-800/40">
                <td className="p-2.5 text-slate-500">8</td>
                <td className="p-2.5 font-bold text-cyan-400">TX HISTORY</td>
                <td className="p-2.5 text-cyan-400">Audit Trail</td>
                <td className="p-2.5 font-sans">Chronological timeline of acquisitions, sales, transfers.</td>
                <td className="p-2.5 text-amber-300">SORT, FILTER, UNIQUE</td>
              </tr>
              <tr className="hover:bg-slate-800/40">
                <td className="p-2.5 text-slate-500">9</td>
                <td className="p-2.5 font-bold text-rose-400">CALCULATIONS</td>
                <td className="p-2.5 text-rose-400">Engine</td>
                <td className="p-2.5 font-sans">Full mathematical specification and accounting rules documentation.</td>
                <td className="p-2.5 text-amber-300">Detailed Specs</td>
              </tr>
              <tr className="hover:bg-slate-800/40">
                <td className="p-2.5 text-slate-500">10</td>
                <td className="p-2.5 font-bold text-indigo-400">PIVOTS</td>
                <td className="p-2.5 text-indigo-400">Analytics</td>
                <td className="p-2.5 font-sans">Multi-dimensional summary reports with dynamic aggregations.</td>
                <td className="p-2.5 text-amber-300">Pivot Engine / GETPIVOTDATA</td>
              </tr>
              <tr className="hover:bg-slate-800/40">
                <td className="p-2.5 text-slate-500">11</td>
                <td className="p-2.5 font-bold text-teal-400">CHARTS</td>
                <td className="p-2.5 text-teal-400">Visuals</td>
                <td className="p-2.5 font-sans">Portfolio distribution, purity breakdown, and rate trends.</td>
                <td className="p-2.5 text-slate-500">Dynamic Ranges</td>
              </tr>
              <tr className="hover:bg-slate-800/40">
                <td className="p-2.5 text-slate-500">12</td>
                <td className="p-2.5 text-red-400">Integrity</td>
                <td className="p-2.5 font-sans">Automated scanning for duplicate IDs, overselling, and negative values.</td>
                <td className="p-2.5 text-amber-300">COUNTIF &gt; 1, ISERROR</td>
              </tr>
              <tr className="hover:bg-slate-800/40">
                <td className="p-2.5 text-slate-500">13</td>
                <td className="p-2.5 font-bold text-green-400">TEST CASES</td>
                <td className="p-2.5 text-green-400">QA Matrix</td>
                <td className="p-2.5 font-sans">15 pre-configured automated verification tests with PASS/FAIL tracking.</td>
                <td className="p-2.5 text-amber-300">Automated QA Matrix</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Purity & Conversion Standard Reference */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
          <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <Coins className="w-4 h-4 text-amber-400" />
            <span>Purity Standards & Fineness Multipliers</span>
          </h3>
          <p className="text-xs text-slate-400">
            Gold weight is normalized to 24K pure equivalent using exact standard fineness:
          </p>
          <div className="space-y-1.5 font-mono text-xs">
            <div className="flex justify-between p-2 bg-slate-950/70 rounded border border-slate-800/60">
              <span className="text-amber-300 font-bold">24K (999.9 Fineness)</span>
              <span className="text-slate-300">Pure Gold Weight = Net Wt × 0.999</span>
            </div>
            <div className="flex justify-between p-2 bg-slate-950/70 rounded border border-slate-800/60">
              <span className="text-amber-300 font-bold">22K (916 Fineness)</span>
              <span className="text-slate-300">Pure Gold Weight = Net Wt × 0.916</span>
            </div>
            <div className="flex justify-between p-2 bg-slate-950/70 rounded border border-slate-800/60">
              <span className="text-amber-300 font-bold">21K (875 Fineness)</span>
              <span className="text-slate-300">Pure Gold Weight = Net Wt × 0.875</span>
            </div>
            <div className="flex justify-between p-2 bg-slate-950/70 rounded border border-slate-800/60">
              <span className="text-amber-300 font-bold">18K (750 Fineness)</span>
              <span className="text-slate-300">Pure Gold Weight = Net Wt × 0.750</span>
            </div>
            <div className="flex justify-between p-2 bg-slate-950/70 rounded border border-slate-800/60">
              <span className="text-amber-300 font-bold">14K (585 Fineness)</span>
              <span className="text-slate-300">Pure Gold Weight = Net Wt × 0.585</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
          <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Accounting Rules</span>
          </h3>
          <ul className="text-xs text-slate-300 space-y-2 leading-relaxed">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Stone Weight Exclusion:</strong> Gemstones/diamonds are strictly subtracted from Gross Weight before gold weight calculations.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Charges Separation:</strong> Making charges, testing fees, and GST are tracked in total cost basis without inflating gold weight.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
