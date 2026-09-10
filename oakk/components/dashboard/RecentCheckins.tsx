"use client";

import React, { useEffect, useState, useCallback } from "react";
import { supabase } from "../../lib/supabase";
import type { Day3Attendee } from "../../lib/types";

export default function RecentCheckins() {
  const [checkins, setCheckins] = useState<Day3Attendee[]>([]);

  const fetchRecent = useCallback(async () => {
    const { data } = await supabase
      .from("attendees")
      .select("*")
      .eq("checked_in", true)
      .order("checked_in_at", { ascending: false })
      .limit(20);

    if (data) setCheckins(data as Day3Attendee[]);
  }, []);

  useEffect(() => {
    void (async () => { await fetchRecent(); })();

    const channel = supabase
      .channel("recent-checkins-realtime")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "attendees" }, (payload) => {
        if (payload.new.checked_in) void fetchRecent();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchRecent]);

  const getInitials = (name: string) => {
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const avatarColors = [
    "bg-[#0F223D]", "bg-blue-600", "bg-indigo-600", "bg-violet-600",
    "bg-teal-600", "bg-emerald-600", "bg-cyan-600",
  ];

  return (
    <div className="bg-white rounded-[9px] border border-gray-200 shadow-sm">
      <div className="px-2.5 pt-2.5 pb-1.5">
        <h3 className="text-[7px] font-bold text-gray-500 uppercase tracking-[0.12em]">Simulate QR Scan</h3>
      </div>
      <div className="px-2 pb-2 space-y-1">
        {checkins.map((attendee, i) => {
          const name = attendee.full_name || "Unknown";
          const color = avatarColors[i % avatarColors.length];
          return (
            <div key={attendee.id} className="px-1 py-1 flex items-center gap-1.5 border border-gray-100 rounded-md">
              <div className={`w-4 h-4 rounded-full ${color} text-white flex items-center justify-center text-[5px] font-bold shrink-0`}>
                {getInitials(name)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[7px] font-semibold text-gray-900 truncate">{name}</p>
                <p className="text-[5px] text-gray-400 font-mono">
                  {attendee.organization || "No organization"}
                </p>
              </div>
              <div className="text-right shrink-0">
                <span className={`inline-flex items-center px-1 py-0.5 rounded-full text-[5px] font-semibold ${i === 1 ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : i === 2 ? "bg-orange-50 text-orange-600 border border-orange-200" : "bg-blue-50 text-blue-700 border border-blue-200"}`}>
                  {attendee.role || "Attendee"}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
