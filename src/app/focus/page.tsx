'use client';

import { useMemo, useState, useEffect } from 'react';
import { useApp } from '@/lib/context';
import { 
  getBlockedTasks, 
  getInProgressTasks, 
  getIncompletePreListingTasks,
  isTaskCompleted,
  getTaskStatus,
} from '@/lib/selectors';
import { 
  buildDependencyGraph, 
  topologicalSort, 
  getHighLeverageTasks,
  getAvailableTasks,
  getBlockedByDependencies,
} from '@/lib/dependencies';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import type { Task } from '@/types';
import { TaskModal } from '../roadmap/task-modal';
import { useSwipe } from '@/hooks/use-swipe';

function ActionCard({ 
  task, 
  variant, 
  onClick, 
  onToggle 
}: { 
  task: Task; 
  variant: 'blocked' | 'in-progress' | 'urgent'; 
  onClick: () => void;
  onToggle: () => void;
}) {
  const { state } = useApp();
  const isCompleted = isTaskCompleted(state, task.id);
  const status = getTaskStatus(state, task.id);
  const [swiped, setSwiped] = useState(false);

  // iOS-style simple swipe hook
  const { onTouchStart, onTouchMove, onTouchEnd } = useSwipe({
    threshold: 60,
    onSwipeLeft: () => {
      setSwiped(true);
      setTimeout(() => {
        onToggle();
        setSwiped(false);
      }, 300);
    }
  });

  const variantStyles = {
    blocked: 'border-l-4 border-l-red-500 bg-zinc-900 border-zinc-800 hover:border-red-500/50',
    'in-progress': 'border-l-4 border-l-amber-500 bg-zinc-900 border-zinc-800 hover:border-amber-500/50',
    urgent: 'border-l-4 border-l-blue-500 bg-zinc-900 border-zinc-800 hover:border-blue-500/50',
  };

  return (
    <div
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onClick={onClick}
      style={{ transform: swiped ? 'translateX(-120%)' : 'translateX(0)', transition: 'transform 0.3s ease-in-out' }}
      className={cn(
        'group flex flex-col p-4 border rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer select-none active:scale-[0.98]',
        variantStyles[variant],
        isCompleted && 'opacity-50'
      )}
    >
      <div className="flex gap-3">
        <div className="pt-0.5" onClick={(e) => { e.stopPropagation(); onToggle(); }}>
          <Checkbox checked={isCompleted} onChange={() => {}} />
        </div>
        <div className="flex-1 min-w-0">
          <p className={cn(
            'text-sm font-semibold tracking-wide leading-tight',
            isCompleted ? 'text-zinc-500 line-through' : 'text-zinc-200'
          )}>
            {task.task}
          </p>
          <div className="flex items-center gap-1.5 mt-2.5 flex-wrap">
            <Badge variant="timing" timing={task.timing}>
              {task.timing}
            </Badge>
            {status !== 'default' && (
              <Badge variant="status" status={status}>
                {status.replace('-', ' ')}
              </Badge>
            )}
            <span className="text-[10px] text-zinc-500 font-medium truncate max-w-[120px] ml-auto">
              {task.section.replace(' Master Checklist', '')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FocusPage() {
  const { state, isLoaded, toggleTask } = useApp();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [zenMode, setZenMode] = useState(false);

  useEffect(() => {
    // ESC key closes zen mode
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && zenMode && !selectedTask) {
        setZenMode(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [zenMode, selectedTask]);

  const blockedTasks = useMemo(() => isLoaded ? getBlockedTasks(state) : [], [state, isLoaded]);
  const inProgressTasks = useMemo(() => isLoaded ? getInProgressTasks(state) : [], [state, isLoaded]);
  
  // Build dependency graph
  const dependencyGraph = useMemo(() => {
    if (!isLoaded) return null;
    const allTasks = [
      ...blockedTasks,
      ...inProgressTasks,
      ...getIncompletePreListingTasks(state),
    ];
    return buildDependencyGraph(allTasks, new Set(state.completedIds), state.taskMeta);
  }, [state, isLoaded, blockedTasks, inProgressTasks]);
  
  // Sort tasks by dependencies (topological sort)
  const urgentPreListing = useMemo(() => {
    if (!isLoaded || !dependencyGraph) return [];
    
    const preListing = getIncompletePreListingTasks(state)
      .filter(t => {
        const s = state.taskMeta[t.id]?.status;
        return s !== 'blocked' && s !== 'in-progress';
      });
    
    // Apply topological sort to show dependency-safe order
    const sorted = topologicalSort(preListing, dependencyGraph, new Set(state.completedIds));
    return sorted.slice(0, 15);
  }, [state, isLoaded, dependencyGraph]);
  
  // Get high-leverage tasks (completing them unblocks many others)
  const highLeverageTasks = useMemo(() => {
    if (!isLoaded || !dependencyGraph) return [];
    const taskIds = getHighLeverageTasks(dependencyGraph, new Set(state.completedIds), 3);
    const allTasks = [...blockedTasks, ...inProgressTasks, ...urgentPreListing];
    return taskIds.map(id => allTasks.find(t => t.id === id)).filter(Boolean) as Task[];
  }, [dependencyGraph, isLoaded, state.completedIds, blockedTasks, inProgressTasks, urgentPreListing]);

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-zinc-500 text-sm font-semibold uppercase tracking-widest animate-pulse">Loading Action Center...</div>
      </div>
    );
  }

  const wrapperClasses = zenMode 
    ? "fixed inset-0 z-[100] bg-black overflow-y-auto overflow-x-hidden p-6 lg:p-12 animate-in fade-in duration-300"
    : "h-full w-full p-6 lg:p-8 flex flex-col";

  return (
    <div className={wrapperClasses}>
      
      {/* Action Center Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 shrink-0">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="text-3xl animate-pulse">⚡</span>
            <h1 className={cn("font-black uppercase tracking-tight", zenMode ? "text-5xl text-white" : "text-3xl text-zinc-100")}>
              Action Center
            </h1>
          </div>
          <p className="text-zinc-400 font-medium text-sm">
            {zenMode ? "Deep focus engaged. Press ESC to exit." : "Triage and execute critical path operations."}
          </p>
        </div>

        <button 
          onClick={() => setZenMode(!zenMode)}
          className={cn(
            "flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all",
            zenMode 
              ? "bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white"
              : "bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 shadow-inner"
          )}
        >
          {zenMode ? "Exit Focus" : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" /></svg>
              Enter Focus Mode
            </>
          )}
        </button>
      </header>

      {/* Zen Mode: Single Task View */}
      {zenMode ? (
        <div className="flex-1 flex items-center justify-center">
          {(() => {
            // Get first incomplete task from priority order: blocked → in-progress → urgent
            const allFocusTasks = [
              ...blockedTasks,
              ...inProgressTasks,
              ...urgentPreListing
            ];
            const currentTask = allFocusTasks.find(t => !isTaskCompleted(state, t.id));
            
            if (!currentTask) {
              return (
                <div className="text-center max-w-2xl">
                  <div className="text-8xl mb-8">🎉</div>
                  <h2 className="text-5xl font-display font-black text-white mb-4">
                    All Clear!
                  </h2>
                  <p className="text-xl text-zinc-400 mb-8">
                    No urgent tasks remaining. Take a break or exit Focus Mode.
                  </p>
                  <button
                    onClick={() => setZenMode(false)}
                    className="px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white font-bold text-lg rounded-xl transition-colors duration-200"
                  >
                    Exit Focus Mode
                  </button>
                </div>
              );
            }

            const remainingCount = allFocusTasks.filter(t => !isTaskCompleted(state, t.id)).length;
            const taskStatus = getTaskStatus(state, currentTask.id);
            
            return (
              <div className="w-full max-w-4xl mx-auto">
                {/* Progress indicator */}
                <div className="mb-8 text-center">
                  <p className="text-sm text-zinc-500 uppercase tracking-widest font-bold mb-2">
                    {remainingCount} task{remainingCount !== 1 ? 's' : ''} remaining
                  </p>
                  <div className="h-1 bg-zinc-900 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-500"
                      style={{ 
                        width: `${((allFocusTasks.length - remainingCount) / allFocusTasks.length) * 100}%` 
                      }}
                    />
                  </div>
                </div>

                {/* Main task card */}
                <div className="glass rounded-3xl border-2 border-zinc-800 p-12 shadow-2xl">
                  {/* Task type badge */}
                  <div className="flex items-center gap-3 mb-6">
                    {taskStatus === 'blocked' && (
                      <span className="px-3 py-1 bg-red-500/20 text-red-400 text-xs font-bold uppercase tracking-wider rounded-full border border-red-500/30">
                        🚨 Blocked
                      </span>
                    )}
                    {taskStatus === 'in-progress' && (
                      <span className="px-3 py-1 bg-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider rounded-full border border-amber-500/30">
                        ⚡ In Progress
                      </span>
                    )}
                    {currentTask.timing.toLowerCase().includes('pre') && (
                      <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider rounded-full border border-blue-500/30">
                        🎯 Urgent
                      </span>
                    )}
                  </div>

                  {/* Task title */}
                  <h2 className="text-5xl font-display font-black text-white leading-tight mb-6">
                    {currentTask.task}
                  </h2>

                  {/* Task metadata */}
                  <div className="flex items-center gap-4 mb-8 text-zinc-500">
                    <span className="text-sm font-medium">
                      {currentTask.section.replace(' Master Checklist', '')}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-zinc-700" />
                    <span className="text-sm font-medium">
                      {currentTask.category}
                    </span>
                  </div>

                  {/* Description if exists */}
                  {currentTask.description && (
                    <p className="text-xl text-zinc-400 mb-8 leading-relaxed">
                      {currentTask.description}
                    </p>
                  )}

                  {/* Action buttons */}
                  <div className="flex items-center gap-4 mt-12">
                    <button
                      onClick={() => {
                        toggleTask(currentTask.id);
                        // Auto-advance to next task after brief delay
                        setTimeout(() => {
                          // Component will re-render and show next task
                        }, 300);
                      }}
                      className="flex-1 px-8 py-6 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xl rounded-2xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
                    >
                      ✓ Complete
                    </button>
                    
                    <button
                      onClick={() => setSelectedTask(currentTask)}
                      className="px-8 py-6 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white font-bold text-lg rounded-2xl transition-colors duration-200"
                    >
                      📝 Edit
                    </button>
                    
                    <button
                      onClick={() => setZenMode(false)}
                      className="px-8 py-6 bg-zinc-900 hover:bg-zinc-800 text-zinc-500 hover:text-zinc-400 font-bold text-lg rounded-2xl transition-colors duration-200"
                    >
                      Exit
                    </button>
                  </div>

                  {/* Keyboard hint */}
                  <div className="mt-8 text-center">
                    <p className="text-xs text-zinc-600 uppercase tracking-widest">
                      <span className="px-2 py-1 bg-zinc-900 rounded font-mono">Space</span> Complete · 
                      <span className="px-2 py-1 bg-zinc-900 rounded font-mono ml-2">ESC</span> Exit
                    </p>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      ) : (
        <div className="flex-1 flex overflow-x-auto pb-4 gap-6 snap-x sidebar-scrollbar items-start">
        {/* Kanban Board Layout */}
        
        {/* Column 1: Blocked */}
        <div className="flex flex-col gap-3 min-w-[300px] w-[320px] max-w-[350px] shrink-0 snap-start">
          <div className="flex items-center justify-between sticky top-0 bg-transparent z-10 pb-2">
            <h2 className="text-xs font-black uppercase tracking-widest text-red-500 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse" />
              Blocked
            </h2>
            <span className="text-[10px] font-bold text-red-400/50 bg-red-500/10 px-2 py-0.5 rounded-full">
              {blockedTasks.length}
            </span>
          </div>
          <div className="flex flex-col gap-3">
            {blockedTasks.length === 0 ? (
              <div className="border border-dashed border-zinc-800 rounded-xl p-6 text-center text-zinc-600 text-sm font-semibold">No blocked tasks</div>
            ) : (
              blockedTasks.map(task => (
                <ActionCard 
                  key={task.id} 
                  task={task} 
                  variant="blocked" 
                  onClick={() => setSelectedTask(task)}
                  onToggle={() => toggleTask(task.id)}
                />
              ))
            )}
          </div>
        </div>

        {/* Column 2: In Progress */}
        <div className="flex flex-col gap-3 min-w-[300px] w-[320px] max-w-[350px] shrink-0 snap-start">
          <div className="flex items-center justify-between sticky top-0 bg-transparent z-10 pb-2">
            <h2 className="text-xs font-black uppercase tracking-widest text-amber-500 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              In Progress
            </h2>
            <span className="text-[10px] font-bold text-amber-400/50 bg-amber-500/10 px-2 py-0.5 rounded-full">
              {inProgressTasks.length}
            </span>
          </div>
          <div className="flex flex-col gap-3">
            {inProgressTasks.length === 0 ? (
              <div className="border border-dashed border-zinc-800 rounded-xl p-6 text-center text-zinc-600 text-sm font-semibold">Ready for work</div>
            ) : (
              inProgressTasks.map(task => (
                <ActionCard 
                  key={task.id} 
                  task={task} 
                  variant="in-progress" 
                  onClick={() => setSelectedTask(task)}
                  onToggle={() => toggleTask(task.id)}
                />
              ))
            )}
          </div>
        </div>

        {/* Column 3: Up Next (Critical Path) */}
        <div className="flex flex-col gap-3 min-w-[300px] w-[320px] max-w-[350px] shrink-0 snap-start pr-4">
          <div className="flex items-center justify-between sticky top-0 bg-transparent z-10 pb-2">
            <h2 className="text-xs font-black uppercase tracking-widest text-blue-500 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              Up Next
            </h2>
            <span className="text-[10px] font-bold text-blue-400/50 bg-blue-500/10 px-2 py-0.5 rounded-full">
              {urgentPreListing.length}
            </span>
          </div>
          <div className="flex flex-col gap-3">
             {urgentPreListing.length === 0 ? (
              <div className="border border-dashed border-zinc-800 rounded-xl p-6 text-center text-zinc-600 text-sm font-semibold">Triage complete</div>
            ) : (
              urgentPreListing.map(task => (
                <ActionCard 
                  key={task.id} 
                  task={task} 
                  variant="urgent" 
                  onClick={() => setSelectedTask(task)}
                  onToggle={() => toggleTask(task.id)}
                />
              ))
            )}
          </div>
        </div>

        </div>
      )}

      {/* Task Modal Editor Drawer */}
      {selectedTask && (
        <TaskModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </div>
  );
}
