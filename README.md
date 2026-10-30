# CivicAI – From Complaints to Action

> **An AI-powered civic complaint management platform that transforms scattered citizen complaints into prioritized, explainable, trackable actions for local authorities.**

Built for Smart City governance and hackathon demonstration, **CivicAI** bridges the gap between frustrated citizens and busy municipal departments. Rather than funneling reports into opaque queues, CivicAI leverages Google's **Gemini 3.8 Flash** model along with deterministic geospatial algorithms to triage incoming issues, score severity with human-readable explanations, cluster geographic hotspots, and detect duplicate reports—all while keeping humans in the loop for critical safety decisions.

---

## 🏛️ Key Features

### 1. Citizen Portal
- **One-Touch Complaint Submission**: Mobile-friendly form allowing citizens to describe the problem, specify or pick location on an interactive Leaflet map, choose presets, or upload photographic evidence.
- **Immediate Post-Submission AI Breakdown**: Returns unique Complaint ID (e.g. `CIVIC-2026-1005`), detected category, priority score, AI summary, and duplicate notices.
- **Public Complaint Tracking**: Citizens can enter their Complaint ID to view live progress through a 5-stage lifecycle (**Submitted → Under Review → Assigned → In Progress → Resolved**), official notes, and timestamps—with strict privacy controls protecting citizen personal information.

### 2. AI Intelligence Engine (Gemini 3.8 Flash)
- **Automatic Category Detection**: Analyzes natural language descriptions and maps them into 8 standard municipal domains (*Road Damage, Waterlogging, Garbage, Streetlight, Drainage, Water Supply, Public Safety, Other*).
- **Executive Summarization**: Distills citizen descriptions into crisp 1-2 sentence briefs for field crews.
- **Geospatial & Semantic Duplicate Detection**: Cross-references new submissions with existing neighborhood records using Haversine distance calculations and token similarity. Flags duplicate candidate pairs with similarity scores without silently deleting reports.
- **Explainable Priority Scoring (0–100)**: Ranks complaints into *Critical, High, Medium, or Low* based on public hazard cues, affected population, and duration.
- **Human-in-the-Loop Safety Safeguard**: Life-threatening safety hazards (e.g., live sparking wires, collapsed sewer shafts, blocked hospital routes) are highlighted in high-contrast red alerts requiring official human review before resolution.
- **Municipal Action Briefs**: Formulates recommended interventions and suggests the appropriate department (*Public Works, Sanitation & Solid Waste, Traffic & Road Safety, Water & Drainage Board, Electricity & Lighting, etc.*).

### 3. Administrative Smart City Operations Center
- **Executive KPI Dashboard**: Live counts of Total, Pending, In Progress, Resolved, and Critical emergencies.
- **Repository Table**: Filter, search, and sort 42+ records by category, priority, status, or district.
- **Complaint Inspection Drawer**: Change statuses, reassign departments, record official remarks, and confirm or reject duplicate suggestions.
- **Interactive Smart City Map**: Leaflet & OpenStreetMap visualization displaying priority-colored pins (Critical Red with pulse, High Amber, Medium Yellow, Low Green) with popup cards and inspect shortcuts.
- **Hotspot Detection View**: Algorithmic clustering identifying recurring municipal distress points (e.g. Downtown Market Square waste clusters, Northridge Boulevard waterlogging, Oakwood dark street spots).
- **Analytics & AI Insights Generator**: Dynamic charts plus on-demand synthesis using Gemini to produce an executive municipal strategy report.
- **Department Capacity Management**: SLA tracking and crew allocation across 7 municipal departments.

---

## 🏗️ Architecture & Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend Framework** | React 19 (TypeScript) | Fast, modular component hierarchy |
| **Styling** | Tailwind CSS v4 & Plus Jakarta Sans | Modern Smart City design system (Navy `#0f172a` + Teal accents) |
| **Maps & Geospatial** | Leaflet 1.9.4 & OpenStreetMap | Interactive location picker, pin clustering, and hotspot rings |
| **AI Intelligence** | `@google/genai` (Gemini 3.8 Flash) | Category detection, summarization, priority scoring, action briefs |
| **Backend & Routing** | Express.js & Vite 8 middleware | Full-stack server proxying Gemini API and serving SPA |
| **Data Persistence** | Local Demo Storage Engine | Deterministic demo persistence across refreshes with 42+ synthetic complaints |

---

## 🧠 AI Implementation Explanation

CivicAI employs a hybrid **AI + Deterministic Math** architecture:

1. **Deterministic Geospatial Math (Haversine Formula)**:
   - Accurately measures physical distance in meters between any two coordinates.
   - Hotspot clustering groups complaints within an 800-meter radius, calculating cluster centroids, dominant categories, and issue frequencies without relying on black-box heuristics.

2. **Server-Side Gemini 3.8 Flash Integration**:
   - Calls to Gemini are securely handled on the Express backend (`server.ts`) via the `@google/genai` SDK using `gemini-3.8-flash`.
   - The API key is stored in environment variables (`GEMINI_API_KEY`) and never exposed to the client browser.
   - Structured JSON output schemas ensure reliable parsing of category, priority level, score, and action briefs.

3. **Graceful Heuristic Fallback Engine**:
   - If `GEMINI_API_KEY` is not configured or network timeouts occur, the server immediately switches to a local heuristic scoring and tokenization engine. This ensures the demo never breaks or crashes during evaluations.

---

## 🚀 Setup and Execution Instructions

### Prerequisites
- Node.js (version 20 or higher)
- npm or yarn

### Installation & Run
1. **Clone the repository and install dependencies**:
   ```bash
   npm install
   ```

2. **Environment Configuration**:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Add your Gemini API key (optional; demo mode works automatically):
   ```env
   GEMINI_API_KEY="your-gemini-api-key"
   ```

3. **Start the Application**:
   ```bash
   npm run dev
   ```
   The application runs on `http://localhost:3000`.

4. **Run Automated Unit Tests**:
   To test the geospatial distance, duplicate detection algorithm, and priority scoring logic:
   ```bash
   npx tsx --test src/utils/logic.test.ts
   ```

---

## 📊 Synthetic Demo Dataset

CivicAI comes pre-seeded with **42 realistic civic complaints** spread across fictional metropolitan districts:
- **Downtown Market District**: Chronic commercial dumpster overflow and debris blocking storm drains (deliberate duplicate pair).
- **Northridge Boulevard**: Consecutive waterlogging incidents and collapsed catch basins after rainfall (deliberate duplicate pair).
- **Oakwood Residential**: Stride of extinguished streetlamps creating nighttime pedestrian hazards (deliberate duplicate pair).
- **Central District & Expressway**: Critical public safety hazards including exposed live cables dangling near an elementary school, an open collapsed manhole on a vehicle lane, and flooded ambulance routes.
- **Lifecycle Variety**: Contains complaints across *Submitted, Under Review, Assigned, In Progress, Resolved*, and *Rejected* (with official administrative rejection reasons).
- **One-Click Reset**: Use the "Reset Data" button in the top navigation bar at any time to reseed the 42 records.

---

## 🔮 Limitations & Future Improvements

- **Mobile App Native GPS & Camera**: While the web app supports responsive mobile browsers, native iOS/Android camera integration with automated EXIF location extraction can streamline citizen uploads.
- **Multi-Tenant City Routing**: Future scaling could support multiple municipalities or counties with tenant-isolated role-based access control (RBAC).
- **Predictive Infrastructure Maintenance**: Long-term historical complaint clustering can be used to forecast pipe bursts and asphalt degradation before catastrophic failure.
- **Multilingual Voice Reporting**: Integrate Gemini Live API to enable citizens to lodge complaints via native voice notes in any regional language.
