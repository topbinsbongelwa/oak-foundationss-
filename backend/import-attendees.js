const fs = require("fs");
const crypto = require("crypto");
const path = require("path");
const dotenv = require("dotenv");
const supabase = require("./supabaseClient");

dotenv.config({ path: path.join(__dirname, ".env") });

function parseCsv(source) {
  const rows = [];
  let row = [];
  let value = "";
  let quoted = false;

  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];
    const next = source[index + 1];
    if (char === '"' && quoted && next === '"') {
      value += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      row.push(value.trim());
      value = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(value.trim());
      if (row.some(Boolean)) rows.push(row);
      row = [];
      value = "";
    } else {
      value += char;
    }
  }

  if (value || row.length) {
    row.push(value.trim());
    rows.push(row);
  }

  if (rows.length === 0) return [];
  const headers = rows.shift().map((header) => header.replace(/^\uFEFF/, "").toLowerCase());
  return rows.map((values, rowIndex) => {
    const record = Object.fromEntries(headers.map((header, index) => [header, values[index] || ""]));
    if (!record.full_name || !record.email) {
      throw new Error(`Row ${rowIndex + 2} must include full_name and email`);
    }
    return record;
  });
}

async function main() {
  const csvPath = process.argv[2];
  if (!csvPath) throw new Error("Usage: node import-attendees.js <path-to.csv>");

  const records = parseCsv(fs.readFileSync(path.resolve(csvPath), "utf8"));
  const attendees = records.map((record) => {
    const code = crypto.randomUUID();
    return {
      full_name: record.full_name,
      email: record.email.toLowerCase(),
      organization: record.organization || null,
      role: record.role || null,
      phone: record.phone || null,
      pass_code: code,
      qr_code: code,
      consent: true,
      checked_in: false,
      checked_in_at: null,
    };
  });

  const { data, error } = await supabase
    .from("attendees")
    .upsert(attendees, { onConflict: "email", ignoreDuplicates: true })
    .select("id,email,pass_code,qr_code");

  if (error) throw error;
  console.log(`Imported ${data?.length || 0} new attendee(s); existing emails were skipped.`);
}

main().catch((error) => {
  console.error("Import failed:", error.message);
  process.exitCode = 1;
});