from typing import List, Optional
from pydantic import BaseModel, Field

# --- Question Generation Models ---
class QuestionItem(BaseModel):
    id: int
    question_number: int
    question: str
    category: str = Field(description="e.g. Technical, Behavioral, System Design, Problem Solving")
    difficulty: str = Field(description="Beginner, Intermediate, Advanced")
    hint: Optional[str] = Field(default=None, description="Helpful thinking hint or key concept to touch upon")

class GenerateQuestionsRequest(BaseModel):
    role: str = Field(..., example="Python Developer")
    level: str = Field(..., example="Intermediate")
    interview_type: str = Field(..., example="Technical")
    num_questions: int = Field(5, ge=1, le=20)
    topics: Optional[str] = Field(None, example="FastAPI, Docker, AsyncIO, Database optimization")

class GenerateQuestionsResponse(BaseModel):
    questions: List[QuestionItem]
    role: str
    level: str
    interview_type: str
    total_questions: int

# --- Answer Evaluation Models ---
class EvaluationMetrics(BaseModel):
    correctness: float = Field(..., ge=0, le=10, description="Technical accuracy of content")
    clarity: float = Field(..., ge=0, le=10, description="Structure and clear communication")
    technical_depth: float = Field(..., ge=0, le=10, description="Depth of domain knowledge shown")
    completeness: float = Field(..., ge=0, le=10, description="Did it cover all aspects of the question?")

class EvaluateAnswerRequest(BaseModel):
    role: str
    level: str
    question: str
    user_answer: str
    category: Optional[str] = None

class EvaluateAnswerResponse(BaseModel):
    score: float = Field(..., ge=0, le=10)
    metrics: EvaluationMetrics
    feedback: str
    strengths: List[str]
    missing_concepts: List[str]
    improvements: List[str]

# --- Sample Answer Models ---
class SampleAnswerRequest(BaseModel):
    role: str
    level: str
    question: str
    category: Optional[str] = None

class SampleAnswerResponse(BaseModel):
    sample_answer: str
    structure_breakdown: Optional[str] = None
    key_points: List[str]
    pro_tips: List[str]

# --- Interview Summary Models ---
class QuestionReviewItem(BaseModel):
    question_number: int
    question: str
    user_answer: str
    score: float
    strengths: List[str] = []
    missing_concepts: List[str] = []

class InterviewSummaryRequest(BaseModel):
    role: str
    level: str
    interview_type: str
    reviews: List[QuestionReviewItem]

class CategoryScore(BaseModel):
    category: str
    score: float

class InterviewSummaryResponse(BaseModel):
    overall_score: float
    performance_level: str  # Excellent, Proficient, Developing, Needs Improvement
    total_questions_answered: int
    individual_scores: List[float]
    strengths: List[str]
    weaknesses: List[str]
    areas_for_improvement: List[str]
    preparation_roadmap: List[str]
    final_verdict: str
