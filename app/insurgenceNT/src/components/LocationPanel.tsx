import { PokemonCombo } from "./PokemonCombo";
import type {
  LocationEntry,
  PokemonEntry,
  LocationRunState,
  EncounterStatus,
} from "../lib/types";

const STATUS_OPTIONS: { value: EncounterStatus; label: string }[] = [
  { value: "unattempted", label: "Unattempted" },
  { value: "caught", label: "Caught" },
  { value: "missed", label: "Missed" },
  { value: "dead", label: "Dead" },
  { value: "dupes", label: "Dupes" },
  { value: "gift", label: "Gift" },
  { value: "static", label: "Static" },
];

function isCompleted(status: EncounterStatus) {
  return status === "caught" || status === "dupes" || status === "gift" || status === "static";
}

function isGreyed(status: EncounterStatus) {
  return status === "dead" || status === "missed";
}

export function LocationPanel(props: {
  location: LocationEntry;
  pokemonById: Map<number, PokemonEntry>;
  allPokemon: PokemonEntry[];
  value: LocationRunState;
  onChange: (next: LocationRunState) => void;
}) {
  const { location, pokemonById, value } = props;

  const greyed = isGreyed(value.status);
  const completed = isCompleted(value.status);

  const encounterList = location.encounters
    .map((id) => pokemonById.get(id))
    .filter(Boolean) as PokemonEntry[];

  const selected = 
    value.selectedPokemonId != null
      ? pokemonById.get(value.selectedPokemonId)
      : undefined;

  const panelClass = [
    "panel",
    completed && !greyed ? "panel--completed" : "",
    greyed ? "panel--greyed" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const badgeText = value.status;
  const badgeClass = [
    "badge",
    completed && !greyed ? "badge--completed" : "",
    greyed ? "badge--greyed" : "",
  ].filter(Boolean).join(" ");

  return (
    <div className={panelClass}>
      <div className="panel__content">
        <div className="panel__header">
          <div>
            <div className="panel__titleRow">
              <div className="panel__title">{location.name}</div>
              <span className={badgeClass}>{badgeText}</span>
            </div>

            <div className="panel__sub">
              {encounterList.length ? `${encounterList.length} encounters` : "No encounters"}
            </div>
          </div>
        </div>

        <div className="panel__grid">
          <PokemonCombo
            valueId={value.selectedPokemonId}
            valueName={value.selectedPokemonName}
            allOptions={props.allPokemon}
            preferredIds={new Set(location.encounters)}
            placeholder="Select encounter..."
            onPick={({ id, name }) => {
              props.onChange({
                ...value,
                selectedPokemonId: id,
                selectedPokemonName: name,
              });
            }}
          />

          <select
            className="select"
            value={value.status}
            onChange={(e) =>
              props.onChange({
                ...value,
                status: e.target.value as EncounterStatus,
              })
            }
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>

          <input
            className="input"
            placeholder="Nickname (optional)"
            value={value.nickname ?? ""}
            onChange={(e) => props.onChange({ ...value, nickname: e.target.value })}
          />
        </div>
      </div>

      <div className="panel__spriteWrapper">
        <div className="spriteWell">
          {selected?.sprite ? (
            <img
              key={selected.id} /* forces remount so animation replays */
              src={selected.sprite}
              alt={selected.name}
              className="spriteLarge image-rendering-pixelated spriteFadeIn"
            />
          ) : (
            <div
              key="empty"
              className="spriteLarge"
              style={{ opacity: 0.35 }}
              aria-hidden="true"
            />
          )}
        </div>
      </div>
    </div>
  );

}
