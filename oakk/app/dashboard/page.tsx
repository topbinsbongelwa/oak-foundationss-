"use client";

import React, { useState, useCallback } from "react";
import QRScanner from "../../components/dashboard/QRScanner";
import RecentCheckins from "../../components/dashboard/RecentCheckins";
import ManualCodeEntry from "../../components/dashboard/ManualCodeEntry";
import type { CheckInResult } from "../../lib/types";

export default function CheckInPage() {
  const [scanResult, setScanResult] = useState<CheckInResult | null>(null);
  const [scanKey, setScanKey] = useState(0);

  const handleScanResult = useCallback((result: CheckInResult) => {
    setScanResult(result);
    setScanKey((k) => k + 1);
  }, []);

  const resetScan = () => {
    setScanResult(null);
    setScanKey((k) => k + 1);
  };

  const getInitials = (name: string) =>
    name.split(" ").map((part) => part[0]).join("").toUpperCase().slice(0, 2);

  const formatTime = (timestamp?: string) => {
    if (!timestamp) return "09:34";
    return new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
  };

  const renderSuccess = () => {
    const attendee = scanResult?.attendee;
    const name = attendee?.full_name || "Attendee";

    return (
      <div className="space-y-2.5">
        <div className="relative overflow-hidden rounded-[12px] bg-[#16b889] px-3.5 py-3 text-white shadow-sm">
          <div className="absolute -right-7 -top-8 h-24 w-24 rounded-full bg-white/10" />
          <div className="relative flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/15">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <circle cx="12" cy="12" r="8.5" /><path strokeLinecap="round" strokeLinejoin="round" d="m8.5 12 2.2 2.2 4.8-5" />
              </svg>
            </div>
            <div>
              <p className="text-[11px] font-bold leading-tight">Checked In Successfully</p>
              <p className="mt-0.5 text-[7px] text-white/65">{formatTime(scanResult?.check_in?.checked_in_at)} • 9 March 2026</p>
            </div>
          </div>
        </div>

        <div className="rounded-[12px] bg-white p-3 shadow-sm ring-1 ring-gray-200/70">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#142c52] text-[9px] font-bold text-white">{getInitials(name)}</div>
            <div className="min-w-0">
              <p className="truncate text-[10px] font-bold text-[#17243a]">{name}</p>
              <p className="truncate text-[7px] text-gray-400">{attendee?.email || "Open Society Foundations"}</p>
              <span className="mt-1 inline-flex rounded-full bg-[#eef3fb] px-1.5 py-0.5 text-[6px] font-semibold text-[#38547d]">Partner</span>
            </div>
          </div>
          <div className="mt-2.5 grid grid-cols-2 gap-1 border-t border-gray-100 pt-2">
            <div className="rounded-lg bg-[#edf2f6] px-2 py-1.5">
              <p className="text-[5px] uppercase tracking-[0.12em] text-gray-400">Next session</p>
              <p className="mt-0.5 text-[7px] font-semibold text-gray-800">Opening Plenary</p>
            </div>
            <div className="rounded-lg bg-[#edf2f6] px-2 py-1.5">
              <p className="text-[5px] uppercase tracking-[0.12em] text-gray-400">Venue</p>
              <p className="mt-0.5 text-[7px] font-semibold text-gray-800">Main Hall A</p>
            </div>
          </div>
        </div>

        <div className="rounded-[12px] bg-white p-3 shadow-sm ring-1 ring-gray-200/70">
          <p className="text-[6px] uppercase tracking-[0.12em] text-gray-500">Live event status</p>
          <p className="mt-2 text-[7px] font-semibold text-gray-700"><span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />Opening Plenary starting at 09:30</p>
          <p className="mt-1 text-[6px] text-gray-400">74 of 110 attendees checked in · Main Hall A</p>
          <div className="mt-2 h-1 rounded-full bg-gray-200"><div className="h-1 w-[67%] rounded-full bg-[#2a4777]" /></div>
        </div>

        <button type="button" onClick={resetScan} className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#1c385f] px-3 py-2.5 text-[8px] font-semibold text-white shadow-sm transition-colors hover:bg-[#152e51] cursor-pointer">
          <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M4 8V5h3M20 8V5h-3M4 16v3h3M20 16v3h-3" /><path d="M8 12h8" /></svg>
          Scan Next Attendee
        </button>
      </div>
    );
  };

  const renderFailure = () => (
    <div className="space-y-2.5">
      <div className="relative overflow-hidden rounded-[12px] bg-[#f04449] px-3.5 py-3 text-white shadow-sm">
        <div className="absolute -right-7 -top-8 h-24 w-24 rounded-full bg-white/10" />
        <div className="relative flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/15"><svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><circle cx="12" cy="12" r="8.5" /><path strokeLinecap="round" d="m9 9 6 6m0-6-6 6" /></svg></div>
          <div><p className="text-[6px] uppercase tracking-[0.12em] text-white/65">Check-in failed</p><p className="mt-0.5 text-[11px] font-bold leading-tight">QR Not Recognised</p><p className="mt-0.5 text-[7px] text-white/65">Code is invalid or unregistered</p></div>
        </div>
      </div>
      <div className="rounded-[12px] bg-white p-3 shadow-sm ring-1 ring-gray-200/70">
        <p className="text-[8px] font-bold text-gray-700"><span className="mr-1 text-red-500">△</span>Possible reasons</p>
        <ul className="mt-2 space-y-1.5 text-[7px] text-gray-500">
          <li><span className="mr-1.5 text-red-400">●</span>QR code belongs to a different event</li>
          <li><span className="mr-1.5 text-red-400">●</span>Registration was not completed</li>
          <li><span className="mr-1.5 text-red-400">●</span>Code has been altered or corrupted</li>
          <li><span className="mr-1.5 text-red-400">●</span>Attendee registered under a different email</li>
        </ul>
      </div>
      <button type="button" onClick={resetScan} className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#1c385f] px-3 py-2.5 text-[8px] font-semibold text-white shadow-sm transition-colors hover:bg-[#152e51] cursor-pointer"><span className="text-[11px]">↻</span> Try Again</button>
      <button type="button" className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-white px-3 py-2.5 text-[8px] font-semibold text-gray-700 shadow-sm ring-1 ring-gray-200 cursor-pointer">
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M4 7.5A2.5 2.5 0 0 1 6.5 5h11A2.5 2.5 0 0 1 20 7.5v9A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5v-9Z" />
          <path d="m5 7 7 5 7-5" />
        </svg>
        Contact Coordination Team
      </button>
    </div>
  );

  return (
    <div className={`w-full ${scanResult ? "max-w-[342px]" : "max-w-[266px]"} mx-auto space-y-2`}>
      {/* Page header */}
      {!scanResult && (
        <div>
          <h1 className="text-[13px] font-bold text-gray-900 tracking-tight">Event Check-In</h1>
          <p className="text-[8px] text-gray-500 mt-0.5">Scan an attendee QR code to check them in</p>
        </div>
      )}

      {scanResult ? (scanResult.success ? renderSuccess() : renderFailure()) : (
        <>
          <div key={scanKey}><QRScanner onScanResult={handleScanResult} /></div>
          <RecentCheckins />
          <ManualCodeEntry onScanResult={handleScanResult} />
        </>
      )}
    </div>
  );
}
