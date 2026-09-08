import React, { useState } from 'react';
import { LifeGoal, AssetRecord } from '../../types';
import { Target, Star, FileText, Plus, Edit2 } from 'lucide-react';
import { LifeGoalModal } from '../modals/LifeGoalModal';

interface LifeGoalsSheetProps {
  goals: LifeGoal[];
  assets: AssetRecord[];
  setLifeGoals?: (goals: LifeGoal[]) => void;
}

export const LifeGoalsSheet: React.FC<LifeGoalsSheetProps> = ({ goals, assets, setLifeGoals }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<LifeGoal | undefined>(undefined);

  const handleSaveGoal = (goal: LifeGoal) => {
    if (!setLifeGoals) return;
    const existingIndex = goals.findIndex(g => g.id === goal.id);
    if (existingIndex >= 0) {
      const updated = [...goals];
      updated[existingIndex] = goal;
      setLifeGoals(updated);
    } else {
      setLifeGoals([...goals, goal]);
    }
  };

  const handleDeleteGoal = (id: string) => {
    if (!setLifeGoals) return;
    setLifeGoals(goals.filter(g => g.id !== id));
  };

  return (
    <div id="sheet-goals-container" className="p-4 space-y-4 text-slate-100 flex flex-col h-full">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-pink-500/10 border border-pink-500/30 rounded-lg text-pink-400">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-100">Life Goals & Generational Allocations</h2>
              <span className="text-[10px] bg-slate-800 text-slate-300 border border-slate-700 px-1.5 py-0.5 rounded font-mono">Table: tbl_LifeGoals</span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Future financial objectives backed by physical gold assets
            </p>
          </div>
        </div>
        {setLifeGoals && (
          <button 
            onClick={() => { setSelectedGoal(undefined); setIsModalOpen(true); }}
            className="px-3 py-1.5 bg-pink-500 hover:bg-pink-400 text-slate-950 text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Goal
          </button>
        )}
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-sm overflow-hidden flex-1 flex flex-col">
        <div className="overflow-x-auto overflow-y-auto flex-1">
          <table className="w-full text-left border-collapse text-xs whitespace-nowrap">
            <thead className="bg-slate-950/80 text-slate-400 font-semibold sticky top-0 z-10 border-b border-slate-800">
              <tr>
                <th className="p-2.5 border-r border-slate-800 font-mono text-[10px] uppercase">Goal ID</th>
                <th className="p-2.5 border-r border-slate-800">Goal Name</th>
                <th className="p-2.5 border-r border-slate-800">Category</th>
                <th className="p-2.5 border-r border-slate-800 text-right">Target Year</th>
                <th className="p-2.5 border-r border-slate-800 text-right">Target Weight (g)</th>
                <th className="p-2.5 border-r border-slate-800 text-right">Current Allocated (g)</th>
                <th className="p-2.5 border-r border-slate-800">Progress</th>
                <th className="p-2.5">Allocated Assets</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-mono text-slate-300">
              {goals.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500 font-sans">
                    No life goals defined.
                  </td>
                </tr>
              ) : (
                goals.map(goal => {
                  const allocatedAssets = assets.filter(a => goal.allocatedAssetIds.includes(a.assetId));
                  const currentAllocatedWeight = allocatedAssets.reduce((sum, a) => sum + (a.netGoldWeight ?? 0), 0);
                  const progressPct = goal.targetWeightGrams > 0 ? Math.min(100, Math.round((currentAllocatedWeight / goal.targetWeightGrams) * 100)) : 0;
                  
                  return (
                    <tr key={goal.id} className="hover:bg-slate-800/40 group transition-colors">
                      <td className="p-2.5 border-r border-slate-800/60 font-medium text-slate-400">{goal.id}</td>
                      <td className="p-2.5 border-r border-slate-800/60 font-sans font-medium text-slate-200">{goal.name}</td>
                      <td className="p-2.5 border-r border-slate-800/60 font-sans text-pink-300">{goal.category}</td>
                      <td className="p-2.5 border-r border-slate-800/60 text-right">{goal.targetYear}</td>
                      <td className="p-2.5 border-r border-slate-800/60 text-right font-bold text-amber-400">{goal.targetWeightGrams} g</td>
                      <td className="p-2.5 border-r border-slate-800/60 text-right font-bold text-amber-200">{currentAllocatedWeight.toFixed(2)} g</td>
                      <td className="p-2.5 border-r border-slate-800/60 font-sans">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `\${progressPct}%` }}></div>
                          </div>
                          <span className="text-[10px]">{progressPct}%</span>
                        </div>
                      </td>
                      <td className="p-2.5 font-sans text-[10px] text-slate-400">
                        <div className="flex items-center justify-between gap-2">
                          <span>{goal.allocatedAssetIds.length > 0 ? goal.allocatedAssetIds.join(', ') : 'None'}</span>
                          {setLifeGoals && (
                            <button 
                              onClick={() => { setSelectedGoal(goal); setIsModalOpen(true); }}
                              className="p-1 hover:bg-slate-700 rounded text-slate-300"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      {isModalOpen && (
        <LifeGoalModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveGoal}
          onDelete={handleDeleteGoal}
          goal={selectedGoal}
          assets={assets}
        />
      )}
    </div>
  );
};
