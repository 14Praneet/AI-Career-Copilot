from fastapi import APIRouter, HTTPException, Depends, status
from app.models import CoverLetterRequest, CoverLetterResponse
from app.services.openai_service import openai_service
from app.database import get_database
from datetime import datetime
from bson import ObjectId

router = APIRouter(prefix="/generator", tags=["generator"])

@router.post("/cover-letter", response_model=CoverLetterResponse)
async def generate_cover_letter(payload: CoverLetterRequest, db = Depends(get_database)):
    try:
        # Check resume existence
        resume_doc = await db["resumes"].find_one({"_id": ObjectId(payload.resume_id)})
        if not resume_doc:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Resume not found"
            )
            
        parsed_resume = resume_doc["parsed_content"]
        
        # Call OpenAI cover letter generator
        letter_content = await openai_service.generate_cover_letter(
            parsed_resume=parsed_resume,
            job_text=payload.job_text,
            tone=payload.tone or "professional"
        )
        
        cl_doc = {
            "resume_id": payload.resume_id,
            "content": letter_content,
            "tone": payload.tone or "professional",
            "created_at": datetime.utcnow()
        }
        
        result = await db["cover_letters"].insert_one(cl_doc)
        cover_letter_id = str(result.inserted_id)
        
        return CoverLetterResponse(
            cover_letter_id=cover_letter_id,
            resume_id=payload.resume_id,
            content=letter_content,
            tone=payload.tone or "professional",
            created_at=cl_doc["created_at"]
        )
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid request format: {str(e)}"
        )
