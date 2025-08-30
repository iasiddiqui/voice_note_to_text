# Voice Notes with AI Summarization (MERN + GenAI)

A MERN stack app to record voice notes, transcribe them (OpenAI/Gemini), edit/delete them, and generate AI-powered summaries.
Summary button is disabled once generated and re-enabled if transcript is edited.

## Tech
- Frontend: React (Vite), Hooks, Axios
- Backend: Node.js, Express
- DB: MongoDB (Mongoose)
- GenAI: OpenAI (Whisper for transcription + GPT for summary) or Google Gemini (commented alternative)
- Audio storage: Local `uploads/` folder (dev friendly)

## Quick Start

### 1) Backend
```bash
cd backend
cp .env.example .env
# Fill in values in .env (OpenAI key and Mongo URI)
npm install
npm run dev
```
Backend runs at `http://localhost:4000` by default.

### 2) Frontend
```bash
cd frontend
npm install
npm run dev
```
Vite dev server at `http://localhost:5173` by default.

### Environment (.env)
Backend `.env`:
```
PORT=4000
MONGO_URI=mongodb://127.0.0.1:27017/voice_notes_ai
OPENAI_API_KEY=sk-...
# For Gemini (optional):
# GOOGLE_VERTEX_PROJECT_ID=your-project
# GOOGLE_VERTEX_LOCATION=us-central1
# GOOGLE_APPLICATION_CREDENTIALS=/absolute/path/to/service-account.json
CLIENT_ORIGIN=http://localhost:5173
```

### Notes
- If you don't set `OPENAI_API_KEY`, the backend will create a note but return a placeholder transcript/summary so you can demo UI without external calls.
- Audio files saved under `backend/uploads`. In production, use cloud storage (S3/GCS).
- CORS is restricted via `CLIENT_ORIGIN` env.

## API (Key Routes)
- `POST /api/notes` (multipart/form-data: `audio` + optional `title`) → creates note, transcribes audio.
- `GET /api/notes` → list all notes (latest first).
- `PUT /api/notes/:id` (JSON: {title?, transcript?}) → update note. If transcript changes, summary is cleared.
- `DELETE /api/notes/:id` → delete note and audio file.
- `POST /api/notes/:id/summarize` → generate summary for the current transcript (disabled once present).

## Evaluation Mapping
- MERN Implementation → Mongoose schema + CRUD routes + React UI state.
- GenAI Usage → Whisper for STT, GPT for summary (or Gemini alternative).
- CRUD Functionality → Add/Edit/Delete/Update flows implemented.
- Logic Handling → Summary cleared on transcript edit; button disabled when summary exists.
- Code Quality → Modular controllers/services, error handling, types of responses.
- UI/UX → Clear list, inline edit, stateful buttons and toasts.

---

### Scripts
- **backend**: `npm run dev` uses `nodemon`.
- **frontend**: `npm run dev` runs Vite.
