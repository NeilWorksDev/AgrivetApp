import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('payment_methods')
    .select('id, name');

  if (error) {
    console.error('Error fetching payment methods:', error);
    return NextResponse.json({ error: 'Failed to fetch payment methods' }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const supabase = createClient();
  const body = await request.json();
  const { name } = body;

  if (!name) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('payment_methods')
    .insert([{ name }])
    .select('id, name')
    .single();

  if (error) {
    console.error('Error inserting payment method:', error);
    return NextResponse.json({ error: 'Failed to add payment method' }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
