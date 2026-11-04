import json
import logging
from typing import Optional
from fastapi import APIRouter, Header, Query
from sse_starlette.sse import EventSourceResponse

from app.config import settings
from app.schemas import (
    GenerateQuestionsRequest,
    GenerateQuestionsResponse,
    EvaluateAnswerRequest,
    EvaluateAnswerResponse,
    SampleAnswerRequest,
    SampleAnswerResponse,
    InterviewSummaryRequest,
    InterviewSummaryResponse,
)
from app.services.gemini_service import gemini_service

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api", tags=["Interview"])

@router.get("/config")
async def get_config():
    """
    Returns non-sensitive public configuration so frontend can adapt UI accordingly.
    Does NOT reveal the actual API key.
    """
    has_api_key = bool(settings.GEMINI_API_KEY)
    return {
        "status": "ready" if has_api_key else "needs_api_key",
        "has_server_api_key": has_api_key,
        "model": settings.GEMINI_MODEL,
        "app_name": settings.PROJECT_NAME,
        "version": settings.VERSION,
    }

@router.post("/generate-questions", response_model=GenerateQuestionsResponse)
async def generate_questions(
    request: GenerateQuestionsRequest,
    x_gemini_api_key: Optional[str] = Header(None, alias="X-Gemini-Api-Key")
):
    """
    Generate tailored interview questions based on role, level, interview type, and topics.
    """
    return await gemini_service.generate_questions(request, api_key=x_gemini_api_key)

@router.post("/evaluate-answer", response_model=EvaluateAnswerResponse)
async def evaluate_answer(
    request: EvaluateAnswerRequest,
    x_gemini_api_key: Optional[str] = Header(None, alias="X-Gemini-Api-Key")
):
    """
    Evaluate candidate's answer with scores, strengths, missing concepts, and improvement recommendations.
    """
    return await gemini_service.evaluate_answer(request, api_key=x_gemini_api_key)

@router.post("/stream-evaluate-answer")
async def stream_evaluate_answer(
    request: EvaluateAnswerRequest,
    x_gemini_api_key: Optional[str] = Header(None, alias="X-Gemini-Api-Key")
):
    """
    Streams answer evaluation via Server-Sent Events (SSE).
    """
    async def event_generator():
        async for chunk in gemini_service.stream_evaluate_answer(request, api_key=x_gemini_api_key):
            yield {"data": chunk}

    return EventSourceResponse(event_generator())

@router.post("/generate-sample-answer", response_model=SampleAnswerResponse)
async def generate_sample_answer(
    request: SampleAnswerRequest,
    x_gemini_api_key: Optional[str] = Header(None, alias="X-Gemini-Api-Key")
):
    """
    Generate an ideal structured model answer with key takeaways and pro tips.
    """
    return await gemini_service.generate_sample_answer(request, api_key=x_gemini_api_key)

@router.post("/stream-sample-answer")
async def stream_sample_answer(
    request: SampleAnswerRequest,
    x_gemini_api_key: Optional[str] = Header(None, alias="X-Gemini-Api-Key")
):
    """
    Streams sample answer generation via Server-Sent Events (SSE).
    """
    async def event_generator():
        async for chunk in gemini_service.stream_sample_answer(request, api_key=x_gemini_api_key):
            yield {"data": chunk}

    return EventSourceResponse(event_generator())

@router.post("/interview-summary", response_model=InterviewSummaryResponse)
async def generate_interview_summary(
    request: InterviewSummaryRequest,
    x_gemini_api_key: Optional[str] = Header(None, alias="X-Gemini-Api-Key")
):
    """
    Aggregate all question reviews into an overall scorecard, strengths/weaknesses, and preparation roadmap.
    """
    return await gemini_service.generate_interview_summary(request, api_key=x_gemini_api_key)
