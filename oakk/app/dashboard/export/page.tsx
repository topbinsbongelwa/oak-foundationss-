"use client";

import React, { useState, useCallback } from "react";
import { supabase } from "../../../lib/supabase";
import type { Day3Attendee } from "../../../lib/types";

export default function ExportPage() {
  const [loading, setLoading] = useState(false);
  const [row_count, setRowCount] = useState<number | null>(null);

  const today = new Date().toISOString().split("T")[0];

  const exportCSV = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from("attendees")
        .select("*")
        .order("full_name")
        .limit(10000);

      if (!data || data.length === 0) {
        alert("No attendee data found to export.");
        setLoading(false);
        return;
      }

      const rows = data as Day3Attendee[];

      const csvHeader = "Name,Email,Organization,Role,Check-in Date,Check-in Time,Status";
      const csvRows = rows.map((a) => {
        const name = `"${(a.full_name || "").replace(/"/g, '""')}"`;
        const email = `"${a.email.replace(/"/g, '""')}"`;
        const organization = `"${(a.organization || "").replace(/"/g, '""')}"`;
        const role = `"${(a.role || "").replace(/"/g, '""')}"`;
        const date = a.checked_in_at ? new Date(a.checked_in_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "";
        const time = a.checked_in_at ? new Date(a.checked_in_at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }) : "";
        const status = a.checked_in ? "Checked In" : "Not Checked In";
        return `${name},${email},${organization},${role},${date},${time},${status}`;
      });

      const csvContent = [csvHeader, ...csvRows].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `OAK_Attendance_Export_${today}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      setRowCount(rows.length);
    } catch {
      alert("Failed to export data.");
    } finally {
      setLoading(false);
    }
  }, [today]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Export Data</h1>
        <p className="text-sm text-gray-500 mt-1">Export accommodation and check-in information to CSV</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
        <div className="max-w-md">
          <h2 className="text-base font-bold text-gray-900 mb-2">CSV Export</h2>
          <p className="text-sm text-gray-500 mb-6">
            Download a CSV file containing all registered attendees with their accommodation details
            and today&apos;s check-in status. This is useful for the accommodation team to track arrivals.
          </p>

          <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 mb-6">
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Export contains:</p>
            <ul className="space-y-1.5 text-xs text-gray-700">
              <li className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-gray-400" /> Full Name
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-gray-400" /> Email Address
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-gray-400" /> Accommodation
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-gray-400" /> Check-in Date
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-gray-400" /> Check-in Time
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-gray-400" /> Check-in Status
              </li>
            </ul>
          </div>

          <button
            type="button"
            onClick={exportCSV}
            disabled={loading}
            className="w-full py-3 px-4 bg-[#0F223D] hover:bg-[#1A365D] text-white text-sm font-semibold rounded-xl shadow-sm transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Exporting...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                Download CSV
              </>
            )}
          </button>

          {row_count !== null && (
            <p className="text-xs text-emerald-600 text-center mt-3">
              Successfully exported {row_count} attendee record(s)
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
