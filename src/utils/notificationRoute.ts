import { RelativePathString, useRouter } from 'expo-router'

import { NOTIFICATION_TYPE } from './notificationUi'

type Router = ReturnType<typeof useRouter>

/**
 * Where a tapped push notification should land.
 *
 * The gateway payload is the record's `data` bag plus a `type` key (see
 * `ExpoPushNotificationService`), so the same ids the notification list routes
 * on are available here — one mapping, two entry points.
 */
export interface NotificationTarget {
  pathname: string
  params?: Record<string, string>
}

const asId = (value: unknown): number | undefined => {
  const id = typeof value === 'string' ? Number(value) : value
  return typeof id === 'number' && Number.isFinite(id) && id > 0 ? id : undefined
}

export function notificationTarget(data: Record<string, unknown>): NotificationTarget {
  const type = typeof data.type === 'string' ? data.type : ''
  const appointmentId = asId(data.appointment_id)
  const orderId = asId(data.order_id)
  const bookingId = asId(data.diagnostic_booking_id)

  if (appointmentId) {
    // "Patient is waiting" is a call to answer, so the tap opens the call
    // rather than the detail screen behind it.
    if (type === NOTIFICATION_TYPE.APPOINTMENT_WAITING) {
      return {
        pathname: '/appointments/[appointmentId]/video',
        params: {
          appointmentId: String(appointmentId),
          patientName: String(data.patient_name ?? 'Patient'),
          scheduledAt: String(data.scheduled_at ?? ''),
        },
      }
    }
    return {
      pathname: '/appointments/[appointmentId]',
      params: { appointmentId: String(appointmentId) },
    }
  }
  if (orderId) {
    return { pathname: '/orders/[orderId]', params: { orderId: String(orderId) } }
  }
  if (bookingId) {
    return { pathname: '/bookings/[bookingId]', params: { bookingId: String(bookingId) } }
  }
  // Nothing identifiable to open — the list is still better than a dead tap.
  return { pathname: '/notifications' }
}

export function openNotification(router: Router, data: Record<string, unknown>) {
  const target = notificationTarget(data)
  router.push({
    pathname: target.pathname as RelativePathString,
    params: target.params,
  })
}
