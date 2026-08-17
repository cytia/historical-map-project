# Provincial boundary correction list

Working notes for correcting `province-baseline.geojson` into Ming provincial extents for the 1600 time slice. The baseline is a union of modern admin-1 units; every item below is a difference that must be resolved by hand in QGIS before a shape becomes a geometry record.

This list says which edges are wrong and what evidence bounds them. It does not contain corrected coordinates: those come from the manual tracing, not from this document.

## How the evidence was derived

Two automated comparisons against the project's own seat data, reproducible from the repository:

- **Seats outside their own province.** A prefecture or department seat that falls outside the baseline shape of the province it belongs to proves the baseline edge is wrong there, because the province must at minimum contain its own seats.
- **Baseline area against seat convex hull.** The hull of a province's seats is a lower bound on its extent. A baseline much larger than the hull means the modern shape claims ground that no recorded seat supports.

Neither test proves a boundary correct. Passing both only means no contradiction was detected.

## Ranked corrections

### 1. Shaanxi — 3.68x the seat hull

Baseline 138.44 sq deg against a 37.58 sq deg seat hull, the largest discrepancy by far. The Qinghai component is the cause: Ming Shaanxi included today's Gansu and Ningxia, but the Qinghai interior was never under the provincial civil administration.

All 30 seats lie within 103.21–110.49 E. The baseline reaches 89.4 E — roughly 14 degrees of longitude with no seat behind it.

Cut the western extent back to the eastern Qinghai margin. The Ming frontier here was a military zone under garrison commands, not civil territory, so ground beyond the cut belongs to `military` or `jimi` records if it is represented at all.

### 2. Guizhou — 2.29x the seat hull

Baseline 15.90 against a 6.93 hull. Ming Guizhou was materially smaller than the modern province and interlocked with Huguang and Sichuan; large areas of the modern province were jimi territory rather than civil prefectures.

All 15 seats fall inside the baseline, so no edge is provably wrong — the problem is over-claim, not misplacement. Resolving it requires the prefecture-level adjacency work rather than a single cut, and the correction should be treated as depending on Huguang and Sichuan being fixed first.

### 3. Sichuan — four seats outside, 2.02x the hull

Four seats sit outside the baseline, all on the southern edge toward Yunnan and Guizhou:

| Seat | Coordinate |
| --- | --- |
| 镇雄府 | 104.87, 27.44 |
| 乌蒙军民府 | 103.72, 27.34 |
| 乌撒军民府 | 104.28, 26.86 |
| 东川军民府 | 103.18, 26.08 |

All four are 军民府, the mixed civil-military prefectures of the southwest frontier. They are recorded under Sichuan but sit in modern Yunnan. The southern boundary must extend to include them.

Check each against the jimi records before moving the line: if a unit is better represented as jimi territory, it belongs in a `jimi` geometry rather than inside the Sichuan civil extent.

### 4. Guangdong — two seats outside, and 0.62x the hull

廉州府 (109.20, 21.67) and 钦州 (108.62, 21.95) both fall outside. Both lie on the Leizhou–Qinzhou coast, which the baseline assigns to modern Guangxi.

This is the coastal margin flagged in the builder notes: Ming Guangdong reached further west along the coast than the modern province, and Ming Guangxi did not reach the sea there. Guangdong and Guangxi must be corrected together — moving one edge without the other creates a gap or an overlap.

The 0.62x ratio is expected here rather than alarming: Guangdong's seats include Hainan, so the hull spans open water the land shape does not cover.

### 5. Guangxi — one seat outside, 1.26x the hull

下雷州 (105.95, 22.55) falls outside the western edge. Paired with the Guangdong correction above: Guangxi loses its modern coastal strip and gains ground on the western margin.

### 6. Jingshi — 1.54x the hull, north edge

No seat falls outside, but the baseline is half again the seat hull. The excess is northern: the Ming northern boundary follows the Great Wall line, while modern Hebei extends well beyond it.

开州 (115.03, 35.76) sits outside on the southern edge, against Shandong and Henan — see item 8.

Cut the north edge to the Great Wall line. Ground beyond it was garrison territory under the northern commands and belongs to `military` records.

### 7. Shanxi — one seat outside, north edge

蔚州 (114.58, 39.83) falls outside the northeastern edge, toward Jingshi. The same Great Wall correction applies to the northern boundary.

### 8. The Shandong–Jingshi–Henan tripoint

Three seats fall outside their provinces, all within a 1-degree box near 114.4–115.4 E, 35.7–36.4 N:

| Seat | Province | Coordinate |
| --- | --- | --- |
| 磁州 | Henan | 114.38, 36.36 |
| 开州 | Jingshi | 115.03, 35.76 |
| 濮州 | Shandong | 115.38, 35.72 |

This is one problem, not three. The Ming boundaries here interlocked in a way the modern provinces do not reproduce, and the three edges must be corrected as a single connected piece so the result stays gap-free.

### 9. Yunnan — one seat outside, 1.42x the hull

孟艮御夷府 (99.61, 21.29) falls outside the southern edge. 御夷府 units are frontier prefectures over non-Han populations.

Do not simply extend the civil shape south to swallow it. The southern and western frontier was administered through the jimi commissions, whose extent belongs in `jimi` geometry records with `topology: overlapping`. Decide per unit whether it is civil or jimi, and record it accordingly.

### 10. Structural merges — mechanical, low risk

No evidence problems; these only need interior boundaries dissolved.

- **Nanjing** (1.02x): Jiangsu + Anhui + Shanghai already merged in the builder. Verify no interior seam remains.
- **Huguang** (1.01x): Hubei + Hunan, same check.
- **Guangdong**: Hainan is included as Qiongzhou prefecture.

### 11. Close to usable

Henan (0.97x), Shandong (1.06x), Shanxi (1.08x), Jiangxi (1.11x), Zhejiang (1.12x), Fujian (1.15x) show no large-scale discrepancy. They still need their shared edges checked against neighbours, and Henan, Shandong, Shanxi carry the specific problems listed above.

## Order of work

1. Shaanxi western cut — largest error, and it is independent of every other province.
2. Jingshi and Shanxi northern cuts — one shared Great Wall line.
3. The Shandong–Jingshi–Henan tripoint — one connected piece.
4. Guangdong and Guangxi coastal margin — one connected piece.
5. Sichuan southern edge, with the four 军民府 resolved as civil or jimi.
6. Yunnan southern edge, with the jimi commissions split out.
7. Guizhou — last, since it depends on Huguang and Sichuan being settled.

Adjacent provinces must be edited together with topological editing on, so a shared edge is drawn once and no gap or overlap is introduced.

## Before a shape becomes a record

Each corrected shape needs a geometry record under `data/geometries/civil/`, which requires the textual evidence for the corrected edges, a `boundaryAccuracy` value, and sources whose `redistribution` is `allowed`. Natural Earth is public domain and satisfies the source requirement for the baseline, but it is evidence for modern geography only — the historical claim rests on the textual sources cited per edge.

Re-running the two comparisons above after correction should show no seat outside its own province. That is a floor, not a proof of correctness.
