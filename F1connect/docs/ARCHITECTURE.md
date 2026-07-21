# Paddock Links — Technical Architecture

## Status

This is the recommended starting architecture for the MVP. It favors a small, testable, static-first application. Technology choices remain provisional until the data proof and interaction prototype identify real constraints.

## Architecture goals

- validate every connection locally and instantly;
- keep external APIs out of the live gameplay path;
- make puzzles reproducible by seed and data version;
- preserve evidence for every accepted edge;
- support mouse, touch, keyboard, and assistive technology;
- allow the board to feel physical without sacrificing control;
- deploy as an inexpensive static web application;
- keep a clear path to optional accounts and leaderboards later.

## System overview

Paddock Links has three main layers:

1. **Data pipeline** — imports source data, normalizes identities, derives teammate evidence and graph edges, validates the graph, and generates versioned artifacts.
2. **Browser application** — loads compact graph data, runs the puzzle and board, validates answers, stores local progress, and renders evidence.
3. **Optional services** — later support for global leaderboards, accounts, moderated challenges, or remote configuration. These are outside the MVP.

## Recommended implementation shape

### Frontend

- TypeScript for domain types and validation.
- React or another component-based UI library for controls, panels, and stateful flows.
- A modern static build tool.
- SVG for pucks, strings, labels, focus targets, and most board rendering.
- DOM controls alongside the SVG for search, team selection, settings, and accessible alternatives.
- Web Audio API or small original audio assets for responsive sound.
- Local storage or IndexedDB for settings, daily history, streaks, and cached graph versions.

SVG is the preferred first renderer because a normal puzzle contains few visible pucks, connections must remain crisp and labeled, and SVG elements can participate in focus and accessibility more naturally than a single canvas.

Canvas or WebGL should be considered only if profiling demonstrates a real need, such as a future all-driver exploration view.

### Data pipeline

The pipeline may be implemented in TypeScript, Python, or another language that handles SQLite and JSON reliably. The important boundary is its output contract, not matching the frontend language.

Responsibilities:

- download or receive an immutable source release;
- record source versions and checksums;
- normalize driver, constructor, event, and entry records;
- apply curated aliases, colors, corrections, and exceptions;
- derive teammate evidence and compact edges;
- calculate graph components and puzzle features;
- validate schemas and regression fixtures;
- generate a graph diff and quality report;
- write immutable client artifacts.

The pipeline should be runnable locally and in continuous integration without depending on a production database.

## Runtime data packages

### Manifest

Contains:

- graph version;
- build timestamp;
- source versions;
- schema version;
- compatible app version;
- content hashes;
- available eras;
- feature flags.

### Core package

Loaded at application start:

- compact driver metadata;
- compact constructor metadata;
- adjacency lists;
- component IDs;
- team palette references.

### Evidence packages

Loaded when needed:

- shared seasons and events;
- supporting source references;
- multiple valid teams;
- educational team-lineage context.

Evidence can be chunked by driver or graph region if the all-time dataset becomes large.

### Puzzle catalog

Contains curated or prevalidated puzzles:

- puzzle ID;
- two target-driver IDs;
- difficulty tier;
- par;
- graph version;
- editorial flags;
- optional daily date;
- spoiler-safe share metadata.

Free Play puzzles can be generated locally against the same graph.

## Domain modules

### Graph engine

- edge lookup;
- valid team lookup;
- path existence;
- breadth-first par calculation;
- optional route enumeration with safe limits;
- component membership;
- seeded pair selection;
- difficulty features.

### Puzzle engine

- puzzle creation and restoration;
- completion detection;
- hint progression;
- result calculation;
- Daily Chain data-version freezing;
- share-code encoding and decoding.

### Board engine

- puck positions and velocities;
- direct dragging;
- collision and boundary handling;
- damped string constraints;
- label placement;
- auto-arrange;
- reduced-motion behavior;
- viewport resize and mobile layout.

Start with a small custom motion system tuned to the exact interaction. Introduce a physics library only if collision and constraint behavior would otherwise consume significant engineering effort or remain unstable.

### Validation engine

The graph, not the UI, determines correctness.

Given two driver IDs and a selected constructor ID, it returns:

- valid or invalid;
- all valid shared constructors;
- evidence reference;
- canonical label;
- player-safe explanation.

Keeping this in a pure domain module makes it easy to test and reuse in graphical and non-graphical interfaces.

### Accessibility model

Maintain a semantic representation of the board independent from coordinates:

- ordered list of pucks;
- validated and provisional links;
- start and target status;
- current chain membership;
- selected item;
- available actions;
- polite and urgent announcements.

The visual graph consumes this model; it is not the only representation of game state.

## Application state

Suggested top-level slices:

- app configuration;
- loaded data manifest;
- active puzzle;
- board objects and layout;
- answer graph;
- interaction and selection;
- hint state;
- timer;
- result;
- settings and accessibility preferences;
- local history;
- error and data-report context.

Persist the logical answer and puzzle state, not transient velocity or animation frames. When restoring a round, calculate a readable layout from stored positions or Auto-arrange.

## Puzzle identifiers and reproducibility

A puzzle identifier should resolve to:

- graph version;
- generator version;
- pair of target IDs;
- difficulty options;
- optional editorial record.

A daily seed alone is insufficient if graph updates can change par or edge validity. Daily and shared challenges must either embed or resolve the graph version.

## Physics and rendering loop

- pointer events update the directly dragged puck immediately;
- the motion loop applies damping, boundaries, optional collision, and string constraints;
- visual rendering is synchronized with animation frames;
- logical validation never waits for physics;
- pausing, hidden tabs, and reduced-motion mode stop unnecessary updates;
- labels use stable placement rules and collision avoidance;
- large changes such as Auto-arrange animate briefly or apply instantly in reduced-motion mode.

Target smooth interaction on ordinary mobile hardware before adding decorative particle effects.

## Audio system

Use event-based audio cues:

- puck picked up;
- puck placed;
- provisional string tension;
- valid link;
- invalid release;
- hint;
- chain completion.

Audio state must unlock safely after user interaction, tolerate browser restrictions, and never block gameplay. Settings require master, effects, and music or completion controls as appropriate.

## Local persistence

The MVP can store:

- settings;
- completed Daily Chain IDs;
- results;
- streak calculation inputs;
- last unfinished puzzle;
- tutorial completion;
- cached manifest and data packages.

Provide Clear local data and Export results actions. Do not imply cloud synchronization.

## Optional backend boundary

A backend becomes justified when the product needs:

- authoritative global leaderboards;
- account synchronization;
- abuse-resistant competitive results;
- public challenge discovery;
- moderation;
- remote puzzle scheduling;
- server-side analytics or experiments.

The core graph and validation should remain shared, deterministic domain code where practical. The browser must still be able to explain an answer from versioned evidence.

## Repository structure

A possible future structure under F1connect:

- app/ — browser application
- app/src/components/ — interface components
- app/src/board/ — SVG rendering and motion
- app/src/domain/ — graph, puzzle, and validation logic
- app/src/accessibility/ — semantic board and announcements
- app/src/audio/ — audio events and settings
- app/src/styles/ — design tokens and responsive layout
- pipeline/ — import, normalization, graph generation, and audit
- data/curated/ — aliases, palettes, corrections, and fixtures
- data/generated/ — versioned runtime artifacts where appropriate
- tests/ — end-to-end and cross-package fixtures
- docs/ — product and engineering documentation

Generated source dumps and bulky intermediate databases should not be committed unless there is a deliberate reproducibility reason and licensing permits it.

## Testing strategy

### Unit tests

- teammate-edge derivation;
- aliases and canonical team labels;
- connection validation;
- breadth-first par;
- completion across longer-than-par routes;
- hints;
- result calculation;
- seeded puzzle reproduction;
- reduced-motion board behavior.

### Data tests

Use the checks and historical regression fixtures described in [DATA_MODEL.md](DATA_MODEL.md).

### Component tests

- search and selection;
- team answer flow;
- keyboard board actions;
- validation messages;
- settings;
- result panel;
- evidence panel.

### End-to-end tests

- onboarding puzzle;
- valid par route;
- valid longer route;
- invalid team on a valid pair;
- multiple shared teams;
- interrupted and restored Daily Chain;
- keyboard-only completion;
- reduced motion;
- narrow mobile viewport;
- spoiler-safe share.

### Visual and audio QA

Automated snapshots can catch layout regressions, but puck feel, string tension, sound latency, contrast, and touch accuracy require human review on real devices.

## Performance budgets

Set measurable budgets before implementation hardens:

- fast first usable puzzle on a normal mobile connection;
- no external request during link validation;
- smooth direct dragging;
- bounded route enumeration;
- lazy-loaded detailed evidence;
- small initial audio payload;
- no continuous animation while settled or hidden.

Exact thresholds should be chosen from prototype measurements rather than guessed in advance.

## Error handling

- If the graph cannot load, explain the problem and offer Retry.
- If evidence is missing for an edge, hide it from playable content rather than accept it silently.
- If a saved puzzle targets an unavailable graph version, preserve the result as historical and explain the limitation.
- If audio fails, gameplay continues without interruption.
- A data-report action should prefill puzzle, driver, team, and graph version without including personal data.

## Security and privacy

- treat imported source text as untrusted;
- validate generated JSON against schemas;
- escape all labels;
- avoid rendering arbitrary remote HTML;
- do not put private information in share codes;
- collect no personal data for the static MVP;
- document any analytics and consent behavior before adding them;
- keep dependencies minimal and reviewed.

## Deployment

The MVP can be a static deployment with immutable hashed assets:

1. run pipeline checks;
2. build or select a graph version;
3. run application tests;
4. build the static client;
5. run accessibility and bundle checks;
6. deploy to a preview;
7. complete manual interaction QA;
8. promote the same artifact to production.

Graph updates should follow the same release discipline as code.

## Technical decisions still to validate

- exact frontend framework and build tool;
- pipeline language;
- custom motion system versus a physics library;
- local storage versus IndexedDB for results;
- content chunking strategy;
- whether share codes embed target IDs or resolve through a catalog;
- hosting and analytics providers;
- how long historical graph versions remain available.
