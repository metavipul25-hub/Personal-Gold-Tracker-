export type PurityKarat = '24K' | '22K' | '21K' | '20K' | '18K' | '14K' | '10K';

export type FinenessCode = 999 | 995 | 916 | 875 | 750 | 585 | 417;

export type AssetType = 
  | 'Jewellery' 
  | 'Coin' 
  | 'Bar' 
  | 'Bullion' 
  | 'Digital Gold'
  | 'Digital / Certificate' 
  | 'Silver Article / Bar'
  | 'Other';

export type MetalType = 'Gold' | 'Silver' | 'Platinum' | 'Gold & Stones';

export type JewelleryCategory = 
  | 'Necklace' 
  | 'Bangles' 
  | 'Ring' 
  | 'Chain' 
  | 'Earrings' 
  | 'Bracelet' 
  | 'Pendant' 
  | 'Coin / Medallion' 
  | 'Minted Bar' 
  | 'Digital Holding'
  | 'Silver Bullion'
  | 'Custom Set' 
  | 'Other';

export type AssetStatus = 
  | 'In Vault' 
  | 'At Home' 
  | 'In Transit' 
  | 'Sold' 
  | 'Partially Sold' 
  | 'Pledged' 
  | 'Missing / Under Audit'
  | 'Lost'
  | 'Stolen'
  | 'Archived';

export type LocationType = string;

export type OwnerType = string;

export type PaymentMode = string;

export interface PurityMaster {
  karat: PurityKarat;
  fineness: number; // e.g. 916
  percentage: number; // e.g. 91.67
  description: string;
}

export interface JointOwnerAllocation {
  ownerName: string;
  relationship: string;
  sharePct: number; // 0 to 100
}


export interface StoneRecord {
  id: string; // e.g. "STN-001"
  stoneType: string; // "Diamond", "Ruby", etc.
  stoneName?: string;
  quantity: number;
  weight: number;
  weightUnit: string; // "ct", "g", etc.
  physicalWeightGrams?: number; // optionally computed if 1 ct = 0.2 g
  shapeCut?: string;
  color?: string;
  clarity?: string;
  origin?: string;
  treatment?: string;
  grade?: string;
  dimensions?: string;
  certificateIssuer?: string;
  certificateNumber?: string;
  certificateDate?: string;
  setting?: string;
  estimatedValue?: number;
  notes?: string;
}

export interface StoneMasterRecord extends MasterDataRecord {
  // specific properties if needed in future
}

export interface AssetRecord {
  stones?: StoneRecord[];
  assetId: string; // e.g. "AST-001"
  assetName: string;
  assetType: AssetType;
  metal: MetalType;
  jewelleryCategory: JewelleryCategory;
  description: string;
  grossWeight: number; // grams
  stoneWeight: number; // grams
  otherNonGoldWeight?: number; // grams (e.g. enamel, wax, threads)
  netGoldWeight: number; // grams (gross - stone - other)
  purity: PurityKarat;
  fineness: number; // e.g. 916
  pureGoldWeight: number; // grams (net * fineness / 1000)
  purchaseDate: string; // YYYY-MM-DD
  acquisitionType?: 'PURCHASE' | 'GIFT RECEIVED' | 'INHERITANCE RECEIVED' | 'OTHER';
  purchaseSource: string; // Jeweller / Mint
  originalSource?: string;
  previousOwner?: string;
  purchaseRate: number; // Rate per gram of that purity at purchase
  makingCharges: number; // Flat or %
  otherCharges: number; // Hallmarking, certification, stones
  gst: number; // Tax
  totalPurchaseCost: number; // (netGoldWeight * purchaseRate) + makingCharges + otherCharges + gst
  location: LocationType;
  locker: string; // e.g. "SBI Main Branch - Locker #402"
  owner: OwnerType;
  ownershipPct: number; // 0 to 100
  nominee: string;
  status: AssetStatus;
  notes: string;
  documentReference: string; // Invoice / Certificate #
  lastUpdated: string;
  quantityAvailable: number; // 1 for distinct item, or grams remaining
  
  // Pledged / Loan tracking (GT-025, GT-026)
  pledgedLoanAmount?: number;
  pledgedDate?: string;
  pledgedLender?: string;

  // Compliance tracking
  huidNumber?: string; // Hallmark Unique ID
  hasInvoice?: boolean;
  hasPhoto?: boolean;
  hasHallmarkCert?: boolean;
  docExpiryDate?: string;

  // Enterprise, Legacy & Audit Extensions (GT-141 to GT-200)
  willReference?: string;
  isInherited?: boolean;
  inheritedCostBasis?: number;
  generation?: 'Gen 1 (Ancestral / Grandparents)' | 'Gen 2 (Parents / Current)' | 'Gen 3 (Children / Successors)';
  isTrustOwned?: boolean;
  trustName?: string;
  jointOwners?: JointOwnerAllocation[];
  beneficiary?: string;
  holdingDays?: number;
  holdingYears?: number;
  physicalAuditStatus?: 'Verified' | 'Pending Audit' | 'Missing / Discrepancy' | 'Unregistered Found';
  lastAuditDate?: string;
  auditedBy?: string;
  isArchived?: boolean;
  archivedDate?: string;
  archiveReason?: string;
}



export interface TransactionHistoryRecord {
  stones?: StoneRecord[];
  stoneAllocationType?: 'ALL' | 'PARTIAL' | 'NONE';
  txId: string;
  date: string;
  type: 'PURCHASE' | 'OPENING BALANCE' | 'GIFT RECEIVED' | 'GIFT GIVEN' | 'INHERITANCE RECEIVED' | 'INHERITANCE TRANSFERRED' | 'OWNER TRANSFER' | 'LOCATION TRANSFER' | 'SALE' | 'CORRECTION' | 'REVERSAL' | 'ASSET SPLIT' | 'ASSET MERGE' | 'OTHER';
  assetId: string;
  assetName: string;
  
  // Phase 1 legacy fallback
  weightGrams: number;
  purity: PurityKarat;
  amount: number;

  // Phase 2 Precision Accounting
  quantity?: number;
  grossWeightGrams?: number;
  stoneWeightGrams?: number;
  netWeightGrams?: number;
  fineness?: number;
  fineWeightGrams?: number;
  
  // Relationships
  originalTxId?: string;
  splitIntoAssetIds?: string[];
  mergedFromAssetIds?: string[];
  
  // Extended fields for all types
  fromPerson?: string;
  fromRelationship?: string;
  toPerson?: string;
  toRelationship?: string;
  supplier?: string;
  buyer?: string;
  previousOwner?: string;
  newOwner?: string;
  location?: LocationType;
  ownershipPct?: number;
  paymentMode?: PaymentMode;
  documentReference?: string;
  reason?: string;
  details: string;
  performedBy: string;
}

export interface LockerDef {
  id: string;
  name: string;
  institution: string;
  locationType: LocationType;
  maxCapacityGrams: number;
  maxItemsCount: number;
  notes: string;
  lastAuditDate: string;
  auditor: string;
  auditStatus: 'Compliant' | 'Pending Audit' | 'Over Capacity' | 'Discrepancy Found';
}

export interface VersionSnapshot {
  versionId: string;
  timestamp: string;
  label: string;
  assetsCount: number;
  totalValue: number;
  notes: string;
  data: {
    assets: AssetRecord[];
  
  
  };
}

export interface GoldSipPlan {
  id: string;
  planName: string;
  provider: string; // e.g. 'MMTC-PAMP Digital', 'Tanishq Golden Harvest', 'Augmont Gold'
  monthlyAmount: number; // in INR
  frequency: 'Monthly' | 'Weekly';
  startDate: string;
  tenureMonths: number;
  completedInstallments: number;
  missedInstallments: number;
  totalInvested: number;
  accumulatedGrams: number;
  status: 'ACTIVE' | 'MISSED' | 'COMPLETED' | 'PAUSED';
  lastInstallmentDate: string;
}

export interface LifeGoal {
  id: string;
  name: string;
  category: 'Retirement' | 'Child Education' | 'Child Marriage' | 'Emergency Reserve' | 'Financial Independence';
  targetWeightGrams: number;
  targetValueINR: number;
  targetYear: number;
  allocatedAssetIds: string[];
  notes?: string;
}

export interface PhysicalAuditEntry {
  auditId: string;
  date: string;
  lockerId: string;
  auditorName: string;
  totalItemsExpected: number;
  totalItemsFound: number;
  missingAssetIds: string[];
  unexpectedItemsFound: string[];
  status: 'Pass' | 'Discrepancy' | 'Missing Asset';
  notes: string;
}

export interface TestCaseRecord {
  testId: string;
  scenario: string;
  input: string;
  expectedResult: string;
  actualResult: string;
  status: 'PASS' | 'FAIL' | 'PENDING';
  category: string;
}

export interface ValidationIssue {
  id: string;
  type: 'ERROR' | 'WARNING' | 'INFO';
  sheet: string;
  recordId: string;
  field: string;
  message: string;
  recommendation: string;
}

export type ActiveSheet = 
  | 'VALIDATION'
  | 'RECONCILIATION'
  | 'README'
  | 'DASHBOARD'
  | 'ASSET_REGISTER'
  | 'MASTER_DATA'
  | 'TRANSACTION_HISTORY'
  | 'PIVOTS'
  | 'CHARTS'
  | 'REPORTS'
  | 'SIP_PLANS'
  | 'LIFE_GOALS'

export type SheetId = ActiveSheet;

export interface MasterDataRecord {
  id: string;
  name: string;
  isActive: boolean;
  type?: string;
  notes?: string;
}

export interface PurityMasterRecord extends MasterDataRecord {
  karat: string;
  fineness: number;
  percentage: number;
  metalType?: string;
}

export interface MasterDataLists {
  locations: MasterDataRecord[];
  owners: MasterDataRecord[];
  categories: MasterDataRecord[];
  assetTypes: MasterDataRecord[];
  metalTypes: MasterDataRecord[];
  purities: PurityMasterRecord[];
  stoneTypes?: MasterDataRecord[];
  
  // Keep legacy string arrays for things we aren't migrating to full objects yet, 
  // or migrate them all if easier. The prompt mentioned specific ones:
  // Owners, Locations, Asset Types, Metal Types, Jewellery Categories, Purity/Fineness, Transaction Types
  transactionTypes: MasterDataRecord[];
  
  // The rest can be legacy or upgraded:
  finenesses: string[];
  weightUnits: string[];
  paymentModes: string[];
  ownershipTypes: string[];
  relationships: string[];
  assetStatuses: string[];
  transactionStatuses: string[];
  documentTypes: string[];
  validationStatuses: string[];
  transactionReasons: string[];
}
