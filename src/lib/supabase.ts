'use client';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { AppState } from '@/types';
import { importState } from './storage';

type CloudRow = {
  id: string;
  payload: AppState;
  updated_at: string;
};

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SUPABASE_STATE_KEY = process.env.NEXT_PUBLIC_SUPABASE_STATE_KEY || 'family';

let client: SupabaseClient | null = null;

export function isCloudSyncConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}

function getClient(): SupabaseClient | null {
  if (!isCloudSyncConfigured()) return null;
  if (client) return client;
  client = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!);
  return client;
}

export async function loadRemoteState(): Promise<{ state: AppState | null; updatedAt: string | null; error?: string }> {
  const supabase = getClient();
  if (!supabase) {
    return { state: null, updatedAt: null, error: 'Supabase not configured' };
  }

  const { data, error } = await supabase
    .from('app_state')
    .select('id, payload, updated_at')
    .eq('id', SUPABASE_STATE_KEY)
    .maybeSingle<CloudRow>();

  if (error) {
    return { state: null, updatedAt: null, error: error.message };
  }

  if (!data) {
    return { state: null, updatedAt: null };
  }

  const imported = importState(JSON.stringify(data.payload));
  if (!imported.success || !imported.state) {
    return { state: null, updatedAt: null, error: imported.error || 'Invalid remote state payload' };
  }

  return { state: imported.state, updatedAt: data.updated_at || null };
}

export async function saveRemoteState(state: AppState): Promise<{ success: boolean; updatedAt?: string; error?: string }> {
  const supabase = getClient();
  if (!supabase) {
    return { success: false, error: 'Supabase not configured' };
  }

  const payload = {
    id: SUPABASE_STATE_KEY,
    payload: state,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('app_state')
    .upsert(payload, { onConflict: 'id' })
    .select('updated_at')
    .single<{ updated_at: string }>();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, updatedAt: data?.updated_at };
}

export async function clearRemoteState(): Promise<{ success: boolean; error?: string }> {
  const supabase = getClient();
  if (!supabase) {
    return { success: false, error: 'Supabase not configured' };
  }

  const { error } = await supabase
    .from('app_state')
    .delete()
    .eq('id', SUPABASE_STATE_KEY);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}
