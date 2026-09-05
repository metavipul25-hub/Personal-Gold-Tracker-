import React, { useState, useMemo } from 'react';
import { TransactionService } from './services/TransactionService';
import {
  ActiveSheet,
  SheetId,
  AssetRecord,
  TransactionHistoryRecord,
  LockerDef,
  VersionSnapshot,
  MasterDataLists,
  GoldSipPlan,
  LifeGoal
} from './types';
import {
  INITIAL_ASSETS,
  INITIAL_TRANSACTIONS,
  INITIAL_SIP_PLANS,
  INITIAL_LIFE_GOALS,
  INITIAL_LOCKERS,
  INITIAL_MASTER_DATA,
  INITIAL_VERSION_SNAPSHOTS,
} from './data/initialData';
import {
  runAuditAndValidation,
  calculateAssetValuation
} from './utils/calculations';
import { exportWorkbookToExcel } from './utils/excelExport';
import { calculateAssetAvailableQuantity } from './utils/calculations';
import { useCloudState, saveWorkbookBatch, useSyncStatus } from './lib/useCloudWorkbook';

// Components
import { WorkbookHeader } from './components/WorkbookHeader';
import { auth } from './lib/firebase';
import { signOut } from 'firebase/auth';
import { FormulaBar } from './components/FormulaBar';
import { SheetTabs } from './components/SheetTabs';

// Sheets
import { ReadmeSheet } from './components/sheets/ReadmeSheet';
import { DashboardSheet } from './components/sheets/DashboardSheet';
import { AssetRegisterSheet } from './components/sheets/AssetRegisterSheet';
import { AssetLifecycleModal } from './components/modals/AssetLifecycleModal';
import { MasterDataSheet } from './components/sheets/MasterDataSheet';
import { TransactionHistorySheet } from './components/sheets/TransactionHistorySheet';
import { PivotsSheet } from './components/sheets/PivotsSheet';
import { ValidationSheet } from './components/sheets/ValidationSheet';
import { ReportsSheet } from './components/sheets/ReportsSheet';
import { ReconciliationSheet } from './components/sheets/ReconciliationSheet';
import { ChartsSheet } from './components/sheets/ChartsSheet';
import { SipPlansSheet } from './components/sheets/SipPlansSheet';
import { LifeGoalsSheet } from './components/sheets/LifeGoalsSheet';

// Modals
import { AssetModal } from './components/modals/AssetModal';
import { TransactionModal } from './components/modals/TransactionModal';
import { QuickTransactionModal } from './components/modals/QuickTransactionModal';

export const App: React.FC = () => {
  // Navigation State
  const [activeSheet, setActiveSheet] = useState<ActiveSheet>('DASHBOARD');

  // Core Financial State
  const { status: syncStatus, lastSync } = useSyncStatus();
  const [assets, setAssets] = useCloudState<AssetRecord[]>('assets', INITIAL_ASSETS);
  const [transactions, setTransactions] = useCloudState<TransactionHistoryRecord[]>('transactions', INITIAL_TRANSACTIONS);
    const [lockers, setLockers] = useCloudState<LockerDef[]>('lockers', INITIAL_LOCKERS);
  const [sipPlans, setSipPlans] = useCloudState<GoldSipPlan[]>('sipPlans', INITIAL_SIP_PLANS);
  const [lifeGoals, setLifeGoals] = useCloudState<LifeGoal[]>('lifeGoals', INITIAL_LIFE_GOALS);
  const [snapshots, setSnapshots] = useCloudState<VersionSnapshot[]>('snapshots', INITIAL_VERSION_SNAPSHOTS);
  const [masterData, setMasterData] = useCloudState<MasterDataLists>('masterData', INITIAL_MASTER_DATA);

  // Excel Cell & Formula Bar State
  const [selectedCell, setSelectedCell] = useState<{
    coord: string;
    content: string;
    isFormula: boolean;
  }>({
    coord: 'B4',
    content: '₹14,54,320 (=[@NetGoldWeight]*[@CurrentGoldRate])',
    isFormula: true
  });

  // Modal States
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<AssetRecord | null>(null);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isQuickTransactionModalOpen, setIsQuickTransactionModalOpen] = useState(false);
  const [lifecycleAssetId, setLifecycleAssetId] = useState<string | null>(null);
  const [isRateModalOpen, setIsRateModalOpen] = useState(false);

  // Dynamic QA & Audit Issues scanning
  const validationIssues = useMemo(() => {
    return runAuditAndValidation(assets, transactions, masterData);
  }, [assets, transactions, masterData]);

  const auditErrorCount = validationIssues.filter(i => i.type === 'ERROR').length;

  const handleSelectCell = (cellCoord: string, formulaOrValue: string, isFormula: boolean = false) => {
    setSelectedCell({
      coord: cellCoord,
      content: formulaOrValue,
      isFormula
    });
  };

  const handleSaveAsset = async (fullAsset: AssetRecord) => {
    try {
      if (editingAsset) {
        await setAssets(prev => prev.map(a => a.assetId === fullAsset.assetId ? fullAsset : a));
      } else {
        await setAssets(prev => [fullAsset, ...prev]);
      }
      setIsAssetModalOpen(false);
      setEditingAsset(null);
    } catch (e: any) {
      console.error("Save failed:", e);
      alert("Save failed: " + (e.message || "Please retry."));
    }
  };

  const handleDeleteAsset = async (assetId: string) => {
    const target = assets.find(a => a.assetId === assetId);
    if (!target) return;
    if (window.confirm(`Are you sure you want to archive ${target.assetName} (${assetId})? It will be hidden from the register but its history will remain intact.`)) {
      try {
        await setAssets(prev => prev.map(a => 
          a.assetId === assetId 
            ? { ...a, status: 'Archived' as any, isArchived: true, archivedDate: new Date().toISOString().split('T')[0] } 
            : a
        ));
      } catch (e: any) {
        alert("Archive failed: " + (e.message || "Please retry."));
      }
    }
  };

  const handleResetData = async () => {
    if (window.confirm('Reset workbook data to default master financial dataset?')) {
      try {
        await saveWorkbookBatch([
          { key: 'assets', data: INITIAL_ASSETS },
          { key: 'transactions', data: INITIAL_TRANSACTIONS },
          { key: 'lockers', data: INITIAL_LOCKERS },
          { key: 'snapshots', data: INITIAL_VERSION_SNAPSHOTS }
        ]);
      } catch (e: any) {
        alert("Reset failed: " + (e.message || "Please retry."));
      }
    }
  };

  
  const handleBackup = () => {
    const backupData = {
      version: 1,
      exportDate: new Date().toISOString(),
      data: {
        assets,
        transactions,
        lockers,
        sipPlans,
        lifeGoals,
        snapshots,
        masterData
      }
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GoldTracker_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRestore = async (file: File) => {
    try {
      const text = await file.text();
      const backup = JSON.parse(text);
      if (!backup.version || !backup.data || !backup.data.assets) {
        throw new Error('Invalid backup file format');
      }

      if (!window.confirm('RESTORE DATA\n\nThis will REPLACE ALL CURRENT DATA with the contents of the backup file.\n\nContinue?')) {
        return;
      }

      const backupFileName = `GoldTracker_SafetyBackup_PreRestore_${new Date().toISOString().split('T')[0]}.json`;
      const safetyBackupData = {
        version: 1,
        exportDate: new Date().toISOString(),
        isSafetyBackup: true,
        data: {
          assets,
          transactions,
          lockers,
          sipPlans,
          lifeGoals,
          snapshots,
          masterData
        }
      };
      
      alert('A safety backup will be downloaded first. Save it, then the restore will complete.');
      const blob = new Blob([JSON.stringify(safetyBackupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = backupFileName;
      a.click();
      URL.revokeObjectURL(url);

      // Wait a moment for download to trigger
      await new Promise(r => setTimeout(r, 1000));

      await saveWorkbookBatch([
        { key: 'assets', data: backup.data.assets || [] },
        { key: 'transactions', data: backup.data.transactions || [] },
        { key: 'lockers', data: backup.data.lockers || [] },
        { key: 'sipPlans', data: backup.data.sipPlans || [] },
        { key: 'lifeGoals', data: backup.data.lifeGoals || [] },
        { key: 'snapshots', data: backup.data.snapshots || [] },
        { key: 'masterData', data: backup.data.masterData || INITIAL_MASTER_DATA }
      ]);
      
      alert('Restore completed successfully.');
    } catch (e: any) {
      alert("Restore failed: " + (e.message || "Invalid file."));
    }
  };

  const handleExportExcel = () => {
    exportWorkbookToExcel(
      assets,
      transactions,
      validationIssues,
      masterData
    );
  };

  return (
    <div id="gold-tracker-app" className="flex flex-col h-screen w-full bg-slate-950 text-slate-100 font-sans antialiased select-none overflow-hidden">

      {syncStatus === 'CONFLICT' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 flex flex-col">
            <h2 className="text-xl font-bold text-slate-900 mb-2">⚠️ Sync Conflict Detected</h2>
            <p className="text-slate-600 mb-6">
              This workbook was changed on another device. Your recent local changes could not be safely synchronized. 
              <br/><br/>
              To prevent data loss, please reload the application to receive the latest cloud version, and re-enter your changes.
            </p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
              >
                Reload Cloud Version
              </button>
            </div>
          </div>
        </div>
      )}

      <WorkbookHeader
        totalAssetsCount={assets.length}
        totalPureGoldWeight={assets.reduce((sum, a) => sum + (a.pureGoldWeight ?? 0), 0)}
        totalPurchaseCost={assets.reduce((sum, a) => sum + (a.totalPurchaseCost ?? 0), 0)}
        onExportExcel={handleExportExcel}
        onOpenAddAsset={() => { setEditingAsset(null); setIsAssetModalOpen(true); }}
                onOpenQuickTransaction={() => setIsQuickTransactionModalOpen(true)}
        onOpenAddPurchase={() => setIsTransactionModalOpen(true)}
        onOpenAddSale={() => setIsTransactionModalOpen(true)}
        onRunAudit={() => setActiveSheet('VALIDATION')}
        onResetData={handleResetData}
        onBackup={handleBackup}
        onRestore={handleRestore}
        syncStatus={syncStatus}
        lastSync={lastSync}
        onLogout={() => signOut(auth)}
      />
      
      {/* Logout button at top right, since WorkbookHeader has no space, we can add it as absolute or just inside WorkbookHeader, but we will add a floating one for simplicity or we can add it to the header */}

      <FormulaBar
        activeCell={selectedCell.coord}
        formula={selectedCell.content}
        selectedCellCoord={selectedCell.coord}
        selectedCellFormula={selectedCell.content}
        isFormula={selectedCell.isFormula}
      />

      <main id="sheet-viewport" className="flex-1 overflow-auto bg-slate-950 scrollbar-thin relative z-0">
        {activeSheet === 'README' && (
          <ReadmeSheet />
        )}
        
        {activeSheet === 'DASHBOARD' && (
          <DashboardSheet
            masterData={masterData}
            assets={assets}
            transactions={transactions}
            onNavigateSheet={(s: string) => setActiveSheet(s as any)}
                      />
        )}

        {activeSheet === 'ASSET_REGISTER' && (
          <AssetRegisterSheet
            masterData={masterData}
            assets={assets}
            transactions={transactions}
            onOpenAddAsset={() => { setEditingAsset(null); setIsAssetModalOpen(true); }}
            onSelectCell={handleSelectCell}
                        onEditAsset={(asset) => {
              setEditingAsset(asset);
              setIsAssetModalOpen(true);
            }}
            onDeleteAsset={handleDeleteAsset}
            onViewLifecycle={setLifecycleAssetId}
          />
        )}

        {activeSheet === 'MASTER_DATA' && (
          <MasterDataSheet masterData={masterData} setMasterData={setMasterData} assets={assets} transactions={transactions} />
        )}

        {activeSheet === 'TRANSACTION_HISTORY' && (
          <TransactionHistorySheet 
            transactions={transactions} 
            onSelectCell={handleSelectCell}
            onAddTransaction={() => setIsTransactionModalOpen(true)}
          />
        )}

        {activeSheet === 'VALIDATION' && (
          <ValidationSheet issues={validationIssues} />
        )}
        {activeSheet === 'PIVOTS' && (
          <PivotsSheet
            assets={assets}
            transactions={transactions}
          />
        )}

        {activeSheet === 'CHARTS' && (
          <ChartsSheet
            assets={assets}
            transactions={transactions}
          />
        )}

        {activeSheet === 'SIP_PLANS' && (
          <SipPlansSheet sipPlans={sipPlans} />
        )}

        {activeSheet === 'LIFE_GOALS' && (
          <LifeGoalsSheet goals={lifeGoals} assets={assets} />
        )}
  
      </main>

      <SheetTabs activeSheet={activeSheet} onSelectSheet={setActiveSheet} validationErrorCount={auditErrorCount} />

      <AssetModal
        isOpen={isAssetModalOpen}
        masterData={masterData}
        onClose={() => { setIsAssetModalOpen(false); setEditingAsset(null); }}
        onSave={handleSaveAsset}
        existingAssetCount={assets.length}
        editingAsset={editingAsset || undefined}
      />
      

      <QuickTransactionModal
        isOpen={isQuickTransactionModalOpen}
        masterData={masterData}
        transactions={transactions}
        assets={assets}
        onClose={() => setIsQuickTransactionModalOpen(false)}
        existingTxCount={transactions.length}
        onSave={async (txs, newAssets) => {
          const txArray = Array.isArray(txs) ? txs : [txs];
          const newAssetArray = newAssets ? (Array.isArray(newAssets) ? newAssets : [newAssets]) : [];
          
          const updatedTxs = [...transactions, ...txArray];
          
          const updatedAssets = [...assets];
          newAssetArray.forEach(na => {
            const index = updatedAssets.findIndex(a => a.assetId === na.assetId);
            if (index >= 0) updatedAssets[index] = na;
            else updatedAssets.push(na);
          });
          
          await saveWorkbookBatch([
            { key: 'transactions', data: updatedTxs },
            { key: 'assets', data: updatedAssets }
          ]);
          
          setIsQuickTransactionModalOpen(false);
        }}
      />

      <TransactionModal
        isOpen={isTransactionModalOpen}
        masterData={masterData}
        transactions={transactions}
        onClose={() => setIsTransactionModalOpen(false)}
        onSave={async (txs, newAssets) => {
          const txArray = Array.isArray(txs) ? txs : [txs];
          const newAssetArray = newAssets ? (Array.isArray(newAssets) ? newAssets : [newAssets]) : [];
          
          const existingTxIds = new Set(transactions.map(t => t.txId));
          const uniqueNewTxs = txArray.filter(t => !existingTxIds.has(t.txId));
          if (uniqueNewTxs.length === 0) return; // Avoid duplicate save

          const existingAssetIds = new Set(assets.map(a => a.assetId));
          const uniqueNewAssets = newAssetArray.filter(a => !existingAssetIds.has(a.assetId));
          
          let updatedAssets = [...uniqueNewAssets, ...assets];
          uniqueNewTxs.forEach(tx => {
            updatedAssets = updatedAssets.map(a => {
              if (a.assetId === tx.assetId) {
                return TransactionService.applyTransactionToAsset(a, tx, transactions);
              }
              return a;
            });
          });

          const updatedTxs = [...uniqueNewTxs, ...transactions];

          await saveWorkbookBatch([
            { key: 'transactions', data: updatedTxs },
            { key: 'assets', data: updatedAssets }
          ]);
          
          setIsTransactionModalOpen(false);
        }}
        existingTxCount={transactions.length}
        assets={assets}
      />
    </div>
  );
};

export default App;
