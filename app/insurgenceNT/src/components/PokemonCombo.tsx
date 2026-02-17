import React from "react";
import ReactDOM from "react-dom";
import type { PokemonEntry } from "../lib/types";

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function PokemonCombo(props: {
  valueId?: number;
  valueName?: string;
  allOptions: PokemonEntry[];        // ALL pokemon
  preferredIds: Set<number>;         // location encounters
  onPick: (v: { id?: number; name?: string }) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  const selected =
    props.valueId != null
      ? props.allOptions.find((p) => p.id === props.valueId)
      : undefined;

  // When menu is closed, show the selected name.
  // When open, show what the user is typing.
  const inputText = open ? query : selected?.name ?? props.valueName ?? "";

  const normQuery = query.trim().toLowerCase();

  const filtered = normQuery
    ? props.allOptions.filter((p) => p.name.toLowerCase().includes(normQuery))
    : props.allOptions;

  const hasExact =
    normQuery.length > 0 &&
    props.allOptions.some((p) => p.name.toLowerCase() === normQuery);

  // Partition: preferred first
  const preferred = filtered.filter((p) => props.preferredIds.has(p.id));
  const others = filtered.filter((p) => !props.preferredIds.has(p.id));

  const [menuRect, setMenuRect] = React.useState<{ left: number; top: number; width: number } | null>(null);

  function updateMenuRect() {
    const el = inputRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const left = clamp(r.left, 8, window.innerWidth - 8);
    const width = clamp(r.width, 240, window.innerWidth - 16);
    const top = r.bottom + 8;
    setMenuRect({ left, top, width });
  }

  React.useEffect(() => {
    function onDocMouseDown(e: MouseEvent) {
      const target = e.target as Node;
      const input = inputRef.current;
      const menu = document.getElementById("pokemon-combo-menu");
      const clickedInput = input ? input.contains(target) : false;
      const clickedMenu = menu ? menu.contains(target) : false;
      if (!clickedInput && !clickedMenu) setOpen(false);
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onDocMouseDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onDocMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  React.useEffect(() => {
    if (!open) return;
    updateMenuRect();

    const onScroll = () => updateMenuRect();
    const onResize = () => updateMenuRect();

    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onResize);
    };
  }, [open]);

  function pickPokemon(p: PokemonEntry) {
    props.onPick({ id: p.id, name: undefined });
    setOpen(false);
    setQuery("");
  }

  function pickManual(name: string) {
    props.onPick({ id: undefined, name });
    setOpen(false);
    setQuery("");
  }

  const showPreferredSection = preferred.length > 0;
  const showOthersSection = others.length > 0;

  // Limit to keep it snappy
  const MAX_PER_SECTION = 120;

  return (
    <>
      <div className="combo">
        <input
          ref={inputRef}
          className="comboInput"
          value={inputText}
          placeholder={props.placeholder ?? "Select encounter..."}
          onFocus={() => {
            setOpen(true);
            setQuery(""); // start fresh typing
          }}
          onClick={() => {
            setOpen(true);
            setQuery("");
          }}
          onChange={(e) => {
            setOpen(true);
            setQuery(e.target.value);
          }}
        />

        <svg className="comboChevron" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M7 10l5 5 5-5H7z" />
        </svg>
      </div>

      {open && menuRect
        ? ReactDOM.createPortal(
            <div
              id="pokemon-combo-menu"
              className="comboMenu"
              style={{
                position: "fixed",
                left: menuRect.left,
                top: menuRect.top,
                width: menuRect.width,
                zIndex: 2147483647,
              }}
            >
              <div className="comboList">
                {/* Manual entry option */}
                {normQuery.length > 0 && !hasExact && (
                  <div
                    className="comboItem"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => pickManual(query.trim())}
                  >
                    <span className="comboItemMuted">Use:</span>
                    <span>"{query.trim()}"</span>
                  </div>
                )}

                {!showPreferredSection && !showOthersSection ? (
                  <div className="comboEmpty">No matches.</div>
                ) : (
                  <>
                    {showPreferredSection && (
                      <>
                        <div className="comboSection">This location</div>
                        {preferred.slice(0, MAX_PER_SECTION).map((p) => (
                          <div
                            key={p.id}
                            className="comboItem"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => pickPokemon(p)}
                          >
                            {p.sprite ? (
                              <img src={p.sprite} alt="" className="comboSprite image-rendering-pixelated" />
                            ) : (
                              <div className="comboSprite" />
                            )}
                            <span>{p.name}</span>
                          </div>
                        ))}
                      </>
                    )}

                    {showOthersSection && (
                      <>
                        <div className="comboSection">Other Pokémon</div>
                        {others.slice(0, MAX_PER_SECTION).map((p) => (
                          <div
                            key={p.id}
                            className="comboItem"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => pickPokemon(p)}
                          >
                            {p.sprite ? (
                              <img src={p.sprite} alt="" className="comboSprite image-rendering-pixelated" />
                            ) : (
                              <div className="comboSprite" />
                            )}
                            <span>{p.name}</span>
                          </div>
                        ))}
                      </>
                    )}
                  </>
                )}
              </div>
            </div>,
            document.body
          )
        : null}
    </>
  );
}
