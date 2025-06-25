import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const supabase = createClient();

  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const filter = searchParams.get('filter') ?? 'all';

  const now = new Date();
  let startDate: Date | null = null;
  let endDate: Date | null = null;


  if (filter === 'monthly') {
  startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1); // First day of next month
} else if (filter === 'yearly') {
  startDate = new Date(now.getFullYear(), 0, 1);
  endDate = new Date(now.getFullYear() + 1, 0, 1); // First day of next year
}
  let query = supabase
    .from('transactions')
    .select('amount, category, status, user_uid, created_at')
    .eq('status', 'completed')
    .eq('type', 'income')
    .eq('user_uid', userData.user.id);

  if (startDate && endDate) {
  query = query
    .gte('created_at', startDate.toISOString())
    .lt('created_at', endDate.toISOString());
}

  const { data: revenueData, error: revenueError } = await query;

  if (revenueError) {
    console.error('Error fetching revenue by category:', revenueError);
    return NextResponse.json({ error: 'Failed to fetch revenue by category' }, { status: 500 });
  }

  const revenueByCategory = revenueData?.reduce((acc, item) => {
    const category = item.category;
    if (!category) return acc;

    acc[category] = (acc[category] ?? 0) + item.amount;
    return acc;
  }, {} as Record<string, number>);

  return NextResponse.json({ revenueByCategory });
}
