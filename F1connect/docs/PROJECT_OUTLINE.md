# Paddock Links — Project Outline

## One-sentence summary

Paddock Links is a tactile browser game in which players connect two Formula 1 drivers through current or former teammates, naming each shared team while arranging the resulting relationship graph as pinned paper notes and colored strings.

## Product vision

Make Formula 1 history feel like a place the player can touch.

Paddock Links should transform a large historical dataset into short, understandable stories: one driver led to another, at this team, in this era. The player should leave a round having either remembered something satisfying or learned something surprising.

## The opportunity

Most sports trivia asks for an answer and then replaces it with the next question. Paddock Links can make the answer itself rewarding:

- the solution remains visible as a constructed object;
- multiple correct solutions encourage discussion;
- tactile arrangement creates personality and replay value;
- historical connections naturally reveal careers, eras, and team changes;
- a graph can support daily puzzles, free exploration, competition, and sharing.

## Intended audience

### Primary audience

Formula 1 fans who recognize current drivers and many major drivers from the recent past, but who do not necessarily know every historical lineup.

### Secondary audiences

- deep-history fans seeking difficult all-time routes;
- casual sports-puzzle players attracted by the physical interaction;
- friends comparing different valid solutions;
- educators, journalists, and creators exploring driver and team history.

The initial experience should not assume expert knowledge. Current and famous drivers should provide the entrance; deeper history should provide longevity.

## Player promise

When a player completes a chain:

- every connection is historically defensible;
- any valid route is accepted;
- the game explains the teams and seasons behind the route;
- the board responds with satisfying visual and audio feedback;
- the result is easy to understand and share.

## Product pillars

### 1. Trustworthy history

The graph, labels, team identities, and supporting evidence must agree. A wrong rejection is more damaging than an easy puzzle.

### 2. Tactile clarity

Pucks, strings, labels, and movement should make relationships clearer, not merely decorate them. Physics must remain controllable.

### 3. Flexible solutions

Paddock Links celebrates alternative valid routes. The shortest route is useful as par and as a post-game insight, not as a gate.

### 4. Layered discovery

A beginner can solve with familiar names and hints. An expert can pursue obscure drivers, fewer links, no hints, and all-time puzzles.

### 5. A compact daily ritual

A satisfying round should take a few minutes, while Free Play and historical exploration can support longer sessions.

## Core loop

1. Receive two target drivers and a difficulty indication.
2. Recall or discover a driver who may connect to one endpoint.
3. Place that driver on the board.
4. Connect two pinned notes and name their shared team.
5. Receive immediate validation and sensory feedback.
6. Repeat until the endpoints are linked.
7. Review the route, par, alternatives, evidence, and share result.
8. Start another puzzle or explore one of the revealed relationships.

## Game modes

### Daily Chain

One seeded puzzle per day, identical for every player. Designed for sharing and streaks.

### Quick Connect

Short, familiar routes suitable for onboarding and short sessions.

### Deep History

Longer or more obscure routes, with era-crossing connections and fewer default clues.

### Free Play

The player selects any two eligible drivers. Useful for exploration, arguments, and custom challenges.

### Sprint

A sequence of puzzles against a time limit. Better suited to a later release after input and validation are fast and reliable.

### Friend Challenge

A shareable link containing a selected pair and optional rule settings. No account should be required to play the challenge.

## Difficulty model

Difficulty should not be defined by graph distance alone. A puzzle rating can combine:

- shortest-path length;
- driver familiarity;
- age of the relevant connection;
- number of plausible dead ends;
- number of available shortest routes;
- amount of era crossing;
- whether the shared team name changed or is easily confused.

Proposed player-facing tiers:

- **Formation Lap:** familiar drivers, par of two or three connections;
- **Grand Prix:** mixed eras or less obvious bridges;
- **Night Race:** obscure drivers, longer routes, or difficult historical labels.

## Initial scope

The recommended MVP starts with a well-audited modern era, then expands backward. A practical initial cutoff should be chosen after the data proof measures coverage and data exceptions. Starting around 2000 keeps the first puzzles recognizable while still creating rich cross-team routes.

The MVP includes:

- browser and mobile-browser support;
- Daily Chain and Free Play;
- searchable board-level driver picker;
- movable pinned notes and tactile string connections;
- team selection and exact validation;
- any-valid-route completion;
- par calculation;
- progressive hints;
- local statistics and settings;
- shareable text or graphic results;
- accessible non-physics interaction.

## Explicit non-goals for the MVP

- real-time race timing or telemetry;
- fantasy scoring;
- driver performance comparisons;
- live multiplayer;
- global accounts and leaderboards;
- user-generated public content moderation;
- licensed driver photography or official team logos;
- a perfectly simulated physics sandbox;
- support for every historical edge before the data rules are proven.

## Success criteria

### Product quality

- Players understand the task without reading long instructions.
- A first-time player completes a guided puzzle.
- The board feels responsive on mouse, touch, and keyboard.
- Correct connections are rarely disputed.
- Players can explain why a rejected connection failed.
- Alternative valid chains are accepted consistently.

### Early behavioral signals

Once analytics are appropriate and consented:

- puzzle completion rate;
- return rate for Daily Chain;
- hint usage by difficulty;
- average valid links per completed route;
- share action rate;
- Free Play pair selections;
- rate of reported data problems;
- accessibility mode usage.

These metrics should diagnose the experience, not push the product toward punitive streaks or excessive engagement mechanics.

## Key risks and responses

### Historical ambiguity

**Risk:** team rebrands, one-off entrants, substitutions, and naming variants produce disputed answers.

**Response:** define a strict race-entry rule, preserve historical identities, store evidence, and maintain a reviewed exception layer.

### Incorrect external data

**Risk:** a single source contains omissions or identity problems.

**Response:** use a primary dataset, a second verification source, automated integrity checks, and human-curated regression cases.

### Physics becomes frustrating

**Risk:** notes or pins obscure evidence, strings obscure labels, or mobile dragging feels imprecise.

**Response:** prioritize direct manipulation, damping, snap zones, undo, auto-arrange, and a non-physics interaction mode.

### Guessing overwhelms knowledge

**Risk:** a searchable list lets players brute-force connections.

**Response:** tune feedback, scoring, hint cost, and optional restricted modes without invalidating successful routes.

### Rights and branding

**Risk:** official marks, photographs, team colors, or sounds are used without appropriate permission.

**Response:** begin with original visual assets, text names, initials, and a reviewed attribution policy. Conduct a rights review before public or commercial launch.

## Open product questions

- What era should the first audited dataset cover?
- Should the team answer be typed, selected, or support both?
- How should longer-than-par routes affect the result presentation?
- Should unused notes count against a result?
- When does a hint become a reveal rather than guidance?
- Should a daily puzzle permit unlimited attempts?
- What information can be shared without spoiling the route?
- Should team lineage ever appear as optional educational context while historical identities remain separate answers?

Accepted decisions and future decisions are maintained in [DECISIONS.md](DECISIONS.md).
