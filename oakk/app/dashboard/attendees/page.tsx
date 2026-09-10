"use client";

import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "../../../lib/supabase";
import type { Day3Attendee } from "../../../lib/types";

export default function AttendeesPage() {
  const [attendees, setAttendees] = useState<Day3Attendee[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchAttendees = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from("attendees")
      .select("*")
      .order("full_name");

    if (search.trim()) {
      const q = search.trim();
      query = query.or(
        `full_name.ilike.%${q}%,email.ilike.%${q}%,qr_code.ilike.%${q}%`
      );
    }

    const { data } = await query.limit(200);
    setAttendees((data as Day3Attendee[]) || []);
    setLoading(false);
  }, [search]);

  useEffect(() => {
    void (async () => { await fetchAttendees(); })();
  }, [fetchAttendees]);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
  };

  const getInitials = (name: string) =>
    name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  const avatarColors = [
    "bg-[#0F223D]", "bg-blue-600", "bg-indigo-600", "bg-violet-600",
    "bg-teal-600", "bg-emerald-600", "bg-cyan-600",
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Attendees</h1>
        <p className="text-sm text-gray-500 mt-1">Search and view all registered attendees</p>
      </div>

      {/* Search bar */}
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email, or QR code..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#0F223D] transition-all bg-white"
        />
      </div>

      {/* Attendee table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Name</th>
                <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Email</th>
                <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Accommodation</th>
                <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Status</th>
                <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Date</th>
                <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center">
                    <div className="w-6 h-6 border-2 border-gray-300 border-t-[#0F223D] rounded-full animate-spin mx-auto" />
                  </td>
                </tr>
              )}
              {!loading && attendees.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-sm text-gray-400">
                    No attendees found
                  </td>
                </tr>
              )}
              {attendees.map((a, i) => {
                const isCheckedIn = a.checked_in;
                const color = avatarColors[i % avatarColors.length];
                return (
                  <tr key={a.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-full ${color} text-white flex items-center justify-center text-[10px] font-bold shrink-0`}>
                          {getInitials(a.full_name)}
                        </div>
                        <span className="text-[13px] font-semibold text-gray-900">{a.full_name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-[12px] text-gray-600 font-mono">{a.email || "—"}</td>
                    <td className="px-5 py-3 text-[12px] text-gray-700">{a.organization || "—"}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                        isCheckedIn
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-gray-100 text-gray-500 border-gray-200"
                      }`}>
                        {isCheckedIn ? "Checked In" : "Not Checked In"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-[12px] text-gray-600">
                      {a.checked_in_at ? formatDate(a.checked_in_at) : "—"}
                    </td>
                    <td className="px-5 py-3 text-[12px] text-gray-600 font-mono">
                      {a.checked_in_at ? formatTime(a.checked_in_at) : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden divide-y divide-gray-50">
          {loading && (
            <div className="px-5 py-12 text-center">
              <div className="w-6 h-6 border-2 border-gray-300 border-t-[#0F223D] rounded-full animate-spin mx-auto" />
            </div>
          )}
          {!loading && attendees.length === 0 && (
            <div className="px-5 py-12 text-center text-sm text-gray-400">
              No attendees found
            </div>
          )}
          {attendees.map((a, i) => {
            const isCheckedIn = a.checked_in;
            const color = avatarColors[i % avatarColors.length];
            return (
              <div key={a.id} className="px-4 py-3 flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full ${color} text-white flex items-center justify-center text-[11px] font-bold shrink-0`}>
                  {getInitials(a.full_name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-gray-900 truncate">{a.full_name}</p>
                  <p className="text-[11px] text-gray-500 truncate">{a.email || "No email"}</p>
                  <p className="text-[11px] text-gray-500">{a.organization || "No organization"}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                    isCheckedIn
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-gray-100 text-gray-500 border-gray-200"
                  }`}>
                    {isCheckedIn ? "Checked In" : "Not Checked"}
                  </span>
                  {a.checked_in_at && (
                    <p className="text-[10px] text-gray-400 mt-0.5 font-mono">{formatTime(a.checked_in_at)}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <p className="text-xs text-gray-400 text-center">{attendees.length} attendee(s) shown</p>
    </div>
  );
}
