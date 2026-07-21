import argparse
import hashlib
import json
import math
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CONFIG_PATH = Path(__file__).with_name("terrain.config.json")
BUCKET = "https://www.ngdc.noaa.gov/mgg/global/relief/ETOPO2022/data/15s/15s_surface_elev_gtif"
USER_AGENT = "maps-terrain-builder/0.1 (+https://github.com/cytia/historical-map-project)"


def coordinate_token(value: int, positive: str, negative: str, width: int) -> str:
    hemisphere = positive if value >= 0 else negative
    return f"{hemisphere}{abs(value):0{width}d}_00"


def tile_name(north: int, west: int) -> str:
    lat = coordinate_token(north, "N", "S", 2).replace("_00", "")
    lon = coordinate_token(west, "E", "W", 3).replace("_00", "")
    return f"ETOPO_2022_v1_15s_{lat}{lon}_surface"


def source_tiles(bounds: list[float]) -> list[dict[str, str]]:
    west, south, east, north = bounds
    tiles = []
    for tile_south in range(math.floor(south / 15) * 15, math.ceil(north / 15) * 15, 15):
        for tile_west in range(math.floor(west / 15) * 15, math.ceil(east / 15) * 15, 15):
            name = tile_name(tile_south + 15, tile_west)
            tiles.append(
                {
                    "name": name,
                    "url": f"{BUCKET}/{name}.tif",
                }
            )
    return tiles


def download(url: str, target: Path) -> dict[str, object]:
    request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    digest = hashlib.sha256()
    size = 0
    temporary = target.with_suffix(".part")
    with urllib.request.urlopen(request) as response, temporary.open("wb") as output:
        while chunk := response.read(1024 * 1024):
            output.write(chunk)
            digest.update(chunk)
            size += len(chunk)
    temporary.replace(target)
    return {"bytes": size, "sha256": digest.hexdigest()}


def main() -> None:
    config = json.loads(CONFIG_PATH.read_text(encoding="utf-8"))
    parser = argparse.ArgumentParser(description="Download Copernicus DEM tiles")
    parser.add_argument("profile", choices=config["profiles"])
    parser.add_argument("--manifest-only", action="store_true")
    args = parser.parse_args()

    profile = config["profiles"][args.profile]
    workspace = ROOT / ".terrain-work" / args.profile
    source_directory = workspace / "source"
    source_directory.mkdir(parents=True, exist_ok=True)

    records = source_tiles(profile["bounds"])
    for record in records:
        target = source_directory / f"{record['name']}.tif"
        record["path"] = str(target.relative_to(ROOT)).replace("\\", "/")
        if not args.manifest_only and not target.exists():
            record.update(download(record["url"], target))
        elif target.exists():
            record["bytes"] = target.stat().st_size

    manifest = {
        "sourceId": config["source"]["id"],
        "profile": args.profile,
        "bounds": profile["bounds"],
        "tiles": records,
    }
    manifest_path = workspace / "source-manifest.json"
    manifest_path.write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    print(f"Wrote {manifest_path.relative_to(ROOT)} with {len(records)} tile(s)")


if __name__ == "__main__":
    main()
