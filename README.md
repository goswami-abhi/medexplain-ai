# MediExplain AI

AI-powered medical report analyzer that uses OCR and LLMs to extract, simplify, and explain healthcare reports in plain human language.

Upload PDFs or images of lab results, prescriptions, and scans — get OCR extraction, AI explanations, highlighted values, and downloadable summaries.

## Features

- **Medical report upload** — drag-and-drop PDFs and images with file preview
- **OCR text extraction** — Tesseract for images; PDF text + OCR fallback for scans
- **AI explainer** — Groq (default), Gemini, or OpenAI rewrites clinical language into everyday terms
- **Value highlights** — normal / borderline / abnormal badges and summary cards
- **Health dashboard** — reports, activity, and quick insights
- **Download summary** — PDF export of AI-generated health summary

## Tech stack

| Layer      | Technology                          |
|-----------|--------------------------------------|
| Frontend  | React, TypeScript, Tailwind CSS, Vite |
| Backend   | FastAPI, Python 3.11+                |
| Database  | SQLite (async via SQLAlchemy)        |
| OCR       | Tesseract, pypdf, pdf2image          |
| AI        | Groq, Google Gemini, or OpenAI       |

## Project structure

```
medexplain-ai/
├── frontend/          # React app
│   └── src/
│       ├── api/
│       ├── components/
│       ├── pages/
│       └── types/
├── backend/
│   ├── app/
│   │   ├── ai/        # OCR + explainer
│   │   ├── api/routes/
│   │   ├── models/
│   │   ├── schemas/
│   │   └── services/
│   └── uploads/
└── README.md
```

## Prerequisites

1. **Node.js** 18+ and **Python** 3.11+
2. **Tesseract OCR** installed on your system:
   - Windows: [UB Mannheim Tesseract](https://github.com/UB-Mannheim/tesseract/wiki) — add to PATH
   - macOS: `brew install tesseract`
   - Linux: `sudo apt install tesseract-ocr`
3. **(Optional)** Poppler for scanned PDF OCR: [poppler releases](https://github.com/oschwartz10612/poppler-windows/releases/) on Windows
4. **Groq API key** (recommended): [Groq Console](https://console.groq.com/keys)

## Setup

### Backend

```bash
cd backend
python -m venv venv
# Windows
venv\Scripts\activate
# macOS/Linux
# source venv/bin/activate

pip install -r requirements.txt
copy .env.example .env   # Windows
# cp .env.example .env   # macOS/Linux
# Edit .env and set GROQ_API_KEY=your_key

python run.py
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173**. The Vite dev server proxies `/api` to the backend.

## Environment variables

| Variable         | Description                          |
|-----------------|--------------------------------------|
| `GROQ_API_KEY`  | Groq API key (default provider)      |
| `GROQ_MODEL`    | e.g. `llama-3.3-70b-versatile`       |
| `GEMINI_API_KEY`| Optional Google Gemini key           |
| `OPENAI_API_KEY`| Optional OpenAI key                  |
| `AI_PROVIDER`   | `groq` (default), `gemini`, `openai` |
| `DATABASE_URL`  | Default SQLite in `./data/`          |
| `UPLOAD_DIR`    | File storage path                    |
| `CORS_ORIGINS`  | Frontend origin(s)                   |

Without an API key, uploads still work: OCR runs and a fallback message explains how to enable AI.

## API overview

| Method | Endpoint                    | Description              |
|--------|----------------------------|--------------------------|
| GET    | `/api/health`              | Health check             |
| POST   | `/api/reports/upload`      | Upload & process report  |
| GET    | `/api/reports`             | List reports             |
| GET    | `/api/reports/dashboard`   | Dashboard stats          |
| GET    | `/api/reports/{id}`        | Report detail            |
| GET    | `/api/reports/{id}/download` | PDF summary download |
| POST   | `/api/reports/{id}/reprocess` | Re-run AI analysis   |
| DELETE | `/api/reports/{id}`        | Delete report            |

## Disclaimer

MediExplain AI is for educational and portfolio purposes. It does not provide medical diagnosis or treatment. Always consult a qualified healthcare professional about your health.
