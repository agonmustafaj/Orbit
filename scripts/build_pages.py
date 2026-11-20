#!/usr/bin/env python3
"""Build static Cloudflare Pages output into ./dist."""

from __future__ import annotations

import json
import shutil
from pathlib import Path

from jinja2 import Environment, FileSystemLoader, select_autoescape

ROOT = Path(__file__).resolve().parent.parent
DIST = ROOT / "dist"
DATA = ROOT / "app" / "data" / "portfolio.json"


def main() -> None:
    if DIST.exists():
        shutil.rmtree(DIST)
    DIST.mkdir(parents=True)

    portfolio = json.loads(DATA.read_text(encoding="utf-8"))
    site = portfolio.get("site", {})
    env = Environment(
        loader=FileSystemLoader(str(ROOT / "templates")),
        autoescape=select_autoescape(["html", "xml"]),
    )
    html = env.get_template("index.html").render(
        site=site,
        projects=portfolio.get("projects", []),
        capabilities=portfolio.get("capabilities", []),
        experiments=portfolio.get("experiments", []),
        site_url="https://orbit.pages.dev",
        contact_email=site.get("email", "hello@orbit.studio"),
        error_notice=None,
    )
    (DIST / "index.html").write_text(html, encoding="utf-8")

    shutil.copytree(ROOT / "static", DIST / "static")
    data_dir = DIST / "static" / "data"
    data_dir.mkdir(parents=True, exist_ok=True)
    shutil.copy2(DATA, data_dir / "portfolio.json")

    worker_src = ROOT / "workers" / "pages_worker.js"
    shutil.copy2(worker_src, DIST / "_worker.js")

    # SPA-ish fallback
    (DIST / "404.html").write_text(html, encoding="utf-8")
    print(f"Built Pages output → {DIST}")


if __name__ == "__main__":
    main()
