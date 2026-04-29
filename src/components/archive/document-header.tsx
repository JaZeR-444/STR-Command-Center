import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { DocumentArtifact } from '@/types';

interface DocumentHeaderProps {
  doc: DocumentArtifact;
}

export function DocumentHeader({ doc }: DocumentHeaderProps) {
  return (
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
            <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            Share
          </Button>
          <Button variant="ghost" size="sm" className="hidden sm:flex h-8 px-2 text-xs text-zinc-400 hover:text-white border border-zinc-800 bg-zinc-900/50">
            <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export
          </Button>
        </div>
      </div>
    </div>
  );
}
