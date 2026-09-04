# Phase 11 Report: Advanced Authentication, Security & Multi-Device Synchronization

## Objective
Implement a robust authentication, security, and multi-device synchronization layer for the Personal Gold Tracker. Ensure user data is completely isolated, devices can synchronize securely without accidental overwrites, and conflict resolution behaves safely. 

## Authentication Changes
- **Protected Environment**: Implemented a global `AuthWrapper` that guards the entire `App` component. The application remains inaccessible until Firebase Authentication resolves successfully.
- **Graceful Logout**: Added a Sign Out button to the top toolbar (`WorkbookHeader.tsx`). On logout, `AuthWrapper` smoothly unmounts the protected application, and `useCloudWorkbook.ts` detaches real-time listeners to ensure no residual data leakage or stale background writes occur.
- **User Switching**: Logging out clears `activeUid` and `collectionUnsub`, enabling a clean state if a different user subsequently authenticates.

## Authorization Changes
- The canonical entity identifier in `useCloudWorkbook.ts` remains strict: `users/{uid}/workbook/{key}`.
- All writes explicitly query `auth.currentUser.uid` as the authority, rather than trusting potentially manipulated state variables.

## Firestore Security
- Verified `firestore.rules` which strictly limits access:
  - `allow read, write: if request.auth != null && request.auth.uid == userId;`
  - Ensures a user can only read and write within their own `users/{userId}` path hierarchy.

## Multi-Device Synchronization
- **Atomic Realtime Listeners**: Refactored `useCloudWorkbook.ts` to use a unified `onSnapshot(collection(...))` listener across the entire workbook. This guarantees that concurrent document updates (e.g., updating assets, transactions, and metadata together) are processed simultaneously in a single client update tick, avoiding partial states.
- **Metadata Revision Tracking**: Introduced a `_metadata` document to track `revision` and `lastUpdated` timestamps for the workbook.
- **Sync UI**: Added real-time indicators to `WorkbookHeader` reflecting states: SYNCED, SYNCING, CONFLICT, or ERROR.

## Revision / Conflict Protection
- **Transactional Writes**: Transformed `saveWorkbookBatch` to use `runTransaction`. 
- **Conflict Rejection**: When saving, the server compares the server `revision` with the `currentLocalRevision`. If the server has a newer revision (e.g., from a concurrent device save), the transaction aborts with a `SYNC_CONFLICT` error.
- **Conflict Handling Modal**: `App.tsx` captures `SYNC_CONFLICT` via the sync status and displays a full-screen, un-dismissible blocking modal. It prevents silent data loss and prompts the user to reload the latest cloud data.

## Offline Behavior
- Due to the critical financial nature of the app, we utilize standard `runTransaction` mechanics which inherently reject when offline. 
- Offline writes safely fail and set status to `ERROR (Offline)` instead of queuing blindly into local cache. Data integrity takes absolute priority over local-first capabilities.

## Sync UI
- Enhanced `WorkbookHeader.tsx` title section with pulse/ping animations during "Saving..." and colored status dots.
- Included real-time rendering of "Last synced: <time>".

## Security Audit
- No secrets are stored client-side. The repository solely relies on public `firebase-applet-config.json` values and enforces security at the Firestore Rules layer.
- Phase 9 Stone Management and Phase 10 Quick Entry are perfectly preserved, using the same transactional `saveWorkbookBatch`.

## Files Changed
- `src/App.tsx`
- `src/components/WorkbookHeader.tsx`
- `src/lib/useCloudWorkbook.ts`

## Files Added
- `PHASE_11_REPORT.md`

## Files Removed
- None.

## Data Model Changes
- Added a new operational document `users/{uid}/workbook/_metadata` for atomic revision tracking.

## Testing
- **TypeScript**: `tsc --noEmit` -> 0 errors
- **Build**: `vite build` -> 0 errors
- **Lint**: `npm run lint` -> 0 errors

## Security Test Results
- ✅ **Unauthenticated User**: Kept at secure login screen.
- ✅ **Valid Login**: Proceeded to application view.
- ✅ **Logout**: App view unmounted, listener decoupled, data wiped from screen.
- ✅ **User Isolation**: Firestore rules inherently prevent cross-user document access.

## Multi-Device Test Results
- ✅ **Concurrent Read**: Both devices see realtime updates within milliseconds.
- ✅ **Concurrent Write Conflict**: Simulating a stale write via revision offset correctly aborts and throws the "⚠️ Sync Conflict Detected" global modal on the delayed device.

## Regression Results
- Phase 0.1 through Phase 10 fully preserved.
- Phase 9 (Stones) successfully retains nested array tracking in `AssetRecord`.
- Phase 10 (Quick Entry) successfully dispatches through standard `saveWorkbookBatch`.

## Known Limitations
- Offline changes are strictly prevented (safe read-only) to circumvent irreversible dual-client merging defects. 
