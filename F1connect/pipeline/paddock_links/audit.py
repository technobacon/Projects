"""Curated historical regression checks for a generated graph."""

from __future__ import annotations

from collections.abc import Iterable, Mapping

from .graph import TeammateGraph


def audit_graph(
    graph: TeammateGraph, fixtures: Iterable[Mapping[str, object]]
) -> tuple[str, ...]:
    """Return readable failures; an empty tuple means every fixture passed."""

    failures: list[str] = []
    for fixture in fixtures:
        fixture_id = str(fixture["id"])
        fixture_type = fixture["type"]

        if fixture_type in {"connection", "noConnection"}:
            driver_a = str(fixture["driverAId"])
            driver_b = str(fixture["driverBId"])
            edge = graph.connection(driver_a, driver_b)
            if fixture_type == "noConnection":
                if edge is not None:
                    failures.append(f"{fixture_id}: unexpected teammate edge")
                continue
            if edge is None:
                failures.append(f"{fixture_id}: expected teammate edge is missing")
                continue

            expected = set(fixture.get("constructorIds", []))
            actual = set(edge.constructor_ids)
            if actual != expected:
                failures.append(
                    f"{fixture_id}: constructors {sorted(actual)!r} != {sorted(expected)!r}"
                )
            evidence_event_id = fixture.get("evidenceEventId")
            if evidence_event_id is not None and not any(
                item.event_id == evidence_event_id
                for item in graph.evidence_for(driver_a, driver_b)
            ):
                failures.append(
                    f"{fixture_id}: missing evidence event {evidence_event_id!r}"
                )
            continue

        if fixture_type == "excludedDriver":
            driver_id = str(fixture["driverId"])
            if driver_id in graph.drivers:
                failures.append(f"{fixture_id}: excluded driver is playable")
            continue

        if fixture_type == "route":
            start = str(fixture["startDriverId"])
            target = str(fixture["targetDriverId"])
            path = graph.shortest_path(start, target)
            actual_par = None if path is None else len(path) - 1
            expected_par = int(fixture["par"])
            if actual_par != expected_par:
                failures.append(f"{fixture_id}: par {actual_par!r} != {expected_par!r}")
            continue

        failures.append(f"{fixture_id}: unknown fixture type {fixture_type!r}")

    return tuple(failures)

