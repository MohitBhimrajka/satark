---
trigger: always_on
description: Never mention AI model vendor names (Gemini, GPT, Claude, etc.) in any user-facing code, UI text, logs, or error messages
---

# No AI Vendor Name Mentions

## The Rule

**NEVER** include the name of any AI model vendor in any user-facing part of the application:

- ❌ "Gemini", "Google AI", "Google Generative AI"
- ❌ "GPT", "OpenAI", "ChatGPT"
- ❌ "Claude", "Anthropic"
- ❌ Any other model name or vendor

## Where This Applies

| Location | Incorrect | Correct |
|---|---|---|
| **UI text / labels** | "Powered by Gemini" | "AI-powered" or omit entirely |
| **Loading states** | "Gemini is thinking..." | "AI is analyzing..." |
| **Error messages** | "Gemini failed to respond" | "AI service is temporarily unavailable" |
| **Audit logs** | `performed_by: "Gemini"` | `performed_by: "AI_AGENT"` |
| **Tool tips** | "Uses Gemini 2.0 Flash" | "Uses AI analysis" |
| **Code comments** | `# Call Gemini to...` | `# Call AI service to...` |
| **Console/debug logs** | `logger.info("Gemini response: ...")` | `logger.info("AI response: ...")` |
| **API responses** | `{ "model": "gemini-2.0-flash" }` | Omit model name from response |

## What IS Allowed

- ✅ Internal implementation files (`app/services/ai/gemini.py`) — this is an implementation detail
- ✅ Import statements (`from google.genai import ...`) — never exposed to users
- ✅ Config files / environment variables (`GEMINI_API_KEY`) — server-side only
- ✅ Documentation in `docs/` describing architecture — for developers only

## The Standard Terms

Use these terms consistently throughout the application:

- **In the UI:** "AI", "AI Agent", "AI Accounts Receivables Manager"
- **In audit trails:** `"AI_AGENT"` as the actor
- **In settings:** "AI Configuration", "AI Service"
- **In loading states:** "AI is analyzing...", "AI is processing...", "Generating response..."

## Why

The AI implementation is abstracted through `app/services/ai/`. Vendors may change. Users should interact with THE AI, not with a specific vendor's product. This keeps the brand identity pure and avoids vendor lock-in in the user experience.