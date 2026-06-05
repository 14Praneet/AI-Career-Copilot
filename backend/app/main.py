from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import connect_to_mongo, close_mongo_connection
from app.routes import resumes, analysis, interviews, generator

app = FastAPI(title=settings.PROJECT_NAME, version="1.0.0")

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In development. Can be restricted to React domain.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup and shutdown events
@app.on_event("startup")
async def startup_event():
    await connect_to_mongo()

@app.on_event("shutdown")
async def shutdown_event():
    await close_mongo_connection()

# Register routes
app.include_router(resumes.router, prefix="/api/v1")
app.include_router(analysis.router, prefix="/api/v1")
app.include_router(interviews.router, prefix="/api/v1")
app.include_router(generator.router, prefix="/api/v1")

@app.get("/")
def health_check():
    return {
        "status": "healthy",
        "project": settings.PROJECT_NAME
    }
