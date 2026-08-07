# Data workspace

The JSON fragments under this directory are the hand-edited source data. The frontend reads these fragments as separately emitted runtime assets and uses `.generated/runtime-index.json` only for the compact map and search bootstrap. Generated files must not be edited directly or committed. The former `project.json` path is retired and must not be recreated.

The fragment list is defined by `manifest.json`. Validate the complete dataset in memory and prepare the runtime index with:

```text
cargo run -p data-validator -- data/manifest.json
cargo run -p data-validator -- commercial-audit
cargo run -p data-validator -- tuguan-audit
cargo run -p data-validator -- prepare data/manifest.json data/.generated/runtime-index.json
```

`commercial-audit` reports place records whose `location` claim cites a direct coordinate provider with `restricted` or `unknown` redistribution status. It is a separate eligibility check for a commercial coordinate package and does not change the ordinary historical-data validation rules or the handling of citation-only sources. The commercial package policy also excludes OSM/ODbL coordinates even though ODbL permits redistribution with conditions.

Sources that directly provide a place coordinate must set `coordinateProvider: true`. Historical texts, research articles, and other sources used only to support historical identity or location reasoning should leave it unset or set it to `false`.

`tuguan-audit` lists every `native-office` record by top-level administrative region and reports its Tuguan level, Tuguan parent, administrative context, and point status. `jimi-subordination` is reserved for links between jimi units; `jimi-administrative-context` is metadata for administrative placement and is never rendered as a relation line.

`npm run dev` and `npm run build` validate the fragments and regenerate the compact runtime index automatically. They do not create a complete aggregate copy.

The assembled structure is defined by `schema/project-data.schema.json`. The manifest is defined by `schema/data-manifest.schema.json`.

Directory responsibilities:

- `catalog/`: shared source and polity metadata.
- `units/administrative/`: civil administrative units grouped by region.
- `units/military/`: military command and garrison unit facts grouped by the unit's seat or location region; the file region is an editing index, not an administrative parent.
- `units/special-governance/`: jimi units grouped by seat or location region, including jimi military institutions and native-official offices.
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
- Keep `jimiUnits` separate from both military and civil units; store jimi subordination and administrative context in `relations` rather than in a unit `parentId`.
- Keep native-office and military-institution hierarchies separate; a `jimi-subordination` relation must not cross jimi kinds or target an administrative unit.
- Do not edit generated GeoJSON, tile artifacts, or `.generated/runtime-index.json` directly. Treat the manifest and its fragments as the only editable data source.
- Run runtime preparation and the Rust validator before accepting data changes.

Large source scans, caches, generated tiles, and license-restricted datasets do not belong in this directory.
