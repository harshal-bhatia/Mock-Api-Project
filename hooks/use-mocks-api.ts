"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Mock, RequestLog } from "@/lib/types";

export interface CreateMockPayload {
  description?: string;
  inputMode: "plain" | "schema";
  schemaInput?: string;
  path?: string;
  delayMs: number;
  errorRate: number;
  statusCode: number;
}

export function useCreateMock() {
  return useMutation({
    mutationFn: async (data: CreateMockPayload): Promise<Mock> => {
      const res = await fetch("/api/mocks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Failed to create mock");
      }
      return res.json();
    },
  });
}

export function useGetMock(id: string) {
  return useQuery<Mock>({
    queryKey: ["mock", id],
    queryFn: async () => {
      const res = await fetch(`/api/mocks/${id}`);
      if (!res.ok) throw new Error("Mock not found or expired");
      return res.json();
    },
    enabled: !!id,
    retry: false,
  });
}

export function useListMocks(ids: string[]) {
  return useQuery<Mock[]>({
    queryKey: ["mocks", ids],
    queryFn: async () => {
      if (ids.length === 0) return [];
      const results = await Promise.all(
        ids.map((id) =>
          fetch(`/api/mocks/${id}`)
            .then((r) => (r.ok ? (r.json() as Promise<Mock>) : null))
            .catch(() => null),
        ),
      );
      return results.filter(Boolean) as Mock[];
    },
    enabled: ids.length > 0,
    refetchInterval: 15000,
  });
}

export function useDeleteMock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/mocks/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["mocks"] });
    },
  });
}

export function useRegenerateMock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string): Promise<Mock> => {
      const res = await fetch(`/api/mocks/${id}/regenerate`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to regenerate");
      return res.json();
    },
    onSuccess: (data) => {
      qc.setQueryData(["mock", data.id], data);
    },
  });
}

export function useGetMockLogs(id: string) {
  return useQuery<RequestLog[]>({
    queryKey: ["mock-logs", id],
    queryFn: async () => {
      const res = await fetch(`/api/mocks/${id}/logs`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!id,
    refetchInterval: 3000,
  });
}
