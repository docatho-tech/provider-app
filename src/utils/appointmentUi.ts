export type AppointmentLike = {
  status: string
  payment_status?: string
  requires_payment?: boolean
  consultation_mode?: string
}

export const STATUS_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  pending: { bg: '#FEF3C7', text: '#B45309', label: 'Waiting for doctor' },
  confirmed: { bg: '#D1FAE5', text: '#047857', label: 'Confirmed' },
  in_progress: { bg: '#DBEAFE', text: '#1D4ED8', label: 'In consultation' },
  completed: { bg: '#E5E7EB', text: '#374151', label: 'Completed' },
  cancelled: { bg: '#FEE2E2', text: '#B91C1C', label: 'Cancelled' },
  rejected: { bg: '#FEE2E2', text: '#B91C1C', label: 'Declined' },
}

export function getStatusMeta(status: string) {
  return STATUS_COLORS[status] ?? { bg: '#EEF4FF', text: '#064CBD', label: status.replace('_', ' ') }
}

export function formatAppointmentDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })
}

export function formatAppointmentTime(iso: string) {
  const d = new Date(iso)
  return d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true })
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

  const steps = [
    { key: 'booked', label: 'Booked', state: 'done' as StepState },
    {
      key: 'paid',
      label: a.consultation_mode === 'online' ? 'Paid' : 'Payment',
      state: paid ? 'done' : 'current',
    },
    {
      key: 'confirmed',
      label: 'Doctor confirmed',
      state: confirmed ? 'done' : paid ? 'current' : 'upcoming',
    },
    {
      key: 'consult',
      label: 'Consultation',
      state: done ? 'done' : inCall ? 'current' : confirmed ? 'upcoming' : 'upcoming',
    },
  ]
  return steps as { key: string; label: string; state: StepState }[]
}

export function minutesUntilJoin(scheduledAt: string): number | null {
  const start = new Date(scheduledAt).getTime() - 15 * 60 * 1000
  return Math.round((start - Date.now()) / 60000)
}

export function joinCountdownLabel(scheduledAt: string, canJoin: boolean): string | null {
  if (canJoin) return 'Join now'
  const mins = minutesUntilJoin(scheduledAt)
  if (mins === null) return null
  if (mins <= 0) return 'Join opens soon'
  if (mins < 60) return `Join opens in ${mins} min`
  const hrs = Math.floor(mins / 60)
  return `Join opens in ${hrs}h ${mins % 60}m`
}

export const SYMPTOM_SUGGESTIONS = ['Fever', 'Headache', 'Cough', 'Fatigue', 'Stomach pain', 'Skin issue', 'Other']
