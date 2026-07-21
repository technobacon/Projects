import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("renders the Paddock Links prototype", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  const html = await response.text();
  assert.match(html, /<title>Paddock Links/);
  assert.match(html, /Connect the two target drivers/);
  assert.match(html, /Hadjar/);
  assert.match(html, /Leclerc/);
  assert.match(html, /Lewis Hamilton/);
  assert.match(html, /Carlos Sainz/);
  assert.doesNotMatch(html, /Lewis Carl Davidson Hamilton|Carlos Sainz Vázquez de Castro/);
  assert.match(html, /Verify connection/);
  assert.match(html, /Choose any target pair/);
  assert.match(html, /Start new round/);
  assert.match(html, /Challenge deck/);
  assert.match(html, /Daily Chain/);
  assert.match(html, /One reviewed pair per Budapest calendar day/);
  assert.match(html, /Five repeatable real-data puzzles/);
  assert.match(html, /How to play/);
  assert.match(html, />Settings<\/button>/);
  assert.match(html, /Skip to link controls/);
  assert.match(html, /Add driver <kbd>⇧ Space<\/kbd>/);
  assert.match(html, /Remove note/);
  assert.match(html, /Report a data issue/);
  assert.match(html, /Any continuous valid chain wins/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton|Your site is taking shape/);
});

test("includes replayable onboarding and versioned data reports", async () => {
  const source = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  assert.match(source, /paddock-links\.onboarding\.v1/);
  assert.match(source, /Any valid route wins/);
  assert.match(source, /Paddock Links data report/);
  assert.match(source, /No report was sent automatically/);
  assert.match(source, /removeLink\(evidenceLink\.id\)/);
});

test("presents par-aware results without rejecting longer routes", async () => {
  const source = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  assert.match(source, /Valid route complete/);
  assert.match(source, /over par/);
  assert.match(source, /Next challenge/);
  assert.match(source, /CURATED_PUZZLES\.length/);
});

test("keeps unfinished rounds device-local and graph-versioned", async () => {
  const source = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  assert.match(source, /paddock-links\.round\.v1/);
  assert.match(source, /graphVersion: GRAPH\.graphVersion/);
  assert.match(source, /Your unfinished route was restored on this device/);
});

test("ships a deterministic graph-versioned Daily Chain", async () => {
  const source = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  assert.match(source, /timeZone: "Europe\/Budapest"/);
  assert.match(source, /function dailyChallengeForKey/);
  assert.match(source, /hash % CURATED_PUZZLES\.length/);
  assert.match(source, /paddock-links\.daily\.v1/);
  assert.match(source, /dailyKey: gameMode === "daily"/);
  assert.match(source, /graphVersion: GRAPH\.graphVersion/);
  assert.match(source, /Completed today/);
  assert.match(source, /Replay today's chain/);
  assert.match(css, /\.daily-stamp/);
  assert.match(css, /\.daily-complete/);
});

test("hardens device-local state, keyboard access, and report copying", async () => {
  const source = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  assert.match(source, /canonicalizeSavedRound/);
  assert.match(source, /Math\.max\(6, Math\.min\(94, position\.x\)\)/);
  assert.match(source, /document\.execCommand\("copy"\)/);
  assert.match(source, /document\.body\.style\.overflow = "hidden"/);
  assert.match(source, /aria-describedby="board-help"/);
  assert.match(css, /@media \(max-width: 430px\)/);
  assert.match(css, /scale\(\.72\)/);
  assert.match(css, /\.skip-link:focus/);
});

test("supports mouse-first canvas links and pinned case-note movement", async () => {
  const source = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  assert.match(source, /event\.code !== "Space" \|\| !event\.shiftKey/);
  assert.match(source, /aria-keyshortcuts="Shift\+Space"/);
  assert.match(source, /event\.key === "Enter" && availableDrivers\.length === 1/);
  assert.match(source, /event\.key === "Enter" && filteredTeams\.length === 1/);
  assert.match(source, /event\.key === "ArrowDown" && availableDrivers\.length/);
  assert.match(source, /event\.key === "ArrowDown" && filteredTeams\.length/);
  assert.match(source, /One match:/);
  assert.match(source, /releasePin\(id, positions\[id\]\)/);
  assert.match(source, /setPinHoles/);
  assert.match(source, /setFallingPins/);
  assert.match(source, /10_050/);
  assert.doesNotMatch(source, /glidePuck|requestAnimationFrame\(step\)/);
  assert.match(source, /Draw string from/);
  assert.match(source, /Which team connects them\?/);
  assert.match(source, /filteredTeams\.map/);
  assert.match(source, /handleBoardPointerMove/);
  assert.match(css, /\.connection-port/);
  assert.match(css, /grid-template-columns: repeat\(4/);
  assert.match(css, /\.draft-string-line/);
  assert.match(css, /\.board-pin/);
  assert.match(css, /\.pin-hole/);
  assert.match(css, /loose-pin-fall/);
  assert.match(css, /repeating-linear-gradient\(104deg/);
  assert.match(css, /\.single-result-hint/);
});

test("keeps the paper case board dominant and moves driver discovery onto it", async () => {
  const source = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  assert.match(source, /driverPickerOpen/);
  assert.match(source, /className="board-add-driver"/);
  assert.match(source, /Add a driver to the case/);
  assert.match(source, /className="driver-picker-grid"/);
  assert.doesNotMatch(source, /className="driver-tray"/);
  assert.match(css, /height: clamp\(680px, 78vh, 920px\)/);
  assert.match(css, /linear-gradient\(135deg, #dfd0ad, #d5c39d/);
  assert.match(css, /\.board-add-driver/);
  assert.match(css, /\.driver-picker-grid/);
  assert.match(css, /font-family: Georgia, "Times New Roman", serif/);
});

test("persists explicit motion and contrast preferences", async () => {
  const source = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");
  assert.match(source, /paddock-links\.settings\.v1/);
  assert.match(source, /data-motion=\{motionPreference\}/);
  assert.match(source, /data-contrast=\{contrastPreference\}/);
  assert.match(source, /motionPreference === "system" && window\.matchMedia/);
  assert.match(source, /Preferences stay on this device/);
  assert.match(source, /Stronger borders, text, and focus states/);
  assert.match(css, /data-motion="reduced"/);
  assert.match(css, /data-contrast="high"/);
  assert.match(css, /app-shell:not\(\[data-motion="full"\]\)/);
  assert.match(css, /\.preference-option input:checked \+ span/);
});

test("keeps procedural sound and haptics optional and device-local", async () => {
  const source = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  assert.match(source, /type FeedbackCue = "pickup" \| "place" \| "link" \| "error" \| "complete"/);
  assert.match(source, /window\.AudioContext/);
  assert.match(source, /navigator\.vibrate/);
  assert.match(source, /if \(!soundEnabled\) return/);
  assert.match(source, /findPath\(nextLinks, targets\) \? "complete" : "link"/);
  assert.match(source, /const playThump =/);
  assert.match(source, /const playViolinNote =/);
  assert.match(source, /const cMajorScale = \[523\.25, 587\.33, 659\.25, 698\.46, 783\.99, 880, 987\.77, 1046\.5\]/);
  assert.match(source, /const risingFrequency = cMajorScale\[Math\.min\(successfulLinks, cMajorScale\.length - 1\)\]/);
  assert.match(source, /const completionPhrase = \[523\.25, 659\.25, 783\.99, 1046\.5\]/);
  assert.match(source, /playFeedback\("pickup"\)/);
  assert.match(source, /playFeedback\("place"\)/);
  assert.match(source, /sound: soundEnabled, haptics: hapticsEnabled/);
  assert.match(source, /Sound effects · \{soundEnabled \? "On" : "Off"\}/);
  assert.match(source, /Haptics · \{hapticsEnabled \? "On" : "Off"\}/);
});
