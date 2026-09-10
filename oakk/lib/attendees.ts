import { supabase } from "./supabase";

export interface SupabaseAttendee {
  id: string;
  full_name: string;
  email: string;
  organization: string | null;
  role: string | null;
  phone: string | null;
  pass_code: string;
  qr_code: string;
  consent: boolean;
  checked_in: boolean;
  checked_in_at: string | null;
  created_at: string;
}

export async function findAttendee(qrCode: string): Promise<SupabaseAttendee | null> {
  const { data, error } = await supabase
    .from("attendees")
    .select("*")
    .eq("qr_code", qrCode)
    .maybeSingle();

  if (error) throw error;
  return data as SupabaseAttendee | null;
}

export async function checkInAttendee(attendee: SupabaseAttendee) {
  if (attendee.checked_in) {
    return { success: false, message: "Already checked in", attendee };
  }

  const { data, error } = await supabase
    .from("attendees")
    .update({ checked_in: true, checked_in_at: new Date().toISOString() })
    .eq("id", attendee.id)
    .eq("checked_in", false)
    .select("*")
    .maybeSingle();

  if (error) throw error;
  if (data) {
    return { success: true, message: "Check-in successful", attendee: data as SupabaseAttendee };
  }

  const current = await findAttendee(attendee.qr_code);
  if (current?.checked_in) {
    return { success: false, message: "Already checked in", attendee: current };
  }

  return { success: false, message: "Check-in failed", attendee };
}

export async function getCheckedInCount(): Promise<number> {
  const { count, error } = await supabase
    .from("attendees")
    .select("id", { count: "exact", head: true })
    .eq("checked_in", true);

  if (error) throw error;
  return count ?? 0;
}

export async function registerAttendee(attendee: {
  full_name: string;
  email: string;
  organization?: string;
  role?: string;
  phone?: string;
}): Promise<SupabaseAttendee> {
  const passCode = crypto.randomUUID();

  const { data, error } = await supabase
    .from("attendees")
    .insert({
      full_name: attendee.full_name,
      email: attendee.email,
      organization: attendee.organization,
      role: attendee.role,
      phone: attendee.phone,
      pass_code: passCode,
      qr_code: passCode,
      consent: true,
      checked_in: false,
    })
    .select()
    .single();

  if (error) {
    console.error(error);
    throw error;
  }

  return data as SupabaseAttendee;
}
