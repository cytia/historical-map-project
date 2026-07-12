# Terrain build workspace

This workspace produces static terrain artifacts from NOAA ETOPO 2022 15 arc-second surface elevation. Generated source files, intermediate rasters and PMTiles outputs are local artifacts and must not be committed.

## Profiles

- `western-china-sample`: visual and size validation before the full build.
- `north-china-plain-sample`, `tarim-desert-sample`, `southeast-coast-sample`: representative compression and runtime samples.
- `china`: China and adjacent terrain needed for the historical map viewport.

Bounds, zoom levels and hillshade parameters are defined in `terrain.config.json`. Coordinates use WGS 84 longitude and latitude.

## Local and production paths

Local output is written below `public/terrain/` and served by Vite. Production uses the same file uploaded to Tencent Cloud COS. The frontend selects the file through `VITE_TERRAIN_URL`; credentials are never used in browser code.

## Required pipeline

1. Download only Copernicus tiles intersecting the selected profile.
2. Verify each source object and retain the source manifest.
3. Mosaic on disk and clip the DEM to the profile bounds.
4. Reproject to Web Mercator for web tile generation.
5. Generate multidirectional hillshade using the configured azimuths.
6. Apply the project terrain color tokens, blend the shade and fade the outer edge to transparency.
7. Package zoom levels 3–8 as one PMTiles file.
8. Record tool versions, parameters, generated date, checksums and legal attribution.

## Toolchain

Create the isolated environment and install the pinned tools:

```powershell
python -m venv .terrain-venv
.\.terrain-venv\Scripts\python.exe -m pip install -r tools\terrain\requirements.txt
.\.terrain-venv\Scripts\python.exe -m pip_audit
```

Generate the current sample:

```powershell
.\.terrain-venv\Scripts\python.exe tools\terrain\download_dem.py western-china-sample
.\.terrain-venv\Scripts\python.exe tools\terrain\render_hillshade.py western-china-sample
.\.terrain-venv\Scripts\rio.exe pmtiles .terrain-work\western-china-sample\rendered.tif public\terrain\western-china-terrain.pmtiles --format WEBP --co QUALITY=80 --zoom-levels 3..8 --overlay --rgba --attribution "NOAA National Centers for Environmental Information. 2022: ETOPO 2022 15 Arc-Second Global Relief Model. DOI: 10.25921/fd45-gt74." -j 1
.\.terrain-venv\Scripts\python.exe tools\terrain\verify_pmtiles.py western-china-sample public\terrain\western-china-terrain.pmtiles
```

The global reference basemap remains unchanged. The terrain archive is an optional China-and-adjacent-region overlay; `edgeFadeDegrees` prevents a hard rectangular seam where that overlay ends. Rendering uses an on-disk mosaic and block windows so the full profile is not held in memory at once.

Run the offline renderer tests and estimate the full archive from a verified sample:

```powershell
.\.terrain-venv\Scripts\python.exe tools\terrain\test_render_hillshade.py
.\.terrain-venv\Scripts\python.exe tools\terrain\estimate_size.py china western-china-sample north-china-plain-sample tarim-desert-sample southeast-coast-sample
```

The estimate is a planning range, not a storage guarantee. A representative multi-region build is required before downloading the complete source set.
