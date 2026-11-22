import { Colors } from '@/constants/Colors'
import { BOOKING_STATUS, DiagnosticBooking, VISIT_TYPE } from '@/interfaces/healthcare'
import Feather from '@expo/vector-icons/Feather'
import React from 'react'

/** Everything the centre still has work to do on. */
export const isOpenBooking = (status: string) =>
  ![BOOKING_STATUS.COMPLETED, BOOKING_STATUS.CANCELLED].includes(status as never)

export const isWalkIn = (visitType: string) => visitType === VISIT_TYPE.AT_CENTRE

/** "Walk-ins" / "Home pickup", as the centre's screens label the two. */
export const visitTypeLabel = (visitType: string) => (isWalkIn(visitType) ? 'Walk-ins' : 'Home pickup')

/** A house for a home pickup, a lab flask for someone coming in. */
export function visitTypeIcon(visitType: string, color: string = Colors.primary, size = 17) {
  return React.createElement(Feather, {
    name: isWalkIn(visitType) ? 'thermometer' : 'home',
    size,
    color,
  })
}

/**
 * The booking's slot as one ISO timestamp, or null when it has not been given
 * one yet.
 *
 * `scheduled_date` and `scheduled_time` are separate nullable columns, and a
 * date with no time is a real state — a home pickup booked for Thursday before
 * the round is planned. Combining them here means no screen has to decide what
 * a half-filled slot means twice.
 */
export function bookingSlot(booking: Pick<DiagnosticBooking, 'scheduled_date' | 'scheduled_time'>): string | null {
  if (!booking.scheduled_date) return null
  return `${booking.scheduled_date}T${booking.scheduled_time ?? '00:00:00'}`
}

/** Free-text search over the patient and the tests they booked. */
export function bookingMatchesQuery(booking: DiagnosticBooking, query: string): boolean {
  const needle = query.trim().toLowerCase()
  if (!needle) return true
  const haystack = [
    booking.patient_name,
    visitTypeLabel(booking.visit_type),
    ...booking.tests.map((test) => test.name),
  ]
  return haystack.some((field) => (field ?? '').toLowerCase().includes(needle))
}

/** The status chip on a booking, in the same tones the order chips use. */
export function bookingStatusMeta(status: string): { label: string; tone: 'success' | 'dark' | 'soft' } {
  if (status === BOOKING_STATUS.COMPLETED || status === BOOKING_STATUS.REPORT_GENERATED) {
    return { label: status === BOOKING_STATUS.COMPLETED ? 'Completed' : 'Report ready', tone: 'success' }
  }
  if (status === BOOKING_STATUS.REQUESTED) return { label: 'New Request', tone: 'dark' }
  if (status === BOOKING_STATUS.CANCELLED) return { label: 'Cancelled', tone: 'soft' }
  return { label: status.split('_').map((w) => w[0].toUpperCase() + w.slice(1)).join(' '), tone: 'dark' }
}
