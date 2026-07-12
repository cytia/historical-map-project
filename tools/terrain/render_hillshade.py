import argparse
import json
from pathlib import Path

import numpy as np
import rasterio
from rasterio.enums import ColorInterp, Resampling
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


def reproject_dem(source_path: Path) -> tuple[np.ndarray, dict[str, object]]:
    with rasterio.open(source_path) as source:
        transform, width, height = calculate_default_transform(
            source.crs,
            "EPSG:3857",
            source.width,
            source.height,
            *source.bounds,
        )
        destination = np.empty((height, width), dtype="float32")
        reproject(
            source=rasterio.band(source, 1),
            destination=destination,
            src_transform=source.transform,
            src_crs=source.crs,
            dst_transform=transform,
            dst_crs="EPSG:3857",
            resampling=Resampling.bilinear,
        )
    return destination, {"transform": transform, "width": width, "height": height}


def render(profile_name: str) -> Path:
    config = json.loads(CONFIG_PATH.read_text(encoding="utf-8"))
    workspace = ROOT / ".terrain-work" / profile_name
    manifest = json.loads((workspace / "source-manifest.json").read_text(encoding="utf-8"))
    source_paths = [ROOT / record["path"] for record in manifest["tiles"]]
    if len(source_paths) != 1:
        raise RuntimeError("The current renderer accepts one sample tile")

    elevation, metadata = reproject_dem(source_paths[0])
    transform = metadata["transform"]
    shade = multidirectional_hillshade(
        elevation,
        (abs(transform.a), abs(transform.e)),
        config["hillshade"]["azimuths"],
        config["hillshade"]["altitude"],
        config["hillshade"]["verticalExaggeration"],
    )
    color = color_relief(elevation, config["colors"])
    rendered = np.clip(color * (0.48 + 0.68 * shade[np.newaxis, :, :]), 0, 255).astype("uint8")
    alpha = np.full(elevation.shape, 255, dtype="uint8")

    output = workspace / "rendered.tif"
    with rasterio.open(
        output,
        "w",
        driver="GTiff",
        width=metadata["width"],
        height=metadata["height"],
        count=4,
        dtype="uint8",
        crs="EPSG:3857",
        transform=transform,
        tiled=True,
        compress="deflate",
    ) as target:
        target.write(rendered, indexes=(1, 2, 3))
        target.write(alpha, 4)
        target.colorinterp = (
            ColorInterp.red,
            ColorInterp.green,
            ColorInterp.blue,
            ColorInterp.alpha,
        )
    return output


def main() -> None:
    parser = argparse.ArgumentParser(description="Render multidirectional terrain hillshade")
    parser.add_argument("profile", choices=["western-china-sample"])
    args = parser.parse_args()
    output = render(args.profile)
    print(f"Wrote {output.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
