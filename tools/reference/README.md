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

## Province baseline

`build_province_baseline.py` produces the starting shapes for manual Ming provincial boundary reconstruction. It needs one more 10m theme, downloaded to the same directory:

- `ne_10m_admin_1_states_provinces.zip`

```powershell
.\.terrain-venv\Scripts\python.exe tools\reference\build_province_baseline.py
```

Each of the fifteen Ming provincial-level units is built as a union of the modern admin-1 units covering roughly the same ground, carrying the composition and a note on how the modern extent differs from the Ming one.

The shapes are written without simplification. Simplifying each province independently pulls shared edges apart — shapely's `preserve_topology` guards a single geometry, not the edge between two — which previously produced 30 overlapping pairs and 326 gaps from source data that tiles cleanly. Precision matters more than file size here; use a topology-aware tool if simplification is ever needed.

The output is written to `public/reference/province-baseline.geojson`, which is served to the map but kept out of Git. It is an uncorrected modern shape, not historical data: no feature may be copied into `data/geometries/` until its boundary has been corrected against textual evidence and given a geometry record with sources. The generated properties carry `status: uncorrected-baseline` as a reminder.

## Auditing the shapes

`audit_province_baseline.py` compares each shape against the seats it must contain, using the project's own data rather than an external boundary set:

```powershell
.\.terrain-venv\Scripts\python.exe tools\reference\audit_province_baseline.py
```

A seat outside its own province's shape proves that edge wrong. A shape much larger than the convex hull of its seats claims ground no recorded seat supports. Neither check proves a boundary correct; passing both only means nothing contradicts it.

The uncorrected baseline reports 12 seats outside their own province. `province-corrections.md` works through those and the over-extent cases in the order they should be fixed; the count should reach zero as corrections land.
