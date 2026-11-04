import json
import logging
import re
from typing import AsyncGenerator, Dict, Any, List, Optional
from fastapi import HTTPException
from google import genai
from google.genai import types
from google.genai.errors import APIError

from app.config import settings
from app.schemas import (
    GenerateQuestionsRequest,
    GenerateQuestionsResponse,
    QuestionItem,
    EvaluateAnswerRequest,
    EvaluateAnswerResponse,
    EvaluationMetrics,
    SampleAnswerRequest,
    SampleAnswerResponse,
    InterviewSummaryRequest,
    InterviewSummaryResponse,
)

logger = logging.getLogger(__name__)

class GeminiService:
    def __init__(self):
        self._client: Optional[genai.Client] = None

    def get_client(self) -> genai.Client:
        """
        Retrieves or initializes the Google Gen AI client using backend GEMINI_API_KEY.
        Never accepts client-supplied keys.
        """
        api_key = settings.GEMINI_API_KEY.strip() if settings.GEMINI_API_KEY else ""
        if not api_key:
            raise HTTPException(
                status_code=400,
                detail=(
                    "Backend GEMINI_API_KEY is not configured. Please add GEMINI_API_KEY to your "
                    "backend .env file or Render environment variables."
                )
            )
        
        if self._client is None:
            self._client = genai.Client(api_key=api_key)
            
        return self._client

    @property
    def model_name(self) -> str:
        return settings.GEMINI_MODEL or "gemini-3.8-flash"

    def _get_candidate_models(self) -> List[str]:
        primary = self.model_name
        candidates = [primary]
        for fallback in ["gemini-3.6-flash", "gemini-3.5-flash", "gemini-3.5-flash-lite"]:
            if fallback not in candidates:
                candidates.append(fallback)
        return candidates

    def _is_recoverable_model_error(self, err_str: str) -> bool:
        recoverable_indicators = [
            "503", "429", "404", "high demand", "unavailable",
            "resource_exhausted", "quota", "rate limit", "too many requests", "not found"
        ]
        return any(ind in err_str for ind in recoverable_indicators)

    def _generate_content_with_fallback(self, contents, config=None):
        client = self.get_client()
        last_err = None
        for model in self._get_candidate_models():
            try:
                logger.info(f"Generating content with model: {model}")
                return client.models.generate_content(
                    model=model,
                    contents=contents,
                    config=config
                )
            except Exception as e:
                last_err = e
                err_str = str(e).lower()
                if self._is_recoverable_model_error(err_str):
                    logger.warning(f"Model {model} hit recoverable error ({e}). Trying fallback model...")
                    continue
                raise e
        raise last_err

    def _generate_content_stream_with_fallback(self, contents, config=None):
        client = self.get_client()
        last_err = None
        for model in self._get_candidate_models():
            try:
                logger.info(f"Starting content stream with model: {model}")
                return client.models.generate_content_stream(
                    model=model,
                    contents=contents,
                    config=config
                )
            except Exception as e:
                last_err = e
                err_str = str(e).lower()
                if self._is_recoverable_model_error(err_str):
                    logger.warning(f"Model {model} hit recoverable error ({e}) during stream. Trying fallback model...")
                    continue
                raise e
        raise last_err

    def _format_api_error(self, e: Exception) -> str:
        err_msg = str(e)
        if "503" in err_msg or "high demand" in err_msg.lower() or "unavailable" in err_msg.lower():
            return "The Gemini AI model is currently experiencing temporary high demand from Google. Please try again in a few moments."
        if "404" in err_msg or "not found" in err_msg.lower():
            return f"The configured Gemini model '{self.model_name}' was not found. Please verify GEMINI_MODEL."
        if "429" in err_msg or "quota" in err_msg.lower() or "exhausted" in err_msg.lower():
            return "Gemini API rate limit or quota exceeded. Please wait a moment before trying again."
        if "api_key" in err_msg.lower() or "key not valid" in err_msg.lower():
            return "Invalid Gemini API Key. Please verify your GEMINI_API_KEY in backend/.env."
        return f"Gemini API error: {err_msg}"

    def _extract_json(self, raw_text: str) -> Any:
        """
        Extracts and parses JSON object or array safely from Gemini response text.
        Handles markdown blocks, raw JSON strings, single-quoted dicts, and unescaped control characters.
        """
        import ast
        text = raw_text.strip()
        if "```" in text:
            match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", text)
            if match:
                text = match.group(1).strip()
        
        try:
            return json.loads(text, strict=False)
        except Exception:
            pass

        # Substring search for outermost { } or [ ]
        first_brace = text.find("{")
        first_bracket = text.find("[")
        candidate = None
        if first_brace != -1 and (first_bracket == -1 or first_brace < first_bracket):
            last_brace = text.rfind("}")
            if last_brace != -1:
                candidate = text[first_brace:last_brace + 1]
        elif first_bracket != -1:
            last_bracket = text.rfind("]")
            if last_bracket != -1:
                candidate = text[first_bracket:last_bracket + 1]
        
        if candidate:
            try:
                return json.loads(candidate, strict=False)
            except Exception:
                pass
            try:
                return ast.literal_eval(candidate)
            except Exception:
                pass
        
        try:
            return ast.literal_eval(text)
        except Exception:
            pass

        raise ValueError(f"Could not parse valid JSON from AI response: {text[:200]}")

    async def generate_questions(self, req: GenerateQuestionsRequest) -> GenerateQuestionsResponse:
        """
        Generates realistic, non-repetitive interview questions tailored to
        role, seniority, interview type, and specific topics.
        """
        resolved_type = req.resolved_interview_type
        prompt = f"""
You are an expert technical interviewer and hiring manager at a top-tier tech company.
Generate an interview question set with the following specifications:
- Role: {req.role}
- Experience Level: {req.level} (e.g. Beginner: fundamental concepts, core syntax, simple problems; Intermediate: architecture, tradeoffs, performance, practical debugging; Advanced: system design, concurrency, scalability, enterprise patterns)
- Interview Type: {resolved_type} (Technical, HR, or Mixed)
- Number of Questions: {req.num_questions}
- Specific Topics of Focus: {req.topics if req.topics else 'Standard comprehensive industry scope for this role'}

GUIDELINES:
1. Ensure questions are realistic, clear, and relevant to modern industry standards.
2. If Technical: mix core conceptual understanding, real-world scenario/edge-case handling, and best practices.
3. If HR / Behavioral: use situational questions (STAR method-oriented: Situation, Task, Action, Result) regarding teamwork, conflict, deadlines, or culture fit.
4. If Mixed: balance 60% technical and 40% behavioral/situational questions.
5. Provide a constructive hint for each question that prompts thoughtful preparation without revealing the full answer.
6. Absolutely avoid duplicate or trivially repetitive questions.

Output MUST be a valid JSON array of objects with the following schema:
[
  {{
    "id": 1,
    "question_number": 1,
    "question": "The question text...",
    "category": "e.g. Technical / System Design / Behavioral / Problem Solving",
    "difficulty": "Beginner / Intermediate / Advanced",
    "hint": "Key considerations or concepts to touch upon..."
  }}
]
"""
        try:
            response = self._generate_content_with_fallback(
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    temperature=0.7,
                )
            )
            data = self._extract_json(response.text)
            
            if isinstance(data, dict):
                questions_raw = data.get("questions", data.get("items", []))
            elif isinstance(data, list):
                questions_raw = data
            else:
                raise ValueError("Unexpected JSON format from model.")

            items = []
            for idx, q in enumerate(questions_raw, start=1):
                items.append(
                    QuestionItem(
                        id=q.get("id", idx),
                        question_number=idx,
                        question=q.get("question", f"Question {idx}"),
                        category=q.get("category", resolved_type),
                        difficulty=q.get("difficulty", req.level),
                        hint=q.get("hint")
                    )
                )

            return GenerateQuestionsResponse(
                questions=items,
                role=req.role,
                level=req.level,
                interview_type=resolved_type,
                total_questions=len(items)
            )
        except APIError as e:
            logger.error(f"Gemini API error during generate_questions: {e}")
            raise HTTPException(status_code=502, detail=self._format_api_error(e))
        except Exception as e:
            logger.error(f"Error generating questions: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to generate questions: {str(e)}")

    async def evaluate_answer(self, req: EvaluateAnswerRequest) -> EvaluateAnswerResponse:
        """
        Evaluates a candidate's answer on correctness, clarity, technical depth, and completeness.
        Produces scores, key strengths, missing concepts, and concrete improvement tips.
        """
        client = self.get_client()

        prompt = f"""
You are an expert interviewer evaluating a candidate for the following role:
- Role: {req.role}
- Experience Level: {req.level}
- Question Category: {req.category or 'General'}

QUESTION:
"{req.question}"

CANDIDATE'S ANSWER:
"{req.user_answer}"

EVALUATION TASK:
Conduct a fair, constructive, and accurate evaluation of the candidate's response.
Consider:
1. Correctness (0-10): Technical accuracy and factuality.
2. Clarity (0-10): Clear structure, coherent reasoning, and good communication.
3. Technical Depth (0-10): Domain knowledge appropriate for {req.level} level.
4. Completeness (0-10): How thoroughly it answers all aspects of the question.
Overall Score (0-10): Weighted average of the criteria.

Be encouraging yet honest. If the answer is blank, nonsensical, or "I don't know", score accordingly (e.g. 0-2) and clearly state what was expected.

Output MUST be a valid JSON object with this exact schema:
{{
  "score": 7.5,
  "metrics": {{
    "correctness": 8.0,
    "clarity": 7.5,
    "technical_depth": 7.0,
    "completeness": 7.5
  }},
  "feedback": "A concise paragraph summarizing the evaluation in an encouraging tone.",
  "strengths": [
    "Specific point or concept they explained well",
    "Another strength..."
  ],
  "missing_concepts": [
    "Crucial concept, edge case, or terminology omitted",
    "Another missing detail..."
  ],
  "improvements": [
    "Actionable tip on how to elevate this response in a real interview",
    "Another improvement suggestion..."
  ]
}}
"""
        try:
            response = self._generate_content_with_fallback(
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    temperature=0.3,
                )
            )
            data = self._extract_json(response.text)
            
            metrics_data = data.get("metrics", {})
            metrics = EvaluationMetrics(
                correctness=float(metrics_data.get("correctness", data.get("score", 5.0))),
                clarity=float(metrics_data.get("clarity", data.get("score", 5.0))),
                technical_depth=float(metrics_data.get("technical_depth", data.get("score", 5.0))),
                completeness=float(metrics_data.get("completeness", data.get("score", 5.0))),
            )
            
            return EvaluateAnswerResponse(
                score=round(float(data.get("score", 5.0)), 1),
                metrics=metrics,
                feedback=data.get("feedback", "Evaluation completed."),
                strengths=data.get("strengths", ["Answer addressed the question."]),
                missing_concepts=data.get("missing_concepts", []),
                improvements=data.get("improvements", ["Provide more specific details or examples."]),
            )
        except APIError as e:
            logger.error(f"Gemini API error during evaluate_answer: {e}")
            raise HTTPException(status_code=502, detail=self._format_api_error(e))
        except Exception as e:
            logger.error(f"Error evaluating answer: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to evaluate answer: {str(e)}")

    async def stream_evaluate_answer(self, req: EvaluateAnswerRequest) -> AsyncGenerator[str, None]:
        """
        Streams evaluation analysis live using Server-Sent Events (SSE).
        Yields chunk tokens as they are produced by Gemini, then emits the final structured JSON event.
        """
        client = self.get_client()

        prompt = f"""
You are an expert interviewer evaluating a candidate for the following role:
- Role: {req.role}
- Experience Level: {req.level}

QUESTION:
"{req.question}"

CANDIDATE'S ANSWER:
"{req.user_answer}"

Evaluate this answer. First, provide your live expert commentary. Then, conclude with the final structured JSON block enclosed in ```json ... ``` with:
- score (0-10)
- metrics: {{ correctness, clarity, technical_depth, completeness }}
- feedback
- strengths (list)
- missing_concepts (list)
- improvements (list)
"""
        accumulated_text = ""
        stream_started = False
        client = self.get_client()

        for model in self._get_candidate_models():
            try:
                logger.info(f"Streaming evaluate answer with model: {model}")
                stream = client.models.generate_content_stream(
                    model=model,
                    contents=prompt,
                    config=types.GenerateContentConfig(temperature=0.3)
                )
                for chunk in stream:
                    stream_started = True
                    chunk_text = chunk.text or ""
                    accumulated_text += chunk_text
                    yield json.dumps({"type": "chunk", "text": chunk_text})

                break
            except Exception as e:
                err_str = str(e).lower()
                if not stream_started and self._is_recoverable_model_error(err_str):
                    logger.warning(f"Streaming on {model} hit recoverable error ({e}). Trying fallback...")
                    continue
                logger.error(f"Stream error: {e}")
                yield json.dumps({"type": "error", "message": self._format_api_error(e)})
                return

        try:
            data = self._extract_json(accumulated_text)
            yield json.dumps({"type": "final", "data": data})
        except Exception:
            structured = await self.evaluate_answer(req)
            yield json.dumps({"type": "final", "data": structured.model_dump()})

    async def generate_sample_answer(self, req: SampleAnswerRequest) -> SampleAnswerResponse:
        """
        Generates a model answer with crystal-clear student-friendly explanations,
        breakdown of core concepts, and interview pro tips.
        """
        client = self.get_client()

        prompt = f"""
You are a senior mentor helping a {req.level} candidate ace their interview for:
- Role: {req.role}
- Category: {req.category or 'Technical'}

QUESTION:
"{req.question}"

INSTRUCTIONS:
1. Provide a well-structured, professional, model interview answer that a candidate can deliver in 2-3 minutes.
2. Structure it clearly:
   - Direct Definition / Core Statement (The "What")
   - Working Mechanism & Real-World Context (The "How" and "Why")
   - Concrete Example or Code snippet (if applicable to technical questions)
   - Trade-offs or Best Practice summary
3. Keep explanations easy for students to understand without dumbing down technical accuracy.
4. Extract 3-4 key bullet points to memorize.
5. Provide 2-3 high-value "Pro Tips" for standing out.

Output MUST be a valid JSON object matching this schema:
{{
  "sample_answer": "Complete structured model answer (can use clean markdown formatting, bold headers, bullet points)...",
  "structure_breakdown": "Brief breakdown of the response strategy (e.g., Definition -> Practical Implementation -> Edge Case handling)",
  "key_points": [
    "Key takeaway point 1",
    "Key takeaway point 2",
    "Key takeaway point 3"
  ],
  "pro_tips": [
    "Top tip for delivering this answer confidently",
    "Common trap to avoid"
  ]
}}
"""
        try:
            response = self._generate_content_with_fallback(
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    temperature=0.5,
                )
            )
            try:
                data = self._extract_json(response.text)
                return SampleAnswerResponse(
                    sample_answer=data.get("sample_answer", response.text.strip()),
                    structure_breakdown=data.get("structure_breakdown", "Core Definition -> Deep Dive -> Best Practices"),
                    key_points=data.get("key_points", ["Review core syntax and behavior", "Understand performance trade-offs"]),
                    pro_tips=data.get("pro_tips", ["Answer with clarity and provide concrete examples", "Highlight edge cases"]),
                )
            except Exception as parse_err:
                logger.warning(f"Could not parse strict JSON in sample answer: {parse_err}. Using text directly.")
                clean_text = response.text.replace("```json", "").replace("```", "").strip()
                return SampleAnswerResponse(
                    sample_answer=clean_text,
                    structure_breakdown="Direct Model Response",
                    key_points=["Review core architectural concepts", "Articulate trade-offs clearly"],
                    pro_tips=["Practice delivering this explanation in under 2 minutes"]
                )
        except APIError as e:
            logger.error(f"Gemini API error during generate_sample_answer: {e}")
            raise HTTPException(status_code=502, detail=self._format_api_error(e))
        except Exception as e:
            logger.error(f"Error generating sample answer: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to generate sample answer: {str(e)}")

    async def stream_sample_answer(self, req: SampleAnswerRequest) -> AsyncGenerator[str, None]:
        """
        Streams model answer in real time using Server-Sent Events (SSE).
        """
        client = self.get_client()

        prompt = f"""
You are a senior mentor crafting a model interview answer for:
- Role: {req.role} ({req.level})
- Question: "{req.question}"

Provide a structured, engaging model answer:
1. Executive Summary / Definition
2. Detailed Explanation & Real-world application
3. Concrete Example or Code Illustration
4. Best practices & edge cases to mention
5. Key Takeaways & Pro-tips

Stream the response in clean, formatted Markdown.
"""
        client = self.get_client()
        stream_started = False
        for model in self._get_candidate_models():
            try:
                logger.info(f"Streaming sample answer with model: {model}")
                stream = client.models.generate_content_stream(
                    model=model,
                    contents=prompt,
                    config=types.GenerateContentConfig(temperature=0.4)
                )
                for chunk in stream:
                    stream_started = True
                    chunk_text = chunk.text or ""
                    yield json.dumps({"type": "chunk", "text": chunk_text})

                yield json.dumps({"type": "done"})
                return
            except Exception as e:
                err_str = str(e).lower()
                if not stream_started and self._is_recoverable_model_error(err_str):
                    logger.warning(f"Stream sample answer on {model} hit recoverable error ({e}). Trying fallback...")
                    continue
                logger.error(f"Stream sample answer error: {e}")
                yield json.dumps({"type": "error", "message": self._format_api_error(e)})
                return

    async def generate_interview_summary(self, req: InterviewSummaryRequest) -> InterviewSummaryResponse:
        """
        Aggregates individual question evaluations, generates an overall interview score,
        strength/weakness analysis, and a personalized preparation roadmap for the candidate.
        """
        client = self.get_client()

        reviews_summary = []
        individual_scores = []
        for r in req.reviews:
            individual_scores.append(r.score)
            reviews_summary.append({
                "question_number": r.question_number,
                "question": r.question,
                "score": r.score,
                "user_answer": r.user_answer[:200] + ("..." if len(r.user_answer) > 200 else ""),
                "strengths": r.strengths,
                "missing_concepts": r.missing_concepts,
            })

        avg_score = round(sum(individual_scores) / len(individual_scores), 1) if individual_scores else 0.0

        prompt = f"""
You are the Lead Hiring Panelist delivering the final interview feedback report for:
- Candidate Role: {req.role}
- Experience Level: {req.level}
- Interview Type: {req.resolved_interview_type}
- Total Questions Answered: {len(req.reviews)}
- Average Question Score: {avg_score} / 10

INDIVIDUAL QUESTION REVIEWS:
{json.dumps(reviews_summary, indent=2)}

TASK:
Produce an encouraging, professional, and comprehensive final evaluation report:
1. Validate overall score out of 10.
2. Determine performance level: 'Excellent' (8.5-10), 'Proficient' (7.0-8.4), 'Developing' (5.0-6.9), or 'Needs Improvement' (<5.0).
3. Synthesize top overarching strengths demonstrated across the interview.
4. Identify primary conceptual or structural weaknesses.
5. List high-priority areas for improvement.
6. Provide an actionable step-by-step preparation roadmap (3-5 specific topics, frameworks, or practice habits).
7. Write a final encouraging hiring verdict / summary paragraph.

Output MUST be a valid JSON object matching this schema:
{{
  "overall_score": {avg_score},
  "performance_level": "Proficient",
  "strengths": [
    "Solid grasp of fundamental syntax and core concepts",
    "Clear communication when articulating trade-offs"
  ],
  "weaknesses": [
    "Hesitancy on performance optimization and concurrency edge cases",
    "Answers lacked concrete real-world architectural examples"
  ],
  "areas_for_improvement": [
    "Deepen knowledge of asynchronous workflows and memory management",
    "Practice the STAR method for behavioral/situational questions"
  ],
  "preparation_roadmap": [
    "Step 1: Revise core data structures and time complexity analysis",
    "Step 2: Build a hands-on mini-project focusing on API resiliency and testing",
    "Step 3: Conduct mock timed interviews focusing on concise 2-minute answers"
  ],
  "final_verdict": "A comprehensive hiring verdict summarizing the candidate's readiness..."
}}
"""
        try:
            response = self._generate_content_with_fallback(
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    temperature=0.4,
                )
            )
            try:
                data = self._extract_json(response.text)
                calculated_score = float(data.get("overall_score", avg_score))
                calculated_score = round(max(0.0, min(10.0, calculated_score)), 1)
                
                return InterviewSummaryResponse(
                    overall_score=calculated_score,
                    performance_level=data.get("performance_level", "Proficient"),
                    total_questions_answered=len(req.reviews),
                    individual_scores=individual_scores,
                    strengths=data.get("strengths", ["Demonstrated general domain understanding."]),
                    weaknesses=data.get("weaknesses", ["Some technical nuances were omitted."]),
                    areas_for_improvement=data.get("areas_for_improvement", ["Review core design patterns."]),
                    preparation_roadmap=data.get("preparation_roadmap", ["Continue practicing problem-solving scenarios."]),
                    final_verdict=data.get("final_verdict", "Good overall interview effort with great room for growth."),
                )
            except Exception as parse_err:
                logger.warning(f"Fallback parsing for interview_summary: {parse_err}")
                perf_level = "Excellent" if avg_score >= 8.0 else ("Proficient" if avg_score >= 6.5 else ("Developing" if avg_score >= 5.0 else "Needs Improvement"))
                clean_text = response.text.replace("```json", "").replace("```", "").strip()[:400]
                return InterviewSummaryResponse(
                    overall_score=avg_score,
                    performance_level=perf_level,
                    total_questions_answered=len(req.reviews),
                    individual_scores=individual_scores,
                    strengths=["Solid fundamental understanding of the core stack."],
                    weaknesses=["Some edge-case handling and depth can be expanded."],
                    areas_for_improvement=["Practice explaining trade-offs and architectural decisions."],
                    preparation_roadmap=[
                        "Step 1: Revise core data structures and asynchronous patterns",
                        "Step 2: Build a focused mini-project with end-to-end tests",
                        "Step 3: Conduct mock timed interviews"
                    ],
                    final_verdict=clean_text or "Good overall interview effort with solid potential for the role."
                )
        except APIError as e:
            logger.error(f"Gemini API error during generate_interview_summary: {e}")
            raise HTTPException(status_code=502, detail=self._format_api_error(e))
        except Exception as e:
            logger.error(f"Error generating interview summary: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to generate summary: {str(e)}")

gemini_service = GeminiService()
