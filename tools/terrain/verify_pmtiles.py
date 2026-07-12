import argparse
import hashlib
import importlib.metadata
import json
from datetime import datetime, timezone
from pathlib import Path

import mercantile
import rasterio
from pmtiles.reader import Reader
from rasterio.io import MemoryFile

ROOT = Path(__file__).resolve().parents[2]
CONFIG_PATH = Path(__file__).with_name("terrain.config.json")


def file_reader(path: Path):
    source = path.open("rb")

    def get_bytes(offset: int, length: int) -> bytes:
        source.seek(offset)
        return source.read(length)

    return source, Reader(get_bytes)


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as source:
        while chunk := source.read(1024 * 1024):
            digest.update(chunk)
    return digest.hexdigest()


def verify(profile: str, archive: Path) -> Path:
    config = json.loads(CONFIG_PATH.read_text(encoding="utf-8"))
    west, south, east, north = config["profiles"][profile]["bounds"]
    center_longitude = (west + east) / 2
    center_latitude = (south + north) / 2
    source, reader = file_reader(archive)
    try:
        header = reader.header()
        metadata = reader.metadata()
        center = mercantile.tile(center_longitude, center_latitude, header["max_zoom"])
        tile_data = reader.get(center.z, center.x, center.y)
        overview = mercantile.tile(center_longitude, center_latitude, header["min_zoom"])
        overview_data = reader.get(overview.z, overview.x, overview.y)
    finally:
        source.close()

    if header["version"] != 3:
        raise RuntimeError("Expected PMTiles version 3")
    if header["addressed_tiles_count"] <= 0:
        raise RuntimeError("Archive contains no addressed tiles")
    profile_config = config["profiles"][profile]
    if (
        header["min_zoom"] != profile_config["minZoom"]
        or header["max_zoom"] != profile_config["maxZoom"]
    ):
        raise RuntimeError("Archive zoom range does not match the terrain profile")
    if "ETOPO 2022" not in (metadata.get("attribution") or ""):
        raise RuntimeError("Archive attribution is missing the ETOPO citation")

    if tile_data is None:
        raise RuntimeError("Archive is missing the sample center tile")
    if overview_data is None:
        raise RuntimeError("Archive is missing the sample overview tile")
    with MemoryFile(tile_data) as memory_file, memory_file.open() as tile:
        if tile.count not in (3, 4):
            raise RuntimeError("Terrain center tiles must be RGB or RGBA")
        if tile.count == 4 and tile.colorinterp[3] != rasterio.enums.ColorInterp.alpha:
            raise RuntimeError("The fourth terrain band must be alpha")
    with MemoryFile(overview_data) as memory_file, memory_file.open() as tile:
        if tile.count != 4 or tile.colorinterp[3] != rasterio.enums.ColorInterp.alpha:
            raise RuntimeError("Terrain overview tiles must contain an alpha channel")
        alpha = tile.read(4)
        if alpha.min() != 0 or alpha.max() != 255:
            raise RuntimeError("Overview tile must contain transparent and opaque pixels")

    manifest = {
        "profile": profile,
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "archive": str(archive.relative_to(ROOT)).replace("\\", "/"),
        "bytes": archive.stat().st_size,
        "sha256": sha256(archive),
        "header": {
            "version": header["version"],
            "minZoom": header["min_zoom"],
            "maxZoom": header["max_zoom"],
            "addressedTiles": header["addressed_tiles_count"],
            "tileType": header["tile_type"].name,
        },
        "tools": {
            "rasterio": importlib.metadata.version("rasterio"),
            "rio-pmtiles": importlib.metadata.version("rio-pmtiles"),
        },
    }
    output = ROOT / ".terrain-work" / profile / "build-manifest.json"
    output.write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    return output


def main() -> None:
    parser = argparse.ArgumentParser(description="Verify a generated terrain PMTiles archive")
    parser.add_argument("profile")
    parser.add_argument("archive", type=Path)
    args = parser.parse_args()
    output = verify(args.profile, (ROOT / args.archive).resolve())
    print(f"Verified archive and wrote {output.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
