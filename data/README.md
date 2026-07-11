# Data workspace

`project.json` is the canonical hand-edited index. Its structure is defined by `schema/project-data.schema.json` and checked by the Rust validator.

Rules:

- Store reviewed source metadata before adding a historical claim.
- Keep raw third-party files outside published data unless redistribution is explicitly allowed.
- Use stable IDs; names and periods may change without changing identity.
- Do not edit generated GeoJSON or tile artifacts directly.
- Run `cargo run -p data-validator -- data/project.json` before accepting data changes.

Large source scans, caches, generated tiles, and license-restricted datasets do not belong in this directory.

