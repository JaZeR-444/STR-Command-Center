import { memo, useRef } from 'react';
import { cn } from '@/lib/utils';

interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string;
  attachedAt: string;
}

interface DocumentAttachmentsProps {
  attachments: Attachment[];
  activePreviewId: string | null;
  isDragging: boolean;
  onSelectAttachment: (id: string) => void;
  onRemoveAttachment: (id: string) => void;
  onFilesSelect: (files: File[]) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
}

const formatFileSize = (bytes?: number) => {
  if (!bytes) return '';
  const kb = bytes / 1024;
  if (kb < 1024) return `${Math.round(kb)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
};

export const DocumentAttachments = memo(function DocumentAttachments({
  attachments,
  activePreviewId,
  isDragging,
  onSelectAttachment,
  onRemoveAttachment,
  onFilesSelect,
  onDragOver,
  onDragLeave,
  onDrop,
}: DocumentAttachmentsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length > 0) onFilesSelect(files);
    if (e.target) e.target.value = ''; // Reset input
  };

  return (
    <div className="flex flex-wrap gap-3 mb-4 shrink-0">
      {attachments.map((att) => (
        <div 
          key={att.id}
          onClick={() => onSelectAttachment(att.id)}
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
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <p className={cn("text-xs font-semibold truncate", activePreviewId === att.id ? "text-indigo-300" : "text-zinc-300")}>
              {att.name}
            </p>
            <p className="text-[10px] text-zinc-500 mt-0.5">
              {formatFileSize(att.size)} • {new Date(att.attachedAt).toLocaleDateString()}
            </p>
          </div>
          <button 
            onClick={(e) => { e.stopPropagation(); onRemoveAttachment(att.id); }} 
            className="text-zinc-600 hover:text-red-400 p-1.5 hover:bg-red-500/10 rounded-md transition-colors shrink-0" 
            title="Remove file"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
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
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <div className={cn(
          "w-8 h-8 rounded-md flex items-center justify-center shrink-0", 
          isDragging ? "bg-indigo-500/20 text-indigo-400" : "bg-zinc-900 text-zinc-500"
        )}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </div>
        <div>
          <p className={cn("text-xs font-semibold", isDragging ? "text-indigo-300" : "text-zinc-400")}>Add Files</p>
          <p className="text-[10px] text-zinc-600">Drop many or click</p>
        </div>
        <input type="file" multiple ref={fileInputRef} className="hidden" onChange={handleFileChange} />
      </div>
    </div>
  );
});
