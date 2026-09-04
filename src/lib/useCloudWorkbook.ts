import React, { useState, useEffect, useRef } from 'react';
import { doc, onSnapshot, setDoc, writeBatch } from 'firebase/firestore';
import { db, auth } from './firebase';
import { useAuthState } from 'react-firebase-hooks/auth';

export function useCloudState<T>(key: string, initialData: T): [T, (action: React.SetStateAction<T>) => Promise<void>] {
  const [user] = useAuthState(auth);
  const [state, setState] = useState<T>(initialData);
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    if (!user) return;
    const docRef = doc(db, 'users', user.uid, 'workbook', key);
    const unsub = onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        setState(snap.data().data as T);
      }
    });
    return () => unsub();
  }, [user, key]);

  const saveState = async (action: React.SetStateAction<T>) => {
    if (!user) throw new Error("Not authenticated");
    
    let newState: T;
    if (typeof action === 'function') {
      newState = (action as any)(stateRef.current);
    } else {
      newState = action;
    }

    const cleanData = JSON.parse(JSON.stringify(newState));
    const docRef = doc(db, 'users', user.uid, 'workbook', key);
    await setDoc(docRef, { data: cleanData });
  };

  return [state, saveState];
}

export async function saveWorkbookBatch(updates: { key: string, data: any }[]) {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");
  
  const batch = writeBatch(db);
  for (const {key, data} of updates) {
    const docRef = doc(db, 'users', user.uid, 'workbook', key);
    batch.set(docRef, { data: JSON.parse(JSON.stringify(data)) });
  }
  await batch.commit();
}

