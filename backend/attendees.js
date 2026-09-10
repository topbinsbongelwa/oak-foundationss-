const crypto = require("crypto");
const supabase = require("./supabaseClient");
const { validateAttendee } = require("./validation");

async function registerAttendee(attendee) {
  const errors = validateAttendee(attendee);

  if (errors.length > 0) {
    return { success: false, errors };
  }

  const passCode = crypto.randomUUID();

  const fullName = [attendee.first_name, attendee.last_name]
    .filter(Boolean)
    .join(" ")
    .trim();

  const attendeeData = {
    full_name: fullName,
    email: attendee.email?.trim().toLowerCase() || null,
    organization: attendee.organization || null,
    role: attendee.role || null,
    phone: attendee.phone || null,
    pass_code: passCode,
    qr_code: passCode,
    consent: true,
    checked_in: false,
    checked_in_at: null,
  };

  const { data, error } = await supabase
    .from("attendees")
    .insert([attendeeData])
    .select()
    .single();

  if (error) {
    console.error("[REGISTRATION] Registration error:", error.message);
    return { success: false, error: error.message };
  }

  return { success: true, attendee: data, qr_code: passCode };
}

async function getAttendeeById(id) {
  const { data, error } = await supabase
    .from("attendees")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, attendee: data };
}

async function getAttendeeByUniqueId(uniqueId) {
  const { data, error } = await supabase
    .from("attendees")
    .select("*")
    .eq("qr_code", uniqueId)
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, attendee: data };
}

async function checkInAttendee(uniqueId) {
  const { data: attendee, error: findError } = await supabase
    .from("attendees")
    .select("*")
    .eq("qr_code", uniqueId)
    .single();

  if (findError || !attendee) {
    return { success: false, error: "Attendee not found" };
  }

  if (attendee.checked_in) {
    return { success: false, message: "Already checked in", attendee };
  }

  const { data: updated, error: updateError } = await supabase
    .from("attendees")
    .update({
      checked_in: true,
      checked_in_at: new Date().toISOString(),
    })
    .eq("id", attendee.id)
    .eq("checked_in", false)
    .select("*")
    .single();

  if (updateError) {
    return { success: false, error: updateError.message };
  }

  if (!updated) {
    return { success: false, message: "Already checked in", attendee };
  }

  return { success: true, message: "Check-in successful", attendee: updated };
}

async function getCheckedInCount() {
  const { count, error } = await supabase
    .from("attendees")
    .select("id", { count: "exact", head: true })
    .eq("checked_in", true);

  if (error) throw error;
  return count ?? 0;
}

module.exports = {
  registerAttendee,
  getAttendeeById,
  getAttendeeByUniqueId,
  checkInAttendee,
  getCheckedInCount,
};
