"use client";

import { useCallback } from "react";
import { useLocalStorage } from "./useLocalStorage";
import type { AnalyticsEvent } from "@/types";

export function useAnalytics() {
  const [events, setEvents] = useLocalStorage<AnalyticsEvent[]>("bcj_analytics_events", []);

  const trackEvent = useCallback((eventName: string, metadata: Record<string, unknown> = {}) => {
    const event: AnalyticsEvent = {
      id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      eventName,
      metadata,
      createdAt: new Date().toISOString(),
    };
    setEvents((prev) => [...prev.slice(-499), event]);
  }, [setEvents]);

  const getEventCount = useCallback((name: string) => {
    return events.filter((e) => e.eventName === name).length;
  }, [events]);

  const getMetrics = useCallback(() => ({
    freeAdventureStarts: getEventCount("start_free_adventure_clicked"),
    unlockClicks: getEventCount("unlock_clicked"),
    storiesCompleted: getEventCount("story_completed"),
    gamesCompleted: getEventCount("game_completed"),
    printableDownloads: getEventCount("printable_download_clicked"),
    waitlistSubmissions: getEventCount("waitlist_submitted"),
    totalEvents: events.length,
  }), [events, getEventCount]);

  const clearEvents = useCallback(() => setEvents([]), [setEvents]);

  return { events, trackEvent, getEventCount, getMetrics, clearEvents };
}
