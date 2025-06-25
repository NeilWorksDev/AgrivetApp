import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { NextRequest } from "next/server";

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
        user_uid: user.id, // Associate with the authenticated user
      }
    ])
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Return the created product
  return NextResponse.json(data[0]);
}
export async function DELETE(
  _req: Request, // underscore avoids unused var warning
  context: { params: { productId: string } }
) {
  const { productId } = context.params;
  console.log("ID:", productId); // This should now log the correct ID

  const supabase = createClient();

  const { error } = await supabase.from("products").delete().eq("id", productId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: "Product deleted successfully" });
}

export async function PUT(request: NextRequest, { params }: { params: { productId: string } }) {
  const supabase = createClient();
  const { productId } = params;

  if (!productId) {
    return new Response(JSON.stringify({ error: "Missing product ID" }), { status: 400 });
  }

  const body = await request.json();

  // Validate required fields (optional but recommended)
  const { name, description, price, in_stock, category, sales_type } = body;
  if (!name || !description || price === undefined || in_stock === undefined || !category || !sales_type) {
    return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
  }

  const { data, error } = await supabase
    .from("products")
    .update({
      name,
      description,
      price,
      in_stock,
      category,
      sales_type,
    })
    .eq("id", productId)
    .select()
    .single();

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify(data), { status: 200 });
}