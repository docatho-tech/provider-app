import { ORDER_STATUS, getOrderStatusLabel } from '@/constants/base'
import { ChipTone } from '@/components/ui/Primitives'
import { iOrderItem } from '@/interfaces/order'

/** "30 Caps", "15 Tabs", "12 Nos" — the quantity as every order line writes it. */
export function itemQuantityLabel(item: iOrderItem): string {
  return `${item.quantity} ${item.medicine_unit || 'Nos'}`
}

/**
 * The header chip on the order *detail* screen.
 *
 * Quieter than the list's: the design fills the dashboard card's chip dark so it
 * carries across a scrolling list, and leaves the detail screen's grey because
 * the screen is already about that one order.
 */
export function orderStatusHeaderChip(status: string): { label: string; tone: ChipTone } {
  const chip = orderStatusChip(status)
  return chip.tone === 'dark' ? { ...chip, tone: 'soft' } : chip
}

/**
 * The chip shown against an order, in the tones the design uses: green once it
 * has arrived, dark while it is still moving, grey once it is off the board.
 */
export function orderStatusChip(status: string): { label: string; tone: ChipTone } {
  if (status === ORDER_STATUS.DELIVERED) return { label: 'Delivered', tone: 'success' }
  if (status === ORDER_STATUS.PLACED) return { label: 'New Order', tone: 'dark' }
  if (status === ORDER_STATUS.OUT_FOR_DELIVERY) return { label: 'In Transit', tone: 'dark' }
  const closed: string[] = [ORDER_STATUS.REJECTED, ORDER_STATUS.CANCELLED, ORDER_STATUS.RETURNED]
  if (closed.includes(status)) {
    return { label: getOrderStatusLabel(status), tone: 'soft' }
  }
  return { label: getOrderStatusLabel(status), tone: 'dark' }
}
