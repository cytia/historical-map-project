import argparse
import json
import tempfile
from pathlib import Path

import numpy as np
import rasterio
from rasterio.enums import ColorInterp

from render_hillshade import CONFIG_PATH, color_relief, multidirectional_hillshade, reproject_dem


def render_preview(source_path: Path, resolution: float, config: dict[str, object]) -> np.ndarray:
    with tempfile.TemporaryDirectory(dir=source_path.parent) as directory:
        projected = Path(directory) / "projected.tif"
        reproject_dem(source_path, projected, resolution)
        with rasterio.open(projected) as source:
            elevation = source.read(1)
            shade = multidirectional_hillshade(
                elevation,
                (resolution, resolution),
                config["hillshade"]["azimuths"],
                config["hillshade"]["altitude"],
                config["hillshade"]["verticalExaggeration"],
            )
            color = color_relief(elevation, config["colors"])
            return np.clip(color * (0.48 + 0.68 * shade), 0, 255).astype("uint8")


def main() -> None:
    parser = argparse.ArgumentParser(description="Create a side-by-side DEM hillshade preview")
    parser.add_argument("left", type=Path)
    parser.add_argument("right", type=Path)
    parser.add_argument("output", type=Path)
    parser.add_argument("--resolution", type=float, default=90)
    parser.add_argument("--right-resolution", type=float)
    parser.add_argument("--third", type=Path)
    parser.add_argument("--third-resolution", type=float)
    args = parser.parse_args()
    config = json.loads(CONFIG_PATH.read_text(encoding="utf-8"))
    left = render_preview(args.left, args.resolution, config)
    right = render_preview(args.right, args.right_resolution or args.resolution, config)
    images = [left, right]
    if args.third:
        images.append(render_preview(args.third, args.third_resolution or args.resolution, config))
    height = min(image.shape[1] for image in images)
    width = min(image.shape[2] for image in images)
    divider = np.full((3, height, 8), 238, dtype="uint8")
    panels = []
    for image in images:
        if panels:
            panels.append(divider)
        panels.append(image[:, :height, :width])
    comparison = np.concatenate(panels, axis=2)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    with rasterio.open(
        args.output, "w", driver="PNG", width=comparison.shape[2], height=height,
        count=3, dtype="uint8",
    ) as target:
        target.write(comparison)
        target.colorinterp = (ColorInterp.red, ColorInterp.green, ColorInterp.blue)


if __name__ == "__main__":
    main()
