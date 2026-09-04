import React, { useState } from 'react';
import { BackupData, validateBackup } from '../../utils/backup';
import { X, UploadCloud, AlertTriangle, ShieldCheck } from 'lucide-react';

interface RestoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRestore: (data: BackupData) => void;
  onBackupFirst: () => void;
}

export const RestoreModal: React.FC<RestoreModalProps> = ({ isOpen, onClose, onRestore, onBackupFirst }) => {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string>('');
  const [parsedData, setParsedData] = useState<BackupData | null>(null);
  const [step, setStep] = useState<1 | 2>(1);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setError('');
      
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const json = JSON.parse(event.target?.result as string);
          const validation = validateBackup(json);
          if (validation.valid) {
            setParsedData(json);
          } else {
            setError(validation.message || 'Invalid backup file');
            setParsedData(null);
          }
        } catch (err) {
          setError('Could not parse JSON file');
          setParsedData(null);
        }
      };
      reader.readAsText(selected);
    }
  };

  const handleConfirm = () => {
    if (parsedData) {
      onRestore(parsedData);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-slate-200 bg-slate-50">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-indigo-600" /> Restore Backup
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded text-slate-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {step === 1 && (
            <div className="space-y-4">
              <p className="text-sm text-slate-600 mb-4">
                Upload a previously exported JSON backup file. This will eventually replace your current dataset.
              </p>
              
              <input 
                type="file" 
                accept=".json" 
                onChange={handleFileChange}
                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />

              {error && (
                <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {parsedData && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-800">
                  <div className="flex items-center gap-2 font-bold mb-2">
                    <ShieldCheck className="w-4 h-4" /> Valid Backup Found
                  </div>
                  <ul className="list-disc list-inside space-y-1 ml-1 text-emerald-700">
                    <li>{parsedData.assets.length} Assets</li>
                    <li>{parsedData.transactions.length} Transactions</li>
                    <li>Dated: {new Date(parsedData.timestamp).toLocaleString()}</li>
                  </ul>
                </div>
              )}

              <div className="flex justify-end pt-4">
                <button 
                  onClick={() => setStep(2)}
                  disabled={!parsedData}
                  className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-700 transition"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
                <h3 className="font-bold flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5" /> WARNING: DATA OVERWRITE
                </h3>
                <p className="text-sm mb-4">
                  Proceeding will completely replace your current local dataset with the backup contents. 
                  Any unsaved or un-backed-up changes will be permanently lost.
                </p>
                
                <button 
                  onClick={onBackupFirst}
                  className="px-4 py-2 bg-white border border-red-300 text-red-700 font-medium rounded-lg hover:bg-red-50 text-sm shadow-sm transition w-full mb-2"
                >
                  Download Safety Backup First
                </button>
              </div>

              <div className="flex justify-between pt-4">
                <button 
                  onClick={() => setStep(1)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition"
                >
                  Back
                </button>
                <button 
                  onClick={handleConfirm}
                  className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition"
                >
                  Confirm Restore
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
