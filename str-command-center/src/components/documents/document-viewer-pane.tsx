'use client';

import { useState, useEffect, useCallback } from 'react';
import { useApp } from '@/lib/context';
import { isDocCompleted } from '@/lib/selectors';
import { saveFile, getFile, deleteFile } from '@/lib/file-storage';
import { extractSmartTags } from '@/lib/document-utils';
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
  const { state, updateDocStatus, appendAuditLog, setSmartTags, setDocNote, addDocAttachment, removeDocAttachment } = useApp();
  const [note, setNote] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [previewUrls, setPreviewUrls] = useState<Record<string, string>>({});
  const [activePreviewId, setActivePreviewId] = useState<string | null>(null);

  const meta = doc ? (state.docMeta[doc.id] || {}) : {};
  const attachments = meta.attachments || [];
  
  // Backwards compatibility: If legacy isCompleted but no status, treat as verified
  const isLegacyCompleted = isDocCompleted(state, doc?.id || '');
  const currentStatus: DocumentStatus = meta.status || (isLegacyCompleted ? 'verified' : 'missing');
  const smartTags = meta.smartTags || [];

  // Load notes when doc changes
  useEffect(() => {
    if (doc) {
      setNote(state.docMeta[doc.id]?.note || '');
    }
  }, [doc, state.docMeta]);

  // Load preview URLs from IndexedDB for attachments
  useEffect(() => {
    const urls: Record<string, string> = {};
    let isCancelled = false;

    const loadMissingPreviews = async () => {
      for (const att of attachments) {
        if (!previewUrls[att.id]) {
          const file = await getFile(att.id);
          if (file && !isCancelled) {
            urls[att.id] = URL.createObjectURL(file);
          }
        } else {
          urls[att.id] = previewUrls[att.id];
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
  }, [doc?.id, attachments.length]);

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

  const attachFile = useCallback(async (file: File) => {
    if (!doc) return;
    
    const fileId = crypto.randomUUID();
    await saveFile(fileId, file);
    addDocAttachment(doc.id, {
      id: fileId,
      name: file.name,
      size: file.size,
      type: file.type,
    });
    
    appendAuditLog(doc.id, `Uploaded ${file.name}`, 'You');
    
    // Simulate AI Scanner
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      const newTags = extractSmartTags(file.name, doc.type);
      setSmartTags(doc.id, newTags);
      appendAuditLog(doc.id, 'Smart scanning extracted metadata', 'Vault AI');
      
      // Auto upgrade status if missing
      if (currentStatus === 'missing') {
        updateDocStatus(doc.id, 'in_review');
        appendAuditLog(doc.id, 'Auto-promoted to In Review', 'Vault AI');
      }
    }, 1500);
  }, [doc, currentStatus, addDocAttachment, appendAuditLog, setSmartTags, updateDocStatus]);

  const handleRemoveAttachment = useCallback(async (attachmentId: string) => {
    if (!doc) return;
    
    const removedAtt = attachments.find(a => a.id === attachmentId);
    await deleteFile(attachmentId);
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
  }, [doc, attachments, previewUrls, activePreviewId, removeDocAttachment, appendAuditLog]);

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
    const file = e.dataTransfer.files?.[0];
    if (file) attachFile(file);
  }, [attachFile]);

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
          <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3 shrink-0">
            Document Vault
          </h3>
          
          <DocumentAttachments
            attachments={attachments}
            activePreviewId={activePreviewId}
            isDragging={isDragging}
            onSelectAttachment={setActivePreviewId}
            onRemoveAttachment={handleRemoveAttachment}
            onFileSelect={attachFile}
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
