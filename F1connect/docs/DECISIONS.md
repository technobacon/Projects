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

### PL-026 — Design polish is a dedicated product gate

**Status:** Accepted

**Decision:** Complete a distinct design-system and interaction-polish milestone after the playable vertical slice and before MVP feature expansion.

**Rationale:** Polishing before the rules and interaction model are proven creates avoidable rework, while leaving design scattered across later feature milestones makes the experience easy to defer indefinitely.

**Consequence:** Milestone 3.5 owns the visual language, interaction feel, responsive redesign, accessibility states, sound, and real-device QA. Milestone 4 does not begin until that gate passes.

### PL-027 — Use familiar racing names in play

**Status:** Accepted

**Decision:** Driver labels use the familiar first name and racing surname, such as Lewis Hamilton and Carlos Sainz, rather than full legal names.

**Rationale:** Compact familiar names are faster to scan, fit the pucks and selectors, and match how fans identify drivers during play.

**Consequence:** Source records retain full names for identity and audit purposes, while the client derives a shorter display label. Name exceptions remain curated when particles or compound surnames are part of the familiar racing name.

### PL-028 — Canvas-first string creation

**Status:** Accepted

**Decision:** The primary mouse interaction starts from a visible attachment on a puck, previews a live string to another puck, and opens a searchable grid of all historical teams only after the second puck is chosen.

**Rationale:** The relationship should be built directly on the evidence board. A grid preserves mouse-only play and historical-team discovery without making a long native selector the main interaction.

**Consequence:** Direct manipulation receives restrained release glide and reduced-motion support. The form-based driver and team controls remain as the keyboard-accessible fallback.

### PL-029 — Paper case board is the primary visual surface

**Status:** Accepted — 2026-07-21

**Decision:** Make the playable canvas the dominant surface: an oversized warm papyrus evidence sheet on a dark desk, with neutral ivory and beige driver pucks, elegant serif names, and the **Add driver** control embedded in the board's top-right corner.

**Rationale:** The graph is the product's distinctive toy. Reducing surrounding chrome and moving discovery onto the board keeps attention on arranging evidence, while neutral pieces let historically meaningful team-colored strings remain visually legible.

**Consequence:** Driver discovery opens as a searchable mouse-first grid instead of a permanent bottom tray. Side controls remain compact and secondary, team colors are not used to decorate driver pucks, and future visual polish should extend the archival detective language without reducing contrast, keyboard access, or touch usability.

### PL-030 — Drivers are pinned notes, not sliding pucks

**Status:** Accepted — 2026-07-21

**Decision:** Represent each driver as a paper case note secured by a pushpin. Picking up a note drops its pin and leaves a puncture that fades over ten seconds; releasing the note pins it at the new position. Verified relationships use visibly fibrous string rather than smooth technical lines.

**Rationale:** A pinned-note system makes the detective-board metaphor immediately legible and gives movement a purposeful physical beginning and end. The falling pin and temporary hole communicate that the note has been lifted without relying on inertia.

**Consequence:** This supersedes the release-glide portion of PL-028. Notes stop exactly where released, strings connect at their pins, and reduced-motion mode may suppress the falling animation while preserving the pinhole and repinned end state. **Shift + Space** opens driver discovery; when search produces one available driver, **Enter** adds that note.

### PL-031 — Search pickers share one-result keyboard confirmation

**Status:** Accepted — 2026-07-21

**Decision:** Driver and historical-team pickers use the same search convention: when the current query leaves exactly one result, **Enter** confirms it; **Arrow Down** moves focus from the search field into the result grid.

**Rationale:** The same keystroke should mean the same thing in adjacent selection steps. A visible one-match hint makes the accelerator discoverable without weakening mouse-only play.

**Consequence:** Enter never guesses among multiple results. Native button activation remains available after moving into the grid, and an invalid single team still follows normal validation and error feedback rather than silently closing the picker.

### PL-032 — Accessibility preferences are explicit and device-local

**Status:** Accepted — 2026-07-21

**Decision:** Provide a Settings dialog with System, Full, and Reduced motion choices plus Standard and High contrast choices. Persist these preferences locally on the device.

**Rationale:** Operating-system preferences remain the correct default, but testers need to exercise accessibility states directly and players may want a game-specific choice. Device-local storage fits the account-free prototype and avoids implying cross-device synchronization.

**Consequence:** Reduced motion suppresses the loose-pin fall and nonessential transitions while preserving the pinhole and final pinned state. Full motion can be selected explicitly; System follows `prefers-reduced-motion`. High contrast strengthens paper, note, label, modal, and focus boundaries without changing historical team identity or removing text labels.

### PL-033 — Feedback is procedural, optional, and redundant

**Status:** Accepted — 2026-07-21

**Decision:** Generate muted pickup/placement thumps, ascending C-major violin-like valid-link notes, a soft tonic violin completion phrase, and restrained invalid-evidence cues with Web Audio. Pair them with optional browser haptics and expose independent device-local switches for both channels.

**Rationale:** Procedural cues establish an original sound identity without introducing licensed assets or a download budget. Independent controls let players choose the feedback that works for their context and device.

**Consequence:** Audio and vibration reinforce existing motion, text, and status feedback but never carry required information. Unsupported haptics silently no-op, mute persists locally, and real-device testing remains required before the design gate closes.

### PL-034 — Daily Chain follows the Budapest calendar

**Status:** Accepted — 2026-07-21

**Decision:** Select the Daily Chain deterministically from the reviewed puzzle pool using the current Europe/Budapest calendar date. Persist the mode, date key, frozen graph version, and that date's completion locally.

**Rationale:** A single explicit timezone gives every player the same rollover boundary and makes daily results reproducible without a scheduling backend. Reusing reviewed cases keeps the first implementation trustworthy while the candidate pipeline grows.

**Consequence:** The daily pair cannot be rerolled during its date, but it may be replayed. A stale unfinished daily round is not restored after rollover. Formation Lap and Free Play remain independently selectable, while streak history and spoiler-safe sharing are separate follow-up work.

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

**Status:** Superseded

**Decision:** Replaced by PL-028. The primary input is a searchable all-team grid after a canvas string is completed, with form controls retained as an accessible fallback.

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

**Later candidate — race dossiers:** instead of revealing the next graph step, provide a seeded packet of race evidence from the puzzle's year range, such as ten races with their point-scoring finishers. At least one record should help identify a useful teammate relationship while other records act as plausible red herrings. The player investigates which races matter.

This candidate remains open and should not replace the direct-hint baseline until validated. It requires additional per-race client data or prebuilt hint packets, a dossier interface, deterministic versioning for Daily Chain, and explicit fairness rules. A point-scorers-only record is not actionable when the relevant teammate finished outside the points or failed to finish, so packet generation must either select races where the needed drivers are visible or expose a fuller classification/constructor-entry view.

Validation questions:

- Are dossier hints an alternate high-difficulty track or a later step in the normal hint sequence?
- How many useful records and red herrings are fair at each difficulty?
- Can a player request a new packet, and what does that cost?
- Does the system teach historical context or merely encourage scanning names?
- Can ten race records remain understandable on a narrow phone and through a screen reader?

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
