import React, { useState, useEffect } from 'react';
import { LifeGoal, AssetRecord } from '../../types';
import { X, Save, Trash, Target } from 'lucide-react';

interface LifeGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (goal: LifeGoal) => void;
  onDelete?: (id: string) => void;
  goal?: LifeGoal;
  assets: AssetRecord[];
}

export const LifeGoalModal: React.FC<LifeGoalModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  goal,
  assets,
}) => {
  const [formData, setFormData] = useState<Partial<LifeGoal>>({
    name: '',
    category: 'Retirement',
    targetWeightGrams: 0,
    targetValueINR: 0,
    targetYear: new Date().getFullYear() + 5,
    allocatedAssetIds: [],
    notes: '',
  });

  useEffect(() => {
    if (goal) {
      setFormData(goal);
    } else {
      setFormData({
        id: `GL-${Date.now().toString().slice(-6)}`,
        name: '',
        category: 'Retirement',
        targetWeightGrams: 0,
        targetValueINR: 0,
        targetYear: new Date().getFullYear() + 5,
        allocatedAssetIds: [],
        notes: '',
      });
    }
  }, [goal, isOpen]);

  if (!isOpen) return null;

  const handleToggleAsset = (assetId: string) => {
    const current = formData.allocatedAssetIds || [];
    if (current.includes(assetId)) {
      setFormData({ ...formData, allocatedAssetIds: current.filter(id => id !== assetId) });
    } else {
      setFormData({ ...formData, allocatedAssetIds: [...current, assetId] });
    }
  };

  const handleSave = () => {
    if (!formData.name || formData.targetWeightGrams === undefined) return;
    onSave(formData as LifeGoal);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">
        
        <div className="bg-slate-950 border-b border-slate-800 p-4 flex items-center justify-between rounded-t-2xl">
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Target className="w-5 h-5 text-pink-400" />
            {goal ? 'Edit Life Goal' : 'Create New Life Goal'}
          </h3>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto scrollbar-thin text-slate-200 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Goal Name</label>
              <input type="text" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm focus:border-pink-500 focus:outline-none" placeholder="e.g. Daughter's Wedding" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Category</label>
              <select value={formData.category || 'Retirement'} onChange={e => setFormData({...formData, category: e.target.value as any})} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm focus:border-pink-500 focus:outline-none">
                <option value="Retirement">Retirement</option>
                <option value="Child Education">Child Education</option>
                <option value="Child Marriage">Child Marriage</option>
                <option value="Emergency Reserve">Emergency Reserve</option>
                <option value="Financial Independence">Financial Independence</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Target Weight (g)</label>
              <input type="number" min="0" step="1" value={formData.targetWeightGrams || ''} onChange={e => setFormData({...formData, targetWeightGrams: Number(e.target.value)})} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm focus:border-pink-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Target Year</label>
              <input type="number" min="2020" max="2100" step="1" value={formData.targetYear || ''} onChange={e => setFormData({...formData, targetYear: Number(e.target.value)})} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm focus:border-pink-500 focus:outline-none" />
            </div>
            <div className="col-span-full">
              <label className="block text-sm font-medium text-slate-400 mb-1">Notes</label>
              <textarea value={formData.notes || ''} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm focus:border-pink-500 focus:outline-none h-20" placeholder="Optional notes..."></textarea>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-800">
            <h4 className="text-sm font-bold text-slate-100 mb-3">Allocated Assets</h4>
            <div className="max-h-48 overflow-y-auto border border-slate-800 rounded-lg bg-slate-950">
              {assets.filter(a => a.status !== 'Sold').length === 0 ? (
                <div className="p-4 text-center text-sm text-slate-500">No active assets available for allocation.</div>
              ) : (
                <div className="divide-y divide-slate-800">
                  {assets.filter(a => a.status !== 'Sold').map(asset => (
                    <label key={asset.assetId} className="flex items-center gap-3 p-3 hover:bg-slate-900 cursor-pointer transition-colors">
                      <input 
                        type="checkbox" 
                        checked={(formData.allocatedAssetIds || []).includes(asset.assetId)}
                        onChange={() => handleToggleAsset(asset.assetId)}
                        className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-pink-500 focus:ring-pink-500 focus:ring-offset-slate-950"
                      />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-slate-200">{asset.assetName}</div>
                        <div className="text-xs text-slate-500">{asset.assetId} &bull; {asset.netGoldWeight}g Net</div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-900 flex justify-between items-center rounded-b-2xl">
          {goal && onDelete ? (
            <button onClick={() => { onDelete(goal.id); onClose(); }} className="px-4 py-2 text-sm font-medium text-red-400 bg-red-400/10 hover:bg-red-400/20 rounded-lg transition-colors flex items-center gap-2">
              <Trash className="w-4 h-4" /> Delete
            </button>
          ) : <div></div>}
          
          <div className="flex gap-3">
            <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors">
              Cancel
            </button>
            <button onClick={handleSave} disabled={!formData.name} className="px-5 py-2 text-sm font-bold text-slate-900 bg-pink-500 hover:bg-pink-400 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm transition-colors flex items-center gap-2">
              <Save className="w-4 h-4" /> Save Goal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
