# Phase 4 — Guided Transaction Workflows Complete

The unified `TransactionModal` has been transformed into a complete guided wizard for all asset movements.

## Workflows Implemented
1. **Purchase & Opening Balance**: Creates new assets with master data constraints.
2. **Sale & Gift Given**: Enforces withdrawal checks against available quantities.
3. **Partial & Full Transfers**: Automatically generates `ASSET SPLIT` under the hood if a partial transfer is detected for Owner/Location, strictly maintaining zero-loss inventory tracking.
4. **Asset Split**: Allows splitting a parent asset into N arbitrary child assets, proportionalizing stone weight while keeping total net/gross weight mathematically identical.
5. **Asset Merge**: Allows selecting N compatible assets (same metal/purity) and fusing them into a new target asset, zeroing out old balances gracefully.
6. **Correction**: Allows raw delta injections to fix data entry errors.
7. **Reversal**: Dynamically targets a specific historical `txId` and generates an exact opposite inverted transaction.
8. **Inheritance**: Models receipt and transfers smoothly.

## Architectural Adherence
- **Atomic Operations**: `onSave` receives arrays of `(transactions[], newAssets[])` so complex workflows (like splits producing multiple assets) are committed identically in a single render frame.
- **Centralized Engine**: Uses `TransactionService` and Phase 2's `calculateAssetInventory`.
- **Master Data**: Strictly binds dropdowns in the UI to active master data arrays (Locations, Owners, Categories).
