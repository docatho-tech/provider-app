export interface iCreateRazorpayOrderResponse {
  detail: string;
  razorpay_response: {
    id: string;
    entity: string;
    amount: number;
    amount_paid: number;
    amount_due: number;
    currency: string;
    receipt: string;
    offer_id: string | null;
    status: string;
    attempts: number;
    notes: string[];
    created_at: number;
  };
  prefill_data: {
    name: string;
    email: string | null;
    contact: string | null;
  }
}

export interface iRazorpayOrderRequest {
    transaction_for: string;
    amount: number;
    receipt: string | null;
    notes: Record<string, string> | null;
}

export interface iRazorpayOrderResponse extends iRazorpayOrderRequest {
  prefill_data: {
    name: string;
    email: string | null;
    contact: string | null;
  }
  status: "PENDING" | "FAILED" | "SUCCESS";
}