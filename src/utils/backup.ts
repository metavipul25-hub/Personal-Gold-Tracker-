import { AssetRecord, TransactionHistoryRecord, MasterDataLists } from '../types';

export interface BackupData {
  schemaVersion: number;
  timestamp: string;
  assets: AssetRecord[];
  transactions: TransactionHistoryRecord[];
  masterData: MasterDataLists;
}

export const generateBackup = (
  assets: AssetRecord[], 
  transactions: TransactionHistoryRecord[], 
  masterData: MasterDataLists
): string => {
  const data: BackupData = {
    schemaVersion: 1,
    timestamp: new Date().toISOString(),
    assets,
    transactions,
    masterData
  };
  return JSON.stringify(data, null, 2);
};

export const downloadBackup = (backupJson: string) => {
  const blob = new Blob([backupJson], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `GoldTracker_Backup_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const validateBackup = (data: any): { valid: boolean; message?: string } => {
  if (!data || typeof data !== 'object') return { valid: false, message: 'Invalid JSON format' };
  if (data.schemaVersion !== 1) return { valid: false, message: 'Unsupported schema version' };
  if (!Array.isArray(data.assets)) return { valid: false, message: 'Missing or invalid assets array' };
  if (!Array.isArray(data.transactions)) return { valid: false, message: 'Missing or invalid transactions array' };
  if (!data.masterData || typeof data.masterData !== 'object') return { valid: false, message: 'Missing or invalid masterData object' };
  
  return { valid: true };
};
