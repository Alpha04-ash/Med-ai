# MyHealthAI: The Multimodal Mini-Hospital 🩺✨

> **Pi Hacks 2026 Submission - Healthcare Track** 🏆
> *Developed for the University of Michigan's Kappa Theta Pi Hackathon in partnership with Red Bull.*

---

## 🏆 ProduHacks 2026 Submission
This project is submitted to **ProduHacks 2026** by Kappa Theta Pi at the University of Michigan. 

- **[Product Requirement Document (PRD)](./PRODUHACKS_PRD.md):** Detailed vision, user personas, and technical requirements.
- **[Pitch Deck Content](./PRODUHACKS_PITCH.md):** Slide-by-slide strategy and business model.
- **[Submission PDF Archive](./ProduHacks_Submission.zip):** Full source and documentation archive.

---

## 🌟 Overview
MyHealthAI is a revolutionary personal healthcare platform that breaks the "text box" paradigm. It combines live medical telemetry with **Gemini 2.0 Flash** to create a seamless "See, Hear, and Speak" consultation loop for **Pi Hacks 2026**.

Unlike traditional health trackers, MyHealthAI doesn't just display data; it understands it through a **Clinically Grounded Agentic Architecture**, ensuring that every insight is backed by verified medical protocols.

### 🎥 [Demonstration Video]([Your Link Here])
### 🏗️ [Architecture Diagram](./ARCHITECTURE.md)

---

## 🌩️ Proof of Google Cloud Integration
As per the Gemini Challenge requirements (Option 2), this project demonstrates robust utilization of direct Google Cloud services and APIs:
- **Google GenAI SDK Integration:** [backend/src/agents/doctor_agent.ts](file:///Users/abubakrshokhodzhaev/Desktop/Med%20Ai/backend/src/agents/doctor_agent.ts) - Direct implementation of `@google/genai` for clinically grounded medical analysis.
- **Multimodal Vision API:** [backend/src/agents/visual_agent.ts](file:///Users/abubakrshokhodzhaev/Desktop/Med%20Ai/backend/src/agents/visual_agent.ts) - Real-time vision processing via Gemini 2.0 Flash.
- **Agent Architecture:** Our entire agentic backend is designed for deployment on **Google Cloud Run**, utilizing environment-based secret management for Gemini API keys.

---

## 🚀 Core Features
- **👁️ Vision (Visual Consult):** Upload or capture images of skin conditions, injuries, or annotated anatomy diagrams for instant AI analysis.
- **👂 Hearing & 🗣️ Speech:** Real-time voice consultation with **Dr. Aura** using human-like TTS and voice-activated controls.
- **💓 Live Telemetry:** Continuous WebSocket streaming of heart rate, SpO2, and BP with a deterministic risk engine.
- **🛡️ Clinical Grounding:** Hallucination-proof responses grounded in AHA (Heart), ADA (Diabetes), and GINA (Asthma) guidelines.
- **📑 Exportable Intelligence:** Generate professional Medical Dossiers (PDF) of your AI consultations and health trends.

---

## 🛠️ Technology Stack
- **AI Models:** Gemini 2.0 Flash (Multimodal Reasoning), text-embedding-004
- **Backend:** Node.js, Express, WebSocket (ws), Prisma (PostgreSQL)
- **Frontend:** Next.js 14, Tailwind CSS v4, Framer Motion, Lucide Icons
- **Deployment:** Google Cloud (Cloud Run), Docker
- **Safety:** Zod (Validation), Clinical Guidelines Grounding Layer

---

## 👨‍💻 Local Spin-up Instructions

### 1. Prerequisites
- Node.js v18+ 
- PostgreSQL database
- Gemini API Key ([Get one here](https://aistudio.google.com/))

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
npx prisma migrate dev
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Visit `http://localhost:3000` to start the experience.

---

## 🧪 Reproducible Testing
To verify the integrity of the medical risk engine and grounding logic, run the automated test suite:

```bash
cd backend
npm test
```

This suite validates:
- **Acuity Engine Accuracy:** Ensures vitals are correctly mapped to Stable/Monitor/Critical states.
- **Grounding Logic:** Validates the prompt injection points for clinical guidelines.

---

## 🤖 Automating Cloud Deployment (Bonus)
We have automated the containerization and deployment flow using Google Cloud Build and Cloud Run.

**Automated Deployment Script:** [deploy.sh](./deploy.sh)

To deploy the entire stack to Google Cloud in one command:
```bash
chmod +x deploy.sh
./deploy.sh
```

This script automates:
1. Enabling required Google Cloud APIs.
2. Building Docker images using Cloud Build.
3. Deploying to Cloud Run with automatic environment variable mapping.

---

## 🧬 Project Story & Findings
*Detailed in our [Project Story Submission](./ARCHITECTURE.md#project-story)*

### Findings:
1. **The Power of Flash:** Gemini 2.0 Flash provided sub-2-second latency for multimodal queries, which is essential for a medical "Live" feel.
2. **Grounding > Generativity:** In medical AI, the model's ability to stick to provided guidelines (Grounding) is more valuable than its creative reasoning.
3. **Deterministic Safety:** We found that decoupled risk scoring (using math, not LLMs) is the safest way to handle biometric data.

---

## 🛡️ Medical Disclaimer
MyHealthAI is an experimental AI project for the Gemini Hackathon. It is **not** a replacement for professional medical advice, diagnosis, or treatment. Always consult a physician for health concerns.

---
**Built with ❤️ for the Gemini Live Agent Challenge**
