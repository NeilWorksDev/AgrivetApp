import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const filter = searchParams.get('filter') ?? 'all';

  const now = new Date();
  let startDate: Date | null = null;
  let endDate: Date | null = null;

  if (filter === 'monthly') {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  } else if (filter === 'yearly') {
    startDate = new Date(now.getFullYear(), 0, 1);
    endDate = new Date(now.getFullYear() + 1, 0, 1);
  }

  let query = supabase
    .from('transactions')
    .select('amount')
    .eq('type', 'income')
    .eq('user_uid', user.id)
    .eq('status', 'completed');

  if (startDate && endDate) {
    query = query
      .gte('created_at', startDate.toISOString())
      .lt('created_at', endDate.toISOString());
  }

  const { data: revenueData, error: revenueError } = await query;

  if (revenueError) {
    console.error('Error fetching total revenue:', revenueError);
    return NextResponse.json({ error: 'Failed to fetch total revenue' }, { status: 500 });
  }

  const totalRevenue = revenueData?.reduce((sum, order) => sum + order.amount, 0) || 0;

  return NextResponse.json({ totalRevenue });
}
