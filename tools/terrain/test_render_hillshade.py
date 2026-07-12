import tempfile
import unittest
from pathlib import Path

import numpy as np
import rasterio
from rasterio.transform import from_origin

from render_hillshade import ROOT, edge_alpha, mosaic_dem


class TerrainRendererTests(unittest.TestCase):
    def write_tile(self, path: Path, west: float, value: float) -> None:
        with rasterio.open(
            path,
            "w",
            driver="GTiff",
            width=10,
            height=10,
            count=1,
            dtype="float32",
            crs="EPSG:4326",
            transform=from_origin(west, 1, 0.1, 0.1),
        ) as target:
            target.write(np.full((10, 10), value, dtype="float32"), 1)

    def test_mosaic_joins_adjacent_tiles_and_clips_bounds(self) -> None:
        temporary_root = ROOT / ".terrain-work" / "tests"
        temporary_root.mkdir(parents=True, exist_ok=True)
        with tempfile.TemporaryDirectory(dir=temporary_root) as directory:
            root = Path(directory)
            west, east, output = root / "west.tif", root / "east.tif", root / "mosaic.tif"
            self.write_tile(west, 0, 10)
            self.write_tile(east, 1, 20)
            mosaic_dem([west, east], [0.5, 0, 1.5, 1], output)

            with rasterio.open(output) as mosaic:
                values = mosaic.read(1)
                self.assertEqual((mosaic.width, mosaic.height), (10, 10))
                self.assertTrue(np.all(values[:, :5] == 10))
                self.assertTrue(np.all(values[:, 5:] == 20))

    def test_edge_alpha_has_transparent_edge_and_opaque_center(self) -> None:
        alpha = edge_alpha(rasterio.windows.Window(0, 0, 9, 9), 9, 9, 2)
        self.assertEqual(alpha[0, 4], 0)
        self.assertEqual(alpha[4, 4], 1)


if __name__ == "__main__":
    unittest.main()
