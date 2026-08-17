# Historical geometries

This directory holds historical boundaries, routes, water features, and control areas.

Geometry records must identify their coordinate reference system, target time, reconstruction method, accuracy, sources, and publication status. A control area that does not follow an existing administrative boundary must remain independent from the administrative unit records.

## Layout

Record metadata is split from the coordinates it points at. Metadata fragments are listed in `manifest.json` and are hand-edited; the GeoJSON files they reference are exported from QGIS and are not edited by hand.

```text
geometries/
  civil/         metadata fragments for civil administrative extents
  military/      metadata fragments for military command extents
  jimi/          metadata fragments for jimi control areas
  <year>/        GeoJSON coordinates, grouped by system
```

`geometryPath` is resolved relative to this directory, so a record pointing at `1600/civil/nanjing.geojson` reads `geometries/1600/civil/nanjing.geojson`.

## Systems and topology

Each record declares two independent things: the `system` that holds the ground, and whether that ground is administrative territory (`topology`).

`system` records the kind of authority — `civil`, `military`, or `jimi`. It does not decide whether the unit has territory.

`topology` records whether the unit holds administrative territory:

- `exclusive` — the unit holds territory (實土). It takes its place in a single seamless mosaic alongside prefectures and counties, and may not overlap its neighbours.
- `overlapping` — the area is not an administrative division. A garrison's defence or colony area inside civil territory, or a jimi sphere of influence. It may cover ground the mosaic already assigns to someone else.

The distinction follows the 實土 / 非實土 division in Ming administrative geography. A frontier garrison whose territory contains no civil unit holds real administrative space and belongs in the mosaic, whatever institution commands it — the 陝西行都司 in the Hexi Corridor is the clearest case. A garrison stationed inside a county governs people rather than land and stays `overlapping`.

This means there is **one** mosaic, not one per system. Most garrisons — the great majority of the recorded 卫所 — are 非實土 and carry no geometry at all, only their seat point.

Only `exclusive` records take part in seamlessness and mutual-exclusion checks, and they do so together regardless of system. An `exclusive` record may not use `coextensiveWith`: two units cannot both hold the same ground.

## Extent references

A record either carries its own coordinates through `geometryPath` or points at another record's through `coextensiveWith`. Setting both, or neither, is rejected.

`coextensiveWith` exists for an `overlapping` area asserted to match an existing extent — an interior regional military commission whose jurisdiction covers the same ground as the provincial administration, for example. That commission is 非實土: it does not hold the territory, so it borrows the extent rather than claiming it. Referencing keeps the judgement explicit while storing one set of coordinates, so the two cannot drift apart.

An `exclusive` record may not use `coextensiveWith`, because a unit in the mosaic holds its own ground. Chained references are rejected: the target must hold real coordinates.

## Constraints

- Coordinates use EPSG:4326 with longitude first.
- A unit has at most one extent per system per target year.
- Seat points do not produce extents. Convex hulls, Voronoi cells, and buffers around seats are working sketches only and must never be recorded as historical boundaries.
- A unit without recorded territory gets no geometry. Absence of an extent is the correct representation for a 非實土 garrison, not a gap to be filled.
- Every geometry source is a coordinate provider, so the commercial audit requires it to allow redistribution.
