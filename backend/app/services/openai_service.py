import json
from openai import AsyncOpenAI
from app.config import settings

class OpenAIService:
    def __init__(self):
        self.client = None

    def _get_client(self) -> AsyncOpenAI:
        if not self.client:
            # Lazy initialization to prevent app crash if API key is not immediately available at startup
            if not settings.OPENAI_API_KEY:
                raise ValueError("OpenAI API key is missing. Please set OPENAI_API_KEY in your environment.")
            self.client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        return self.client

    async def generate_suggestions(self, parsed_resume: dict, job_text: str) -> dict:
        """
        Calls OpenAI to analyze the candidate's resume against the Job Description and return
        strengths, weaknesses, and improvement suggestions in a clean JSON format.
        """
        client = self._get_client()
        
        system_prompt = (
            "You are a Senior Talent Acquisition Specialist and expert Career Coach.\n"
            "Analyze the candidate's parsed resume and the target job description.\n"
            "Identify exactly 3 major strengths, exactly 3 major weaknesses or gaps, and exactly 3 concrete, "
            "actionable recommendations to optimize the resume formatting or content for this role.\n"
            "You must return your output strictly in JSON format matching this schema:\n"
            "{\n"
            "  \"strengths\": [\"string\"],\n"
            "  \"weaknesses\": [\"string\"],\n"
            "  \"recommendations\": [\"string\"]\n"
            "}"
        )

        user_content = f"RESUME:\n{json.dumps(parsed_resume)}\n\nJOB DESCRIPTION:\n{job_text}"

        try:
            response = await client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_content}
                ],
                response_format={"type": "json_object"},
                temperature=0.2
            )
            
            result_text = response.choices[0].message.content
            return json.loads(result_text)
        except Exception as e:
            print(f"OpenAI generate_suggestions error: {e}")
            # Fallback mock details if the API call fails
            return {
                "strengths": [
                    "Strong alignment with foundational backend structures.",
                    "Experience with async API protocols.",
                    "Clean modular frontend state setups."
                ],
                "weaknesses": [
                    "Missing explicitly listed DevOps/deployment keywords.",
                    "Lacks quantitative measures of work outcomes.",
                    "No cloud architectures listed."
                ],
                "recommendations": [
                    "Quantify accomplishments: Change tasks to show business percentages.",
                    "Establish a skills tag block for cloud provider components (e.g. AWS).",
                    "Add automated testing suite technologies to your experience."
                ]
            }

    async def generate_cover_letter(self, parsed_resume: dict, job_text: str, tone: str = "professional") -> str:
        """
        Drafts a tailored cover letter using the parsed resume and the job description in the requested tone.
        """
        client = self._get_client()

        tone_instructions = {
            "professional": "standard, corporate-appropriate, objective, and structured.",
            "enthusiastic": "highly passionate, energetic, showcasing strong cultural excitement.",
            "confident": "bold, highlighting top accomplishments, showing leadership ability.",
            "minimalist": "direct, brief, containing bulleted value props and clear paragraphs."
        }

        selected_tone = tone_instructions.get(tone.lower(), tone_instructions["professional"])

        system_prompt = (
            "You are an expert executive Resume Writer and Professional Career Advisor.\n"
            "Your task is to write a highly customized, 3-4 paragraph cover letter mapping the candidate's parsed resume details to the target job description.\n"
            f"The tone of the letter must be {selected_tone}\n"
            "Guidelines:\n"
            "1. Do NOT use generic introduction cliches (e.g. 'I am writing to express my interest in...'). Write a custom hook connecting candidate fits directly to company requirements.\n"
            "2. Reference actual skills and experiences from the candidate's resume.\n"
            "3. Conclude with a professional call-to-action suggestion for a follow-up conversation."
        )

        user_content = f"RESUME:\n{json.dumps(parsed_resume)}\n\nJOB DESCRIPTION:\n{job_text}"

        try:
            response = await client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_content}
                ],
                temperature=0.7
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            print(f"OpenAI generate_cover_letter error: {e}")
            return (
                f"Dear Hiring Manager,\n\n"
                f"I am writing to submit my application for the role. My background as a software engineer "
                f"includes extensive hands-on experience using {', '.join(parsed_resume.get('skills', [])[:5])}.\n\n"
                f"I look forward to discussing how my engineering skills align with your targets.\n\n"
                f"Sincerely,\n"
                f"{parsed_resume.get('personal_info', {}).get('name', 'Alex Mercer')}"
            )

    async def generate_interview_questions(self, parsed_resume: dict, job_text: str) -> list:
        """
        Generates customized interview questions and expected answers mapping target job gaps.
        """
        client = self._get_client()

        system_prompt = (
            "You are a Lead Software Engineering Manager and Technical Recruiter.\n"
            "Generate exactly 3 customized interview questions to ask the candidate, based on their resume and target job description.\n"
            "At least one question should address a technical skill gap identified between their resume and the JD.\n"
            "The output must be returned strictly in JSON format matching this schema:\n"
            "{\n"
            "  \"questions\": [\n"
            "    {\n"
            "      \"question\": \"string\",\n"
            "      \"category\": \"string (e.g. Technical, Behavioral, Skill Gap)\",\n"
            "      \"expected_answer\": \"string\"\n"
            "    }\n"
            "  ]\n"
            "}"
        )

        user_content = f"RESUME:\n{json.dumps(parsed_resume)}\n\nJOB DESCRIPTION:\n{job_text}"

        try:
            response = await client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_content}
                ],
                response_format={"type": "json_object"},
                temperature=0.4
            )
            
            result_text = response.choices[0].message.content
            parsed_json = json.loads(result_text)
            return parsed_json.get("questions", [])
        except Exception as e:
            print(f"OpenAI generate_interview_questions error: {e}")
            return [
                {
                    "question": "Can you describe your experience implementing APIs using FastAPI?",
                    "category": "Technical",
                    "expected_answer": "Discussion of routing, dependency injection, and async/await syntax."
                },
                {
                    "question": "Tell me about a time you optimized a database query.",
                    "category": "Database",
                    "expected_answer": "Explaining indexes, profiling queries, and quantifying the performance improvement."
                }
            ]

openai_service = OpenAIService()
