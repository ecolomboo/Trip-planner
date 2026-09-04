"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { mapEntry } from "@/lib/map";
import {
  nextPosition,
  removeEntryFromCache,
  toEntryRow,
  updateEntryInCache,
  upsertEntry,
} from "@/lib/sync/entries";
import type { Entry, EntryDraft } from "@/lib/types";

const supabase = createClient();

export function entriesKey(tripId: string) {
  return ["entries", tripId] as const;
}

/**
 * The entries list plus optimistic add/edit/delete. `initial` is the SSR
 * snapshot so the first paint is instant; mutations apply immediately and roll
 * back if the write fails.
 */
export function useEntries(tripId: string, initial: Entry[]) {
  const queryClient = useQueryClient();
  const key = entriesKey(tripId);

  const query = useQuery({
    queryKey: key,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("entries")
        .select("*")
        .eq("trip_id", tripId)
        .order("date, position");
      if (error) throw error;
      return (data ?? []).map(mapEntry);
    },
    initialData: initial,
  });

  const entries = query.data ?? initial;

  const addEntry = useMutation({
    mutationFn: async (draft: EntryDraft) => {
      const current = queryClient.getQueryData<Entry[]>(key) ?? initial;
      const position = nextPosition(current, draft.date);
      const { data, error } = await supabase
        .from("entries")
        .insert(toEntryRow(draft, position, tripId))
        .select()
        .single();
      if (error) throw error;
      return mapEntry(data);
    },
    onMutate: async (draft) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<Entry[]>(key);
      const current = previous ?? initial;
      const tempId = `temp-${crypto.randomUUID()}`;
      const optimistic: Entry = {
        id: tempId,
        position: nextPosition(current, draft.date),
        ...draft,
      };
      queryClient.setQueryData<Entry[]>(key, (old) => upsertEntry(old ?? initial, optimistic));
      return { previous, tempId };
    },
    onError: (_err, _draft, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(key, ctx.previous);
    },
    onSuccess: (entry, _draft, ctx) => {
      queryClient.setQueryData<Entry[]>(key, (old) => {
        const withoutTemp = (old ?? initial).filter((e) => e.id !== ctx?.tempId);
        return upsertEntry(withoutTemp, entry);
      });
    },
  });

  const updateEntry = useMutation({
    mutationFn: async (entry: Entry) => {
      const { data, error } = await supabase
        .from("entries")
        .update(toEntryRow(entry, entry.position, tripId))
        .eq("id", entry.id)
        .select()
        .single();
      if (error) throw error;
      return mapEntry(data);
    },
    onMutate: async (entry) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<Entry[]>(key);
      queryClient.setQueryData<Entry[]>(key, (old) => updateEntryInCache(old ?? initial, entry));
      return { previous };
    },
    onError: (_err, _entry, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(key, ctx.previous);
    },
    onSuccess: (entry) => {
      queryClient.setQueryData<Entry[]>(key, (old) => updateEntryInCache(old ?? initial, entry));
    },
  });

  const deleteEntry = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("entries").delete().eq("id", id);
      if (error) throw error;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<Entry[]>(key);
      queryClient.setQueryData<Entry[]>(key, (old) => removeEntryFromCache(old ?? initial, id));
      return { previous };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(key, ctx.previous);
    },
  });

  return { entries, addEntry, updateEntry, deleteEntry };
}
