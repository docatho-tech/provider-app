export interface iOrder {
    id: number;
    order_number: string;
    user: number;
    user_name: string;
    user_phone: string;
    address: iAddress;
    status: string;
    payment_status: string;
    payment_method?: string;
    subtotal: string;
    total_mrp: string;
    delivery_fee: string;
    discount_amount: string;
    total: string;
    placed_at: string;
    delivered_at?: string | null;
    /** Who is carrying it — shown on every in-transit and delivered row. */
    rider_name?: string;
    rider_code?: string;
    estimated_delivery_mins: number;
    items: iOrderItem[];
}

export interface iOrderItem {
    id: number;
    medicine_id: number;
    medicine_name: string;
    /** How the pack is counted — "Tabs", "Caps", "Nos". Suffixes the quantity. */
    medicine_unit?: string;
    quantity: number;
    unit_price: string;
    mrp: string;
    line_total: number;
}

export interface iAddress {
    id: number;
    address_line1: string;
    address_line2: string;
    landmark: string;
    city: string;
    state: string;
    postal_code: string;
    user: number;
}

export interface iOrderListResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: iOrder[];
    /** Totals for all three dashboard tabs, not just the one being shown. */
    counts?: { new: number; in_progress: number; completed: number };
}

export interface iOrderDetailsResponse {
    id: number;
    order_number: string;
    user: number;
    user_name: string;
    user_phone: string;
    address: iAddress;
    status: string;
    payment_status: string;
    subtotal: string;
    total_mrp: string;
    delivery_fee: string;
    discount_amount: string;
    total: string;
    payment_method?: string;
    placed_at: string;
    delivered_at?: string | null;
    rider_name?: string;
    rider_code?: string;
    estimated_delivery_mins?: number;
    estimated_delivery_start: string | null;
    estimated_delivery_end: string | null;
    items: iOrderItem[];
}