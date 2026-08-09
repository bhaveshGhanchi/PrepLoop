export type PracticeKind = "leetcode" | "hld" | "lld" | "behavioral";

export type PracticeEntry = {
  id: string;
  kind: PracticeKind;
  title: string;
  detail: string;
  difficulty?: string;
  tags?: string[];
  problemUrl?: string;
  approach?: string;
  code?: string;
  language?: string;
  createdAt: string;
};

const STORAGE_KEY = "preploop.entries.v1";
const ACTIVE_USER_KEY = "preploop.active-user";
const DELETED_KEY = "preploop.deleted.v1";

function activeUserId() {
  return window.localStorage.getItem(ACTIVE_USER_KEY);
}

function entriesKey() {
  const userId = activeUserId();
  return userId ? `${STORAGE_KEY}.${userId}` : STORAGE_KEY;
}

function deletedKey(userId: string) {
  return `${DELETED_KEY}.${userId}`;
}

function readFromKey(key: string): PracticeEntry[] {
  try {
    const value = JSON.parse(window.localStorage.getItem(key) ?? "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

export function readEntries(): PracticeEntry[] {
  if (typeof window === "undefined") return [];
  return readFromKey(entriesKey());
}

export function setActivePracticeUser(userId: string | null) {
  if (userId) {
    window.localStorage.setItem(ACTIVE_USER_KEY, userId);
  } else {
    window.localStorage.removeItem(ACTIVE_USER_KEY);
  }
  window.dispatchEvent(new Event("preploop:updated"));
}

export function saveEntry(entry: Omit<PracticeEntry, "id" | "createdAt">) {
  const next: PracticeEntry = {
    ...entry,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  window.localStorage.setItem(
    entriesKey(),
    JSON.stringify([next, ...readEntries()].slice(0, 100)),
  );
  window.dispatchEvent(new Event("preploop:updated"));
  if (activeUserId()) void syncEntries().catch(() => undefined);
  return next;
}

export function deleteEntry(id: string) {
  const userId = activeUserId();
  window.localStorage.setItem(
    entriesKey(),
    JSON.stringify(readEntries().filter((entry) => entry.id !== id)),
  );
  if (userId) {
    const key = deletedKey(userId);
    const pending = readStringArray(key);
    window.localStorage.setItem(key, JSON.stringify([...new Set([...pending, id])]));
    void syncEntries().catch(() => undefined);
  }
  window.dispatchEvent(new Event("preploop:updated"));
}

function readStringArray(key: string): string[] {
  try {
    const value = JSON.parse(window.localStorage.getItem(key) ?? "[]");
    return Array.isArray(value)
      ? value.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}

export async function syncEntries() {
  if (typeof window === "undefined") return [];

  const [{ getSupabase, isSupabaseConfigured }] = await Promise.all([
    import("@/lib/supabase"),
  ]);
  if (!isSupabaseConfigured()) return readEntries();

  const supabase = getSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return readEntries();

  setActivePracticeUser(user.id);
  const cacheKey = entriesKey();
  const legacyEntries = readFromKey(STORAGE_KEY);
  const cachedEntries = readFromKey(cacheKey);
  const localEntries = [...cachedEntries, ...legacyEntries].filter(
    (entry, index, entries) =>
      entries.findIndex((candidate) => candidate.id === entry.id) === index,
  );

  const pendingDeletes = readStringArray(deletedKey(user.id));
  if (pendingDeletes.length) {
    const { error } = await supabase
      .from("practice_entries")
      .delete()
      .in("id", pendingDeletes);
    if (error) throw error;
  }

  const entriesToUpload = localEntries.filter(
    (entry) => !pendingDeletes.includes(entry.id),
  );
  if (entriesToUpload.length) {
    const { error } = await supabase.from("practice_entries").upsert(
      entriesToUpload.map((entry) => ({
        id: entry.id,
        user_id: user.id,
        kind: entry.kind,
        title: entry.title,
        detail: entry.detail,
        difficulty: entry.difficulty || null,
        tags: entry.tags ?? [],
        problem_url: entry.problemUrl || null,
        approach: entry.approach || null,
        code: entry.code || null,
        language: entry.language || null,
        created_at: entry.createdAt,
      })),
      { onConflict: "id" },
    );
    if (error) throw error;
  }

  const { data, error } = await supabase
    .from("practice_entries")
    .select(
      "id, kind, title, detail, difficulty, tags, problem_url, approach, code, language, created_at",
    )
    .order("created_at", { ascending: false })
    .limit(500);
  if (error) throw error;

  const syncedEntries = (data ?? []).map((entry) => ({
    id: entry.id as string,
    kind: entry.kind as PracticeKind,
    title: entry.title as string,
    detail: entry.detail as string,
    difficulty: (entry.difficulty as string | null) ?? undefined,
    tags: Array.isArray(entry.tags) ? (entry.tags as string[]) : [],
    problemUrl: (entry.problem_url as string | null) ?? undefined,
    approach: (entry.approach as string | null) ?? undefined,
    code: (entry.code as string | null) ?? undefined,
    language: (entry.language as string | null) ?? undefined,
    createdAt: entry.created_at as string,
  }));

  window.localStorage.setItem(cacheKey, JSON.stringify(syncedEntries));
  window.localStorage.removeItem(deletedKey(user.id));
  if (legacyEntries.length) window.localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event("preploop:updated"));
  return syncedEntries;
}

export function entriesCompletedToday(entries: PracticeEntry[]) {
  const today = new Date().toDateString();
  return entries.filter(
    (entry) => new Date(entry.createdAt).toDateString() === today,
  );
}
