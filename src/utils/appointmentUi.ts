import { Colors } from '@/constants/Colors'
import Feather from '@expo/vector-icons/Feather'
import React from 'react'

export type AppointmentLike = {
  status: string
  payment_status?: string
  requires_payment?: boolean
  consultation_mode?: string
  patient_name?: string
}

export const STATUS_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  pending: { bg: '#FEF3C7', text: '#B45309', label: 'New request' },
  confirmed: { bg: Colors.successBg, text: Colors.successText, label: 'Confirmed' },
  in_progress: { bg: '#DBEAFE', text: '#1D4ED8', label: 'In consultation' },
  completed: { bg: '#E5E7EB', text: '#374151', label: 'Completed' },
  cancelled: { bg: '#FEE2E2', text: '#B91C1C', label: 'Cancelled' },
  rejected: { bg: '#FEE2E2', text: '#B91C1C', label: 'Declined' },
}

export function getStatusMeta(status: string) {
  return STATUS_COLORS[status] ?? { bg: Colors.iconPill, text: Colors.primary, label: status.replace('_', ' ') }
}

/** Everything the doctor still has to do something about. */
export const isOpenAppointment = (status: string) =>
  !['completed', 'cancelled', 'rejected'].includes(status)

export const isOnline = (mode?: string) => mode === 'online'

/** "Online Consultation" / "In-Clinic visit", as the rows label them. */
export function appointmentModeLabel(mode?: string): string {
  if (isOnline(mode)) return 'Online Consultation'
  if (mode === 'home_visit') return 'Home visit'
  return 'In-Clinic visit'
}

/** The leading pill icon: a camera for online, a clinic for everything else. */
export function appointmentModeIcon(mode?: string, color: string = Colors.primary, size = 17) {
  return React.createElement(Feather, {
    name: isOnline(mode) ? 'video' : 'home',
    size,
    color,
  })
}

/** Free-text search over the fields a partner would actually type. */
export function matchesQuery(appointment: AppointmentLike, query: string): boolean {
  const needle = query.trim().toLowerCase()
  if (!needle) return true
  return [appointment.patient_name, appointmentModeLabel(appointment.consultation_mode), appointment.status]
    .some((field) => (field ?? '').toLowerCase().includes(needle))
}

/**
 * Whether the doctor can open the call. The backend answers this on the
 * appointment (`can_join_video`) because it knows the room state; the local
 * rule is only the fallback for a payload that predates the field.
 */
export function canJoinVideo(appointment: {
  can_join_video?: boolean
  consultation_mode?: string
  payment_status?: string
  status?: string
}): boolean {
  if (typeof appointment.can_join_video === 'boolean') return appointment.can_join_video
  return (
    isOnline(appointment.consultation_mode)
    && appointment.payment_status === 'paid'
    && ['confirmed', 'in_progress'].includes(appointment.status ?? '')
  )
}

export function formatAppointmentDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })
}

export function formatAppointmentTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true })
}

export function formatSlotLabel(iso: string) {
  return `${formatAppointmentDate(iso)} · ${formatAppointmentTime(iso)}`
}

export type StepState = 'done' | 'current' | 'upcoming' | 'skipped'

export function getAppointmentSteps(a: AppointmentLike): { key: string; label: string; state: StepState }[] {
  const paid = a.payment_status === 'paid' || !a.requires_payment
  const confirmed = ['confirmed', 'in_progress', 'completed'].includes(a.status)
  const inCall = a.status === 'in_progress'
  const done = a.status === 'completed'
  const cancelled = ['cancelled', 'rejected'].includes(a.status)

  if (cancelled) {
    return [
      { key: 'booked', label: 'Booked', state: 'done' },
      { key: 'cancelled', label: getStatusMeta(a.status).label, state: 'current' },
    ]
  }

  return [
    { key: 'booked', label: 'Booked', state: 'done' },
    { key: 'paid', label: isOnline(a.consultation_mode) ? 'Paid' : 'Payment', state: paid ? 'done' : 'current' },
    { key: 'confirmed', label: 'Doctor confirmed', state: confirmed ? 'done' : paid ? 'current' : 'upcoming' },
    { key: 'consult', label: 'Consultation', state: done ? 'done' : inCall ? 'current' : 'upcoming' },
  ]
}

export const SYMPTOM_SUGGESTIONS = ['Fever', 'Headache', 'Cough', 'Fatigue', 'Stomach pain', 'Skin issue', 'Other']
