export const DRAFT_KEY = "pickup-draft";

export function readDraft() {
  try {
    return JSON.parse(localStorage.getItem(DRAFT_KEY) || "{}");
  } catch {
    return {};
  }
}

export function writeDraftMerge(patch) {
  try {
    const prev = readDraft();
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ ...prev, ...patch }));
  } catch {}
}
