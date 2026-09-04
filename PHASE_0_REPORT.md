# PHASE 0 ARCHITECTURE REPORT

## A. Current Application Architecture
The application is a React SPA (built with Vite + TypeScript) acting as a monolith. The central `App.tsx` file carries the massive responsibility of storing all global state (Assets, Transactions, Master Data, etc.) and acts as the singular clearinghouse for updating that data. The UI relies on sheet-style components (`DashboardSheet`, `AssetRegisterSheet`, etc.) and heavily logic-laden Modals for user input. 

## B. Current Data Flow
1. Data lives in `App.tsx` arrays (e.g., `assets`, `transactions`).
2. These arrays are passed down to Modals and Sheets as props.
3. When a user submits a modal (e.g., `TransactionModal.tsx`), the modal executes extensive branching business logic and passes raw objects back to `App.tsx` via an `onSave` callback.
4. `App.tsx` then performs *more* business logic (calculating available quantity, determining new statuses, setting owners) before mutating the state arrays.

## C. Current Firebase Architecture
There are two competing persistence approaches in the codebase:
1. **Approach A (`useCloudWorkbook.ts`)**: This is what the application actually uses. It syncs the entire state (Assets, Transactions, etc.) as large, debounced JSON stringified arrays to a single Firestore document (`users/{uid}/workbook/{key}`).
2. **Approach B (`firebaseHooks.ts`)**: Contains a fully built but **unused** `useFirestoreCollection` hook designed for standard, scalable collection-level operations (one document per asset/transaction).

## D. Current Asset → Transaction Relationship
The relationship is heavily duplicated and ambiguous:
* Creating an Asset in `AssetModal.tsx` manually hacks in a dummy transaction (`TX-REG-xxx`) to maintain history.
* Editing an Asset manually hacks in a `TX-UPD-xxx` (CORRECTION) transaction.

## E. Current Transaction → Asset Relationship
* `TransactionModal.tsx` has logic that dynamically creates brand new Assets on the fly for acquisitions (`PURCHASE`, `GIFT RECEIVED`).
* For non-acquisitions (`SALE`, `TRANSFER`), it modifies existing assets directly inside the `App.tsx` callback.

## F. Duplicate Business Logic
* **Asset Updating**: `App.tsx` has inline business rules determining if a status should change to "Sold" or "Partially Sold".
* **Quantity Checks**: `TransactionModal.tsx` manually triggers `calculateAssetAvailableQuantity` to prevent negative inventory before saving, but `App.tsx` calculates it *again* when saving.
* **Master Data**: `AssetModal.tsx` and `TransactionModal.tsx` completely ignore `masterData` for many fields and use hardcoded `<option>` tags (e.g., "Necklace", "22K").

## G. Duplicate Calculations
* While `calculations.ts` exists and is mostly utilized, `AssetModal.tsx` recalculates Net Gold Weight inline via `onChange` events, even though `calculateNetGoldWeight()` is available in the utility file.

## H. Duplicate Firebase/persistence logic
As identified in Section C, `firebaseHooks.ts` represents an entirely dead architectural pathway. The debounced full-workbook write in `useCloudWorkbook.ts` risks data loss if the user closes the window during the 1000ms debounce window.

## I. Hard-coded Master Data
* `AssetModal.tsx` hardcodes dropdowns for categories, purity, metal types, etc.
* `TransactionModal.tsx` hardcodes transaction types and purity.
* `calculations.ts` relies on hardcoded string checks (`['PURCHASE', 'GIFT RECEIVED']`) instead of referencing a central domain configuration.

## J. Legacy/unused Code
* `PurchaseRecord` and `SaleRecord` interfaces exist in `types.ts` and `initialData.ts`, but are completely ignored by the UI (everything uses the unified `TransactionHistoryRecord`).
* Root scripts: `rewrite_master_data.js`, `update_app_state_cloud.js`, `update_app_state.js`, `update_app_ui.js`, `update_tx_sheet.js`, and `update_types.js` are leftover build scripts taking up space.

## K. Potential Data-Loss Risks
* **Hard Deletion**: `AssetRegisterSheet.tsx` triggers a `filter` array operation that physically deletes an asset. If an asset is deleted, its historical transactions become orphaned (`ERR-ORPHAN-TX`), breaking the ledger.
* **Full Workbook Sync**: Overwriting the whole document on every state change means concurrent sessions (e.g., laptop and phone) will blindly overwrite each other.

---

## L. Recommended Safe Refactoring Plan (Phase 0 Execution)

Based on your strict constraints (DO NOT rewrite everything, keep existing data intact), here is the step-by-step roadmap to clean the foundation:

1. **Centralize the Domain (The `TransactionService`)**
   * Create a centralized handler in `src/services/TransactionService.ts` representing the rule: `applyTransactionToAsset(asset, transaction)`.
   * Strip the business logic out of `App.tsx`'s `handleSave` callbacks and move it to this service.

2. **Clean Up Modals**
   * Refactor `AssetModal.tsx` and `TransactionModal.tsx` to pull their `<select>` dropdowns purely from the `masterData` state.
   * Strip transaction-creation logic out of `AssetModal.tsx`. 
   * Strip asset-creation logic out of `TransactionModal.tsx` (the Service will handle this securely).

3. **Safeguard Data (Soft Deletion)**
   * Replace the `handleDeleteAsset` array-filter in `App.tsx` with a soft-delete (e.g., setting `status: 'Archived'` or `isArchived: true`).

4. **Type Consolidation**
   * Safely remove `PurchaseRecord` and `SaleRecord` references from `types.ts` and `excelExport.ts`, standardizing 100% on `TransactionHistoryRecord` as the single source of truth for history.

5. **Legacy Cleanup**
   * Delete the obsolete `.js` root scripts and the unused `useFirestoreCollection` from `firebaseHooks.ts`. Keep `useCloudWorkbook.ts` as the sole persistence layer for now, as migrating to collections is a high-risk structural change that violates the "Do not break existing functionality" rule of Phase 0.
