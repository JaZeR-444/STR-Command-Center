'use client';

import { useState, useMemo } from 'react';
import { useApp } from '@/lib/context';
import { properties } from '@/data/properties';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MessageThread } from '@/components/inbox/message-thread';
import { TemplateDrawer } from '@/components/inbox/template-drawer';
import { GuestContextSidebar } from '@/components/inbox/guest-context-sidebar';
import { cn } from '@/lib/utils';
import type { InboxThread } from '@/types';

const channelIcons = {
  airbnb: '🏠',
  booking: '🅱️',
  vrbo: '🏖️',
  direct: '📧',
  sms: '💬',
  email: '✉️',
};

function ThreadListItem({
  thread,
  isActive,
  onClick,
  state,
}: {
  thread: InboxThread;
  isActive: boolean;
  onClick: () => void;
  state: ReturnType<typeof useApp>['state'];
}) {
  const guest = state.guests[thread.guestId];
  const property = thread.propertyId ? properties.find(p => p.id === thread.propertyId) : null;
  const lastMessage = thread.messages[thread.messages.length - 1];
  const lastMessageTime = lastMessage ? new Date(lastMessage.timestamp) : null;

  const timeAgo = (date: Date) => {
    const diff = Date.now() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left px-4 py-3 border-b border-zinc-800 hover:bg-zinc-900/50 transition-colors relative',
        isActive && 'bg-zinc-900',
        thread.unread > 0 && 'bg-blue-500/5'
      )}
    >
      {/* Unread indicator */}
      {thread.unread > 0 && (
        <div className="absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full" />
      )}

      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-base">{channelIcons[thread.source]}</span>
            <h3 className={cn(
              'text-sm truncate',
              thread.unread > 0 ? 'font-bold text-white' : 'font-medium text-zinc-300'
            )}>
              {guest ? `${guest.firstName} ${guest.lastName}` : 'Guest'}
            </h3>
            {thread.urgent && (
              <span className="shrink-0 w-1.5 h-1.5 bg-red-500 rounded-full" />
            )}
          </div>

          {property && (
            <p className="text-xs text-zinc-600 mb-1">{property.name}</p>
          )}

          <p className={cn(
            'text-xs truncate',
            thread.unread > 0 ? 'text-zinc-300' : 'text-zinc-500'
          )}>
            {lastMessage?.text || 'No messages'}
          </p>
        </div>

        <div className="flex flex-col items-end gap-1 shrink-0">
          {lastMessageTime && (
            <span className="text-xs text-zinc-600">{timeAgo(lastMessageTime)}</span>
          )}
          {thread.unread > 0 && (
            <span className="min-w-[20px] h-[20px] px-1.5 flex items-center justify-center bg-blue-500 text-white text-xs font-bold rounded-full">
              {thread.unread}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

export default function InboxPage() {
  const { state } = useApp();
  const { inboxThreads } = state;
  const [selectedThread, setSelectedThread] = useState<InboxThread | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'unread' | 'urgent'>('all');

  // Filter threads
  const filteredThreads = useMemo(() => {
    let filtered = inboxThreads;

    // Filter by status
    if (filterStatus === 'unread') {
      filtered = filtered.filter(t => t.unread > 0);
    } else if (filterStatus === 'urgent') {
      filtered = filtered.filter(t => t.urgent);
    }

    // Filter by search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(t => {
        const guest = state.guests[t.guestId];
        const guestName = guest ? `${guest.firstName} ${guest.lastName}`.toLowerCase() : '';
        const property = properties.find(p => p.id === t.propertyId);
        const propertyName = property?.name.toLowerCase() || '';
        const messageText = t.messages.map(m => m.text.toLowerCase()).join(' ');
        return guestName.includes(term) || propertyName.includes(term) || messageText.includes(term);
      });
    }

    // Sort by last message (most recent first)
    return filtered.sort((a, b) => {
      const aLast = a.messages[a.messages.length - 1];
      const bLast = b.messages[b.messages.length - 1];
      if (!aLast || !bLast) return 0;
      return new Date(bLast.timestamp).getTime() - new Date(aLast.timestamp).getTime();
    });
  }, [inboxThreads, filterStatus, searchTerm, state.guests]);

  const handleSendMessage = (text: string) => {
    // TODO: Implement message sending via context
    console.log('Sending message:', text);
    alert('Message sending not yet implemented - Phase 1 uses manual message entry');
  };

  const handleTemplateSelect = (content: string) => {
    // TODO: Insert template into reply box
    console.log('Template selected:', content);
  };

  const unreadCount = inboxThreads.filter(t => t.unread > 0).length;
  const urgentCount = inboxThreads.filter(t => t.urgent).length;

  return (
    <div className="flex h-screen w-full bg-zinc-950 overflow-hidden pt-14 lg:pt-0 pb-[80px] lg:pb-0">
      {/* Thread List */}
      <div className="w-full lg:w-[380px] flex-shrink-0 flex flex-col border-r border-zinc-800 bg-zinc-950">
        {/* Header */}
        <div className="shrink-0 px-4 py-4 border-b border-zinc-800 lg:pt-8">
          <h1 className="text-2xl font-display font-bold text-white flex items-center gap-3 mb-4">
            <svg className="w-7 h-7 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            Inbox
          </h1>

          {/* Filters */}
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => setFilterStatus('all')}
              className={cn(
                'flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all',
                filterStatus === 'all'
                  ? 'bg-blue-500 text-white'
                  : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'
              )}
            >
              All
            </button>
            <button
              onClick={() => setFilterStatus('unread')}
              className={cn(
                'flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all',
                filterStatus === 'unread'
                  ? 'bg-blue-500 text-white'
                  : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'
              )}
            >
              Unread ({unreadCount})
            </button>
            <button
              onClick={() => setFilterStatus('urgent')}
              className={cn(
                'flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all',
                filterStatus === 'urgent'
                  ? 'bg-red-500 text-white'
                  : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'
              )}
            >
              Urgent ({urgentCount})
            </button>
          </div>

          {/* Search */}
          <Input
            type="text"
            placeholder="Search messages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="text-sm"
          />
        </div>

        {/* Thread List */}
        <div className="flex-1 overflow-y-auto">
          {filteredThreads.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-zinc-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
              </div>
              <h3 className="text-base font-semibold text-white mb-1">No Messages</h3>
              <p className="text-sm text-zinc-500">
                {searchTerm
                  ? `No threads match "${searchTerm}"`
                  : filterStatus === 'unread'
                  ? 'All caught up!'
                  : 'No messages yet'}
              </p>
            </div>
          ) : (
            filteredThreads.map(thread => (
              <ThreadListItem
                key={thread.id}
                thread={thread}
                isActive={selectedThread?.id === thread.id}
                onClick={() => setSelectedThread(thread)}
                state={state}
              />
            ))
          )}
        </div>
      </div>

      {/* Message Thread View */}
      <div className="hidden lg:flex flex-1 flex-col bg-zinc-950/40 relative h-full min-w-0">
        {selectedThread ? (
          <MessageThread
            thread={selectedThread}
            onSendMessage={handleSendMessage}
            onOpenTemplates={() => setShowTemplates(true)}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-zinc-500 select-none">
            <div className="w-20 h-20 rounded-full bg-zinc-900 flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-zinc-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <p className="text-lg font-medium text-zinc-400">Select a conversation</p>
            <p className="text-sm mt-1">Choose a thread from the list to view messages</p>
          </div>
        )}
      </div>

      {/* Guest Context Sidebar */}
      {selectedThread && (
        <div className="hidden xl:block w-[320px] flex-shrink-0 border-l border-zinc-800 bg-zinc-950 overflow-y-auto">
          <GuestContextSidebar thread={selectedThread} state={state} />
        </div>
      )}

      {/* Template Drawer */}
      {showTemplates && selectedThread && (
        <TemplateDrawer
          onSelectTemplate={handleTemplateSelect}
          onClose={() => setShowTemplates(false)}
          guestName={state.guests[selectedThread.guestId]?.firstName}
          propertyName={properties.find(p => p.id === selectedThread.propertyId)?.name}
        />
      )}
    </div>
  );
}
