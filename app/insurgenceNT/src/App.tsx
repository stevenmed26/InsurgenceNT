import React from "react";
import locations from "./data/locations_ordered.json";
import pokemon from "./data/pokemon.json";
import logo from "./assets/logo.png";

import type { LocationEntry, PokemonEntry, RunState, LocationRunState } from "./lib/types";
import { loadRunState, saveRunState, resetRunState, exportRunState, importRunState } from "./lib/storage";
import { TopBar } from "./components/TopBar";
import { LocationPanel } from "./components/LocationPanel";

const LOCATION_LIST = locations as LocationEntry[];
const POKEMON_LIST = pokemon as PokemonEntry[];

function downloadText(filename: string, text: string) {
  const blob = new Blob([text], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function App() {
  const pokemonById = React.useMemo(() => new Map(POKEMON_LIST.map((p) => [p.id, p])), []);

  const [state, setState] = React.useState<RunState>(() => loadRunState());
  const [search, setSearch] = React.useState("");

  React.useEffect(() => {
    saveRunState(state);
  }, [state]);

  function setLocationState(locationId: string, next: LocationRunState) {
    setState((prev) => ({
      ...prev,
      updatedAt: new Date().toISOString(),
      locations: {
        ...prev.locations,
        [locationId]: next,
      },
    }));
  }

  return (
    <div className="app">
      <div className="logoWrapper">
        <img src={logo} alt="Pokemon Insurgence" className="logoImage" />
      </div>
      <TopBar
        runName={state.runName}
        onRunNameChange={(v) =>
          setState((prev) => ({ ...prev, runName: v, updatedAt: new Date().toISOString() }))
        }
        search ={search}
        onSearchChange={setSearch}
        onReset={() => setState(resetRunState())}
        onExport={() => downloadText("insurgence-nuzlocke-save.json", exportRunState(state))}
        onImport={async (file) => {
          const text = await file.text();
          try {
            setState(importRunState(text));
          } catch (e: any) {
            alert(e?.message ?? "Import failed");
          }
        }}
      />

      <div className="container">
        <div className="summary">
          <span><b>Species clause:</b> {state.rules.speciesClause ? "On" : "Off"}</span>
          <span><b>Shiny clause:</b> {state.rules.shinyClause ? "On" : "Off"}</span>
          <span><b>Updated:</b> {new Date(state.updatedAt).toLocaleString()}</span>
        </div>

        <div className="list">
          {LOCATION_LIST.filter((loc => loc.name.toLowerCase().includes(search.toLowerCase()))).map((loc) => {
            const value = state.locations[loc.id] ?? { status: "unattempted" as const };
            return (
              <LocationPanel
                key={loc.id}
                location={loc}
                pokemonById={pokemonById}
                allPokemon={POKEMON_LIST}
                value={value}
                onChange={(next) => setLocationState(loc.id, next)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

