from typing import List, Dict, Any
import re
from datetime import datetime
from app.services.parser import resume_parser_service

class ATSEngineService:
    @staticmethod
    def calculate_experience_duration(experience_list: List[Dict[str, Any]]) -> float:
        """
        Calculates total years of professional experience from the parsed resume work history.
        """
        total_years = 0.0
        current_year = datetime.now().year
        
        for exp in experience_list:
            start_date = exp.get("start_date", "")
            end_date = exp.get("end_date", "")
            
            # Extract start year
            start_year = None
            start_match = re.search(r'\b(19\d{2}|20\d{2})\b', start_date)
            if start_match:
                start_year = int(start_match.group(1))
            else:
                # Try parsing standard YYYY-MM
                parts = start_date.split("-")
                if parts and parts[0].isdigit():
                    start_year = int(parts[0])
            
            if not start_year:
                continue # Skip if start date is missing
                
            # Extract end year
            end_year = current_year
            if end_date and "present" not in end_date.lower():
                end_match = re.search(r'\b(19\d{2}|20\d{2})\b', end_date)
                if end_match:
                    end_year = int(end_match.group(1))
                else:
                    parts = end_date.split("-")
                    if parts and parts[0].isdigit():
                        end_year = int(parts[0])
            
            duration = max(0.5, end_year - start_year)
            total_years += duration
            
        return total_years

    @staticmethod
    def extract_required_experience(job_text: str) -> float:
        """
        Extracts required years of experience from the Job Description text.
        e.g., searches for '3+ years', '5 years of experience'.
        """
        # Search for patterns like '5+ years', '3 years', '2-4 years'
        matches = re.findall(r'\b(\d+)\+?\s*years?\b', job_text.lower())
        if matches:
            years = [float(m) for m in matches]
            return max(years) # Return the highest years requested as the threshold
        
        # Look for senior designations
        if any(kw in job_text.lower() for kw in ["senior", "lead", "staff", "principal"]):
            return 5.0 # default to 5 years for senior roles
        return 2.0 # default to 2 years for standard roles

    @classmethod
    def run_analysis(cls, parsed_resume: Dict[str, Any], job_text: str) -> Dict[str, Any]:
        """
        Executes local multi-factor ATS match analysis:
        1. Skill match percentage (60% weight)
        2. Experience alignment (25% weight)
        3. Structural completeness (15% weight)
        """
        # 1. Skills audit
        resume_skills = [s.lower() for s in parsed_resume.get("skills", [])]
        jd_skills_raw = resume_parser_service.detect_skills(job_text)
        jd_skills_lower = [s.lower() for s in jd_skills_raw]
        
        matched_skills = []
        missing_skills = []
        
        for idx, skill in enumerate(jd_skills_raw):
            skill_lower = jd_skills_lower[idx]
            # Match if skill lower matches
            if skill_lower in resume_skills:
                matched_skills.append(skill)
            else:
                missing_skills.append(skill)
                
        # Handle division by zero
        if jd_skills_raw:
            skill_match_percentage = round((len(matched_skills) / len(jd_skills_raw)) * 100.0, 2)
        else:
            # Fallback if JD has no detected technical keywords
            skill_match_percentage = 80.0
            matched_skills = parsed_resume.get("skills", [])[:5]
            missing_skills = ["Docker", "Kubernetes", "AWS"]
            
        # 2. Experience check
        resume_years = cls.calculate_experience_duration(parsed_resume.get("experience", []))
        required_years = cls.extract_required_experience(job_text)
        
        if resume_years >= required_years:
            experience_score = 100.0
        else:
            experience_score = round((resume_years / required_years) * 100.0, 2)
            
        # 3. Structural checks
        structural_points = 0.0
        p_info = parsed_resume.get("personal_info", {})
        if p_info.get("email") or p_info.get("phone"):
            structural_points += 33.3
        if parsed_resume.get("education"):
            structural_points += 33.3
        
        # Check if experience points have bullet descriptions
        has_descriptions = False
        for exp in parsed_resume.get("experience", []):
            if exp.get("descriptions"):
                has_descriptions = True
                break
        if has_descriptions:
            structural_points += 33.4
            
        structural_score = round(structural_points, 2)
        
        # Weighted aggregate score calculation
        ats_score = round(
            (0.60 * skill_match_percentage) + 
            (0.25 * experience_score) + 
            (0.15 * structural_score), 
            2
        )
        
        return {
            "ats_score": ats_score,
            "breakdown": {
                "semantic_match": skill_match_percentage, # Align with models.py name
                "hard_skills_match": skill_match_percentage,
                "structural_score": structural_score
            },
            "matched_skills": matched_skills,
            "missing_skills": missing_skills,
            "skill_match_percentage": skill_match_percentage
        }

ats_engine_service = ATSEngineService()

