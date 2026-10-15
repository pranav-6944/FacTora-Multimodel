# Factora Multimodal — Master Task Execution Plan

## 📌 Project Overview & Vision
**Factora Multimodal** is a comprehensive, multi-modality truth and verification platform. It detects veracity, manipulation, and synthetic generation across **4 core modalities** (submitted individually):
1. 📝 **Text News**: Kaggle fine-tuned RoBERTa model + Google API cross-check with structured reasoning.
2. 🖼️ **Image**: Real vs. AI-Generated / Manipulated detector with forensic reasoning.
3. 🎥 **Video**: Real vs. Deepfake / Synthetic video detector with frame analysis reasoning.
4. 🎙️ **Audio**: Real vs. AI Voice Clone / Synthetic speech detector with acoustic reasoning.

---

## 🔒 Security, Privacy & Memory Invariants
- **Strict Single-Modality Scope**: User submits **one modality at a time** (Text OR Image OR Video OR Audio). No combined cross-modal inputs in this version.
- **Dynamic Memory Management (Laptop Crash Protection)**:
  - Exclusive `ModelManager` (`app/core/model_manager.py`).
  - **Only ONE model is loaded in memory at a time**.
  - As soon as inference completes, the model is **immediately ejected and purged from RAM** with `gc.collect()`.
- **Pure Model Output**: Real model tensor softmax probabilities dictate the verdict and confidence directly with zero artificial formula weights.
- **Strict User Data Isolation**: Every user can **only view their own** analysis history, reports, and dashboard statistics.

---

## 🚦 Execution Protocol
> **Strict Rule**: Work is organized in clear Phases. As each phase is completed, execution **stops completely** for user review and approval before starting the next phase.

---

## 📋 Phased Roadmap

### Phase 1: Project Genesis & Foundation Setup
- [x] Create dedicated standalone project root: `Factora_Multimodal/`
- [x] Scaffold modern modular architecture tree (`app/api`, `app/core`, `app/services`, `app/models`, `app/db`, `data`, `static`, `templates`, etc.)
- [x] Migrate and preserve core assets (API keys from `.env`, datasets, training artifacts, model configs, branding logos)
- [x] Establish dedicated, isolated database path (`data/factora_multimodal.db`)
- [x] Implement design system specification (`design.md`) based on Warm Luxury Editorial palette (`#F4EFE4`, `#DFD9CA`, `#B67C62`, `#4A4845`)
- [x] **Status:** COMPLETED

---

### Phase 2: Modern Asynchronous Backend Core, Auth & Dedicated Database
- [x] Setup `app/core/config.py` with Pydantic `BaseSettings`
- [x] Implement Security module (`app/core/security.py`): Bcrypt password hashing + JWT token creation/decoding
- [x] Implement Async SQLite (`aiosqlite` + SQLAlchemy 2.0) engine in `app/db/session.py`
- [x] Create database models in `app/models/db_models.py` (`User`, `AnalysisRecord`, `UserFeedback`)
- [x] Create automated database tables initialization script (`scripts/init_db.py`)
- [x] Define comprehensive Pydantic v2 schemas in `app/models/schemas.py`
- [x] Implement Auth endpoints (`/api/v1/auth/signup`, `/api/v1/auth/login`, `/api/v1/auth/me`)
- [x] Automated test suite (`tests/test_phase2.py`) asserting DB tables, JWT issuance, and strict user data privacy
- [x] **Status:** COMPLETED

---

### Phase 3: Multimodal Detector Services, Google Cross-Check & Eager RAM Ejection
- [x] Implement exclusive `ModelManager` (`app/core/model_manager.py`) with `asyncio.Lock` and immediate RAM ejection
- [x] **Text Detector Service** (`app/services/text_detector.py`):
  - Kaggle fine-tuned RoBERTa model inference (pure softmax logits, zero formula distortion)
  - Eager model loading & immediate memory ejection lifecycle verified (`Memory check: Is model ejected? -> True`)
  - Google Fact-Checking API cross-check module
- [x] **Image Detector Service** (`app/services/image_detector.py`):
  - Error Level Analysis (ELA) + EXIF metadata tampering detection + synthetic visual artifact checks
- [x] **Video Detector Service** (`app/services/video_detector.py`):
  - Video container forensics, generator signature scanning, and temporal frame consistency analyzer
- [x] **Audio Detector Service** (`app/services/audio_detector.py`):
  - Acoustic noise floor & zero-crossing analysis for voice cloning / robotic artifacts
- [x] API v1 endpoints for all 4 isolated modalities (`/api/v1/detect/text`, `/image`, `/video`, `/audio`, `/history`, `/record/{id}`, `/feedback`)
- [x] End-to-end automated test suite (`tests/test_phase3.py`) asserting all 4 modalities and strict privacy
- [x] **Status:** COMPLETED — Awaiting User Review before Phase 4.

---

### Phase 4: World-Class Editorial UI & Design System (UI UX Pro Max)
- [x] Responsive navigation with user profile, login/signup modals, and private history access
- [x] Unified Single-Modality Verification Hub (`frontend/src/App.jsx`):
  - Tab 1: 📝 **Text News** (Live paste, character count, instant Google cross-check breakdown)
  - Tab 2: 🖼️ **Image Verification** (Drag-and-drop, live thumbnail preview, ELA visualizer)
  - Tab 3: 🎥 **Video Verification** (Video file upload, player preview, frame anomaly timeline)
  - Tab 4: 🎙️ **Audio Verification** (Audio upload, waveform player, voice clone analyzer)
- [x] Structured Results & Reasoning Card (Pure model confidence meter, Real/Fake badge, "Why & What is it" explanation drawer, Google cross-check citations)
- [x] User Private History Drawer (`frontend/src/components/HistoryDrawer.jsx`): View past submissions, filter by modality, inspect verification breakdown
- [x] Automated Integration Test Suite (`tests/test_phase4.py`): Verified SPA routing, assets delivery, and API integration
- [x] **Status:** COMPLETED — Ready for User Review before Phase 5.

---

### Phase 4.5: Old FacTora Features, Pages, Sections & Browser Extension Port
- [x] **Live News Radar** (`components/LiveNews.jsx` & `/api/v1/news/live`):
  - Category filters (General, Tech, Politics, Business, Science, Health)
  - Real-time NewsAPI feed integration with editorial Unsplash fallback images
  - High-resolution editorial image display in cards above headlines
  - Relative publication timestamp badge (`formatTimeAgo`) with Clock icon
  - Search keyword filtering with informative zero-result empty state (no dummy data fallback)
  - 1-click "Verify with FacTora" bridging directly into the Text Verification Hub
- [x] **Source Credibility Checker** (`components/SourceCheck.jsx` & `/api/v1/source/verify`, `/popular`):
  - Domain trust scoring meter (High Trust, Questionable, Satire, Unreliable)
  - Live Wikipedia API summary dossier integration
  - Popular outlets grid (`reuters.com`, `bbc.com`, `apnews.com`, `theonion.com`)
- [x] **User Audit Analytics & CSV Ledger** (`components/Dashboard.jsx` & `/api/v1/detect/analytics`, `/export-csv`):
  - Interactive SVG Veracity Distribution Donut chart (Real vs Fake percentage and counts)
  - Modality Distribution Breakdown with colored horizontal progress bars (Text, Image, Video, Audio)
  - Neural Confidence Calibration Spectrum tiers (High >= 80%, Moderate 60-79%, Borderline < 60%)
  - KPI tiles: Total Audits, Real count, Fake count, Average model confidence
  - Full audit ledger table with live search, filtering, and responsive touch wrapper (`.table-responsive`)
  - 1-click CSV export stream (`/api/v1/detect/export-csv`)
- [x] **Navigation Bar Optimization** (`components/Navbar.jsx`):
  - Moved "Dashboard" to 2nd position right after "Verify Hub"
  - Responsive hamburger drawer navigation on tablet/mobile screens
- [x] **Home Editorial Sections Expansion** (`components/HomeEditorialSections.jsx`):
  - Section 1: Benchmark trust stats (99.2% accuracy, <1.8s latency, 0MB RAM leakage)
  - Section 2: 3-step verification protocol workflow
  - Section 3: Interactive Forensic Modality Lab & Deception Anatomy (tabbed simulation for Text, Image, Video, Audio)
  - Section 4: Full-spectrum capability cards
  - Section 5: The Multi-Source Truth Graph & Verification Ecosystem (4-pillar consensus)
  - Section 6: Mission Workflows for Investigative Newsrooms, OSINT Analysts, and Academic Researchers
  - Section 7: Call to Action Banner
- [x] **Mobile & Tablet Full Responsiveness** (`index.css`):
  - Breakpoints at 900px and 640px for responsive navigation, typography, cards, and modality selectors
  - Touch-friendly tap targets and smooth horizontal scrolling for audit tables
- [x] **Browser Extension Hub & Bridge** (`components/ExtensionHub.jsx` & `/api/v1/extension/ping`, `/download`, `/score`):
  - Real-time backend bridge ping indicator
  - 1-click in-memory ZIP download of `browser_extension` directory
  - Chrome Manifest V3 3-step setup guide
  - Dual payload compatibility (`headline`/`text`, `source_url`/`url`)
  - Legacy root route compatibility (`POST /api/credibility-score`) for existing extension popups
- [x] **Methodology & Whitepaper** (`components/Documentation.jsx`):
  - 4-modality neural architecture specification
  - Zero-Crash Dynamic Memory & RAM Ejection lifecycle
  - Fact-checking truth graph with Google Fact Check Tools API
  - Interactive FAQ accordion
- [x] **Settings & Legal Compliance Modals** (`components/SettingsModal.jsx`, `components/LegalModal.jsx`):
  - Custom API keys manager (HF, NewsAPI, Google)
  - Tabbed legal policies (Privacy, Terms of Service, Cookies)
- [x] **Automated Test Suite** (`tests/test_old_features_port.py`): Verified all ported features with 100% pass rate
- [x] **Status:** COMPLETED

---

### Phase 5: Admin Panel, Genuine Hardware Telemetry & Mobile Navbar Refinements
- [x] **Mobile Responsive Navbar Refinements** (`Navbar.jsx`, `index.css`):
  - In mobile view (`<= 900px`), centered `Vertical_stacked_logo.png` directly in the middle of the navbar
  - Solid terracotta colored hamburger button (`#B67C62`) with white icon, border, and elevation shadow (no longer transparent)
  - Account items ("My History", "A Personal Dashboard", "Settings & Keys", "Admin Console", "Sign Out") seamlessly integrated into the hamburger drawer
- [x] **Dashboard Inspect Button Fix** (`Dashboard.jsx`, `App.jsx`):
  - Fixed prop mismatch between `onSelectAudit` and `onSelectRecord`
  - Created interactive Forensic Inspection Modal right in the dashboard displaying complete claim text, timestamp, verdict badges, and a 1-click action button to "Open in Verification Hub"
- [x] **Admin Panel Data Management Console** (`AdminPanel.jsx`, `/api/v1/admin/*`):
  - Role-based authorization (`require_admin` dependency checking `user.role == 'admin'`)
  - 5-tab management console: Platform Health Overview, User Accounts & Roles, All Audit Records (with modal inspector and bulk purge), User Feedback Triage, and Neural Memory Lifecycle
  - Seeded dedicated superadmin (`admin` / `Admin1234!`) and promoted `investigator_alice` to `admin`
- [x] **Real, Non-Simulated Model Lifecycle Telemetry** (`model_manager.py`, `AdminModelMonitor.jsx`):
  - Real hardware tracking via `psutil.Process().memory_info().rss` measuring process RSS before load, peak during forward pass, eject timestamp, latency (ms), and RAM freed (MB)
  - Ejection verification badge confirming zero RAM leakage
  - Integrated directly below the "Analyze Written Claim" section when an administrator is logged in
- [x] **Automated Regression & Security Testing** (`tests/test_admin_and_telemetry.py`):
  - 100% pass rate across 7 async test suites (Admin auth, overview, users, records, telemetry, 403 non-admin forbidden guard, static logo mime types)
  - All 4 ported test suites in `tests/test_old_features_port.py` passing flawlessly
- [x] **Status:** COMPLETED & VERIFIED

