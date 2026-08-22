import { auth, currentUser } from "@clerk/nextjs/server";
import { db, merchants } from "@/lib/db";
import { eq } from "drizzle-orm";

export async function getCurrentMerchant() {
  const { userId } = await auth();
  const user = userId ? await currentUser() : null;

  const displayName = user
    ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || user.username || "Vivek"
    : "NovaCart Merchant";

  const email = user?.emailAddresses[0]?.emailAddress ?? "support@novacart.in";

  // Find the primary merchant store
  const [primaryStore] = await db
    .select()
    .from(merchants)
    .where(eq(merchants.id, "merchant_novacart_01"))
    .limit(1);

  return {
    id: primaryStore?.id || "merchant_novacart_01",
    clerkUserId: userId,
    email,
    name: displayName,
    storeName: primaryStore?.storeName || "NovaCart Electronics & Lifestyle",
  };
}