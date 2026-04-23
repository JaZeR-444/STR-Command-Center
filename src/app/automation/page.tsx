'use client';

import { useState, useMemo } from 'react';
import { useApp } from '@/lib/context';
import { cn } from '@/lib/utils';
import type { AutomationRule, TriggerType, ActionType } from '@/types';

const triggerLabels: Record<TriggerType, string> = {
  reservation_created: 'New Reservation',
  reservation_checkin: 'Guest Check-In',
  reservation_checkout: 'Guest Check-Out',
  event_upcoming: 'Event Approaching',
  occupancy_threshold: 'Occupancy Threshold',
  price_competitor: 'Competitor Pricing',
  issue_urgent: 'Urgent Issue',
  message_received: 'Message Received',
  task_overdue: 'Task Overdue',
  review_received: 'Review Received',
};

const actionLabels: Record<ActionType, { label: string; icon: string }> = {
  adjust_price: { label: 'Adjust Price', icon: '💰' },
  create_task: { label: 'Create Task', icon: '📋' },
  send_notification: { label: 'Send Notification', icon: '🔔' },
  send_message: { label: 'Send Message', icon: '💬' },
  block_calendar: { label: 'Block Calendar', icon: '🚫' },
  update_min_stay: { label: 'Update Min Stay', icon: '📅' },
  create_issue: { label: 'Create Issue', icon: '⚠️' },
};

export default function AutomationPage() {
  const { state } = useApp();
  const [viewMode, setViewMode] = useState<'all' | 'enabled' | 'disabled'>('all');
  const [selectedRule, setSelectedRule] = useState<AutomationRule | null>(null);

  // Filter rules
  const filteredRules = useMemo(() => {
    let rules = state.automationRules;
    if (viewMode === 'enabled') {
      rules = rules.filter(r => r.enabled);
    } else if (viewMode === 'disabled') {
      rules = rules.filter(r => !r.enabled);
    }
    return rules;
  }, [state.automationRules, viewMode]);

  // Stats
  const stats = useMemo(() => {
    const total = state.automationRules.length;
    const enabled = state.automationRules.filter(r => r.enabled).length;
    const totalTriggers = state.automationRules.reduce((sum, r) => sum + r.triggerCount, 0);
    const recentLogs = state.automationLogs.filter(l => {
      const logDate = new Date(l.triggeredAt);
      const dayAgo = new Date();
      dayAgo.setDate(dayAgo.getDate() - 1);
      return logDate >= dayAgo;
    }).length;

    return { total, enabled, totalTriggers, recentLogs };
  }, [state.automationRules, state.automationLogs]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <header className="mb-6">
        <h1 className="text-3xl font-display font-bold text-white flex items-center gap-3">
          <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/>
          </svg>
          Automation & Triggers
        </h1>
        <p className="text-zinc-400 text-sm mt-2">Smart automation rules and workflows</p>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="glass rounded-xl border-2 border-zinc-800 p-4">
          <p className="text-xs text-zinc-500 mb-1">Total Rules</p>
          <p className="text-2xl font-bold text-white">{stats.total}</p>
        </div>
        <div className="glass rounded-xl border-2 border-zinc-800 p-4">
          <p className="text-xs text-zinc-500 mb-1">Active Rules</p>
          <p className="text-2xl font-bold text-emerald-400">{stats.enabled}</p>
        </div>
        <div className="glass rounded-xl border-2 border-zinc-800 p-4">
          <p className="text-xs text-zinc-500 mb-1">Total Triggers</p>
          <p className="text-2xl font-bold text-blue-400">{stats.totalTriggers}</p>
        </div>
        <div className="glass rounded-xl border-2 border-zinc-800 p-4">
          <p className="text-xs text-zinc-500 mb-1">Last 24 Hours</p>
          <p className="text-2xl font-bold text-purple-400">{stats.recentLogs}</p>
        </div>
      </div>

      {/* View Mode Filter */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setViewMode('all')}
          className={cn(
            'px-4 py-2 rounded-lg text-sm font-medium transition-all',
            viewMode === 'all'
              ? 'bg-blue-500 text-white'
              : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'
          )}
        >
          All ({state.automationRules.length})
        </button>
        <button
          onClick={() => setViewMode('enabled')}
          className={cn(
            'px-4 py-2 rounded-lg text-sm font-medium transition-all',
            viewMode === 'enabled'
              ? 'bg-blue-500 text-white'
              : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'
          )}
        >
          Enabled ({stats.enabled})
        </button>
        <button
          onClick={() => setViewMode('disabled')}
          className={cn(
            'px-4 py-2 rounded-lg text-sm font-medium transition-all',
            viewMode === 'disabled'
              ? 'bg-blue-500 text-white'
              : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'
          )}
        >
          Disabled ({state.automationRules.length - stats.enabled})
        </button>
      </div>

      {/* Rules List */}
      <div className="space-y-4">
        {filteredRules.map(rule => (
          <div
            key={rule.id}
            className={cn(
              'glass rounded-xl border-2 p-6 transition-all',
              rule.enabled ? 'border-zinc-800' : 'border-zinc-800/50 opacity-60'
            )}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-white">{rule.name}</h3>
                  <span className={cn(
                    'px-2 py-1 rounded text-xs font-medium',
                    rule.enabled
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-zinc-500/20 text-zinc-400'
                  )}>
                    {rule.enabled ? 'ENABLED' : 'DISABLED'}
                  </span>
                </div>
                {rule.description && (
                  <p className="text-sm text-zinc-400">{rule.description}</p>
                )}
              </div>
              <button
                onClick={() => setSelectedRule(selectedRule?.id === rule.id ? null : rule)}
                className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-lg text-sm font-medium transition-all"
              >
                {selectedRule?.id === rule.id ? 'Hide Details' : 'View Details'}
              </button>
            </div>

            {/* Trigger & Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
              {/* Trigger */}
              <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-4">
                <p className="text-xs text-blue-400 font-medium mb-2">TRIGGER</p>
                <p className="text-sm text-white font-semibold">{triggerLabels[rule.trigger]}</p>
                {rule.conditions && rule.conditions.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <p className="text-[10px] text-zinc-500">Conditions:</p>
                    {rule.conditions.map((cond, index) => (
                      <p key={index} className="text-xs text-zinc-400">
                        {cond.field} {cond.operator} {String(cond.value)}
                      </p>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-4">
                <p className="text-xs text-emerald-400 font-medium mb-2">ACTIONS ({rule.actions.length})</p>
                <div className="space-y-1">
                  {rule.actions.map((action, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span>{actionLabels[action.type].icon}</span>
                      <p className="text-sm text-white">{actionLabels[action.type].label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-6 text-xs text-zinc-500">
              <span>Triggered: {rule.triggerCount} times</span>
              {rule.lastTriggered && (
                <span>
                  Last: {new Date(rule.lastTriggered).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              )}
              {rule.maxTriggersPerDay && (
                <span>Max: {rule.maxTriggersPerDay}/day</span>
              )}
              {rule.cooldownMinutes && (
                <span>Cooldown: {rule.cooldownMinutes}min</span>
              )}
            </div>

            {/* Expanded Details */}
            {selectedRule?.id === rule.id && (
              <div className="mt-4 pt-4 border-t border-zinc-800">
                <h4 className="text-sm font-semibold text-white mb-3">Action Parameters</h4>
                <div className="space-y-3">
                  {rule.actions.map((action, index) => (
                    <div key={index} className="bg-zinc-900/50 rounded-lg p-3">
                      <p className="text-xs text-zinc-400 mb-2 font-medium">
                        {actionLabels[action.type].label}
                      </p>
                      <pre className="text-xs text-zinc-500 overflow-x-auto">
                        {JSON.stringify(action.params, null, 2)}
                      </pre>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}

        {filteredRules.length === 0 && (
          <div className="glass rounded-2xl border-2 border-zinc-800 p-12 text-center">
            <div className="w-20 h-20 rounded-full bg-zinc-900 flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-zinc-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
            </div>
            <h2 className="text-2xl font-display font-bold text-white mb-2">No Rules Found</h2>
            <p className="text-zinc-400">
              {viewMode === 'enabled' && 'No enabled automation rules'}
              {viewMode === 'disabled' && 'No disabled automation rules'}
              {viewMode === 'all' && 'No automation rules configured'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
