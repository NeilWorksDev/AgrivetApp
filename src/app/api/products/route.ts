
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('user_uid', user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(request: Request) {

  const supabase = createClient();

  // Get user data to associate with the product
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const newProduct = await request.json();

  const { name, description, price, in_stock, category, sales_type } = newProduct;

  // Insert new product into the products table
  const { data, error } = await supabase
    .from('products')
    .insert([
      {
        name,
        description,
        price,
        in_stock,
        category,
        sales_type,
        user_uid: user.id,
      }
    ])
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Return the created product
  return NextResponse.json(data[0]);
}