from fastapi import APIRouter, HTTPException
import httpx

from app.models.flight import FlightResponse
from app.services.airlabs import get_flight_with_airports

router = APIRouter(prefix="/api")


@router.get("/flight/{code}", response_model=FlightResponse)
async def get_flight(code: str):
    code = code.strip().upper()
    if not code:
        raise HTTPException(status_code=400, detail="Flight code is required")

    try:
        data = await get_flight_with_airports(code)
    except httpx.HTTPStatusError as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Upstream API error: {exc.response.status_code}",
        )
    except httpx.RequestError:
        raise HTTPException(status_code=502, detail="Could not reach flight data provider")

    if data is None:
        raise HTTPException(status_code=404, detail=f"Flight {code} not found")

    return data
