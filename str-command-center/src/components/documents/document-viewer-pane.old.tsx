'use client';

import { useState, useEffect, useRef } from 'react';
import { useApp } from '@/lib/context';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/input';
import { isDocCompleted } from '@/lib/selectors';
import { saveFile, getFile, deleteFile } from '@/lib/file-storage';
import { cn } from '@/lib/utils';
import type { DocumentArtifact, DocumentStatus } from '@/types';

interface DocumentViewerPaneProps {
  doc: DocumentArtifact | null;
}

const statusConfig: Record<DocumentStatus, { label: string; bg: string; text: string; icon: string }> = {
  missing: { label: 'Missing', bg: 'bg-zinc-800', text: 'text-zinc-400', icon: '🟡' },
  in_review: { label: 'In Review', bg: 'bg-amber-500/10', text: 'text-amber-400', icon: '🟠' },
  verified: { label: 'Verified', bg: 'bg-emerald-500/10', text: 'text-emerald-400', icon: '🟢' },
  expired: { label: 'Expired', bg: 'bg-red-500/10', text: 'text-red-400', icon: '🔴' },
};

// Mock simulated data extraction
const extractSmartTags = (fileName: string, type: string) => {
  const tags = [];
  if (type.includes('Permit') || type.includes('License')) {
    tags.push({ key: 'Id', value: `STR-ATX-${Math.floor(Math.random() * 90000) + 10000}` });
    tags.push({ key: 'Expires', value: 'Dec 31, 2026' });
  } else if (type.includes('Insurance')) {
    tags.push({ key: 'Policy', value: `POL-${Math.floor(Math.random() * 9000) + 1000}` });
    tags.push({ key: 'Coverage', value: '$1,000,000' });
  } else if (type.includes('Asset') || type.includes('Photo')) {
    tags.push({ key: 'Resolution', value: '4K High-Res' });
    tags.push({ key: 'Type', value: 'Approved Marketing' });
  } else {
    tags.push({ key: 'Extracted', value: new Date().toLocaleDateString() });
    tags.push({ key: 'Pages', value: Math.floor(Math.random() * 10) + 1 + ' pages' });
  }
  return tags;
};

export function DocumentViewerPane({ doc }: DocumentViewerPaneProps) {
  const { state, updateDocStatus, appendAuditLog, setSmartTags, setDocNote, addDocAttachment, removeDocAttachment } = useApp();
  const [note, setNote] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [previewUrls, setPreviewUrls] = useState<Record<string, string>>({});
  const [activePreviewId, setActivePreviewId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const meta = doc ? (state.docMeta[doc.id] || {}) : {};
  const attachments = meta.attachments || [];
  
  // Backwards compatibility: If legacy isCompleted but no status, treat as verified
  const isLegacyCompleted = isDocCompleted(state, doc?.id || '');
  const currentStatus: DocumentStatus = meta.status || (isLegacyCompleted ? 'verified' : 'missing');
  const smartTags = meta.smartTags || [];
  const auditLog = meta.auditLog || [];

  // Load notes
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
      // Find attachments that don't have a URL yet
      for (const att of attachments) {
        if (!previewUrls[att.id]) {
          const file = await getFile(att.id);
          if (file && !isCancelled) {
            urls[att.id] = URL.createObjectURL(file);
          }
        } else {
          urls[att.id] = previewUrls[att.id]; // Keep existing
        }
      }

      if (!isCancelled) {
        setPreviewUrls(urls);
        // Automatically select the first attachment for preview if none selected
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
      // Note: we can't easily revoke URLs here without causing flicker if they re-render
      // In a robust implementation we'd manage a URL pool.
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doc?.id, attachments.length]); // Only re-run if doc changes or attachment count changes

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

  const handleStatusChange = (status: DocumentStatus) => {
    if (currentStatus === status) return;
    updateDocStatus(doc.id, status);
    appendAuditLog(doc.id, `Status updated to ${statusConfig[status].label}`, 'You');
  };

  const handleSaveNote = () => {
    setDocNote(doc.id, note);
    appendAuditLog(doc.id, 'Updated editor notes', 'You');
  };

  const attachFile = async (file: File) => {
    if (!doc) return;
    const fileId = crypto.randomUUID(); // Unique ID for each file
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
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) attachFile(file);
    if (e.target) e.target.value = ''; // Reset input
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) attachFile(file);
  };

  const handleRemoveAttachment = async (attachmentId: string) => {
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
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const kb = bytes / 1024;
    if (kb < 1024) return `${Math.round(kb)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  const renderActivePreview = () => {
    if (!activePreviewId || !previewUrls[activePreviewId]) return null;
    const activeAtt = attachments.find(a => a.id === activePreviewId);
    if (!activeAtt) return null;

    const url = previewUrls[activePreviewId];
    
    // Check if image
    if (activeAtt.type.startsWith('image/')) {
      return (
        <div className="flex-1 mt-4 rounded-xl overflow-auto border border-zinc-800 bg-zinc-900/50 flex items-center justify-center min-h-[400px]">
          <img src={url} alt="Document Preview" className="max-w-full h-auto object-contain" />
        </div>
      );
    }
    
    // Check if PDF
    if (activeAtt.type === 'application/pdf') {
      return (
        <div className="flex-1 mt-4 rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900/50 min-h-[600px] flex">
          <iframe src={`${url}#toolbar=0&view=fitH`} className="w-full h-full border-0 flex-1" title="PDF Preview" />
        </div>
      );
    }
    
    // Generic file fallback
    return (
      <div className="flex-1 mt-4 p-4 rounded-xl border border-zinc-800 bg-zinc-900/50 flex flex-col items-center justify-center text-zinc-500 gap-2 min-h-[200px]">
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
        <span className="text-sm">Preview not available for this file type.</span>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950 overflow-y-auto">
      {/* Header & Ribbon */}
      <div className="sticky top-0 bg-zinc-950/95 backdrop-blur-sm border-b border-zinc-800 p-6 z-10 shrink-0">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h2 className="text-2xl font-semibold text-white mb-2 leading-snug">{doc.artifact}</h2>
            <div className="flex items-center gap-3 flex-wrap">
              <Badge variant="timing" timing={doc.timing}>{doc.timing}</Badge>
              <span className="text-xs text-zinc-600">•</span>
              <span className="text-xs text-zinc-400 font-medium">{doc.type}</span>
            </div>
          </div>
          {/* Action Ribbon */}
          <div className="flex items-center gap-2 shrink-0">
             <Button variant="ghost" size="sm" className="hidden sm:flex h-8 px-2 text-xs text-zinc-400 hover:text-white border border-zinc-800 bg-zinc-900/50">
               <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
               Share
             </Button>
             <Button variant="ghost" size="sm" className="hidden sm:flex h-8 px-2 text-xs text-zinc-400 hover:text-white border border-zinc-800 bg-zinc-900/50">
               <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
               Export
             </Button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-8 flex-1 flex flex-col">
        {/* Compliance Segmented Control */}
        <div className="shrink-0 space-y-3">
          <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Lifecycle Status</h3>
          <div className="flex bg-zinc-900/60 p-1 rounded-xl border border-zinc-800/80 max-w-[400px]">
            {(Object.keys(statusConfig) as DocumentStatus[]).map((status) => {
              const isActive = currentStatus === status;
              const config = statusConfig[status];
              return (
                <button
                  key={status}
                  onClick={() => handleStatusChange(status)}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 text-[11px] font-semibold rounded-lg transition-all",
                    isActive ? cn(config.bg, config.text, "shadow-sm border border-black/10") : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50"
                  )}
                >
                  <span className="text-[10px]">{config.icon}</span>
                  {config.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Purpose */}
        {doc.description && (
          <div className="shrink-0">
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Purpose</h3>
            <p className="text-sm text-zinc-300 leading-relaxed bg-zinc-900/30 p-4 rounded-lg">{doc.description}</p>
          </div>
        )}

        {/* File Attachments Vault */}
        <div className="flex-1 flex flex-col min-h-0">
          <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3 shrink-0">Document Vault</h3>
          
          <div className="flex flex-wrap gap-3 mb-4 shrink-0">
            {attachments.map((att) => (
              <div 
                key={att.id}
                onClick={() => setActivePreviewId(att.id)}
                className={cn(
                  "flex items-center gap-3 p-2.5 rounded-lg border-2 transition-all cursor-pointer w-full sm:w-[320px]",
                  activePreviewId === att.id 
                    ? "bg-indigo-500/10 border-indigo-500/50 shadow-[0_0_0_1px_rgba(99,102,241,0.2)]" 
                    : "bg-zinc-900/40 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-md flex items-center justify-center shrink-0",
                  activePreviewId === att.id ? "bg-indigo-500/20 text-indigo-400" : "bg-zinc-800 text-zinc-400"
                )}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                </div>
                <div className="min-w-0 flex-1">
                  <p className={cn("text-xs font-semibold truncate", activePreviewId === att.id ? "text-indigo-300" : "text-zinc-300")}>{att.name}</p>
                  <p className="text-[10px] text-zinc-500 mt-0.5">
                    {formatFileSize(att.size)} • {new Date(att.attachedAt).toLocaleDateString()}
                  </p>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleRemoveAttachment(att.id); }} 
                  className="text-zinc-600 hover:text-red-400 p-1.5 hover:bg-red-500/10 rounded-md transition-colors shrink-0" 
                  title="Remove file"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            ))}

            {/* Add New File Dropzone */}
            <div 
              className={cn(
                "flex items-center gap-3 p-2.5 rounded-lg border-2 border-dashed transition-all cursor-pointer w-full sm:w-[200px]",
                isDragging 
                  ? "border-indigo-500 bg-indigo-500/10 scale-[1.02]" 
                  : "border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/50"
              )}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className={cn("w-8 h-8 rounded-md flex items-center justify-center shrink-0", isDragging ? "bg-indigo-500/20 text-indigo-400" : "bg-zinc-900 text-zinc-500")}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              </div>
              <div>
                <p className={cn("text-xs font-semibold", isDragging ? "text-indigo-300" : "text-zinc-400")}>Add File</p>
                <p className="text-[10px] text-zinc-600">Drop or click</p>
              </div>
              <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
            </div>
          </div>

          {/* Persistent Large Viewer */}
          {attachments.length > 0 && renderActivePreview()}
          
          {/* Smart Tags Array (Scanning Mock) */}
          {(smartTags.length > 0 || isScanning) && (
            <div className="mt-4 p-4 bg-indigo-500/5 border border-indigo-500/20 rounded-xl flex items-start gap-4">
               <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0 mt-0.5">
                  <svg className={cn("w-4 h-4 text-indigo-400", isScanning && "animate-spin")} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
               </div>
               <div className="flex-1">
                 <p className="text-xs font-bold text-indigo-400 mb-2 uppercase tracking-wider">
                   {isScanning ? 'Scanning Document...' : 'Extracted Metadata'}
                 </p>
                 <div className="flex flex-wrap gap-2">
                    {isScanning ? (
                      <div className="w-24 h-5 bg-indigo-500/20 animate-pulse rounded" />
                    ) : (
                      smartTags.map((tag, idx) => (
                        <div key={idx} className="flex items-center bg-indigo-500/10 border border-indigo-500/30 rounded px-2 py-1 text-[11px]">
                          <span className="font-semibold text-indigo-300 mr-1.5">{tag.key}:</span>
                          <span className="text-zinc-300">{tag.value}</span>
                        </div>
                      ))
                    )}
                 </div>
               </div>
            </div>
          )}
        </div>

        {/* Notes */}
        <div className="shrink-0 pt-4">
          <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">Editor Notes</h3>
          <Textarea 
            value={note} 
            onChange={(e) => setNote(e.target.value)} 
            placeholder="Add links, feedback, or context about this document..." 
            rows={4} 
            className="w-full bg-zinc-900/50 text-sm border-zinc-800 focus-visible:ring-indigo-500/50" 
          />
          <div className="flex justify-end mt-3">
            <Button onClick={handleSaveNote} variant="primary" size="sm" className="bg-indigo-600 hover:bg-indigo-500">Save Notes</Button>
          </div>
        </div>

        {/* Audit Log Timeline */}
        {auditLog.length > 0 && (
          <div className="shrink-0 pt-4 border-t border-zinc-800/60">
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-4 flex items-center gap-2">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Audit Log
            </h3>
            <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-zinc-800 before:to-transparent">
              {auditLog.slice(0, 5).map((log, i) => (
                <div key={log.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-4 h-4 rounded-full border border-zinc-800 bg-zinc-950 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow" />
                  <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-1.5rem)] p-3 rounded border border-zinc-800 bg-zinc-900/30">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-zinc-300 text-xs">{log.actor}</span>
                      <time className="text-[9px] font-medium text-zinc-500">{new Date(log.timestamp).toLocaleString()}</time>
                    </div>
                    <div className="text-zinc-400 text-[11px]">{log.action}</div>
                  </div>
                </div>
              ))}
              {auditLog.length > 5 && (
                <p className="text-center text-[10px] text-zinc-600 font-semibold pt-2">
                  + {auditLog.length - 5} older events hidden
                </p>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
