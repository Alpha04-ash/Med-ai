# Pi Hacks Submission: MyHealthAI 🩺

## Project Information
- **Project Name:** MyHealthAI
- **Track:** Healthcare / HealthTech
- **Elevator Pitch:** A multimodal "Mini-Hospital" that sees, hears, and speaks to provide clinically grounded health insights with sub-2-second latency.

---

## Project Description

### 1. The Problem 🚩
Current healthcare technology is siloed. Fitness trackers provide raw numbers (heart rate, SpO2) without context, while AI chatbots offer text-based advice that often lacks clinical grounding or feels robotic. Patients facing symptoms like skin rashes or respiratory distress often have to wait hours for a consultation or risk "WebMD-ing" their way into a panic. There is a massive gap between **precise biometric data** and **empathetic, real-time medical guidance**.

### 2. Our Approach 🧪
We built **MyHealthAI**—a "Multimodal Life Loop" designed to bridge the gap between IoT data and clinical expertise. Our approach centers on three core pillars:

- **Multimodal Intelligence:** Using **Gemini 2.0 Flash**, our agent (Dr. Aura) doesn't just read your vitals; she can **see** symptoms via camera analysis, **hear** your cough or vocal concerns, and **speak** with human-like empathy.
- **Deterministic Safety:** We decoupled medical risk assessment from the LLM. While Gemini handles the conversation, a custom **Clinical Rules Engine** mathematically evaluates telemetry (HR, SpO2, BP) against standardized medical guidelines (AHA, ADA, GINA) to ensure 100% accuracy in risk categorization.
- **Real-Time Synergy:** By leveraging **WebSockets** for live telemetry streaming and the native multimodal capabilities of Gemini, we achieved a response latency of under 2 seconds, making the AI feel like a live, present doctor rather than a slow search engine.

### 3. How it Works ⚙️
1. **Telemetry Streaming:** The user's vitals are streamed via WebSockets to our Node.js backend.
2. **Clinical Rules Engine:** The system continuously monitors vitals, shifting the user state between *Stable*, *Monitor*, and *Critical* based on mathematical thresholds.
3. **Multimodal Consultation:** Users can upload images (Vision) for triage or talk directly (Voice) to the agent.
4. **Clinical Grounding:** The agent's responses are filtered through a RAG (Retrieval-Augmented Generation) layer grounded in verified medical datasets, ensuring all advice is evidence-based.
5. **Dossier Generation:** At the end of a session, a professional PDF Medical Dossier is generated for the user to share with their physical doctor.

---

## Technical Stack 🛠️
- **AI/ML:** Gemini 2.0 Flash (Vision/Voice), text-embedding-004
- **Backend:** Node.js, Express, WebSocket (ws), Prisma (PostgreSQL)
- **Frontend:** Next.js 14, Tailwind CSS v4, Framer Motion, Recharts
- **Infrastructure:** Google Cloud Platform (Cloud Build & Cloud Run)

---

## Impact & Usability 🌟
MyHealthAI democratizes clinical-grade monitoring. It transforms a smartphone into a diagnostic tool that can explain *why* your heart rate is high while simultaneously checking a skin condition, all while maintaining strict adherence to medical standards.

---

## Additional Materials (Encouraged) 📸
*Don't forget to attach these to your Devpost submission:*
- **Project Link:** [GitHub Repository / Deployed App URL]
- **Slide Deck:** Link to your presentation.
- **Screenshots:** Attach images of the **Dashboard**, **Visual Consult**, and **Medical Dossier**.
- **Video Demo:** 2-5 minute video showing **Dr. Aura** in action.
