"""Normalized records at the source-to-graph boundary."""

from dataclasses import dataclass


@dataclass(frozen=True, slots=True)
class Driver:
    id: str
    given_name: str
    family_name: str
    display_name: str


@dataclass(frozen=True, slots=True)
class Constructor:
    id: str
    name: str
    full_name: str


@dataclass(frozen=True, slots=True)
class Event:
    id: str
    season: int
    round: int
    name: str
    date: str
    source_id: str


@dataclass(frozen=True, slots=True)
class RaceEntry:
    event_id: str
    driver_id: str
    constructor_id: str
    source_record: str

