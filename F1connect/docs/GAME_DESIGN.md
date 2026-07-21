# Paddock Links — Game Design

## Design goal

Create a Formula 1 knowledge game where building and arranging the answer is as satisfying as knowing it.

The board should feel playful and physical, but the rules should feel exact. The player is never required to reproduce a single canonical route.

## Terminology

- **Target drivers:** the two drivers that must be connected.
- **Driver note:** a movable paper case note representing one driver.
- **Link:** a validated teammate relationship between two driver notes.
- **Team label:** the historical constructor identity that proves a link.
- **Chain:** a continuous series of validated links between the target drivers.
- **Par:** the number of links in a shortest valid route known to the current dataset.
- **Board:** the interactive evidence sheet containing pinned notes, strings, labels, and controls.
- **Unused note:** a driver placed on the board who is not part of the completed chain.

## Winning condition

A puzzle is complete when the two target drivers are joined by a continuous chain of valid links.

Every valid complete chain wins.

Par affects the result summary and optional mastery ratings, but a route longer than par remains a correct solution. The completion feedback should lead with success, not with the distance from an ideal route.

## Connection rule

Two drivers can be linked when both appeared for the same constructor at the same Formula 1 World Championship Grand Prix.

The selected team label must match at least one qualifying shared appearance.

### Included

- regular race drivers;
- official substitute or replacement race drivers;
- drivers recorded in the event's official race entry or result data, including a did-not-start result when supported by the source;
- multiple shared teams, when historically valid.

### Excluded

- reserve status without a race entry;
- test sessions;
- young-driver tests;
- academy or junior-program membership;
- demonstration runs;
- simulator work;
- practice-only or FP1-only participation;
- sharing the same constructor in different seasons without an overlapping Grand Prix.

### Historical team identity

The answer uses the constructor or team identity recorded for the shared appearance. A later or earlier name from the same organizational lineage is not an interchangeable answer.

Examples of distinct labels include Toro Rosso, AlphaTauri, RB, and Racing Bulls.

A future educational panel may explain team lineage, but it must not silently convert one historical answer into another.

## Team-answer interaction

Creating a link is a two-part answer:

1. choose the second driver;
2. name the shared team.

The current input is a searchable mouse-first grid of all historical team names. If search leaves one result, Enter confirms it; Arrow Down moves focus into the grid. A compact form remains available as the keyboard-accessible fallback.

If two drivers shared multiple valid teams, any one of those teams completes the link. The post-game evidence view can reveal the alternatives.

The game should accept reviewed aliases and formatting variations while displaying one canonical historical label.

## Board interaction

### Pointer and touch

- Open **Add driver** from the board or press **Shift + Space**, then search or browse the driver grid.
- Move any non-locked note freely. Picking it up drops its pushpin and leaves a puncture that fades over ten seconds; release pins it at the new position.
- Pull from a note's connection handle to another note.
- Choose a team in the label prompt.
- Drag the center of a validated string or its label to improve the layout.
- Select a link to inspect, replace, or remove it.
- Use Undo for the most recent board action.

### Keyboard and assistive interaction

- Search and add a driver without dragging.
- Navigate notes and links in a logical order.
- Select two drivers, choose Connect, then choose a team.
- Move a selected note with arrow controls or use Auto-arrange.
- Receive validation through text and status announcements, not color or sound alone.

### Physical behavior

Notes should feel pinned to the sheet rather than free-floating. Strings should retain a fibrous, tactile appearance while preserving legibility.

Physics must yield to player intent:

- dragging is direct and immediate;
- released notes stop exactly where placed and immediately regain a pushpin;
- target notes may be movable but remain visually distinguished;
- labels avoid severe overlap;
- a Reset layout action never deletes the answer;
- Auto-arrange creates a readable chain;
- reduced-motion mode removes the loose-pin fall and nonessential transitions while preserving the pinhole and final pinned state.

## Feedback language

### Valid link

- string snaps into place;
- team color travels across the string;
- label resolves to its canonical name;
- a short mechanical click and tonal note play;
- optional light haptic pulse on supported devices;
- supporting season appears briefly or on inspection.

### Invalid team for a valid driver pair

- the provisional string remains neutral;
- the team selector explains that the drivers did not overlap at that team;
- no harsh buzzer;
- the player's board arrangement remains intact.

### Invalid driver relationship

- the provisional string loses tension or gently twangs away;
- a concise message states that no shared race entry was found;
- a hint can suggest an era, nationality, or number of teams without revealing the answer.

### Completed chain

- all links briefly tighten in sequence;
- the accumulated notes resolve into a short finish;
- the route is visually traced from start to end;
- the result panel celebrates completion before showing par;
- the player can continue arranging the board before sharing.

## Result model

A result should record:

- completed or abandoned;
- number of links in the chosen chain;
- par;
- elapsed active time;
- hints used;
- invalid connection attempts;
- unused notes;
- difficulty tier;
- puzzle identifier and data version;
- accessibility or assistance modes only when needed to interpret competitive results.

The main result line could read:

**Connected in 4 links · Par 3 · 1 hint**

Avoid language such as failed, wrong route, or over par after a valid completion.

## Optional mastery rating

A later version may award up to three badges:

- **Connected:** completed any valid chain;
- **Clean Board:** completed without revealing a direct answer;
- **Par Route:** completed using a shortest known number of links.

Time should be secondary outside Sprint mode. Knowledge and discovery are the core experience.

## Hints

Hints should progress from contextual to explicit:

1. reveal the relevant era for one missing connection;
2. reveal a driver's nationality or initials;
3. show how many valid teams connect a selected pair;
4. highlight a useful existing note;
5. reveal one bridge driver;
6. reveal one complete link with its team.

A player may finish after any number of hints. Hints affect the result description but never remove the ability to complete or share.

### Later research: race dossiers

An optional advanced hint track can behave like detective work instead of revealing the next graph step. The player receives a small evidence packet—potentially ten seeded races from the puzzle's relevant year range—with each race showing its point-scoring finishers. One or more races contain evidence that can help identify a useful teammate relationship; the rest are plausible red herrings. The player must decide which race records matter.

This is a later system, not part of the current direct-hint implementation. It requires a generated race-result hint package, a dossier-browsing interface, difficulty rules, and editorial safeguards.

Fairness requirements:

- at least one dossier must contain actionable evidence for a valid route;
- a point-scorers-only list is usable only when the relevant drivers are actually visible in it; otherwise the dossier needs a fuller classification or constructor-entry view;
- red herrings must be plausible but must not depend on disputed or misleading records;
- Daily Chain dossiers must be deterministic and frozen with the puzzle's graph and source versions;
- the UI must state the race, season, and scope clearly without revealing which dossier is useful;
- requesting a dossier can affect the hint count, but it must never invalidate a completion.

Open questions include whether dossiers supplement or replace contextual hints at higher difficulties, how many races are fair at each tier, whether players may request another packet, and how much race detail remains legible on mobile.

## Driver picker

The picker should support:

- search by surname, full name, common alias, or nationality;
- recent and current drivers first during onboarding;
- era filters;
- favorites or recently used drivers;
- clear distinction between drivers with identical or similar names;
- optional portrait, initials, flag, active years, or driver number;
- full keyboard and screen-reader use.

To discourage blind brute force, validation should occur when a player deliberately attempts a link, not merely while browsing search results.

## Puzzle construction

A generated puzzle must:

- place both targets in the same connected graph component;
- have a known par route;
- fall within the intended difficulty band;
- avoid a direct teammate pair unless designed as an onboarding puzzle;
- avoid relying only on disputed or exception-marked edges;
- remain stable for the duration of a Daily Chain;
- store its graph-data version for reproducibility.

Random does not need to mean uncurated. Daily puzzles should come from a reviewed candidate pool or automated checks plus editorial approval.

## Modes

### Onboarding

A short guided puzzle teaches adding a note, connecting drivers, choosing a team, and rearranging the board.

### Daily Chain

- deterministic daily identifier;
- one reviewed pair;
- unlimited board editing;
- local streak and history;
- spoiler-safe sharing;
- frozen data version until the daily cycle ends.

The prototype derives one reviewed case from the Budapest calendar date, keeps the pair stable for that full date, exposes the frozen graph version, restores an unfinished daily board, and records that date's completion locally. Streak history and spoiler-safe sharing remain follow-up work.

### Free Play

- select or randomize both targets;
- era and difficulty filters;
- optional par preview;
- share the selected challenge.

### Quick Connect

A stream of approachable puzzles with high-recognition drivers and short par routes.

### Deep History

All-time data, obscure drivers, historical identities, and longer routes. Evidence is especially important.

### Sprint

Multiple puzzles with a clock, fast reset, and reduced post-round interruption. This mode should wait until the normal interaction is proven fast and accessible.

## Sharing

A share result should communicate achievement without exposing the driver names by default.

Possible elements:

- date or challenge code;
- difficulty icon;
- chosen link count and par;
- hints used;
- a sequence of neutral string or team-color symbols;
- link to replay the same pair.

Provide a separate explicit option to share the full route.

## Accessibility requirements

- complete operation by keyboard;
- semantic alternatives for the spatial graph;
- screen-reader announcements for connection state;
- high-contrast labels and focus indicators;
- team identity never communicated by color alone;
- reduced motion;
- independent sound-effects and haptics controls, persisted on the device;
- visible captions or text equivalents for audio cues;
- touch targets sized for small screens;
- no essential time limit outside Sprint;
- pause when the browser loses focus;
- color palettes tested for common color-vision differences.

## Analytics boundaries

If analytics are added, collect only what improves the game:

- puzzle opened and completed;
- hints used;
- difficulty and link count;
- broad interaction failures;
- performance and crash data;
- voluntarily submitted data reports.

Do not record driver-search text or construct invasive player profiles. Consent and privacy behavior must match the deployment region.

## Open balancing questions

- Should an unused note affect only presentation or also mastery?
- Should invalid guesses affect a competitive result?
- Should the team selector show all historical teams or a small plausible set?
- How much of par should be visible before completion?
- Should Free Play allow connections that are valid only through exception-reviewed data?
- When should the game suggest Auto-arrange?
