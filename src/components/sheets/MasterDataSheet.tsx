import React, { useState } from 'react';
import { Database, Plus, ChevronRight, Hash, Edit2, Check, X } from 'lucide-react';
import { MasterDataLists, MasterDataRecord, PurityMasterRecord } from '../../types';

interface MasterDataSheetProps {
  masterData?: MasterDataLists;
  setMasterData?: any;
}

const MASTER_DATA_GROUPS = [
  {
    id: 'metals',
    title: '🥇 Metal & Purity',
    lists: [
      { key: 'metalTypes', label: 'Metal' },
      { key: 'purities', label: 'Karat / Purity' },
      { key: 'finenesses', label: 'Fineness' },
      { key: 'weightUnits', label: 'Weight Units' },
    ]
  },
  {
    id: 'stones',
    title: '💎 Stones',
    lists: [
      { key: 'stoneTypes', label: 'Stone Type' },
      { key: 'stoneNames', label: 'Stone Name' },
      { key: 'stoneShapes', label: 'Shape / Cut' },
      { key: 'stoneColors', label: 'Color' },
      { key: 'stoneClarity', label: 'Clarity' },
      { key: 'stoneTreatments', label: 'Treatment' },
      { key: 'stoneOrigins', label: 'Origin' },
      { key: 'stoneGrades', label: 'Grade' },
      { key: 'stoneSettings', label: 'Setting' },
      { key: 'certificateIssuers', label: 'Certificate Issuer' },
    ]
  },
  {
    id: 'assets',
    title: '💍 Assets',
    lists: [
      { key: 'assetTypes', label: 'Asset Type' },
      { key: 'categories', label: 'Jewellery Category' },
      { key: 'subcategories', label: 'Jewellery Subcategory' },
      { key: 'assetGroups', label: 'Asset Group' },
    ]
  },
  {
    id: 'people',
    title: '👤 People & Ownership',
    lists: [
      { key: 'owners', label: 'Owner' },
      { key: 'relationships', label: 'Relationship' },
      { key: 'ownershipTypes', label: 'Ownership Type' },
    ]
  },
  {
    id: 'locations',
    title: '🏠 Locations',
    lists: [
      { key: 'locations', label: 'Location' },
      { key: 'locationTypes', label: 'Location Type' },
    ]
  },
  {
    id: 'acquisition',
    title: '📜 Acquisition',
    lists: [
      { key: 'acquisitionTypes', label: 'Acquisition Type' },
      { key: 'purchaseSources', label: 'Purchase Source' },
      { key: 'originalSources', label: 'Original Source' },
    ]
  },
  {
    id: 'transactions',
    title: '🔄 Transactions',
    lists: [
      { key: 'transactionTypes', label: 'Transaction Type' },
      { key: 'transactionStatuses', label: 'Transaction Status' },
    ]
  },
  {
    id: 'status',
    title: '📊 Status',
    lists: [
      { key: 'assetStatuses', label: 'Asset Status' },
      { key: 'pledgeStatuses', label: 'Pledge Status' },
      { key: 'auditStatuses', label: 'Audit Status' },
    ]
  },
  {
    id: 'documents',
    title: '📄 Documents',
    lists: [
      { key: 'documentTypes', label: 'Document Type' },
      { key: 'documentStatuses', label: 'Document Status' },
    ]
  },
  {
    id: 'validation',
    title: '🔍 Validation / Audit',
    lists: [
      { key: 'issueTypes', label: 'Issue Type' },
      { key: 'issueSeverities', label: 'Issue Severity' },
    ]
  },
  {
    id: 'goals',
    title: '🎯 Goals & SIP',
    lists: [
      { key: 'goalTypes', label: 'Goal Type' },
      { key: 'goalPriorities', label: 'Goal Priority' },
      { key: 'goalStatuses', label: 'Goal Status' },
      { key: 'sipFrequencies', label: 'SIP Frequency' },
      { key: 'sipStatuses', label: 'SIP Status' },
    ]
  },
  {
    id: 'system',
    title: '⚙️ System',
    lists: [
      { key: 'currencies', label: 'Currency' },
      { key: 'units', label: 'Units' },
      { key: 'dateFormats', label: 'Date Format' },
      { key: 'displayPreferences', label: 'Display Preferences' },
    ]
  }
];

export const MasterDataSheet: React.FC<MasterDataSheetProps> = ({ masterData, setMasterData }) => {
  const [activeGroupId, setActiveGroupId] = useState<string>(MASTER_DATA_GROUPS[0].id);
  const [activeListKey, setActiveListKey] = useState<keyof MasterDataLists>(MASTER_DATA_GROUPS[0].lists[0].key as keyof MasterDataLists);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  if (!masterData) return null;

  const activeGroup = MASTER_DATA_GROUPS.find(g => g.id === activeGroupId);
  const activeListConfig = activeGroup?.lists.find(l => l.key === activeListKey);
  const currentList = (masterData[activeListKey] as MasterDataRecord[] | undefined) || [];

  const handleGroupClick = (groupId: string) => {
    setActiveGroupId(groupId);
    const group = MASTER_DATA_GROUPS.find(g => g.id === groupId);
    if (group && group.lists.length > 0) {
      setActiveListKey(group.lists[0].key as keyof MasterDataLists);
    }
    setEditingId(null);
  };

  const handleListClick = (listKey: string) => {
    setActiveListKey(listKey as keyof MasterDataLists);
    setEditingId(null);
  };

  const handleAddItem = () => {
    const newVal = window.prompt(`Add new item to ${activeListConfig?.label}:`);
    if (newVal && newVal.trim() && setMasterData) {
      const isStringList = currentList.length > 0 && typeof currentList[0] === 'string';
      const cleanVal = newVal.trim();
      const lowerVal = cleanVal.toLowerCase();

      // Check for dupe
      const isDupe = currentList.find(i => {
        const iName = typeof i === 'string' ? i : i.name;
        return iName && iName.toLowerCase() === lowerVal;
      });

      if (isDupe) {
        alert('Value already exists!');
        return;
      }
      
      let newItem: any = cleanVal;
      
      if (!isStringList) {
        newItem = {
          id: `MST-${Date.now().toString().slice(-6)}`,
          name: cleanVal,
          isActive: true
        };

        if (activeListKey === 'purities') {
          newItem = {
            ...newItem,
            karat: cleanVal,
            fineness: 0,
            percentage: 0
          };
        }
      }

      setMasterData({
        ...masterData,
        [activeListKey]: [...currentList, newItem]
      });
    }
  };

  const handleToggleActive = (id: string) => {
    if (setMasterData) {
      setMasterData({
        ...masterData,
        [activeListKey]: currentList.map(item => {
          if (typeof item === 'string') return item;
          return item.id === id ? { ...item, isActive: !item.isActive } : item;
        })
      });
    }
  };

  const startEditing = (item: MasterDataRecord) => {
    setEditingId(item.id);
    setEditValue(item.name);
  };

  const saveEdit = (id: string) => {
    if (editValue.trim() && setMasterData) {
      const cleanVal = editValue.trim();
      const lowerVal = cleanVal.toLowerCase();
      
      // Check for dupe
      const isDupe = currentList.find(i => {
        const iId = typeof i === 'string' ? i : i.id;
        const iName = typeof i === 'string' ? i : i.name;
        return iId !== id && iName && iName.toLowerCase() === lowerVal;
      });

      if (isDupe) {
        alert('Name already exists!');
        return;
      }

      setMasterData({
        ...masterData,
        [activeListKey]: currentList.map(item => {
          const itemId = typeof item === 'string' ? item : item.id;
          if (itemId === id) {
            return typeof item === 'string' ? cleanVal : { ...item, name: cleanVal };
          }
          return item;
        })
      });
    }
    setEditingId(null);
  };

  return (
    <div id="sheet-master-data-container" className="p-5 max-w-7xl mx-auto space-y-6 text-slate-100 pb-20">
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex items-center gap-3 shadow-sm">
        <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-500">
          <Database className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-slate-100">Enterprise Master Data Registry</h2>
          <p className="text-xs text-slate-400">
            Authoritative source for standardized business definitions across the Gold Tracker ecosystem.
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Left Sidebar - Groups */}
        <div className="w-full md:w-64 flex-shrink-0 space-y-1">
          {MASTER_DATA_GROUPS.map(group => (
            <button
              key={group.id}
              onClick={() => handleGroupClick(group.id)}
              className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeGroupId === group.id 
                  ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-300'
              }`}
            >
              {group.title}
            </button>
          ))}
        </div>

        {/* Middle Column - Sub-lists for active group */}
        <div className="w-full md:w-56 flex-shrink-0 space-y-1 bg-slate-900/50 p-2 rounded-xl border border-slate-800">
          {activeGroup?.lists.map(list => (
            <button
              key={list.key}
              onClick={() => handleListClick(list.key)}
              className={`w-full text-left px-3 py-2.5 rounded-md text-sm transition-colors flex items-center justify-between ${
                activeListKey === list.key 
                  ? 'bg-slate-800 text-white shadow-sm' 
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-300'
              }`}
            >
              <span>{list.label}</span>
              {activeListKey === list.key && <ChevronRight className="w-4 h-4 text-slate-500" />}
            </button>
          ))}
        </div>

        {/* Right Content - Records */}
        <div className="flex-1 min-w-0">
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col h-[600px]">
            {/* Header */}
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/80">
              <div>
                <h3 className="font-semibold text-slate-100">{activeListConfig?.label}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{currentList.length} defined records</p>
              </div>
              <button
                onClick={handleAddItem}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-900 font-medium rounded-lg text-sm flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-4 h-4" /> Add Record
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
              {currentList.map((item, index) => {
                const itemId = item.id || (typeof item === 'string' ? item : `idx-${index}`);
                const itemName = item.name || (typeof item === 'string' ? item : 'Unknown');
                const isItemActive = item.isActive !== false;
                
                return (
                <div 
                  key={itemId} 
                  className={`flex items-center justify-between p-3 rounded-lg border ${isItemActive ? 'bg-slate-800/50 border-slate-700/50' : 'bg-slate-900/30 border-slate-800/50 opacity-70'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-slate-900 rounded-md border border-slate-800 text-slate-500">
                      <Hash className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      {editingId === itemId ? (
                        <div className="flex items-center gap-2">
                          <input 
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && saveEdit(itemId)}
                            className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-amber-500 w-48"
                            autoFocus
                          />
                          <button onClick={() => saveEdit(itemId)} className="p-1 text-emerald-400 hover:bg-emerald-400/10 rounded">
                            <Check className="w-4 h-4" />
                          </button>
                          <button onClick={() => setEditingId(null)} className="p-1 text-slate-400 hover:bg-slate-800 rounded">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <p className={`font-medium text-sm ${isItemActive ? 'text-slate-200' : 'text-slate-500'}`}>
                            {itemName}
                          </p>
                          <button 
                            onClick={() => startEditing(typeof item === 'string' ? { id: itemId, name: itemName, isActive: true } : item)}
                            className="p-1 text-slate-500 hover:text-slate-300 transition-colors opacity-0 group-hover:opacity-100"
                            title="Edit Name"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                      
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-0.5">{itemId}</p>
                      
                      {activeListKey === 'purities' && typeof item !== 'string' && (item as PurityMasterRecord).percentage > 0 && (
                        <div className="mt-1 flex gap-2">
                          <span className="text-[10px] bg-slate-900 px-1.5 py-0.5 rounded text-slate-400">
                            Fineness: {(item as PurityMasterRecord).fineness}
                          </span>
                          <span className="text-[10px] bg-slate-900 px-1.5 py-0.5 rounded text-slate-400">
                            {(item as PurityMasterRecord).percentage}%
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleToggleActive(itemId)}
                    className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${
                      isItemActive 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20' 
                        : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    {isItemActive ? 'Active' : 'Inactive'}
                  </button>
                </div>
              )})}
              
              {currentList.length === 0 && (
                <div className="text-center py-10">
                  <p className="text-slate-500 text-sm">No records defined in this category.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
