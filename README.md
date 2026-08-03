# AI Resume & Interview Copilot 🤖

[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=flat&logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react)](https://reactjs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=flat&logo=mongodb)](https://www.mongodb.com)
[![OpenAI](https://img.shields.io/badge/OpenAI-412991?style=flat&logo=openai)](https://openai.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com)

An MVP-grade, single-user **AI Resume Assistant & Interview Copilot** designed to help job seekers bypass Applicant Tracking System (ATS) filtering and prepare for technical interviews. 

By analyzing the semantic alignment between a candidate's resume (PDF) and a target Job Description (JD), the Copilot estimates match probability, highlights missing keywords, refactors resume bullet points using quantitative frameworks, drafts customized cover letters, and generates practice questions targeting resume skill shortages.

---

## 🎨 User Interface Preview

### Home Dashboard
*Hero section with drag-and-drop resume PDF uploader and job description input.*
![Home Screen Mockup](https://raw.githubusercontent.com/username/project/main/screenshots/home.png)

### Results Panel
*ATS compatibility scoring, skills audit checklist, cover letter drawer, and interview prep guides.*
![Results Screen Mockup](https://raw.githubusercontent.com/username/project/main/screenshots/results.png)

---

## 🚀 Key Features

* **Resume PDF Parser**: Extracts text layouts from multi-column PDFs using `pdfplumber`, parsing personal metadata, educational credentials, and employment history.
* **Deterministic ATS Scoring**: Evaluates resume compatibility against a Job Description using a local weighted algorithm:
  * *Skill Keyword Match* (60% weight)
  * *Experience & Seniority Duration* (25% weight)
  * *Resume Formatting Completeness* (15% weight)
* **OpenAI Integration (GPT-4o-mini)**:
  * **Resume Suggestions**: Analyzes CV text against target jobs, generating 3 strengths, 3 weaknesses, and 3 actionable improvement suggestions.
  * **Cover Letter Drafts**: Drafts personalized letters matching candidate skills to the JD, with support for multiple tones (*Professional*, *Enthusiastic*, *Confident*, *Minimalist*).
  * **Target Assessment Q&A**: Generates tailored interview questions targeting gaps in the candidate's resume.
* **Modern SaaS Design**: Designed with a clean, dark-mode user interface inspired by Notion, Stripe, and Linear.

---

## 🛠️ Tech Stack

### Frontend
* **Core**: React.js with TypeScript & Vite
* **State Coordination**: Zustand (Stateless client store)
* **Styling**: Tailwind CSS with custom radial gradients
* **HTTP Client**: Axios (unified API request handling)
* **Icons**: Lucide React

### Backend
* **API Engine**: FastAPI (Python 3.11+)
* **Database Session**: MongoDB (via `motor` asynchronous MongoDB driver)
* **Document Extraction**: `pdfplumber`
* **AI Orchestration**: OpenAI Python SDK (GPT-4o-mini)

---

## 📐 System Architecture

The project runs as a decoupled client-server architecture with MongoDB storing parsed resumes, matches, cover letters, and interview questions.

```mermaid
graph TD
    User["Job Seeker (Browser)"]
    
    subgraph Client ["Client Tier (Vite + React)"]
        SPA["React SPA (Zustand Store)"]
    end
    
    subgraph Backend ["Application Tier (FastAPI)"]
        ApiServer["FastAPI Web Server"]
        Parser["Resume Parser Service (pdfplumber)"]
        ATS["ATS Matcher Engine"]
        AIOrc["OpenAI Client Service"]
    end
    
    subgraph Database ["Data Tier"]
        MongoDB[("MongoDB Database")]
    end
    
    subgraph External ["AI Providers"]
        OpenAI["OpenAI API (GPT-4o-mini)"]
    end

    User -->|HTTPS| SPA
    SPA -->|REST API (Axios)| ApiServer
    ApiServer -->|Read/Write Documents| MongoDB
    ApiServer -->|Extract PDF Text| Parser
    ApiServer -->|Calculate Scores| ATS
    ApiServer -->|Request Generations| AIOrc
    AIOrc -->|Asynchronous SDK Calls| OpenAI
```

---

## 💻 Installation & Local Setup

### Prerequisites
* Python 3.10+
* Node.js v16+
* MongoDB running locally (`mongodb://localhost:27017`)
* OpenAI API Key

### 1. Backend Setup

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   # On Windows (Command Prompt):
   venv\Scripts\activate
   # On Windows (PowerShell):
   .\venv\Scripts\Activate.ps1
   # On macOS/Linux:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Copy the environment configuration and add your OpenAI API Key:
   ```bash
   copy .env.example .env
   ```
   Edit `.env` and set your variables:
   ```env
   MONGODB_URI=mongodb://localhost:27017
   DATABASE_NAME=ai_resume_copilot
   OPENAI_API_KEY=sk-proj-YOUR_API_KEY_HERE
   ```
5. Run the server:
   ```bash
   uvicorn app.main:app --reload
   ```
   The backend API will be available at `http://localhost:8000`. You can inspect the interactive OpenAPI documentation at `http://localhost:8000/docs`.

### 2. Frontend Setup

1. Navigate to the `frontend` directory:
   ```bash
   cd ../frontend
   ```
2. Install package dependencies:
   ```bash
   npm install
   ```
3. Boot up the Vite development server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser to view the application.

---

## 🚀 Future Roadmap & Scaling Improvements

While this MVP is optimized as a single-user portfolio project, the following improvements are planned for a production release:

- [ ] **Dual-Token Authentication**: Secure endpoints using JWT bearer tokens and HTTPS-only refresh cookies.
- [ ] **Background Task Queue**: Integrate Celery and Redis to handle PDF parsing and heavy OpenAI completions, preventing HTTP request timeouts.
- [ ] **Object Storage Integration**: Stream uploaded PDF files directly to AWS S3 buckets rather than maintaining local database byte arrays.
- [ ] **Interactive Bullet Point Refactor**: Add an interactive tool mapping resume bullet points to the Google XYZ formula (`Accomplished [X] as measured by [Y], by doing [Z]`).
- [ ] **Document Export**: Enable printing/downloading generated Cover Letters and resume revisions in PDF/Docx format.
- [ ] **Vector Similarity Scoring**: Enhance the local ATS matcher by using OpenAI Embedding vectors to compute cosine similarities.
