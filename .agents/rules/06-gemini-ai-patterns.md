---
trigger: model_decision
description: Reference when implementing AI features, integrating Gemini, analyzing content, building AI analysis pipeline, or configuring prompts
---

# 1. AI Abstraction Layer (MANDATORY)
All AI interactions go through `app/services/ai/`. This directory contains:
- `client.py` — Gemini API client singleton (wraps `google-genai`)
- `schemas.py` — Pydantic models for structured output (ThreatAnalysis, etc.)
- `prompts.py` — All system prompts and prompt templates
- `orchestrator.py` — Routes to correct analyzer by input_type
- `analyzers/` — One file per modality (text, url, image, audio, video, document)

**NEVER** import `google.genai` directly in routers or non-AI services. Always go through the abstraction layer.

# 2. Model Configuration
- **Model:** `gemini-3-flash-preview` (set via `AI_MODEL` env var)
- **Fallback:** `gemini-2.5-flash` (if 3-flash has issues)
- **API Key:** `GEMINI_API_KEY` env var
- **Concurrency:** Max 5 parallel AI calls (prevent quota exhaustion on free tier)

# 3. Structured Output Pattern (CRITICAL — Always Use This)

Every AI analysis MUST use structured output to get typed, validated responses:

```python
from google import genai
from app.services.ai.schemas import ThreatAnalysis

client = genai.Client(api_key=settings.GEMINI_API_KEY)
response = client.models.generate_content(
    model=settings.AI_MODEL,
    contents=[system_prompt, user_content],
    config=genai.types.GenerateContentConfig(
        response_mime_type="application/json",
        response_schema=ThreatAnalysis,  # Pydantic model passed directly
    ),
)
result = ThreatAnalysis.model_validate_json(response.text)
```

**Never** parse JSON from `response.text` manually. Always use Pydantic `.model_validate_json()`.

# 4. The ThreatAnalysis Schema (Core Output)
```python
class ThreatAnalysis(BaseModel):
    classification: Literal["phishing", "malware", "fraud", "espionage", "opsec_risk", "safe"]
    threat_score: int = Field(ge=0, le=100)  # 0=safe, 100=critical
    confidence: float = Field(ge=0.0, le=1.0)
    summary: str  # 2-4 sentence human-readable summary
    indicators: list[str]  # IOCs: IPs, domains, URLs, hashes, phone numbers
    mitigation_steps: list[str]  # Ordered playbook, 3-7 steps
    risk_factors: list[str]  # Specific red flags identified, 2-5 items
```

# 5. File/Media Upload Pattern
```python
# For images (inline — files < 20MB):
import base64
with open(file_path, "rb") as f:
    image_data = base64.b64encode(f.read()).decode()

content = genai.types.Part(
    inline_data=genai.types.Blob(
        mime_type=mime_type,
        data=image_data,
    )
)

# For large files (audio, video > 20MB): use Files API
uploaded_file = client.files.upload(path=file_path)
content = uploaded_file  # Pass directly in contents list
```

# 6. Async Analysis Pattern
- AI analysis is ALWAYS a background task (never blocks the HTTP response)
- Submit incident → return immediately with `status: "analyzing"` → background task runs → sets `status: "reviewed"` when done
- Frontend polls `GET /api/incidents/:id` every 2 seconds until `status != "analyzing"`
- FastAPI pattern:
```python
@router.post("/api/incidents", status_code=201)
async def create_incident(data: IncidentCreate, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    incident = await incident_service.create(data, db)
    background_tasks.add_task(ai_orchestrator.analyze, incident.id, db)
    return {"data": IncidentResponse.from_orm(incident)}
```

# 7. Prompt Engineering Rules
- System prompts are constants in `app/services/ai/prompts.py` — never inline strings in analyzers
- Always include: role context, task description, output requirements, few-shot examples where helpful
- Reference `docs/ai-integration.md` for the full prompt templates

# 8. Error Handling (CRITICAL — Never Let AI Crash the API)
```python
try:
    response = client.models.generate_content(...)
    result = ThreatAnalysis.model_validate_json(response.text)
except google.api_core.exceptions.ResourceExhausted:
    # Rate limited — retry with backoff
    await asyncio.sleep(2 ** attempt)
    continue
except google.api_core.exceptions.GoogleAPIError as e:
    # Log error, mark incident as "analysis_failed"
    logger.error(f"AI analysis failed: {e}")
    incident.status = "analysis_failed"
except ValidationError:
    # Malformed response — store raw response for debugging
    logger.warning("AI returned invalid JSON schema")
    incident.status = "analysis_failed"
```

# 9. No Vendor Names in AI-Related UI
- Loading state: "AI is analyzing your content..." (NOT "Gemini is analyzing...")
- Error state: "AI analysis is temporarily unavailable" (NOT "Gemini failed")
- Settings: "AI Configuration" (NOT "Gemini Configuration")
- See Rule 13 for the complete no-vendor-name rule.

# 10. MCP: Use Google Developer Knowledge for API Docs
When implementing Gemini features, use:
```
mcp_google-developer-knowledge_search_documents("gemini structured output python")
mcp_google-developer-knowledge_search_documents("gemini files api audio upload")
```
This fetches current, authoritative Google documentation instead of relying on potentially stale training data.
