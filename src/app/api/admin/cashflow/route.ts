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
  endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1); // First day of next month
} else if (filter === 'yearly') {
  startDate = new Date(now.getFullYear(), 0, 1);
  endDate = new Date(now.getFullYear() + 1, 0, 1); // First day of next year
}

  console.log('[Cashflow API] Filter:', filter);
  console.log('[Cashflow API] Start date:', startDate?.toISOString() ?? 'No date filter');

  let query = supabase
    .from('transactions')
    .select('amount, created_at')
    .eq('status', 'completed')
    .eq('user_uid', user.id)
    .order('created_at', { ascending: true });

 if (startDate && endDate) {
  query = query
    .gte('created_at', startDate.toISOString())
    .lt('created_at', endDate.toISOString());
}

  const { data: transactionsData, error: transactionsError } = await query;

  if (transactionsError) {
    console.error('Error fetching cash flow data:', transactionsError);
    return NextResponse.json({ error: 'Failed to fetch cash flow data' }, { status: 500 });
  }

  const cashFlow = transactionsData?.reduce((acc, transaction) => {
    const date = new Date(transaction.created_at).toISOString().split('T')[0];
    acc[date] = (acc[date] ?? 0) + transaction.amount;
    return acc;
  }, {} as Record<string, number>);

  return NextResponse.json({ cashFlow });
}
