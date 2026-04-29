import { memo } from 'react';
import { cn } from '@/lib/utils';

interface SmartTag {
  key: string;
  value: string;
}

interface SmartTagsSectionProps {
  smartTags: SmartTag[];
  isScanning: boolean;
}

export const SmartTagsSection = memo(function SmartTagsSection({ 
  smartTags, 
  isScanning 
}: SmartTagsSectionProps) {
  if (smartTags.length === 0 && !isScanning) return null;

  return (
    <div className="mt-4 p-4 bg-indigo-500/5 border border-indigo-500/20 rounded-xl flex items-start gap-4">
      <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0 mt-0.5">
        <svg 
          className={cn("w-4 h-4 text-indigo-400", isScanning && "animate-spin")} 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
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
  );
});
