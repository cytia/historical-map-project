# Data workspace

The JSON fragments under this directory are the hand-edited source data. `.generated/project-data.json` is a temporary generated aggregate for the frontend and must not be edited directly or committed. The former `project.json` path is retired and must not be recreated.

The fragment list is defined by `manifest.json`. Assemble and validate the aggregate with:

```text
cargo run -p data-validator -- assemble data/manifest.json
cargo run -p data-validator -- data/manifest.json
```

`npm run dev` and `npm run build` assemble the temporary frontend input automatically. The generated `.generated/project-data.json` is ignored by Git and can be removed at any time.

The assembled structure is defined by `schema/project-data.schema.json`. The manifest is defined by `schema/data-manifest.schema.json`.

Directory responsibilities:

- `catalog/`: shared source and polity metadata.
- `units/administrative/`: civil administrative units grouped by region.
- `units/military/`: military command and garrison unit facts grouped by the unit's seat or location region; the file region is an editing index, not an administrative parent.
- `units/special-governance/`: current tusi and related special-governance records pending source-level classification.
- `places/`: shared physical places grouped by the administrative region that references them.
- `place-names/`: time-valid names attached to stable places.
- `statistics/`: unit statistics grouped by region, with national scope statistics kept separately.
- `relations/`: formal subordination, jurisdiction, cross-system context, co-location, and political-control relations. Military relations are grouped under `relations/military/`.
- `geometries/`: reserved for historical boundaries, routes, and control areas.

Rules:

- Store reviewed source metadata before adding a historical claim.
- Keep raw third-party files outside published data unless redistribution is explicitly allowed.
- Use stable IDs; names and periods may change without changing identity.
- Keep physical places separate from the institutions that use them as seats.
- Keep `militaryUnits` separate from `administrativeUnits`; store military subordination and administrative context in `relations` rather than in an administrative `parentId`.
- Do not edit generated GeoJSON, tile artifacts, or `.generated/project-data.json` directly. Treat the manifest and its fragments as the only editable data source.
- Run assembly and the Rust validator before accepting data changes.

Large source scans, caches, generated tiles, and license-restricted datasets do not belong in this directory.
