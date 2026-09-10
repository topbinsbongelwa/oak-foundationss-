"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { label: "Check In", href: "/dashboard", icon: "scan" },
  { label: "Programme", href: "/dashboard/attendees", icon: "calendar" },
  { label: "Partners", href: "/dashboard/export", icon: "users" },
  { label: "Attendance", href: "/dashboard/attendees", icon: "grid" },
];

type NavIconName = (typeof NAV_ITEMS)[number]["icon"];

function NavIcon({ name }: { name: NavIconName }) {
  const paths: Record<NavIconName, React.ReactNode> = {
    scan: <><path d="M4 8V5a1 1 0 0 1 1-1h3" /><path d="M16 8V5a1 1 0 0 0-1-1h-3" /><path d="M4 12v3a1 1 0 0 0 1 1h3" /><path d="M16 12v3a1 1 0 0 1-1 1h-3" /><path d="M7 10h6" /></>,
    calendar: <><rect x="3.5" y="4.5" width="13" height="12" rx="1.5" /><path d="M6.5 3.5v3M13.5 3.5v3M3.5 8h13" /></>,
    users: <><circle cx="8" cy="8" r="2.5" /><path d="M3.5 15c.4-2 1.9-3 4.5-3s4.1 1 4.5 3M13 6.2a2.5 2.5 0 0 1 0 4.6M14 12c1.8.2 2.8 1.2 3 3" /></>,
    grid: <><rect x="3.5" y="3.5" width="4" height="4" rx=".5" /><rect x="10.5" y="3.5" width="4" height="4" rx=".5" /><rect x="3.5" y="10.5" width="4" height="4" rx=".5" /><rect x="10.5" y="10.5" width="4" height="4" rx=".5" /></>,
  };

  return (
    <svg className="w-3 h-3 shrink-0" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[name]}
    </svg>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="px-2 pt-3 pb-5">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/oak-logo.svg" alt="OAK Foundation" className="h-7 w-auto" />
        </Link>
        <div className="mt-2 px-0.5">
          <p className="text-[7px] font-semibold text-gray-900 leading-tight uppercase tracking-wide">Partner Convening 2026</p>
        </div>
      </div>

      <nav className="flex-1 px-2 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-1.5 px-2 py-2 rounded-md text-[7px] font-medium transition-all ${
                active
                  ? "bg-[#0F223D] text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              <span className={active ? "text-white" : "text-gray-400"}>
                <NavIcon name={item.icon} />
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-2 pb-2 mt-auto">
        <div className="flex items-center gap-1.5 px-1">
          <div className="w-3.5 h-3.5 rounded-full bg-[#e8eef4] text-[#9aabba] flex items-center justify-center shrink-0">
            <svg className="w-2 h-2" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M10 17s5-4.5 5-9a5 5 0 1 0-10 0c0 4.5 5 9 5 9Z" />
              <circle cx="10" cy="8" r="1.5" />
            </svg>
          </div>
          <div className="min-w-0 leading-tight">
            <p className="text-[6px] font-semibold text-gray-700 truncate">Harare, Zimbabwe</p>
            <p className="text-[5px] text-gray-400 mt-0.5">11-14 March 2026</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button
        type="button"
        onClick={() => setMobileOpen(!mobileOpen)}
        className="hidden"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          {mobileOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          )}
        </svg>
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className="fixed top-0 left-0 z-40 h-screen w-[116px] bg-white border-r border-gray-200 flex flex-col"
      >
        {sidebarContent}
      </aside>
    </>
  );
}
