from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import init_db
from app.routers import dashboard, gold_rate, history, verify


@asynccontextmanager
async def lifespan(_: FastAPI):
    init_db()
    yield


app = FastAPI(
    title="Genuix API",
    description="Gold intelligence & jewelry verification SaaS for India",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(gold_rate.router)
app.include_router(verify.router)
app.include_router(history.router)
app.include_router(dashboard.router)


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "service": "genuix-api",
        "market": "IN",
    }