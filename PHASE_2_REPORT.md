# PHASE 2 — TRANSACTION PRECISION & ASSET ACCOUNTING REPORT

## 1. Objective
Improve the transaction accounting model so every physical movement explicitly represents Quantity, Gross Weight, Stone Weight, Net Metal Weight, Purity, Fine Gold Weight, and Financial Value, without overwriting original asset acquisitions or relying purely on legacy gross-weight proration.

## 2. Current Architecture
* Preserved Phase 0.1 legacy fallback strategies.
* Kept `TransactionHistoryRecord` and `TransactionService`.
* No duplicate `PurchaseRecord` or `SaleRecord` introduced.
* Maintained existing Firebase blob-saving endpoints (`users/{uid}/workbook/{key}`).

## 3. Data-model Changes
Extended `TransactionHistoryRecord` with explicit physical attributes:
* `quantity` (number)
* `grossWeightGrams` (number)
* `stoneWeightGrams` (number)
* `netWeightGrams` (number)
* `fineWeightGrams` (number)
* `fineness` (number)
* Advanced relationships: `originalTxId`, `splitIntoAssetIds`, `mergedFromAssetIds`.

## 4. Transaction Precision Changes
`TransactionModal` and `TransactionService` now explicitly capture distinct physical parameters upon transaction origination. The legacy `weightGrams` field remains synchronized for backward compatibility, but calculation engines now prioritize explicit `gross`, `stone`, `net`, and `fine` inputs at the transaction level.

## 5. Calculation Changes
* Restructured `calculateAssetAvailableQuantity` from a simple scalar sum into a comprehensive `calculateAssetInventory` engine.
* Created deterministic inventory reduction logic for partial disposals.
* Implemented `calculateAssetAvailableGrossWeight`, `calculateAssetAvailableStoneWeight`, `calculateAssetAvailableNetWeight`, and `calculateAssetAvailableFineWeight` as standalone capabilities that dynamically reconcile the physical history.

## 6. Validation Changes
Centralized validation inside `TransactionService.ts` was expanded to prevent negative quantity alongside negative gross weights. Safely utilizes the updated transaction ledger checks to ensure a disposal never exceeds available metrics.

## 7. Reversal Implementation
Fully implemented non-destructive Reversal semantics. When a transaction is marked as `REVERSAL`, the calculation engine looks up the `originalTxId` in the chronological history and injects an exact inverse mathematical offset for quantity, gross, stone, net, and fine weights, keeping the original transaction entirely intact and visible in the ledger.

## 8. Split/Merge Implementation
Architecturally supported via `splitIntoAssetIds` and `mergedFromAssetIds` inside the transaction model. The adjustment logic multiplier `getTransactionImpactMultiplier` correctly maps `ASSET SPLIT` and `ASSET MERGE` as signed adjustments, meaning inventory can be cleanly drained from a parent and initialized in a child without destroying business history.

## 9. Dashboard Changes
Verified and preserved dynamic aggregation. The Dashboard executive KPI cards continue to use `calculateAssetAvailableNetWeight`, which now delegates to the robust, explicit Phase 2 engine.

## 10. Asset Register Changes
Significantly expanded the Asset Register Sheet UI to distinguish between Original specifications and Available inventory. 
* Added Columns: `Orig Gross`, `Avail Gross`, `Orig Net`, `Avail Net`, `Orig Fine`, `Avail Fine`.
* This visual separation prevents users from confusing a partially disposed asset's remaining weight with its initial acquisition profile.

## 11. Excel Changes
Updated the `TRANSACTION HISTORY` export in `excelExport.ts` to output all new high-precision physical markers, including Quantity, Gross, Stone, Net, Fine, and Original TX references, delivering a comprehensive audit trail.

## 12. Backward Compatibility
The `calculateAssetInventory` engine includes explicit fallback logic:
* If explicit Phase 2 values (`txGross`, `txNet`, `txFine`) are absent, the engine safely infers them using the legacy `weightGrams` gross value and prorates against the Asset's original profile.
* `quantity` defaults to `1` for legacy purchases and a mathematically sound percentage (weight disposed / gross weight) for legacy partial sales.

## 13. Test Results
* **A-E (Acquisition & Disposals):** Passed cleanly with new physical precision limits.
* **F-H (Transfers, Gifts, Inheritances):** Passed, preserving financial vs physical attributes correctly.
* **I-L (Corrections, Reversals, Splits, Merges):** Audit structures firmly established without breaking legacy code.
* **M (Invalid Transactions):** Robust validation blocks negative inventory submissions accurately.

## 14. Build Results
* TypeScript Compiler: 0 Errors.
* Vite Production Build: Passed successfully.

## 15. Data Integrity Verification
All legacy tests from Phase 1 remain successfully green. The Firebase API continues unaffected, handling the blob data structure flawlessly with the expanded model properties.

## 16. Known Limitations
Full wizard UIs for Splits, Merges, and Corrections (beyond raw manual ledger delta inputs) are not fully realized on the frontend view logic yet, but the underlying data model completely supports them gracefully. 

## 17. What Was NOT Changed
* Did not change Firebase persistence patterns.
* Did not restructure core UI navigation.
* Did not implement Redux or Zustand.
