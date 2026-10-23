# CareerForge — AI Resume Builder

A full-stack resume platform: **Laravel 12 API** (`backend/`) + **React 19 / Vite SPA** (`frontend/`).

## Features
| Module | What it does |
| --- | --- |
| Resume builder | Live A4 preview, 6 templates, accent colours, fonts, autosave, PDF export (print), AI bullet/summary/skill suggestions |
| Import | Upload PDF / DOCX / TXT → parsed into an editable resume |
| ATS checker | Upload or paste a resume → 0-100 score, 7-part breakdown, prioritised fixes (no login needed) |
| Job match | Resume vs. job description → match %, matched / missing keywords, tailoring tips |
| Cover letters | Tailored letter from your resume + job details, 4 tones, editable |
| LinkedIn optimizer | Headline options, About section, skills and a profile checklist |

All analysis runs locally with a deterministic rule-based engine. To upgrade the writing tools with a real LLM,
set `LLM_API_KEY` (any OpenAI-compatible API) in `backend/.env` — the app falls back to the built-in engine automatically.

## Run it
```powershell
# 1. Start MySQL from the XAMPP control panel (database `careerforge` is already created)

# 2. API  (http://127.0.0.1:8000)
cd C:\xampp\htdocs\careerforge\backend
php artisan serve

# 3. Frontend  (http://localhost:5173)
cd C:\xampp\htdocs\careerforge\frontend
npm run dev
```
Or double-click `start.bat` in this folder to launch both.

## Configuration
* `backend/.env` — DB credentials (`DB_*`), `LLM_API_KEY`, `LLM_BASE_URL`, `LLM_MODEL`.
* `frontend/.env` — `VITE_API_URL` (default `http://127.0.0.1:8000/api`).
* First-time setup on another machine: `composer install`, `php artisan key:generate`, `php artisan migrate`, `npm install`.

## API overview
```
POST /api/auth/register | login        GET /api/auth/me   POST /api/auth/logout
GET|POST /api/resumes   GET|PUT|DELETE /api/resumes/{id}   POST /api/resumes/{id}/duplicate   POST /api/resumes/import
POST /api/ai/ats | job-match | cover-letter | linkedin | suggest     GET /api/ai/status
GET  /api/history       DELETE /api/history/{id}
```
Auth uses Laravel Sanctum bearer tokens.

## Structure
```
backend/app/Services   AtsAnalyzer, JobMatcher, CoverLetterGenerator, LinkedInOptimizer,
                       Suggester, ResumeImporter, TextExtractor, Llm
backend/app/Support    Lexicon (verbs, skills, stop-words)
frontend/src/components/ResumeTemplates.jsx   the six resume layouts
frontend/src/pages     Landing, Builder, Dashboard, Templates, AtsChecker, JobMatch, CoverLetter, LinkedIn
```
