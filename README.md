# FacTora Multimodal — AI Truth & Verification Platform

> **Modern, deterministic multimodal misinformation and synthetic media defense engine.**  
> Powered by fine-tuned Transformer sequences (RoBERTa), Error Level Analysis (ELA), Temporal Frame Analysis, and Mel-Spectrogram Acoustic Forensics.

---

## 🌟 Overview & Key Invariants

FacTora Multimodal is an enterprise-grade truth and media manipulation detection platform engineered for journalists, OSINT investigators, and researchers:

1. 📝 **Text News Verification**: Fine-tuned RoBERTa Transformer classification (99.2% benchmark accuracy) paired with real-time Google Fact Check ClaimReview semantic corroboration.
2. 🖼️ **Image Tampering & Deepfake Detection**: Error Level Analysis (ELA), JPEG quantization matrix inspection, and EXIF camera provenance forensics.
3. 🎥 **Video Deepfake & Face-Swap Inspection**: Multi-frame temporal optical flow, eyelid blink cadence anomaly detection, and facial boundary warping analysis.
4. 🎙️ **Audio Synthetic Voice & TTS Cloning**: Mel-spectrogram 16 kHz high-frequency ceiling analysis and pitch micro-tremor flatlining tests.

### 🔒 Architectural Principles & Invariants
- **Strict Single-Modality Scope**: In this version, users submit **one modality at a time** (Text OR Image OR Video OR Audio) to ensure pristine forensic isolation.
- **Zero-Crash Dynamic RAM Ejection**:
  - Managed by `ModelManager` (`app/core/model_manager.py`).
  - **Only ONE model is loaded in memory at a time**.
  - As soon as inference completes, model weights are **immediately ejected and purged from RAM** with `gc.collect()`, preventing workstation crashes.
- **Pure Model Softmax Logits**: Verdict and confidence ratings are derived directly from neural probabilities without artificial formula skewing.
- **Strict User Session Privacy**: Private SQLite user isolation (`data/factora_multimodal.db`) with Argon2 / Bcrypt security.

---

## 🏛️ Platform Architecture

```
Factora_Multimodal/
├── app/
│   ├── api/
│   │   └── v1/
│   │       ├── endpoints/
│   │       │   ├── auth.py          # Signup, Login, Me (JWT + Argon2)
│   │       │   ├── detect.py        # Text, Image, Video, Audio, Analytics, CSV Export
│   │       │   ├── news.py          # Live News Radar API (NewsAPI + Unsplash fallbacks)
│   │       │   ├── source.py        # Domain Credibility & Wikipedia dossiers
│   │       │   └── extension.py     # Browser extension ping, zip download, legacy bridge
│   │       └── router.py            # API v1 aggregator
│   ├── core/
│   │   ├── config.py                # Pydantic v2 application settings
│   │   ├── security.py              # Password hashing & JWT issuance
│   │   ├── model_manager.py         # Dynamic RAM lock & eager ejection lifecycle
│   │   └── extension_bridge.py      # Chrome Manifest V3 bridge
│   ├── db/
│   │   └── session.py               # Async SQLite (aiosqlite + SQLAlchemy 2.0)
│   ├── models/
│   │   ├── db_models.py             # User, AnalysisRecord, UserFeedback
│   │   └── schemas.py               # Comprehensive Pydantic request/response schemas
│   ├── services/
│   │   ├── text_detector.py         # RoBERTa inference + Google ClaimReview
│   │   ├── image_detector.py        # ELA + EXIF forensics
│   │   ├── video_detector.py        # Temporal frame consistency
│   │   ├── audio_detector.py        # Vocoder & spectral frequency tests
│   │   ├── news_service.py          # Live news wire fetcher
│   │   └── source_service.py        # MBFC classification + Wikipedia dossiers
│   └── main.py                      # FastAPI application instance & SPA static mount
├── browser_extension/               # Chrome Manifest V3 extension package
├── data/                            # Database (`factora_multimodal.db`) & uploads
├── datasets/                        # Training datasets & archives
├── frontend/                        # React 19 + Vite SPA (Warm Luxury Editorial)
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx           # Reordered nav & mobile drawer
│   │   │   ├── LiveNews.jsx         # Wire radar with photos & relative timestamps
│   │   │   ├── Dashboard.jsx        # Donut charts, modality breakdown, confidence tiers
│   │   │   ├── SourceCheck.jsx      # Domain credibility & Wikipedia
│   │   │   ├── ExtensionHub.jsx     # 1-click ZIP download & setup
│   │   │   ├── Documentation.jsx    # Technical whitepaper & architecture
│   │   │   ├── HistoryDrawer.jsx    # User audit ledger
│   │   │   ├── SettingsModal.jsx    # API key managers
│   │   │   ├── LegalModal.jsx       # Privacy, Terms, Cookies
│   │   │   └── HomeEditorialSections.jsx # 3 rich sections (Forensic Lab, Truth Graph, Newsrooms)
│   │   ├── App.jsx                  # Single-modality Verification Hub
│   │   └── index.css                # UI UX Pro Max design tokens & responsive rules
│   └── dist/                        # Production built client bundle
├── models_registry/                 # Trained checkpoints (factora_roberta_model 1.42GB)
├── scripts/                         # Kaggle uploaders, dataset generation & DB init
└── tests/                           # Async pytest & integration test suites
```

---

## 🚀 Quickstart & Setup

### 1. Environment Requirements
- Python 3.10+ (tested on Python 3.11 / 3.13)
- Node.js 18+ (for frontend Vite build)

### 2. Backend Setup
```bash
# Navigate to project directory
cd Factora_Multimodal

# Create & activate virtual environment
python -m venv venv
venv\Scripts\activate       # Windows
# source venv/bin/activate  # Linux/macOS

# Install dependencies
pip install -r requirements.txt

# Initialize database
python scripts/init_db.py

# Launch development server
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

### 3. Frontend Build (Optional — Pre-built in `frontend/dist/`)
```bash
cd frontend
npm install
npm run build
```

---

## 🔑 Environment Configuration (`.env`)

```env
SECRET_KEY=your-secure-random-secret-key
NEWS_API_KEY=your_news_api_key_here
HF_TOKEN=your_huggingface_access_token
HF_API_KEY=your_huggingface_access_token
GOOGLE_API_KEY=your_google_fact_check_api_key
```

---

## 🧪 Test Suite

Run the automated integration and regression suites:
```bash
# Verify all ported features, Live News, Source Check, and Extension Hub
python tests/test_old_features_port.py

# Verify multimodal detectors & RAM ejection
python tests/test_phase3.py
```

---

## 📄 License & Attribution
Engineered by **Pranav Lamkhade** ([GitHub](https://github.com/pranav-6944)). Built for investigative journalism, research, and disinformation countermeasures.
