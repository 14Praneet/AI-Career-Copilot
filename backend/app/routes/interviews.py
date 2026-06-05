from fastapi import APIRouter, HTTPException, Depends, status
from app.models import InterviewQuestionsRequest, InterviewQuestionsResponse, QuestionItem
from app.services.openai_service import openai_service
from app.database import get_database
from datetime import datetime
from bson import ObjectId

router = APIRouter(prefix="/interviews", tags=["interviews"])

@router.post("/generate", response_model=InterviewQuestionsResponse)
async def generate_interview_questions(payload: InterviewQuestionsRequest, db = Depends(get_database)):
    try:
        # Check resume existence
        resume_doc = await db["resumes"].find_one({"_id": ObjectId(payload.resume_id)})
        if not resume_doc:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Resume not found"
            )
            
        parsed_resume = resume_doc["parsed_content"]
        
        # Call OpenAI interview questions generator
        openai_questions = await openai_service.generate_interview_questions(
            parsed_resume=parsed_resume,
            job_text=payload.job_text
        )
        
        # Convert dictionaries to QuestionItem models
        questions_list = [
            QuestionItem(
                question=q.get("question", "Mock Question"),
                category=q.get("category", "Technical"),
                expected_answer=q.get("expected_answer", "Expected details")
            )
            for q in openai_questions
        ]
        
        interview_doc = {
            "resume_id": payload.resume_id,
            "questions": [q.model_dump() for q in questions_list],
            "created_at": datetime.utcnow()
        }
        
        result = await db["interviews"].insert_one(interview_doc)
        interview_id = str(result.inserted_id)
        
        return InterviewQuestionsResponse(
            interview_id=interview_id,
            resume_id=payload.resume_id,
            questions=questions_list,
            created_at=interview_doc["created_at"]
        )
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid request format: {str(e)}"
        )
