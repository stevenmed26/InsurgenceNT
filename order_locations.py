import json
import os

LOCATIONS_IN = "app/insurgenceNT/src/data/locations.json"
ORDER_IN = "app/insurgenceNT/src/data/location_order.json"
LOCATIONS_OUT = "app/insurgenceNT/src/data/locations_ordered.json"


def main():
    if not os.path.exists(LOCATIONS_IN):
        raise FileNotFoundError(f"Missing {LOCATIONS_IN}")

    with open(LOCATIONS_IN, "r", encoding="utf-8") as f:
        locations = json.load(f)

    if not isinstance(locations, list):
        raise RuntimeError("locations.json must be a JSON array")

    if not os.path.exists(ORDER_IN):
        raise FileNotFoundError(
            f"Missing {ORDER_IN}. Create it as a JSON array of location names."
        )

    with open(ORDER_IN, "r", encoding="utf-8") as f:
        order = json.load(f)

    if not isinstance(order, list) or not all(isinstance(x, str) for x in order):
        raise RuntimeError("location_order.json must be a JSON array of strings")

    by_name = {loc["name"]: loc for loc in locations if isinstance(loc, dict) and "name" in loc}

    ordered = []
    seen = set()

    # Add in manual order first
    missing = []
    for name in order:
        loc = by_name.get(name)
        if loc is None:
            missing.append(name)
            continue
        ordered.append(loc)
        seen.add(name)

    # Append any locations not listed
    for loc in locations:
        name = loc.get("name")
        if name and name not in seen:
            ordered.append(loc)
            seen.add(name)

    with open(LOCATIONS_OUT, "w", encoding="utf-8") as f:
        json.dump(ordered, f, ensure_ascii=False, indent=2)

    print(f"Wrote {len(ordered)} locations to {LOCATIONS_OUT}")

    if missing:
        print("\nWARNING: These names were not found in locations.json (spelling must match exactly):")
        for n in missing:
            print(f"  - {n}")


if __name__ == "__main__":
    main()
