#!/usr/bin/env python3
from __future__ import annotations

import sys
from pathlib import Path


ALLOWED = {"backend", "frontend", "auth", "admin", "help", "info"}


def parse_services(path: Path) -> list[str]:
    if not path.exists():
        return []

    services: list[str] = []
    in_services = False
    for raw in path.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if not line or line.startswith("#"):
            continue
        if line.startswith("services:"):
            in_services = True
            continue
        if in_services:
            if line.startswith("- "):
                name = line[2:].strip()
                if name in ALLOWED:
                    services.append(name)
            else:
                if ":" in line:
                    break
    return services


def main() -> int:
    config_path = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("config.yml")
    services = parse_services(config_path)
    print(" ".join(services))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
