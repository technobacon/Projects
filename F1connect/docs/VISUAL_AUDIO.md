# Paddock Links — Visual and Audio Direction

## Creative statement

Paddock Links should feel like a quiet, premium investigation table assembled in a private racing archive: a warm paper case sheet on a dark desk, elegant typography, colored cords, satisfying mechanical movement, and restrained bursts of race-day energy.

It should not imitate a television timing tower or cover the screen in carbon-fiber clichés. The board is the identity.

## Brand name

**Paddock Links**

The name suggests:

- the relationships formed across the paddock;
- literal links drawn between pinned driver notes;
- a friendly, curious tone rather than a formal statistics product;
- room to grow beyond a single daily mode.

A simple descriptor can accompany the name during onboarding:

**Connect F1 drivers through their teammates.**

## Visual principles

### Relationships first

The eye should immediately read driver, connection, team, and route direction. Decoration must remain behind those four things.

### Warm evidence sheet, restrained history

Use a papyrus-colored board, neutral ivory and beige driver pieces, and a quiet charcoal-brown interface shell. Historical team colors are reserved for strings, evidence markers, and moments where they carry meaning.

### Mechanical, not aggressive

Motion and sound should feel engineered, magnetic, and precise. Incorrect attempts should not feel like punishment.

### Historical color with accessible redundancy

Team color is a strong memory aid, but every string also carries a readable label and optional pattern or icon. Color never stands alone.

### Original assets first

Use original note, pin, string, label, flag, texture, and sound designs. Do not assume that official logos, driver photographs, helmet artwork, broadcast graphics, or commercial fonts can be used.

## Board

### Surface

The board should read as an oversized case sheet resting on a dark investigator's desk without becoming a literal costume-prop scene.

Possible qualities:

- warm papyrus, parchment, or archival-card stock;
- faint edge darkening and restrained paper grain;
- soft directional shadows under lifted notes;
- sparse measurement marks at low contrast;
- a dark neutral desk and interface shell around the sheet;
- no busy photographic background or decorative clutter in the playable surface.

### Spatial zones

- pinned target note at each side during onboarding;
- open central construction space;
- **Add driver** control in the board's top-right corner, opening a searchable mouse-first grid;
- top bar for puzzle name, difficulty, and settings;
- bottom or side actions for Hint, Undo, Auto-arrange, and Check route when needed;
- result panel that does not immediately cover the completed board.

On mobile, driver discovery becomes a modal grid while the board retains most of the viewport.

## Driver notes

A note should feel pinned to the case board, then visibly lift away from the paper when the player grabs it.

### Anatomy

- square or slightly irregular paper body;
- driver initials as a quiet archive mark;
- familiar racing name written directly on the note;
- nationality or active years as optional secondary detail;
- small start or target marker and a visible pushpin;
- connection handles that appear on hover, focus, or selection;
- clear focus ring independent of team colors.

### States

- available in the driver picker;
- placed;
- selected;
- being dragged;
- target;
- part of completed route;
- unused after completion;
- hint-highlighted;
- unavailable or under review.

Placed notes cast a small directional shadow. On pickup, the pushpin falls, the note lifts, and a small puncture remains in the sheet for ten seconds before fading. On release, a pin secures the note immediately. Notes do not glide after release.

## Strings

Strings are both proof and play.

### Appearance

- gently curved rather than rigidly straight;
- enough thickness for team color to be legible;
- soft core highlight or shadow for depth;
- readable at small mobile sizes;
- selectable with a larger invisible hit area;
- optional pattern in high-contrast mode.

### States

- provisional neutral string;
- tension increasing during drag;
- valid colored string;
- selected string with evidence affordance;
- invalid release;
- completed-route pulse;
- dimmed non-route string when reviewing a solution.

A string may contain visible fibers, small knots, or anchor caps at the pins, reinforcing the satisfying tie-down.

## Team labels

Every validated string receives a label near its midpoint.

The label contains:

- canonical historical team name;
- optional season range or shared-event count in expanded view;
- high-contrast background and foreground;
- a connector pointer or anchor to prevent ambiguity;
- a clear selected or focus state.

Long names require shortening rules that preserve meaning. A tooltip, accessible name, or detail panel always exposes the full canonical label.

## Team colors

Maintain historical palette records rather than one permanent color per organizational lineage.

Each palette needs:

- string color;
- darker or lighter label background;
- label foreground;
- accent;
- high-contrast alternative;
- date or season validity;
- editorial note.

When two teams have similar colors, labels and patterns keep them distinguishable. Never change historical answer identity merely to simplify the palette.

## Typography

The type system should feel technical and confident without borrowing an official F1 typeface.

Recommended characteristics:

- elegant editorial serif for brand, headings, driver names, and evidence labels;
- highly legible sans-serif for compact controls, search, statistics, and supporting copy;
- tabular numerals for time and link counts;
- generous letter clarity at small mobile sizes;
- distinct uppercase and lowercase rather than excessive all-caps.

Driver and team names should receive typographic priority over timers and scores.

## Motion language

### Note movement

- direct under the pointer;
- visible lift and directional shadow on pickup;
- pushpin drops as the note leaves the sheet;
- puncture mark fades over ten seconds;
- immediate repin at the release position;
- no inertia or uncontrolled drift.

### String movement

- stretches during connection;
- follows moving notes smoothly from their pin positions;
- one or two damped oscillations after a snap;
- maintains readable label placement;
- completion pulse travels from start to target.

### Interface transitions

- short slides and fades;
- controls appear near the object that needs them;
- result panel enters after the chain animation;
- no full-screen interruption for routine validation.

### Reduced motion

- eliminate loose-pin falling and string oscillation;
- use opacity, border, and text changes;
- Auto-arrange applies immediately or with a minimal crossfade;
- preserve all logical feedback.

## Sound identity

The soundscape should resemble small mechanical objects, tensioned material, and a subtle musical system.

The current prototype implements this direction with a compact Web Audio synthesis layer rather than packaged samples. Picking up and placing a note produces a muted board thump. Each accepted link bows the next note in a C-major scale, and the link that completes the route resolves into a softer C-major violin phrase and tonic chord. Invalid evidence drops gently in pitch. Sound effects can be disabled independently in Settings and no state depends on hearing a cue.

### Core cues

- **Puck pickup:** soft lift or suction tick.
- **Puck placement:** muted ice or tabletop tap.
- **String pull:** very quiet tension texture that does not loop annoyingly.
- **Valid link:** magnetic click plus a short tuned note.
- **Invalid release:** gentle twang or loss of tension, never a loud buzzer.
- **Hint:** soft radar or pit-wall cue.
- **Undo:** reversed mechanical tick.
- **Completion:** links trigger in route order and resolve into a compact chord or checkered-flag-like flourish.

Each valid link can add a note chosen from a compatible scale. Longer correct chains then create a richer completion rather than sounding worse than par routes.

### Mixing

- effects remain clear on phone speakers;
- completion is satisfying at low volume;
- no essential information depends on sound;
- repeated attempts avoid exhausting high-frequency sounds;
- master and effects controls are immediately reachable;
- remember mute preference.

All sounds should be original, commissioned, or properly licensed. Do not sample race broadcasts, team radio, official stings, or car audio without permission.

## Haptics

On supported devices and with permission:

- light pulse for valid snap;
- softer boundary or placement pulse;
- distinct but restrained completion pattern.

Haptics are optional reinforcement and must never be required.

The prototype now maps these states to restrained vibration patterns through the browser capability when available. Haptics have their own device-local switch and silently no-op on unsupported hardware.

## Completion moment

A valid route deserves a small ceremony:

1. non-route objects dim slightly;
2. the route traces from the first target to the second;
3. each string tightens and sounds in order;
4. both targets receive a soft halo;
5. the title Connected appears;
6. result details follow: link count, par, and hints;
7. the board returns to full control for rearranging and sharing.

The first message is always success. Par comparison comes second.

## Evidence presentation

Selecting a string opens a compact card:

- both driver names;
- shared team;
- first and last shared event or season;
- number of shared events;
- alternate shared teams when applicable;
- educational lineage note;
- Report data issue.

Evidence should feel like discovering a small paddock story, not reading a raw database row.

## Sharing appearance

The default share image or text should be spoiler-safe.

It may show:

- Paddock Links mark;
- challenge date or code;
- difficulty;
- selected link count and par;
- hints;
- a neutral sequence of connected nodes;
- optionally the user's final board layout without names.

A separate Full route option can expose driver and team labels.

## Accessibility review

Every visual and audio milestone should check:

- contrast at normal and high-contrast settings;
- team strings without color;
- keyboard focus visibility;
- large text and browser zoom;
- screen-reader route order;
- reduced motion;
- muted audio;
- touch accuracy;
- labels at narrow widths;
- color-vision simulations;
- light sensitivity from flashes or pulses.

No rapid flashing is needed for this concept.

## Asset and rights checklist

Before public release, inventory:

- application name and logo;
- Formula 1 wording and disclaimer;
- driver names, initials, numbers, flags, and photographs;
- team names, logos, colors, sponsor names, and liveries;
- fonts;
- icons;
- textures;
- music, effects, and recordings;
- data-source attribution;
- share-card assets.

Record creator, license, source, required attribution, permitted uses, and modification rights for each asset.
