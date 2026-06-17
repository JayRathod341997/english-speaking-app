from fastapi import APIRouter, HTTPException

from app import data_store
from app.schemas.content import IdiomResponse, IdiomsLibraryResponse

router = APIRouter(prefix="/api/idioms", tags=["idioms"])


@router.get("", response_model=IdiomsLibraryResponse)
async def list_idioms():
    return data_store.IDIOMS


@router.get("/{idiom_id}", response_model=IdiomResponse)
async def get_idiom(idiom_id: int):
    idiom = data_store.get_idiom(idiom_id)
    if not idiom:
        raise HTTPException(status_code=404, detail="Idiom not found")
    return idiom
