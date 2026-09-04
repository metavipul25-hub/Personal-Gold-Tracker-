import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';

export const uploadInvoice = async (assetId: string, file: File): Promise<string> => {
  if (!file) return '';
  const storageRef = ref(storage, `invoices/${assetId}/${file.name}`);
  await uploadBytes(storageRef, file);
  return await getDownloadURL(storageRef);
};
