import { createClient } from '@supabase/supabase-js';
import { RoastResult } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

export async function saveResult(
  result: Omit<RoastResult, 'id' | 'created_at'>
): Promise<string> {
  const { data, error } = await supabase
    .from('results')
    .insert(result)
    .select('id')
    .single();

  if (error) throw error;
  return data.id;
}

export async function getResult(id: string): Promise<RoastResult | null> {
  const { data, error } = await supabase
    .from('results')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;
  return data as RoastResult;
}
