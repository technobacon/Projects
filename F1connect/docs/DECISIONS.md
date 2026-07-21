# Paddock Links — Decision Log

## Purpose

This file records decisions that shape product behavior, historical validity, architecture, and creative direction. It prevents the game rules from drifting across design, data, and implementation.

Status values:

- **Accepted:** current project rule;
- **Provisional:** recommended direction that still needs prototype evidence;
- **Open:** unresolved decision;
- **Superseded:** replaced by a later decision.

## Accepted decisions

### PL-001 — Product name

**Status:** Accepted

**Decision:** The working product name is **Paddock Links**.

**Rationale:** It describes relationships across the Formula 1 paddock and the literal links players create. It feels curious and approachable rather than purely statistical.

**Consequence:** Repository documentation uses Paddock Links while the folder remains F1connect. Naming and trademark review is still required before a commercial launch.

### PL-002 — Any valid chain completes a puzzle

**Status:** Accepted

**Decision:** A player wins whenever the two target drivers are connected by any continuous chain of valid teammate links.

**Rationale:** Alternative routes are a central pleasure of the graph. Rejecting a correct longer answer would undermine trust and discourage discovery.

**Consequence:** Completion detection checks connectivity and validity, not equality with a canonical route.

### PL-003 — Shortest path is par, not a gate

**Status:** Accepted

**Decision:** The shortest link count known to the current graph is displayed as par and may support an optional mastery badge.

**Rationale:** Par gives experts an optimization goal without turning longer historical knowledge into failure.

**Consequence:** Result copy leads with successful completion. Graph updates and versions must be recorded because par can change when data changes.

### PL-004 — Teammates require a shared event and constructor

**Status:** Accepted

**Decision:** Two drivers are gameplay teammates when both appear for the same constructor at the same Formula 1 World Championship Grand Prix.

**Rationale:** A shared event is clear, evidence-backed, and avoids false connections between non-overlapping drivers in the same season or organization.

**Consequence:** Testing, reserve status, academy membership, simulator work, and practice-only appearances do not create edges. Participation-status exceptions require explicit review.

### PL-005 — The team is part of the answer

**Status:** Accepted

**Decision:** A link is validated only when the player identifies both the driver relationship and a historically valid shared team.

**Rationale:** Naming the team makes each edge meaningful and powers the colored-string identity.

**Consequence:** The interface needs team selection or robust typed input, canonical labels, aliases, and multiple-team support.

### PL-006 — Historical identities remain distinct

**Status:** Accepted

**Decision:** Team lineage does not make historical brand names interchangeable answers.

**Rationale:** Toro Rosso, AlphaTauri, RB, and Racing Bulls describe different historical identities even when organizational continuity exists.

**Consequence:** Constructor identity and lineage are separate data concepts. Labels and colors follow the shared event's identity.

### PL-007 — Validation is evidence-backed

**Status:** Accepted

**Decision:** Every playable teammate edge must retain at least one shared event and constructor record as evidence.

**Rationale:** Players must be able to understand accepted and rejected answers, and maintainers need a path to correct data.

**Consequence:** Edges without evidence are hidden or treated as data defects.

### PL-008 — Gameplay does not depend on a live external API

**Status:** Accepted

**Decision:** The application uses a generated, versioned graph during play.

**Rationale:** Local validation is faster, more reliable, easier to test, and reproducible for Daily Chain.

**Consequence:** External sources are part of ingestion and verification. Graph updates follow a release process.

### PL-009 — Source strategy

**Status:** Provisional

**Decision:** Use F1DB as the primary import candidate and Jolpica F1 as a verification and current-season update source.

**Rationale:** F1DB offers downloadable relational and serialized releases with broad historical coverage. Jolpica exposes targeted Formula 1 result queries.

**Consequence:** The data proof must confirm field coverage, source terms, identity mapping, and exception behavior before the choice becomes final.

### PL-010 — Team colors are curated historical content

**Status:** Accepted

**Decision:** Maintain versioned team palettes with historical validity and accessible alternatives.

**Rationale:** Source feeds do not reliably provide the exact historical, readable colors the game needs.

**Consequence:** Colors receive editorial provenance, contrast testing, date ranges, and independent review.

### PL-011 — Accessibility is an MVP requirement

**Status:** Accepted

**Decision:** The complete core game must work without drag, sound, color-only cues, or elastic motion.

**Rationale:** Accessibility also provides robust alternatives when physics, mobile precision, browser audio, or visual density fail.

**Consequence:** The project maintains a semantic board model, keyboard actions, reduced motion, high contrast, and text feedback from the beginning.

### PL-012 — Daily puzzles freeze their graph version

**Status:** Accepted

**Decision:** A Daily Chain remains tied to the graph version used when it was published.

**Rationale:** A current-season update or correction could otherwise change par or validity during the same day.

**Consequence:** Puzzle IDs and results record a graph version, and old results remain interpretable.

### PL-013 — The first message after a valid chain is success

**Status:** Accepted

**Decision:** Completion feedback celebrates the valid route before comparing it with par, time, hints, or unused pucks.

**Rationale:** The product promise is that any valid chain wins.

**Consequence:** Copy such as Connected in 4 links · Par 3 is preferred over failed to find the shortest route.

## Provisional implementation decisions

### PL-014 — Static-first MVP

**Status:** Provisional

**Decision:** Build the MVP as a static browser application with local persistence and no required account service.

**Validation needed:** Daily Chain scheduling, share-code design, hosting constraints, and desired analytics.

### PL-015 — SVG board renderer

**Status:** Provisional

**Decision:** Begin with SVG plus DOM controls for the small interactive board.

**Validation needed:** real-device drag performance, label density, touch behavior, and accessibility testing.

### PL-016 — Tuned lightweight motion system

**Status:** Provisional

**Decision:** Prototype direct dragging, damping, collisions, and string tension with a small purpose-built motion layer before adopting a general physics engine.

**Validation needed:** implementation effort, stability, mobile performance, and Auto-arrange behavior.

### PL-017 — Modern-era first

**Status:** Provisional

**Decision:** Audit a modern-era slice before exposing the complete historical graph.

**Rationale:** Recognizable drivers make onboarding easier, while a smaller data surface makes rule and exception testing manageable.

**Validation needed:** choose the cutoff after measuring source coverage, graph connectivity, and player interest. Around 2000 is an initial candidate, not a final rule.

## Open decisions

### PL-018 — Team input method

**Status:** Open

Options:

- searchable selector;
- typed input with aliases;
- selector during onboarding and optional typing later;
- a small plausible multiple-choice set for specific modes.

Decision criteria include speed, accessibility, spelling fairness, localization, and resistance to blind guessing.

### PL-019 — Scoring details

**Status:** Open

Questions:

- Should time matter outside Sprint?
- Do invalid attempts affect only optional mastery?
- Do unused pucks affect the result?
- How are hints summarized?
- Is the Par Route badge sufficient without a numerical score?

The scoring system must never change a valid completion into failure.

### PL-020 — Initial era cutoff

**Status:** Open

Choose after the data proof reports:

- edge coverage;
- disconnected components;
- exception volume;
- source disagreements;
- driver familiarity;
- useful puzzle distribution.

### PL-021 — Driver representation

**Status:** Open

Possible MVP representations:

- initials and name;
- original silhouette;
- licensed portrait;
- flag and active years;
- abstract helmet-inspired but non-infringing token.

Rights, accessibility, download size, and recognition all affect the decision.

### PL-022 — Share format

**Status:** Open

Decide whether the primary share artifact is:

- text and symbols;
- generated image;
- link with spoiler-safe summary;
- replayable final board;
- a combination with explicit Full route control.

### PL-023 — Hint sequence and cost

**Status:** Open

Prototype contextual hints before fixed penalties. The first version must determine whether era, nationality, team count, initials, or bridge reveal is most useful.

### PL-024 — Hosting, analytics, and error reporting

**Status:** Open

Select only after privacy, consent, static deployment, regional requirements, and actual operating needs are understood.

### PL-025 — Early-era participation rules

**Status:** Open

The strict shared-event rule remains, but early Formula 1 data may contain unusual multi-car entries, shared drives, private entrants, and constructor naming. Each exception category needs explicit fixtures before becoming playable.

## Decision template

When adding a decision, record:

- identifier and title;
- status;
- date;
- decision;
- context;
- rationale;
- alternatives considered;
- consequences;
- validation or review trigger;
- links to implementation or evidence.

When a decision changes, preserve the old record as Superseded and link to the replacement. Do not silently rewrite historical rationale.
