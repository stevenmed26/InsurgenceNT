import type { RunState } from "./types";
import { makeDefaultRunState } from "./defaults";

const KEY = "insurgence_nuzlocke_run_v1";

export function loadRunState(): RunState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return makeDefaultRunState();
    const parsed = JSON.parse(raw) as RunState;
    if (!parsed || parsed.version !== 1) return makeDefaultRunState();
    return parsed;
  } catch {
    return makeDefaultRunState();
  }
}

export function saveRunState(state: RunState) {
  localStorage.setItem(KEY, JSON.stringify(state));
}

export function resetRunState(): RunState {
  const next = makeDefaultRunState();
  saveRunState(next);
  return next;
}

export function exportRunState(state: RunState): string {
  return JSON.stringify(state, null, 2);
}

export function importRunState(jsonText: string): RunState {
  const parsed = JSON.parse(jsonText) as RunState;
  if (!parsed || parsed.version !== 1) throw new Error("Invalid save format");
  saveRunState(parsed);
  return parsed;
}
