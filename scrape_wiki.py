import json
import re
from typing import Optional, Dict, List
from urllib.parse import urljoin

import requests
from bs4 import BeautifulSoup

BASE = "https://wiki.p-insurgence.com"
URL = "https://wiki.p-insurgence.com/Pok%C3%A9mon_Locations"

OUT_POKEMON = "app/insurgenceNT/src/data/pokemon.json"
OUT_LOCATIONS = "app/insurgenceNT/src/data/locations.json"

DEX_RE = re.compile(r"#\s*(\d{1,4})")


def pick_name_from_row(tr) -> Optional[str]:
    """
    Row structure usually:
      th: #001
      td: <a><img/></a>   (sprite)
      td: <a>Bulbasaur</a> (name)
      ...
      td: Locations (last td)
    We'll prefer the first anchor with visible text that's not empty and not 'Image'.
    """
    for a in tr.find_all("a"):
        txt = a.get_text(" ", strip=True)
        if not txt:
            continue
        if txt.lower() == "image":
            continue
        return txt
    return None


def slugify_location(name: str) -> str:
    s = name.strip().lower()
    s = re.sub(r"[’']", "", s)          # remove apostrophes
    s = re.sub(r"[^a-z0-9]+", "-", s)   # non-alnum -> dash
    s = re.sub(r"-{2,}", "-", s).strip("-")
    return s


def guess_kind(name: str) -> str:
    n = name.lower()
    if n.startswith("route "):
        return "Route"
    if "town" in n:
        return "Town"
    if "city" in n:
        return "City"
    if "cave" in n:
        return "Cave"
    if "forest" in n:
        return "Forest"
    if "tunnel" in n:
        return "Tunnel"
    if "lake" in n:
        return "Lake"
    if "beach" in n:
        return "Beach"
    if "desert" in n:
        return "Desert"
    if "mount" in n or "mt." in n:
        return "Mountain"
    if "path" in n:
        return "Path"
    if "island" in n:
        return "Island"
    return "Location"


def read_location_names_from_row(tr) -> List[str]:
    """
    Location cell is the last <td> in the row. It contains links like:
      <td><a ...>Nasca Town</a>, <a ...>Route 14</a>, ...</td>
    We'll collect anchor texts from that last td.
    """
    tds = tr.find_all("td")
    if not tds:
        return []
    loc_td = tds[-1]
    locs = []
    for a in loc_td.find_all("a"):
        name = a.get_text(" ", strip=True)
        if name:
            locs.append(name)
    return locs


def main():
    resp = requests.get(
        URL,
        headers={"User-Agent": "insurgence-nuzlocke-tracker/0.1 (personal project)"},
        timeout=30,
    )
    resp.raise_for_status()

    soup = BeautifulSoup(resp.text, "lxml")

    # Pick the first table whose header includes "Dex" and "Location"
    target_table = None
    for table in soup.find_all("table"):
        header_text = " ".join(th.get_text(" ", strip=True) for th in table.find_all("th"))
        if "Dex" in header_text and "Location" in header_text:
            target_table = table
            break

    if target_table is None:
        raise RuntimeError("Could not find the Dex/Location table on the page.")

    pokemon_out = []
    seen_ids = set()

    # location name -> list of pokemon IDs
    loc_map: Dict[str, List[int]] = {}

    for tr in target_table.find_all("tr"):
        dex_th = tr.find("th")
        if not dex_th:
            continue

        dex_txt = dex_th.get_text(" ", strip=True)
        m = DEX_RE.search(dex_txt)
        if not m:
            continue  # header row / non-data row

        dex_id = int(m.group(1))

        # Sprite: first image in the row
        img = tr.find("img")
        sprite_url = ""
        if img and img.get("src"):
            sprite_url = urljoin(BASE, img["src"])

        # Name
        name = pick_name_from_row(tr)
        if not name:
            continue

        # Add pokemon entry once
        if dex_id not in seen_ids:
            seen_ids.add(dex_id)
            pokemon_out.append({"id": dex_id, "name": name, "sprite": sprite_url})

        # Add to each listed location
        for loc_name in read_location_names_from_row(tr):
            loc_map.setdefault(loc_name, []).append(dex_id)

    # Clean up: dedupe + sort ids per location
    for loc_name in list(loc_map.keys()):
        loc_map[loc_name] = sorted(set(loc_map[loc_name]))

    pokemon_out.sort(key=lambda x: x["id"])

    # Write pokemon.json
    with open(OUT_POKEMON, "w", encoding="utf-8") as f:
        json.dump(pokemon_out, f, ensure_ascii=False, indent=2)

    # Build locations.json (alphabetical by name)
    locations_out = []
    for loc_name in sorted(loc_map.keys(), key=lambda s: s.lower()):
        locations_out.append(
            {
                "id": slugify_location(loc_name),
                "name": loc_name,
                "kind": guess_kind(loc_name),
                "encounters": loc_map[loc_name],
            }
        )

    with open(OUT_LOCATIONS, "w", encoding="utf-8") as f:
        json.dump(locations_out, f, ensure_ascii=False, indent=2)

    print(f"Wrote {len(pokemon_out)} pokemon entries to {OUT_POKEMON}")
    print(f"Wrote {len(locations_out)} locations to {OUT_LOCATIONS}")
    if pokemon_out:
        print("First 5 pokemon:", pokemon_out[:5])
    if locations_out:
        print("First 5 locations:", [x["name"] for x in locations_out[:5]])


if __name__ == "__main__":
    main()
