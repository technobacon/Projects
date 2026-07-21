import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const graph = JSON.parse(
  await readFile(
    new URL("../app/data/graph-v2026.10.0-modern.json", import.meta.url),
    "utf8",
  ),
);

const pairKey = (driverAId, driverBId) =>
  [driverAId, driverBId].sort().join("::");

const edges = new Map(
  graph.edges.map((edge) => [pairKey(edge.driverAId, edge.driverBId), edge]),
);

function par(start, target) {
  const adjacency = new Map();
  for (const edge of graph.edges) {
    adjacency.set(edge.driverAId, [...(adjacency.get(edge.driverAId) ?? []), edge.driverBId]);
    adjacency.set(edge.driverBId, [...(adjacency.get(edge.driverBId) ?? []), edge.driverAId]);
  }
  const queue = [[start]];
  const visited = new Set([start]);
  while (queue.length) {
    const path = queue.shift();
    const current = path.at(-1);
    if (current === target) return path.length - 1;
    for (const neighbor of adjacency.get(current) ?? []) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push([...path, neighbor]);
      }
    }
  }
  return null;
}

test("ships the pinned compact modern graph", () => {
  assert.equal(graph.schemaVersion, 1);
  assert.equal(graph.graphVersion, "modern-2000-v2026.10.0");
  assert.equal(graph.sourceVersion, "v2026.10.0");
  assert.equal(graph.drivers.length, 130);
  assert.equal(graph.edges.length, 237);
  assert.ok(graph.edges.every((edge) => edge.teams.length > 0));
});

test("preserves the prototype route with real historical teams", () => {
  assert.deepEqual(
    edges.get(pairKey("isack-hadjar", "max-verstappen")).teams.map((team) => team.id),
    ["red-bull"],
  );
  assert.deepEqual(
    edges.get(pairKey("max-verstappen", "carlos-sainz-jr")).teams.map((team) => team.id),
    ["toro-rosso"],
  );
  assert.deepEqual(
    edges.get(pairKey("carlos-sainz-jr", "charles-leclerc")).teams.map((team) => team.id),
    ["ferrari"],
  );
  assert.equal(par("isack-hadjar", "charles-leclerc"), 3);
});

test("rejects a same-season pairing without a shared Grand Prix", () => {
  assert.equal(edges.has(pairKey("nyck-de-vries", "liam-lawson")), false);
});

test("supports real-data Free Play pairs beyond the guided route", () => {
  assert.ok(par("fernando-alonso", "max-verstappen") > 0);
  assert.ok(par("kimi-raikkonen", "oscar-piastri") > 0);
  assert.equal(par("lewis-hamilton", "nico-rosberg"), 1);
});

test("keeps every curated challenge connected with its reviewed par", () => {
  const challenges = [
    ["isack-hadjar", "charles-leclerc", 3],
    ["fernando-alonso", "max-verstappen", 3],
    ["kimi-raikkonen", "oscar-piastri", 4],
    ["sebastian-vettel", "george-russell", 3],
    ["lewis-hamilton", "lando-norris", 3],
  ];
  for (const [start, target, expectedPar] of challenges) {
    assert.equal(par(start, target), expectedPar, `${start} -> ${target}`);
  }
});
