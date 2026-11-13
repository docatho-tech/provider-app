import { NotificationItem } from '@/interfaces/provider'

/**
 * What a notification row looks like, derived from the record rather than
 * carried on it.
 *
 * The backend sends a type, a title, a body and a small `data` bag; the design
 * turns those into five different rows — a request with two buttons, a reminder,
 * a waiting patient with a join button, a completed consultation with a notes
 * button, and a rating that is five stars and nothing else. Deriving the shape
 * here keeps that mapping in one place instead of a `switch` inside the list.
 */

export const NOTIFICATION_TYPE = Object.freeze({
  APPOINTMENT_BOOKED: 'appointment_booked',
  APPOINTMENT_REMINDER: 'appointment_reminder',
  APPOINTMENT_WAITING: 'appointment_waiting',
  APPOINTMENT_COMPLETED: 'appointment_completed',
  APPOINTMENT_RATED: 'appointment_rated',
  DIAG_BOOKING_REQUESTED: 'diag_booking_requested',
  ORDER_PLACED: 'order_placed',
})

export type NotificationAction = 'approve' | 'join' | 'notes' | 'rating' | 'none'

export interface NotificationView {
  /** The leading pill icon: how the patient is being seen, or a calendar. */
  icon: 'video' | 'home' | 'calendar' | 'package'
  /** The small blue line above the title. Absent on most rows. */
  eyebrow?: string
  action: NotificationAction
  /** Reminders lead with the body and follow with the title; nothing else does. */
  bodyFirst: boolean
  rating: number
  appointmentId?: number
}

const isOnlineMode = (item: NotificationItem) => item.data?.consultation_mode === 'online'

export function notificationView(item: NotificationItem): NotificationView {
  const appointmentId = typeof item.data?.appointment_id === 'number' ? item.data.appointment_id : undefined
  const rating = typeof item.data?.rating === 'number' ? item.data.rating : 0
  const mode: NotificationView['icon'] = isOnlineMode(item) ? 'video' : 'home'

  switch (item.notification_type) {
    case NOTIFICATION_TYPE.APPOINTMENT_BOOKED:
      return { icon: mode, eyebrow: 'New appointment', action: 'approve', bodyFirst: false, rating, appointmentId }
    case NOTIFICATION_TYPE.APPOINTMENT_REMINDER:
      return { icon: 'calendar', action: 'none', bodyFirst: true, rating, appointmentId }
    case NOTIFICATION_TYPE.APPOINTMENT_WAITING:
      return { icon: mode, action: 'join', bodyFirst: false, rating, appointmentId }
    case NOTIFICATION_TYPE.APPOINTMENT_COMPLETED:
      return { icon: mode, action: 'notes', bodyFirst: false, rating, appointmentId }
    case NOTIFICATION_TYPE.APPOINTMENT_RATED:
      return { icon: mode, action: 'rating', bodyFirst: false, rating, appointmentId }
    case NOTIFICATION_TYPE.DIAG_BOOKING_REQUESTED:
      return { icon: 'home', eyebrow: 'New booking', action: 'none', bodyFirst: false, rating, appointmentId }
    case NOTIFICATION_TYPE.ORDER_PLACED:
      return { icon: 'package', eyebrow: 'New order', action: 'none', bodyFirst: false, rating, appointmentId }
    default:
      return { icon: 'calendar', action: 'none', bodyFirst: false, rating, appointmentId }
  }
}

export const NOTIFICATION_FILTERS = Object.freeze([
  { label: 'All', value: 'all' },
  { label: 'Unread', value: 'unread' },
  { label: 'In clinic Visits', value: 'in_clinic' },
  { label: 'Online Consults', value: 'online' },
])

export type NotificationFilter = (typeof NOTIFICATION_FILTERS)[number]['value']

/**
 * The query the server should answer for a filter.
 *
 * Filtering server-side rather than over the loaded page: a page of twenty
 * notifications narrowed in the app shows whatever of the twenty happened to
 * match and then stops, which reads as "that is all of them".
 */
export function filterParams(filter: NotificationFilter): Record<string, unknown> {
  if (filter === 'unread') return { is_read: false }
  if (filter === 'in_clinic' || filter === 'online') return { mode: filter }
  return {}
}
