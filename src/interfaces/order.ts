export interface iOrder {
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
    placed_at: string;
    estimated_delivery_mins: number;
    items: iOrderItem[];
}

export interface iOrderItem {
    id: number;
    medicine_id: number;
    medicine_name: string;
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
}