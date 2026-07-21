# Paddock Links

> Connect Formula 1 drivers through the teammates they shared, then bring the chain to life with movable pucks, elastic team-colored strings, and satisfying audiovisual feedback.

**Status:** concept and pre-production documentation.

## The idea

Paddock Links is a browser-based Formula 1 connection game. Each puzzle begins with two drivers. The player builds a chain between them using current or former teammates and names the team behind every connection.

Example:

**Hadjar — Verstappen (Red Bull) — Sainz (Toro Rosso) — Leclerc (Ferrari)**

Any valid chain completes the puzzle. The shortest known route is shown as the puzzle's **par**, but it is never the only accepted answer.

## Why it should be fun

The graph is also the toy. Driver tokens behave like light hockey pucks on an icy investigation board. Players can drag them into a pleasing arrangement while elastic strings preserve the relationships between them. Each correct connection snaps into place, adopts the historical team's color, gains a team label, and adds a satisfying sound.

The experience should combine:

- accessible F1 knowledge;
- a discoverable graph puzzle;
- playful arranging and light physics;
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

- Two target-driver pucks begin on opposite sides of the board.
- The player searches or browses for an intermediate driver and places that puck on the board.
- Pulling a string between two pucks opens a compact team selector.
- A correct driver-and-team relationship snaps into place with color, motion, and sound.
- Pucks remain freely movable after connections are made.
- Completing the route reveals the par route, alternative solutions, supporting seasons, and a shareable result.

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
- a movable puck-and-string board;
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

## Current next step

Build a data proof that can answer three questions reliably:

1. Are two drivers valid teammates?
2. Which historical team or teams connect them?
3. What valid routes exist between any selected pair?

Once that proof passes a curated set of historical examples, build the interactive vertical slice around it.

## Attribution and trademarks

Paddock Links is an independent fan-game concept and is not affiliated with Formula 1, the FIA, any constructor, or any driver. Formula 1, team, driver, sponsor, and event names may be trademarks of their respective owners. Data, imagery, logos, fonts, and audio require separate rights and attribution review before public or commercial release.
