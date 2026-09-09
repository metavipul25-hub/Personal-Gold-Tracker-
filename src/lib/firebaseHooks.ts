import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';
import { validateUploadedFile, sanitizeFilename } from '../utils/fileValidation';

export const uploadInvoice = async (assetId: string, file: File): Promise<string> => {
  if (!file) return '';
  
  const validation = validateUploadedFile(file, {
    allowedMimeTypes: ['image/jpeg', 'image/png', 'application/pdf'],
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.pdf']
  });

  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const safeName = sanitizeFilename(file.name);
  const storageRef = ref(storage, `invoices/${assetId}/${safeName}`);
  
  await uploadBytes(storageRef, file);
  return await getDownloadURL(storageRef);
};

