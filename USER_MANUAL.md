# Personal Gold Tracker - User Manual

## 1. Introduction
Welcome to the Personal Gold Tracker. This system is a high-precision, multi-device, offline-aware tracking system for personal jewellery, bullion, and precious metal assets. It incorporates professional accounting principles, lifecycle management (splits/merges), detailed gemstone tracking, and reconciliation.

## 2. Login
The application is securely protected by Firebase Authentication. 
- **Authentication**: You must sign in with your Google account to access your vault.
- **Login**: Click "Continue with Google". Your data is strictly isolated to your account.
- **Logout**: Use the "Sign Out" button in the top right. Upon logging out, your session is immediately cleared from the device.
- **Account Security**: No one else can access your workbook. Your data is tied cryptographically to your authenticated identity.

## 3. Dashboard
The Dashboard provides a real-time executive summary of your portfolio.
- **Total Portfolio Value**: Calculated based on the current entered values of your assets.
- **Gold Holdings**: Broken down by pure/fine gold weight vs. gross weight.
- **Recent Transactions**: A quick glance at your latest acquisitions, sales, or transfers.
- **Asset Distribution**: Visualizes your holdings by category, purity, and location.

## 4. Assets
Assets represent your physical holdings (e.g., a specific gold chain or a gold coin).
- **Creating an asset**: Use "+ Add Transaction" -> "Acquisition" to create a new asset.
- **Editing**: Assets are primarily updated through the Transaction Engine (e.g., corrections, split, merge).
- **Viewing**: The Asset Register provides a comprehensive view of all active and pledged assets.
- **Archiving**: When an asset is sold or completely merged/split, it is moved to an Archived state and retains its historical lineage but does not count towards active totals.
- **Asset Details**: You can view the full history and lineage of any asset by clicking on it in the Asset Register.

## 5. Transactions
The Transaction Engine is the core of the system. All changes to your vault must go through this double-entry inspired system.
- **Acquisition**: When you buy or receive an asset. Creates a new active asset.
- **Sale**: When you sell an asset. Archives the asset and records the sale value.
- **Owner Transfer**: When you transfer ownership (e.g., gifting). Archives the asset.
- **Location Transfer**: Moving an asset from one locker/location to another.
- **Correction**: Used to fix a data entry error on an existing asset without altering its lineage.
- **Review**: Every transaction presents a review screen before execution.
- **Effect**: Transactions instantly update your Dashboard, Asset Register, and Audit logs.

## 6. Quick Entry
The Mobile-First Quick Transaction Entry is designed for rapid logging on the go.
- Access it via the "+ Quick Tx" button.
- It uses a wizard format: Select Type -> Select Asset -> Enter Details -> Review & Save.
- It supports everyday transactions like Purchase, Sale, Gifting, and Location Transfers.
- For complex structural changes (Splits/Merges), it will direct you to the Advanced Workflow.

## 7. Gold & Weight Concepts
The system relies on strict precision accounting:
- **Gross Weight**: The total weight of the physical item on a scale.
- **Stone Weight**: The weight of non-gold elements (diamonds, rubies, enamel).
- **Net Gold Weight**: Gross Weight minus Stone Weight (converted to grams).
- **Karat / Purity**: The concentration of gold (e.g., 22K or 91.6%).
- **Pure/Fine Gold Weight**: The mathematical equivalent weight if the item were 100% (24K) pure gold. This is the canonical metric for your portfolio.

## 8. Stone/Gemstone Management
The system provides enterprise-grade tracking for stones embedded in gold assets.
- **Stone Records**: Each asset can have an unlimited array of nested stone records.
- **Quantity & Carat**: Tracks the number of stones and total carat weight.
- **Gram Weight**: Automatically converts carat to grams (1 Carat = 0.2 Grams).
- **Cut/Color/Clarity**: Tracks standard diamond grading metrics.
- **Certification**: Tracks GIA/IGI certificate numbers.
- **Relationship**: The total gram weight of all stones is automatically subtracted from the Gross Weight to determine Net Gold Weight. Gemstone carat weight is NEVER treated as gold weight.

## 9. Split
The Split workflow allows you to break one parent asset into multiple child assets.
- **Workflow**: Select an asset, choose "Split", and define the new child assets.
- **Lineage**: The parent asset is archived. The new child assets point back to the parent ID in their history.

## 10. Merge
The Merge workflow allows you to melt/combine multiple source assets into a new single asset.
- **Workflow**: Select multiple source assets, choose "Merge", and define the newly created asset.
- **Lineage**: The source assets are archived. The new asset points back to all source IDs.

## 11. Master Data
Master Data defines the dropdown options used throughout the app.
- **Stores**: The jewelers or locations where you transact.
- **Categories**: E.g., Bangles, Rings, Coins.
- **Purity**: E.g., 22K (91.6%), 24K (99.9%).
- **Lockers**: Physical storage locations (e.g., Home Safe, Bank Vault A).
Maintaining clean master data ensures your reporting is accurate.

## 12. Reports
The system includes multiple reporting views:
- **Holding Statement**: A point-in-time snapshot of your vault.
- **Transaction History**: A chronological ledger of all events.
- **Lifecycle Reports**: Shows the lineage of splits and merges.
- **Stone Inventory**: A dedicated report of all tracked gemstones.
- All reports can be exported to Excel.

## 13. Reconciliation
The Validation & Audit sheet automatically checks for data inconsistencies.
- It scans for mathematical anomalies, missing master data, or orphaned records.
- If inconsistencies are found, the system provides guidance on which transaction to correct.

## 14. Backup
- Access the Backup function via the Workbook Header (Download icon with a shield).
- It generates a `.json` file containing a full, encrypted point-in-time snapshot of your entire vault.
- Create backups periodically or before major structural changes.

## 15. Restore
- Access Restore via the Workbook Header (Upload icon).
- **When to restore**: If you made a catastrophic error or wish to revert to a previous state.
- **Safety**: The system will automatically create a pre-restore safety backup before applying the uploaded file.
- **Precautions**: Restoration overwrites your current cloud vault. Proceed with caution.

## 16. Cloud Sync
The application synchronizes in real-time with Google Firebase.
- **SYNCED**: Your local device exactly matches the cloud vault.
- **SYNCING**: Changes are currently being transmitted.
- **ERROR/OFFLINE**: You have lost internet connection. Operations will safely fail until connection is restored.
- **CONFLICT**: Another device updated the vault while you were editing.

## 17. Multi-Device Usage
You can safely use the application across your laptop, tablet, and mobile phone.
- The interface automatically adapts to your screen size.
- Real-time listeners ensure that if you add an asset on your phone, it appears on your laptop instantly.

## 18. Conflict Handling
If two devices attempt to save contradictory data at the exact same time, the system protects your data.
- The slower device will receive a "Sync Conflict Detected" modal.
- The system will NOT silently merge or overwrite data to prevent mathematical corruption.
- You will be required to click "Reload Cloud Version" to retrieve the latest safe state and re-enter your most recent change.

## 19. Data Safety
- **Cloud Synchronization**: Backed by Google Firestore.
- **Backups**: You possess the ability to export hard copies of your data.
- **Account Security**: Secured by Google OAuth.
- **Conflict Blocks**: Strict revision tracking ensures math is never corrupted by network lag.

## 20. Troubleshooting
- **App won't load**: Check your internet connection. Authentication requires connectivity.
- **Cannot save transaction**: Ensure all required fields (marked with an asterisk) are filled, and mathematical rules (e.g., Net Weight cannot be negative) are satisfied.
- **Sync Conflict**: Follow the on-screen prompt to reload.

## 21. Recommended Operating Practices
1. **Regular Backups**: Download a backup every month.
2. **Master Data First**: If dealing with a new jeweler, add them to the Master Data sheet before creating the transaction.
3. **Log Promptly**: Log transactions as they occur to ensure historical pricing accuracy.
