import React, { useState, useEffect } from 'react';
import { GoldSipPlan } from '../../types';
import { X, Save, Trash, Landmark } from 'lucide-react';

interface SipPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (plan: GoldSipPlan) => void;
  onDelete?: (id: string) => void;
  plan?: GoldSipPlan;
}

export const SipPlanModal: React.FC<SipPlanModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  plan,
}) => {
  const [formData, setFormData] = useState<Partial<GoldSipPlan>>({
    planName: '',
    provider: '',
    monthlyAmount: 0,
    frequency: 'Monthly',
    startDate: new Date().toISOString().split('T')[0],
    tenureMonths: 11,
    completedInstallments: 0,
    missedInstallments: 0,
    totalInvested: 0,
    accumulatedGrams: 0,
    status: 'ACTIVE',
    lastInstallmentDate: '',
  });

  useEffect(() => {
    if (plan) {
      setFormData(plan);
    } else {
      setFormData({
        id: `SIP-${Date.now().toString().slice(-6)}`,
        planName: '',
        provider: '',
        monthlyAmount: 0,
        frequency: 'Monthly',
        startDate: new Date().toISOString().split('T')[0],
        tenureMonths: 11,
        completedInstallments: 0,
        missedInstallments: 0,
        totalInvested: 0,
        accumulatedGrams: 0,
        status: 'ACTIVE',
        lastInstallmentDate: '',
      });
    }
  }, [plan, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!formData.planName || !formData.provider || formData.monthlyAmount === undefined) return;
    onSave(formData as GoldSipPlan);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl shadow-2xl flex flex-col max-h-[90vh]">
        
        <div className="bg-slate-950 border-b border-slate-800 p-4 flex items-center justify-between rounded-t-2xl">
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Landmark className="w-5 h-5 text-indigo-400" />
            {plan ? 'Edit SIP Plan' : 'Create New SIP Plan'}
          </h3>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto scrollbar-thin text-slate-200 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Plan Name</label>
              <input type="text" value={formData.planName || ''} onChange={e => setFormData({...formData, planName: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" placeholder="e.g. Golden Harvest" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Provider</label>
              <input type="text" value={formData.provider || ''} onChange={e => setFormData({...formData, provider: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" placeholder="e.g. Tanishq, MMTC-PAMP" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Installment Amount (₹)</label>
              <input type="number" min="0" value={formData.monthlyAmount || ''} onChange={e => setFormData({...formData, monthlyAmount: Number(e.target.value)})} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Frequency</label>
              <select value={formData.frequency || 'Monthly'} onChange={e => setFormData({...formData, frequency: e.target.value as any})} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none">
                <option value="Monthly">Monthly</option>
                <option value="Weekly">Weekly</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Start Date</label>
              <input type="date" value={formData.startDate || ''} onChange={e => setFormData({...formData, startDate: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Tenure (Months)</label>
              <input type="number" min="1" value={formData.tenureMonths || ''} onChange={e => setFormData({...formData, tenureMonths: Number(e.target.value)})} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Completed Installments</label>
              <input type="number" min="0" value={formData.completedInstallments || ''} onChange={e => setFormData({...formData, completedInstallments: Number(e.target.value)})} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Missed Installments</label>
              <input type="number" min="0" value={formData.missedInstallments || ''} onChange={e => setFormData({...formData, missedInstallments: Number(e.target.value)})} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Total Invested (₹)</label>
              <input type="number" min="0" value={formData.totalInvested || ''} onChange={e => setFormData({...formData, totalInvested: Number(e.target.value)})} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Accumulated (g)</label>
              <input type="number" min="0" step="0.01" value={formData.accumulatedGrams || ''} onChange={e => setFormData({...formData, accumulatedGrams: Number(e.target.value)})} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Status</label>
              <select value={formData.status || 'ACTIVE'} onChange={e => setFormData({...formData, status: e.target.value as any})} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none">
                <option value="ACTIVE">ACTIVE</option>
                <option value="PAUSED">PAUSED</option>
                <option value="MISSED">MISSED</option>
                <option value="COMPLETED">COMPLETED</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Last Installment Date</label>
              <input type="date" value={formData.lastInstallmentDate || ''} onChange={e => setFormData({...formData, lastInstallmentDate: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none" />
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-900 flex justify-between items-center rounded-b-2xl">
          {plan && onDelete ? (
            <button onClick={() => { onDelete(plan.id); onClose(); }} className="px-4 py-2 text-sm font-medium text-red-400 bg-red-400/10 hover:bg-red-400/20 rounded-lg transition-colors flex items-center gap-2">
              <Trash className="w-4 h-4" /> Delete
            </button>
          ) : <div></div>}
          
          <div className="flex gap-3">
            <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors">
              Cancel
            </button>
            <button onClick={handleSave} disabled={!formData.planName || !formData.provider} className="px-5 py-2 text-sm font-bold text-slate-900 bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm transition-colors flex items-center gap-2">
              <Save className="w-4 h-4" /> Save SIP
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
