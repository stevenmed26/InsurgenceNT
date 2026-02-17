export type EncounterStatus =
  | "unattempted"
  | "caught"
  | "missed"
  | "dead"
  | "dupes"
  | "gift"
  | "static";

export type PokemonEntry = {
  id: number;
  name: string;
  sprite: string; // relative path or URL
};

export type LocationEntry = {
  id: string;          // "route-1", "sunsthone-city", etc.
  name: string;        // "Route 1"
  kind?: string;       // "Route" | "Town" | "Cave" | ...
  encounters: number[]; // pokemon IDs available here
};

export type LocationRunState = {
  selectedPokemonId?: number;
  selectedPokemonName?: string; // manual fallback
  status: EncounterStatus;
  nickname?: string;
};

export type RunState = {
  version: 1;
  runName: string;
  createdAt: string; // ISO
  updatedAt: string; // ISO
  locations: Record<string, LocationRunState>; // key = LocationEntry.id
  rules: {
    speciesClause: boolean;
    shinyClause: boolean;
  };
};