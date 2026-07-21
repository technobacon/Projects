"""Pure teammate-edge derivation, validation, and route queries."""

from __future__ import annotations

from collections import defaultdict, deque
from dataclasses import asdict, dataclass
from itertools import combinations
from typing import Iterable

from .model import Constructor, Driver, Event, RaceEntry


def _pair(driver_a: str, driver_b: str) -> tuple[str, str]:
    if driver_a == driver_b:
        raise ValueError("A teammate edge cannot connect a driver to itself")
    return tuple(sorted((driver_a, driver_b)))


@dataclass(frozen=True, slots=True)
class Evidence:
    id: str
    driver_a_id: str
    driver_b_id: str
    constructor_id: str
    event_id: str
    source_record_a: str
    source_record_b: str


@dataclass(frozen=True, slots=True)
class Edge:
    driver_a_id: str
    driver_b_id: str
    constructor_ids: tuple[str, ...]
    evidence_ids: tuple[str, ...]
    first_shared_event_id: str
    last_shared_event_id: str
    shared_event_count: int


class TeammateGraph:
    """An immutable, evidence-backed undirected teammate graph."""

    def __init__(
        self,
        *,
        source_version: str,
        drivers: dict[str, Driver],
        constructors: dict[str, Constructor],
        events: dict[str, Event],
        evidence: dict[str, Evidence],
        edges: dict[tuple[str, str], Edge],
    ) -> None:
        self.source_version = source_version
        self.drivers = drivers
        self.constructors = constructors
        self.events = events
        self.evidence = evidence
        self.edges = edges
        self._adjacency: dict[str, set[str]] = defaultdict(set)
        for driver_a, driver_b in edges:
            self._adjacency[driver_a].add(driver_b)
            self._adjacency[driver_b].add(driver_a)
        self.validate()

    def validate(self) -> None:
        for key, edge in self.edges.items():
            if key != _pair(edge.driver_a_id, edge.driver_b_id):
                raise ValueError(f"Unstable edge ordering for {key!r}")
            if not edge.evidence_ids:
                raise ValueError(f"Playable edge {key!r} has no evidence")
            if edge.shared_event_count != len(
                {self.evidence[evidence_id].event_id for evidence_id in edge.evidence_ids}
            ):
                raise ValueError(f"Incorrect shared event count for {key!r}")
            for driver_id in key:
                if driver_id not in self.drivers:
                    raise ValueError(f"Edge {key!r} references unknown driver {driver_id!r}")
            for constructor_id in edge.constructor_ids:
                if constructor_id not in self.constructors:
                    raise ValueError(
                        f"Edge {key!r} references unknown constructor {constructor_id!r}"
                    )
            for evidence_id in edge.evidence_ids:
                item = self.evidence.get(evidence_id)
                if item is None:
                    raise ValueError(f"Edge {key!r} references missing evidence {evidence_id!r}")
                if _pair(item.driver_a_id, item.driver_b_id) != key:
                    raise ValueError(f"Evidence {evidence_id!r} has the wrong drivers")
                if item.event_id not in self.events:
                    raise ValueError(f"Evidence {evidence_id!r} references an unknown event")

    def connection(self, driver_a: str, driver_b: str) -> Edge | None:
        return self.edges.get(_pair(driver_a, driver_b))

    def valid_teams(self, driver_a: str, driver_b: str) -> tuple[Constructor, ...]:
        edge = self.connection(driver_a, driver_b)
        if edge is None:
            return ()
        return tuple(self.constructors[constructor_id] for constructor_id in edge.constructor_ids)

    def evidence_for(
        self, driver_a: str, driver_b: str, constructor_id: str | None = None
    ) -> tuple[Evidence, ...]:
        edge = self.connection(driver_a, driver_b)
        if edge is None:
            return ()
        items = (self.evidence[evidence_id] for evidence_id in edge.evidence_ids)
        if constructor_id is not None:
            items = (item for item in items if item.constructor_id == constructor_id)
        return tuple(items)

    def shortest_path(self, start: str, target: str) -> tuple[str, ...] | None:
        if start not in self.drivers or target not in self.drivers:
            return None
        if start == target:
            return (start,)

        queue = deque([start])
        previous: dict[str, str | None] = {start: None}
        while queue:
            current = queue.popleft()
            for neighbor in sorted(self._adjacency[current]):
                if neighbor in previous:
                    continue
                previous[neighbor] = current
                if neighbor == target:
                    path = [target]
                    while previous[path[-1]] is not None:
                        path.append(previous[path[-1]])
                    return tuple(reversed(path))
                queue.append(neighbor)
        return None

    def component_ids(self) -> dict[str, int]:
        result: dict[str, int] = {}
        component = 0
        for start in sorted(self.drivers):
            if start in result:
                continue
            queue = deque([start])
            result[start] = component
            while queue:
                current = queue.popleft()
                for neighbor in sorted(self._adjacency[current]):
                    if neighbor not in result:
                        result[neighbor] = component
                        queue.append(neighbor)
            component += 1
        return result

    def to_dict(self) -> dict[str, object]:
        components = self.component_ids()
        return {
            "schemaVersion": 1,
            "sourceVersion": self.source_version,
            "drivers": [
                {**asdict(self.drivers[key]), "componentId": components[key]}
                for key in sorted(self.drivers)
            ],
            "constructors": [asdict(self.constructors[key]) for key in sorted(self.constructors)],
            "events": [asdict(self.events[key]) for key in sorted(self.events)],
            "evidence": [asdict(self.evidence[key]) for key in sorted(self.evidence)],
            "edges": [
                {
                    "driverAId": edge.driver_a_id,
                    "driverBId": edge.driver_b_id,
                    "constructorIds": list(edge.constructor_ids),
                    "evidenceIds": list(edge.evidence_ids),
                    "firstSharedEventId": edge.first_shared_event_id,
                    "lastSharedEventId": edge.last_shared_event_id,
                    "sharedEventCount": edge.shared_event_count,
                }
                for edge in (self.edges[key] for key in sorted(self.edges))
            ],
        }

    def to_runtime_dict(self, *, graph_version: str) -> dict[str, object]:
        """Return the compact, evidence-summarized package shipped to browsers."""

        components = self.component_ids()
        driver_seasons: dict[str, set[int]] = defaultdict(set)
        for item in self.evidence.values():
            season = self.events[item.event_id].season
            driver_seasons[item.driver_a_id].add(season)
            driver_seasons[item.driver_b_id].add(season)

        runtime_edges: list[dict[str, object]] = []
        for key in sorted(self.edges):
            edge = self.edges[key]
            items = [self.evidence[evidence_id] for evidence_id in edge.evidence_ids]
            team_summaries: list[dict[str, object]] = []
            for constructor_id in edge.constructor_ids:
                event_ids = sorted(
                    {item.event_id for item in items if item.constructor_id == constructor_id},
                    key=lambda event_id: (
                        self.events[event_id].season,
                        self.events[event_id].round,
                        event_id,
                    ),
                )
                seasons = [self.events[event_id].season for event_id in event_ids]
                team_summaries.append(
                    {
                        "id": constructor_id,
                        "name": self.constructors[constructor_id].name,
                        "eventCount": len(event_ids),
                        "firstSeason": min(seasons),
                        "lastSeason": max(seasons),
                        "firstEventId": event_ids[0],
                        "lastEventId": event_ids[-1],
                    }
                )
            runtime_edges.append(
                {
                    "driverAId": edge.driver_a_id,
                    "driverBId": edge.driver_b_id,
                    "sharedEventCount": edge.shared_event_count,
                    "teams": team_summaries,
                }
            )

        return {
            "schemaVersion": 1,
            "graphVersion": graph_version,
            "sourceVersion": self.source_version,
            "drivers": [
                {
                    "id": driver.id,
                    "givenName": driver.given_name,
                    "familyName": driver.family_name,
                    "name": driver.display_name,
                    "activeFrom": min(driver_seasons[driver.id]),
                    "activeTo": max(driver_seasons[driver.id]),
                    "componentId": components[driver.id],
                }
                for driver in (self.drivers[key] for key in sorted(self.drivers))
            ],
            "constructors": [
                {
                    "id": constructor.id,
                    "name": constructor.name,
                    "fullName": constructor.full_name,
                }
                for constructor in (
                    self.constructors[key] for key in sorted(self.constructors)
                )
            ],
            "edges": runtime_edges,
        }


def build_teammate_graph(
    *,
    source_version: str,
    drivers: Iterable[Driver],
    constructors: Iterable[Constructor],
    events: Iterable[Event],
    entries: Iterable[RaceEntry],
) -> TeammateGraph:
    """Derive one edge for each pair sharing a constructor at an event."""

    driver_map = {driver.id: driver for driver in drivers}
    constructor_map = {constructor.id: constructor for constructor in constructors}
    event_map = {event.id: event for event in events}

    grouped: dict[tuple[str, str], dict[str, RaceEntry]] = defaultdict(dict)
    for entry in entries:
        if entry.driver_id not in driver_map:
            raise ValueError(f"Entry references unknown driver {entry.driver_id!r}")
        if entry.constructor_id not in constructor_map:
            raise ValueError(f"Entry references unknown constructor {entry.constructor_id!r}")
        if entry.event_id not in event_map:
            raise ValueError(f"Entry references unknown event {entry.event_id!r}")
        grouped[(entry.event_id, entry.constructor_id)][entry.driver_id] = entry

    evidence: dict[str, Evidence] = {}
    edge_evidence: dict[tuple[str, str], list[Evidence]] = defaultdict(list)
    event_order = {
        event.id: (event.season, event.round, event.id) for event in event_map.values()
    }

    for (event_id, constructor_id), event_entries in sorted(grouped.items()):
        for driver_a_id, driver_b_id in combinations(sorted(event_entries), 2):
            driver_a_entry = event_entries[driver_a_id]
            driver_b_entry = event_entries[driver_b_id]
            evidence_id = f"{event_id}:{constructor_id}:{driver_a_id}:{driver_b_id}"
            item = Evidence(
                id=evidence_id,
                driver_a_id=driver_a_id,
                driver_b_id=driver_b_id,
                constructor_id=constructor_id,
                event_id=event_id,
                source_record_a=driver_a_entry.source_record,
                source_record_b=driver_b_entry.source_record,
            )
            evidence[evidence_id] = item
            edge_evidence[(driver_a_id, driver_b_id)].append(item)

    edges: dict[tuple[str, str], Edge] = {}
    for key, items in sorted(edge_evidence.items()):
        items.sort(key=lambda item: (event_order[item.event_id], item.constructor_id, item.id))
        event_ids = {item.event_id for item in items}
        edges[key] = Edge(
            driver_a_id=key[0],
            driver_b_id=key[1],
            constructor_ids=tuple(sorted({item.constructor_id for item in items})),
            evidence_ids=tuple(item.id for item in items),
            first_shared_event_id=items[0].event_id,
            last_shared_event_id=items[-1].event_id,
            shared_event_count=len(event_ids),
        )

    referenced_drivers = {driver_id for edge in edges for driver_id in edge}
    referenced_constructors = {
        constructor_id for edge in edges.values() for constructor_id in edge.constructor_ids
    }
    referenced_events = {item.event_id for item in evidence.values()}

    return TeammateGraph(
        source_version=source_version,
        drivers={key: driver_map[key] for key in sorted(referenced_drivers)},
        constructors={key: constructor_map[key] for key in sorted(referenced_constructors)},
        events={key: event_map[key] for key in sorted(referenced_events)},
        evidence=evidence,
        edges=edges,
    )
