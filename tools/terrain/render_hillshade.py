import argparse
import json
from pathlib import Path

import numpy as np
import rasterio
from rasterio.enums import ColorInterp, Resampling
from rasterio.merge import merge
from rasterio.windows import Window
from rasterio.warp import calculate_default_transform, reproject

ROOT = Path(__file__).resolve().parents[2]
CONFIG_PATH = Path(__file__).with_name("terrain.config.json")


def hex_color(value: str) -> np.ndarray:
    return np.array([int(value[index : index + 2], 16) for index in (1, 3, 5)])


def color_relief(elevation: np.ndarray, colors: dict[str, str]) -> np.ndarray:
    stops = [0, 1000, 2500, 4000, 5500]
    palette = np.stack(
        [
            hex_color(colors["paper"]),
            hex_color(colors["lowland"]),
            hex_color(colors["vegetation"]),
            hex_color(colors["relief"]),
            hex_color(colors["snow"]),
        ]
    )
    channels = [np.interp(elevation, stops, palette[:, index]) for index in range(3)]
    return np.stack(channels, axis=0)


def multidirectional_hillshade(
    elevation: np.ndarray,
    resolution: tuple[float, float],
    azimuths: list[float],
    altitude: float,
    exaggeration: float,
) -> np.ndarray:
    gradient_y, gradient_x = np.gradient(
        elevation * exaggeration,
        resolution[1],
        resolution[0],
    )
    slope = np.arctan(np.hypot(gradient_x, gradient_y))
    aspect = np.arctan2(-gradient_x, gradient_y)
    altitude_rad = np.radians(altitude)
    shades = []
    for azimuth in azimuths:
        azimuth_rad = np.radians(azimuth)
        illumination = (
            np.sin(altitude_rad) * np.cos(slope)
            + np.cos(altitude_rad) * np.sin(slope) * np.cos(azimuth_rad - aspect)
        )
        shades.append(np.clip(illumination, 0, 1))
    return np.mean(shades, axis=0)


def mosaic_dem(source_paths: list[Path], bounds: list[float], output: Path) -> Path:
    sources = [rasterio.open(path) for path in source_paths]
    try:
        merge(
            sources,
            bounds=bounds,
            dst_path=output,
            mem_limit=256,
            target_aligned_pixels=True,
        )
    finally:
        for source in sources:
            source.close()
    return output


def reproject_dem(source_path: Path, output: Path, resolution: float) -> Path:
    with rasterio.open(source_path) as source:
        transform, width, height = calculate_default_transform(
            source.crs,
            "EPSG:3857",
            source.width,
            source.height,
            *source.bounds,
            resolution=resolution,
        )
        profile = source.profile | {
            "driver": "GTiff", "width": width, "height": height,
            "crs": "EPSG:3857", "transform": transform, "dtype": "float32",
            "count": 1, "tiled": True, "compress": "deflate", "nodata": -9999,
        }
        with rasterio.open(output, "w", **profile) as target:
            reproject(
                source=rasterio.band(source, 1), destination=rasterio.band(target, 1),
                src_transform=source.transform, src_crs=source.crs,
                dst_transform=transform, dst_crs="EPSG:3857",
                src_nodata=source.nodata, dst_nodata=-9999,
                resampling=Resampling.bilinear,
            )
    return output


def edge_alpha(window: Window, width: int, height: int, fade_pixels: int) -> np.ndarray:
    row_off, col_off = int(window.row_off), int(window.col_off)
    rows = np.arange(row_off, row_off + int(window.height))
    cols = np.arange(col_off, col_off + int(window.width))
    vertical = np.minimum(rows, height - 1 - rows)[:, None]
    horizontal = np.minimum(cols, width - 1 - cols)[None, :]
    distance = np.minimum(vertical, horizontal)
    return np.clip(distance / max(fade_pixels, 1), 0, 1)


def render(profile_name: str) -> Path:
    config = json.loads(CONFIG_PATH.read_text(encoding="utf-8"))
    workspace = ROOT / ".terrain-work" / profile_name
    manifest = json.loads((workspace / "source-manifest.json").read_text(encoding="utf-8"))
    source_paths = [ROOT / record["path"] for record in manifest["tiles"]]
    mosaic = mosaic_dem(source_paths, manifest["bounds"], workspace / "mosaic.tif")
    resolution = config["hillshade"]["outputResolutionMeters"]
    dem = reproject_dem(mosaic, workspace / "reprojected.tif", resolution)
    output = workspace / "rendered.tif"
    with rasterio.open(dem) as source:
        profile = source.profile | {"count": 4, "dtype": "uint8", "nodata": None}
        requested_fade = round(config["hillshade"]["edgeFadeDegrees"] * 111_320 / resolution)
        fade_pixels = min(requested_fade, min(source.width, source.height) // 4)
        with rasterio.open(output, "w", **profile) as target:
            for _, window in source.block_windows(1):
                elevation = source.read(1, window=window)
                shade = multidirectional_hillshade(
                    elevation, (resolution, resolution), config["hillshade"]["azimuths"],
                    config["hillshade"]["altitude"], config["hillshade"]["verticalExaggeration"],
                )
                color = color_relief(elevation, config["colors"])
                rendered = np.clip(color * (0.48 + 0.68 * shade), 0, 255).astype("uint8")
                alpha = (edge_alpha(window, source.width, source.height, fade_pixels) * 255).astype("uint8")
                alpha[elevation == source.nodata] = 0
                target.write(rendered, indexes=(1, 2, 3), window=window)
                target.write(alpha, 4, window=window)
            target.colorinterp = (
                ColorInterp.red, ColorInterp.green, ColorInterp.blue, ColorInterp.alpha,
            )
    return output


def main() -> None:
    config = json.loads(CONFIG_PATH.read_text(encoding="utf-8"))
    parser = argparse.ArgumentParser(description="Render multidirectional terrain hillshade")
    parser.add_argument("profile", choices=config["profiles"])
    args = parser.parse_args()
    output = render(args.profile)
    print(f"Wrote {output.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
