# scripts/seed_demo_data.py
"""
Satark — Demo data seed script.
Creates 20 realistic incidents across all classifications, statuses, and
input types to populate the dashboard and workbench for SIH presentation.
Run via: make seed-demo
"""
import sys
from datetime import datetime, timedelta
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from scripts.seed_db import seed as seed_users

from app.core.constants import score_to_priority
from app.core.database import SessionLocal
from app.models.audit_log import AuditLog
from app.models.incident import Incident
from app.services.incident import generate_case_number

# ── 20 Demo Incidents ────────────────────────────────────────────────────────
DEMO_INCIDENTS = [
    # 1: Phishing SMS — analyzed, text
    {
        "input_type": "text",
        "input_content": "ALERT: Your SBI account has been temporarily suspended due to suspicious activity. To restore access, verify immediately: http://sbi-verify-in.tk/login?acc=9XXXX. Do not ignore or your account will be permanently blocked. - SBI Security Team",
        "description": "Suspicious SMS received by unit personnel impersonating State Bank of India.",
        "classification": "phishing", "threat_score": 85, "confidence": 0.92,
        "status": "analyzed", "days_ago": 28,
        "ai_analysis": {
            "classification": "phishing", "threat_score": 85, "confidence": 0.92,
            "summary": "Classic phishing SMS impersonating SBI with a fake .tk domain designed to harvest banking credentials. The urgency language and threat of account blocking are standard social engineering tactics targeting military personnel's financial accounts.",
            "indicators": ["sbi-verify-in.tk", ".tk TLD (free domain)", "urgency-based language", "fake SBI reference number"],
            "mitigation_steps": ["Do not click the link", "Report the SMS to your IT security cell", "Verify directly with SBI via official app or branch", "Block the sender number", "Alert other unit personnel about this campaign"],
            "risk_factors": ["Free .tk domain impersonating major bank", "Urgency and threat-based social engineering", "Targets financial credentials of defence personnel"],
        },
    },
    # 2: Phishing URL — reviewed, url
    {
        "input_type": "url",
        "input_content": "http://g00gle-docs.com/shared/document?id=army_posting_order_2026",
        "description": "URL found in WhatsApp group claiming to be Army posting order document.",
        "classification": "phishing", "threat_score": 72, "confidence": 0.85,
        "status": "reviewed", "days_ago": 26,
        "ai_analysis": {
            "classification": "phishing", "threat_score": 72, "confidence": 0.85,
            "summary": "Typosquatting domain impersonating Google Docs with homoglyph attack (0 instead of o). The URL bait references army posting orders to target military personnel curiosity.",
            "indicators": ["g00gle-docs.com (homoglyph)", "army_posting_order parameter", "non-HTTPS connection"],
            "mitigation_steps": ["Do not open the link", "Report to cyber cell", "Verify posting orders through official channels only", "Block domain at network level"],
            "risk_factors": ["Homoglyph attack on trusted brand", "Military-themed social engineering bait", "Distributed via WhatsApp group"],
        },
    },
    # 3: Phishing — escalated, image
    {
        "input_type": "image",
        "input_content": None,
        "description": "Screenshot of fake Ministry of Defence email requesting Aadhaar and service record details.",
        "classification": "phishing", "threat_score": 68, "confidence": 0.80,
        "status": "escalated", "days_ago": 24,
        "ai_analysis": {
            "classification": "phishing", "threat_score": 68, "confidence": 0.80,
            "summary": "Screenshot shows a fabricated email purporting to be from the Ministry of Defence, requesting sensitive personal information including Aadhaar number and service records. The email uses official-looking logos but contains grammatical errors and a Gmail address.",
            "indicators": ["mod.verification2026@gmail.com", "Request for Aadhaar number", "Request for service records", "Misused MoD logo"],
            "mitigation_steps": ["Do not reply to the email", "Report to unit intelligence officer", "Forward to CERT-Army for analysis", "Alert all personnel about this impersonation campaign"],
            "risk_factors": ["Government impersonation", "Requests sensitive PII from defence personnel", "Uses Gmail instead of official .gov.in domain"],
        },
    },
    # 4: Malware — analyzed, document
    {
        "input_type": "document",
        "input_content": None,
        "description": "PDF attachment from unknown sender claiming to be updated leave policy.",
        "classification": "malware", "threat_score": 92, "confidence": 0.95,
        "status": "analyzed", "days_ago": 22,
        "ai_analysis": {
            "classification": "malware", "threat_score": 92, "confidence": 0.95,
            "summary": "PDF document contains embedded JavaScript that attempts to execute a PowerShell command to download a remote payload. The document masquerades as an official leave policy update to trick recipients into opening it.",
            "indicators": ["Embedded JavaScript payload", "PowerShell download command", "C2 server: 185.234.56.78", "Hash: a1b2c3d4e5f6..."],
            "mitigation_steps": ["Quarantine the PDF immediately", "Scan all systems that opened this file", "Block C2 IP 185.234.56.78 at firewall", "Run full antivirus scan on affected machines", "Report to CERT-Army ASAP"],
            "risk_factors": ["Active malware payload with C2 communication", "Disguised as official military document", "Targets defence network infrastructure"],
        },
    },
    # 5: Malware — investigating, url
    {
        "input_type": "url",
        "input_content": "http://defence-portal-update.xyz/patch/security-update-v3.exe",
        "description": "URL distributing executable file disguised as defence portal security patch.",
        "classification": "malware", "threat_score": 88, "confidence": 0.91,
        "status": "investigating", "days_ago": 20,
        "ai_analysis": {
            "classification": "malware", "threat_score": 88, "confidence": 0.91,
            "summary": "Website hosts a malicious executable disguised as a security update for a defence portal. The domain was registered 3 days ago and uses a suspicious .xyz TLD. The executable has characteristics consistent with a remote access trojan (RAT).",
            "indicators": ["defence-portal-update.xyz", ".exe download", "Domain age: 3 days", "Suspicious .xyz TLD"],
            "mitigation_steps": ["Block the domain at network perimeter", "Scan all machines that accessed this URL", "Alert all units about fake update campaigns", "Verify updates only through official IT channels"],
            "risk_factors": ["Newly registered domain", "Executable disguised as security patch", "Targets defence IT infrastructure"],
        },
    },
    # 6: Malware — resolved, text
    {
        "input_type": "text",
        "input_content": "Sir, please install this app for secure communication with HQ: https://secure-army-chat.com/download.apk — it has end-to-end encryption approved by IT cell.",
        "description": "WhatsApp message promoting unauthorized APK for secure communication.",
        "classification": "malware", "threat_score": 55, "confidence": 0.72,
        "status": "resolved", "days_ago": 19,
        "ai_analysis": {
            "classification": "malware", "threat_score": 55, "confidence": 0.72,
            "summary": "Message promotes an unauthorized APK download claiming to be army-approved secure communication. This is likely a trojanized app designed to intercept communications and exfiltrate data from military devices.",
            "indicators": ["secure-army-chat.com", ".apk download link", "Claims fake IT cell approval"],
            "mitigation_steps": ["Do not install the APK", "Report to IT security immediately", "Use only approved communication channels", "If installed, factory reset the device"],
            "risk_factors": ["Unauthorized app distribution", "Potential data exfiltration", "Social engineering using authority claims"],
        },
    },
    # 7: Fraud — analyzed, text
    {
        "input_type": "text",
        "input_content": "Congratulations! You have been selected for the Indian Army Welfare Fund scheme. You will receive Rs 2,50,000. To claim, send your service number, Aadhaar, and bank account details to armywelfare2026@gmail.com immediately.",
        "description": "Email claiming Army Welfare Fund lottery win, requesting personal details.",
        "classification": "fraud", "threat_score": 78, "confidence": 0.88,
        "status": "analyzed", "days_ago": 17,
        "ai_analysis": {
            "classification": "fraud", "threat_score": 78, "confidence": 0.88,
            "summary": "Classic advance fee fraud impersonating the Indian Army Welfare Fund. Requests sensitive PII including service number, Aadhaar, and bank details. Uses a Gmail address instead of official .gov.in domain, which is a clear red flag.",
            "indicators": ["armywelfare2026@gmail.com", "Request for service number", "Request for bank details", "Fake lottery claim"],
            "mitigation_steps": ["Do not respond to the email", "Report to unit adjutant", "Block the sender email address", "Verify any welfare schemes through official army channels"],
            "risk_factors": ["Identity theft risk from PII collection", "Financial fraud via bank detail harvesting", "Impersonation of military welfare scheme"],
        },
    },
    # 8: Fraud — reviewed, url
    {
        "input_type": "url",
        "input_content": "https://army-canteen-discount.in/special-offer?ref=CSD2026",
        "description": "Website offering fake CSD canteen discounts requiring UPI payment upfront.",
        "classification": "fraud", "threat_score": 65, "confidence": 0.78,
        "status": "reviewed", "days_ago": 15,
        "ai_analysis": {
            "classification": "fraud", "threat_score": 65, "confidence": 0.78,
            "summary": "Fraudulent website impersonating CSD (Canteen Stores Department) offering discounts on electronics and appliances. Requires upfront UPI payment to 'reserve' items at discounted prices.",
            "indicators": ["army-canteen-discount.in", "Fake CSD branding", "UPI payment collection", "No official affiliation"],
            "mitigation_steps": ["Do not make any payments", "Report the website to cyber crime portal", "Access CSD only through official channels", "Alert unit personnel about this scam"],
            "risk_factors": ["Financial fraud via fake UPI payments", "Impersonation of military canteen system", "Targets defence personnel's trust in CSD"],
        },
    },
    # 9: Fraud — closed, text
    {
        "input_type": "text",
        "input_content": "Dear Sir/Ma'am, your PAN card will be deactivated within 24 hours due to incomplete KYC. Update your details immediately at the nearest service centre or call 1800-XXX-XXXX. Ignore at your own risk. -Income Tax Department",
        "description": "SMS impersonating Income Tax Department threatening PAN deactivation.",
        "classification": "fraud", "threat_score": 45, "confidence": 0.65,
        "status": "closed", "days_ago": 14,
        "ai_analysis": {
            "classification": "fraud", "threat_score": 45, "confidence": 0.65,
            "summary": "Generic KYC fraud SMS impersonating Income Tax Department. While not specifically targeting defence personnel, it was received by multiple unit members. Uses fear of PAN deactivation to extract personal information.",
            "indicators": ["Fake IT Department reference", "1800-XXX-XXXX toll-free scam number", "Urgency language", "Threat of deactivation"],
            "mitigation_steps": ["Ignore the message", "Verify PAN status on official IT e-filing portal", "Do not call the provided number", "Report on cybercrime.gov.in"],
            "risk_factors": ["Targets PAN card information", "Uses government impersonation", "Mass-distributed scam"],
        },
    },
    # 10: Espionage — escalated, document
    {
        "input_type": "document",
        "input_content": None,
        "description": "Document with embedded tracking pixels sent to senior officers, requesting feedback on 'defence procurement policy draft'.",
        "classification": "espionage", "threat_score": 95, "confidence": 0.97,
        "status": "escalated", "days_ago": 12,
        "ai_analysis": {
            "classification": "espionage", "threat_score": 95, "confidence": 0.97,
            "summary": "Highly sophisticated spear-phishing document targeting senior defence officers. Contains tracking pixels that beacon to a foreign IP, and the document metadata reveals authoring tools associated with known APT groups. The content references real defence procurement programs to appear legitimate.",
            "indicators": ["Tracking pixel to 103.45.67.89 (China-based IP)", "APT metadata signatures", "References to real procurement programs", "Targeted at Colonel-rank and above"],
            "mitigation_steps": ["Escalate to Military Intelligence immediately", "Isolate all systems that opened this document", "Block IP 103.45.67.89 at national level", "Conduct counter-intelligence sweep", "Brief all senior officers on this campaign"],
            "risk_factors": ["State-sponsored espionage indicators", "Targets senior military leadership", "APT-grade tradecraft detected", "National security implications"],
        },
    },
    # 11: Espionage — analyzed, image
    {
        "input_type": "image",
        "input_content": None,
        "description": "Screenshot of LinkedIn profile of suspected honey trap account connecting with defence personnel.",
        "classification": "espionage", "threat_score": 82, "confidence": 0.89,
        "status": "analyzed", "days_ago": 10,
        "ai_analysis": {
            "classification": "espionage", "threat_score": 82, "confidence": 0.89,
            "summary": "LinkedIn profile exhibits characteristics of a honey trap operation: recently created account, attractive profile photo (likely AI-generated), claims affiliation with a defence think tank, and has been systematically connecting with military officers across multiple units.",
            "indicators": ["AI-generated profile photo", "Account created 2 weeks ago", "30+ military connections in 14 days", "Fake think tank affiliation"],
            "mitigation_steps": ["Report the LinkedIn profile", "Alert all connected personnel", "Brief unit on social media OPSEC", "Verify any shared information hasn't been compromised"],
            "risk_factors": ["Social engineering via professional networking", "Systematic targeting of military personnel", "Potential intelligence collection operation"],
        },
    },
    # 12: OPSEC Risk — analyzed, audio
    {
        "input_type": "audio",
        "input_content": None,
        "description": "Audio recording of phone call where personnel discusses unit movement details on unsecured line.",
        "classification": "opsec_risk", "threat_score": 60, "confidence": 0.75,
        "status": "analyzed", "days_ago": 9,
        "ai_analysis": {
            "classification": "opsec_risk", "threat_score": 60, "confidence": 0.75,
            "summary": "Audio transcription reveals discussion of upcoming unit movement schedule on an unsecured mobile phone. While no active threat actor is involved, the conversation contains operationally sensitive information that could be intercepted.",
            "indicators": ["Unit movement dates mentioned", "Unsecured communication channel", "Personnel names disclosed", "Base location referenced"],
            "mitigation_steps": ["Counsel the personnel on communication security", "Review unit OPSEC briefing schedule", "Ensure sensitive discussions use only secure channels", "Document as OPSEC violation"],
            "risk_factors": ["Sensitive operational information on open channel", "Potential for interception", "Violation of communication security protocols"],
        },
    },
    # 13: OPSEC Risk — reviewed, text
    {
        "input_type": "text",
        "input_content": "Posted on Facebook: 'Excited about our deployment to [REDACTED] next month! Can't wait to serve the nation. #IndianArmy #ProudSoldier 🇮🇳'",
        "description": "Social media post by personnel revealing deployment information.",
        "classification": "opsec_risk", "threat_score": 48, "confidence": 0.68,
        "status": "reviewed", "days_ago": 7,
        "ai_analysis": {
            "classification": "opsec_risk", "threat_score": 48, "confidence": 0.68,
            "summary": "Social media post reveals upcoming deployment details. While partially redacted in the report, the original post contained the full location name. This is a common OPSEC violation that can reveal force movements to adversaries.",
            "indicators": ["Deployment timing disclosed", "Location partially visible", "Public Facebook post", "Hashtag makes it searchable"],
            "mitigation_steps": ["Remove the post immediately", "Counsel the personnel", "Review social media guidelines with the unit", "Monitor for any intelligence collection following this disclosure"],
            "risk_factors": ["Public disclosure of deployment information", "Searchable via hashtags", "Can be correlated with other OSINT"],
        },
    },
    # 14: OPSEC Risk — closed, video
    {
        "input_type": "video",
        "input_content": None,
        "description": "TikTok video showing inside of military facility with equipment visible in background.",
        "classification": "opsec_risk", "threat_score": 35, "confidence": 0.55,
        "status": "closed", "days_ago": 6,
        "ai_analysis": {
            "classification": "opsec_risk", "threat_score": 35, "confidence": 0.55,
            "summary": "Short video posted on social media shows the interior of a non-sensitive area of a military facility. While some standard equipment is visible, no classified systems or sensitive areas are shown. Lower risk but still violates social media policy.",
            "indicators": ["Military facility interior visible", "Standard equipment in frame", "Geotagged video post"],
            "mitigation_steps": ["Request video removal", "Review social media policy with individual", "Ensure no classified areas were captured", "Log as minor OPSEC violation"],
            "risk_factors": ["Military facility imagery on public platform", "Geolocation data in video metadata", "Sets precedent for more serious violations"],
        },
    },
    # 15: Safe — analyzed, url
    {
        "input_type": "url",
        "input_content": "https://mod.gov.in/dod/sites/default/files/Annual_Report_2025-26.pdf",
        "description": "URL reported as suspicious but appears to be official MoD website.",
        "classification": "safe", "threat_score": 12, "confidence": 0.90,
        "status": "analyzed", "days_ago": 5,
        "ai_analysis": {
            "classification": "safe", "threat_score": 12, "confidence": 0.90,
            "summary": "This URL points to the official Ministry of Defence website (mod.gov.in) hosting the annual report PDF. The domain is legitimate, uses HTTPS, and the document path is consistent with official government document hosting patterns.",
            "indicators": ["mod.gov.in (official domain)", "HTTPS enabled", "Standard government PDF path"],
            "mitigation_steps": ["No action required", "URL is safe to access", "Always verify .gov.in domains for official content"],
            "risk_factors": [],
        },
    },
    # 16: Safe — closed, text
    {
        "input_type": "text",
        "input_content": "Reminder: PT parade tomorrow at 0600 hours at the main ground. All personnel to carry service ID. - Unit Adjutant",
        "description": "Routine unit message reported by overly cautious personnel.",
        "classification": "safe", "threat_score": 8, "confidence": 0.95,
        "status": "closed", "days_ago": 4,
        "ai_analysis": {
            "classification": "safe", "threat_score": 8, "confidence": 0.95,
            "summary": "Standard military administrative message about physical training parade. Contains no suspicious links, requests, or social engineering indicators. This is a routine unit communication.",
            "indicators": [],
            "mitigation_steps": ["No action required", "Message is a routine military communication"],
            "risk_factors": [],
        },
    },
    # 17: Phishing — submitted, url (no analysis yet)
    {
        "input_type": "url",
        "input_content": "http://army-epay-portal.in/login?next=/payslip",
        "description": "Suspected fake army e-pay portal sent via SMS to multiple personnel.",
        "classification": None, "threat_score": None, "confidence": None,
        "status": "submitted", "days_ago": 3,
        "ai_analysis": None,
    },
    # 18: Malware — analyzing, document (in progress)
    {
        "input_type": "document",
        "input_content": None,
        "description": "Suspicious Word document with macro warning, received as email attachment.",
        "classification": None, "threat_score": None, "confidence": None,
        "status": "analyzing", "days_ago": 2,
        "ai_analysis": None,
    },
    # 19: Fraud — analysis_failed, text
    {
        "input_type": "text",
        "input_content": "Dear valued customer, you have won Rs 10 Lakhs in Flipkart Lucky Draw 2026. Click here to claim: bit.ly/fk-prize-2026",
        "description": "Generic lottery scam forwarded by unit member.",
        "classification": None, "threat_score": None, "confidence": None,
        "status": "analysis_failed", "days_ago": 1,
        "ai_analysis": None,
    },
    # 20: Espionage — analyzed, text
    {
        "input_type": "text",
        "input_content": "Hello Major, I am a researcher from [REDACTED] University studying India's border infrastructure for my PhD thesis. Would you be willing to participate in an anonymous interview? I can offer a consultation fee. Please reply to this email or WhatsApp +91-98XXX-XXXXX.",
        "description": "Suspicious email to officer requesting interview about border infrastructure.",
        "classification": "espionage", "threat_score": 88, "confidence": 0.94,
        "status": "analyzed", "days_ago": 0,
        "ai_analysis": {
            "classification": "espionage", "threat_score": 88, "confidence": 0.94,
            "summary": "Suspected intelligence elicitation attempt disguised as academic research. The email targets a specific officer by rank, requests information about border infrastructure, and offers financial incentive. This pattern is consistent with known foreign intelligence collection methodologies.",
            "indicators": ["Targets specific military rank", "Border infrastructure focus", "Financial incentive offered", "Personal WhatsApp contact provided"],
            "mitigation_steps": ["Do not respond", "Report to Military Intelligence branch", "Preserve the email as evidence", "Conduct background check on the sender", "Brief all officers on elicitation tactics"],
            "risk_factors": ["Targeted intelligence elicitation", "Focuses on sensitive border infrastructure", "Financial incentive as recruitment method", "Consistent with foreign intel tradecraft"],
        },
    },
]


def seed_demo():
    """Seed the database with 20 realistic demo incidents."""
    seed_users()

    db = SessionLocal()
    try:
        # Idempotency: skip if demo data already exists
        existing_count = db.query(Incident).count()
        if existing_count > 2:
            print(f"\n  [SKIP] {existing_count} incidents already exist. "
                  "Delete them first to re-seed.")
            return

        now = datetime.utcnow()

        for i, data in enumerate(DEMO_INCIDENTS, 1):
            case_number = generate_case_number(db)
            days_ago = data["days_ago"]
            created_at = now - timedelta(days=days_ago)
            priority = (
                score_to_priority(data["threat_score"])
                if data["threat_score"] is not None
                else None
            )

            incident = Incident(
                case_number=case_number,
                input_type=data["input_type"],
                input_content=data["input_content"],
                description=data["description"],
                status=data["status"],
                priority=priority,
                classification=data["classification"],
                threat_score=data["threat_score"],
                confidence=data["confidence"],
                ai_analysis=data["ai_analysis"],
                created_at=created_at,
            )
            db.add(incident)
            db.flush()

            # Audit log: incident created
            db.add(AuditLog(
                incident_id=incident.id,
                actor_label="GUEST",
                action="created",
                details={"input_type": data["input_type"]},
                created_at=created_at,
            ))

            # Audit log: analysis complete (for analyzed incidents)
            if data["ai_analysis"] is not None:
                db.add(AuditLog(
                    incident_id=incident.id,
                    actor_label="AI_AGENT",
                    action="analyzed",
                    details={"threat_score": data["threat_score"]},
                    created_at=created_at + timedelta(seconds=15),
                ))

            status_icon = {
                "analyzed": "✅", "reviewed": "👁", "escalated": "🔺",
                "investigating": "🔍", "resolved": "✔", "closed": "🔒",
                "submitted": "📥", "analyzing": "⏳", "analysis_failed": "❌",
            }
            icon = status_icon.get(data["status"], "•")
            cls = data["classification"] or "pending"
            print(f"  {icon} [{i:02d}] {case_number} | {cls:<12} | {data['status']:<17} | {data['input_type']}")

        db.commit()
        print(f"\n  ✅ Seeded {len(DEMO_INCIDENTS)} demo incidents successfully.")

    finally:
        db.close()


if __name__ == "__main__":
    seed_demo()
