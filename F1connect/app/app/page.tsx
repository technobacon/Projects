"use client";

import graphData from "./data/graph-v2026.10.0-modern.json";
import {
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type Driver = { id: string; name: string; initials: string; years: string; tone: string };
type Position = { x: number; y: number };
type RuntimeTeam = { id: string; name: string; eventCount: number; firstSeason: number; lastSeason: number; firstEventId: string; lastEventId: string };
type RuntimeEdge = { driverAId: string; driverBId: string; sharedEventCount: number; teams: RuntimeTeam[] };
type RuntimeGraph = {
  schemaVersion: number;
  graphVersion: string;
  sourceVersion: string;
  drivers: Array<{ id: string; givenName: string; familyName: string; name: string; activeFrom: number; activeTo: number; componentId: number }>;
  constructors: Array<{ id: string; name: string; fullName: string }>;
  edges: RuntimeEdge[];
};
type ActiveLink = { id: string; driverAId: string; driverBId: string; teamId: string; teamName: string; evidence: RuntimeTeam };
type Notice = { kind: "info" | "success" | "error"; text: string };
type TargetPair = [string, string];
type DraftString = { fromId: string; end: Position };
type PinTrace = { id: string; x: number; y: number; rotation: number };
type CuratedPuzzle = { id: string; title: string; targets: TargetPair };
type MotionPreference = "system" | "full" | "reduced";
type ContrastPreference = "standard" | "high";
type FeedbackCue = "pickup" | "place" | "link" | "error" | "complete";
type GameMode = "daily" | "formation" | "free";
type DailyCompletion = { dateKey: string; puzzleId: string; graphVersion: string; links: number; hints: number; attempts: number; completedAt: string };
type SavedRound = {
  version: 1;
  graphVersion: string;
  targets: TargetPair;
  boardDrivers: string[];
  positions: Record<string, Position>;
  links: ActiveLink[];
  hints: number;
  attempts: number;
  mode: GameMode;
  dailyKey?: string;
};

const GRAPH = graphData as RuntimeGraph;
const TONES = ["ice", "navy", "ember", "red", "gold", "orange", "papaya", "blue", "violet", "green", "silver", "white"];
const toneFor = (id: string) => TONES[[...id].reduce((total, character) => total + character.charCodeAt(0), 0) % TONES.length];
const shortFamilyName = (familyName: string) => /^(de |da |van |von )/i.test(familyName) ? familyName : familyName.split(/[\s-]+/)[0];
const DRIVERS: Driver[] = GRAPH.drivers.map((driver) => ({
  id: driver.id,
  name: `${driver.givenName.trim().split(/\s+/)[0]} ${shortFamilyName(driver.familyName)}`,
  initials: `${driver.givenName[0] ?? ""}${shortFamilyName(driver.familyName).trim().split(/\s+/).at(-1)?.[0] ?? ""}`.toUpperCase(),
  years: driver.activeFrom === driver.activeTo ? `${driver.activeFrom}` : `${driver.activeFrom}–${driver.activeTo >= 2026 ? "" : driver.activeTo}`,
  tone: toneFor(driver.id),
})).sort((a, b) => a.name.localeCompare(b.name));
const DRIVERS_BY_ID = new Map(DRIVERS.map((driver) => [driver.id, driver]));

const TEAM_COLORS: Record<string, string> = {
  "red-bull": "#4b70ff", "toro-rosso": "#3d88d4", ferrari: "#ef3340",
  mclaren: "#ff8700", mercedes: "#00d2be", brawn: "#b8ed24",
  williams: "#64a7e8", renault: "#f4df34", alpine: "#ef7ac8",
  "aston-martin": "#229971", alphatauri: "#f3f6f8", "racing-bulls": "#b8dcff",
  sauber: "#21cf68", "kick-sauber": "#52e252", audi: "#e04b4b", haas: "#d9dde1",
  honda: "#f6f6f6", toyota: "#e12835", "force-india": "#f29ac2", jordan: "#f5d328",
};
const DEFAULT_TEAM_COLOR = "#7f9eae";

const ALL_TEAMS = [...GRAPH.constructors].sort((a, b) => a.name.localeCompare(b.name));
const pairKey = (driverAId: string, driverBId: string) => [driverAId, driverBId].sort().join("::");
const EDGES_BY_PAIR = new Map(GRAPH.edges.map((edge) => [pairKey(edge.driverAId, edge.driverBId), edge]));

const DEFAULT_TARGETS: TargetPair = ["isack-hadjar", "charles-leclerc"];
const ROUND_STORAGE_KEY = "paddock-links.round.v1";
const ONBOARDING_STORAGE_KEY = "paddock-links.onboarding.v1";
const SETTINGS_STORAGE_KEY = "paddock-links.settings.v1";
const DAILY_STORAGE_KEY = "paddock-links.daily.v1";
const ONBOARDING_STEPS = [
  { eyebrow: "Step 1 of 3", title: "Connect the pinned targets", text: "Every round begins with two target drivers. Press Shift + Space or use Add driver, then arrange the case notes however you like." },
  { eyebrow: "Step 2 of 3", title: "Pull a string between teammates", text: "Click the small + attachment on one note, move to another driver, then click that note. Choose their historical team from the grid that appears." },
  { eyebrow: "Step 3 of 3", title: "Any valid route wins", text: "Par is the shortest known route, never a gate. Click a verified team label to inspect its evidence or report a questionable record." },
];
const CURATED_PUZZLES: CuratedPuzzle[] = [
  { id: "rookie-to-red", title: "Rookie to Red", targets: ["isack-hadjar", "charles-leclerc"] },
  { id: "champions-crossed", title: "Champions Crossed", targets: ["fernando-alonso", "max-verstappen"] },
  { id: "generations-apart", title: "Generations Apart", targets: ["kimi-raikkonen", "oscar-piastri"] },
  { id: "silver-threads", title: "Silver Threads", targets: ["sebastian-vettel", "george-russell"] },
  { id: "british-bridge", title: "British Bridge", targets: ["lewis-hamilton", "lando-norris"] },
];

function budapestDateKey(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Budapest", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(date);
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((item) => item.type === type)?.value ?? "00";
  return `${part("year")}-${part("month")}-${part("day")}`;
}

function dailyChallengeForKey(dateKey: string) {
  const hash = [...dateKey].reduce((value, character) => ((value * 31) + character.charCodeAt(0)) >>> 0, 17);
  const index = hash % CURATED_PUZZLES.length;
  return { dateKey, index, puzzle: CURATED_PUZZLES[index] };
}

function dailyDateLabel(dateKey: string) {
  return new Intl.DateTimeFormat("en", { timeZone: "UTC", month: "short", day: "numeric", year: "numeric" }).format(new Date(`${dateKey}T12:00:00Z`));
}

function targetPositions(targets: TargetPair): Record<string, Position> {
  return { [targets[0]]: { x: 14, y: 48 }, [targets[1]]: { x: 86, y: 48 } };
}

function shortestGraphPath(start: string, target: string) {
  const adjacency = new Map<string, string[]>();
  for (const edge of GRAPH.edges) {
    adjacency.set(edge.driverAId, [...(adjacency.get(edge.driverAId) ?? []), edge.driverBId]);
    adjacency.set(edge.driverBId, [...(adjacency.get(edge.driverBId) ?? []), edge.driverAId]);
  }
  const queue: string[][] = [[start]];
  const visited = new Set([start]);
  while (queue.length) {
    const path = queue.shift()!;
    const current = path[path.length - 1];
    if (current === target) return path;
    for (const neighbor of adjacency.get(current) ?? []) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push([...path, neighbor]);
      }
    }
  }
  return null;
}

function driverById(id: string) {
  return DRIVERS_BY_ID.get(id)!;
}

function findPath(links: ActiveLink[], targets: TargetPair) {
  const adjacency = new Map<string, string[]>();
  for (const link of links) {
    adjacency.set(link.driverAId, [...(adjacency.get(link.driverAId) ?? []), link.driverBId]);
    adjacency.set(link.driverBId, [...(adjacency.get(link.driverBId) ?? []), link.driverAId]);
  }
  const queue: string[][] = [[targets[0]]];
  const visited = new Set<string>([targets[0]]);
  while (queue.length) {
    const path = queue.shift()!;
    const current = path[path.length - 1];
    if (current === targets[1]) return path;
    for (const neighbor of adjacency.get(current) ?? []) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push([...path, neighbor]);
      }
    }
  }
  return null;
}

function readLocalValue(key: string) {
  try { return window.localStorage.getItem(key); } catch { return null; }
}

function writeLocalValue(key: string, value: string) {
  try { window.localStorage.setItem(key, value); return true; } catch { return false; }
}

function removeLocalValue(key: string) {
  try { window.localStorage.removeItem(key); } catch { /* Gameplay remains available without storage. */ }
}

async function writeClipboard(text: string) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch { /* Fall through to the legacy copy path. */ }
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  const copied = document.execCommand("copy");
  textarea.remove();
  return copied;
}

function canonicalizeSavedRound(value: unknown, currentDailyKey: string): SavedRound | null {
  if (!value || typeof value !== "object") return null;
  const saved = value as Partial<SavedRound>;
  if (saved.version !== 1 || saved.graphVersion !== GRAPH.graphVersion) return null;
  if (!Array.isArray(saved.targets) || saved.targets.length !== 2 || saved.targets.some((id) => typeof id !== "string" || !DRIVERS_BY_ID.has(id)) || saved.targets[0] === saved.targets[1]) return null;
  if (!Array.isArray(saved.boardDrivers) || saved.boardDrivers.length < 2 || saved.boardDrivers.length > 30) return null;
  const boardDrivers = [...new Set(saved.boardDrivers)];
  if (boardDrivers.some((id) => typeof id !== "string" || !DRIVERS_BY_ID.has(id)) || !saved.targets.every((id) => boardDrivers.includes(id))) return null;
  if (!saved.positions || typeof saved.positions !== "object") return null;
  const positions: Record<string, Position> = {};
  for (const id of boardDrivers) {
    const position = saved.positions[id];
    if (!position || !Number.isFinite(position.x) || !Number.isFinite(position.y)) return null;
    positions[id] = { x: Math.max(6, Math.min(94, position.x)), y: Math.max(12, Math.min(84, position.y)) };
  }
  if (!Array.isArray(saved.links)) return null;
  const linksById = new Map<string, ActiveLink>();
  for (const link of saved.links) {
    if (!link || typeof link.driverAId !== "string" || typeof link.driverBId !== "string" || typeof link.teamId !== "string") return null;
    if (link.driverAId === link.driverBId || !boardDrivers.includes(link.driverAId) || !boardDrivers.includes(link.driverBId)) return null;
    const edge = EDGES_BY_PAIR.get(pairKey(link.driverAId, link.driverBId));
    const evidence = edge?.teams.find((team) => team.id === link.teamId);
    if (!edge || !evidence) return null;
    const id = pairKey(link.driverAId, link.driverBId);
    linksById.set(id, { id, driverAId: link.driverAId, driverBId: link.driverBId, teamId: evidence.id, teamName: evidence.name, evidence });
  }
  const hints = typeof saved.hints === "number" && Number.isFinite(saved.hints) ? Math.max(0, Math.min(99, Math.floor(saved.hints))) : 0;
  const attempts = typeof saved.attempts === "number" && Number.isFinite(saved.attempts) ? Math.max(0, Math.min(9999, Math.floor(saved.attempts))) : 0;
  const mode: GameMode = saved.mode === "daily" || saved.mode === "formation" || saved.mode === "free"
    ? saved.mode
    : CURATED_PUZZLES.some((puzzle) => puzzle.targets[0] === saved.targets![0] && puzzle.targets[1] === saved.targets![1]) ? "formation" : "free";
  const dailyKey = mode === "daily" && typeof saved.dailyKey === "string" ? saved.dailyKey : undefined;
  if (mode === "daily" && dailyKey !== currentDailyKey) return null;
  return { version: 1, graphVersion: GRAPH.graphVersion, targets: [saved.targets[0], saved.targets[1]], boardDrivers, positions, links: [...linksById.values()], hints, attempts, mode, dailyKey };
}

export default function Home() {
  const dailyChallenge = useMemo(() => dailyChallengeForKey(budapestDateKey()), []);
  const boardRef = useRef<HTMLDivElement>(null);
  const driverGridRef = useRef<HTMLDivElement>(null);
  const teamGridRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ id: string; pointerId: number; startX: number; startY: number; startPosition: Position } | null>(null);
  const pinTimersRef = useRef<number[]>([]);
  const pinSequenceRef = useRef(0);
  const suppressClickRef = useRef(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const [boardSize, setBoardSize] = useState({ width: 1, height: 1 });
  const [targets, setTargets] = useState<TargetPair>(() => dailyChallenge.puzzle.targets);
  const [boardDrivers, setBoardDrivers] = useState(() => [...dailyChallenge.puzzle.targets]);
  const [positions, setPositions] = useState<Record<string, Position>>(() => targetPositions(dailyChallenge.puzzle.targets));
  const [gameMode, setGameMode] = useState<GameMode>("daily");
  const [dailyCompletion, setDailyCompletion] = useState<DailyCompletion | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [team, setTeam] = useState("");
  const [links, setLinks] = useState<ActiveLink[]>([]);
  const [notice, setNotice] = useState<Notice>({ kind: "info", text: "Connect two pinned notes, choose their historical team, then verify the link." });
  const [search, setSearch] = useState("");
  const [hints, setHints] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [evidenceLinkId, setEvidenceLinkId] = useState<string | null>(null);
  const [freePlayStart, setFreePlayStart] = useState(DEFAULT_TARGETS[0]);
  const [freePlayTarget, setFreePlayTarget] = useState(DEFAULT_TARGETS[1]);
  const [hydrated, setHydrated] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState<number | null>(null);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportLinkId, setReportLinkId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState("Incorrect team or teammate link");
  const [reportDetails, setReportDetails] = useState("");
  const [reportCopied, setReportCopied] = useState(false);
  const [deckSelection, setDeckSelection] = useState("0");
  const [draftString, setDraftString] = useState<DraftString | null>(null);
  const [pendingPair, setPendingPair] = useState<TargetPair | null>(null);
  const [teamPickerOpen, setTeamPickerOpen] = useState(false);
  const [teamSearch, setTeamSearch] = useState("");
  const [teamPickerError, setTeamPickerError] = useState("");
  const [driverPickerOpen, setDriverPickerOpen] = useState(false);
  const [liftingId, setLiftingId] = useState<string | null>(null);
  const [pinHoles, setPinHoles] = useState<PinTrace[]>([]);
  const [fallingPins, setFallingPins] = useState<PinTrace[]>([]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [motionPreference, setMotionPreference] = useState<MotionPreference>("system");
  const [contrastPreference, setContrastPreference] = useState<ContrastPreference>("standard");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [hapticsEnabled, setHapticsEnabled] = useState(true);
  const [settingsHydrated, setSettingsHydrated] = useState(false);
  const hasOpenModal = onboardingStep !== null || reportOpen || teamPickerOpen || driverPickerOpen || settingsOpen;

  useEffect(() => {
    const board = boardRef.current;
    if (!board) return;
    const observer = new ResizeObserver(([entry]) => setBoardSize({ width: entry.contentRect.width, height: entry.contentRect.height }));
    observer.observe(board);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const pinTimers = pinTimersRef.current;
    const cancelDraft = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDraftString(null);
    };
    window.addEventListener("keydown", cancelDraft);
    return () => {
      window.removeEventListener("keydown", cancelDraft);
      pinTimers.forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  useEffect(() => {
    const openDriverPicker = (event: KeyboardEvent) => {
      if (event.code !== "Space" || !event.shiftKey || event.ctrlKey || event.altKey || event.metaKey || hasOpenModal) return;
      const target = event.target as HTMLElement | null;
      if (target?.isContentEditable || target?.matches("input, textarea, select")) return;
      event.preventDefault();
      setDraftString(null);
      setSearch("");
      setDriverPickerOpen(true);
    };
    window.addEventListener("keydown", openDriverPicker);
    return () => window.removeEventListener("keydown", openDriverPicker);
  }, [hasOpenModal]);

  useEffect(() => {
    const restore = window.setTimeout(() => {
      try {
        const serialized = readLocalValue(ROUND_STORAGE_KEY);
        if (!serialized) return;
        const saved = canonicalizeSavedRound(JSON.parse(serialized) as unknown, dailyChallenge.dateKey);
        if (!saved) {
          removeLocalValue(ROUND_STORAGE_KEY);
          return;
        }
        setTargets(saved.targets);
        setBoardDrivers(saved.boardDrivers);
        setPositions(saved.positions);
        setLinks(saved.links);
        setHints(saved.hints);
        setAttempts(saved.attempts);
        setGameMode(saved.mode);
        setFreePlayStart(saved.targets[0]);
        setFreePlayTarget(saved.targets[1]);
        setNotice({ kind: "info", text: "Your unfinished route was restored on this device." });
      } catch {
        removeLocalValue(ROUND_STORAGE_KEY);
      } finally {
        setHydrated(true);
      }
    }, 0);
    return () => window.clearTimeout(restore);
  }, [dailyChallenge.dateKey]);

  useEffect(() => {
    const restoreDaily = window.setTimeout(() => {
      try {
        const serialized = readLocalValue(DAILY_STORAGE_KEY);
        if (!serialized) return;
        const saved = JSON.parse(serialized) as Partial<DailyCompletion>;
        if (saved.dateKey !== dailyChallenge.dateKey || saved.puzzleId !== dailyChallenge.puzzle.id || saved.graphVersion !== GRAPH.graphVersion || typeof saved.links !== "number" || typeof saved.hints !== "number" || typeof saved.attempts !== "number" || typeof saved.completedAt !== "string") return;
        setDailyCompletion(saved as DailyCompletion);
      } catch { /* A damaged history record does not block the daily puzzle. */ }
    }, 0);
    return () => window.clearTimeout(restoreDaily);
  }, [dailyChallenge]);

  useEffect(() => {
    const showOnboarding = window.setTimeout(() => {
      if (!readLocalValue(ONBOARDING_STORAGE_KEY)) setOnboardingStep(0);
    }, 0);
    return () => window.clearTimeout(showOnboarding);
  }, []);

  useEffect(() => {
    const restoreSettings = window.setTimeout(() => {
      try {
        const serialized = readLocalValue(SETTINGS_STORAGE_KEY);
        if (!serialized) return;
        const saved = JSON.parse(serialized) as { motion?: unknown; contrast?: unknown; sound?: unknown; haptics?: unknown };
        if (saved.motion === "system" || saved.motion === "full" || saved.motion === "reduced") setMotionPreference(saved.motion);
        if (saved.contrast === "standard" || saved.contrast === "high") setContrastPreference(saved.contrast);
        if (typeof saved.sound === "boolean") setSoundEnabled(saved.sound);
        if (typeof saved.haptics === "boolean") setHapticsEnabled(saved.haptics);
      } catch {
        removeLocalValue(SETTINGS_STORAGE_KEY);
      } finally {
        setSettingsHydrated(true);
      }
    }, 0);
    return () => window.clearTimeout(restoreSettings);
  }, []);

  useEffect(() => {
    if (!settingsHydrated) return;
    writeLocalValue(SETTINGS_STORAGE_KEY, JSON.stringify({ motion: motionPreference, contrast: contrastPreference, sound: soundEnabled, haptics: hapticsEnabled }));
  }, [settingsHydrated, motionPreference, contrastPreference, soundEnabled, hapticsEnabled]);

  useEffect(() => () => {
    if (audioContextRef.current) void audioContextRef.current.close();
  }, []);

  useEffect(() => {
    if (!hasOpenModal) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previousOverflow; };
  }, [hasOpenModal]);

  const completedPath = useMemo(() => findPath(links, targets), [links, targets]);
  const parPath = useMemo(() => shortestGraphPath(targets[0], targets[1]), [targets]);
  const par = Math.max(0, (parPath?.length ?? 1) - 1);
  const currentPuzzleIndex = CURATED_PUZZLES.findIndex((puzzle) => puzzle.targets[0] === targets[0] && puzzle.targets[1] === targets[1]);
  const currentPuzzle = currentPuzzleIndex >= 0 ? CURATED_PUZZLES[currentPuzzleIndex] : null;
  const resultDelta = completedPath ? completedPath.length - 1 - par : null;

  useEffect(() => {
    if (!hydrated) return;
    if (completedPath) {
      removeLocalValue(ROUND_STORAGE_KEY);
      return;
    }
    const round: SavedRound = { version: 1, graphVersion: GRAPH.graphVersion, targets, boardDrivers, positions, links, hints, attempts, mode: gameMode, dailyKey: gameMode === "daily" ? dailyChallenge.dateKey : undefined };
    const saveRound = window.setTimeout(() => writeLocalValue(ROUND_STORAGE_KEY, JSON.stringify(round)), 250);
    return () => window.clearTimeout(saveRound);
  }, [hydrated, completedPath, targets, boardDrivers, positions, links, hints, attempts, gameMode, dailyChallenge.dateKey]);

  useEffect(() => {
    if (gameMode !== "daily" || !completedPath) return;
    const completion: DailyCompletion = {
      dateKey: dailyChallenge.dateKey,
      puzzleId: dailyChallenge.puzzle.id,
      graphVersion: GRAPH.graphVersion,
      links: completedPath.length - 1,
      hints,
      attempts,
      completedAt: new Date().toISOString(),
    };
    setDailyCompletion(completion);
    writeLocalValue(DAILY_STORAGE_KEY, JSON.stringify(completion));
  }, [gameMode, completedPath, dailyChallenge, hints, attempts]);

  const evidenceLink = links.find((link) => link.id === evidenceLinkId) ?? null;
  const reportLink = links.find((link) => link.id === reportLinkId) ?? null;
  const reportText = useMemo(() => {
    const linkContext = reportLink
      ? `${driverById(reportLink.driverAId).name} <-> ${driverById(reportLink.driverBId).name} at ${reportLink.teamName}\nEvidence: ${reportLink.evidence.eventCount} shared events, ${reportLink.evidence.firstEventId} to ${reportLink.evidence.lastEventId}`
      : `Round: ${driverById(targets[0]).name} -> ${driverById(targets[1]).name}`;
    return `Paddock Links data report\nGraph: ${GRAPH.graphVersion}\nSource: F1DB ${GRAPH.sourceVersion}\nReason: ${reportReason}\n${linkContext}\nDetails: ${reportDetails.trim() || "No additional details provided."}`;
  }, [reportDetails, reportLink, reportReason, targets]);
  const availableDrivers = DRIVERS.filter((driver) => !boardDrivers.includes(driver.id) && driver.name.toLowerCase().includes(search.trim().toLowerCase()));
  const filteredTeams = ALL_TEAMS.filter((constructor) => constructor.name.toLowerCase().includes(teamSearch.trim().toLowerCase()));
  const notePinOffsetPx = boardSize.width <= 430 ? 39 : boardSize.width <= 700 ? 45 : 54;

  const playFeedback = (cue: FeedbackCue, successfulLinks = 0) => {
    if (hapticsEnabled && "vibrate" in navigator) {
      const pattern: Record<FeedbackCue, number | number[]> = {
        pickup: 6,
        place: 9,
        link: 16,
        error: [9, 34, 9],
        complete: [18, 35, 30],
      };
      navigator.vibrate(pattern[cue]);
    }
    if (!soundEnabled) return;
    const AudioContextConstructor = window.AudioContext ?? (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextConstructor) return;
    const context = audioContextRef.current ?? new AudioContextConstructor();
    audioContextRef.current = context;
    if (context.state === "suspended") void context.resume();

    const playThump = (start: number, placement: boolean) => {
      const body = context.createOscillator();
      const tap = context.createOscillator();
      const bodyGain = context.createGain();
      const tapGain = context.createGain();
      body.type = "sine";
      tap.type = "triangle";
      body.frequency.setValueAtTime(placement ? 92 : 108, start);
      body.frequency.exponentialRampToValueAtTime(46, start + 0.13);
      tap.frequency.setValueAtTime(placement ? 185 : 155, start);
      tap.frequency.exponentialRampToValueAtTime(78, start + 0.055);
      bodyGain.gain.setValueAtTime(0.0001, start);
      bodyGain.gain.exponentialRampToValueAtTime(0.055, start + 0.004);
      bodyGain.gain.exponentialRampToValueAtTime(0.0001, start + 0.14);
      tapGain.gain.setValueAtTime(0.0001, start);
      tapGain.gain.exponentialRampToValueAtTime(0.018, start + 0.002);
      tapGain.gain.exponentialRampToValueAtTime(0.0001, start + 0.06);
      body.connect(bodyGain).connect(context.destination);
      tap.connect(tapGain).connect(context.destination);
      body.start(start);
      tap.start(start);
      body.stop(start + 0.15);
      tap.stop(start + 0.07);
    };

    const playViolinNote = (frequency: number, start: number, duration: number, gain = 0.017) => {
      const fundamental = context.createOscillator();
      const harmonic = context.createOscillator();
      const vibrato = context.createOscillator();
      const vibratoDepth = context.createGain();
      const harmonicGain = context.createGain();
      const envelope = context.createGain();
      const warmth = context.createBiquadFilter();
      fundamental.type = "sawtooth";
      harmonic.type = "triangle";
      vibrato.type = "sine";
      fundamental.frequency.setValueAtTime(frequency, start);
      harmonic.frequency.setValueAtTime(frequency * 2, start);
      vibrato.frequency.setValueAtTime(5.4, start);
      vibratoDepth.gain.setValueAtTime(frequency * 0.004, start);
      harmonicGain.gain.setValueAtTime(0.18, start);
      vibrato.connect(vibratoDepth);
      vibratoDepth.connect(fundamental.frequency);
      vibratoDepth.connect(harmonic.frequency);
      warmth.type = "lowpass";
      warmth.frequency.setValueAtTime(2400, start);
      warmth.Q.setValueAtTime(1.2, start);
      envelope.gain.setValueAtTime(0.0001, start);
      envelope.gain.exponentialRampToValueAtTime(gain, start + 0.06);
      envelope.gain.setValueAtTime(gain, start + Math.max(0.07, duration - 0.09));
      envelope.gain.exponentialRampToValueAtTime(0.0001, start + duration);
      fundamental.connect(warmth);
      harmonic.connect(harmonicGain).connect(warmth);
      warmth.connect(envelope).connect(context.destination);
      fundamental.start(start);
      harmonic.start(start);
      vibrato.start(start);
      fundamental.stop(start + duration + 0.02);
      harmonic.stop(start + duration + 0.02);
      vibrato.stop(start + duration + 0.02);
    };

    const start = context.currentTime + 0.008;
    if (cue === "pickup" || cue === "place") {
      playThump(start, cue === "place");
      return;
    }
    if (cue === "error") {
      playViolinNote(185, start, 0.16, 0.009);
      playViolinNote(155.56, start + 0.11, 0.2, 0.007);
      return;
    }
    const cMajorScale = [523.25, 587.33, 659.25, 698.46, 783.99, 880, 987.77, 1046.5];
    const risingFrequency = cMajorScale[Math.min(successfulLinks, cMajorScale.length - 1)];
    if (cue === "link") {
      playViolinNote(risingFrequency, start, 0.38);
      return;
    }
    playViolinNote(risingFrequency, start, 0.32);
    const completionPhrase = [523.25, 659.25, 783.99, 1046.5];
    completionPhrase.forEach((frequency, index) => {
      playViolinNote(frequency, start + 0.22 + index * 0.17, index === completionPhrase.length - 1 ? 0.62 : 0.34, index === completionPhrase.length - 1 ? 0.02 : 0.015);
    });
    playViolinNote(523.25, start + 0.73, 0.58, 0.007);
    playViolinNote(783.99, start + 0.73, 0.58, 0.006);
  };

  const updateSelection = (slot: 0 | 1, value: string) => {
    setSelected((current) => {
      const next = [...current];
      if (!value) next.splice(slot, 1);
      else next[slot] = value;
      return next.filter(Boolean).slice(0, 2);
    });
    setTeam("");
  };

  const releasePin = (id: string, position: Position) => {
    const pinOffset = (notePinOffsetPx / Math.max(1, boardSize.height)) * 100;
    pinSequenceRef.current += 1;
    const sequence = pinSequenceRef.current;
    const trace: PinTrace = {
      id: `${id}-${sequence}`,
      x: position.x,
      y: Math.max(2, position.y - pinOffset),
      rotation: ((sequence * 17 + id.length * 7) % 37) - 18,
    };
    setPinHoles((current) => [...current, trace]);
    const reducedMotion = motionPreference === "reduced" || (motionPreference === "system" && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    if (!reducedMotion) {
      setFallingPins((current) => [...current, trace]);
      pinTimersRef.current.push(window.setTimeout(() => setFallingPins((current) => current.filter((pin) => pin.id !== trace.id)), 950));
    }
    pinTimersRef.current.push(window.setTimeout(() => setPinHoles((current) => current.filter((hole) => hole.id !== trace.id)), 10_050));
  };

  const beginString = (id: string) => {
    setDraftString({ fromId: id, end: positions[id] });
    setSelected([id]);
    setTeam("");
    setNotice({ kind: "info", text: `String attached to ${driverById(id).name}. Click another note to complete it; press Escape to cancel.` });
  };

  const finishString = (id: string) => {
    if (!draftString) return;
    if (draftString.fromId === id) {
      setDraftString(null);
      setNotice({ kind: "info", text: "String cancelled. Use any note attachment to start again." });
      return;
    }
    const pair: TargetPair = [draftString.fromId, id];
    setDraftString(null);
    setPendingPair(pair);
    setSelected(pair);
    setTeam("");
    setTeamSearch("");
    setTeamPickerError("");
    setTeamPickerOpen(true);
  };

  const handleBoardPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!draftString || !boardRef.current) return;
    const bounds = boardRef.current.getBoundingClientRect();
    const end = {
      x: Math.max(0, Math.min(100, ((event.clientX - bounds.left) / bounds.width) * 100)),
      y: Math.max(0, Math.min(100, ((event.clientY - bounds.top) / bounds.height) * 100)),
    };
    setDraftString((current) => current ? { ...current, end } : current);
  };

  const handlePuckClick = (id: string) => {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      return;
    }
    if (draftString) {
      finishString(id);
      return;
    }
    setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : current.length >= 2 ? [id] : [...current, id]);
    setTeam("");
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLButtonElement>, id: string) => {
    if (event.button !== 0 || draftString) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    releasePin(id, positions[id]);
    playFeedback("pickup");
    setLiftingId(id);
    dragRef.current = { id, pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, startPosition: positions[id] };
    suppressClickRef.current = false;
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;
    if (Math.abs(dx) + Math.abs(dy) > 5) suppressClickRef.current = true;
    const x = Math.max(6, Math.min(94, drag.startPosition.x + (dx / boardSize.width) * 100));
    const y = Math.max(12, Math.min(84, drag.startPosition.y + (dy / boardSize.height) * 100));
    setPositions((current) => ({ ...current, [drag.id]: { x, y } }));
  };

  const handlePointerUp = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;
    if (drag?.pointerId !== event.pointerId) return;
    dragRef.current = null;
    setLiftingId(null);
    if (event.type === "pointercancel") suppressClickRef.current = false;
    else playFeedback("place");
  };

  const nudgePuck = (id: string, key: string) => {
    const movement: Record<string, Position> = {
      ArrowLeft: { x: -2, y: 0 }, ArrowRight: { x: 2, y: 0 }, ArrowUp: { x: 0, y: -2 }, ArrowDown: { x: 0, y: 2 },
    };
    const delta = movement[key];
    if (!delta) return false;
    releasePin(id, positions[id]);
    playFeedback("pickup");
    setPositions((current) => ({
      ...current,
      [id]: { x: Math.max(6, Math.min(94, current[id].x + delta.x)), y: Math.max(12, Math.min(84, current[id].y + delta.y)) },
    }));
    window.setTimeout(() => playFeedback("place"), 55);
    return true;
  };

  const commitLink = ([driverAId, driverBId]: TargetPair, teamId: string, fromCanvas = false) => {
    const definition = EDGES_BY_PAIR.get(pairKey(driverAId, driverBId));
    setAttempts((value) => value + 1);
    if (!definition) {
      const text = `No shared race entry found for ${driverById(driverAId).name} and ${driverById(driverBId).name}.`;
      setNotice({ kind: "error", text });
      if (fromCanvas) setTeamPickerError(text);
      playFeedback("error");
      return false;
    }
    const evidence = definition.teams.find((candidate) => candidate.id === teamId);
    const selectedTeam = ALL_TEAMS.find((candidate) => candidate.id === teamId);
    if (!evidence) {
      const text = `They were teammates, but not at ${selectedTeam?.name ?? "that team"}. Try another historical team.`;
      setNotice({ kind: "error", text });
      if (fromCanvas) setTeamPickerError(text);
      playFeedback("error");
      return false;
    }
    const id = pairKey(driverAId, driverBId);
    const nextLink: ActiveLink = { id, driverAId, driverBId, teamId: evidence.id, teamName: evidence.name, evidence };
    const nextLinks = [...links.filter((link) => link.id !== id), nextLink];
    setLinks(nextLinks);
    playFeedback(findPath(nextLinks, targets) ? "complete" : "link", nextLinks.length - 1);
    setNotice({ kind: "success", text: `${driverById(driverAId).name} and ${driverById(driverBId).name} connected at ${evidence.name}.` });
    setSelected([]);
    setTeam("");
    setTeamPickerError("");
    setTeamPickerOpen(false);
    setPendingPair(null);
    return true;
  };

  const verifyLink = () => {
    if (selected.length !== 2 || !team) {
      setNotice({ kind: "error", text: "Choose two drivers and a team first." });
      playFeedback("error");
      return;
    }
    commitLink([selected[0], selected[1]], team);
  };

  const chooseCanvasTeam = (teamId: string) => {
    if (!pendingPair) return;
    setTeam(teamId);
    commitLink(pendingPair, teamId, true);
  };

  const closeTeamPicker = () => {
    setTeamPickerOpen(false);
    setPendingPair(null);
    setTeamSearch("");
    setTeamPickerError("");
    setSelected([]);
    setTeam("");
  };

  const addDriver = (id: string) => {
    setBoardDrivers((current) => [...current, id]);
    const index = boardDrivers.length;
    setPositions((current) => ({ ...current, [id]: { x: 24 + ((index * 17) % 55), y: 72 + ((index % 2) * 10) } }));
    setDriverPickerOpen(false);
    setSearch("");
    setNotice({ kind: "info", text: `${driverById(id).name} added to the board.` });
  };

  const removeDriver = (id: string) => {
    if (targets.includes(id)) {
      setNotice({ kind: "error", text: "Target drivers stay on the board. Start a new pair to change them." });
      return;
    }
    const connectedLinkIds = links.filter((link) => link.driverAId === id || link.driverBId === id).map((link) => link.id);
    setBoardDrivers((current) => current.filter((driverId) => driverId !== id));
    setPositions((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });
    setLinks((current) => current.filter((link) => link.driverAId !== id && link.driverBId !== id));
    setSelected([]);
    setTeam("");
    if (evidenceLinkId && connectedLinkIds.includes(evidenceLinkId)) setEvidenceLinkId(null);
    setNotice({ kind: "info", text: `${driverById(id).name} and ${connectedLinkIds.length} connected ${connectedLinkIds.length === 1 ? "link" : "links"} removed.` });
  };

  const removeLink = (id: string) => {
    const link = links.find((candidate) => candidate.id === id);
    if (!link) return;
    setLinks((current) => current.filter((candidate) => candidate.id !== id));
    setEvidenceLinkId(null);
    setSelected([link.driverAId, link.driverBId]);
    setTeam(link.teamId);
    setNotice({ kind: "info", text: `${link.teamName} link removed. Its drivers are selected so you can verify a replacement.` });
  };

  const dismissOnboarding = () => {
    writeLocalValue(ONBOARDING_STORAGE_KEY, "complete");
    setOnboardingStep(null);
  };

  const openReport = (linkId: string | null = null) => {
    setOnboardingStep(null);
    setReportLinkId(linkId);
    setReportReason(linkId ? "Incorrect team or teammate link" : "Missing teammate link");
    setReportDetails("");
    setReportCopied(false);
    setReportOpen(true);
  };

  const copyReport = async () => {
    try {
      const copied = await writeClipboard(reportText);
      if (!copied) throw new Error("Copy was unavailable");
      setReportCopied(true);
      setNotice({ kind: "success", text: "Structured data report copied. No report was sent automatically." });
    } catch {
      setNotice({ kind: "error", text: "The browser blocked clipboard access. Select the report details and try again." });
    }
  };

  const autoArrange = () => {
    motionFramesRef.current.forEach((frame) => cancelAnimationFrame(frame));
    motionFramesRef.current.clear();
    const priority = completedPath ?? [targets[0], ...boardDrivers.filter((id) => !targets.includes(id)), targets[1]];
    const next: Record<string, Position> = { ...positions };
    const routeDrivers = priority.filter((id, index) => boardDrivers.includes(id) && priority.indexOf(id) === index);
    routeDrivers.forEach((id, index) => {
      const denominator = Math.max(1, routeDrivers.length - 1);
      next[id] = { x: 14 + (index / denominator) * 72, y: 47 };
    });
    boardDrivers.filter((id) => !priority.includes(id)).forEach((id, index) => { next[id] = { x: 20 + (index % 4) * 20, y: 78 }; });
    setPositions(next);
    setNotice({ kind: "info", text: "Board arranged into a readable route." });
  };

  const showHint = () => {
    const next = hints + 1;
    setHints(next);
    const bridge = parPath?.[1];
    const routeReveal = parPath?.map((id, index) => {
      if (!index) return driverById(id).name;
      const previous = parPath[index - 1];
      const edge = EDGES_BY_PAIR.get(pairKey(previous, id));
      return `${edge?.teams[0]?.name ?? "shared team"} — ${driverById(id).name}`;
    }).join(" — ");
    const messages = [
      `The shortest known route uses ${par} ${par === 1 ? "link" : "links"}. Look for a teammate of ${driverById(targets[0]).name}.`,
      bridge ? `First bridge: try adding ${driverById(bridge).name}.` : "These drivers share a direct teammate link.",
      routeReveal ? `Route reveal: ${routeReveal}.` : "No route is available in this graph version.",
    ];
    setNotice({ kind: "info", text: messages[Math.min(next - 1, messages.length - 1)] });
  };

  const clearRoundState = (nextTargets: TargetPair, text: string, nextMode: GameMode = gameMode) => {
    removeLocalValue(ROUND_STORAGE_KEY);
    setGameMode(nextMode);
    setTargets(nextTargets); setBoardDrivers([...nextTargets]); setPositions(targetPositions(nextTargets)); setSelected([]); setTeam(""); setLinks([]);
    setHints(0); setAttempts(0); setEvidenceLinkId(null);
    setDraftString(null); setPendingPair(null); setTeamPickerOpen(false); setTeamSearch(""); setTeamPickerError(""); setDriverPickerOpen(false);
    setLiftingId(null); setPinHoles([]); setFallingPins([]);
    setFreePlayStart(nextTargets[0]); setFreePlayTarget(nextTargets[1]);
    setNotice({ kind: "info", text });
  };

  const reset = () => {
    clearRoundState(targets, "Fresh board. Build another valid route between the same targets.");
  };

  const startFreePlay = () => {
    if (freePlayStart === freePlayTarget) {
      setNotice({ kind: "error", text: "Choose two different target drivers." });
      return;
    }
    const nextTargets: TargetPair = [freePlayStart, freePlayTarget];
    const nextParPath = shortestGraphPath(...nextTargets);
    if (!nextParPath) {
      setNotice({ kind: "error", text: "Those drivers are not connected in this graph version. Try another pair." });
      return;
    }
    setSearch("");
    clearRoundState(nextTargets, `Free Play started. Par ${nextParPath.length - 1}; add possible bridge drivers to the case board.`, "free");
  };

  const startCuratedPuzzle = (index: number) => {
    const puzzle = CURATED_PUZZLES[index];
    if (!puzzle) return;
    const puzzlePar = (shortestGraphPath(puzzle.targets[0], puzzle.targets[1])?.length ?? 1) - 1;
    setDeckSelection(String(index));
    setSearch("");
    clearRoundState(puzzle.targets, `${puzzle.title} started. Formation Lap · Par ${puzzlePar}.`, "formation");
  };

  const startDailyChallenge = () => {
    const puzzlePar = (shortestGraphPath(dailyChallenge.puzzle.targets[0], dailyChallenge.puzzle.targets[1])?.length ?? 1) - 1;
    setSearch("");
    clearRoundState(dailyChallenge.puzzle.targets, `Daily Chain ${dailyDateLabel(dailyChallenge.dateKey)} started. Reviewed case · Par ${puzzlePar}.`, "daily");
  };

  const startNextPuzzle = () => {
    const nextIndex = currentPuzzleIndex >= 0 ? (currentPuzzleIndex + 1) % CURATED_PUZZLES.length : 0;
    startCuratedPuzzle(nextIndex);
  };

  return (
    <main className="app-shell" data-motion={motionPreference} data-contrast={contrastPreference}>
      <a className="skip-link" href="#link-controls">Skip to link controls</a>
      <header className="topbar">
        <div className="brand-lockup">
          <span className="brand-mark" aria-hidden="true"><i /><i /><i /></span>
          <div><p className="eyebrow">F1 connection game</p><h1>Paddock Links</h1></div>
        </div>
        <div className="puzzle-meta" aria-label="Puzzle details">
          <span><small>{gameMode === "daily" ? "Daily Chain" : gameMode === "formation" ? "Challenge deck" : "Free Play"}</small> {gameMode === "daily" ? `${dailyDateLabel(dailyChallenge.dateKey)} · ${dailyChallenge.puzzle.title}` : currentPuzzle?.title ?? `${driverById(targets[0]).name} → ${driverById(targets[1]).name}`}</span>
          <span><small>Difficulty</small> Formation Lap</span>
          <span><small>Par</small> {par} links</span>
        </div>
        <div className="topbar-actions">
          <button className="ghost-button" onClick={() => setOnboardingStep(0)}>How to play</button>
          <button className="ghost-button" onClick={() => setSettingsOpen(true)}>Settings</button>
          <button className="ghost-button" onClick={reset}>Reset puzzle</button>
        </div>
      </header>

      <section className="game-layout">
        <div className="board-column">
          <div className="board-intro">
            <div>
              <p className="section-label"><span className="live-dot" /> Test board</p>
              <h2>Connect the two target drivers</h2>
              <p id="board-help">Lift and move a note; it pins down wherever you release it. Use its + attachment to pull a string to another driver.</p>
            </div>
            <div className="board-actions">
              <button onClick={() => setLinks((current) => current.slice(0, -1))} disabled={!links.length}>Undo</button>
              <button onClick={() => selected[0] && removeDriver(selected[0])} disabled={selected.length !== 1 || targets.includes(selected[0])}>Remove note</button>
              <button onClick={autoArrange}>Auto-arrange</button>
              <button onClick={showHint}>Hint <span>{hints}</span></button>
            </div>
          </div>

          <div className={`board ${draftString ? "is-drawing-string" : ""}`} ref={boardRef} onPointerMove={handleBoardPointerMove} aria-label="Interactive driver connection board" aria-describedby="board-help">
            <p className="sr-only">{boardDrivers.length} drivers are on the board. Press Shift and Space to add a driver. Use Tab to reach a note, Enter to select it, and arrow keys to move it.</p>
            <button className="board-add-driver" aria-keyshortcuts="Shift+Space" title="Add driver (Shift + Space)" onClick={() => { setDraftString(null); setSearch(""); setDriverPickerOpen(true); }}><span aria-hidden="true">+</span> Add driver <kbd>⇧ Space</kbd></button>
            <div className="measurement measurement-top" aria-hidden="true" />
            <div className="measurement measurement-bottom" aria-hidden="true" />

            {pinHoles.map((hole) => <span key={hole.id} className="pin-hole" aria-hidden="true" style={{ left: `${hole.x}%`, top: `${hole.y}%` }} />)}
            {fallingPins.map((pin) => <span key={pin.id} className="falling-pin" aria-hidden="true" style={{ left: `${pin.x}%`, top: `${pin.y}%`, "--pin-fall-rotation": `${pin.rotation}deg` } as CSSProperties}><i /></span>)}

            {draftString && positions[draftString.fromId] && (() => {
              const start = positions[draftString.fromId];
              const startPx = { x: (start.x / 100) * boardSize.width, y: (start.y / 100) * boardSize.height - notePinOffsetPx };
              const endPx = { x: (draftString.end.x / 100) * boardSize.width, y: (draftString.end.y / 100) * boardSize.height };
              const dx = endPx.x - startPx.x;
              const dy = endPx.y - startPx.y;
              const lineStyle = { left: startPx.x, top: startPx.y, width: Math.sqrt(dx * dx + dy * dy), transform: `rotate(${Math.atan2(dy, dx) * (180 / Math.PI)}deg)`, "--team-color": "#c7f46a" } as CSSProperties;
              return <div className="link-layer draft-link-layer" aria-hidden="true"><div className="string-line draft-string-line" style={lineStyle}><span /></div></div>;
            })()}

            {links.map((link) => {
              const start = positions[link.driverAId];
              const end = positions[link.driverBId];
              if (!start || !end) return null;
              const startPx = { x: (start.x / 100) * boardSize.width, y: (start.y / 100) * boardSize.height - notePinOffsetPx };
              const endPx = { x: (end.x / 100) * boardSize.width, y: (end.y / 100) * boardSize.height - notePinOffsetPx };
              const dx = endPx.x - startPx.x;
              const dy = endPx.y - startPx.y;
              const distance = Math.sqrt(dx * dx + dy * dy);
              const angle = Math.atan2(dy, dx) * (180 / Math.PI);
              const teamColor = TEAM_COLORS[link.teamId] ?? DEFAULT_TEAM_COLOR;
              const lineStyle = { left: startPx.x, top: startPx.y, width: distance, transform: `rotate(${angle}deg)`, "--team-color": teamColor } as CSSProperties;
              const labelStyle = { left: (startPx.x + endPx.x) / 2, top: (startPx.y + endPx.y) / 2, "--team-color": teamColor } as CSSProperties;
              return (
                <div className="link-layer" key={link.id}>
                  <div className="string-line" style={lineStyle}><span /></div>
                  <button className="team-label" style={labelStyle} onClick={() => setEvidenceLinkId(link.id)} aria-label={`View evidence for ${link.teamName} link`}>
                    {link.teamName}<small>verified</small>
                  </button>
                </div>
              );
            })}

            {boardDrivers.map((id) => {
              const driver = driverById(id);
              const position = positions[id];
              const isTarget = targets.includes(id);
              const isSelected = selected.includes(id);
              return (
                <div key={id} className={`driver-puck tone-${driver.tone} ${isTarget ? "is-target" : ""} ${isSelected ? "is-selected" : ""} ${liftingId === id ? "is-lifted" : ""} ${draftString && draftString.fromId !== id ? "is-string-target" : ""}`} style={{ left: `${position.x}%`, top: `${position.y}%` }}>
                  <span className="board-pin" aria-hidden="true"><i /></span>
                  <button
                    className="puck-drag-surface"
                    onClick={() => handlePuckClick(id)}
                    onPointerDown={(event) => handlePointerDown(event, id)}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerCancel={handlePointerUp}
                    onKeyDown={(event) => { if (nudgePuck(id, event.key)) event.preventDefault(); }}
                    aria-pressed={isSelected}
                    aria-label={`${driver.name}${isTarget ? ", target driver" : ""}. Pinned case note. Select or drag; use arrow keys to move.`}
                  >
                    {isTarget && <span className="target-tag">TARGET</span>}
                    <span className="puck-face"><b>{driver.initials}</b><i /></span>
                    <span className="driver-plate"><strong>{driver.name}</strong><small>{driver.years}</small></span>
                  </button>
                  <button className="connection-port" onClick={(event) => { event.stopPropagation(); if (draftString) finishString(id); else beginString(id); }} aria-label={`${draftString ? "Complete" : "Start"} a connection ${draftString ? "at" : "from"} ${driver.name}`} title={`${draftString ? "Complete string at" : "Draw string from"} ${driver.name}`}><span aria-hidden="true">+</span></button>
                </div>
              );
            })}

            {completedPath && (
              <div className="completion-banner" role="status" aria-live="polite">
                <span>{gameMode === "daily" ? "Daily Chain complete" : resultDelta === 0 ? "Par route" : "Valid route complete"}</span><strong>Connected in {completedPath.length - 1} links</strong>
                <small>{resultDelta === 0 ? "Shortest known route found" : `${resultDelta} ${resultDelta === 1 ? "link" : "links"} over par`} · {hints} {hints === 1 ? "hint" : "hints"}</small>
                <p>{completedPath.map((id) => driverById(id).name).join(" → ")}</p>
                <button onClick={startNextPuzzle}>{gameMode === "daily" ? "Explore another case" : "Next challenge"} <b>→</b></button>
              </div>
            )}
          </div>

          <div className={`notice notice-${notice.kind}`} role="status" aria-live="polite">
            <span aria-hidden="true">{notice.kind === "success" ? "✓" : notice.kind === "error" ? "!" : "i"}</span><p>{notice.text}</p>
          </div>
        </div>

        <aside className="control-rail">
          <details className="control-card connect-card accessible-controls" id="link-controls" tabIndex={-1}>
            <summary><span>Keyboard link form</span><i aria-hidden="true">+</i></summary>
            <div className="accessible-controls-body">
            <label>First driver
              <select value={selected[0] ?? ""} onChange={(event) => updateSelection(0, event.target.value)}>
                <option value="">Choose a note</option>
                {boardDrivers.map((id) => <option key={id} value={id}>{driverById(id).name}</option>)}
              </select>
            </label>
            <label>Second driver
              <select value={selected[1] ?? ""} onChange={(event) => updateSelection(1, event.target.value)}>
                <option value="">Choose a note</option>
                {boardDrivers.filter((id) => id !== selected[0]).map((id) => <option key={id} value={id}>{driverById(id).name}</option>)}
              </select>
            </label>
            <label>Historical team
              <select value={team} onChange={(event) => setTeam(event.target.value)}>
                <option value="">Choose a team</option>{ALL_TEAMS.map((constructor) => <option key={constructor.id} value={constructor.id}>{constructor.name}</option>)}
              </select>
            </label>
            <button className="primary-button" onClick={verifyLink}>Verify connection <span>→</span></button>
            <p className="microcopy">Validation uses the {GRAPH.drivers.length}-driver {GRAPH.graphVersion} graph and shared Grand Prix entries—not season rosters.</p>
            </div>
          </details>

          {evidenceLink ? (
            <section className="control-card evidence-card">
              <div className="card-heading compact"><span>✓</span><div><p>Evidence card</p><h3>{evidenceLink.teamName}</h3></div></div>
              <p className="evidence-pair">{driverById(evidenceLink.driverAId).name} <i /> {driverById(evidenceLink.driverBId).name}</p>
              <dl>
                <div><dt>Status</dt><dd>Playable edge · {evidenceLink.evidence.eventCount} shared {evidenceLink.evidence.eventCount === 1 ? "Grand Prix" : "Grands Prix"}</dd></div>
                <div><dt>Evidence window</dt><dd>{evidenceLink.evidence.firstSeason === evidenceLink.evidence.lastSeason ? evidenceLink.evidence.firstSeason : `${evidenceLink.evidence.firstSeason}–${evidenceLink.evidence.lastSeason}`} · {evidenceLink.evidence.firstEventId} to {evidenceLink.evidence.lastEventId}</dd></div>
              </dl>
              <div className="card-actions">
                <button className="text-button danger-button" onClick={() => removeLink(evidenceLink.id)}>Remove link</button>
                <button className="text-button" onClick={() => openReport(evidenceLink.id)}>Report data</button>
                <button className="text-button" onClick={() => setEvidenceLinkId(null)}>Close</button>
              </div>
            </section>
          ) : (
            <section className="control-card route-card">
              <div className="card-heading compact"><span>02</span><div><p>Route status</p><h3>{links.length ? `${links.length} verified ${links.length === 1 ? "link" : "links"}` : "No links yet"}</h3></div></div>
              <div className="route-track" aria-hidden="true">{[0, 1, 2, 3].map((item) => <i key={item} className={links.length >= item ? "active" : ""} />)}</div>
              <div className="stat-row"><span>Attempts</span><strong>{attempts}</strong><span>Hints</span><strong>{hints}</strong></div>
              <p>Any continuous valid chain wins. Par is a mastery target, never a gate.</p>
            </section>
          )}

          <section className="control-card connect-card daily-card">
            <div className="card-heading compact"><span>03</span><div><p>Daily Chain</p><h3>{dailyDateLabel(dailyChallenge.dateKey)} case file</h3></div></div>
            <div className="daily-stamp"><span>{dailyChallenge.puzzle.title}</span><small>{dailyChallenge.dateKey} · Graph {GRAPH.graphVersion}</small></div>
            {dailyCompletion && <p className="daily-complete" role="status">Completed today · {dailyCompletion.links} {dailyCompletion.links === 1 ? "link" : "links"} · {dailyCompletion.hints} {dailyCompletion.hints === 1 ? "hint" : "hints"}</p>}
            <button className="primary-button" onClick={startDailyChallenge}>{dailyCompletion ? "Replay today's chain" : gameMode === "daily" ? "Restart today's chain" : "Play today's chain"} <span>→</span></button>
            <p className="microcopy">One reviewed pair per Budapest calendar day. The pair and graph version stay fixed for the full daily cycle.</p>
          </section>

          <section className="control-card connect-card challenge-card">
            <div className="card-heading compact"><span>04</span><div><p>Challenge deck</p><h3>Play a curated route</h3></div></div>
            <label>Formation Lap puzzle
              <select value={deckSelection} onChange={(event) => setDeckSelection(event.target.value)}>
                {CURATED_PUZZLES.map((puzzle, index) => {
                  const puzzlePar = (shortestGraphPath(puzzle.targets[0], puzzle.targets[1])?.length ?? 1) - 1;
                  return <option key={puzzle.id} value={index}>{puzzle.title} · Par {puzzlePar}</option>;
                })}
              </select>
            </label>
            <button className="primary-button" onClick={() => startCuratedPuzzle(Number(deckSelection))}>Start challenge <span>→</span></button>
            <p className="microcopy">Five repeatable real-data puzzles for structured testing. Hints and par adapt to each route.</p>
          </section>

          <section className="control-card connect-card free-play-card">
            <div className="card-heading compact"><span>05</span><div><p>Free Play</p><h3>Choose any target pair</h3></div></div>
            <label>Start driver
              <select value={freePlayStart} onChange={(event) => setFreePlayStart(event.target.value)}>
                {DRIVERS.map((driver) => <option key={driver.id} value={driver.id}>{driver.name}</option>)}
              </select>
            </label>
            <label>Target driver
              <select value={freePlayTarget} onChange={(event) => setFreePlayTarget(event.target.value)}>
                {DRIVERS.map((driver) => <option key={driver.id} value={driver.id}>{driver.name}</option>)}
              </select>
            </label>
            <button className="primary-button" onClick={startFreePlay}>Start new round <span>→</span></button>
            <p className="microcopy">Starting a pair clears the current board. Unfinished rounds restore automatically on this device.</p>
          </section>
        </aside>
      </section>

      <footer>
        <span>Paddock Links · Interaction prototype</span>
        <p>Independent fan project. Not affiliated with Formula 1, the FIA, any constructor, or driver. <button className="footer-button" onClick={() => openReport()}>Report a data issue</button></p>
        <span>Graph: {GRAPH.graphVersion} · F1DB {GRAPH.sourceVersion}</span>
      </footer>

      {driverPickerOpen && (
        <div className="modal-backdrop">
          <section className="modal-card driver-picker-card" role="dialog" aria-modal="true" aria-labelledby="driver-picker-title" aria-describedby="driver-picker-description" onKeyDown={(event) => { if (event.key === "Escape") setDriverPickerOpen(false); }}>
            <div className="team-picker-heading">
              <div><p className="section-label">Driver archive</p><h2 id="driver-picker-title">Add a driver to the case</h2></div>
              <button className="team-picker-close" onClick={() => setDriverPickerOpen(false)} aria-label="Close driver picker">×</button>
            </div>
            <p id="driver-picker-description">Search the modern-era archive, then place one driver note onto the evidence sheet. If only one result remains, press Enter to add it.</p>
            <label className="team-search-field"><span aria-hidden="true">⌕</span><input autoFocus value={search} onChange={(event) => setSearch(event.target.value)} onKeyDown={(event) => {
              if (event.key === "Enter" && availableDrivers.length === 1) { event.preventDefault(); addDriver(availableDrivers[0].id); }
              if (event.key === "ArrowDown" && availableDrivers.length) { event.preventDefault(); driverGridRef.current?.querySelector<HTMLButtonElement>("button")?.focus(); }
            }} placeholder="Search drivers" /></label>
            {search.trim() && availableDrivers.length === 1 && <p className="single-result-hint" role="status">One match: <strong>{availableDrivers[0].name}</strong>. Press <kbd>Enter</kbd> to add.</p>}
            <div className="driver-picker-grid" aria-label="Available drivers" ref={driverGridRef}>
              {availableDrivers.map((driver) => (
                <button key={driver.id} onClick={() => addDriver(driver.id)}>
                  <span className={`mini-puck tone-${driver.tone}`}>{driver.initials}</span>
                  <span><strong>{driver.name}</strong><small>{driver.years}</small></span><i aria-hidden="true">+</i>
                </button>
              ))}
              {!availableDrivers.length && <p className="empty-team-grid">No available drivers match “{search}”.</p>}
            </div>
          </section>
        </div>
      )}

      {teamPickerOpen && pendingPair && (
        <div className="modal-backdrop team-picker-backdrop">
          <section className="modal-card team-picker-card" role="dialog" aria-modal="true" aria-labelledby="team-picker-title" aria-describedby="team-picker-description" onKeyDown={(event) => { if (event.key === "Escape") closeTeamPicker(); }}>
            <div className="team-picker-heading">
              <div><p className="section-label">Complete the string</p><h2 id="team-picker-title">Which team connects them?</h2></div>
              <button className="team-picker-close" onClick={closeTeamPicker} aria-label="Cancel team selection">×</button>
            </div>
            <p id="team-picker-description"><strong>{driverById(pendingPair[0]).name}</strong> and <strong>{driverById(pendingPair[1]).name}</strong> need the historical team identity they shared at a Grand Prix. If one search result remains, press Enter to try it.</p>
            <label className="team-search-field"><span aria-hidden="true">⌕</span><input autoFocus value={teamSearch} onChange={(event) => { setTeamSearch(event.target.value); setTeamPickerError(""); }} onKeyDown={(event) => {
              if (event.key === "Enter" && filteredTeams.length === 1) { event.preventDefault(); chooseCanvasTeam(filteredTeams[0].id); }
              if (event.key === "ArrowDown" && filteredTeams.length) { event.preventDefault(); teamGridRef.current?.querySelector<HTMLButtonElement>("button")?.focus(); }
            }} placeholder="Search teams" /></label>
            {teamSearch.trim() && filteredTeams.length === 1 && <p className="single-result-hint" role="status">One match: <strong>{filteredTeams[0].name}</strong>. Press <kbd>Enter</kbd> to confirm.</p>}
            {teamPickerError && <p className="team-picker-error" role="alert">{teamPickerError}</p>}
            <div className="team-grid" aria-label="Historical teams" ref={teamGridRef}>
              {filteredTeams.map((constructor) => (
                <button key={constructor.id} style={{ "--team-color": TEAM_COLORS[constructor.id] ?? DEFAULT_TEAM_COLOR } as CSSProperties} onClick={() => chooseCanvasTeam(constructor.id)}>
                  <i aria-hidden="true" /><span>{constructor.name}</span>
                </button>
              ))}
              {!filteredTeams.length && <p className="empty-team-grid">No teams match “{teamSearch}”.</p>}
            </div>
          </section>
        </div>
      )}

      {onboardingStep !== null && (
        <div className="modal-backdrop">
          <section className="modal-card onboarding-card" role="dialog" aria-modal="true" aria-labelledby="onboarding-title" aria-describedby="onboarding-description" onKeyDown={(event) => { if (event.key === "Escape") dismissOnboarding(); }}>
            <div className="modal-progress" aria-label={`Onboarding step ${onboardingStep + 1} of ${ONBOARDING_STEPS.length}`}>
              {ONBOARDING_STEPS.map((_, index) => <i key={index} className={index <= onboardingStep ? "active" : ""} />)}
            </div>
            <p className="section-label">{ONBOARDING_STEPS[onboardingStep].eyebrow}</p>
            <h2 id="onboarding-title">{ONBOARDING_STEPS[onboardingStep].title}</h2>
            <p id="onboarding-description">{ONBOARDING_STEPS[onboardingStep].text}</p>
            <div className="modal-demo" aria-hidden="true">
              <span className="demo-puck">{onboardingStep === 0 ? "A" : onboardingStep === 1 ? "1" : "✓"}</span>
              <i className={onboardingStep > 0 ? "active" : ""} />
              <span className="demo-puck">{onboardingStep === 0 ? "B" : onboardingStep === 1 ? "2" : "★"}</span>
            </div>
            <div className="modal-actions">
              <button className="text-button" onClick={dismissOnboarding}>Skip</button>
              {onboardingStep > 0 && <button className="text-button" onClick={() => setOnboardingStep((step) => Math.max(0, (step ?? 1) - 1))}>Back</button>}
              <button className="primary-button" autoFocus onClick={() => onboardingStep === ONBOARDING_STEPS.length - 1 ? dismissOnboarding() : setOnboardingStep(onboardingStep + 1)}>
                {onboardingStep === ONBOARDING_STEPS.length - 1 ? "Start playing" : "Next"}<span>→</span>
              </button>
            </div>
          </section>
        </div>
      )}

      {reportOpen && (
        <div className="modal-backdrop">
          <section className="modal-card report-card" role="dialog" aria-modal="true" aria-labelledby="report-title" aria-describedby="report-description" onKeyDown={(event) => { if (event.key === "Escape") setReportOpen(false); }}>
            <p className="section-label">Evidence feedback</p>
            <h2 id="report-title">Prepare a data report</h2>
            <p id="report-description">{reportLink ? `Report ${driverById(reportLink.driverAId).name} and ${driverById(reportLink.driverBId).name}'s ${reportLink.teamName} link.` : "Describe a missing or questionable teammate record."}</p>
            <label>Reason
              <select autoFocus value={reportReason} onChange={(event) => { setReportReason(event.target.value); setReportCopied(false); }}>
                <option>Incorrect team or teammate link</option>
                <option>Missing teammate link</option>
                <option>Incorrect event or season evidence</option>
                <option>Driver identity or name issue</option>
                <option>Other data issue</option>
              </select>
            </label>
            <label>What should be corrected?
              <textarea value={reportDetails} onChange={(event) => { setReportDetails(event.target.value); setReportCopied(false); }} placeholder="Add the team, season, event, or source you expected…" rows={4} />
            </label>
            <details className="report-preview"><summary>Preview structured report</summary><pre>{reportText}</pre></details>
            <p className="microcopy">Nothing is sent automatically in this prototype. Copy the versioned report so it can be attached to the project issue tracker.</p>
            <div className="modal-actions">
              <button className="text-button" onClick={() => setReportOpen(false)}>Close</button>
              <button className="primary-button" onClick={copyReport}>{reportCopied ? "Copied" : "Copy report"}<span>{reportCopied ? "✓" : "→"}</span></button>
            </div>
          </section>
        </div>
      )}

      {settingsOpen && (
        <div className="modal-backdrop">
          <section className="modal-card settings-card" role="dialog" aria-modal="true" aria-labelledby="settings-title" aria-describedby="settings-description" onKeyDown={(event) => { if (event.key === "Escape") setSettingsOpen(false); }}>
            <div className="team-picker-heading">
              <div><p className="section-label">Board preferences</p><h2 id="settings-title">Settings</h2></div>
              <button className="team-picker-close" onClick={() => setSettingsOpen(false)} aria-label="Close settings">×</button>
            </div>
            <p id="settings-description">Choose how the case board moves, reads, and responds. Preferences stay on this device.</p>
            <fieldset className="preference-group">
              <legend>Motion</legend>
              <div className="preference-options">
                {([
                  ["system", "System", "Follow this device's motion preference"],
                  ["full", "Full", "Show falling pins and tactile transitions"],
                  ["reduced", "Reduced", "Remove nonessential movement"],
                ] as const).map(([value, label, description]) => (
                  <label key={value} className="preference-option"><input autoFocus={motionPreference === value} type="radio" name="motion" value={value} checked={motionPreference === value} onChange={() => setMotionPreference(value)} /><span><strong>{label}</strong><small>{description}</small></span></label>
                ))}
              </div>
            </fieldset>
            <fieldset className="preference-group">
              <legend>Contrast</legend>
              <div className="preference-options preference-options-two">
                {([
                  ["standard", "Standard", "Warm archival palette"],
                  ["high", "High", "Stronger borders, text, and focus states"],
                ] as const).map(([value, label, description]) => (
                  <label key={value} className="preference-option"><input type="radio" name="contrast" value={value} checked={contrastPreference === value} onChange={() => setContrastPreference(value)} /><span><strong>{label}</strong><small>{description}</small></span></label>
                ))}
              </div>
            </fieldset>
            <fieldset className="preference-group">
              <legend>Feedback</legend>
              <div className="preference-options preference-options-two">
                <label className="preference-option"><input type="checkbox" checked={soundEnabled} onChange={(event) => setSoundEnabled(event.target.checked)} /><span><strong>Sound effects · {soundEnabled ? "On" : "Off"}</strong><small>Board thumps, rising violin links, errors, and completion</small></span></label>
                <label className="preference-option"><input type="checkbox" checked={hapticsEnabled} onChange={(event) => setHapticsEnabled(event.target.checked)} /><span><strong>Haptics · {hapticsEnabled ? "On" : "Off"}</strong><small>Short tactile cues on devices that support vibration</small></span></label>
              </div>
            </fieldset>
            <div className="modal-actions"><button className="primary-button" onClick={() => setSettingsOpen(false)}>Done <span>✓</span></button></div>
          </section>
        </div>
      )}
    </main>
  );
}
