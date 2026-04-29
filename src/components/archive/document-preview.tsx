import { memo } from 'react';

interface Attachment {
  id: string;
  name: string;
  type: string;
}

interface DocumentPreviewProps {
  attachment: Attachment | null;
  previewUrl: string | null;
}

export const DocumentPreview = memo(function DocumentPreview({ 
  attachment, 
  previewUrl 
}: DocumentPreviewProps) {
  if (!attachment || !previewUrl) return null;

  // Image preview
  if (attachment.type.startsWith('image/')) {
    return (
      <div className="flex-1 mt-4 rounded-xl overflow-auto border border-zinc-800 bg-zinc-900/50 flex items-center justify-center min-h-[400px]">
        <img src={previewUrl} alt="Document Preview" className="max-w-full h-auto object-contain" />
      </div>
    );
  }
  
  // PDF preview
  if (attachment.type === 'application/pdf') {
    return (
      <div className="flex-1 mt-4 rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900/50 min-h-[600px] flex">
        <iframe 
          src={`${previewUrl}#toolbar=0&view=fitH`} 
          className="w-full h-full border-0 flex-1" 
          title="PDF Preview" 
        />
      </div>
    );
  }
  
  // Generic file fallback
  return (
    <div className="flex-1 mt-4 p-4 rounded-xl border border-zinc-800 bg-zinc-900/50 flex flex-col items-center justify-center text-zinc-500 gap-2 min-h-[200px]">
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <span className="text-sm">Preview not available for this file type.</span>
    </div>
  );
});
