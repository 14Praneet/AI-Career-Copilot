from fastapi import APIRouter, HTTPException, Depends, status
from app.models import MatchRequest, MatchResponse, ScoreBreakdown
from app.services.ats_engine import ats_engine_service
from app.services.openai_service import openai_service
from app.database import get_database
from datetime import datetime
from bson import ObjectId

router = APIRouter(prefix="/analysis", tags=["analysis"])

@router.post("/match", response_model=MatchResponse)
async def match_resume_to_jd(payload: MatchRequest, db = Depends(get_database)):
    try:
        # Fetch resume from database
        resume_doc = await db["resumes"].find_one({"_id": ObjectId(payload.resume_id)})
        if not resume_doc:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Resume not found"
            )
            
        parsed_resume = resume_doc["parsed_content"]
        
        # Execute ATS matching calculations
        analysis_result = ats_engine_service.run_analysis(parsed_resume, payload.job_text)
        
        # Call OpenAI to get suggestions/strengths/weaknesses
        suggestions = await openai_service.generate_suggestions(parsed_resume, payload.job_text)
        
        # Save analysis report to database
        analysis_doc = {
            "resume_id": payload.resume_id,
            "ats_score": analysis_result["ats_score"],
            "breakdown": analysis_result["breakdown"],
            "matched_skills": analysis_result["matched_skills"],
            "missing_skills": analysis_result["missing_skills"],
            "skill_match_percentage": analysis_result["skill_match_percentage"],
            "strengths": suggestions.get("strengths", ["Solid professional background"]),
            "weaknesses": suggestions.get("weaknesses", ["A few keyword misalignments"]),
            "recommendations": suggestions.get("recommendations", ["Review JD details"]),
            "created_at": datetime.utcnow()
        }
        
        result = await db["analyses"].insert_one(analysis_doc)
        analysis_id = str(result.inserted_id)
        
        return MatchResponse(
            analysis_id=analysis_id,
            resume_id=payload.resume_id,
            ats_score=analysis_doc["ats_score"],
            breakdown=ScoreBreakdown(**analysis_doc["breakdown"]),
            matched_skills=analysis_doc["matched_skills"],
            missing_skills=analysis_doc["missing_skills"],
            skill_match_percentage=analysis_doc["skill_match_percentage"],
            strengths=analysis_doc["strengths"],
            weaknesses=analysis_doc["weaknesses"],
            recommendations=analysis_doc["recommendations"],
            created_at=analysis_doc["created_at"]
        )
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid request or resource format: {str(e)}"
        )
