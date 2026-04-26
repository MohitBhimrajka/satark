# Phase 3 — AI Analysis Pipeline

> **Goal:** Build the complete AI analysis engine using Gemini 3 structured output, supporting all input modalities (text, URL, image, audio, video, document).

## Duration: ~25 commits

---

## Step 3.1 — AI Service Foundation

### Tasks
- [ ] Create `app/services/ai/__init__.py`
- [ ] Create `app/services/ai/client.py`:
  - Initialize `genai.Client(api_key=settings.GEMINI_API_KEY)`
  - Singleton pattern to avoid re-initialization
  - Error handling for API failures, rate limits, safety blocks
  - Retry logic with exponential backoff

- [ ] Create `app/services/ai/schemas.py`:
  - `ThreatAnalysis` Pydantic model (matches API schema)
  - `URLScanResult` (extends ThreatAnalysis with URL-specific fields)
  - `AudioTranscription` (transcript + analysis)
  - `DocumentAnalysis` (extracted text + threat analysis)

- [ ] Create `app/services/ai/prompts.py`:
  - System prompts for each analysis type
  - Prompt templates with variable injection
  - Context-aware prompt building

### Success Criteria
- Client initializes correctly with API key
- Retry logic handles transient failures
- All Pydantic schemas match Gemini structured output format

### Commits
```
feat: add AI client singleton with retry logic
feat: add AI analysis Pydantic schemas for structured output
feat: add AI prompt templates for each analysis type
```

---

## Step 3.2 — Text Analysis

### Tasks
- [ ] Create `app/services/ai/analyzers/text.py`:
  - `analyze_text(content: str) → ThreatAnalysis`
  - Prompt: "You are a cybersecurity analyst. Analyze the following suspicious text for threats..."
  - Extracts: phishing indicators, malicious URLs, social engineering patterns, IOCs
  - Uses `response_mime_type: "application/json"` + `response_json_schema`

- [ ] Create quick-scan endpoint:
  - `POST /api/analyze/text` — accepts raw text, returns analysis

### Success Criteria
- Phishing SMS correctly classified as "phishing" with high threat score
- Normal text classified as "safe" with low threat score
- IOCs (phone numbers, URLs, email addresses) extracted from text
- Response time < 5 seconds

### Example Test Inputs
```
# Should classify as phishing
"URGENT: Your SBI account has been blocked. Click http://sbi-verify.tk/login to verify now. Ref: SBI/2026/4451"

# Should classify as safe
"Hi team, the meeting has been moved to 3 PM tomorrow. Please update your calendars."
```

### Commits
```
feat: add text analysis engine with structured output
feat: add POST /api/analyze/text quick-scan endpoint
test: add text analysis test cases (phishing vs safe)
```

---

## Step 3.3 — URL Analysis

### Tasks
- [ ] Create `app/services/ai/analyzers/url.py`:
  - `analyze_url(url: str) → ThreatAnalysis`
  - Step 1: Extract URL metadata (domain, path, query params, TLD)
  - Step 2: Check for known suspicious patterns (typosquatting, homoglyph, unusual TLDs)
  - Step 3: Send URL + metadata to Gemini for analysis
  - Extracts: domain reputation signals, redirect chains, SSL status

- [ ] Create quick-scan endpoint:
  - `POST /api/analyze/url` — accepts URL string, returns analysis

### Success Criteria
- Typosquatting URLs (e.g., `g00gle.com`) flagged as suspicious
- Known safe domains (e.g., `google.com`) classified correctly
- URL analysis includes domain breakdown

### Commits
```
feat: add URL metadata extraction utility
feat: add URL analysis engine with domain reputation
feat: add POST /api/analyze/url quick-scan endpoint
```

---

## Step 3.4 — Image Analysis

### Tasks
- [ ] Create `app/services/ai/analyzers/image.py`:
  - `analyze_image(file_path: str, mime_type: str) → ThreatAnalysis`
  - Read image bytes → send as `inline_data` to Gemini
  - Prompt: "Analyze this image for cybersecurity threats. Look for phishing pages, fake login forms, suspicious QR codes, social engineering content..."
  - Supports: PNG, JPG, WEBP, GIF

- [ ] Integrate with incident creation:
  - When `input_type == "image"`, run image analysis after upload

### Success Criteria
- Screenshot of fake bank login page → classified as phishing
- Normal photo → classified as safe
- OCR extracts text from images (URLs, phone numbers)

### Commits
```
feat: add image analysis engine with multimodal input
feat: integrate image analysis into incident pipeline
```

---

## Step 3.5 — Audio Analysis

### Tasks
- [ ] Create `app/services/ai/analyzers/audio.py`:
  - `analyze_audio(file_path: str, mime_type: str) → ThreatAnalysis`
  - Send audio to Gemini Audio Understanding API
  - Prompt: "Transcribe this audio and analyze for social engineering patterns, vishing attempts, threats, or suspicious requests..."
  - Returns: transcription + threat analysis
  - Supports: MP3, WAV, OGG, M4A, WEBM

- [ ] Integrate with incident creation:
  - When `input_type == "audio"`, run audio analysis after upload

### Success Criteria
- Vishing recording → transcribed + classified as fraud/phishing
- Normal voice note → classified as safe
- Transcription included in analysis response

### Commits
```
feat: add audio analysis engine with transcription
feat: integrate audio analysis into incident pipeline
```

---

## Step 3.6 — Video Analysis

### Tasks
- [ ] Create `app/services/ai/analyzers/video.py`:
  - `analyze_video(file_path: str, mime_type: str) → ThreatAnalysis`
  - Upload video via Gemini Files API (for larger files)
  - Prompt: "Analyze this video for cybersecurity-relevant content. Identify any suspicious activity, social engineering attempts, fake websites shown, or threat indicators..."
  - Supports: MP4, WEBM, MOV

- [ ] Integrate with incident creation:
  - When `input_type == "video"`, run video analysis after upload

### Success Criteria
- Screen recording of phishing attack → classified correctly
- Key moments identified with timestamps

### Commits
```
feat: add video analysis engine using Gemini Files API
feat: integrate video analysis into incident pipeline
```

---

## Step 3.7 — Document Analysis

### Tasks
- [ ] Create `app/services/ai/analyzers/document.py`:
  - `analyze_document(file_path: str, mime_type: str) → ThreatAnalysis`
  - Send PDF/document to Gemini Document Processing API
  - Prompt: "Analyze this document for cybersecurity threats. Check for embedded malicious content, suspicious links, social engineering, phishing forms, or data exfiltration attempts..."
  - Supports: PDF, DOCX (convert DOCX → PDF first if needed)

- [ ] Integrate with incident creation:
  - When `input_type == "document"`, run document analysis after upload

### Success Criteria
- Phishing PDF with fake form → classified correctly
- Normal document → classified as safe
- Extracted text included in analysis

### Commits
```
feat: add document analysis engine for PDF processing
feat: integrate document analysis into incident pipeline
```

---

## Step 3.8 — Analysis Orchestrator

### Tasks
- [ ] Create `app/services/ai/orchestrator.py`:
  - `analyze_incident(incident_id, db)` — async, called as background task
  - Routes to correct analyzer based on `incident.input_type`
  - Handles mixed-mode: text description + uploaded file → both analyzed, results merged
  - Updates incident `status`, `classification`, `threat_score`, `confidence`, `ai_analysis`
  - Auto-assigns priority from threat_score via `app/core/constants.py:score_to_priority()`
  - Creates AuditLog entry: `action="analyzed"`

- [ ] Create `app/core/constants.py`:
  ```python
  PRIORITY_MAP = {(80, 100): "critical", (60, 79): "high", (40, 59): "medium", (0, 39): "low"}
  def score_to_priority(score: int) -> str: ...
  ```

- [ ] **Async Polling Pattern (FastAPI BackgroundTasks):**
  ```python
  # In router: submit → return immediately, analysis in background
  @router.post("/api/incidents", status_code=201)
  async def create_incident(data, background_tasks: BackgroundTasks, db=Depends(get_db)):
      incident = await incident_service.create(data, db)
      background_tasks.add_task(analyze_incident, str(incident.id), db)
      return {"data": IncidentResponse.from_orm(incident), "message": "Incident submitted. AI analysis in progress."}
  
  # Frontend polls every 2 seconds:
  # GET /api/incidents/:id → check status field → stop when status != "analyzing"
  ```
  - See `frontend/src/hooks/usePolling.ts` pattern in `docs/satark-use-case.md`

- [ ] Create `app/core/constants.py` — priority mapping (not business logic, just a display mapping)

### Success Criteria
- HTTP response for incident creation returns in < 500ms (before analysis)
- Background task updates incident within 10-15 seconds
- Status transitions: `pending` → `analyzing` → `reviewed` (or `analysis_failed`)
- Frontend can poll and see update

### Commits
```
feat: add analysis orchestrator routing by input type
feat: add async background task for AI analysis (non-blocking)
feat: add automatic status transitions after analysis
feat: add priority auto-assignment from threat score
feat: add analysis results storage and audit logging
```

---

## Step 3.9 — Security Review of AI Code

> Note: Aikido Security MCP is not active in this project. Perform manual security review.

### Tasks
- [ ] Review `app/services/ai/client.py` — API key never logged, loaded only from `settings.GEMINI_API_KEY`
- [ ] Review `app/services/storage.py` — MIME type validation, max file size enforced (10MB images, 100MB video), no path traversal
- [ ] Review `app/security.py` — JWT secret key never hardcoded, bcrypt rounds >= 12, no timing attacks in token comparison
- [ ] Run Python's built-in security check: `pip install bandit && bandit -r app/`
- [ ] Verify no API keys appear in git history: `git log -p | grep -i 'api_key\|secret\|password'`

> **MCP to use:** `mcp_google-developer-knowledge_answer_query("Cloud Run security best practices secret manager environment variables")` for patterns on securing secrets in Cloud Run.

### Commits
```
fix: harden AI client key loading and add bandit security check
fix: enforce MIME type validation and file size limits in storage service
```

---

## Step 3.10 — AI Error Handling & Safety

### Tasks
- [ ] Handle Gemini safety blocks (content filtered)
  - Graceful fallback: mark analysis as "inconclusive"
  - Store raw error for admin review
- [ ] Handle rate limiting (429 errors)
  - Queue system or retry with backoff
- [ ] Handle API outages
  - Incident remains in "analyzing" status
  - Background retry every 5 minutes (max 3 attempts)
- [ ] Log all AI interactions for debugging

### Success Criteria
- No unhandled exceptions from AI service
- Safety blocks result in graceful degradation
- Rate limits handled with backoff

### Commits
```
feat: add AI error handling for safety blocks and rate limits
feat: add retry mechanism for failed AI analyses
```

---

## Phase 3 Output

At the end of Phase 3:
- ✅ Complete AI pipeline for all 6 input types
- ✅ Structured JSON output via Pydantic schemas
- ✅ Background async analysis
- ✅ Automatic status transitions
- ✅ Error handling and retry logic
- ✅ ~25 atomic commits
- ✅ Every analysis type testable via Swagger `/docs`
- ✅ Ready for Phase 4 (frontend)
