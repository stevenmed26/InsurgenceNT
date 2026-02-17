import type { RunState } from "./types";

export function makeDefaultRunState(): RunState {
  const now = new Date().toISOString();
  return {
    version: 1,
    runName: "My Insurgence Nuzlocke",
    createdAt: now,
    updatedAt: now,
    locations: {},
    rules: {
      speciesClause: true,
      shinyClause: true,
    },
  };
}
