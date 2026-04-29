'use client';

import { useState, useRef } from 'react';
import { useApp } from '@/lib/context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';

export default function SettingsPage() {
  const {
    state,
    isLoaded,
    exportData,
    importData,
    resetAll,
    setTheme,
    cloudSyncStatus,
    cloudSyncMessage,
  } = useApp();
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);
  const [showArchive, setShowArchive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `str-command-center-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const result = importData(content);
      if (result.success) {
        setImportSuccess(true);
        setImportError(null);
        setTimeout(() => setImportSuccess(false), 3000);
      } else {
        setImportError(result.error || 'Import failed');
        setImportSuccess(false);
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const handleReset = () => {
    resetAll();
    setShowResetConfirm(false);
  };

  const handleExportArchive = () => {
    const archiveData = localStorage.getItem('str_cc_legacy_archive');
    if (!archiveData) return;

    const blob = new Blob([archiveData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `str-cc-legacy-archive-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const hasLegacyArchive = typeof window !== 'undefined' && localStorage.getItem('str_cc_legacy_archive') !== null;

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-zinc-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 lg:p-10">
      {/* Header */}
      <header className="mb-8 glass shimmer-border rounded-[2rem] p-6 lg:p-8">
        <p className="section-eyebrow mb-2">Control Room</p>
        <h1 className="text-4xl lg:text-5xl font-display font-semibold text-white mb-3">Settings</h1>
        <p className="text-zinc-400 max-w-2xl">Manage system preferences, data backups, and property integrations.</p>
      </header>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          {/* Appearance */}
          <Card className="mb-0">
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-zinc-400 mb-4">
                Switch between dark and light application themes.
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant={state.preferences.theme === 'dark' ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setTheme('dark')}
                >
                  Dark
                </Button>
                <Button
                  variant={state.preferences.theme === 'light' ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setTheme('light')}
                >
                  Light
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Data Management */}
          <Card className="mb-0">
            <CardHeader>
              <CardTitle>Data Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-zinc-400">
                Export a full backup of your operational data, or restore from a previous snapshot.
              </p>

              {importError && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-sm text-red-300">
                  {importError}
                </div>
              )}

              {importSuccess && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-sm text-emerald-300">
                  Data imported successfully
                </div>
              )}

              <div className="flex flex-wrap gap-3">
                <Button onClick={handleExport} variant="secondary">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export Backup
                </Button>

                <Button onClick={handleImportClick} variant="secondary">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Import Backup
                </Button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                />
              </div>
            </CardContent>
          </Card>

          {/* Reference / Archive */}
          {hasLegacyArchive && (
            <Card className="mb-0">
              <CardHeader className="cursor-pointer" onClick={() => setShowArchive(!showArchive)}>
                <div className="flex items-center justify-between">
                  <CardTitle>Reference / Archive</CardTitle>
                  <svg
                    className={`w-5 h-5 text-zinc-400 transition-transform ${showArchive ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </CardHeader>
              {showArchive && (
                <CardContent>
                  <p className="text-sm text-zinc-400 mb-4">
                    Legacy launch-tracker data from the original app version is preserved here for recovery.
                  </p>
                  <Button onClick={handleExportArchive} variant="secondary">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                    </svg>
                    Export Legacy Archive
                  </Button>
                </CardContent>
              )}
            </Card>
          )}

          {/* Danger Zone */}
          <Card className="border-red-500/20">
            <CardHeader>
              <CardTitle className="text-red-300">Danger Zone</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-zinc-400 mb-4">
                Reset all operational data. This clears reservations, issues, and settings and cannot be undone.
              </p>
              <Button variant="danger" onClick={() => setShowResetConfirm(true)}>
                Reset All Data
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Cloud Sync */}
          <Card className="mb-0">
            <CardHeader>
              <CardTitle>Cloud Sync</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-zinc-400">
                Optional Supabase sync keeps operational data available across devices while local backup remains intact.
              </p>
              <div className="premium-pill rounded-[1.4rem] p-4">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      cloudSyncStatus === 'online'
                        ? 'bg-emerald-400'
                        : cloudSyncStatus === 'connecting'
                          ? 'bg-amber-300 animate-pulse'
                          : cloudSyncStatus === 'error'
                            ? 'bg-red-400'
                            : 'bg-zinc-500'
                    }`}
                  />
                  <p className="text-sm text-zinc-100 capitalize">
                    {cloudSyncStatus === 'disabled' ? 'disabled' : cloudSyncStatus}
                  </p>
                </div>
                {cloudSyncMessage && (
                  <p className="text-xs text-zinc-500 mt-2">{cloudSyncMessage}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      <Modal
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        title="Reset All Data?"
        size="sm"
      >
        <div className="text-center">
          <p className="text-4xl mb-4">⚠️</p>
          <p className="text-zinc-300 mb-6">
            This will permanently delete all your operational data, including reservations,
            issues, and settings. This action cannot be undone.
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="secondary" onClick={() => setShowResetConfirm(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleReset}>
              Yes, Reset Everything
            </Button>
          </div>
        </div>
      </Modal>

      {/* Footer Info */}
      <div className="mt-12 text-center text-xs text-zinc-600">
        <p>STR Command Center v2.0</p>
        <p className="mt-1">
          {cloudSyncStatus === 'online'
            ? 'Cloud sync active with local backup'
            : 'Data stored locally in your browser'}
        </p>
      </div>
    </div>
  );
}
