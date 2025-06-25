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

  let query = supabase
    .from('transactions')
    .select('amount, category, created_at, status, user_uid')
    .eq('status', 'completed')
    .eq('type', 'expense')
    .eq('user_uid', user.id);

  if (startDate && endDate) {
  query = query
    .gte('created_at', startDate.toISOString())
    .lt('created_at', endDate.toISOString());
  }
  const { data: expensesData, error: expensesError } = await query;

  if (expensesError) {
    console.error('Error fetching expenses by category:', expensesError);
    return NextResponse.json({ error: 'Failed to fetch expenses by category' }, { status: 500 });
  }

  const expensesByCategory = expensesData?.reduce((acc, item) => {
    const category = item.category;
    if (!category) return acc;

    acc[category] = (acc[category] ?? 0) + item.amount;
    return acc;
  }, {} as Record<string, number>);

  return NextResponse.json({ expensesByCategory });
}
