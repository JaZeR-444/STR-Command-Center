'use client';

import { useState, useEffect, useRef } from 'react';
import { useApp } from '@/lib/context';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/input';
import { isDocCompleted } from '@/lib/selectors';
import { cn } from '@/lib/utils';
import type { DocumentArtifact } from '@/types';

interface DocumentEditDrawerProps {
  doc: DocumentArtifact | null;
  onClose: () => void;
}

export function DocumentEditDrawer({ doc, onClose }: DocumentEditDrawerProps) {
  const { state, toggleDoc, setDocNote, setDocAttachment } = useApp();
  const [note, setNote] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (doc) {
      setNote(state.docMeta[doc.id]?.note || '');
    }
  }, [doc, state.docMeta]);

  if (!doc) return null;

  const isCompleted = isDocCompleted(state, doc.id);
  const meta = state.docMeta[doc.id] || {};
  const hasAttachment = !!meta.attachedFileName;

  const handleSaveNote = () => {
    setDocNote(doc.id, note);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, upload to storage here.
      // For this local toolkit, we save the file metadata to state.
      setDocAttachment(doc.id, file.name, file.size);
    }
  };

  const handleRemoveAttachment = () => {
    setDocAttachment(doc.id, undefined, undefined);
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const kb = bytes / 1024;
    if (kb < 1024) return `${Math.round(kb)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed top-0 right-0 h-full w-full max-w-2xl bg-zinc-950 border-l border-zinc-800 z-50 overflow-y-auto animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="sticky top-0 bg-zinc-950/95 backdrop-blur-sm border-b border-zinc-800 p-6 z-10 flex flex-col gap-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-white mb-2 leading-snug">
                {doc.artifact}
              </h2>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="timing" timing={doc.timing}>
                  {doc.timing}
                </Badge>
                <span className="text-xs text-zinc-600">•</span>
                <span className="text-xs text-zinc-500">{doc.type}</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-zinc-500 hover:text-zinc-300 transition-colors p-2 hover:bg-zinc-800 rounded-lg shrink-0 mt-1"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          
          {/* Completion Status */}
          <div className="flex items-center gap-4 p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl relative overflow-hidden">
             {isCompleted && (
              <div className="absolute top-0 right-0 bottom-0 w-1.5 bg-emerald-500" />
            )}
            <Checkbox
              checked={isCompleted}
              onChange={() => toggleDoc(doc.id)}
            />
            <div>
              <p className="text-sm font-semibold text-white mb-0.5">
                {isCompleted ? 'Document Ready' : 'Mark as Ready'}
              </p>
              <p className="text-xs text-zinc-500">
                {isCompleted 
                  ? 'This document is finalized and ready for launch.' 
                  : 'Click when the final version is complete.'}
              </p>
            </div>
          </div>

          {/* Description */}
          {doc.description && (
            <div>
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">
                Purpose
              </h3>
              <p className="text-sm text-zinc-300 leading-relaxed bg-zinc-900/30 p-4 rounded-lg">
                {doc.description}
              </p>
            </div>
          )}

          {/* File Attachment */}
          <div>
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">
              Attached File
            </h3>
            
            {hasAttachment ? (
              <div className="flex items-center justify-between p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-xl">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="min-w-0 pr-4">
                    <p className="text-sm font-semibold text-indigo-300 truncate">
                      {meta.attachedFileName}
                    </p>
                    <p className="text-xs text-indigo-400/60 mt-0.5">
                      {formatFileSize(meta.attachedFileSize)} • Attached {new Date(meta.attachedAt!).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleRemoveAttachment}
                  className="text-indigo-400/50 hover:text-red-400 p-2 hover:bg-red-500/10 rounded-md transition-colors shrink-0"
                  title="Remove file"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ) : (
              <div 
                className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-zinc-800 rounded-xl hover:border-zinc-700 hover:bg-zinc-900/50 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="w-12 h-12 rounded-full bg-zinc-900 flex items-center justify-center mb-3">
                  <svg className="w-6 h-6 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-zinc-300 mb-1">Click to attach file</p>
                <p className="text-xs text-zinc-500">Link the completed artifact here</p>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  className="hidden" 
                  onChange={handleFileChange}
                />
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">
              Document Notes
            </h3>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add links, feedback, or context about this document..."
              rows={5}
              className="w-full bg-zinc-900 text-sm"
            />
            <div className="flex justify-end mt-3">
              <Button
                onClick={handleSaveNote}
                variant="primary"
                size="sm"
              >
                Save Notes
              </Button>
            </div>
          </div>

          {/* Metadata */}
          <div className="pt-8 border-t border-zinc-800/60">
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-4">
              Artifact Source Details
            </h3>
            <div className="bg-zinc-900/30 p-4 rounded-xl space-y-3 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-zinc-800/50">
                <span className="text-zinc-500">Section</span>
                <span className="text-zinc-300 font-medium">{doc.section}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-zinc-800/50">
                <span className="text-zinc-500">Type</span>
                <span className="text-zinc-300 font-medium">{doc.type}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-zinc-800/50">
                <span className="text-zinc-500">Timing</span>
                <span className="text-zinc-300 font-medium">{doc.timing}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-zinc-500">Document ID</span>
                <span className="text-zinc-500 font-mono text-[10px]">{doc.id}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
