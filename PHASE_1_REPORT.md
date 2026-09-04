# PHASE 1 — GOLD TRACKER CORE BUSINESS WORKFLOW REPORT

## 1. Objective
Implement and verify the complete core business workflow for physical gold asset management, ensuring that acquisitions, sales, transfers, and adjustments are handled predictably via a unified, immutable transaction ledger.

## 2. Files Inspected
* `src/types.ts`
* `src/services/TransactionService.ts`
* `src/App.tsx`
* `src/data/initialData.ts`
* `src/components/modals/TransactionModal.tsx`
* `src/utils/calculations.ts`
* `src/components/sheets/DashboardSheet.tsx`
* `src/components/sheets/AssetRegisterSheet.tsx`
* `src/utils/excelExport.ts`

## 3. Files Changed
* `src/services/TransactionService.ts`
* `src/utils/calculations.ts`
* `src/components/sheets/DashboardSheet.tsx`
* `src/components/sheets/AssetRegisterSheet.tsx`

## 4. Files Added
None in this phase.

## 5. Business Rules Implemented
* **Canonical Model Definition**: Asset represents the physical item. Transactions represent the immutable events acting upon them.
* **Separation of Original vs Current**: Asset's original `netGoldWeight` is treated as immutable historical truth. Current available weight is strictly computed dynamically from the transaction ledger.

## 6. Transaction Types Supported
* **Acquisition**: `PURCHASE`, `GIFT RECEIVED`, `INHERITANCE RECEIVED`, `OPENING BALANCE`
* **Disposal**: `SALE`, `GIFT GIVEN`, `INHERITANCE TRANSFERRED`
* **Movement/Status**: `OWNER TRANSFER`, `LOCATION TRANSFER`
* **Adjustment**: `CORRECTION`, `REVERSAL`, `ASSET SPLIT`, `ASSET MERGE`

## 7. Validation Rules
* Centralized in `TransactionService.validateTransaction`.
* Zero or negative weight submissions are blocked.
* Negative inventory protection ensures `SALE` weight cannot exceed the dynamically calculated `availableQuantity`.
* Transactions attempting to act on non-existent assets are blocked.

## 8. Asset Lifecycle
* **Active**: Created securely with initial quantity.
* **Partially Sold**: Automatically transitions when a disposal transaction removes > 0 but < total available quantity.
* **Sold (Fully Disposed)**: Automatically transitions when a disposal transaction reduces available quantity to 0.
* **Archived**: Preserved soft-delete behavior implemented in Phase 0.1 without ledger destruction.

## 9. Calculation Rules
* **Ledger Aggregation**: `calculateAssetAvailableQuantity` processes numerical transaction impact sequentially.
* **Dynamic Net Weight Math**: `calculateAssetAvailableNetWeight` correctly computes the available net gold weight by prorating the available gross quantity against the asset's original gross/net ratio.
* **Dynamic Fine Gold Math**: `calculateAssetAvailableFineWeight` converts the dynamic net weight to fine gold weight using the asset's fineness purity code.

## 10. Dashboard Changes
* Found and corrected a critical calculation flaw where `DashboardSheet.tsx` was statically summing `asset.netGoldWeight` (the original weight), resulting in overstated inventory after sales.
* Re-wired Dashboard executive KPI cards (Total Available Gold, Fine Gold) and all categorical pivots to utilize the new `calculateAssetAvailableNetWeight` function, resulting in accurate, real-time inventory aggregation driven entirely by the transaction ledger.

## 11. Export Changes
* The unified `TRANSACTION HISTORY` sheet remains the singular authoritative financial export for auditability. No legacy types (`PurchaseRecord` / `SaleRecord`) were recreated.

## 12. Edge-case Testing
* **Test C / D (Partial / Full Sale)**: Covered perfectly. Ledger dynamically updates `quantityAvailable` and applies "Partially Sold" or "Sold" asset statuses.
* **Test E (Negative Inventory)**: Successfully blocked in the `TransactionService` validation layer using real-time ledger reduction.
* **Test G (Adjustment)**: Addressed logic where a `CORRECTION` dropping inventory to exactly 0 correctly sets the status to "Sold", while increasing it correctly reverts status back to "In Vault".

## 13. Build/Test Results
* **Vite Production Build**: Passed (0 errors).
* **TypeScript Compiler**: Passed (0 errors).

## 14. Data-Integrity Verification
* Original logic of Phase 0.1 was thoroughly verified. 
* Asset IDs and Transaction IDs are strictly preserved.
* Firebase persistence endpoint (`users/{uid}/workbook/{key}`) remains fully active and unmolested.
* The system is purely running off unified `TransactionHistoryRecord`.

## 15. Known Limitations
* Transaction `weightGrams` tracks Gross Weight for physical logic consistency (especially in fractional partial sales), which requires mathematical proration to extract the remaining net gold. This has been safely implemented, but future phases may want explicit dual-entry fields (Net/Gross) directly on the transaction modal form for higher precision.

## 16. What Was NOT Changed
* **Database Architecture**: Did not migrate Firebase collections. The workbook blob system remains.
* **Global State**: Did not implement Redux or Zustand.
* **UI Structure**: Maintained existing layout patterns without unrequested feature-bloat.
