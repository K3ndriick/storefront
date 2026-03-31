// ============================================================
// APPOINTMENT TYPES
// ============================================================

export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled'

// ============================================================
// SERVICE
// Mirrors the services table.
// ============================================================

export type Service = {
  id: string
  name: string
  description: string | null
  duration_minutes: number
  price: number
  active: boolean
  created_at: string
}

// ============================================================
// APPOINTMENT
// Mirrors the appointments table exactly.
// Used when we need the raw row without any joins.
// ============================================================

export type Appointment = {
  id: string

  user_id: string
  service_id: string

  appointment_date: string   // 'YYYY-MM-DD'
  appointment_time: string   // 'HH:MM:SS'
  end_time: string           // 'HH:MM:SS'
  duration_minutes: number

  status: AppointmentStatus

  customer_name: string
  customer_email: string
  customer_phone: string

  equipment_type: string | null
  equipment_brand: string | null
  issue_description: string | null

  admin_notes: string | null

  created_at: string
  updated_at: string
  confirmed_at: string | null
  completed_at: string | null
}

// ============================================================
// APPOINTMENT WITH SERVICE
// The joined shape returned to the UI - service name, price,
// and duration come from the services table.
// Used on the dashboard appointments page and admin list.
// ============================================================

export type AppointmentWithService = Appointment & {
  services: Pick<Service, 'name' | 'price' | 'duration_minutes'>
}

// ============================================================
// INPUT TYPES
// ============================================================

export type CreateAppointmentInput = {
  service_id: string
  appointment_date: string   // 'YYYY-MM-DD'
  appointment_time: string   // 'HH:MM'
  customer_name: string
  customer_email: string
  customer_phone: string
  equipment_type?: string
  equipment_brand?: string
  issue_description?: string
}
