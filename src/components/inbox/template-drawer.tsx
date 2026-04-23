'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { messageTemplates, getTemplatesByCategory, replaceTemplateVariables } from '@/lib/message-templates';
import { cn } from '@/lib/utils';

export function TemplateDrawer({
  onSelectTemplate,
  onClose,
  guestName = 'Guest',
  propertyName = 'Property',
}: {
  onSelectTemplate: (content: string) => void;
  onClose: () => void;
  guestName?: string;
  propertyName?: string;
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categorizedTemplates = getTemplatesByCategory();
  const categories = categorizedTemplates.map(c => c.category);

  const filteredTemplates = messageTemplates.filter(t => {
    const matchesSearch = !searchTerm ||
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || t.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSelectTemplate = (template: typeof messageTemplates[0]) => {
    // Replace common variables
    const variables: Record<string, string> = {
      guestName,
      propertyName,
      checkInDate: 'Check-in Date',
      checkOutDate: 'Check-out Date',
      checkInTime: '3:00 PM',
      checkOutTime: '11:00 AM',
      propertyAddress: 'Property Address',
    };

    const content = replaceTemplateVariables(template.content, variables);
    onSelectTemplate(content);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="glass rounded-2xl border-2 border-zinc-800 w-full max-w-4xl max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="shrink-0 px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-display font-bold text-white">Message Templates</h2>
            <p className="text-sm text-zinc-500 mt-1">Quick replies for common scenarios</p>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-white transition-colors p-2 hover:bg-zinc-800 rounded-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search & Filters */}
        <div className="shrink-0 px-6 py-4 border-b border-zinc-800 space-y-3">
          <Input
            type="text"
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setSelectedCategory(null)}
              className={cn(
                'px-3 py-1 rounded-lg text-xs font-medium transition-all',
                !selectedCategory
                  ? 'bg-blue-500 text-white'
                  : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'
              )}
            >
              All
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  'px-3 py-1 rounded-lg text-xs font-medium transition-all',
                  selectedCategory === cat
                    ? 'bg-blue-500 text-white'
                    : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Template List */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {filteredTemplates.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-zinc-500">No templates found matching "{searchTerm}"</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredTemplates.map(template => (
                <button
                  key={template.id}
                  onClick={() => handleSelectTemplate(template)}
                  className="text-left bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl p-4 transition-all group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors">
                      {template.title}
                    </h3>
                    <span className="text-xs text-zinc-600 shrink-0 ml-2">{template.category}</span>
                  </div>
                  <p className="text-xs text-zinc-500 line-clamp-3 leading-relaxed">
                    {template.content.substring(0, 150)}...
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 px-6 py-4 border-t border-zinc-800 bg-zinc-950/50">
          <p className="text-xs text-zinc-600">
            💡 Tip: Templates will auto-fill guest name and property details when available
          </p>
        </div>
      </div>
    </div>
  );
}
