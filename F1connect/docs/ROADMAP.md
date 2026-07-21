# Paddock Links — Development Roadmap

## Roadmap philosophy

Build trust before scale and feel before features.

The first technical risk is historical correctness. The first product risk is whether moving pucks and connecting strings genuinely feels satisfying. The roadmap tackles those risks before accounts, leaderboards, or a large content catalog.

Milestones use exit criteria rather than promised dates. A milestone is complete when its outcome is demonstrated.

## Milestone 0 — Foundation

**Goal:** align the product around a clear concept and shared rules.

### Deliverables

- project overview;
- product outline;
- game rules;
- data model and evidence policy;
- proposed architecture;
- visual and audio direction;
- development roadmap;
- decision log.

### Exit criteria

- any valid chain is explicitly accepted;
- par is defined as informational and mastery-oriented;
- teammate eligibility is defined;
- historical team identities are separated from lineage;
- the next data and interaction proofs are clear.

**Status:** documentation baseline complete.

## Milestone 1 — Data proof

**Goal:** demonstrate that the project can produce a trusted teammate graph.

### Work

- select and record a specific F1DB release;
- implement source import;
- establish stable internal IDs;
- normalize drivers, constructors, events, and race entries;
- implement curated aliases and corrections;
- derive teammate evidence from shared event and constructor entries;
- collapse evidence into graph edges;
- calculate connected components and par routes;
- build a small query or audit interface;
- create historical regression fixtures;
- compare targeted edges with Jolpica;
- generate a graph quality report and diff.

### Required proof cases

- a familiar current teammate pair;
- Verstappen and Sainz at Toro Rosso;
- Sainz and Leclerc at Ferrari;
- drivers who shared multiple teams;
- a mid-season substitute who overlapped;
- two drivers at the same team in one season who did not overlap;
- a did-not-start edge;
- a practice-only relationship that must be rejected;
- a team rebrand;
- similar or ambiguous driver names;
- at least one early-era edge if early history is imported.

### Exit criteria

- the system can answer driver pair, valid team labels, and evidence;
- par can be calculated for any connected eligible pair;
- longer valid chains pass completion tests;
- all regression cases pass;
- every playable edge has evidence;
- source versions and attribution are recorded;
- disputed edges can be hidden without changing source data.

## Milestone 2 — Interaction prototype

**Goal:** prove that the board is enjoyable and controllable.

Use a small hand-authored data set so interaction can be tested independently from the full pipeline.

### Work

- responsive board;
- draggable pucks;
- string pulling and snapping;
- movable completed layout;
- team-label prompt;
- direct validation;
- Undo and Remove;
- Auto-arrange;
- target and completion states;
- basic sound cues;
- pointer, touch, and keyboard control;
- reduced-motion mode.

### Test questions

- Do pucks feel physical without drifting?
- Is creating a connection obvious?
- Can labels remain readable after rearranging?
- Is the team-selection step quick?
- Does invalid feedback encourage another attempt?
- Is completion satisfying on mute?
- Can the full puzzle be completed without dragging?

### Exit criteria

- a first-time tester completes a guided chain;
- mouse, touch, and keyboard interactions work;
- the board settles quickly;
- labels remain understandable;
- reduced motion preserves the full game;
- valid completion feels satisfying with and without sound.

## Milestone 3 — Playable vertical slice

**Goal:** connect the trusted graph to the proven board in one polished flow.

### Work

- load versioned generated graph;
- driver search and tray;
- target-pair selection;
- driver-and-team validation;
- evidence cards;
- par calculation;
- any-valid-chain completion;
- longer-than-par result presentation;
- progressive hints;
- one difficulty tier;
- onboarding;
- local round restoration;
- basic error and data-report flow.

### Exit criteria

- a player can open the app and complete several real-data puzzles;
- no live API is required during gameplay;
- every accepted link can show evidence;
- invalid labels produce a clear explanation;
- multiple valid shared teams work;
- an interrupted puzzle restores safely;
- representative mobile performance is smooth.

## Milestone 4 — MVP feature set

**Goal:** create a small complete product suitable for private testing.

### Work

- Daily Chain with frozen graph version;
- Free Play;
- Formation Lap, Grand Prix, and Night Race difficulty;
- reviewed puzzle candidate generation;
- local statistics and streaks;
- spoiler-safe and full-route sharing;
- settings;
- audio mixing and original sound pass;
- visual design tokens and historical team palettes;
- high-contrast mode;
- accessibility audit;
- data attribution and independent-project disclaimer;
- local-data clear and export controls.

### Exit criteria

- daily puzzle is reproducible across devices using the same graph version;
- share output does not accidentally spoil by default;
- difficulty bands feel meaningfully different;
- settings persist;
- all core flows pass keyboard and screen-reader review;
- rights and attribution inventory exists;
- no known high-severity data or interaction defects remain.

## Milestone 5 — Private playtest and hardening

**Goal:** learn where players misunderstand, distrust, or abandon the experience.

### Work

- invite a mixed group of casual and expert F1 fans;
- observe onboarding and first completion;
- capture disputed data reports;
- compare expected and actual hint usage;
- test obscure and alternative valid routes;
- test small phones, tablets, laptops, and major browsers;
- profile data loading and board motion;
- test offline or unreliable network behavior after load;
- tune difficulty, search, feedback, and sound;
- review privacy, rights, and deployment readiness.

### Exit criteria

- most first-time players complete onboarding unaided;
- correct alternative routes are consistently accepted;
- disputed edges have an owner and resolution process;
- critical accessibility issues are resolved;
- data and application releases are reproducible;
- the team can publish and roll back a graph version safely.

## Milestone 6 — Public beta

**Goal:** release a stable, focused version and establish an operating rhythm.

### Work

- production hosting and monitoring;
- release notes;
- data-report intake;
- daily puzzle scheduling;
- data update cadence;
- public attribution and policies;
- lightweight consented analytics if justified;
- crash and performance monitoring;
- backup and rollback procedure;
- community feedback channel.

### Exit criteria

- Daily Chain operates reliably;
- the update process handles a current-season driver change;
- data corrections can be released without breaking old results;
- support and data reports receive consistent responses;
- the product has evidence for whether to expand.

## Milestone 7 — Expansion

Potential directions, prioritized by observed demand:

- full all-time graph;
- richer Deep History content;
- Sprint mode;
- friend challenges;
- route comparison and alternate-route gallery;
- optional account synchronization;
- global or friends-only leaderboards;
- curated themed weeks;
- constructor or era exploration views;
- editorial stories attached to surprising links;
- multilingual interface and aliases;
- installable offline web app;
- moderated community puzzle submissions.

Do not pursue all of these automatically. Each expansion should solve an observed player need and preserve the trusted core.

## Prioritized engineering backlog

### Must have

- deterministic source import;
- stable IDs;
- evidence-backed graph;
- regression fixtures;
- fast edge validation;
- any-valid-chain completion;
- accessible puck and link controls;
- readable responsive board;
- Undo and Auto-arrange;
- Daily Chain versioning;
- clear attribution and reporting.

### Should have

- graph diff tooling;
- progressive hints;
- curated difficulty features;
- evidence panel;
- original audio system;
- share code;
- offline-friendly cached data;
- data-quality dashboard or report.

### Could have

- alternate-route enumeration;
- advanced puck collisions;
- share images;
- custom challenge options;
- historical lineage explorer;
- haptics;
- installable application shell.

### Not now

- live telemetry;
- fantasy leagues;
- real-time multiplayer;
- chat;
- marketplace or monetized collectibles;
- official logo and photo dependency;
- heavy backend infrastructure.

## Quality gates for every release

### Data

- source and graph versions recorded;
- graph diff reviewed;
- regression suite passes;
- no playable edge lacks evidence;
- current-season changes inspected;
- attribution updated when necessary.

### Product

- any valid chain remains accepted;
- par never blocks completion;
- keyboard completion passes;
- reduced-motion completion passes;
- narrow mobile layout passes;
- sound-off completion remains understandable;
- share output is spoiler-safe by default.

### Engineering

- automated tests pass;
- generated artifacts validate;
- dependency and security checks pass;
- preview deployment reviewed;
- rollback artifact available;
- performance has not materially regressed.

### Editorial and rights

- daily puzzles avoid disputed edges;
- labels use historical team identity;
- team palettes remain readable;
- new assets have recorded provenance;
- disclaimers and attributions remain visible.

## Immediate recommended next action

Start Milestone 1 and Milestone 2 in parallel at the workstream level:

- one small data proof using a selected modern-era slice;
- one interaction prototype using a hand-authored graph of roughly a dozen drivers.

The two workstreams should meet at Milestone 3 only after each has passed its exit criteria.
