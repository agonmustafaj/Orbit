"""Project and capability data endpoints."""

from __future__ import annotations

import json
from functools import lru_cache
from pathlib import Path
from typing import Any

from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/api", tags=["projects"])

DATA_PATH = Path(__file__).resolve().parent.parent / "data" / "portfolio.json"


@lru_cache
def load_portfolio() -> dict[str, Any]:
    with DATA_PATH.open(encoding="utf-8") as handle:
        return json.load(handle)


@router.get("/projects")
async def list_projects() -> dict[str, Any]:
    data = load_portfolio()
    return {"ok": True, "projects": data.get("projects", [])}


@router.get("/projects/{project_id}")
async def get_project(project_id: str) -> dict[str, Any]:
    data = load_portfolio()
    for project in data.get("projects", []):
        if project.get("id") == project_id or project.get("number") == project_id:
            return {"ok": True, "project": project}
    raise HTTPException(status_code=404, detail="Project not found")


@router.get("/site")
async def get_site() -> dict[str, Any]:
    data = load_portfolio()
    return {
        "ok": True,
        "site": data.get("site", {}),
        "capabilities": data.get("capabilities", []),
        "experiments": data.get("experiments", []),
    }
