import { NextResponse } from "next/server";
import { db, products } from "@/lib/db";
import { eq } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    const productList = category && category !== "All"
      ? await db.select().from(products).where(eq(products.category, category))
      : await db.select().from(products);

    return NextResponse.json({ success: true, products: productList });
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return NextResponse.json(
      { success: false, error: "Unable to retrieve products" },
      { status: 500 }
    );
  }
}