export const RUPPEE_SYMBOL = "₹";

export const STORAGE_KEYS = Object.freeze({
  ACCESS_TOKEN: "DECATHO_PROVIDER__access_token",
  REFRESH_TOKEN: "DECATHO_PROVIDER__refresh_token",
});

export const ORDER_STATUS = Object.freeze({
  PLACED: "placed",
  APPROVED: "approved",
  REJECTED: "rejected",
  PACKED: "packed",
  CONFIRMED: "confirmed",
  PROCESSING: "processing",
  OUT_FOR_DELIVERY: "out_for_delivery",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
  RETURNED: "returned",
});

export const ORDER_STATUS_LABELS: Record<string, string> = Object.freeze({
  placed: "Placed",
  approved: "Approved",
  rejected: "Rejected",
  packed: "Packed",
  confirmed: "Confirmed",
  processing: "Processing",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
  returned: "Returned",
});

export const IN_PROGRESS_ORDER_STATUSES = [
  ORDER_STATUS.APPROVED,
  ORDER_STATUS.PACKED,
  ORDER_STATUS.OUT_FOR_DELIVERY,
  ORDER_STATUS.PROCESSING,
  ORDER_STATUS.CONFIRMED,
] as const;

export const TERMINAL_ORDER_STATUSES = [
  ORDER_STATUS.DELIVERED,
  ORDER_STATUS.REJECTED,
  ORDER_STATUS.CANCELLED,
  ORDER_STATUS.RETURNED,
] as const;

export function getOrderStatusLabel(status: string): string {
  return ORDER_STATUS_LABELS[status] ?? status;
}

export function isInProgressOrderStatus(status: string): boolean {
  return (IN_PROGRESS_ORDER_STATUSES as readonly string[]).includes(status);
}

export function isTerminalOrderStatus(status: string): boolean {
  return (TERMINAL_ORDER_STATUSES as readonly string[]).includes(status);
}

export const ESTIMATED_DELIVERY_MINUTES = Object.freeze({
  ONE_HOUR : {
    label: '1 Hour',
    value: 60
  },
  TWO_HOURS : {
    label: '2 Hours',
    value: 120
  },
  TWENTY_FOUR_HOURS : {
    label: '24 Hours',
    value: 1440
  },
})
