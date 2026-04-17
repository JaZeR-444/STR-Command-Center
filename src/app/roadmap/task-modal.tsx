'use client';

import { useState } from 'react';
import { useApp } from '@/lib/context';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/input';
import { isTaskCompleted, getTaskStatus } from '@/lib/selectors';
import { cn } from '@/lib/utils';
import type { Task, TaskStatus } from '@/types';

interface TaskModalProps {
  task: Task;
  onClose: () => void;
}

const statusOptions: { value: TaskStatus; label: string }[] = [
  { value: 'default', label: 'Default' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'blocked', label: 'Blocked' },
  { value: 'na', label: 'N/A' },
];

export function TaskModal({ task, onClose }: TaskModalProps) {
  const { state, toggleTask, setTaskStatus, setTaskNote, togglePin } = useApp();
  
  const isCompleted = isTaskCompleted(state, task.id);
  const currentStatus = getTaskStatus(state, task.id);
  const currentNote = state.taskMeta[task.id]?.note || '';
  const isPinned = state.pinnedIds.includes(task.id);
  const completedAt = state.taskMeta[task.id]?.completedAt;

  const [note, setNote] = useState(currentNote);

  const handleSaveNote = () => {
    setTaskNote(task.id, note);
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Task Details" size="lg">
      {/* Task Info */}
      <div className="mb-6">
        <div className="flex items-start gap-4 mb-4">
          <Checkbox
            checked={isCompleted}
            onChange={() => toggleTask(task.id)}
            className="mt-1"
          />
          <div className="flex-1">
            <h3 className={cn(
              'text-lg font-medium',
              isCompleted ? 'text-slate-500 line-through' : 'text-white'
            )}>
              {task.task}
            </h3>
            {task.description && (
              <p className="text-sm text-slate-400 mt-2">{task.description}</p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant="timing" timing={task.timing}>{task.timing}</Badge>
          <span className="text-xs text-slate-500">{task.section.replace(' Master Checklist', '')}</span>
          <span className="text-xs text-slate-500">•</span>
          <span className="text-xs text-slate-500">{task.category}</span>
        </div>

        {completedAt && (
          <p className="text-xs text-slate-500">
            Completed: {new Date(completedAt).toLocaleDateString()}
          </p>
        )}
      </div>

      {/* Status */}
      <div className="mb-6">
        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">
          Status
        </label>
        <div className="flex flex-wrap gap-2">
          {statusOptions.map(option => (
            <Button
              key={option.value}
              variant={currentStatus === option.value ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setTaskStatus(task.id, option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div className="mb-6">
        <Textarea
          label="Notes"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Add context, links, or reminders..."
          rows={3}
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-border-dark">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => togglePin(task.id)}
          className={isPinned ? 'text-indigo-400' : ''}
        >
          {isPinned ? '📌 Pinned' : '📌 Pin Task'}
        </Button>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              handleSaveNote();
              onClose();
            }}
          >
            Save
          </Button>
        </div>
      </div>
    </Modal>
  );
}
