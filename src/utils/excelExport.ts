import * as XLSX from 'xlsx';
import { 
  AssetRecord, 
  TransactionHistoryRecord, 
  TestCaseRecord,
  ValidationIssue 
} from '../types';
import { PURITY_MASTER_DATA } from './calculations';
import { MasterDataLists } from '../types';
import { getMasterName } from './masterData';

export const exportWorkbookToExcel = (
  assets: AssetRecord[],
  transactions: TransactionHistoryRecord[],
  validationIssues: ValidationIssue[],
  masterDataLists: MasterDataLists
) => {
  const wb = XLSX.utils.book_new();

  // 1. README Sheet
  const readmeData = [
    ['MICROSOFT EXCEL GOLD TRACKER SYSTEM - DOCUMENTATION & ARCHITECTURE'],
    ['Version: 2.5.0 (Simplified Build)'],
    ['Created for: Personal, Family & HNI Wealth Portfolio Tracking'],
    ['Generated On: ' + new Date().toISOString().split('T')[0]],
    [],
    ['TABLE OF CONTENTS / WORKSHEET STRUCTURE:'],
    ['1. README / USER GUIDE', 'System documentation, financial methodology, and quick-start guide.'],
    ['2. DASHBOARD', 'Executive KPI cards, portfolio summaries, purity/category/location breakdowns.'],
    ['3. ASSET REGISTER', 'Master physical gold inventory table with automatic pure-weight.'],
    ['4. PURCHASES', 'Detailed acquisition ledger with itemized breakdown of gold, making charges, and GST.'],
    ['5. SALES', 'Realized sales ledger tracking sold weights, proceeds, cost basis, and realized P/L.'],
    ['6. MASTER DATA', 'Lookup tables for Purity Karats, Fineness codes, Asset types, Categories, Owners, Lockers.'],
    ['7. TRANSACTION HISTORY', 'Consolidated audit trail of purchases, sales, and location transfers.'],
    ['8. CALCULATIONS', 'Detailed technical documentation of Excel formulas (INDEX/MATCH, SUMIFS, IFERROR).'],
    ['9. PIVOTS', 'Pivot-table aggregations by Owner, Category, Location, Purity, and Acquisition Year.'],
    ['10. AUDIT & VALIDATION', 'QA health check detecting duplicate IDs, negative weights, and overselling.'],
    ['11. TEST CASES', 'Comprehensive testing matrix with 15 verified test scenarios.'],
    [],
    ['KEY VALUATION FORMULAS & METHODOLOGY (EXCEL 2019 COMPATIBLE):'],
    ['Net Gold Weight (g)', '= Gross Weight - Stone Weight'],
    ['Pure Gold Weight (g)', '= Net Gold Weight * (Fineness / 1000)'],
    ['Total Purchase Cost', '= (Net Gold Weight * Purchase Rate) + Making Charges + Other Charges + GST'],
    
  ];
  const wsReadme = XLSX.utils.aoa_to_sheet(readmeData);
  XLSX.utils.book_append_sheet(wb, wsReadme, 'README');

  // 2. DASHBOARD Summary Sheet
  const totalGrossWeight = assets.reduce((sum, a) => sum + (a.grossWeight ?? 0), 0);
  const totalNetGoldWeight = assets.reduce((sum, a) => sum + (a.netGoldWeight ?? 0), 0);
  const totalPureGoldWeight = assets.reduce((sum, a) => sum + (a.pureGoldWeight ?? 0), 0);
  const totalPurchaseCost = assets.reduce((sum, a) => sum + (a.totalPurchaseCost ?? 0), 0);

  const dashboardData = [
    ['GOLD PORTFOLIO EXECUTIVE DASHBOARD'],
    ['As of Date:', new Date().toISOString().split('T')[0]],
    [],
    ['KEY PERFORMANCE INDICATORS (KPIs)'],
    ['Metric', 'Value', 'Unit / Currency'],
    ['Total Assets in Vault & Care', assets.length, 'Items'],
    ['Total Gross Weight', (totalGrossWeight ?? 0).toFixed(3), 'Grams'],
    ['Total Net Gold Weight', (totalNetGoldWeight ?? 0).toFixed(3), 'Grams'],
    ['Total Pure Gold Weight (24K Equivalent)', (totalPureGoldWeight ?? 0).toFixed(3), 'Grams (Pure Gold)'],
    ['Total Portfolio Acquisition Cost', (totalPurchaseCost ?? 0).toFixed(2), 'INR / USD'],
    ['Cumulative Realized Gains (from Sales)', (0).toFixed(2), 'INR / USD'],
    [],
    ['OWNERSHIP BREAKDOWN'],
    ['Owner', 'Items', 'Net Gold (g)', 'Pure Gold (g)', 'Total Cost Basis', 'Portfolio %'],
    ...Array.from(new Set(assets.map(a => a.owner))).map(owner => {
      const ownerAssets = assets.filter(a => a.owner === owner);
      const netWt = ownerAssets.reduce((s, a) => s + (a.netGoldWeight ?? 0), 0);
      const pureWt = ownerAssets.reduce((s, a) => s + (a.pureGoldWeight ?? 0), 0);
      const cost = ownerAssets.reduce((s, a) => s + (a.totalPurchaseCost ?? 0), 0);
      const pct = totalPurchaseCost > 0 ? (((cost ?? 0) / totalPurchaseCost) * 100).toFixed(1) + '%' : '0%';
      return [getMasterName(masterDataLists?.owners, owner), ownerAssets.length, (netWt ?? 0).toFixed(3), (pureWt ?? 0).toFixed(3), (cost ?? 0).toFixed(2), pct];
    }),
    [],
    ['LOCATION BREAKDOWN'],
    ['Location', 'Items', 'Net Gold (g)', 'Total Cost Basis', 'Locker Details'],
    ...Array.from(new Set(assets.map(a => a.location))).map(loc => {
      const locAssets = assets.filter(a => a.location === loc);
      const netWt = locAssets.reduce((s, a) => s + (a.netGoldWeight ?? 0), 0);
      const cost = locAssets.reduce((s, a) => s + (a.totalPurchaseCost ?? 0), 0);
      const lockers = Array.from(new Set(locAssets.map(a => a.locker))).join('; ');
      return [getMasterName(masterDataLists?.locations, loc), locAssets.length, (netWt ?? 0).toFixed(3), (cost ?? 0).toFixed(2), lockers];
    })
  ];
  const wsDashboard = XLSX.utils.aoa_to_sheet(dashboardData);
  XLSX.utils.book_append_sheet(wb, wsDashboard, 'DASHBOARD');

  // 3. ASSET REGISTER Sheet
  const assetHeader = [
    'Asset ID', 'Asset Name', 'Asset Type', 'Metal', 'Jewellery Category',
    'Description', 'Gross Weight (g)', 'Stone Weight (g)', 'Net Gold Weight (g)',
    'Purity', 'Fineness', 'Pure Gold Weight (g)', 'Purchase Date', 'Purchase Source',
    'Purchase Rate (/g)', 'Making Charges', 'Other Charges', 'GST / Taxes',
    'Total Purchase Cost', 'Location', 'Locker Reference',
    'Owner', 'Ownership %', 'Nominee', 'Status', 'Notes', 'Document Ref', 'Last Updated'
  ];

  const assetRows = assets.map(a => [
    a.assetId,
    a.assetName,
    a.assetType,
    a.metal,
    a.jewelleryCategory,
    a.description,
    a.grossWeight,
    a.stoneWeight,
    a.netGoldWeight,
    a.purity,
    a.fineness,
    a.pureGoldWeight,
    a.purchaseDate,
    a.purchaseSource,
    a.purchaseRate,
    a.makingCharges,
    a.otherCharges,
    a.gst,
    a.totalPurchaseCost,
    a.location,
    a.locker,
    a.owner,
    a.ownershipPct,
    a.nominee,
    a.status,
    a.notes,
    a.documentReference,
    a.lastUpdated
  ]);

  const wsAssetRegister = XLSX.utils.aoa_to_sheet([assetHeader, ...assetRows]);
  XLSX.utils.book_append_sheet(wb, wsAssetRegister, 'ASSET REGISTER');



  // 6. MASTER DATA Sheet
  const masterData = [
    ['PURITY STANDARDS MASTER'],
    ['Karat', 'Fineness (Parts per 1000)', 'Percentage Gold', 'Description'],
    ...PURITY_MASTER_DATA.map(p => [p.karat, p.fineness, p.percentage + '%', p.description]),
    [],
    ['ASSET TYPES & CATEGORIES'],
    ['Asset Type', 'Typical Items', 'Hallmark Requirement'],
    ['Bar', 'Minted Cast Investment Bars (10g, 50g, 100g, 1kg)', 'LBMA / BIS 999.9'],
    ['Coin', 'Sovereigns, Medallions, Auspicious Coins (1g - 10g)', 'BIS 999 / 916'],
    ['Jewellery', 'Necklaces, Bangles, Rings, Chains, Earrings, Sets', 'BIS 916 / 750 (HUID mandatory)'],
    ['Bullion', 'Raw casting bullion / grains', 'Assay Certificate'],
    ['Digital / Certificate', 'Sovereign Gold Bonds, Vault Gold Receipts', 'Depository Ref']
  ];
  const wsMaster = XLSX.utils.aoa_to_sheet(masterData);
  XLSX.utils.book_append_sheet(wb, wsMaster, 'MASTER DATA');

  // 7. TRANSACTION HISTORY Sheet
  const txHeader = ['TX ID', 'Date', 'Type', 'Asset ID', 'Asset Name', 'Quantity', 'Gross Wt (g)', 'Stone Wt (g)', 'Net Wt (g)', 'Purity', 'Fine Wt (g)', 'Amount', 'Reference', 'Notes', 'Performed By'];
  const txRows = transactions.map(t => [
    t.txId,
    t.date,
    t.type,
    t.assetId,
    t.assetName,
    t.quantity ?? 1,
    t.grossWeightGrams ?? t.weightGrams ?? 0,
    t.stoneWeightGrams ?? 0,
    t.netWeightGrams ?? (t.weightGrams ?? 0),
    t.purity,
    t.fineWeightGrams ?? 0,
    t.amount,
    t.originalTxId || t.documentReference || '',
    t.details,
    t.performedBy
  ]);
  const wsTx = XLSX.utils.aoa_to_sheet([txHeader, ...txRows]);
  XLSX.utils.book_append_sheet(wb, wsTx, 'TRANSACTION HISTORY');

  // Stones Export
  const wsStones = XLSX.utils.json_to_sheet(
    assets.flatMap(a => (a.stones || []).map(s => ({
      'Asset ID': a.assetId,
      'Asset Name': a.assetName,
      'Stone ID': s.id,
      'Stone Type': s.stoneType,
      'Quantity': s.quantity,
      'Weight': s.weight,
      'Unit': s.weightUnit,
      'Shape/Cut': s.shapeCut || '',
      'Color': s.color || '',
      'Clarity': s.clarity || '',
      'Certificate Issuer': s.certificateIssuer || '',
      'Certificate Number': s.certificateNumber || ''
    })))
  );
  XLSX.utils.book_append_sheet(wb, wsStones, 'STONES');

  // 8. AUDIT & VALIDATION Sheet
  const auditHeader = ['Issue ID', 'Severity', 'Worksheet', 'Record / ID', 'Field', 'Message', 'Action / Recommendation'];
  const auditRows = validationIssues.map(v => [
    v.id,
    v.type,
    v.sheet,
    v.recordId,
    v.field,
    v.message,
    v.recommendation
  ]);
  const wsAudit = XLSX.utils.aoa_to_sheet([auditHeader, ...auditRows]);
  XLSX.utils.book_append_sheet(wb, wsAudit, 'AUDIT & VALIDATION');

  // 9. TEST CASES Sheet
  const tcHeader = ['Test ID', 'QA Category', 'Test Scenario', 'Input Data', 'Expected Result', 'Actual Result', 'QA Status'];

  // Generate binary and download
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Gold_Tracker_System_${new Date().toISOString().split('T')[0]}.xlsx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
