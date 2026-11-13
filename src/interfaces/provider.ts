export interface ProviderEarnings {
  total_orders: number
  gross: string
  commission: string
  payout: string
  pending_payout: string
  /** Net pay from the last seven days — the figure "My Earnings" leads with. */
  week_total: string
  next_payout: NextPayout
  lines: EarningsLine[]
}

export interface NextPayout {
  amount: string
  /** ISO date of the next settlement run. */
  credited_on: string
  status: 'scheduled' | 'unscheduled'
  bank_name: string
  bank_last4: string
  has_bank: boolean
}

export interface EarningsLine {
  id: number
  /** "Consultation" / "Follow up" / "Test" / "Order". */
  kind: string
  name: string
  amount: string
  platform_fee: string
  net: string
  /** `consultation_mode`, `visit_type` or payment method, by persona. */
  mode: string
  at: string
}

export interface InsightMetric {
  key: string
  label: string
  color: string
  format: 'money' | 'count'
  value: number
  series: number[]
  /** The same window one period earlier — the dotted line behind the solid. */
  previous: number[]
}

export interface ProviderInsights {
  period: string
  start: string
  end: string
  persona: string
  labels: string[]
  metrics: InsightMetric[]
}

export interface CatalogItem {
  id: number
  name: string
  category: string
  /** Second chip on the card: a sample type, or a pack unit. */
  detail: string
  code: string
  /** "TAT 24 hours", or a medicine's strength. Empty when there is none. */
  meta: string | null
  mrp: string | null
  partner_price: string | null
  is_available: boolean
}

export interface ProviderCatalog {
  kind: 'medicines' | 'tests'
  title: string
  search_placeholder: string
  categories: string[]
  items: CatalogItem[]
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
