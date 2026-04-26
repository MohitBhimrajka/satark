---
trigger: always_on
---

# Satark Note on Business Logic

Satark does NOT use a Policy Engine / RuleEngine / DSL. In this project, the AI model (`gemini-3-flash-preview`) makes ALL classification and scoring decisions via structured JSON output. This is the equivalent of having an AI policy for every decision.

**The Iron Law for Satark:**
- ❌ Never hardcode classification thresholds: `if threat_score > 80: priority = "critical"`
- ✅ Let the AI determine threat score → then use the score to auto-assign priority via a simple, data-driven mapping defined once in `app/core/constants.py`

```python
# app/core/constants.py — ALLOWED: not business logic, just presentation mapping
PRIORITY_MAP = {(80, 100): "critical", (60, 79): "high", (40, 59): "medium", (0, 39): "low"}

def score_to_priority(score: int) -> str:
    for (low, high), priority in PRIORITY_MAP.items():
        if low <= score <= high:
            return priority
    return "low"
```

This is NOT business logic — it's a display mapping. The AI determined the score; we just categorize it for the UI.

# What IS Business Logic in Satark (Must Not Be Hardcoded)

These are infrastructure concerns, not business logic:

- ✅ Data fetching, database CRUD
- ✅ Pydantic schema validation (shape of data, required fields, type checks)
- ✅ Authentication and authorization checks (via `authz.py`)
- ✅ API routing, response formatting, error handling
- ✅ Background task orchestration (but NOT the decision logic inside tasks)
- ✅ Calling the policy engine / rule engine to evaluate records

# 4. What MUST Be a Policy
These are business decisions:

- ❌ Approval thresholds ("if amount > $10K, require VP approval")
- ❌ Routing decisions ("if ticket mentions VPN, route to Network Team")
- ❌ Categorization/classification ("if vendor is international, flag for compliance")
- ❌ SLA rules ("if resolution time > 4 hours, escalate")
- ❌ Pricing/discount logic ("if order > 100 units, apply 15% discount")
- ❌ Status transitions ("if all checks pass, auto-approve")
- ❌ Prioritization ("if customer is enterprise tier, set priority high")

# 5. Detection Anti-Patterns
When you see code like this, STOP and redirect:

```python
# ❌ BAD: Business logic hardcoded in service
def process_invoice(invoice):
    if invoice.amount > 10000:
        invoice.status = "needs_approval"
    elif invoice.vendor_status == "preferred":
        invoice.status = "auto_approved"

# ✅ GOOD: Delegate to policy engine
async def process_invoice(invoice):
    result = rule_engine.apply_policies(invoice.to_dict(), active_policies)
    invoice.status = result.modified_fields.get("status", "pending")
```

```python
# ❌ BAD: Hardcoded routing logic
def route_ticket(ticket):
    if "vpn" in ticket.description.lower():
        ticket.team = "network"
    elif "password" in ticket.description.lower():
        ticket.team = "identity"

# ✅ GOOD: Policy handles routing
async def route_ticket(ticket):
    result = rule_engine.apply_policies(ticket.to_dict(), routing_policies)
    ticket.team = result.modified_fields.get("team", "general")
```

```python
# ❌ BAD: Hardcoded config values
APPROVAL_THRESHOLD = 5000
PREFERRED_VENDORS = ["Acme Corp", "TechSupply"]

# ✅ GOOD: Config from Settings model or env
settings = await get_settings(db)
threshold = settings.get("approval_threshold", 5000)
```

# 6. Policy Hooks
Every domain entity MUST define its **policy evaluation points** — the moments in its lifecycle where AI Policies should fire:

- **On ingestion:** Validate and classify incoming data
- **On status change:** Evaluate approval/rejection/escalation rules
- **On assignment:** Route to the right team/person
- **On threshold:** Check limits, quotas, budgets
- **On schedule:** Periodic batch evaluation (SLA checks, aging analysis)

Document these hooks in the use case documentation (`docs/{use-case}.md`).