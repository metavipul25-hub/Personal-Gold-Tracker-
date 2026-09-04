import React from 'react';
import { StoneRecord, MasterDataLists } from '../../types';
import { PlusCircle, Trash2 } from 'lucide-react';

interface StonesTabProps {
  stones: StoneRecord[];
  onChange: (stones: StoneRecord[]) => void;
  masterData?: MasterDataLists;
}

export const StonesTab: React.FC<StonesTabProps> = ({ stones, onChange, masterData }) => {
  const handleAddStone = () => {
    const newStone: StoneRecord = {
      id: `STN-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      stoneType: 'Diamond',
      quantity: 1,
      weight: 1.0,
      weightUnit: 'ct'
    };
    onChange([...stones, newStone]);
  };

  const updateStone = (index: number, updates: Partial<StoneRecord>) => {
    const updated = [...stones];
    updated[index] = { ...updated[index], ...updates };
    onChange(updated);
  };

  const removeStone = (index: number) => {
    const updated = [...stones];
    updated.splice(index, 1);
    onChange(updated);
  };

  const stoneTypes = masterData?.stoneTypes || [
    { id: 'Diamond', name: 'Diamond' },
    { id: 'Ruby', name: 'Ruby' },
    { id: 'Emerald', name: 'Emerald' },
    { id: 'Sapphire', name: 'Sapphire' }
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h3 className="text-sm font-semibold text-slate-200">Detailed Stone & Gemstone Composition</h3>
          <p className="text-xs text-slate-400">Track individual stones. Note: Gemstone Carat (ct) is different from Gold Karat (K). Physical stone weight in grams (if known) must be manually entered in the Core Details tab for gold accounting.</p>
        </div>
        <button
          type="button"
          onClick={handleAddStone}
          className="flex items-center gap-1.5 bg-emerald-600/90 hover:bg-emerald-500 text-white font-medium px-3 py-1.5 rounded-lg text-xs transition-colors"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Add Stone</span>
        </button>
      </div>

      {stones.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 text-center text-slate-400">
          No detailed stones added to this asset.
        </div>
      ) : (
        <div className="space-y-3">
          {stones.map((stone, index) => (
            <div key={stone.id} className="bg-slate-900 border border-slate-700 p-3 rounded-lg flex flex-col gap-3 relative">
              <div className="absolute top-2 right-2">
                <button
                  type="button"
                  onClick={() => removeStone(index)}
                  className="text-red-400 hover:text-red-300 p-1"
                  title="Remove Stone"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pr-6">
                <div>
                  <label className="block text-[10px] text-slate-400 font-medium mb-1">Stone Type</label>
                  <select
                    value={stone.stoneType}
                    onChange={(e) => updateStone(index, { stoneType: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-slate-200 text-xs"
                  >
                    {stoneTypes.map(t => (
                      <option key={t.id} value={t.name}>{t.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 font-medium mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={stone.quantity}
                    onChange={(e) => updateStone(index, { quantity: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 font-medium mb-1">Total Weight</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={stone.weight}
                    onChange={(e) => updateStone(index, { weight: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 font-medium mb-1">Unit</label>
                  <select
                    value={stone.weightUnit}
                    onChange={(e) => updateStone(index, { weightUnit: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-slate-200 text-xs"
                  >
                    <option value="ct">Carats (ct)</option>
                    <option value="g">Grams (g)</option>
                    <option value="pieces">Pieces</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[10px] text-slate-400 font-medium mb-1">Shape / Cut</label>
                  <input
                    type="text"
                    value={stone.shapeCut || ''}
                    onChange={(e) => updateStone(index, { shapeCut: e.target.value })}
                    placeholder="e.g. Round"
                    className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 font-medium mb-1">Color & Clarity</label>
                  <div className="flex gap-1">
                    <input
                      type="text"
                      value={stone.color || ''}
                      onChange={(e) => updateStone(index, { color: e.target.value })}
                      placeholder="Color"
                      className="w-1/2 bg-slate-950 border border-slate-800 rounded p-1.5 text-slate-200 text-xs"
                    />
                    <input
                      type="text"
                      value={stone.clarity || ''}
                      onChange={(e) => updateStone(index, { clarity: e.target.value })}
                      placeholder="Clarity"
                      className="w-1/2 bg-slate-950 border border-slate-800 rounded p-1.5 text-slate-200 text-xs"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 font-medium mb-1">Certificate Issuer</label>
                  <input
                    type="text"
                    value={stone.certificateIssuer || ''}
                    onChange={(e) => updateStone(index, { certificateIssuer: e.target.value })}
                    placeholder="e.g. GIA"
                    className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 font-medium mb-1">Certificate Number</label>
                  <input
                    type="text"
                    value={stone.certificateNumber || ''}
                    onChange={(e) => updateStone(index, { certificateNumber: e.target.value })}
                    placeholder="XXXXX"
                    className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-slate-200 text-xs"
                  />
                </div>
              </div>
            </div>
          ))}
          
          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 text-xs flex justify-between">
            <span className="text-slate-400">Total Stones: <span className="font-bold text-amber-400">{stones.reduce((acc, s) => acc + (s.quantity || 0), 0)}</span></span>
            <span className="text-slate-400">Total Carats (approx): <span className="font-bold text-amber-400">{stones.filter(s => s.weightUnit === 'ct').reduce((acc, s) => acc + (s.weight || 0), 0).toFixed(2)} ct</span></span>
          </div>
        </div>
      )}
    </div>
  );
};
