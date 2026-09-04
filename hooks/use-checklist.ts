"use client";

import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { mapChecklistItem } from "@/lib/map";
import {
  nextChecklistPosition,
  removeChecklistItem,
  toChecklistRow,
  upsertChecklistItem,
} from "@/lib/sync/checklist";
import type { ChecklistItem } from "@/lib/types";
import type { Database } from "@/types/database";

type ChecklistRow = Database["public"]["Tables"]["checklist_items"]["Row"];

const supabase = createClient();

export function checklistKey(tripId: string) {
  return ["checklist", tripId] as const;
}

/** Shared to-do list with optimistic add/toggle/delete and realtime sync. */
export function useChecklist(tripId: string, initial: ChecklistItem[]) {
  const queryClient = useQueryClient();
  const key = checklistKey(tripId);

  const query = useQuery({
    queryKey: key,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("checklist_items")
        .select("*")
        .eq("trip_id", tripId)
        .order("position, created_at");
      if (error) throw error;
      return (data ?? []).map(mapChecklistItem);
    },
    initialData: initial,
  });

  const items = query.data ?? initial;

  const addItem = useMutation({
    mutationFn: async (title: string) => {
      const current = queryClient.getQueryData<ChecklistItem[]>(key) ?? initial;
      const position = nextChecklistPosition(current);
      const { data, error } = await supabase
        .from("checklist_items")
        .insert(toChecklistRow(title, position, tripId))
        .select()
        .single();
      if (error) throw error;
      return mapChecklistItem(data);
    },
    onMutate: async (title) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<ChecklistItem[]>(key);
      const temp: ChecklistItem = {
        id: `temp-${crypto.randomUUID()}`,
        title,
        done: false,
        position: nextChecklistPosition(previous ?? initial),
      };
      queryClient.setQueryData<ChecklistItem[]>(key, (old) =>
        upsertChecklistItem(old ?? initial, temp),
      );
      return { previous, tempId: temp.id };
    },
    onError: (_err, _title, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(key, ctx.previous);
    },
    onSuccess: (item, _title, ctx) => {
      queryClient.setQueryData<ChecklistItem[]>(key, (old) => {
        const without = (old ?? initial).filter((i) => i.id !== ctx?.tempId);
        return upsertChecklistItem(without, item);
      });
    },
  });

  const toggleItem = useMutation({
    mutationFn: async ({ id, done }: { id: string; done: boolean }) => {
      const { data, error } = await supabase
        .from("checklist_items")
        .update({ done })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return mapChecklistItem(data);
    },
    onMutate: async ({ id, done }) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<ChecklistItem[]>(key);
      queryClient.setQueryData<ChecklistItem[]>(key, (old) =>
        (old ?? initial).map((i) => (i.id === id ? { ...i, done } : i)),
      );
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(key, ctx.previous);
    },
  });

  const deleteItem = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("checklist_items").delete().eq("id", id);
      if (error) throw error;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<ChecklistItem[]>(key);
      queryClient.setQueryData<ChecklistItem[]>(key, (old) =>
        removeChecklistItem(old ?? initial, id),
      );
      return { previous };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(key, ctx.previous);
    },
  });

  useEffect(() => {
    const queryKey = checklistKey(tripId);
    const channel = supabase
      .channel(`checklist:${tripId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "checklist_items", filter: `trip_id=eq.${tripId}` },
        (payload) => {
          if (payload.eventType === "DELETE") {
            const id = payload.old?.id;
            if (id) {
              queryClient.setQueryData<ChecklistItem[]>(queryKey, (old) =>
                removeChecklistItem(old ?? [], id),
              );
            }
          } else {
            const item = mapChecklistItem(payload.new as ChecklistRow);
            queryClient.setQueryData<ChecklistItem[]>(queryKey, (old) =>
              upsertChecklistItem(old ?? [], item),
            );
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tripId, queryClient]);

  return { items, addItem, toggleItem, deleteItem };
}
