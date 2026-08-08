export interface ProviderEarnings {
  total_orders: number
  gross: string
  commission: string
  payout: string
  pending_payout: string
}

export interface ProviderBankDetails {
  bank_account_name: string | null
  bank_account_number: string | null
  bank_ifsc: string | null
  upi_id: string | null
}

export interface NotificationItem {
  id: number
  notification_type: string
  title: string
  body: string
  order: number | null
  data: Record<string, unknown>
  is_read: boolean
  is_sent: boolean
  created_at: string
}

export interface PaginatedNotifications {
  count: number
  next: string | null
  previous: string | null
  results: NotificationItem[]
}

export interface MedicineProduct {
  id: number
  name: string
  manufacturer: string
  description: string | null
  price: string
  mrp: string
  stock: number
  is_active: boolean
}

export interface MedicineSearchResponse {
  count: number
  next: string | null
  previous: string | null
  results: MedicineProduct[]
}

export interface iVideoTokenResponse {
  auth_token: string
  room_id: string
  role: string
  user_name: string
  appointment_id: number
  mock: boolean
  hms_configured: boolean
}
