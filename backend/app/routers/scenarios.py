from fastapi import APIRouter, HTTPException

from app import store
from app.schemas.conversation import ScenarioResponse

router = APIRouter(prefix="/api/scenarios", tags=["scenarios"])


@router.get("", response_model=list[ScenarioResponse])
async def list_scenarios():
    return sorted(store.SCENARIOS, key=lambda s: (s["category"], s["id"]))


@router.get("/{scenario_id}", response_model=ScenarioResponse)
async def get_scenario(scenario_id: int):
    scenario = store.get_scenario(scenario_id)
    if not scenario:
        raise HTTPException(status_code=404, detail="Scenario not found")
    return scenario
