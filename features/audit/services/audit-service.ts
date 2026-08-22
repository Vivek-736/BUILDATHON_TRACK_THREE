import { db, auditEvents } from "@/lib/db";
import { eq, desc } from "drizzle-orm";

export interface AuditRecord {
  id: string;
  merchantId: string;
  recoveryCaseId?: string | null;
  action: string;
  actorType: string;
  actorId: string;
  details: Record<string, unknown>;
  amountImpact?: string | null;
  timestamp: Date;
}

export async function getAuditRecords(merchantId?: string): Promise<AuditRecord[]> {
  const mId = merchantId || "merchant_novacart_01";

  const records = await db
    .select()
    .from(auditEvents)
    .where(eq(auditEvents.merchantId, mId))
    .orderBy(desc(auditEvents.timestamp))
    .limit(100);

  return records;
}