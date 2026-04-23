'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { InboxThread, Message } from '@/types';

const channelIcons = {
  airbnb: '🏠',
  booking: '🅱️',
  vrbo: '🏖️',
  direct: '📧',
  sms: '💬',
  email: '✉️',
};

export function MessageThread({
  thread,
  onSendMessage,
  onOpenTemplates,
}: {
  thread: InboxThread;
  onSendMessage: (text: string) => void;
  onOpenTemplates: () => void;
}) {
  const [replyText, setReplyText] = useState('');

  const handleSend = () => {
    if (!replyText.trim()) return;
    onSendMessage(replyText);
    setReplyText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Thread Header */}
      <div className="shrink-0 px-6 py-4 border-b border-zinc-800 bg-zinc-950/50">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xl">{channelIcons[thread.source]}</span>
          <span className="text-xs text-zinc-500 uppercase tracking-wider">{thread.source}</span>
          {thread.urgent && (
            <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs font-bold rounded-full border border-red-500/30">
              URGENT
            </span>
          )}
          {thread.resolved && (
            <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-full border border-emerald-500/30">
              RESOLVED
            </span>
          )}
        </div>
        {thread.subject && (
          <h3 className="text-lg font-semibold text-white">{thread.subject}</h3>
        )}
        <p className="text-sm text-zinc-500 mt-1">
          {thread.messages.length} message{thread.messages.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {thread.messages.map((message) => {
          const isFromGuest = message.sender === 'guest';
          const timestamp = new Date(message.timestamp);

          return (
            <div
              key={message.id}
              className={cn(
                'flex',
                isFromGuest ? 'justify-start' : 'justify-end'
              )}
            >
              <div
                className={cn(
                  'max-w-[75%] rounded-2xl px-4 py-3',
                  isFromGuest
                    ? 'bg-zinc-900 border border-zinc-800'
                    : 'bg-blue-500/20 border border-blue-500/30'
                )}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className={cn(
                    'text-xs font-semibold',
                    isFromGuest ? 'text-zinc-400' : 'text-blue-400'
                  )}>
                    {isFromGuest ? 'Guest' : 'You'}
                  </span>
                  <span className="text-xs text-zinc-600">
                    {timestamp.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-sm text-zinc-200 whitespace-pre-wrap leading-relaxed">
                  {message.text}
                </p>
                {message.attachments && message.attachments.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {message.attachments.map(att => (
                      <div key={att.id} className="flex items-center gap-2 text-xs text-zinc-500">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                        {att.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Reply Box */}
      <div className="shrink-0 border-t border-zinc-800 bg-zinc-950/50 px-6 py-4">
        <div className="flex gap-2 mb-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenTemplates}
            className="text-xs"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
            </svg>
            Templates
          </Button>
        </div>
        <div className="flex gap-2">
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message... (Cmd+Enter to send)"
            rows={3}
            className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
          <Button
            variant="primary"
            onClick={handleSend}
            disabled={!replyText.trim()}
            className="self-end"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </Button>
        </div>
        <p className="text-xs text-zinc-600 mt-2">
          Note: This is manual message entry for Phase 1. Copy from platform and paste here.
        </p>
      </div>
    </div>
  );
}
