import React, { useState, useEffect, useRef } from 'react';
import { doc, onSnapshot, setDoc, writeBatch, collection, runTransaction } from 'firebase/firestore';
import { db, auth } from './firebase';
import { useAuthState } from 'react-firebase-hooks/auth';

let currentLocalRevision = 0;
let syncStatus = 'SYNCED';
let globalListeners: Record<string, (data: any) => void> = {};
let collectionUnsub: (() => void) | null = null;
let activeUid: string | null = null;

import { onAuthStateChanged } from 'firebase/auth';

onAuthStateChanged(auth, (user) => {
  if (!user) {
    if (collectionUnsub) {
      collectionUnsub();
      collectionUnsub = null;
    }
    activeUid = null;
    currentLocalRevision = 0;
    syncStatus = 'SYNCED';
  }
});


function setupCollectionListener(uid: string) {
  if (activeUid === uid) return;
  if (collectionUnsub) collectionUnsub();
  activeUid = uid;

  const colRef = collection(db, 'users', uid, 'workbook');
  collectionUnsub = onSnapshot(colRef, 
    (snap) => {
      syncStatus = 'SYNCED';
      if (globalListeners['_status']) globalListeners['_status'](syncStatus);

      let foundMetadata = false;
      
      // Update data and notify listeners
      snap.docs.forEach(docSnap => {
        const key = docSnap.id;
        const data = docSnap.data();
        if (key === '_metadata') {
          currentLocalRevision = data.revision || 0;
          foundMetadata = true;
          if (globalListeners['_metadata']) globalListeners['_metadata'](data);
        } else {
          if (globalListeners[key] && data.data) {
            globalListeners[key](data.data);
          }
        }
      });
      
      // If we just got a snapshot but no metadata, we might be new.
      // We don't force a revision update here, saveWorkbookBatch will initialize it.
    },
    (error) => {
      console.error("Sync listener error", error);
      syncStatus = 'ERROR';
      if (globalListeners['_status']) globalListeners['_status'](syncStatus);
    }
  );
}

export function useSyncStatus() {
  const [user] = useAuthState(auth);
  const [status, setStatus] = useState(syncStatus);
  const [lastSync, setLastSync] = useState('');
  
  useEffect(() => {
    if (!user) return;
    setupCollectionListener(user.uid);
    
    globalListeners['_status'] = setStatus;
    globalListeners['_metadata'] = (data) => setLastSync(data.lastUpdated || '');
    
    return () => {
      delete globalListeners['_status'];
      delete globalListeners['_metadata'];
    };
  }, [user]);

  return { status, lastSync };
}

export function useCloudState<T>(key: string, initialData: T): [T, (action: React.SetStateAction<T>) => Promise<void>] {
  const [user] = useAuthState(auth);
  const [state, setState] = useState<T>(initialData);
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    if (!user) return;
    setupCollectionListener(user.uid);
    
    globalListeners[key] = (newData) => {
      setState(newData);
    };

    return () => {
      delete globalListeners[key];
    };
  }, [user, key]);

  const saveState = async (action: React.SetStateAction<T>) => {
    if (!user) throw new Error("Not authenticated");
    
    let newState: T;
    if (typeof action === 'function') {
      newState = (action as any)(stateRef.current);
    } else {
      newState = action;
    }
    
    await saveWorkbookBatch([{ key, data: newState }]);
  };

  return [state, saveState];
}

export async function saveWorkbookBatch(updates: { key: string, data: any }[]) {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");
  
  const metaRef = doc(db, 'users', user.uid, 'workbook', '_metadata');
  
  syncStatus = 'SYNCING';
  if (globalListeners['_status']) globalListeners['_status'](syncStatus);
  
  try {
    await runTransaction(db, async (transaction) => {
      const metaDoc = await transaction.get(metaRef);
      const serverRevision = metaDoc.exists() ? metaDoc.data().revision || 0 : 0;
      
      if (serverRevision > currentLocalRevision) {
        throw new Error("SYNC_CONFLICT");
      }
      
      const nextRevision = serverRevision + 1;
      
      for (const {key, data} of updates) {
        const docRef = doc(db, 'users', user.uid, 'workbook', key);
        transaction.set(docRef, { data: JSON.parse(JSON.stringify(data)) });
      }
      
      transaction.set(metaRef, { 
        revision: nextRevision, 
        lastUpdated: new Date().toISOString() 
      });
    });
    
    // Success, local listener will fire and set status to SYNCED
  } catch (error: any) {
    if (error.message === 'SYNC_CONFLICT') {
      syncStatus = 'CONFLICT';
      if (globalListeners['_status']) globalListeners['_status'](syncStatus);
    } else {
      syncStatus = 'ERROR';
      if (globalListeners['_status']) globalListeners['_status'](syncStatus);
    }
    throw error;
  }
}
