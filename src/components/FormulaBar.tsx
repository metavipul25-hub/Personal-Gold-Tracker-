import React from 'react';
import { FunctionSquare, Calculator } from 'lucide-react';

interface FormulaBarProps {
  activeCell?: string;
  formula?: string;
  selectedCellCoord?: string;
  selectedCellFormula?: string;
  isFormula?: boolean;
  onFormulaChange?: (val: string) => void;
}

export const FormulaBar: React.FC<FormulaBarProps> = ({
  activeCell,
  formula,
  selectedCellCoord,
  selectedCellFormula,
  isFormula = false
}) => {
  const cellCoord = activeCell || selectedCellCoord || 'A1';
  const formulaStr = String(formula ?? selectedCellFormula ?? '');

  return (
    <div id="excel-formula-bar" className="flex items-center gap-2 bg-slate-900 border-y border-slate-700/80 px-3 py-1.5 text-xs select-none">
      {/* Name Box (Cell Coordinate) */}
      <div className="flex items-center gap-1.5 bg-slate-800 border border-slate-700 rounded px-2.5 py-1 font-mono font-semibold text-emerald-400 min-w-[90px] justify-center shadow-inner">
        <Calculator className="w-3.5 h-3.5 text-emerald-400" />
        <span>{cellCoord}</span>
      </div>

      {/* Function / FX Icon */}
      <div className="flex items-center gap-1 px-1.5 py-0.5 text-slate-400 font-serif italic text-sm font-bold cursor-default" title="Structured Reference Formula">
        <FunctionSquare className="w-4 h-4 text-amber-400" />
        <span className="text-amber-400/90 font-mono text-xs">fx</span>
      </div>

      {/* Formula / Value Content Display */}
      <div className="flex-1 flex items-center bg-slate-800/90 border border-slate-700/80 rounded px-3 py-1 font-mono text-slate-200 overflow-x-auto whitespace-nowrap shadow-inner">
        {isFormula ? (
          <div className="flex items-center gap-1.5">
            <span className="text-amber-400 font-bold">=</span>
            <span className="text-emerald-300 font-semibold">{formulaStr.startsWith('=') ? formulaStr.slice(1) : formulaStr}</span>
            <span className="ml-2 text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/30 uppercase tracking-wider">
              Formula Cell (Protected)
            </span>
          </div>
        ) : (
          <span className="text-slate-300">{formulaStr || '<Select any table cell to inspect structured formula / value>'}</span>
        )}
      </div>
    </div>
  );
};
