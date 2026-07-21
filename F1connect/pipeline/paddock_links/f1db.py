"""F1DB SQLite importer for the authoritative race-result boundary."""

from __future__ import annotations

import sqlite3
from dataclasses import dataclass
from pathlib import Path

from .graph import TeammateGraph, build_teammate_graph
from .model import Constructor, Driver, Event, RaceEntry


@dataclass(frozen=True, slots=True)
class ImportedF1DB:
    drivers: tuple[Driver, ...]
    constructors: tuple[Constructor, ...]
    events: tuple[Event, ...]
    entries: tuple[RaceEntry, ...]


def _event_id(season: int, round_number: int) -> str:
    return f"{season}-{round_number:02d}"


def import_f1db(database: Path, *, minimum_year: int = 2000) -> ImportedF1DB:
    """Normalize official race-result records from an immutable F1DB database."""

    if not database.is_file():
        raise FileNotFoundError(f"F1DB database not found: {database}")

    with sqlite3.connect(f"file:{database.resolve()}?mode=ro", uri=True) as connection:
        connection.row_factory = sqlite3.Row
        result_rows = connection.execute(
            """
            SELECT DISTINCT
                race.id AS race_id,
                race.year,
                race.round,
                race.date,
                race.official_name,
                race_data.driver_id,
                race_data.constructor_id,
                race_data.position_display_order
            FROM race_data
            JOIN race ON race.id = race_data.race_id
            WHERE race_data.type = 'RACE_RESULT'
              AND race.year >= ?
            ORDER BY race.year, race.round, race_data.position_display_order
            """,
            (minimum_year,),
        ).fetchall()

        driver_ids = sorted({row["driver_id"] for row in result_rows})
        constructor_ids = sorted({row["constructor_id"] for row in result_rows})
        if not result_rows:
            return ImportedF1DB((), (), (), ())

        driver_placeholders = ",".join("?" for _ in driver_ids)
        constructor_placeholders = ",".join("?" for _ in constructor_ids)
        driver_rows = connection.execute(
            f"""
            SELECT id, first_name, last_name, full_name
            FROM driver
            WHERE id IN ({driver_placeholders})
            ORDER BY id
            """,
            driver_ids,
        ).fetchall()
        constructor_rows = connection.execute(
            f"""
            SELECT id, name, full_name
            FROM constructor
            WHERE id IN ({constructor_placeholders})
            ORDER BY id
            """,
            constructor_ids,
        ).fetchall()

    events_by_id: dict[str, Event] = {}
    entries: list[RaceEntry] = []
    for row in result_rows:
        event_id = _event_id(row["year"], row["round"])
        events_by_id.setdefault(
            event_id,
            Event(
                id=event_id,
                season=row["year"],
                round=row["round"],
                name=row["official_name"],
                date=row["date"],
                source_id=str(row["race_id"]),
            ),
        )
        entries.append(
            RaceEntry(
                event_id=event_id,
                driver_id=row["driver_id"],
                constructor_id=row["constructor_id"],
                source_record=(
                    f"race_data:{row['race_id']}:RACE_RESULT:{row['position_display_order']}"
                ),
            )
        )

    return ImportedF1DB(
        drivers=tuple(
            Driver(
                id=row["id"],
                given_name=row["first_name"],
                family_name=row["last_name"],
                display_name=row["full_name"],
            )
            for row in driver_rows
        ),
        constructors=tuple(
            Constructor(id=row["id"], name=row["name"], full_name=row["full_name"])
            for row in constructor_rows
        ),
        events=tuple(events_by_id[key] for key in sorted(events_by_id)),
        entries=tuple(entries),
    )


def build_from_f1db(
    database: Path, *, source_version: str, minimum_year: int = 2000
) -> TeammateGraph:
    imported = import_f1db(database, minimum_year=minimum_year)
    return build_teammate_graph(
        source_version=source_version,
        drivers=imported.drivers,
        constructors=imported.constructors,
        events=imported.events,
        entries=imported.entries,
    )

