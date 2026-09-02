"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";

/**
 * Keeps an open board live without polling.
 *
 * The webhook at /api/sheets/changed bumps a single row in sync_state; this
 * subscribes to that row over Supabase Realtime and re-renders the server
 * components when it moves. One websocket per viewer, no request traffic while
 * nothing is changing.
 */
export function LiveRefresh() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    const debug = process.env.NODE_ENV !== "production";

    const channel = supabase
      .channel("dashboard-sync")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "sync_state" },
        (payload) => {
          if (debug) console.info("[live] sheet change received", payload.new);
          router.refresh();
        },
      )
      .subscribe((status) => {
        if (debug) console.info("[live] sync channel:", status);
      });

    // A tab that slept through a change catches up when it comes back.
    const onVisible = () => {
      if (document.visibilityState === "visible") router.refresh();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      supabase.removeChannel(channel);
    };
  }, [router]);

  return null;
}
