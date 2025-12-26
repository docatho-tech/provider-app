export const RUPPEE_SYMBOL = "₹";

export const STORAGE_KEYS = Object.freeze({
  ACCESS_TOKEN: "DECATHO_PROVIDER__access_token",
  REFRESH_TOKEN: "DECATHO_PROVIDER__refresh_token",
});

export const DELIVERY_STATUSES = Object.freeze({
  placed: "Placed",
  confirmed: "Confirmed",
  processing: "Processing",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
  returned: "Returned",
});

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
