"use client";

import { useState, useEffect } from "react";

const STORAGE_KEY = "mockapi:ids";

export function useLocalMocks() {
  const [mockIds, setMockIds] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setMockIds(JSON.parse(stored));
    } catch {}
    setHydrated(true);
  }, []);

  const persist = (ids: string[]) => {
    setMockIds(ids);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    } catch {}
  };

  const addMockId = (id: string) => {
    persist([id, ...mockIds.filter((x) => x !== id)]);
  };

  const removeMockId = (id: string) => {
    persist(mockIds.filter((x) => x !== id));
  };

  return { mockIds, addMockId, removeMockId, hydrated };
}
