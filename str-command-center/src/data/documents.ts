import type { DocumentArtifact } from '@/types';
import rawData from './documents-raw.json';

// Type assertion
export const documentationData: DocumentArtifact[] = rawData as DocumentArtifact[];

// Derived structures
export const documentById = new Map(documentationData.map(d => [d.id, d]));

export const documentsBySection = documentationData.reduce((acc, doc) => {
  if (!acc[doc.section]) acc[doc.section] = [];
  acc[doc.section].push(doc);
  return acc;
}, {} as Record<string, DocumentArtifact[]>);

export const documentSections = [...new Set(documentationData.map(d => d.section))].sort((a, b) => {
  const numA = parseInt(a.match(/^\d+/)?.[0] || '99');
  const numB = parseInt(b.match(/^\d+/)?.[0] || '99');
  return numA - numB;
});

export const documentTypes = [...new Set(documentationData.map(d => d.type))].sort();

// Helper to get short section name
export function getDocShortSectionName(section: string): string {
  return section.replace(/^\d+\s*/, '');
}
