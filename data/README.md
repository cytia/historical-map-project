# Data workspace

The JSON fragments under this directory are the hand-edited source data. `project.json` is a generated aggregate for the frontend and must not be edited directly.

The fragment list is defined by `manifest.json`. Assemble and validate the aggregate with:

```text
cargo run -p data-validator -- assemble data/manifest.json
cargo run -p data-validator -- data/manifest.json
```

The assembled structure is defined by `schema/project-data.schema.json`. The manifest is defined by `schema/data-manifest.schema.json`.

Directory responsibilities:

- `catalog/`: shared source and polity metadata.
- `units/administrative/`: civil administrative units grouped by region.
- `units/military/`: military command and garrison units; current entries are limited to records identifiable as guards or battalions from their existing names.
- `units/special-governance/`: current tusi and related special-governance records pending source-level classification.
- `places/`: shared physical places grouped by the administrative region that references them.
- `place-names/`: time-valid names attached to stable places.
- `statistics/`: unit statistics grouped by region, with national scope statistics kept separately.
- `relations/`: reserved for formal subordination, jurisdiction, and political-control relations.
- `geometries/`: reserved for historical boundaries, routes, and control areas.

Rules:

- Store reviewed source metadata before adding a historical claim.
- Keep raw third-party files outside published data unless redistribution is explicitly allowed.
- Use stable IDs; names and periods may change without changing identity.
- Keep physical places separate from the institutions that use them as seats.
- Do not edit generated GeoJSON, tile artifacts, or `project.json` directly.
- Run assembly and the Rust validator before accepting data changes.

Large source scans, caches, generated tiles, and license-restricted datasets do not belong in this directory.
