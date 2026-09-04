import React from 'react';
import { Database, ShieldCheck, CheckCircle2, Plus } from 'lucide-react';
import { PURITY_MASTER_DATA } from '../../utils/calculations';
import { MasterDataLists } from '../../types';


import { AssetRecord, TransactionHistoryRecord } from '../../types';
export const MasterDataSheet: React.FC<{masterData?: MasterDataLists, setMasterData?: any, assets?: AssetRecord[], transactions?: TransactionHistoryRecord[]}> = ({ masterData, setMasterData, assets, transactions }) => {
  const [activeTab, setActiveTab] = React.useState<keyof MasterDataLists>('locations');

  const handleAddItem = (listKey: keyof MasterDataLists) => {
    const newVal = window.prompt(`Add new item to ${listKey}:`);
    if (newVal && newVal.trim() && masterData && setMasterData) {
      const list = masterData[listKey];
      if (list.length > 0 && typeof list[0] === 'object') {
        const objList = list as any[];
        if (objList.find(i => i.name.toLowerCase() === newVal.trim().toLowerCase())) {
            alert('Value already exists!');
            return;
        }
        
        let newItem: any = {
           id: 'MST-' + Date.now().toString().slice(-6),
           name: newVal.trim(),
           isActive: true
        };
        
        if (listKey === 'purities') {
            newItem = {
                ...newItem,
                karat: newVal.trim(),
                fineness: 0,
                percentage: 0
            };
        }
        
        setMasterData({
          ...masterData,
          [listKey]: [...objList, newItem]
        });
      } else {
        // String array
        const strList = list as string[];
        if (strList.includes(newVal.trim())) {
            alert('Value already exists!');
            return;
        }
        setMasterData({
          ...masterData,
          [listKey]: [...strList, newVal.trim()]
        });
      }
    }
  };

  const handleToggleActive = (listKey: keyof MasterDataLists, id: string) => {
     if (masterData && setMasterData) {
        const list = masterData[listKey] as any[];
        setMasterData({
           ...masterData,
           [listKey]: list.map(item => item.id === id ? { ...item, isActive: !item.isActive } : item)
        });
     }
  };

  const handleEditName = (listKey: keyof MasterDataLists, id: string, currentName: string) => {
     const newVal = window.prompt(`Edit name for ${currentName}:`, currentName);
     if (newVal && newVal.trim() && masterData && setMasterData) {
        const list = masterData[listKey] as any[];
        // Check dupe
        if (list.find(i => i.id !== id && i.name.toLowerCase() === newVal.trim().toLowerCase())) {
            alert('Name already exists!');
            return;
        }
        setMasterData({
           ...masterData,
           [listKey]: list.map(item => item.id === id ? { ...item, name: newVal.trim() } : item)
        });
     }
  };

  if (!masterData) return null;

  const listsToRender = [
    { key: 'locations', title: 'Locations', color: 'emerald' },
    { key: 'owners', title: 'Owners', color: 'indigo' },
    { key: 'categories', title: 'Asset Categories', color: 'blue' },
    { key: 'assetTypes', title: 'Asset Types', color: 'amber' },
    { key: 'metalTypes', title: 'Metal Types', color: 'zinc' },
    { key: 'purities', title: 'Purities', color: 'yellow' },
    { key: 'transactionTypes', title: 'Transaction Types', color: 'cyan' },
  ] as const;

  return (
    <div id="sheet-master-data-container" className="p-5 max-w-6xl mx-auto space-y-6 text-slate-100 pb-20">
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex items-center gap-3 shadow-sm">
        <div className="p-2.5 bg-zinc-500/10 border border-zinc-500/30 rounded-lg text-zinc-300">
          <Database className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-slate-100">Master Data Governance</h2>
          <p className="text-xs text-slate-400">
            Authoritative source for standard business definitions. Referenced by all assets and transactions.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1 space-y-1">
           {listsToRender.map(list => (
              <button 
                 key={list.key}
                 onClick={() => setActiveTab(list.key)}
                 className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === list.key ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-300'}`}
              >
                 {list.title}
              </button>
           ))}
        </div>
        <div className="md:col-span-3">
           {listsToRender.filter(l => l.key === activeTab).map(list => {
              const currentList = (masterData[list.key] || []) as any[];
              return (
                 <div key={list.key} className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                       <h3 className={`text-sm font-bold uppercase tracking-wider text-${list.color}-400 flex items-center gap-2`}>
                          {list.title}
                       </h3>
                       <button 
                          onClick={() => handleAddItem(list.key)}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1 transition-colors"
                       >
                          <Plus className="w-4 h-4" /> Add Record
                       </button>
                    </div>
                    
                    <div className="overflow-x-auto">
                       <table className="w-full text-sm text-left">
                          <thead className="text-xs text-slate-400 bg-slate-950/50">
                             <tr>
                                <th className="py-2 px-3">ID / Reference</th>
                                <th className="py-2 px-3">Name</th>
                                <th className="py-2 px-3">Status</th>
                                <th className="py-2 px-3 text-right">Actions</th>
                             </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800">
                             {currentList.map(item => (
                                <tr key={item.id} className={`${!item.isActive ? 'opacity-50' : ''} hover:bg-slate-800/20`}>
                                   <td className="py-2.5 px-3 font-mono text-xs text-slate-500">{item.id}</td>
                                   <td className="py-2.5 px-3 font-medium text-slate-300">{item.name}</td>
                                   <td className="py-2.5 px-3">
                                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${item.isActive ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-800' : 'bg-slate-800 text-slate-400 border border-slate-700'}`}>
                                         {item.isActive ? 'Active' : 'Inactive'}
                                      </span>
                                   </td>
                                   <td className="py-2.5 px-3 text-right space-x-2">
                                      <button onClick={() => handleEditName(list.key, item.id, item.name)} className="text-blue-400 hover:text-blue-300 text-xs font-medium">Edit</button>
                                      <button onClick={() => handleToggleActive(list.key, item.id)} className={`text-xs font-medium ${item.isActive ? 'text-amber-400 hover:text-amber-300' : 'text-emerald-400 hover:text-emerald-300'}`}>
                                         {item.isActive ? 'Deactivate' : 'Activate'}
                                      </button>
                                   </td>
                                </tr>
                             ))}
                          </tbody>
                       </table>
                    </div>
                 </div>
              );
           })}
        </div>
      </div>
    </div>
  );
};

