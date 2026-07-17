# Natural reference build

This tool creates the non-historical physical reference layer used by the map.
It intentionally includes only Natural Earth land, coastline, natural lakes, and river centerlines for China and nearby regions. Reservoirs, roads, buildings, land use, and modern place labels are excluded so the layer does not imply a present-day urban landscape.

The downloaded archives are build inputs and must remain outside Git. Download these 10m physical themes from the official Natural Earth source before running the builder:

- `ne_10m_land.zip`
- `ne_10m_lakes.zip`
- `ne_10m_rivers_lake_centerlines.zip`
- `ne_10m_coastline.zip`

Use the project terrain virtual environment:

```powershell
.\.terrain-venv\Scripts\python.exe -m pip install -r tools\reference\requirements.txt
.\.terrain-venv\Scripts\python.exe tools\reference\build_natural_reference.py
.\.terrain-venv\Scripts\python.exe tools\reference\audit_natural_reference.py
```

The generated `public/reference/natural-reference.geojson` is a deployable build artifact. River features retain source identifiers, names, ranks, and source classification so the audit can compare each viewport record with the published feature. The audit report is written to `.reference-work/natural-reference-audit.json` and is intentionally kept out of Git with the downloaded source archives.

The source data remains modern generalized physical geography; it is not a 1600 coastline or historical river reconstruction.
