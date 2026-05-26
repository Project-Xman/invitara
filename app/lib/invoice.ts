/**
 * Invoice generation. Builds an HTML invoice + a sequential invoice number.
 * For PDF rendering, plug in @react-pdf/renderer or puppeteer.
 * For now, returns HTML string + invoice number; UI route /invoice/[id] renders & prints.
 */

import { db } from "./drizzle";
import { payments, users } from "./schema";
import { eq, sql } from "drizzle-orm";

export interface InvoiceInput {
  paymentId: string;
}

export interface InvoiceData {
  invoiceNumber: string;
  date: Date;
  user: { name: string; email: string };
  payment: {
    id: string;
    amount: string;
    currency: string;
    type: string;
    razorpayPaymentId: string | null;
    discount: string;
    couponCode: string | null;
  };
  amounts: {
    subtotal: number; // major unit
    discount: number;
    total: number;
    gstRate: number;
    gstAmount: number;
  };
}

function fyPrefix(): string {
  const d = new Date();
  const year = d.getUTCMonth() >= 3 ? d.getUTCFullYear() : d.getUTCFullYear() - 1;
  return `INV-${String(year).slice(-2)}${String(year + 1).slice(-2)}`;
}

export async function ensureInvoiceNumber(paymentId: string): Promise<string> {
  const [p] = await db
    .select({ invoiceNumber: payments.invoiceNumber })
    .from(payments)
    .where(eq(payments.id, paymentId));
  if (p?.invoiceNumber) return p.invoiceNumber;

  const seq = await db.execute(sql`SELECT COUNT(*)::int AS n FROM payments WHERE invoice_number IS NOT NULL`);
  const n = ((seq as any).rows?.[0]?.n ?? 0) + 1;
  const number = `${fyPrefix()}-${String(n).padStart(6, "0")}`;
  await db.update(payments).set({ invoiceNumber: number }).where(eq(payments.id, paymentId));
  return number;
}

export async function getInvoiceData(paymentId: string): Promise<InvoiceData | null> {
  const [row] = await db
    .select({
      id: payments.id,
      amount: payments.amount,
      currency: payments.currency,
      type: payments.type,
      razorpayPaymentId: payments.razorpayPaymentId,
      couponCode: payments.couponCode,
      discount: payments.discountAmount,
      invoiceNumber: payments.invoiceNumber,
      createdAt: payments.createdAt,
      userName: users.name,
      userEmail: users.email,
    })
    .from(payments)
    .innerJoin(users, eq(users.id, payments.userId))
    .where(eq(payments.id, paymentId))
    .limit(1);
  if (!row) return null;

  const invoiceNumber = row.invoiceNumber ?? (await ensureInvoiceNumber(paymentId));
  const subtotal = Number(row.amount);
  const discount = Number(row.discount ?? 0);
  const total = subtotal;
  // India GST defaults — 18% on most digital services; tweak per category if needed
  const gstRate = row.currency === "INR" ? 0.18 : 0;
  const gstAmount = +(total * (gstRate / (1 + gstRate))).toFixed(2);

  return {
    invoiceNumber,
    date: row.createdAt,
    user: { name: row.userName, email: row.userEmail },
    payment: {
      id: row.id,
      amount: row.amount,
      currency: row.currency,
      type: row.type,
      razorpayPaymentId: row.razorpayPaymentId ?? null,
      discount: String(discount),
      couponCode: row.couponCode ?? null,
    },
    amounts: { subtotal, discount, total, gstRate, gstAmount },
  };
}

export function renderInvoiceHtml(d: InvoiceData): string {
  const fmt = (n: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: d.payment.currency }).format(n);
  return `<!doctype html>
<html><head><meta charset="utf-8"><title>Invoice ${d.invoiceNumber}</title>
<style>
  body { font-family: -apple-system, system-ui, sans-serif; color: #2b2b2b; padding: 40px; max-width: 800px; margin: 0 auto; }
  h1 { color: #8a6d2a; margin: 0 0 8px; }
  .meta { display: flex; justify-content: space-between; margin-top: 24px; }
  table { width: 100%; border-collapse: collapse; margin-top: 32px; }
  th, td { padding: 12px 8px; border-bottom: 1px solid #eee; text-align: left; }
  th { background: #fbf6e8; color: #8a6d2a; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; }
  .totals { margin-top: 16px; text-align: right; font-size: 14px; }
  .totals .row { padding: 4px 0; }
  .totals .grand { font-size: 18px; font-weight: 700; color: #5c4a1a; padding-top: 8px; border-top: 2px solid #D4A853; }
  .foot { margin-top: 60px; text-align: center; color: #888; font-size: 12px; }
  @media print { body { padding: 0; } }
</style></head><body>
<h1>Invitara</h1>
<div style="color:#999">Tax Invoice</div>
<div class="meta">
  <div>
    <strong>Billed to</strong><br>
    ${d.user.name}<br>
    ${d.user.email}
  </div>
  <div style="text-align:right">
    <strong>Invoice #</strong> ${d.invoiceNumber}<br>
    <strong>Date</strong> ${d.date.toLocaleDateString("en-IN")}<br>
    ${d.payment.razorpayPaymentId ? `<strong>Ref</strong> ${d.payment.razorpayPaymentId}` : ""}
  </div>
</div>
<table>
  <thead><tr><th>Description</th><th>Type</th><th style="text-align:right">Amount</th></tr></thead>
  <tbody>
    <tr>
      <td>${d.payment.type === "subscription" ? "Plan subscription" : d.payment.type === "credits" ? "Credit pack" : "Premium template"}</td>
      <td>${d.payment.type}</td>
      <td style="text-align:right">${fmt(d.amounts.subtotal)}</td>
    </tr>
    ${d.amounts.discount > 0 ? `<tr><td>Discount${d.payment.couponCode ? ` (${d.payment.couponCode})` : ""}</td><td></td><td style="text-align:right">- ${fmt(d.amounts.discount)}</td></tr>` : ""}
  </tbody>
</table>
<div class="totals">
  ${d.amounts.gstRate > 0 ? `<div class="row">GST @ ${(d.amounts.gstRate * 100).toFixed(0)}% (incl.): ${fmt(d.amounts.gstAmount)}</div>` : ""}
  <div class="row grand">Total paid: ${fmt(d.amounts.total)}</div>
</div>
<div class="foot">
  Invitara · Wedding invitation SaaS · This is a computer-generated invoice.
</div>
</body></html>`;
}
