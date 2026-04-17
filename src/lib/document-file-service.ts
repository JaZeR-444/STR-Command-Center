import type { FileRegistryRecord } from '@/types';
import { uploadFileToCloud, getCloudFileSignedUrl, isCloudSyncConfigured } from './supabase';

export async function hashFile(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const digest = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(digest));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export function findRegistryByHash(
  registry: Record<string, FileRegistryRecord>,
  hash: string
): FileRegistryRecord | undefined {
  return Object.values(registry).find(record => record.hash === hash);
}

export function buildCloudStoragePath(docId: string, hash: string, fileName: string): string {
  const ext = fileName.includes('.') ? fileName.substring(fileName.lastIndexOf('.')).toLowerCase() : '';
  return `documents/${docId}/${hash}${ext}`;
}

export async function ensureCloudUpload(
  path: string,
  file: File
): Promise<{ success: boolean; storagePath?: string; error?: string }> {
  if (!isCloudSyncConfigured()) {
    return { success: false, error: 'Cloud sync is not configured' };
  }
  const result = await uploadFileToCloud(path, file);
  if (!result.success) return { success: false, error: result.error };
  return { success: true, storagePath: path };
}

export async function getCloudPreviewUrl(path: string): Promise<string | null> {
  const result = await getCloudFileSignedUrl(path, 3600);
  if (!result.success || !result.url) return null;
  return result.url;
}
