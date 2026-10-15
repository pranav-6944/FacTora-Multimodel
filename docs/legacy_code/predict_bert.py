"""
FacTora — DeBERTa-v3 Prediction Utility (FastAPI & HuggingFace API Version)
Replaces the old PyTorch local loading with asynchronous httpx calls to the HuggingFace Inference API.
"""

import os
import httpx
import torch
import torch.nn.functional as F
from typing import Optional, Tuple
from core.credibility_engine import compute_credibility

# ── Config ────────────────────────────────────────────────────────────────────
USE_LOCAL_MODEL = True # Toggle this for local inference vs HF API

HF_TOKEN = os.environ.get("HF_TOKEN", "")
HF_MODEL_REPO = os.environ.get("HF_MODEL_REPO", "FacTora/factora-deberta-v18")
HF_API_URL = f"https://api-inference.huggingface.co/models/{HF_MODEL_REPO}"

# Local Model setup
LOCAL_MODEL_DIR_BASE = os.path.join(os.path.dirname(os.path.dirname(__file__)), "models", "factora_roberta_model")
LOCAL_MODEL_DIR = os.path.join(LOCAL_MODEL_DIR_BASE, "factora_roberta_model") if os.path.exists(os.path.join(LOCAL_MODEL_DIR_BASE, "factora_roberta_model", "config.json")) else LOCAL_MODEL_DIR_BASE
_local_tokenizer = None
_local_model = None
_model_loaded = False

def _load_local_model():
    global _local_tokenizer, _local_model, _model_loaded
    if _model_loaded:
        return True
    try:
        from transformers import AutoTokenizer, AutoModelForSequenceClassification
        print(f"predict_bert: Loading local model from {LOCAL_MODEL_DIR}...")
        _local_tokenizer = AutoTokenizer.from_pretrained(LOCAL_MODEL_DIR)
        _local_model = AutoModelForSequenceClassification.from_pretrained(LOCAL_MODEL_DIR)
        _local_model.eval()
        _model_loaded = True
        print("predict_bert: Local model loaded successfully!")
        return True
    except Exception as e:
        print(f"predict_bert: Failed to load local model: {e}")
        return False

def _local_predict(text: str) -> Optional[Tuple[str, float]]:
    if not _load_local_model():
        return None
    try:
        inputs = _local_tokenizer(text, return_tensors="pt", truncation=True, max_length=512, padding=True)
        with torch.no_grad():
            outputs = _local_model(**inputs)
            logits = outputs.logits
            probs = F.softmax(logits, dim=1)
        
        real_prob = probs[0][1].item()
        
        if real_prob >= 0.5:
            verdict = "REAL"
            confidence = real_prob * 100
        else:
            verdict = "FAKE"
            confidence = (1.0 - real_prob) * 100
            
        return verdict, round(confidence, 2)
    except Exception as e:
        print(f"predict_bert: Local inference failed: {e}")
        return None


def _hf_predict(text: str) -> Optional[Tuple[str, float]]:
    """
    Asynchronously ping the HuggingFace Inference API.
    Returns (verdict, confidence_pct) or None if model unavailable/failed.
    """
    headers = {"Authorization": f"Bearer {HF_TOKEN}"}
    payload = {"inputs": text}
    
    try:
        with httpx.Client(timeout=10.0) as client:
            response = client.post(HF_API_URL, headers=headers, json=payload)
            
            if response.status_code != 200:
                print(f"predict_bert: HF API Error {response.status_code}: {response.text}")
                return None
                
            result = response.json()
            
            # HuggingFace API returns a list of lists of dictionaries for sequence classification
            # Example: [[{'label': 'FAKE', 'score': 0.98}, {'label': 'REAL', 'score': 0.02}]]
            if not result or not isinstance(result, list) or not result[0]:
                print(f"predict_bert: Unexpected HF API response shape: {result}")
                return None
                
            predictions = result[0]
            if isinstance(predictions, list):
                # Extract the probability for REAL
                real_score = next((p.get("score", 0.0) for p in predictions if p.get("label") == "REAL"), 0.0)
                
                if real_score >= 0.5:
                    verdict = "REAL"
                    confidence = real_score * 100
                else:
                    verdict = "FAKE"
                    confidence = (1.0 - real_score) * 100
                    
                return verdict, round(confidence, 2)
            else:
                print(f"predict_bert: Unknown prediction format: {predictions}")
                return None
                
    except Exception as e:
        print(f"predict_bert: HF API request failed: {e}")
        return None


# ── Public API ────────────────────────────────────────────────────────────────

def predict_news(text: str) -> Tuple[str, float]:
    """
    Predict fake vs real news using HuggingFace API.
    Same interface as before — returns (verdict, confidence_pct).

    Tier 1: HuggingFace Inference API (DeBERTa-v3)
    Tier 2: Credibility Engine (linguistic + source signals, fallback)
    """
    text = (text or "").strip()
    if not text:
        return "FAKE", 50.0

    # Tier 1: Primary Model (Local or HF API)
    if USE_LOCAL_MODEL:
        result = _local_predict(text)
    else:
        result = _hf_predict(text)
        
    if result is not None:
        return result

    # Tier 2: Credibility Engine fallback (if model is loading/failed)
    print("predict_bert: Falling back to credibility engine...")
    cred    = compute_credibility(text, bert_confidence=50.0, bert_prediction="REAL")
    verdict = cred.get("verdict", "REAL")
    score   = cred.get("credibility_score", 50.0)
    return verdict, round(float(score), 2)
