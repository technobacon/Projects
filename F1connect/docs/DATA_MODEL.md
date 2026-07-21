# Paddock Links — Data Model

## Objective

Produce a trustworthy, versioned graph that answers:

1. Are two drivers valid teammates under the game rules?
2. Which historical team identities and events prove the relationship?
3. What routes connect any two eligible drivers?
4. What is the shortest known link count for a puzzle?
5. Can the game explain every accepted answer to a player?

The generated game graph should be small enough to ship with the browser application. External data services should be used during ingestion and verification, not required during a round.

## Source strategy

### Proposed primary source: F1DB

[F1DB](https://github.com/f1db/f1db) publishes data from 1950 to the present and offers SQLite, JSON, CSV, and SQL release artifacts. Its dataset is licensed under CC BY 4.0.

The SQLite release is a strong ingestion candidate because it preserves relationships and can be queried reproducibly during a build.

### Proposed verification source: Jolpica F1

[Jolpica F1](https://github.com/jolpica/jolpica-f1) is the open-source successor to the Ergast API and exposes drivers, constructors, races, and results through compatible endpoints.

It can support:

- current-season update checks;
- targeted verification of disputed relationships;
- comparison tests against the primary import;
- evidence links for maintainers.

The application should respect the source's current terms and rate limits and should cache ingestion requests.

### Curated project data

Some content should remain version-controlled in this repository:

- canonical display labels;
- accepted spelling aliases;
- historical team-color palettes;
- contrast-safe string and label colors;
- driver-name corrections or disambiguation;
- explicitly reviewed edge inclusions or exclusions;
- source attribution;
- puzzle exclusions and editorial notes.

Team colors should not be inferred from arbitrary web imagery. Jolpica has an open request for constructor colors, so a reviewed local palette is currently the safer approach.

## Authoritative gameplay rule

A teammate edge exists when two different drivers both appear for the same constructor in the same Formula 1 World Championship Grand Prix.

The shared event is the evidence unit.

This deliberately excludes looser ideas such as being employed by the same organization, belonging to the same junior program, testing the same car, or driving for the same team in non-overlapping seasons.

## Conceptual entities

### Driver

| Field | Purpose |
| --- | --- |
| id | Stable internal identifier |
| source_ids | Identifiers from each imported source |
| given_name | Display and search |
| family_name | Display, search, and sorting |
| common_name | Preferred public label |
| name_aliases | Alternate spellings and transliterations |
| nationality | Optional clue and metadata |
| date_of_birth | Disambiguation |
| active_from / active_to | Filters and difficulty |
| image_ref | Optional rights-reviewed asset reference |
| status | Active, historical, hidden, or review required |

### Constructor identity

This represents the historical identity shown as the answer, not an abstract ownership lineage.

| Field | Purpose |
| --- | --- |
| id | Stable internal identifier |
| source_ids | Source mappings |
| canonical_name | Valid displayed team answer |
| accepted_aliases | Input normalization |
| active_from / active_to | Historical validation |
| lineage_id | Optional educational grouping |
| color_set_id | Historical visual palette |
| status | Active, historical, hidden, or review required |

### Event

| Field | Purpose |
| --- | --- |
| id | Stable event identifier |
| season | Championship season |
| round | Round within the season |
| grand_prix_name | Evidence display |
| event_date | Ordering and historical context |
| source_ids | Verification |

### Race entry

| Field | Purpose |
| --- | --- |
| event_id | Shared-event evidence |
| driver_id | Entered driver |
| constructor_id | Historical constructor identity |
| participation_status | Started, DNS, DSQ, or other source status |
| car_number | Evidence and disambiguation |
| source_record | Traceability |
| review_status | Accepted, excluded, or needs review |

### Teammate evidence

Each record links two drivers to one constructor and one event.

| Field | Purpose |
| --- | --- |
| driver_a_id | Lower-sorted stable driver ID |
| driver_b_id | Higher-sorted stable driver ID |
| constructor_id | Valid answer |
| event_id | Proof of overlap |
| evidence_source | Source and version |
| review_status | Automated, manually approved, or disputed |

### Teammate edge

This is the compact graph projection used by the game.

| Field | Purpose |
| --- | --- |
| driver_a_id / driver_b_id | Undirected graph endpoints |
| teams | Valid historical constructor identities |
| first_shared_event | Explanation and filters |
| last_shared_event | Explanation and filters |
| shared_event_count | Confidence and educational detail |
| evidence_refs | Lookup into detailed evidence |
| difficulty_weight | Optional editorial weight |
| status | Playable, hidden, or review required |

### Team color set

| Field | Purpose |
| --- | --- |
| id | Stable palette identity |
| constructor_id | Historical team identity |
| valid_from / valid_to | Date or season range |
| string_color | Board connection |
| label_background | Readable label surface |
| label_foreground | Text color |
| accent_color | Motion and completion effects |
| source_note | Editorial provenance |
| accessibility_status | Contrast and color-vision review |

## Derivation pipeline

1. Import source releases into a normalized staging area.
2. Map source driver and constructor identifiers to stable project IDs.
3. Normalize names without discarding original values.
4. Import race-level entries and participation status.
5. Apply reviewed exclusions and corrections.
6. Group entries by event and constructor.
7. Generate every unique pair of different drivers within each group.
8. Attach the event and constructor as evidence.
9. Collapse repeated evidence into undirected teammate edges.
10. Attach valid teams, date ranges, counts, colors, aliases, and review status.
11. Run integrity and regression checks.
12. Produce versioned browser artifacts and a human-readable audit report.

## Graph representation

The runtime graph can use:

- a driver dictionary keyed by stable ID;
- a constructor dictionary keyed by stable ID;
- an adjacency list for teammate edges;
- a separate evidence dictionary loaded on demand;
- precomputed connected-component identifiers;
- optional precomputed difficulty and familiarity values.

A link lookup should be constant-time or close to it. Route search can use breadth-first search because every teammate link has equal length for par calculation.

The product may later use weighted search for puzzle difficulty, but weighted difficulty must not change answer validity or par.

## Puzzle generation

For a target difficulty:

1. select an allowed graph component;
2. choose two eligible drivers;
3. calculate par with breadth-first search;
4. reject pairs outside the configured par range;
5. calculate familiarity and ambiguity features;
6. reject pairs relying on disputed edges;
7. ensure at least one explainable route exists;
8. record the data version and generator version;
9. optionally submit Daily Chain candidates for editorial review.

The exact shortest route does not need to be unique. The game should say a shortest route, not the only correct route.

## Team lineage and rebrands

Lineage is useful context but is not the gameplay identity.

For example, a lineage may connect organizational eras, while the playable constructor records remain distinct. A player must choose the label used for the actual shared event.

This separation prevents:

- accepting a modern name for a historical relationship;
- assigning modern colors to an older team;
- collapsing sponsors or constructors incorrectly;
- confusing ownership continuity with race-entry identity.

Lineage should never create a teammate edge on its own.

## Identity and alias handling

### Drivers

- prefer stable source IDs over names;
- preserve diacritics in display names;
- normalize case, whitespace, punctuation, and common transliterations for search;
- maintain explicit aliases rather than relying only on fuzzy matching;
- disambiguate family members and repeated surnames with given name and active years.

### Teams

- store one canonical historical label;
- accept reviewed full names, short names, sponsor-name variants, and punctuation variants;
- never accept the name of a different brand era solely because it shares a lineage;
- show the canonical label after validation.

## Validation

### Automated integrity checks

- no self-links;
- every edge has at least one evidence record;
- every evidence record points to two distinct entries at the same event and constructor;
- every referenced driver, constructor, event, and color set exists;
- edge ordering is stable;
- no duplicate evidence;
- aliases do not collide unexpectedly;
- every playable graph component meets minimum size rules;
- every generated puzzle is reproducible from its seed and data version;
- par recomputation matches stored puzzle metadata;
- browser artifacts validate against their schema.

### Regression cases

Maintain a reviewed fixture set covering:

- famous straightforward teammate pairs;
- drivers who shared multiple teams;
- mid-season replacements who overlapped;
- replacements who did not overlap;
- did-not-start and unusual participation statuses;
- team rebrands;
- identical or similar names;
- early-era multi-car entries;
- one-off drivers;
- known source corrections;
- intentionally rejected reserve, test, and FP1-only relationships.

### Human review

Every data report should capture:

- the two drivers;
- attempted team label;
- expected behavior;
- puzzle and data version;
- supporting source;
- maintainer decision and rationale.

Corrections should enter the regression set so the same problem cannot silently return.

## Data versions and updates

Use explicit immutable versions, for example:

- source release version;
- ingestion-pipeline version;
- curated-overrides version;
- generated-graph version.

A Daily Chain remains attached to the version on which it was published. Updating the graph must not change a puzzle halfway through its daily window.

Recommended update flow:

1. fetch the newest source release;
2. produce a graph diff;
3. review added and removed drivers, teams, entries, and edges;
4. run the full regression set;
5. inspect current-season changes;
6. publish a new graph version;
7. retain previous evidence for old shared challenges where practical.

## Runtime artifacts

A future generated-data directory could contain:

- graph manifest and version;
- compact drivers;
- compact constructors;
- teammate adjacency;
- evidence chunks;
- team palettes;
- reviewed puzzle catalog;
- data quality report.

The source import database and bulky intermediate files should remain build artifacts rather than client downloads.

## Attribution and rights

- Preserve the attribution required by F1DB's CC BY 4.0 license if F1DB is used.
- Review and comply with Jolpica's current terms before automated ingestion.
- Record the origin and transformation of every published field.
- Treat photographs, helmets, logos, fonts, liveries, broadcasts, and official audio as separate rights questions; data availability does not grant visual-asset rights.
- Publish a clear independent-project disclaimer.
- Complete a dedicated rights review before commercial release.

This document is a technical product policy, not legal advice.
