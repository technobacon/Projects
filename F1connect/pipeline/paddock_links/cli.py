"""Command-line build and audit interface for the teammate graph."""

from __future__ import annotations

import argparse
import json
from pathlib import Path

from .audit import audit_graph
from .f1db import build_from_f1db


def _build(args: argparse.Namespace) -> int:
    graph = build_from_f1db(
        args.database,
        source_version=args.source_version,
        minimum_year=args.minimum_year,
    )
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(
        json.dumps(graph.to_dict(), ensure_ascii=False, indent=2, sort_keys=True) + "\n",
        encoding="utf-8",
    )
    print(
        f"Built {len(graph.drivers)} drivers, {len(graph.edges)} edges, "
        f"and {len(graph.evidence)} evidence records -> {args.output}"
    )
    return 0


def _build_client(args: argparse.Namespace) -> int:
    graph = _load_graph(args)
    artifact = graph.to_runtime_dict(graph_version=args.graph_version)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(
        json.dumps(artifact, ensure_ascii=False, separators=(",", ":")) + "\n",
        encoding="utf-8",
    )
    print(
        f"Built browser graph with {len(graph.drivers)} drivers and "
        f"{len(graph.edges)} edges -> {args.output}"
    )
    return 0


def _load_graph(args: argparse.Namespace):
    return build_from_f1db(
        args.database,
        source_version=args.source_version,
        minimum_year=args.minimum_year,
    )


def _audit(args: argparse.Namespace) -> int:
    graph = _load_graph(args)
    fixtures = json.loads(args.fixtures.read_text(encoding="utf-8"))
    failures = audit_graph(graph, fixtures)
    if failures:
        print(f"Historical audit failed ({len(failures)}):")
        for failure in failures:
            print(f"- {failure}")
        return 1
    print(f"Historical audit passed ({len(fixtures)} fixtures).")
    return 0


def _query(args: argparse.Namespace) -> int:
    graph = _load_graph(args)
    edge = graph.connection(args.driver_a, args.driver_b)
    if edge is None:
        print(f"No teammate edge: {args.driver_a} <-> {args.driver_b}")
        return 1

    teams = graph.valid_teams(args.driver_a, args.driver_b)
    print(f"{args.driver_a} <-> {args.driver_b}")
    print("Valid teams: " + ", ".join(team.name for team in teams))
    print(f"Shared events: {edge.shared_event_count}")
    for item in graph.evidence_for(args.driver_a, args.driver_b)[: args.evidence_limit]:
        event = graph.events[item.event_id]
        team = graph.constructors[item.constructor_id]
        print(f"- {event.season} {event.name} — {team.name}")
    return 0


def _add_source_arguments(parser: argparse.ArgumentParser) -> None:
    parser.add_argument("--database", type=Path, required=True)
    parser.add_argument("--source-version", required=True)
    parser.add_argument("--minimum-year", type=int, default=2000)


def _parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(prog="paddock-links")
    subparsers = parser.add_subparsers(dest="command", required=True)

    build = subparsers.add_parser("build", help="Build a versioned graph from F1DB SQLite")
    _add_source_arguments(build)
    build.add_argument("--output", type=Path, required=True)
    build.set_defaults(handler=_build)

    build_client = subparsers.add_parser(
        "build-client", help="Build the compact graph package shipped with the browser app"
    )
    _add_source_arguments(build_client)
    build_client.add_argument("--graph-version", required=True)
    build_client.add_argument("--output", type=Path, required=True)
    build_client.set_defaults(handler=_build_client)

    audit = subparsers.add_parser("audit", help="Run curated historical regression cases")
    _add_source_arguments(audit)
    audit.add_argument("--fixtures", type=Path, required=True)
    audit.set_defaults(handler=_audit)

    query = subparsers.add_parser("query", help="Inspect one driver-pair edge and its evidence")
    _add_source_arguments(query)
    query.add_argument("--driver-a", required=True)
    query.add_argument("--driver-b", required=True)
    query.add_argument("--evidence-limit", type=int, default=5)
    query.set_defaults(handler=_query)
    return parser


def main() -> int:
    args = _parser().parse_args()
    return args.handler(args)


if __name__ == "__main__":
    raise SystemExit(main())
