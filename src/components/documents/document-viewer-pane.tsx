'use client';

import { useState, useEffect, useCallback } from 'react';
import { useApp } from '@/lib/context';
import { isDocCompleted } from '@/lib/selectors';
import { saveFile, getFile, deleteFile } from '@/lib/file-storage';
import { extractSmartTags } from '@/lib/document-utils';
import { buildCloudStoragePath, ensureCloudUpload, findRegistryByHash, getCloudPreviewUrl, hashFile } from '@/lib/document-file-service';
import { isCloudSyncConfigured } from '@/lib/supabase';
import type { DocumentArtifact, DocumentStatus } from '@/types';

// Sub-components
import { DocumentHeader } from './document-header';
import { DocumentStatusSelector } from './document-status-selector';
import { DocumentAttachments } from './document-attachments';
import { DocumentPreview } from './document-preview';
import { SmartTagsSection } from './smart-tags-section';
import { DocumentNotes } from './document-notes';

interface DocumentViewerPaneProps {
  doc: DocumentArtifact | null;
}

const statusLabels: Record<DocumentStatus, string> = {
  missing: 'Missing',
  in_review: 'In Review',
  verified: 'Verified',
  expired: 'Expired',
};

export function DocumentViewerPane({ doc }: DocumentViewerPaneProps) {
  const {
    state,
    updateDocStatus,
    appendAuditLog,
    setSmartTags,
    setDocNote,
    addDocAttachment,
    removeDocAttachment,
    patchDocAttachment,
    upsertFileRegistryRecord,
  } = useApp();
  const [note, setNote] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [previewUrls, setPreviewUrls] = useState<Record<string, string>>({});
  const [activePreviewId, setActivePreviewId] = useState<string | null>(null);
  const [showExistingFiles, setShowExistingFiles] = useState(false);

  const meta = doc ? (state.docMeta[doc.id] || {}) : {};
  const attachments = meta.attachments || [];
  const registryRecords = Object.values(state.fileRegistry || {});
  
  // Backwards compatibility: If legacy isCompleted but no status, treat as verified
  const isLegacyCompleted = isDocCompleted(state, doc?.id || '');
  const currentStatus: DocumentStatus = meta.status || (isLegacyCompleted ? 'verified' : 'missing');
  const smartTags = meta.smartTags || [];

  const mergeSmartTags = useCallback(
    (existing: { key: string; value: string }[], incoming: { key: string; value: string }[]) => {
      const seen = new Set<string>();
      const merged: { key: string; value: string }[] = [];
      [...existing, ...incoming].forEach(tag => {
        const id = `${tag.key}::${tag.value}`;
        if (seen.has(id)) return;
        seen.add(id);
        merged.push(tag);
      });
      return merged;
    },
    []
  );

  // Load notes when doc changes
  useEffect(() => {
    if (doc) {
      setNote(state.docMeta[doc.id]?.note || '');
    }
  }, [doc, state.docMeta]);

  // Load preview URLs from IndexedDB or cloud storage for attachments
  useEffect(() => {
    const urls: Record<string, string> = {};
    let isCancelled = false;

    const loadMissingPreviews = async () => {
      for (const att of attachments) {
        if (previewUrls[att.id]) {
          urls[att.id] = previewUrls[att.id];
          continue;
        }

        const file = await getFile(att.id);
        if (file && !isCancelled) {
          urls[att.id] = URL.createObjectURL(file);
          continue;
        }

        if (att.storagePath) {
          const signedUrl = await getCloudPreviewUrl(att.storagePath);
          if (signedUrl && !isCancelled) {
            try {
              const response = await fetch(signedUrl);
              const blob = await response.blob();
              const restored = new File([blob], att.name, { type: att.type || blob.type });
              await saveFile(att.id, restored);
              urls[att.id] = URL.createObjectURL(restored);
              patchDocAttachment(doc!.id, att.id, { source: 'hybrid' });
            } catch {
              // Fallback to direct signed URL if cache save fails
              urls[att.id] = signedUrl;
            }
          }
        }
      }

      if (!isCancelled) {
        setPreviewUrls(urls);
        if (attachments.length > 0 && !activePreviewId) {
          setActivePreviewId(attachments[0].id);
        } else if (attachments.length === 0) {
          setActivePreviewId(null);
        }
      }
    };

    loadMissingPreviews();

    return () => {
      isCancelled = true;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attachments, doc?.id, patchDocAttachment, previewUrls]);

  const handleStatusChange = useCallback((status: DocumentStatus) => {
    if (!doc || currentStatus === status) return;
    updateDocStatus(doc.id, status);
    appendAuditLog(doc.id, `Status updated to ${statusLabels[status]}`, 'You');
  }, [doc, currentStatus, updateDocStatus, appendAuditLog]);

  const handleSaveNote = useCallback(() => {
    if (!doc) return;
    setDocNote(doc.id, note);
    appendAuditLog(doc.id, 'Updated editor notes', 'You');
  }, [doc, note, setDocNote, appendAuditLog]);

  const attachFiles = useCallback(async (files: File[]) => {
    if (!doc || files.length === 0) return;

    setIsScanning(true);
    const pendingTags: { key: string; value: string }[] = [];

    for (const file of files) {
      const hash = await hashFile(file);
      const existing = findRegistryByHash(state.fileRegistry || {}, hash);

      if (existing) {
        const alreadyLinked = attachments.some(att => att.id === existing.id);
        if (!alreadyLinked) {
          addDocAttachment(doc.id, {
            id: existing.id,
            name: existing.name,
            size: existing.size,
            type: existing.type,
          });
          patchDocAttachment(doc.id, existing.id, {
            hash: existing.hash,
            storagePath: existing.storagePath,
            source: existing.source,
          });
        }
        upsertFileRegistryRecord({
          ...existing,
          linkedDocIds: Array.from(new Set([...(existing.linkedDocIds || []), doc.id])),
        });
        appendAuditLog(doc.id, `Linked existing file ${existing.name}`, 'You');
      } else {
        const fileId = crypto.randomUUID();
        await saveFile(fileId, file);

        let storagePath: string | undefined;
        let source: 'local' | 'cloud' | 'hybrid' = 'local';
        if (isCloudSyncConfigured()) {
          const targetPath = buildCloudStoragePath(doc.id, hash, file.name);
          const upload = await ensureCloudUpload(targetPath, file);
          if (upload.success && upload.storagePath) {
            storagePath = upload.storagePath;
            source = 'hybrid';
          }
        }

        addDocAttachment(doc.id, {
          id: fileId,
          name: file.name,
          size: file.size,
          type: file.type,
        });
        patchDocAttachment(doc.id, fileId, { hash, storagePath, source });

        upsertFileRegistryRecord({
          id: fileId,
          name: file.name,
          size: file.size,
          type: file.type,
          hash,
          storagePath,
          source,
          createdAt: new Date().toISOString(),
          linkedDocIds: [doc.id],
        });
        appendAuditLog(doc.id, `Uploaded ${file.name}`, 'You');
      }

      pendingTags.push({ key: 'File', value: file.name });
      pendingTags.push(...extractSmartTags(file.name, doc.type));
    }

    const mergedTags = mergeSmartTags(smartTags, pendingTags);
    setSmartTags(doc.id, mergedTags);
    appendAuditLog(doc.id, `Smart scanning tagged ${files.length} file(s)`, 'Vault AI');

    if (currentStatus === 'missing') {
      updateDocStatus(doc.id, 'in_review');
      appendAuditLog(doc.id, 'Auto-promoted to In Review', 'Vault AI');
    }

    setIsScanning(false);
  }, [
    addDocAttachment,
    appendAuditLog,
    attachments,
    currentStatus,
    doc,
    patchDocAttachment,
    mergeSmartTags,
    setSmartTags,
    smartTags,
    state.fileRegistry,
    upsertFileRegistryRecord,
    updateDocStatus,
  ]);

  const linkExistingFileToDoc = useCallback((recordId: string) => {
    if (!doc) return;
    const record = state.fileRegistry?.[recordId];
    if (!record) return;
    if (attachments.some(att => att.id === record.id)) return;

    addDocAttachment(doc.id, {
      id: record.id,
      name: record.name,
      size: record.size,
      type: record.type,
    });
    patchDocAttachment(doc.id, record.id, {
      hash: record.hash,
      storagePath: record.storagePath,
      source: record.source,
    });
    upsertFileRegistryRecord({
      ...record,
      linkedDocIds: Array.from(new Set([...(record.linkedDocIds || []), doc.id])),
    });
    appendAuditLog(doc.id, `Linked existing file ${record.name}`, 'You');
  }, [addDocAttachment, appendAuditLog, attachments, doc, patchDocAttachment, state.fileRegistry, upsertFileRegistryRecord]);

  const migrateCurrentDocLocalFilesToCloud = useCallback(async () => {
    if (!doc || !isCloudSyncConfigured()) return;

    setIsScanning(true);
    let migratedCount = 0;
    for (const att of attachments) {
      if (att.storagePath) continue;
      const local = await getFile(att.id);
      if (!local) continue;

      const hash = att.hash || (await hashFile(local));
      const targetPath = buildCloudStoragePath(doc.id, hash, att.name);
      const upload = await ensureCloudUpload(targetPath, local);
      if (!upload.success || !upload.storagePath) continue;

      patchDocAttachment(doc.id, att.id, { hash, storagePath: upload.storagePath, source: 'hybrid' });
      upsertFileRegistryRecord({
        id: att.id,
        name: att.name,
        size: att.size,
        type: att.type,
        hash,
        storagePath: upload.storagePath,
        source: 'hybrid',
        createdAt: att.attachedAt,
        linkedDocIds: [doc.id],
      });
      migratedCount += 1;
    }

    if (migratedCount > 0) {
      appendAuditLog(doc.id, `Migrated ${migratedCount} file(s) to cloud storage`, 'Vault AI');
    }
    setIsScanning(false);
  }, [attachments, doc, patchDocAttachment, upsertFileRegistryRecord, appendAuditLog]);

  const handleRemoveAttachment = useCallback(async (attachmentId: string) => {
    if (!doc) return;
    
    const removedAtt = attachments.find(a => a.id === attachmentId);
    const attachmentUsageCount = Object.values(state.docMeta || {}).reduce((count, docMeta) => {
      const docAttachments = docMeta.attachments || [];
      return count + (docAttachments.some(att => att.id === attachmentId) ? 1 : 0);
    }, 0);
    if (attachmentUsageCount <= 1) {
      await deleteFile(attachmentId);
    }
    removeDocAttachment(doc.id, attachmentId);
    
    if (removedAtt) {
      appendAuditLog(doc.id, `Deleted ${removedAtt.name}`, 'You');
    }
    
    // Revoke URL memory
    if (previewUrls[attachmentId]) {
      URL.revokeObjectURL(previewUrls[attachmentId]);
      const newUrls = { ...previewUrls };
      delete newUrls[attachmentId];
      setPreviewUrls(newUrls);
    }

    if (activePreviewId === attachmentId) {
      setActivePreviewId(attachments.find(a => a.id !== attachmentId)?.id || null);
    }
  }, [doc, attachments, previewUrls, activePreviewId, removeDocAttachment, appendAuditLog, state.docMeta]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files ? Array.from(e.dataTransfer.files) : [];
    if (files.length > 0) void attachFiles(files);
  }, [attachFiles]);

  // Empty state
  if (!doc) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-zinc-500">
        <svg className="w-16 h-16 mb-4 text-zinc-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="text-lg font-medium text-zinc-400">No Document Selected</p>
        <p className="text-sm mt-1">Select an artifact from the list to view and edit details.</p>
      </div>
    );
  }

  const activeAttachment = activePreviewId ? attachments.find(a => a.id === activePreviewId) || null : null;
  const activePreviewUrl = activePreviewId ? previewUrls[activePreviewId] || null : null;
  const linkableRecords = registryRecords.filter(record => !attachments.some(att => att.id === record.id));

  return (
    <div className="flex flex-col h-full bg-zinc-950 overflow-y-auto">
      <DocumentHeader doc={doc} />

      <div className="p-6 space-y-8 flex-1 flex flex-col">
        <DocumentStatusSelector 
          currentStatus={currentStatus} 
          onStatusChange={handleStatusChange} 
        />

        {/* Purpose */}
        {doc.description && (
          <div className="shrink-0">
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Purpose</h3>
            <p className="text-sm text-zinc-300 leading-relaxed bg-zinc-900/30 p-4 rounded-lg">
              {doc.description}
            </p>
          </div>
        )}

        {/* File Attachments Vault */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex items-center justify-between gap-2 mb-3 shrink-0">
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
              Document Vault
            </h3>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowExistingFiles(v => !v)}
                className="text-[10px] px-2 py-1 rounded border border-zinc-700 text-zinc-300 hover:bg-zinc-900 transition-colors"
              >
                {showExistingFiles ? 'Hide Existing' : 'Link Existing'}
              </button>
              {isCloudSyncConfigured() && (
                <button
                  type="button"
                  onClick={() => { void migrateCurrentDocLocalFilesToCloud(); }}
                  className="text-[10px] px-2 py-1 rounded border border-indigo-700/60 text-indigo-300 hover:bg-indigo-500/10 transition-colors"
                >
                  Sync To Cloud
                </button>
              )}
            </div>
          </div>

          {showExistingFiles && (
            <div className="mb-3 p-2.5 rounded-lg border border-zinc-800 bg-zinc-900/40 max-h-40 overflow-y-auto">
              {linkableRecords.length === 0 ? (
                <p className="text-[11px] text-zinc-500">No existing files available to link.</p>
              ) : (
                <div className="space-y-1.5">
                  {linkableRecords.map(record => (
                    <button
                      key={record.id}
                      type="button"
                      onClick={() => linkExistingFileToDoc(record.id)}
                      className="w-full text-left p-2 rounded border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900 transition-colors"
                    >
                      <p className="text-[11px] font-semibold text-zinc-200 line-clamp-1">{record.name}</p>
                      <p className="text-[10px] text-zinc-500 line-clamp-1">
                        {record.linkedDocIds.length} linked doc{record.linkedDocIds.length === 1 ? '' : 's'}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          
          <DocumentAttachments
            attachments={attachments}
            activePreviewId={activePreviewId}
            isDragging={isDragging}
            onSelectAttachment={setActivePreviewId}
            onRemoveAttachment={handleRemoveAttachment}
            onFilesSelect={(files) => { void attachFiles(files); }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          />

          {attachments.length > 0 && (
            <DocumentPreview 
              attachment={activeAttachment} 
              previewUrl={activePreviewUrl} 
            />
          )}
          
          <SmartTagsSection smartTags={smartTags} isScanning={isScanning} />
        </div>

        <DocumentNotes 
          note={note} 
          onNoteChange={setNote} 
          onSave={handleSaveNote} 
        />
      </div>
    </div>
  );
}
