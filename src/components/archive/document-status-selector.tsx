import { memo } from 'react';
import { cn } from '@/lib/utils';
import type { DocumentStatus } from '@/types';

interface DocumentStatusSelectorProps {
  currentStatus: DocumentStatus;
  onStatusChange: (status: DocumentStatus) => void;
}

const statusConfig: Record<DocumentStatus, { label: string; bg: string; text: string; icon: string }> = {
  missing: { label: 'Missing', bg: 'bg-zinc-800', text: 'text-zinc-400', icon: '🟡' },
  in_review: { label: 'In Review', bg: 'bg-amber-500/10', text: 'text-amber-400', icon: '🟠' },
  verified: { label: 'Verified', bg: 'bg-emerald-500/10', text: 'text-emerald-400', icon: '🟢' },
  expired: { label: 'Expired', bg: 'bg-red-500/10', text: 'text-red-400', icon: '🔴' },
};

export const DocumentStatusSelector = memo(function DocumentStatusSelector({ 
  currentStatus, 
  onStatusChange 
}: DocumentStatusSelectorProps) {
  return (
    <div className="shrink-0 space-y-3">
      <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Lifecycle Status</h3>
      <div className="flex bg-zinc-900/60 p-1 rounded-xl border border-zinc-800/80 max-w-[400px]">
        {(Object.keys(statusConfig) as DocumentStatus[]).map((status) => {
          const isActive = currentStatus === status;
          const config = statusConfig[status];
          return (
            <button
              key={status}
              onClick={() => onStatusChange(status)}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 text-[11px] font-semibold rounded-lg transition-all",
                isActive 
                  ? cn(config.bg, config.text, "shadow-sm border border-black/10") 
                  : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50"
              )}
            >
              <span className="text-[10px]">{config.icon}</span>
              {config.label}
            </button>
          );
        })}
      </div>
    </div>
  );
});
