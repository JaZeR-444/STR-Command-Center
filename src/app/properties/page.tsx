'use client';

import { useState, useMemo } from 'react';
import { useApp } from '@/lib/context';
import { properties } from '@/data/properties';
import { cn } from '@/lib/utils';
import type { Property } from '@/types';

type SettingsTab = 'overview' | 'access' | 'instructions' | 'rules' | 'contacts';

export default function PropertiesPage() {
  const { state } = useApp();
  const [selectedProperty] = useState<Property>(properties[0]);
  const [activeTab, setActiveTab] = useState<SettingsTab>('overview');

  // Get property settings from state
  const propertySettings = useMemo(() => {
    return state.propertySettings[selectedProperty.id] || {};
  }, [state.propertySettings, selectedProperty.id]);

  // Calculate property stats
  const propertyStats = useMemo(() => {
    const reservations = state.reservations.filter(r => r.propertyId === selectedProperty.id);
    const totalRevenue = reservations.reduce((sum, r) => sum + r.total, 0);
    const avgNightly = reservations.length > 0
      ? reservations.reduce((sum, r) => sum + r.nightlyRate, 0) / reservations.length
      : 0;
    const upcomingReservations = reservations.filter(r => {
      const checkIn = new Date(r.checkIn);
      return checkIn > new Date() && r.status !== 'cancelled';
    }).length;

    return { totalRevenue, avgNightly, upcomingReservations, totalBookings: reservations.length };
  }, [state.reservations, selectedProperty.id]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <header className="mb-6">
        <h1 className="text-3xl font-display font-bold text-white flex items-center gap-3">
          <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
          </svg>
          Property Settings
        </h1>
        <p className="text-zinc-400 text-sm mt-2">Configure property details and operations</p>
      </header>

      {/* Property Header */}
      <div className="glass rounded-xl border-2 border-zinc-800 p-6 mb-6">
        <div className="flex items-center gap-4">
          <div
            className="w-16 h-16 rounded-lg flex items-center justify-center text-2xl font-bold text-white"
            style={{ background: selectedProperty.color }}
          >
            {selectedProperty.beds}BR
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-white">{selectedProperty.name}</h2>
            <p className="text-sm text-zinc-400">{selectedProperty.address}</p>
            <div className="flex items-center gap-4 mt-2 text-xs">
              <span className={cn(
                'px-2 py-1 rounded text-xs font-medium',
                selectedProperty.status === 'live' && 'bg-emerald-500/20 text-emerald-400',
                selectedProperty.status === 'draft' && 'bg-amber-500/20 text-amber-400',
                selectedProperty.status === 'paused' && 'bg-zinc-500/20 text-zinc-400'
              )}>
                {selectedProperty.status.toUpperCase()}
              </span>
              <span className="text-zinc-500">
                {selectedProperty.beds} bed • {selectedProperty.baths} bath • Sleeps {selectedProperty.sleeps}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="glass rounded-xl border-2 border-zinc-800 p-4">
          <p className="text-xs text-zinc-500 mb-1">Total Revenue</p>
          <p className="text-2xl font-bold text-emerald-400">
            ${propertyStats.totalRevenue.toLocaleString()}
          </p>
        </div>
        <div className="glass rounded-xl border-2 border-zinc-800 p-4">
          <p className="text-xs text-zinc-500 mb-1">Avg Nightly</p>
          <p className="text-2xl font-bold text-blue-400">
            ${propertyStats.avgNightly.toFixed(0)}
          </p>
        </div>
        <div className="glass rounded-xl border-2 border-zinc-800 p-4">
          <p className="text-xs text-zinc-500 mb-1">Total Bookings</p>
          <p className="text-2xl font-bold text-white">{propertyStats.totalBookings}</p>
        </div>
        <div className="glass rounded-xl border-2 border-zinc-800 p-4">
          <p className="text-xs text-zinc-500 mb-1">Upcoming</p>
          <p className="text-2xl font-bold text-purple-400">{propertyStats.upcomingReservations}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'access', label: 'Access Codes' },
          { id: 'instructions', label: 'Instructions' },
          { id: 'rules', label: 'House Rules' },
          { id: 'contacts', label: 'Contacts' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as SettingsTab)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap',
              activeTab === tab.id
                ? 'bg-blue-500 text-white'
                : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="glass rounded-xl border-2 border-zinc-800 p-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">Property Name</label>
                  <div className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-4 py-2 text-sm text-zinc-300">
                    {selectedProperty.name}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">Neighborhood</label>
                  <div className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-4 py-2 text-sm text-zinc-300">
                    {selectedProperty.neighborhood}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">Check-In Time</label>
                  <div className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-4 py-2 text-sm text-zinc-300">
                    {selectedProperty.checkInTime || '15:00'}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">Check-Out Time</label>
                  <div className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-4 py-2 text-sm text-zinc-300">
                    {selectedProperty.checkOutTime || '11:00'}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Description</h3>
              <div className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-4 py-3 text-sm text-zinc-300">
                {selectedProperty.description || 'No description provided'}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Amenities</h3>
              <div className="flex flex-wrap gap-2">
                {selectedProperty.amenities?.map((amenity, index) => (
                  <span
                    key={index}
                    className="px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-lg text-sm text-blue-400"
                  >
                    {amenity}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Active Channels</h3>
              <div className="flex gap-3">
                {selectedProperty.channels.map(channel => (
                  <div
                    key={channel}
                    className={cn(
                      'px-4 py-2 rounded-lg text-sm font-medium border-2',
                      channel === 'airbnb' && 'bg-[#FF5A5F]/10 border-[#FF5A5F]/30 text-[#FF5A5F]',
                      channel === 'booking' && 'bg-[#003580]/10 border-[#003580]/30 text-[#003580]',
                      channel === 'vrbo' && 'bg-[#0071C2]/10 border-[#0071C2]/30 text-[#0071C2]',
                      channel === 'direct' && 'bg-purple-500/10 border-purple-500/30 text-purple-400'
                    )}
                  >
                    {channel.charAt(0).toUpperCase() + channel.slice(1)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Access Codes Tab */}
        {activeTab === 'access' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white mb-4">Access Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: 'WiFi Network', value: propertySettings.wifiNetwork },
                { label: 'WiFi Password', value: propertySettings.wifiPassword, type: 'password' },
                { label: 'Door Code', value: propertySettings.doorCode },
                { label: 'Gate Code', value: propertySettings.gateCode },
              ].map((field, index) => (
                <div key={index}>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">{field.label}</label>
                  <div className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-4 py-2 text-sm text-zinc-300">
                    {field.value || <span className="text-zinc-600">Not configured</span>}
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-4 flex items-start gap-3">
              <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <p className="text-sm text-zinc-300">
                Access codes are shared with guests in automated messages. Update these codes regularly for security.
              </p>
            </div>
          </div>
        )}

        {/* Instructions Tab */}
        {activeTab === 'instructions' && (
          <div className="space-y-6">
            {[
              { label: 'Check-In Instructions', value: propertySettings.checkInInstructions },
              { label: 'Check-Out Instructions', value: propertySettings.checkOutInstructions },
              { label: 'Parking Instructions', value: propertySettings.parkingInstructions },
            ].map((field, index) => (
              <div key={index}>
                <label className="block text-sm font-medium text-zinc-400 mb-2">{field.label}</label>
                <div className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-4 py-3 text-sm text-zinc-300 whitespace-pre-wrap min-h-[120px]">
                  {field.value || <span className="text-zinc-600">No instructions provided</span>}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* House Rules Tab */}
        {activeTab === 'rules' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white mb-4">House Rules</h3>
            <div className="space-y-3">
              {propertySettings.houseRules && propertySettings.houseRules.length > 0 ? (
                propertySettings.houseRules.map((rule, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-zinc-900/50 border border-zinc-800 rounded-lg">
                    <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
                    </svg>
                    <span className="text-sm text-zinc-300">{rule}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-zinc-500">No house rules configured yet</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              {[
                { label: 'Smoking Allowed', value: propertySettings.smokingAllowed },
                { label: 'Pets Allowed', value: propertySettings.petsAllowed },
                { label: 'Events Allowed', value: propertySettings.eventsAllowed },
              ].map((field, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
                  <span className="text-sm text-zinc-300">{field.label}</span>
                  <span className={cn(
                    'px-3 py-1 rounded text-xs font-medium',
                    field.value
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-red-500/20 text-red-400'
                  )}>
                    {field.value ? 'Yes' : 'No'}
                  </span>
                </div>
              ))}
              <div className="flex items-center justify-between p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
                <span className="text-sm text-zinc-300">Max Guests</span>
                <span className="text-sm font-semibold text-white">
                  {propertySettings.maxGuests || selectedProperty.sleeps}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Contacts Tab */}
        {activeTab === 'contacts' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Emergency Contacts</h3>
              {propertySettings.emergencyContacts && propertySettings.emergencyContacts.length > 0 ? (
                <div className="space-y-3">
                  {propertySettings.emergencyContacts.map((contact, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 bg-red-500/5 border border-red-500/20 rounded-lg">
                      <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                        <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-white">{contact.name}</p>
                        <p className="text-xs text-zinc-500">{contact.role}</p>
                      </div>
                      <a href={`tel:${contact.phone}`} className="text-sm font-mono text-blue-400">
                        {contact.phone}
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-zinc-500">No emergency contacts configured</p>
              )}
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Vendor Contacts</h3>
              {propertySettings.vendorContacts && propertySettings.vendorContacts.length > 0 ? (
                <div className="space-y-3">
                  {propertySettings.vendorContacts.map((vendor, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-white">{vendor.name}</p>
                        <p className="text-xs text-zinc-500">{vendor.type}</p>
                        {vendor.notes && (
                          <p className="text-xs text-zinc-600 mt-1">{vendor.notes}</p>
                        )}
                      </div>
                      <a href={`tel:${vendor.phone}`} className="text-sm font-mono text-blue-400">
                        {vendor.phone}
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-zinc-500">No vendor contacts configured</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
