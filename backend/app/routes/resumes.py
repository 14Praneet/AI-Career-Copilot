from fastapi import APIRouter, UploadFile, File, HTTPException, status, Depends
from app.models import ResumeResponse, ParsedResume, ResumeUploadResponse
from app.services.parser import resume_parser_service
from app.database import get_database
from datetime import datetime
from bson import ObjectId

router = APIRouter(tags=["resumes"])

@router.post("/upload-resume", response_model=ResumeUploadResponse, status_code=status.HTTP_201_CREATED)
async def parse_and_upload_resume(file: UploadFile = File(...)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF files are supported."
        )
    try:
        # Read file bytes
        file_bytes = await file.read()
        
        # Extract text
        raw_text = resume_parser_service.extract_text_from_pdf(file_bytes)
        
        # Heuristically parse sections
        skills = resume_parser_service.detect_skills(raw_text)
        education = resume_parser_service.detect_education(raw_text)
        experience = resume_parser_service.detect_experience(raw_text)
        
        return ResumeUploadResponse(
            raw_text=raw_text,
            skills_detected=skills,
            education_detected=education,
            experience_detected=experience
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to parse resume: {str(e)}"
        )

@router.post("/resumes/upload", response_model=ResumeResponse, status_code=status.HTTP_201_CREATED)
async def upload_resume(file: UploadFile = File(...), db = Depends(get_database)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF files are supported."
        )
        
    try:
        # Read file bytes
        file_bytes = await file.read()
        
        # Extract text
        raw_text = resume_parser_service.extract_text_from_pdf(file_bytes)
        
        # Parse text (uses mock parser for now)
        parsed_data = resume_parser_service.parse_to_structure(raw_text)
        
        # Insert into MongoDB
        resume_doc = {
            "filename": file.filename,
            "raw_text": raw_text,
            "parsed_content": parsed_data,
            "created_at": datetime.utcnow()
        }
        
        result = await db["resumes"].insert_one(resume_doc)
        resume_id = str(result.inserted_id)
        
        return ResumeResponse(
            resume_id=resume_id,
            filename=file.filename,
            parsed_content=ParsedResume(**parsed_data),
            created_at=resume_doc["created_at"]
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process resume: {str(e)}"
        )


@router.get("/resumes/{resume_id}", response_model=ResumeResponse)
async def get_resume(resume_id: str, db = Depends(get_database)):
    try:
        doc = await db["resumes"].find_one({"_id": ObjectId(resume_id)})
        if not doc:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Resume not found"
            )
        return ResumeResponse(
            resume_id=str(doc["_id"]),
            filename=doc["filename"],
            parsed_content=ParsedResume(**doc["parsed_content"]),
            created_at=doc["created_at"]
        )
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid resume ID format"
        )
