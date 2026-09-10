"use client";

import React, { useState } from "react";
import { checkInAttendee, findAttendee } from "../../lib/attendees";
import type { CheckInResult } from "../../lib/types";

interface ManualCodeEntryProps {
  onScanResult: (result: CheckInResult) => void;
}

export default function ManualCodeEntry({ onScanResult }: ManualCodeEntryProps) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCheckIn = async () => {
    const trimmed = code.trim();
    if (!trimmed) return;

    setLoading(true);
    try {
      const attendee = await findAttendee(trimmed);

      if (!attendee) {
        onScanResult({ success: false, message: "Attendee not found" });
        setLoading(false);
        return;
      }

      const result = await checkInAttendee(attendee);
      onScanResult({
        success: result.success,
        message: result.message,
        attendee: result.attendee,
        check_in: result.attendee.checked_in_at
          ? { checked_in_at: result.attendee.checked_in_at }
          : undefined,
      } as CheckInResult);
    } catch {
      onScanResult({ success: false, message: "An unexpected error occurred" });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleCheckIn();
  };

  return (
    <div className="bg-white rounded-[9px] border border-gray-200 shadow-sm p-2.5">
      <h3 className="text-[7px] font-bold text-gray-500 uppercase tracking-[0.12em] mb-1">Manual Code Entry</h3>
      <div className="flex gap-1">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="OAK-2026-XXXX-XXXX"
          className="flex-1 min-w-0 px-2 py-2 rounded-md border-0 bg-[#eef2f6] text-[8px] font-mono text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-100 transition-all"
          disabled={loading}
        />
        <button
          type="button"
          onClick={handleCheckIn}
          disabled={loading || !code.trim()}
          className="px-3 py-2 bg-[#102a50] hover:bg-[#1A365D] text-white text-[8px] font-semibold rounded-md shadow-sm transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
        >
          {loading ? (
            <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          Check
        </button>
      </div>
    </div>
  );
}
