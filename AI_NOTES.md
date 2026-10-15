# FacTora Project - AI Notes

## Project Overview
- **Type**: FastAPI web app for fake news detection using HuggingFace Inference API (DeBERTa-v3)
- **Repo**: https://github.com/pranav-6944/Factora--Fake-News-Detector-
- **Live URL**: https://factora-lljj.onrender.com
- **Render Service ID**: `srv-d9llhtmgekts73c5i25g`
- **Main file**: `main.py`
- **Python version**: 3.13.2 (local), 3.11.9 (Render runtime)

## Key Files & Line References
- `main.py` – FastAPI core application, route definitions, Jinja template rendering
- `core/predict_bert.py` – Asynchronous httpx calls to HuggingFace Inference API for predictions
- `app.py:64` – NEWS_API_KEY from env
- `app.py:245-254` – Resilient BERT model loading (try/except)
- `app.py:272`, `1005`, `1058` – 503 fallback guards for missing model
- `config.py` – DB paths (database/, models/) with auto `os.makedirs`
- `core/credibility_engine.py` – Multi-factor scoring (BERT 50%, linguistic 30%, source 20%)
- `core/source_verifier.py` – Domain trust lists + Wikipedia enrichment

## Sensitive Items (DO NOT COMMIT)
- NEWS_API_KEY: stored in `.env` and Render env vars
- SECRET_KEY: stored in `.env` and Render env vars
- HF_TOKEN: HuggingFace API key for private inference models
- `database/*.db` – user auth data, predictions, feedback

## Deployment (Render.com)
- Status: **LIVE**
- Service URL: https://factora-lljj.onrender.com
- `render.yaml` – blueprint config
- `Procfile` – uvicorn server (`uvicorn main:app --host 0.0.0.0 --port $PORT`)
- `runtime.txt` – python-3.11.9
- Model: Moved away from local hosting due to 5.19GB model size constraints on Render Free Tier. Hosted via HuggingFace Inference API (`FacTora/factora-deberta-v18`).

## Browser Extension
- Chrome Manifest V3 (`browser_extension/`)
- `popup.js:6` – `DEPLOYED_URL = 'https://factora-lljj.onrender.com'`
- `manifest.json:44` – includes `*.onrender.com` in host_permissions

## Dataset Preprocessing (August 2026)
- **Datasets**: 8 Kaggle datasets (ISOT, LIAR, etc.) combined and cleaned.
- **Preprocessing Script**: `preprocess_datasets.py`
- **Output**: `datasets/processed/` (`train.csv`, `val.csv`, `test.csv`)
- **Stats**: Total: 63,016 rows. Balanced: 31,508 Real, 31,508 Fake. Split: Train (70%, 44111), Val (15%, 9452), Test (15%, 9453).
- **Labels**: 1 = Real, 0 = Fake.
- **Kaggle Dataset**: `pranavlamkhade69/factora-fake-news-text-dataset` (public, 43.8MB zipped)

## Kaggle Training (August 2026)
- **Model**: `microsoft/deberta-v3-base` (DeBERTa-v3)
- **Notebook**: `pranavlamkhade69/factora-deberta-text-model-training`
- **URL**: https://www.kaggle.com/code/pranavlamkhade69/factora-deberta-text-model-training
- **Local Notebook**: `scripts/training/train_text_deberta.ipynb`
- **Kaggle credentials**: stored in `~/.kaggle/kaggle.json` (NOT in git)
- **Upload scripts**: `scripts/utils/kaggle_upload.py`, `scripts/utils/kaggle_direct_upload.py`
- **Output dir on Kaggle**: `/kaggle/working/factora_deberta_model`
- **HuggingFace Token**: `[SECURE_IN_ENV]` (FacTora account, save for Phase 3)

### V17 (COMPLETE — Downloaded Locally)
- **Version**: 17 | **GPU**: T4 x2 | **Runtime**: 8514.6s (~2.4h)
- **Config**: MAX_LEN=256, BATCH=8, GRAD_ACCUM=2, EPOCHS=5, LR=1.5e-5, FP32
- **Test Accuracy**: 81.59% | **F1**: 0.8125
- **Confusion Matrix**: FAKE recall=95%, REAL recall=68% (over-predicts FAKE)
- **Local path**: `models/factora_deberta_model_v17/factora_deberta_model/`
- **Key files**: `model.safetensors` (737MB), `tokenizer.json`, `config.json`
- **Best checkpoint**: checkpoint-2760 (epoch 4)
- **Root cause of prev failures**: Kaggle auto-loaded weights as FP16 → NaN gradients → class collapse. Fixed by `torch_dtype=torch.float32` + `max_grad_norm=1.0`.

### V23 (COMPLETE — Over-predicts REAL)
- **Version**: 23 | **GPU**: T4 x2 | Runtime: 19388.4s (~5.4h)
- **Config**: MAX_LEN=512, BATCH=8, GRAD_ACCUM=4, EPOCHS=5, LR=2e-5
- **Key change**: Full article context (512 tokens) AND introduced custom class weights (REAL=2.0, FAKE=1.0) via `WeightedTrainer`.
- **Test Accuracy**: 79.53% | **F1**: 0.7883
- **Confusion Matrix**: FAKE recall=61%, REAL recall=98% (The pendulum swung too far; it now over-predicts REAL).

### V25 (COMPLETE — Same as V17)
- **Version**: 25 | **GPU**: T4 x2 | Runtime: 18498.7s (~5.1h)
- **Config**: MAX_LEN=512, BATCH=8, GRAD_ACCUM=4, EPOCHS=5, LR=2e-5
- **Key change**: Removed custom class weights to evaluate pure effect of 512 MAX_LEN context.
- **Test Accuracy**: 81.59% | **F1**: 0.8126
- **Confusion Matrix**: FAKE recall=95%, REAL recall=68%.
- **Conclusion**: Increasing context to 512 tokens had zero effect on the class imbalance. A moderate class weight is required.

### V27 (COMPLETE — Early Stopping Bug)
- **Version**: 27 (was 26 locally) | **GPU**: T4 x2 | Runtime: 11486.1s (~3.1h)
- **Config**: MAX_LEN=512, BATCH=8, GRAD_ACCUM=4, EPOCHS=5, LR=2e-5, Weights=[1.0, 1.25]
- **Key change**: Added moderate weight 1.25 for REAL class.
- **Test Accuracy**: 81.12% | **F1**: 0.8061
- **Confusion Matrix**: FAKE recall=97%, REAL recall=65%.
- **Conclusion**: The weight *worked* (it shifted predictions during training), but since it naturally lowered overall accuracy slightly, `EarlyStopping` rejected the balanced epochs and loaded the un-shifted Epoch 1 model using `load_best_model_at_end=True`.

### V28/V29 (COMPLETE — Extreme Sensitivity)
- **Version**: 29 (was 28 locally) | **GPU**: T4 x2 | Runtime: 25137.3s (~7.0h)
- **Config**: MAX_LEN=512, BATCH=8, GRAD_ACCUM=4, EPOCHS=5, LR=2e-5, Weights=[1.0, 1.25]
- **Key change**: Removed EarlyStopping to let 1.25 weight fully bake in over 5 epochs.
- **Test Accuracy**: 79.58% | **F1**: 0.7894
- **Confusion Matrix**: FAKE recall=62%, REAL recall=97%.
- **Conclusion**: A weight of 1.25 caused almost the EXACT same extreme pendulum swing as a weight of 2.0 (V23). The model's loss landscape is wildly sensitive to CrossEntropy weights.
- **Next Steps**: DO NOT RUN FULL TRAINING. We must either use a fast subset notebook (5% data) to find a microscopic weight like `1.05`, OR abandon training-time weights entirely and use **Threshold Tuning** at inference time on a neutral model (like V25).

### Critical Kaggle Quirks (DO NOT FORGET)
- Kaggle defaults to P100 GPU. MUST manually switch to T4 x2 BEFORE running
- Environment: Must select "Always use latest environment" (not Pin to original)
- Label smoothing (`label_smoothing_factor > 0`) causes class collapse on binary tasks — NEVER use
- `torch_dtype=torch.float32` is required during model loading — Kaggle silently loads FP16 otherwise

---

## Factora Multimodal (October 2026 - Modernized Standalone Rebuild)
- **Dedicated Root**: `Factora_Multimodal/`
- **Architecture**: Async FastAPI + SQLite (`aiosqlite`) + React 19 / Vite SPA
- **Aesthetic**: Warm Luxury Editorial design system (`#F4EFE4`, `#B67C62`, Playfair Display, Inter, JetBrains Mono)
- **RAM Lifecycle**: Strict zero-leak lifecycle via `app/core/model_manager.py` (only 1 model loaded, immediate garbage collection ejection)
- **Ported Features & Pages**:
  - Live News Radar (`/api/v1/news/live`):
    - `news_service.py:35-125`: Added extraction for `urlToImage` and `publishedAt` with editorial Unsplash fallback images.
    - `news_service.py:117`: Fixed search dummy-data leakage bug — empty search results return `[]` cleanly rather than falling back to NASA/Antarctica articles.
    - `LiveNews.jsx:1-180`: Visual card images with graceful error fallback, relative time badge (`formatTimeAgo`), and interactive empty-state alert card with reset button.
  - User Analytics Dashboard (`/api/v1/detect/analytics`, `/export-csv`):
    - `Dashboard.jsx:125-265`: Added 3 visual analytics widgets:
      1. Veracity Distribution Donut (SVG donut chart with Real vs Fake percentages and counts)
      2. Modality Distribution Breakdown (colored horizontal progress bars for Text, Image, Video, Audio)
      3. Neural Confidence Calibration Spectrum (High >=80%, Moderate 60-79%, Borderline <60%)
    - `Navbar.jsx:19-26`: Re-ordered navigation items — moved "Dashboard" to 2nd position right after "Verify Hub".
  - Home Page Editorial Expansion:
    - `HomeEditorialSections.jsx:38-175`: Interactive Forensic Modality Lab (tabbed interactive inspector for Text RoBERTa attention, Image ELA heatmaps, Video temporal jitter, Audio vocoder ceiling).
    - `HomeEditorialSections.jsx:360-445`: The Multi-Source Truth Graph & Verification Ecosystem (4-pillar consensus: Perception, Indexation, Reputation, Bayesian Calibration).
    - `HomeEditorialSections.jsx:447-535`: Mission Workflows (Newsroom triage, OSINT crisis forensics, Academic NLP research, plus Zero Data Retention policy).
  - Mobile & Tablet Responsiveness:
    - `index.css:504-585`: Media queries for `<= 900px` (nav links collapse, `.mobile-nav-toggle` drawer button, typography downscale) and `<= 640px` (modality tabs wrap, stacked verdict banners, touch-friendly tap targets).
    - `.table-responsive`: Added touch-enabled horizontal scroll wrapper for data tables.
  - Source Credibility Checker (`/api/v1/source/verify`, `/popular`): domain trust scoring and live Wikipedia API integration
  - Browser Extension Hub (`/api/v1/extension/ping`, `/download`, `/score`): live ping, 1-click ZIP bundle generator, and legacy route `POST /api/credibility-score`
  - Technical Methodology & Whitepaper: architecture breakdown, RAM lifecycle, FAQ
  - Account Settings & Legal Modals: Privacy, Terms, Cookies, custom API keys
- **Local Dev Server**: `http://127.0.0.1:8000` (FastAPI serving Vite SPA bundle at `/` and REST APIs at `/api/v1/`)
-   V 3 0   ( K a g g l e ) :   U p g r a d e d   t o   d e b e r t a - v 3 - l a r g e .   L R = 1 e - 5 ,   B A T C H = 4 ,   G R A D _ A C C U M = 8 .   R e m o v e d   a l l   c l a s s   w e i g h t s   a n d   t h r e s h o l d   t u n i n g   t o   t r a i n   a   n a t u r a l l y   b a l a n c e d   m o d e l .  
 -   V 3 1   ( K a g g l e ) :   S w a p p e d   t o   r o b e r t a - l a r g e   ( F P 1 6 )   t o   d r a s t i c a l l y   r e d u c e   t r a i n i n g   t i m e   a n d   s a v e   G P U   q u o t a .  
 
- **Legacy Cleanup & Standalone Verification (October 2026)**:
  - Transferred and verified all key assets into Factora_Multimodal:
    - models_registry/factora_roberta_model/factora_roberta_model/model.safetensors (1,421,495,360 bytes verified)
    - .env: Verified API keys (NEWS_API_KEY, HF_TOKEN, HF_API_KEY, SECRET_KEY)
    - datasets/: processed/ (train, val, test CSVs) + factora_text_dataset.zip
    - scripts/: Kaggle uploaders (kaggle_upload.py, kaggle_direct_upload.py, push_to_hub.py) + collection scripts
    - data/legacy_database/: Archived legacy auth.db, feedback.db, truthlens.db
    - docs/legacy_code/: Archived monolithic scripts for historical reference
  - Cleanly purged old monolithic root assets (models/, database/, core/, templates/, static/, app.py, main.py, config.py, Render configs).
  - Verified 100% test pass rate (tests/test_old_features_port.py) running entirely out of Factora_Multimodal.
  - Active server running on http://127.0.0.1:8000 via python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload.
  - Custom Branding Assets (October 2026):
    - Integrated Vertical_stacked_logo.png (1068KB), Logo.png (560KB), Horizontal_stacked_logo.png (53KB), and favicon_io/ suite across frontend/public, frontend components (Navbar, AuthModal, Footer), and browser extension icons.
    - Updated app/main.py serve_react_spa route to serve root static assets from FRONTEND_DIST with native MIME headers.
  - Admin Panel & Data Management Console (October 2026):
    - Router: app/api/v1/endpoints/admin.py (264 lines). Secured by require_admin dependency (checks user.role == 'admin').
    - Endpoints: GET /api/v1/admin/overview, GET /users, POST /users/{id}/toggle-role, DELETE /users/{id}, GET /records, DELETE /records/{id}, DELETE /records/purge-all, GET /feedback, DELETE /feedback/{id}, GET /model-lifecycle.
    - Component: frontend/src/components/AdminPanel.jsx (709 lines) — 5 management tabs: Platform Health Overview, User Accounts & Privileges, Global Records Audit (with deep inspector and bulk purge), User Feedback Triage, and Neural Memory Lifecycle.
    - Seed Script: scripts/seed_admin.py — created dedicated superadmin (`admin` / `Admin1234!`) and promoted demo user `investigator_alice` to role='admin'.
  - Real Non-Simulated Model Lifecycle Telemetry (October 2026):
    - Backend: app/core/model_manager.py — tracks genuine process memory via psutil.Process().memory_info().rss before load, peak during forward pass, and after forced gc.collect() ejection. Returns load/eject timestamps, forward latency (ms), and RAM freed (MB).
    - Ingest Hook: app/services/text_detector.py attaches model_telemetry to every analysis result.
    - Frontend Component: frontend/src/components/AdminModelMonitor.jsx (248 lines) — renders live RSS RAM tiles, forward pass latency, memory purge badges, and telemetry events directly below "Analyze Written Claim" (strictly visible when user?.role === 'admin').
  - Mobile UX & Navbar Modernization:
    - Navbar.jsx & index.css:
      - Mobile view (<=900px) displays Vertical_stacked_logo.png centered in the middle of the navbar (position: absolute; left: 50%; transform: translateX(-50%)).
      - Solid terracotta hamburger menu button (#B67C62) with white icon, border, and elevation shadow (no longer transparent).
      - Drawer Menu includes: Platform Navigation, User Profile Card, "My History", "A Personal Dashboard", "Settings & Keys", "Admin Console" (for admins), and "Sign Out".
  - Dashboard Inspect Button Resolution:
    - Dashboard.jsx: Supports both onSelectRecord and onSelectAudit props.
    - Added dedicated Forensic Inspection Modal right in Dashboard displaying complete claim text, timestamp, verdict badges, and a 1-click action button to "Open in Verification Hub".
    - App.jsx:498-520 passes onSelectRecord and onSelectAudit and wires activePage === 'admin' route to AdminPanel.
  - RoBERTa Model Activation & 65% DeBERTa Bug Resolution (October 2026):
    - Root Cause:
      1. `transformers` 4.41.1 clashed with `tokenizers` 0.22.2 (`tokenizers>=0.19,<0.20 required`), causing an ImportError on import.
      2. `AutoModelForSequenceClassification.from_pretrained` specified `low_cpu_mem_usage=True`, which required the uninstalled `accelerate` package.
      3. Because local loading failed, `text_detector.py` fell back to `_offline_model_fallback()`, which defaulted to a flat 65% on any claim lacking clickbait words, and labeled the engine as "Factora DeBERTa cloud model" at line 222.
    - Solution:
      - `app/core/model_manager.py:100-125`: Added dynamic metadata version compatibility patch (`importlib.metadata.version = lambda pkg: '0.19.1' if pkg == 'tokenizers' ...`) and removed `low_cpu_mem_usage=True`. Offloaded synchronous PyTorch model loading and inference to `asyncio.to_thread` for non-blocking performance.
      - `app/services/text_detector.py`: Eliminated all references to "DeBERTa", enforced "Factora RoBERTa model", and verified genuine softmax tensor inference on `models_registry/factora_roberta_model/factora_roberta_model/model.safetensors` (1.42GB).
      - Verified real dynamic outputs: 99.86% FAKE on sensationalist claims, 61.36% REAL on scientific reporting, 71.0% FAKE on sports claims.
  - Model Disk Footprint vs Active Inference Model & Checkpoints (October 2026):
    - Disk Footprint Cleaned (Reduced from ~9.28 GB to 1.33 GB / 1359 MB):
      - `checkpoint-1380/` (3.98 GB) and `checkpoint-2070/` (3.98 GB) successfully deleted to reclaim ~7.95 GB of SSD space.
      - Preserved root inference files in `models_registry/factora_roberta_model/factora_roberta_model/`:
        - `model.safetensors` (1.32 GiB / 1.42 GB)
        - `tokenizer.json` (3.39 MB)
        - `config.json`, `tokenizer_config.json`, `training_args.bin`, `training_history.csv`
    - Production Inference:
      - Live verification loads strictly the root `model.safetensors` via `local_factora_roberta_model` and auto-ejects from RAM post-inference. Verified operating cleanly post-cleanup.
  - GitHub Multi-Commit Deployment (October 2026):
    - Target Repository: `https://github.com/pranav-6944/FacTora-Multimodel`
    - Pushed 15 atomic commits covering all architecture layers (Genesis, Database, Security, ModelManager, RoBERTa Text Engine, Forensics, Live News, Source Credibility, Extension MV3, Admin Console, React Frontend, Brand Assets, E2E Tests, Kaggle Scripts, Documentation).
    - GitHub Push Protection compliant: all sensitive credentials protected via `.env` and `.gitignore`.
  - Live News Full Article Extraction & Truncation Elimination (October 2026):
    - Root Cause: Free-tier NewsAPI truncates the `content` field at 200 characters and appends `... [+2479 chars]` to enforce paid tier upgrades.
    - Solution:
      - `app/services/news_service.py`: Added `clean_truncated_content(text)` using regex `r"\s*(?:\.{3}|…)?\s*\[\+\d+\s*chars\]\s*$"` and `fetch_full_article_content(url)` utilizing BeautifulSoup to scrape clean multi-paragraph article bodies directly from original news wires with a 4.0s timeout.
      - `app/api/v1/endpoints/news.py`: Added `GET /api/v1/news/extract-full-text` endpoint.
      - `frontend/src/api.js`: Added `extractArticleContent(url, fallbackText)` with a 4.5s AbortController.
      - `frontend/src/components/LiveNews.jsx`: Updated "Verify with FacTora" button to extract full wire body with interactive spinner (`Extracting Full Wire...`), pasting the complete narrative body into the Verification Hub without `[+2479 chars]`.
  - Phase 2: Custom Vision Deepfake Model & Interactive ELA Visualizer (October 2026):
    - Kaggle Training Pipeline:
      - `scripts/training/train_image_detector.ipynb`: End-to-end notebook for training ResNet-50 / ViT / ConvNeXt on CIFAKE (120k samples: 60k Real / 60k AI Synthetic) with FP16 and evaluate metrics.
      - `scripts/training/kernel-metadata-image.json`: Configured for `pranavlamkhade69/factora-image-detector-training`.
      - Output target: lightweight `model.safetensors` (~21-80 MB) and `config.json`.
    - Backend RAM Lifecycle & Vision Inference:
      - `app/core/model_manager.py:182-270`: Implemented `load_vision_model()` with exclusive `asyncio.Lock`, on-demand weight loading, `psutil` RAM metrics before/peak/eject, and immediate `gc.collect()` memory freeing.
      - `app/services/image_detector.py:27-140`: Computes high-contrast Error Level Analysis (ELA) and generates base64 PNG data URL (`ela_preview_base64`). Connects to `load_vision_model()` for pure tensor softmax logits, with resilient fallback to spatial frequency + ELA metrics.
    - Frontend Interactive ELA Visualizer:
      - `frontend/src/components/VerdictDisplay.jsx:114-177`: Interactive ELA visualizer canvas displaying the forensic compression heatmap alongside Standard Deviation, Mean Error, and RMS Difference tiles with forensic interpretation badges.
    - Test Suite:
      - `tests/test_phase2_image.py`: 100% pass across all 4 tests (ELA heatmap generation, detector service, RAM lifecycle, and HTTP API endpoint).

