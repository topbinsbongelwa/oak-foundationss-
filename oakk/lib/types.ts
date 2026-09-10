export interface AttendeeRegistration {
  id: string;
  passCode: string;
  firstName: string;
  lastName: string;
  organisation: string;
  subPartner?: string;
  role: string;
  email: string;
  phone?: string;
  dietary?: string;
  accessibility?: string;
  travel?: string;
  consentAgreed: boolean;
  registeredAt: string;
}

export interface FormErrors {
  firstName?: string;
  lastName?: string;
  organisation?: string;
  role?: string;
  email?: string;
  phone?: string;
  consentAgreed?: string;
}

export const ROLE_OPTIONS = [
  "Partner",
  "OAK Staff",
  "Coordination Team",
  "Speaker",
  "Panelist",
  "Observer / Guest",
] as const;

export const EVENT_DETAILS = {
  title: "Partner Convening 2026",
  organization: "OAK Foundation",
  location: "Harare, Zimbabwe",
  venue: "Cresta Lodge, Msasa",
  dates: "9–11 March 2026",
  stats: {
    attendees: "110+",
    sessions: "24",
    partners: "38",
  },
};

// ============================================================
// Day 3: Event Check-In Types
// ============================================================

export interface Day3Attendee {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  organization: string | null;
  role: string | null;
  pass_code: string;
  qr_code: string;
  consent: boolean;
  checked_in: boolean;
  checked_in_at: string | null;
  created_at: string;
}

export interface CheckIn {
  id: string;
  attendee_id: string;
  check_in_date: string;
  checked_in_at: string;
  checked_in_by: string | null;
}

export interface CheckInWithAttendee extends CheckIn {
  attendees: Day3Attendee;
}

export interface AdminUser {
  id: string;
  user_id: string;
  role: string;
  created_at: string;
}

export interface CheckInResult {
  success: boolean;
  message: string;
  check_in?: { checked_in_at: string };
  attendee?: {
    id: string;
    full_name: string;
    email: string;
    organization: string | null;
    role: string | null;
    qr_code: string;
    checked_in: boolean;
    checked_in_at: string | null;
  };
}

export interface HeadcountData {
  totalRegistered: number;
  checkedInToday: number;
  remaining: number;
}
