import unittest

from pipeline.paddock_links import (
    Constructor,
    Driver,
    Event,
    RaceEntry,
    build_teammate_graph,
)


def driver(driver_id: str) -> Driver:
    return Driver(driver_id, driver_id.title(), "Driver", f"{driver_id.title()} Driver")


class TeammateGraphTests(unittest.TestCase):
    def setUp(self) -> None:
        self.drivers = tuple(driver(name) for name in ("hadjar", "max", "sainz", "leclerc", "alonso"))
        self.constructors = (
            Constructor("red-bull", "Red Bull", "Red Bull Racing"),
            Constructor("toro-rosso", "Toro Rosso", "Scuderia Toro Rosso"),
            Constructor("ferrari", "Ferrari", "Scuderia Ferrari"),
        )
        self.events = (
            Event("2015-01", 2015, 1, "2015 Australian Grand Prix", "2015-03-15", "1"),
            Event("2021-01", 2021, 1, "2021 Bahrain Grand Prix", "2021-03-28", "2"),
            Event("2026-01", 2026, 1, "2026 Australian Grand Prix", "2026-03-08", "3"),
        )
        self.entries = (
            RaceEntry("2015-01", "max", "toro-rosso", "result:1"),
            RaceEntry("2015-01", "sainz", "toro-rosso", "result:2"),
            RaceEntry("2021-01", "sainz", "ferrari", "result:1"),
            RaceEntry("2021-01", "leclerc", "ferrari", "result:2"),
            RaceEntry("2026-01", "hadjar", "red-bull", "result:1"),
            RaceEntry("2026-01", "max", "red-bull", "result:2"),
        )
        self.graph = build_teammate_graph(
            source_version="fixture-v1",
            drivers=self.drivers,
            constructors=self.constructors,
            events=self.events,
            entries=self.entries,
        )

    def test_pair_validation_returns_historical_team(self) -> None:
        self.assertEqual(
            [team.name for team in self.graph.valid_teams("max", "sainz")],
            ["Toro Rosso"],
        )
        self.assertEqual(self.graph.valid_teams("max", "leclerc"), ())

    def test_evidence_is_retained_for_every_edge(self) -> None:
        evidence = self.graph.evidence_for("sainz", "max", "toro-rosso")
        self.assertEqual(len(evidence), 1)
        self.assertEqual(evidence[0].event_id, "2015-01")

    def test_shortest_path_calculates_par_route(self) -> None:
        self.assertEqual(
            self.graph.shortest_path("hadjar", "leclerc"),
            ("hadjar", "max", "sainz", "leclerc"),
        )

    def test_longer_valid_chain_is_not_rejected(self) -> None:
        route = ("hadjar", "max", "sainz", "leclerc")
        self.assertTrue(
            all(self.graph.connection(a, b) is not None for a, b in zip(route, route[1:]))
        )

    def test_non_overlapping_same_team_seasons_do_not_create_an_edge(self) -> None:
        self.assertIsNone(self.graph.connection("alonso", "leclerc"))

    def test_duplicate_result_records_do_not_duplicate_evidence(self) -> None:
        graph = build_teammate_graph(
            source_version="fixture-v1",
            drivers=self.drivers,
            constructors=self.constructors,
            events=self.events,
            entries=(*self.entries, self.entries[0]),
        )
        self.assertEqual(graph.connection("max", "sainz").shared_event_count, 1)

    def test_unknown_entry_reference_fails_fast(self) -> None:
        with self.assertRaisesRegex(ValueError, "unknown driver"):
            build_teammate_graph(
                source_version="fixture-v1",
                drivers=self.drivers,
                constructors=self.constructors,
                events=self.events,
                entries=(RaceEntry("2015-01", "unknown", "toro-rosso", "result:1"),),
            )

    def test_runtime_artifact_summarizes_evidence_without_source_rows(self) -> None:
        artifact = self.graph.to_runtime_dict(graph_version="fixture-modern-v1")
        self.assertEqual(artifact["graphVersion"], "fixture-modern-v1")
        self.assertEqual(len(artifact["drivers"]), 4)
        max_sainz = next(
            edge
            for edge in artifact["edges"]
            if {edge["driverAId"], edge["driverBId"]} == {"max", "sainz"}
        )
        self.assertEqual(
            max_sainz["teams"],
            [
                {
                    "id": "toro-rosso",
                    "name": "Toro Rosso",
                    "eventCount": 1,
                    "firstSeason": 2015,
                    "lastSeason": 2015,
                    "firstEventId": "2015-01",
                    "lastEventId": "2015-01",
                }
            ],
        )
        self.assertNotIn("evidence", artifact)


if __name__ == "__main__":
    unittest.main()
