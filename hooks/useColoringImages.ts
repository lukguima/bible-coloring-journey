"use client";

import { useState, useEffect } from "react";

const KEY = "bcj_coloring_images";

export function useColoringImages() {
  const [images, setImages] = useState<Record<string, string>>({});
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setImages(JSON.parse(raw));
    } catch {}
    setIsLoaded(true);
  }, []);

  const setImage = (pageId: string, dataUrl: string) => {
    const next = { ...images, [pageId]: dataUrl };
    setImages(next);
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
  };

  const removeImage = (pageId: string) => {
    const next = { ...images };
    delete next[pageId];
    setImages(next);
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
  };

  const getImage = (pageId: string): string | undefined => images[pageId];

  return { images, setImage, removeImage, getImage, isLoaded };
}
