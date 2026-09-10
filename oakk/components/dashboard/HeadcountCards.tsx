"use client";

import React, { useEffect, useState, useCallback } from "react";
import { supabase } from "../../lib/supabase";
import type { HeadcountData } from "../../lib/types";

export default function HeadcountCards() {
  const [data, setData] = useState<HeadcountData>({ totalRegistered: 0, checkedInToday: 0, remaining: 0 });
  const today = new Date().toISOString().split("T")[0];

  const fetchHeadcount = useCallback(async () => {
    const [totalRes, checkedRes] = await Promise.all([
      supabase.from("attendees").select("id", { count: "exact", head: true }),
      supabase.from("attendees").select("id", { count: "exact", head: true }).eq("checked_in", true),
    ]);

    const total = totalRes.count ?? 0;
    const checked = checkedRes.count ?? 0;
    setData({ totalRegistered: total, checkedInToday: checked, remaining: total - checked });
  }, [today]);

  useEffect(() => {
    void (async () => { await fetchHeadcount(); })();

    const channel = supabase
      .channel("headcount-realtime")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "attendees" }, () => {
        fetchHeadcount();
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "attendees" }, () => {
        fetchHeadcount();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchHeadcount]);

  const cards = [
    { label: "Total Registered", value: data.totalRegistered, color: "text-[#0F223D]", bg: "bg-blue-50", border: "border-blue-100" },
    { label: "Checked In Today", value: data.checkedInToday, color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-100" },
    { label: "Remaining", value: data.remaining, color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-100" },
  ];

  return (
    <div className="grid grid-cols-3 gap-3 sm:gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`${card.bg} border ${card.border} rounded-xl p-3 sm:p-4 text-center`}
        >
          <p className={`text-2xl sm:text-3xl font-extrabold ${card.color} tabular-nums`}>
            {card.value}
          </p>
          <p className="text-[10px] sm:text-[11px] font-semibold text-gray-600 uppercase tracking-wider mt-1">
            {card.label}
          </p>
        </div>
      ))}
    </div>
  );
}
