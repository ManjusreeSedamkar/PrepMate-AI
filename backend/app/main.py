import logging
import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.routes.interview import router as interview_router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("prepmate-ai")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="PrepMate AI - AI Interview Preparation Assistant Backend API",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if "*" in settings.CORS_ORIGINS else settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global error handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error processing {request.method} {request.url}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal Server Error",
            "message": str(exc),
            "path": str(request.url)
        }
    )

# Include Interview Router
app.include_router(interview_router)

# Health Check Endpoint
@app.get("/health", tags=["System"])
async def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "gemini_configured": bool(settings.GEMINI_API_KEY),
        "model": settings.GEMINI_MODEL,
    }

@app.get("/", tags=["System"])
async def root():
    return {
        "message": f"Welcome to {settings.PROJECT_NAME} API. Visit /docs for the interactive API reference.",
        "health": "/health",
        "docs": "/docs",
    }

# Optionally mount frontend static build if frontend/dist exists (for unified single-service container deploy)
frontend_dist = os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist")
if os.path.exists(frontend_dist):
    app.mount("/app", StaticFiles(directory=frontend_dist, html=True), name="static_frontend")
