import { MasterDataLists, MasterDataRecord } from '../types';

export const getMasterName = (
  list: MasterDataRecord[] | string[] | undefined,
  id: string | undefined | null,
  fallback: string = 'Unknown'
): string => {
  if (!id) return fallback;
  if (!list || list.length === 0) return id; // If not loaded, return ID
  
  if (typeof list[0] === 'string') {
     // Legacy string array
     return id;
  }
  
  // Object array
  const record = (list as MasterDataRecord[]).find(item => item.id === id);
  return record ? record.name : id;
};
