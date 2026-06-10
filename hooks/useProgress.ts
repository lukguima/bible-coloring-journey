"use client";

import { useCallback } from "react";
import { useLocalStorage } from "./useLocalStorage";

interface ProgressState {
  completedStories: string[];
  completedGames: string[];
  earnedBadges: string[];
  lastActivity: string | null;
  coloringProgress: Record<string, Record<string, string>>;
}

const initialState: ProgressState = {
  completedStories: [],
  completedGames: [],
  earnedBadges: [],
  lastActivity: null,
  coloringProgress: {},
};

export function useProgress() {
  const [progress, setProgress, isLoaded] = useLocalStorage<ProgressState>(
    "bcj-progress",
    initialState
  );

  const completeStory = useCallback(
    (storyId: string) => {
      setProgress((prev) => {
        if (prev.completedStories.includes(storyId)) return prev;
        const updated = {
          ...prev,
          completedStories: [...prev.completedStories, storyId],
          lastActivity: new Date().toISOString(),
        };
        if (
          updated.completedStories.length >= 3 &&
          updated.completedGames.length >= 3 &&
          !updated.earnedBadges.includes("genesis-adventurer")
        ) {
          updated.earnedBadges = [...updated.earnedBadges, "genesis-adventurer"];
        }
        return updated;
      });
    },
    [setProgress]
  );

  const completeGame = useCallback(
    (gameId: string, badgeId?: string) => {
      setProgress((prev) => {
        const updatedGames = prev.completedGames.includes(gameId)
          ? prev.completedGames
          : [...prev.completedGames, gameId];

        const updatedBadges =
          badgeId && !prev.earnedBadges.includes(badgeId)
            ? [...prev.earnedBadges, badgeId]
            : prev.earnedBadges;

        const updated = {
          ...prev,
          completedGames: updatedGames,
          earnedBadges: updatedBadges,
          lastActivity: new Date().toISOString(),
        };

        if (
          updated.completedStories.length >= 3 &&
          updated.completedGames.length >= 3 &&
          !updated.earnedBadges.includes("genesis-adventurer")
        ) {
          updated.earnedBadges = [...updated.earnedBadges, "genesis-adventurer"];
        }

        return updated;
      });
    },
    [setProgress]
  );

  const unlockBadge = useCallback(
    (badgeId: string) => {
      setProgress((prev) => {
        if (prev.earnedBadges.includes(badgeId)) return prev;
        return {
          ...prev,
          earnedBadges: [...prev.earnedBadges, badgeId],
          lastActivity: new Date().toISOString(),
        };
      });
    },
    [setProgress]
  );

  const saveColoringProgress = useCallback(
    (pageId: string, colors: Record<string, string>) => {
      setProgress((prev) => ({
        ...prev,
        coloringProgress: {
          ...prev.coloringProgress,
          [pageId]: colors,
        },
      }));
    },
    [setProgress]
  );

  const getColoringProgress = useCallback(
    (pageId: string): Record<string, string> => {
      return progress.coloringProgress[pageId] || {};
    },
    [progress]
  );

  const getOverallProgress = useCallback(() => {
    const totalStories = 12;
    const totalGames = 5;
    const completed =
      progress.completedStories.length + progress.completedGames.length;
    const total = totalStories + totalGames;
    return Math.round((completed / total) * 100);
  }, [progress]);

  const resetProgress = useCallback(() => {
    setProgress(initialState);
  }, [setProgress]);

  const isStoryCompleted = useCallback(
    (storyId: string) => progress.completedStories.includes(storyId),
    [progress]
  );

  const isGameCompleted = useCallback(
    (gameId: string) => progress.completedGames.includes(gameId),
    [progress]
  );

  const hasBadge = useCallback(
    (badgeId: string) => progress.earnedBadges.includes(badgeId),
    [progress]
  );

  const hasCertificate = useCallback(() => {
    return (
      progress.completedStories.length >= 3 &&
      progress.completedGames.length >= 3
    );
  }, [progress]);

  return {
    progress,
    isLoaded,
    completeStory,
    completeGame,
    unlockBadge,
    saveColoringProgress,
    getColoringProgress,
    getOverallProgress,
    resetProgress,
    isStoryCompleted,
    isGameCompleted,
    hasBadge,
    hasCertificate,
    completedStories: progress.completedStories,
    completedGames: progress.completedGames,
    earnedBadges: progress.earnedBadges,
  };
}
