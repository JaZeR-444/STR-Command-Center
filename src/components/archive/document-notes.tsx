import { memo } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/input';

interface DocumentNotesProps {
  note: string;
  onNoteChange: (note: string) => void;
  onSave: () => void;
}

export const DocumentNotes = memo(function DocumentNotes({ 
  note, 
  onNoteChange, 
  onSave 
}: DocumentNotesProps) {
  return (
    <div className="shrink-0 pt-4">
      <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">Editor Notes</h3>
      <Textarea 
        value={note} 
        onChange={(e) => onNoteChange(e.target.value)} 
        placeholder="Add links, feedback, or context about this document..." 
        rows={4} 
        className="w-full bg-zinc-900/50 text-sm border-zinc-800 focus-visible:ring-indigo-500/50" 
      />
      <div className="flex justify-end mt-3">
        <Button onClick={onSave} variant="primary" size="sm" className="bg-indigo-600 hover:bg-indigo-500">
          Save Notes
        </Button>
      </div>
    </div>
  );
});
