from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

# Resume Parsing Models
class PersonalInfo(BaseModel):
    name: Optional[str] = ""
    email: Optional[str] = ""
    phone: Optional[str] = ""
    location: Optional[str] = ""
    links: List[str] = []

class WorkExperience(BaseModel):
    company: str
    title: str
    start_date: Optional[str] = ""
    end_date: Optional[str] = ""
    descriptions: List[str] = []

class Education(BaseModel):
    institution: str
    degree: str
    major: Optional[str] = ""
    graduation_date: Optional[str] = ""

class ParsedResume(BaseModel):
    personal_info: PersonalInfo
    experience: List[WorkExperience] = []
    education: List[Education] = []
    skills: List[str] = []

class ResumeResponse(BaseModel):
    resume_id: str
    filename: str
    parsed_content: Optional[ParsedResume] = None
    created_at: datetime

# Job Description Models
class JobDescriptionRequest(BaseModel):
    text: str

class JobDescriptionResponse(BaseModel):
    job_id: str
    text: str
    created_at: datetime

# ATS Analysis Models
class ScoreBreakdown(BaseModel):
    semantic_match: float
    hard_skills_match: float
    structural_score: float

class MatchRequest(BaseModel):
    resume_id: str
    job_text: str

class MatchResponse(BaseModel):
    analysis_id: str
    resume_id: str
    ats_score: float
    breakdown: ScoreBreakdown
    matched_skills: List[str]
    missing_skills: List[str]
    skill_match_percentage: float
    strengths: List[str]
    weaknesses: List[str]
    recommendations: List[str]
    created_at: datetime


# Cover Letter Models
class CoverLetterRequest(BaseModel):
    resume_id: str
    job_text: str
    tone: Optional[str] = "professional"

class CoverLetterResponse(BaseModel):
    cover_letter_id: str
    resume_id: str
    content: str
    tone: str
    created_at: datetime

# Interview Questions Models
class InterviewQuestionsRequest(BaseModel):
    resume_id: str
    job_text: str

class QuestionItem(BaseModel):
    question: str
    category: str
    expected_answer: str

class InterviewQuestionsResponse(BaseModel):
    interview_id: str
    resume_id: str
    questions: List[QuestionItem]
    created_at: datetime

# New PDF Parsing Response Model
class ResumeUploadResponse(BaseModel):
    raw_text: str
    skills_detected: List[str]
    education_detected: List[Education]
    experience_detected: List[WorkExperience]

