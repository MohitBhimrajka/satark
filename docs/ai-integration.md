# Satark — AI Integration Guide

> All AI prompt templates, schemas, and integration patterns for the Gemini 3 analysis pipeline.
> Reference: `app/services/ai/prompts.py` and `app/services/ai/schemas.py`

---

## Core Output Schema

Every analysis call returns a `ThreatAnalysis`:

```python
# app/services/ai/schemas.py
from pydantic import BaseModel, Field
from typing import Literal

class ThreatAnalysis(BaseModel):
    """Structured output for all Satark AI analyses."""
    
    classification: Literal[
        "phishing",    # Attempting to steal credentials or personal info
        "malware",     # Contains or links to malicious software
        "fraud",       # Financial deception or scam
        "espionage",   # State-level intelligence gathering attempt
        "opsec_risk",  # Operational security risk (no active threat, but data exposure)
        "safe",        # No threat detected
    ]
    threat_score: int = Field(ge=0, le=100, description="0=completely safe, 100=critical threat")
    confidence: float = Field(ge=0.0, le=1.0, description="Model confidence in classification")
    summary: str = Field(description="2-4 sentence summary of what was found and why it's concerning")
    indicators: list[str] = Field(description="Extracted IOCs: suspicious URLs, IPs, domains, phone numbers, hashes, email addresses")
    mitigation_steps: list[str] = Field(description="Ordered playbook of 3-7 actionable mitigation steps")
    risk_factors: list[str] = Field(description="2-5 specific red flags that drove the classification")
```

---

## System Prompt (Base — All Analyzers Share This)

```python
# app/services/ai/prompts.py

SYSTEM_PROMPT_BASE = """You are a senior cybersecurity analyst working for CERT-Army (India's defence cyber response team). Your role is to analyze submitted digital content for cybersecurity threats, with particular attention to threats relevant to Indian defence personnel.

You are highly experienced with:
- Phishing and social engineering attacks targeting military personnel
- Malware distribution via messaging apps and email
- Financial fraud scams targeting defence employees
- State-sponsored espionage campaigns
- Operational security (OPSEC) risks from accidental data disclosure

Always respond in structured JSON format. Be precise and conservative — if uncertain, lean toward flagging (higher threat_score) rather than marking as safe.

Indian context to watch for:
- Fake UPI payment scams
- Fake government/ministry impersonation
- Suspicious shortened URLs (bit.ly, t.co, etc.)
- Messages asking for OTP, passwords, or sensitive information
- Documents requesting Aadhaar, PAN, or service record details
"""
```

---

## Prompt Templates by Input Type

### 1. Text Analysis

```python
TEXT_ANALYSIS_PROMPT = """
{base}

Analyze the following suspicious text message or communication:

---
{content}
---

Identify:
1. Is this attempting to deceive the recipient? How?
2. What is the likely threat category (phishing, fraud, malware link, etc.)?
3. What specific indicators make this suspicious?
4. What should the recipient do immediately?

Provide your analysis as structured JSON matching the ThreatAnalysis schema.
"""
```

**Example Inputs / Expected Outputs:**

```
Input: "URGENT: Your SBI account has been blocked due to suspicious activity. Click http://sbi-verify-in.tk/login to verify your credentials immediately. Ref: SBI/CERT/2026"
Expected: classification=phishing, threat_score=95, indicators=["sbi-verify-in.tk", ".tk domain"]
```

```
Input: "Hi, the unit meeting tomorrow is postponed to 1500 hours. Please inform all personnel."
Expected: classification=safe, threat_score=5
```

---

### 2. URL Analysis

```python
URL_ANALYSIS_PROMPT = """
{base}

Analyze the following URL that was reported as suspicious:

URL: {url}
Domain: {domain}
TLD: {tld}
Path: {path}
Has HTTPS: {has_https}
URL Length: {url_length} characters

Additional signals:
- Domain age (if available): {domain_age}
- Is URL shortened: {is_shortened}
- Contains IP address: {has_ip}
- Has unusual characters (homoglyphs, excessive hyphens): {has_unusual_chars}

Based on the URL structure and these signals, assess the threat level.
Consider: typosquatting, homoglyph attacks, suspicious TLDs (.tk, .ml, .ga), excessive subdomain depth, URL shorteners masking destinations.

Provide your analysis as structured JSON matching the ThreatAnalysis schema.
"""
```

**Example Inputs:**
```
URL: http://g00gle.com/verify → threat_score=85 (homoglyph attack)
URL: http://sbi.in.verify-user.tk/login → threat_score=92 (typosquatting + .tk)
URL: https://google.com → threat_score=5 (known safe domain)
```

---

### 3. Image Analysis

```python
IMAGE_ANALYSIS_PROMPT = """
{base}

Analyze the following image that was submitted as potential evidence of a cyber threat.

Look for:
1. Phishing pages: fake login forms, fake bank/government websites, fake OTP pages
2. Suspicious QR codes or barcodes
3. Social engineering content: fake prize claims, fake warnings, fake government notices
4. Screenshots of suspicious conversations (WhatsApp, SMS, email)
5. Any text containing URLs, phone numbers, or financial requests
6. Fake logos or impersonation of official organizations

Use your OCR capabilities to extract any visible text and analyze it for threats.
Flag if any official logos (SBI, HDFC, government ministries, DRDO, Army) appear to be misused.

Provide your analysis as structured JSON matching the ThreatAnalysis schema.
Include extracted text snippets and any visible URLs in the `indicators` field.
"""
```

---

### 4. Audio Analysis

```python
AUDIO_ANALYSIS_PROMPT = """
{base}

Analyze the following audio recording submitted as potential evidence of a cyber/social engineering threat.

First, transcribe the audio completely. Then analyze the transcript for:
1. Vishing (voice phishing): calls impersonating banks, government, military officials
2. Requests for OTP, passwords, or sensitive information
3. Fake emergency scenarios to create panic and prompt hasty action
4. Threats or coercion
5. Background indicators: scripted call center noise, unusual accents, robotic voice

In your response:
- Include the full transcription in the `summary` field
- List any phone numbers, websites, or names mentioned as `indicators`
- Set `threat_score` based on the severity of the social engineering attempt

Provide your analysis as structured JSON matching the ThreatAnalysis schema.
"""
```

---

### 5. Video Analysis

```python
VIDEO_ANALYSIS_PROMPT = """
{base}

Analyze the following video submitted as potential evidence of a cyber threat.

Examine the entire video and look for:
1. Screen recordings showing phishing attacks in progress
2. Fake news or disinformation with deepfake indicators
3. Social engineering demonstrations
4. Malware installation processes being shown
5. Any on-screen text containing URLs, phone numbers, or suspicious instructions
6. Suspicious websites or applications being demonstrated

Summarize key moments, extract all visible text as indicators, and assess the threat.

Provide your analysis as structured JSON matching the ThreatAnalysis schema.
"""
```

---

### 6. Document Analysis

```python
DOCUMENT_ANALYSIS_PROMPT = """
{base}

Analyze the following document submitted as potential evidence of a cyber threat.

Examine the full document content and look for:
1. Phishing documents: fake government letters, fake bank statements, fake official notices
2. Embedded malicious links or macro-enabled content indicators
3. Social engineering content: fake prize claims, fake legal notices, fake job offers
4. Requests for sensitive information (Aadhaar, PAN, service records, bank details)
5. Impersonation of official organizations (Government of India, RBI, Ministry of Defence)
6. Unusual metadata or embedded scripts

Extract all URLs, phone numbers, email addresses, and official registration numbers as indicators.
Verify if any claimed official document numbers appear legitimate.

Provide your analysis as structured JSON matching the ThreatAnalysis schema.
"""
```

---

## Client Implementation Pattern

### Standard Structured Output (all analyzers)

```python
# app/services/ai/client.py — generate_structured()
response_json = await generate_structured(
    contents=[prompt_text, optional_file_part],
    response_schema=ThreatAnalysis,  # Pydantic model passed directly
)
result = ThreatAnalysis.model_validate_json(response_json)
```

Features: singleton client, exponential backoff on 429, `asyncio.Semaphore(5)`.

### Grounded Analysis (URL analyzer — Google Search + URL Context)

```python
# app/services/ai/client.py — generate_grounded()
# Gemini 3 supports combining structured output with built-in tools.
# Uses response_json_schema (dict) instead of response_schema (class).
response_json = await generate_grounded(
    contents=[prompt_text],
    response_schema_class=ThreatAnalysis,  # We extract .model_json_schema()
    use_google_search=True,   # Real-time threat intel lookup
    use_url_context=True,     # Visit and analyze the actual URL content
)
result = ThreatAnalysis.model_validate_json(response_json)
```

The URL analyzer uses this to check if domains are known-malicious in real-time
and inspect what's actually on the page. Falls back to standard structured
output if grounding fails.

---

## Sample Demo Data (for "Try It Now" section)

```json
// frontend/src/data/demo-samples.json
{
  "texts": [
    {
      "label": "Phishing SMS",
      "content": "ALERT: Your HDFC Bank account has been temporarily suspended. To restore access, verify immediately: http://hdfc-secure.tk/verify?acc=9XXXX. Do not ignore or your account will be permanently blocked. - HDFC Security Team"
    },
    {
      "label": "Suspicious WhatsApp",
      "content": "Congratulations! You have been selected for the Indian Army Welfare Fund scheme. You will receive Rs 2,50,000. To claim, send your service number, Aadhaar, and bank account details to armywelfare2026@gmail.com"
    },
    {
      "label": "Safe Message",
      "content": "Reminder: PT parade tomorrow at 0600 hours at the main ground. All personnel to carry service ID. - Unit Adjutant"
    }
  ],
  "urls": [
    { "label": "Phishing URL", "url": "http://sbi-banking-secure.tk/login?ref=army" },
    { "label": "Typosquatting", "url": "http://g00gle-docs.com/shared/document?id=army123" },
    { "label": "Safe URL", "url": "https://mod.gov.in" }
  ]
}
```
