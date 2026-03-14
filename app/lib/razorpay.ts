/**
 * Client-side Razorpay checkout helper.
 * Dynamically loads the Razorpay SDK and opens the payment modal.
 */

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open(): void };
  }
}

let scriptLoading: Promise<void> | null = null;

function loadRazorpayScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.Razorpay) return Promise.resolve();
  if (scriptLoading) return scriptLoading;

  scriptLoading = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Razorpay SDK"));
    document.head.appendChild(script);
  });
  return scriptLoading;
}

export interface RazorpayPaymentResult {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface RazorpayCheckoutOptions {
  orderId: string;
  amount: number; // in paise (e.g., 299900 for ₹2999)
  currency: string;
  description: string;
  keyId: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
}

/**
 * Opens the Razorpay checkout modal.
 * Resolves with payment details on success, rejects on failure/cancellation.
 */
export async function openRazorpayCheckout(
  options: RazorpayCheckoutOptions
): Promise<RazorpayPaymentResult> {
  await loadRazorpayScript();

  return new Promise((resolve, reject) => {
    const rzp = new window.Razorpay({
      key: options.keyId,
      amount: options.amount,
      currency: options.currency,
      name: "Invitara",
      description: options.description,
      order_id: options.orderId,
      prefill: options.prefill ?? {},
      theme: { color: "#D4A853" },
      handler: (response: RazorpayPaymentResult) => resolve(response),
      modal: {
        ondismiss: () => reject(new Error("Payment cancelled")),
        escape: true,
        animation: true,
      },
    });
    rzp.open();
  });
}
