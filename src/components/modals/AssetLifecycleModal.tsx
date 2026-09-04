import React, { useMemo } from 'react';
import { AssetRecord, TransactionHistoryRecord } from '../../types';
import { getAssetLifecycle } from '../../utils/lifecycle';
import { X, ArrowRight, ArrowDown, Activity, User, MapPin, Scale, Coins, Calendar, FileText } from 'lucide-react';

interface AssetLifecycleModalProps {
  assetId: string;
  assets: AssetRecord[];
  transactions: TransactionHistoryRecord[];
  onClose: () => void;
  onNavigateToAsset: (id: string) => void;
}

export const AssetLifecycleModal: React.FC<AssetLifecycleModalProps> = ({ assetId, assets, transactions, onClose, onNavigateToAsset }) => {
  const lifecycle = useMemo(() => getAssetLifecycle(assetId, assets, transactions), [assetId, assets, transactions]);

  if (!lifecycle) return null;

  const renderRelationships = () => {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-4">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Lineage & Relationships</h3>
        
        {lifecycle.parentIds.length > 0 && (
          <div>
            <div className="text-xs text-slate-500 font-semibold mb-1">Derived From (Parent)</div>
            <div className="flex gap-2">
              {lifecycle.parentIds.map(id => (
                <button key={id} onClick={() => onNavigateToAsset(id)} className="px-2 py-1 bg-white border border-slate-300 rounded text-xs font-mono text-blue-600 hover:bg-blue-50">
                  {id}
                </button>
              ))}
            </div>
          </div>
        )}

        {lifecycle.mergeSourceIds.length > 0 && (
          <div>
            <div className="text-xs text-slate-500 font-semibold mb-1">Merged From (Sources)</div>
            <div className="flex flex-wrap gap-2">
              {lifecycle.mergeSourceIds.map(id => (
                <button key={id} onClick={() => onNavigateToAsset(id)} className="px-2 py-1 bg-white border border-slate-300 rounded text-xs font-mono text-purple-600 hover:bg-purple-50">
                  {id}
                </button>
              ))}
            </div>
          </div>
        )}

        {lifecycle.splitIntoIds.length > 0 && (
          <div>
            <div className="text-xs text-slate-500 font-semibold mb-1">Split Into (Children)</div>
            <div className="flex flex-wrap gap-2">
              {lifecycle.splitIntoIds.map(id => (
                <button key={id} onClick={() => onNavigateToAsset(id)} className="px-2 py-1 bg-white border border-slate-300 rounded text-xs font-mono text-emerald-600 hover:bg-emerald-50">
                  {id}
                </button>
              ))}
            </div>
          </div>
        )}

        {lifecycle.mergedIntoId && (
          <div>
            <div className="text-xs text-slate-500 font-semibold mb-1">Merged Into (Target)</div>
            <button onClick={() => onNavigateToAsset(lifecycle.mergedIntoId!)} className="px-2 py-1 bg-white border border-slate-300 rounded text-xs font-mono text-orange-600 hover:bg-orange-50">
              {lifecycle.mergedIntoId}
            </button>
          </div>
        )}

        {lifecycle.parentIds.length === 0 && lifecycle.mergeSourceIds.length === 0 && lifecycle.splitIntoIds.length === 0 && !lifecycle.mergedIntoId && (
          <div className="text-sm text-slate-500 italic">No complex lineage (standalone asset).</div>
        )}
      </div>
    );
  };

  const renderTimeline = () => {
    return (
      <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
        {lifecycle.timeline.map((event, index) => {
          const isPositive = event.impactGross > 0;
          const isNegative = event.impactGross < 0;
          const isNeutral = event.impactGross === 0;

          return (
            <div key={event.txId} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              
              <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-100 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                <Activity className="w-4 h-4" />
              </div>

              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="flex justify-between items-start mb-1">
                  <span className="font-bold text-slate-800 text-sm">{event.type}</span>
                  <span className="text-xs font-mono text-slate-500">{event.date}</span>
                </div>
                <div className="text-xs text-slate-500 mb-2 font-mono">TX: {event.txId}</div>
                
                {event.description && <div className="text-sm text-slate-600 mb-3">{event.description}</div>}

                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2 rounded">
                  <div>
                    <span className="text-slate-400 block">Impact Gross</span>
                    <span className={`font-mono font-medium ${isPositive ? 'text-emerald-600' : isNegative ? 'text-red-600' : 'text-slate-600'}`}>
                      {event.impactGross > 0 ? '+' : ''}{event.impactGross.toFixed(3)}g
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Balance Gross</span>
                    <span className="font-mono font-bold text-slate-800">{event.balanceGross.toFixed(3)}g</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Impact Fine</span>
                    <span className={`font-mono font-medium ${isPositive ? 'text-emerald-600' : isNegative ? 'text-red-600' : 'text-slate-600'}`}>
                      {event.impactFine > 0 ? '+' : ''}{event.impactFine.toFixed(3)}g
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Balance Fine</span>
                    <span className="font-mono font-bold text-slate-800">{event.balanceFine.toFixed(3)}g</span>
                  </div>
                </div>

                <div className="mt-3 flex gap-4 text-xs text-slate-500">
                  <div className="flex items-center gap-1"><User className="w-3 h-3"/> {event.owner}</div>
                  <div className="flex items-center gap-1"><MapPin className="w-3 h-3"/> {event.location}</div>
                </div>

              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-600"/> 
              Lifecycle: {lifecycle.assetId} - {lifecycle.assetName}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-200 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50 flex flex-col md:flex-row gap-6">
          
          {/* Left Column: Summary & Lineage */}
          <div className="w-full md:w-1/3 space-y-6">
            
            <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">Origin Information</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500">Date</span>
                  <span className="font-mono">{lifecycle.originDate}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500">Origin Type</span>
                  <span className="font-medium">{lifecycle.originType}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500">Original Gross</span>
                  <span className="font-mono">{lifecycle.originalGross.toFixed(3)}g</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500">Original Fine</span>
                  <span className="font-mono">{lifecycle.originalFine.toFixed(3)}g</span>
                </div>
              </div>
            </div>

            {renderRelationships()}

            <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 shadow-sm text-white">
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4">Current State</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between border-b border-slate-700 pb-2">
                  <span className="text-slate-400">Status</span>
                  <span className={`font-bold ${lifecycle.currentState.quantity > 0 ? 'text-emerald-400' : 'text-slate-500'}`}>{lifecycle.currentState.status}</span>
                </div>
                <div className="flex justify-between border-b border-slate-700 pb-2">
                  <span className="text-slate-400">Available Qty</span>
                  <span className="font-mono">{lifecycle.currentState.quantity.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-b border-slate-700 pb-2">
                  <span className="text-slate-400">Current Gross</span>
                  <span className="font-mono text-amber-400">{lifecycle.currentState.gross.toFixed(3)}g</span>
                </div>
                <div className="flex justify-between border-b border-slate-700 pb-2">
                  <span className="text-slate-400">Current Fine</span>
                  <span className="font-mono text-blue-400">{lifecycle.currentState.fine.toFixed(3)}g</span>
                </div>
                <div className="flex justify-between border-b border-slate-700 pb-2">
                  <span className="text-slate-400">Owner</span>
                  <span>{lifecycle.currentState.owner}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Location</span>
                  <span>{lifecycle.currentState.location}</span>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Timeline */}
          <div className="w-full md:w-2/3">
             <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm min-h-full">
                <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                   <Calendar className="w-5 h-5 text-slate-400"/> Transaction Timeline
                </h3>
                {renderTimeline()}
             </div>
          </div>

        </div>

      </div>
    </div>
  );
};
