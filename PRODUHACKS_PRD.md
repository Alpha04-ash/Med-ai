# Product Requirement Document (PRD): MyHealthAI 🩺🚀

**Project Name:** MyHealthAI  
**Target Market:** Personal Health Monitoring & Remote Triage  
**Core Technologies:** Gemini 2.0 Flash, Node.js, Next.js, WebSockets  

---

## 1. Executive Summary  
MyHealthAI is a multimodal personal "Mini-Hospital" that provides clinically grounded, real-time medical insights. By combining IoT-style telemetry (WebSockets) with state-of-the-art AI reasoning (Gemini 2.0 Flash), we bridge the gap between static health tracking and active medical consultation. Our mission is to democratize access to immediate, empathetic, and safe health triage.

## 2. The Problem Statement 🚩  
1. **Data Without Context:** Current health trackers (Apple Watch, Fitbit) provide "what" (heart rate is 110 bpm) but not "why."
2.  **High-Latency Consultation:** Traditional telemedicine is slow; AI Chatbots are often text-only and prone to "hallucinations" that are dangerous in a medical context.
3.  **Human Barrier:** Many users feel anxious about self-diagnosing or waiting hours for a human doctor for minor but concerning symptoms (e.g., skin rashes, sudden heart rate spikes).

## 3. User Personas 👥  

### Persona A: "The Health-Conscious Senior" (Arthur, 68)  
- **Need:** Constant monitoring of chronic conditions (hypertension).  
- **Pain Point:** Finds standard apps confusing and needs someone (or something) to "explain" his numbers in plain English.  

### Persona B: "The Busy Professional" (Elena, 34)  
- **Need:** Quick triage for sudden symptoms (e.g., a skin rash or fatigue).  
- **Pain Point:** Doesn't have time for a 3-hour urgent care visit but wants verified medical grounding, not just a Google search.

## 4. Key Functional Requirements ⚙️  

### FR-01: Real-Time Telemetry Streaming (The "Life Loop")  
- **Requirement:** System must ingest heart rate, SpO2, and BP via WebSockets.
- **Outcome:** Live dashboard updates with < 100ms latency.

### FR-02: Deterministic Risk Engine  
- **Requirement:** A decoupled rules engine must evaluate vitals mathematically against AHA/ADA guidelines.
- **Outcome:** 100% accuracy in risk binning (Stable/Monitor/Critical) without LLM intervention.

### FR-03: Multimodal AI Consultation (Dr. Aura)  
- **Requirement:** Integration of Gemini 2.0 Flash for Voice and Vision analysis.
- **Outcome:** Patients can "Show" a camera feed of symptoms and receive verbal consultation.

### FR-04: Clinical Grounding Layer  
- **Requirement:** AI responses must be filtered through a RAG layer grounded in verified medical documentation.
- **Outcome:** Elimination of medical hallucinations; strict adherence to safety protocol.

## 5. Technical Architecture 🏗️  

- **Frontend:** Next.js 14, Tailwind CSS v4 (Swiss-Future Aesthetic).
- **Backend:** Node.js/Express with a separate **Risk Service** for vital analysis.
- **AI Layer:** Google GenAI SDK (Gemini 2.0 Flash) for sub-2s multimodal reasoning.
- **Storage:** Prisma (PostgreSQL) for user history; Redis for active session context.

## 6. Success Metrics (KPIs) 📈  
1.  **Response Latency:** Sub-2-second turnaround for multimodal queries.
2.  **Risk Accuracy:** 100% adherence to clinical thresholds during unit testing.
3.  **User Retention:** Daily active usage for vital tracking.

## 7. Future Roadmap 🗺️  
- **Phase 1:** Integration with wearable APIs (Apple HealthKit/Google Fit).
- **Phase 2:** Multi-patient "Clinician Dashboard" for remote family monitoring.
- **Phase 3:** Automated medication reminder loop based on AI consultation.

---

*This PRD was developed for the ProduHacks 2026 Hackathon.*  
