export interface PreviousConsultation {
  id: number
  doctor_name: string
  doctor_specialty: string
  doctor_photo: string
  scheduled_at: string
}

export interface ProviderAppointment {
  id: number
  patient_name?: string
  patient_age?: number | null
  patient_gender?: string
  patient_photo?: string
  patient_phone?: string
  patient_address?: string
  scheduled_at: string
  status: string
  consultation_mode: string
  payment_status?: string
  payment_method?: string
  fee?: string
  platform_fee?: string
  total_payable?: string
  symptoms?: string
  notes?: string
  prescription_notes?: string
  can_join_video?: boolean
  requires_payment?: boolean
  previous_consultations?: PreviousConsultation[]
  prescription?: AppointmentPrescription | null
}

export interface PrescribedMedication {
  type: string
  drug: string
  dose: string
  duration: string
}

export interface AppointmentPrescription {
  id: number
  /** 'generated' — the doctor filled the form; 'uploaded' — a sheet was attached. */
  source: 'generated' | 'uploaded'
  bp: string
  pulse: string
  weight: string
  height: string
  complaints: string
  allergies: string
  diagnosis: string
  advice: string
  medications: PrescribedMedication[]
  instructions: string
  follow_up: string
  /** The PDF or the attached file, whichever this one is. */
  document_url: string
  created_at: string
  updated_at: string
}

export interface DiagnosticTestRow {
  id: number
  name: string
  category_name?: string | null
  sample_type?: string
  test_kind?: string
}

export interface DiagnosticBooking {
  id: number
  patient_name?: string
  patient_age?: number | null
  patient_gender?: string
  patient_photo?: string
  patient_phone?: string
  patient_address?: string
  tests: DiagnosticTestRow[]
  kind: string
  visit_type: string
  status: string
  scheduled_date: string | null
  scheduled_time: string | null
  total_amount: string
  notes?: string
  reports: string[]
  created_at: string
}

/** What a centre is allowed to move a booking to — mirrors the backend's list. */
export const BOOKING_STATUS = Object.freeze({
  REQUESTED: 'requested',
  CONFIRMED: 'confirmed',
  SLOT_ALLOTTED: 'slot_allotted',
  PATIENT_ARRIVED: 'patient_arrived',
  SAMPLE_COLLECTED: 'sample_collected',
  TEST_DONE: 'test_done',
  IN_PROGRESS: 'in_progress',
  REPORT_GENERATED: 'report_generated',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
})

export const VISIT_TYPE = Object.freeze({
  AT_CENTRE: 'at_centre',
  AT_HOME: 'at_home',
})

/** A booking the centre has not answered yet. */
export const isBookingPending = (status: string) => status === BOOKING_STATUS.REQUESTED

/** Answered and still in hand — everything between accepted and finished. */
export const isBookingActive = (status: string) => ([
  BOOKING_STATUS.CONFIRMED,
  BOOKING_STATUS.SLOT_ALLOTTED,
  BOOKING_STATUS.PATIENT_ARRIVED,
  BOOKING_STATUS.SAMPLE_COLLECTED,
  BOOKING_STATUS.TEST_DONE,
  BOOKING_STATUS.IN_PROGRESS,
] as string[]).includes(status)
