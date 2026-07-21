# Paddock Links

> Connect Formula 1 drivers through the teammates they shared, then build the case with pinned driver notes, tactile team-colored strings, and satisfying physical feedback.

**Status:** playable vertical slice in active development.

## Playable prototype

The private prototype currently includes a deterministic graph-versioned Daily Chain, a generated 130-driver modern-era graph, five curated Formation Lap challenges, Free Play target selection, evidence-backed team validation, adaptive hints, par-aware results, first-time onboarding, local unfinished-round restoration, persistent motion, contrast, sound, and haptics settings, and structured data-report preparation.

Milestone 3.5 is underway as a dedicated design-system, interaction-polish, responsive, and accessibility pass before the wider MVP feature set. The canvas-first paper case board, pinned-note interaction, keyboard accelerators, and optional procedural sound/haptics layer are established; screen-reader review, narrow-device refinement, sound-on/off tuning, and real-device playtesting remain the release gate.

## The idea

Paddock Links is a browser-based Formula 1 connection game. Each puzzle begins with two drivers. The player builds a chain between them using current or former teammates and names the team behind every connection.

Example:

**Hadjar — Verstappen (Red Bull) — Sainz (Toro Rosso) — Leclerc (Ferrari)**

Any valid chain completes the puzzle. The shortest known route is shown as the puzzle's **par**, but it is never the only accepted answer.

## Why it should be fun

The graph is also the toy. Drivers live on pinned paper notes across a warm case board. Lifting a note drops its pushpin and leaves a temporary puncture in the paper; releasing the note pins it into its new position. Textured strings preserve the relationships between notes, adopt the historical team's color, and gain an evidence label when verified.

The experience should combine:

- accessible F1 knowledge;
- a discoverable graph puzzle;
- playful arranging and tactile physical feedback;
- the satisfaction of completing an evidence board;
- routes worth comparing and sharing.

## Rules at a glance

1. Connect the two target drivers through one or more teammates.
2. Name a valid shared team for every driver-to-driver connection.
3. Any valid complete chain wins.
4. Shorter routes improve the result but do not determine whether the answer is accepted.
5. A teammate connection is based on both drivers appearing for the same constructor at the same World Championship Grand Prix.
6. Historical team identities are preserved. Toro Rosso, AlphaTauri, RB, and Racing Bulls are separate answers.
7. Test, reserve, academy, and practice-only relationships do not create teammate connections.

See [Game Design](docs/GAME_DESIGN.md) for the complete rules.

## Core interaction

- Two pinned target-driver notes begin on opposite sides of the board.
- The player opens **Add driver** from the board or with **Shift + Space**, then searches or browses for an intermediate driver. If one search result remains, **Enter** places it.
- Clicking a note attachment and completing a string at another note opens a searchable mouse-first grid of historical teams. When either driver or team search leaves one result, **Enter** confirms it; **Arrow Down** moves into the result grid.
- A correct driver-and-team relationship ties into place with a textured, historically colored string and evidence label.
- Notes remain freely movable after connections are made; their old pinhole fades after ten seconds.
- Completing the route reveals the par comparison, chosen route, and supporting evidence. Spoiler-safe and full-route sharing remain MVP work.

## Documentation

- [Project Outline](docs/PROJECT_OUTLINE.md) — product summary, audience, goals, scope, and risks
- [Game Design](docs/GAME_DESIGN.md) — rules, modes, scoring, hints, interaction, and accessibility
- [Data Model](docs/DATA_MODEL.md) — source strategy, teammate derivation, schema, and validation
- [Technical Architecture](docs/ARCHITECTURE.md) — recommended implementation and repository structure
- [Visual and Audio Direction](docs/VISUAL_AUDIO.md) — board, motion, color, sound, and brand language
- [Development Roadmap](docs/ROADMAP.md) — milestones, exit criteria, and prioritized backlog
- [Decision Log](docs/DECISIONS.md) — accepted product decisions and unresolved choices

## Proposed MVP

The first public-quality build should contain:

- a trusted modern-era driver graph;
- hand-picked and seeded random puzzles;
- a movable pinned-note-and-string board;
- exact validation of driver and team connections;
- par calculation without shortest-route enforcement;
- hints;
- local statistics;
- sound, motion, and accessibility controls;
- Daily Chain and Free Play modes.

Accounts, multiplayer, global leaderboards, and the full historical archive can follow after the core interaction is proven.

## Data approach

The game should generate a small, versioned teammate graph ahead of deployment. Gameplay should not depend on a live external API.

The proposed primary source is [F1DB](https://github.com/f1db/f1db), which provides Formula 1 data from 1950 to the present in SQLite, JSON, CSV, and SQL formats under CC BY 4.0. [Jolpica F1](https://github.com/jolpica/jolpica-f1) can provide a second source for updates and verification.

Team names, aliases, historical colors, and data exceptions remain curated game content and should be reviewed independently.

## Product principles

- **Correct beats clever.** Every accepted connection must be explainable with evidence.
- **Valid is valid.** A longer correct chain is still a win.
- **The board should feel good.** Movement, strings, labels, and sound are core gameplay.
- **History keeps its identity.** Rebrands are shown with the name used at the time.
- **Difficulty should invite curiosity.** Hints teach rather than punish.
- **Accessibility is part of the first build.** Keyboard, touch, reduced motion, high contrast, and sound controls are baseline requirements.

## Current development stage

The modern-era data proof and playable vertical slice are operational. Current work is closing the Milestone 3/3.5 quality gate:

1. first-time, narrow-phone, touch, keyboard, and screen-reader testing;
2. responsive and interaction fixes found by those sessions;
3. an original sound/haptics layer with independent mute controls;
4. reusable design tokens, interaction benchmarks, and an accessibility review record;
5. then Daily Chain, reviewed puzzle generation, difficulty tiers, statistics, and sharing.

### Later hint research

A proposed **race dossier** hint mode would give the player a seeded packet of race-result evidence—potentially ten races from the relevant years—with useful records mixed among plausible red herrings. The player would investigate the race lists rather than receive the next driver directly. This is intentionally later work because it needs additional per-race data, a dedicated dossier interface, deterministic Daily behavior, and fairness rules for cases where point-scoring finishers do not expose the relevant teammate relationship.

## Development

The standard-library Python data proof in `pipeline/` is operational for the modern-era slice. The importer treats F1DB `RACE_RESULT` rows as the authoritative race-entry boundary, derives evidence-backed teammate edges, supports historical-team and shortest-route queries, and generates the compact 130-driver client graph. Graph-diff reporting, secondary-source comparison, disputed-edge suppression, and early-era exception work remain before expanding the historical scope.

### Playable interaction prototype

The playable test board lives in `app/`. It includes draggable pinned driver notes,
historical-team validation, textured colored strings, evidence cards, hints,
Undo, Auto-arrange, keyboard movement, reduced-motion support, and completion
feedback for the Hadjar-to-Leclerc demo puzzle.

Run it locally with:

```powershell
cd app
npm.cmd install
npm.cmd run dev
```

The private test deployment is available at
https://paddock-links-prototype.matyas-szulyak.chatgpt.site.

The source is pinned in `data/sources/f1db-v2026.10.0.json`. Download and extract its
SQLite artifact into the ignored local cache, then build the initial modern-era graph:

```powershell
python -m pipeline.paddock_links.cli build `
  --database .cache/f1db/v2026.10.0/sqlite/f1db.db `
  --source-version v2026.10.0 `
  --minimum-year 2000 `
  --output data/generated/graph-v2026.10.0-modern.json
```

Generate the compact, evidence-summarized package consumed by the browser app:

```powershell
python -m pipeline.paddock_links.cli build-client `
  --database .cache/f1db/v2026.10.0/sqlite/f1db.db `
  --source-version v2026.10.0 `
  --minimum-year 2000 `
  --graph-version modern-2000-v2026.10.0 `
  --output app/app/data/graph-v2026.10.0-modern.json
```

Run the deterministic domain tests with:

```powershell
python -m unittest discover -s tests -v
```

Run the pinned historical regression audit with:

```powershell
python -m pipeline.paddock_links.cli audit `
  --database .cache/f1db/v2026.10.0/sqlite/f1db.db `
  --source-version v2026.10.0 `
  --fixtures data/curated/regressions.json
```

Inspect a specific connection and its event evidence with the `query` command:

```powershell
python -m pipeline.paddock_links.cli query `
  --database .cache/f1db/v2026.10.0/sqlite/f1db.db `
  --source-version v2026.10.0 `
  --driver-a max-verstappen `
  --driver-b carlos-sainz-jr
```

## Attribution and trademarks

Paddock Links is an independent fan-game concept and is not affiliated with Formula 1, the FIA, any constructor, or any driver. Formula 1, team, driver, sponsor, and event names may be trademarks of their respective owners. Data, imagery, logos, fonts, and audio require separate rights and attribution review before public or commercial release.
