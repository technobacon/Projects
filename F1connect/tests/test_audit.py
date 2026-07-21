import unittest

from pipeline.paddock_links import Constructor, Driver, Event, RaceEntry, build_teammate_graph
from pipeline.paddock_links.audit import audit_graph


class HistoricalAuditTests(unittest.TestCase):
    def setUp(self) -> None:
        self.graph = build_teammate_graph(
            source_version="fixture-v1",
            drivers=(
                Driver("a", "A", "Driver", "A Driver"),
                Driver("b", "B", "Driver", "B Driver"),
                Driver("c", "C", "Driver", "C Driver"),
            ),
            constructors=(Constructor("team", "Team", "Team"),),
            events=(Event("2026-01", 2026, 1, "Grand Prix", "2026-01-01", "1"),),
            entries=(
                RaceEntry("2026-01", "a", "team", "result:1"),
                RaceEntry("2026-01", "b", "team", "result:2"),
            ),
        )

    def test_supported_fixtures_pass(self) -> None:
        fixtures = (
            {
                "id": "edge",
                "type": "connection",
                "driverAId": "a",
                "driverBId": "b",
                "constructorIds": ["team"],
                "evidenceEventId": "2026-01",
            },
            {"id": "no-edge", "type": "noConnection", "driverAId": "a", "driverBId": "c"},
            {"id": "excluded", "type": "excludedDriver", "driverId": "reserve"},
            {"id": "route", "type": "route", "startDriverId": "a", "targetDriverId": "b", "par": 1},
        )
        self.assertEqual(audit_graph(self.graph, fixtures), ())

    def test_mismatch_is_reported(self) -> None:
        failures = audit_graph(
            self.graph,
            (
                {
                    "id": "wrong-team",
                    "type": "connection",
                    "driverAId": "a",
                    "driverBId": "b",
                    "constructorIds": ["other"],
                },
            ),
        )
        self.assertIn("wrong-team", failures[0])


if __name__ == "__main__":
    unittest.main()

