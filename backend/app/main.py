from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers.flights import router as flights_router

app = FastAPI(title="WIMPG API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(flights_router)
