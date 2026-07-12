import argparse
import hashlib
import json
import math
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CONFIG_PATH = Path(__file__).with_name("terrain.config.json")
BUCKET = "https://copernicus-dem-30m.s3.amazonaws.com"
USER_AGENT = "maps-terrain-builder/0.1 (+https://github.com/cytia/maps)"


def coordinate_token(value: int, positive: str, negative: str, width: int) -> str:
    hemisphere = positive if value >= 0 else negative
    return f"{hemisphere}{abs(value):0{width}d}_00"


def tile_name(latitude: int, longitude: int) -> str:
    lat = coordinate_token(latitude, "N", "S", 2)
    lon = coordinate_token(longitude, "E", "W", 3)
    return f"Copernicus_DSM_COG_10_{lat}_{lon}_DEM"


def source_tiles(bounds: list[float]) -> list[dict[str, str]]:
    west, south, east, north = bounds
    tiles = []
    for latitude in range(math.floor(south), math.ceil(north)):
        for longitude in range(math.floor(west), math.ceil(east)):
            name = tile_name(latitude, longitude)
            tiles.append(
                {
                    "name": name,
                    "url": f"{BUCKET}/{name}/{name}.tif",
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
    parser = argparse.ArgumentParser(description="Download Copernicus DEM tiles")
    parser.add_argument("profile", choices=["western-china-sample", "china"])
    parser.add_argument("--manifest-only", action="store_true")
    args = parser.parse_args()

    config = json.loads(CONFIG_PATH.read_text(encoding="utf-8"))
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
