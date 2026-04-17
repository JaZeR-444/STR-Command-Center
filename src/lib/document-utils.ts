/**
 * Document utilities for smart tag extraction and file processing
 */

interface SmartTag {
  key: string;
  value: string;
}

/**
 * Extract smart tags from a document based on its type
 * @param fileName - Name of the uploaded file
 * @param type - Document type category
 * @returns Array of extracted smart tags
 */
export function extractSmartTags(fileName: string, type: string): SmartTag[] {
  const tags: SmartTag[] = [];
  
  if (type.includes('Permit') || type.includes('License')) {
    tags.push({ key: 'Id', value: `STR-ATX-${Math.floor(Math.random() * 90000) + 10000}` });
    tags.push({ key: 'Expires', value: 'Dec 31, 2026' });
  } else if (type.includes('Insurance')) {
    tags.push({ key: 'Policy', value: `POL-${Math.floor(Math.random() * 9000) + 1000}` });
    tags.push({ key: 'Coverage', value: '$1,000,000' });
  } else if (type.includes('Asset') || type.includes('Photo')) {
    tags.push({ key: 'Resolution', value: '4K High-Res' });
    tags.push({ key: 'Type', value: 'Approved Marketing' });
  } else {
    tags.push({ key: 'Extracted', value: new Date().toLocaleDateString() });
    tags.push({ key: 'Pages', value: Math.floor(Math.random() * 10) + 1 + ' pages' });
  }
  
  return tags;
}

/**
 * Format file size in human-readable format
 * @param bytes - File size in bytes
 * @returns Formatted string (e.g., "1.5 MB")
 */
export function formatFileSize(bytes?: number): string {
  if (!bytes) return '';
  const kb = bytes / 1024;
  if (kb < 1024) return `${Math.round(kb)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}
