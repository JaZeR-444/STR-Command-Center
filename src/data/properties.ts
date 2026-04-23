import type { Property } from '@/types';

/**
 * YOUR ACTUAL PROPERTY - 7513 Ballydawn Drive
 * Springfield (Vista Point), Austin TX 78744
 */
export const properties: Property[] = [
  {
    id: '1',
    name: 'Ballydawn Drive',
    address: '7513 Ballydawn Dr, Austin, TX 78744',
    neighborhood: 'Springfield (Vista Point)',
    zipCode: '78744',
    beds: 3,
    baths: 2,
    sleeps: 6,
    sqft: 1678,
    status: 'draft', // Pre-launch status - change to 'live' when ready
    channels: ['airbnb', 'vrbo', 'direct'],
    rating: undefined,
    reviewCount: 0,
    color: 'var(--p1)',
    colorLight: 'var(--p1-lt)',
    colorDark: 'var(--p1-dark)',
    description: '2017 modern home with extended covered patio, perfect for Austin visitors near airport, Tesla, and COTA. ENERGY STAR certified with premium finishes.',
    amenities: ['WiFi', 'AC', 'Parking (2-car garage)', 'Full Kitchen', 'Washer/Dryer', 'Covered Patio', 'Privacy Fence', 'Walk-in Pantry', 'Smart Home'],
    checkInTime: '15:00',
    checkOutTime: '11:00',
  },
];

// Helper to get property by ID
export function getPropertyById(id: string): Property | undefined {
  return properties.find(p => p.id === id);
}

// Helper to get property by name
export function getPropertyByName(name: string): Property | undefined {
  return properties.find(p => p.name.toLowerCase() === name.toLowerCase());
}

// Property lookup map
export const propertyMap = new Map(properties.map(p => [p.id, p]));
