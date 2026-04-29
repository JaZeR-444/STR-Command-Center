// One-time migration: archive legacy launch-tracker data to separate localStorage key
// Removes taskMeta, docMeta, and completedIds from active state blob

const STORAGE_PREFIX = 'str_cc_';
const ARCHIVE_KEY = 'str_cc_legacy_archive';

interface LegacyArchive {
  roadmapTasks: Record<number, unknown>;
  documents: Record<string, unknown>;
  completedIds: number[];
  archivedAt: string;
}

export function archiveLegacyLaunchData(): void {
  if (typeof window === 'undefined') return;

  try {
    // Idempotency guard: if archive already exists, return immediately
    const existingArchive = localStorage.getItem(ARCHIVE_KEY);
    if (existingArchive) {
      return;
    }

    // Read legacy keys from active state
    const taskMetaRaw = localStorage.getItem(`${STORAGE_PREFIX}taskMeta`);
    const docMetaRaw = localStorage.getItem(`${STORAGE_PREFIX}docMeta`);
    const completedIdsRaw = localStorage.getItem(`${STORAGE_PREFIX}completedIds`);

    const taskMeta = taskMetaRaw ? JSON.parse(taskMetaRaw) : null;
    const docMeta = docMetaRaw ? JSON.parse(docMetaRaw) : null;
    const completedIds = completedIdsRaw ? JSON.parse(completedIdsRaw) : null;

    // If none of the legacy keys are present, no-op
    if (!taskMeta && !docMeta && !completedIds) {
      return;
    }

    // Create archive snapshot
    const archive: LegacyArchive = {
      roadmapTasks: taskMeta || {},
      documents: docMeta || {},
      completedIds: Array.isArray(completedIds) ? completedIds : [],
      archivedAt: new Date().toISOString(),
    };

    // Write archive to separate key
    localStorage.setItem(ARCHIVE_KEY, JSON.stringify(archive));

    // Remove legacy keys from active state
    if (taskMeta) {
      localStorage.removeItem(`${STORAGE_PREFIX}taskMeta`);
    }
    if (docMeta) {
      localStorage.removeItem(`${STORAGE_PREFIX}docMeta`);
    }
    if (completedIds) {
      localStorage.removeItem(`${STORAGE_PREFIX}completedIds`);
    }
  } catch (error) {
    console.error('Failed to archive legacy data:', error);
    // Do not throw - migration failure should not break app boot
  }
}
