"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { checkInAttendee, findAttendee } from "../../lib/attendees";
import type { CheckInResult } from "../../lib/types";

interface QRScannerProps {
  onScanResult: (result: CheckInResult) => void;
  onScanStart?: () => void;
}

type ScannerState = "idle" | "requesting" | "scanning" | "reading" | "error" | "no-camera";

export default function QRScanner({ onScanResult, onScanStart }: QRScannerProps) {
  const [state, setState] = useState<ScannerState>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [lastScan, setLastScan] = useState<string | null>(null);
  const scannerRef = useRef<InstanceType<typeof import("html5-qrcode").Html5Qrcode> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cooldownRef = useRef(false);

  const processCode = useCallback(async (decodedText: string) => {
    if (cooldownRef.current) return;
    cooldownRef.current = true;
    setLastScan(decodedText);

    try {
      const attendee = await findAttendee(decodedText);

      if (!attendee) {
        onScanResult({ success: false, message: "Attendee not found" });
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
      setTimeout(() => {
        cooldownRef.current = false;
        setLastScan(null);
      }, 3000);
    }
  }, [onScanResult]);

  const startScanner = useCallback(async () => {
    setState("requesting");
    setErrorMsg("");
    onScanStart?.();

    try {
      const { Html5Qrcode } = await import("html5-qrcode");

      if (scannerRef.current) {
        try { await scannerRef.current.stop(); } catch {}
        try { scannerRef.current.clear(); } catch {}
      }

      const scanner = new Html5Qrcode("qr-scanner-region");
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
            const size = Math.min(viewfinderWidth, viewfinderHeight) * 0.7;
            return { width: size, height: size };
          },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          processCode(decodedText);
        },
        () => {}
      );

      setState("scanning");
    } catch (err: unknown) {
      const msg = typeof err === "string" ? err : err instanceof Error ? err.message : "";

      if (msg.includes("Permission") || msg.includes("permission") || msg.includes("NotAllowed")) {
        setState("error");
        setErrorMsg("Camera permission denied. Please allow camera access in your browser settings and try again.");
      } else if (msg.includes("NotFoundError") || msg.includes("no camera") || msg.includes("DevicesNotFound")) {
        setState("no-camera");
        setErrorMsg("No camera found on this device.");
      } else {
        setState("error");
        setErrorMsg(msg || "Failed to start camera. Please try again.");
      }
    }
  }, [processCode, onScanStart]);

  const scanFromGallery = useCallback(async (file: File) => {
    setState("reading");
    setErrorMsg("");

    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const scanner = scannerRef.current ?? new Html5Qrcode("qr-scanner-region");
      scannerRef.current = scanner;
      const decodedText = await scanner.scanFile(file, true);
      await processCode(decodedText);
      scanner.clear();
    } catch {
      setState("error");
      setErrorMsg("No QR code was found in that image. Try another photo.");
    }
  }, [processCode]);

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        try { scannerRef.current.stop(); } catch {}
        try { scannerRef.current.clear(); } catch {}
      }
    };
  }, []);

  return (
    <div
      className="w-full bg-[#111927] rounded-[9px] overflow-hidden shadow-md"
      onClick={state === "idle" ? startScanner : undefined}
    >
      <div className="relative w-full aspect-[0.9] bg-[#111927] overflow-hidden">
        <div
          ref={containerRef}
          id="qr-scanner-region"
          className="w-full h-full [&>div]:!w-full [&>div]:!h-full [&_video]:!object-cover [&_video]:!w-full [&_video]:!h-full [&_img]:!hidden"
        />

        {/* Scan brackets overlay */}
        {(state === "scanning" || state === "idle") && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="relative w-[34%] aspect-square min-w-[150px] max-w-[280px]">
              {/* Top-left */}
              <div className="absolute top-0 left-0 w-7 h-7 border-t border-l border-white/70 rounded-tl-md" />
              {/* Top-right */}
              <div className="absolute top-0 right-0 w-7 h-7 border-t border-r border-white/70 rounded-tr-md" />
              {/* Bottom-left */}
              <div className="absolute bottom-0 left-0 w-7 h-7 border-b border-l border-white/70 rounded-bl-md" />
              {/* Bottom-right */}
              <div className="absolute bottom-0 right-0 w-7 h-7 border-b border-r border-white/70 rounded-br-md" />

              {/* Scanning line animation */}
              {state === "scanning" && (
                <div className="absolute inset-x-0 top-0 bottom-0 overflow-hidden">
                  <div className="absolute inset-x-2 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent scan-line" />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Requesting permission */}
        {state === "requesting" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0C1D36]/80">
            <div className="w-12 h-12 border-2 border-white/20 border-t-white/80 rounded-full animate-spin mb-4" />
            <p className="text-white/70 text-sm font-medium">Requesting camera access...</p>
          </div>
        )}

        {/* Gallery image */}
        {state === "reading" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0C1D36]/90">
            <div className="w-12 h-12 border-2 border-white/20 border-t-white/80 rounded-full animate-spin mb-4" />
            <p className="text-white/70 text-sm font-medium">Reading QR code...</p>
          </div>
        )}

        {/* Error state */}
        {state === "error" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0C1D36]/90 px-8">
            <div className="w-14 h-14 rounded-full bg-red-500/20 flex items-center justify-center mb-4">
              <svg className="w-7 h-7 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <p className="text-white/90 text-sm font-medium text-center mb-4">{errorMsg}</p>
            <button
              type="button"
              onClick={startScanner}
              className="px-5 py-2.5 bg-white text-[#0F223D] text-sm font-semibold rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
            >
              Try Again
            </button>
          </div>
        )}

        {/* No camera */}
        {state === "no-camera" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0C1D36]/90 px-8">
            <div className="w-14 h-14 rounded-full bg-yellow-500/20 flex items-center justify-center mb-4">
              <svg className="w-7 h-7 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
              </svg>
            </div>
            <p className="text-white/90 text-sm font-medium text-center mb-2">{errorMsg}</p>
            <p className="text-white/50 text-xs text-center">Use manual code entry below</p>
          </div>
        )}

        {/* Last scanned code indicator */}
        {lastScan && (
          <div className="absolute top-3 left-3 right-3 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-1.5 text-center">
            <p className="text-white text-xs font-mono truncate">Scanned: {lastScan}</p>
          </div>
        )}
      </div>

      {/* Scanner status */}
      <div className="relative -mt-10 px-3 pb-3 pointer-events-none">
        <div className="flex items-center gap-2">
          {(state === "scanning" || state === "idle") && (
            <>
              <span className="w-2 h-2 rounded-full bg-white/40 animate-pulse" />
              <p className="text-white/35 text-[7px]">Hold camera steady. Auto-scans in 1-2 seconds</p>
            </>
          )}
          {state === "requesting" && (
            <p className="text-white/40 text-[10px]">Waiting for camera permission...</p>
          )}
          {(state === "error" || state === "no-camera") && (
            <p className="text-white/40 text-[10px]">Use manual code entry below</p>
          )}
        </div>
      </div>

      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (file) scanFromGallery(file);
        }}
      />
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          galleryInputRef.current?.click();
        }}
        className="w-full mt-3 flex items-center justify-center gap-1.5 px-3 py-2 text-[10px] font-medium text-white/75 hover:text-white transition-colors cursor-pointer"
      >
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="m21 15-5-5L5 21" />
        </svg>
        Scan QR from gallery
      </button>
    </div>
  );
}
