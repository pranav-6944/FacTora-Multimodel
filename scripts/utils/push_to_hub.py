"""
Push FacTora DistilBERT fake news classifier to Hugging Face Hub.
Uses huggingface_hub directly to avoid transformers version conflicts.
"""
import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

from huggingface_hub import HfApi, login
import json
import os

# ── Authenticate ──────────────────────────────────────────────
HF_TOKEN = os.environ.get("HF_TOKEN", "")
if HF_TOKEN:
    login(token=HF_TOKEN)

REPO_ID = "pranavlamkhade/factora-fake-news-detector"
api = HfApi()

# ── Create the repo (if it doesn't exist) ────────────────────
print(f"[1/5] Creating repo: {REPO_ID}")
api.create_repo(repo_id=REPO_ID, token=HF_TOKEN, exist_ok=True, repo_type="model")

# ── Update config.json with label mapping ────────────────────
config_path = "./bert_model/config.json"
with open(config_path, "r") as f:
    config = json.load(f)
config["id2label"] = {"0": "FAKE", "1": "REAL"}
config["label2id"] = {"FAKE": 0, "REAL": 1}
with open(config_path, "w") as f:
    json.dump(config, f, indent=2)
print("[2/5] Updated config.json with label mappings")

# ── Upload model files ───────────────────────────────────────
print("[3/5] Uploading model files...")
model_files = ["config.json", "pytorch_model.bin"]
for fname in model_files:
    fpath = os.path.join("./bert_model", fname)
    if os.path.exists(fpath):
        print(f"   -> Uploading {fname}...")
        api.upload_file(
            path_or_fileobj=fpath,
            path_in_repo=fname,
            repo_id=REPO_ID,
            token=HF_TOKEN,
            commit_message=f"Upload {fname}",
        )

# ── Upload tokenizer files ───────────────────────────────────
print("[4/5] Uploading tokenizer files...")
tokenizer_files = ["tokenizer.json", "tokenizer_config.json", "vocab.txt", "special_tokens_map.json"]
for fname in tokenizer_files:
    fpath = os.path.join("./bert_tokenizer", fname)
    if os.path.exists(fpath):
        print(f"   -> Uploading {fname}...")
        api.upload_file(
            path_or_fileobj=fpath,
            path_in_repo=fname,
            repo_id=REPO_ID,
            token=HF_TOKEN,
            commit_message=f"Upload {fname}",
        )

# ── Create and upload README / Model Card ────────────────────
readme_content = """---
license: mit
language:
- en
tags:
- fake-news-detection
- text-classification
- distilbert
- factora
pipeline_tag: text-classification
datasets:
- liar
metrics:
- accuracy
model-index:
- name: FacTora Fake News Detector
  results:
  - task:
      type: text-classification
      name: Fake News Detection
    dataset:
      type: liar
      name: LIAR Dataset
    metrics:
    - type: accuracy
      name: Accuracy
---

# FacTora -- Fake News Detector (DistilBERT)

A fine-tuned **DistilBERT** model for **binary fake news classification** (REAL vs FAKE), trained on the [LIAR dataset](https://www.cs.ucsb.edu/~william/data/liar_dataset.zip).

## Usage

```python
from transformers import DistilBertTokenizerFast, DistilBertForSequenceClassification
import torch

model = DistilBertForSequenceClassification.from_pretrained("pranavlamkhade/factora-fake-news-detector")
tokenizer = DistilBertTokenizerFast.from_pretrained("pranavlamkhade/factora-fake-news-detector")
model.eval()

text = "NASA confirms the discovery of water on Mars"
inputs = tokenizer(text, return_tensors="pt", padding=True, truncation=True, max_length=512)

with torch.no_grad():
    outputs = model(**inputs)

probs = torch.nn.functional.softmax(outputs.logits, dim=1)
prediction = torch.argmax(probs, dim=1).item()
confidence = float(probs.max()) * 100

label = "REAL" if prediction == 1 else "FAKE"
print(f"Prediction: {label} ({confidence:.1f}%)")
```

## Model Details

| Property | Value |
|----------|-------|
| **Base Model** | `distilbert-base-uncased` |
| **Task** | Binary Text Classification |
| **Labels** | `0: FAKE`, `1: REAL` |
| **Training Data** | LIAR Dataset (6-class to binary) |
| **Epochs** | 3 |
| **Batch Size** | 16 |
| **Max Sequence Length** | 512 |

## Label Mapping

The original LIAR 6-class labels were mapped to binary:

| Original Label | Binary Label |
|---------------|-------------|
| `false`, `pants-fire`, `barely-true` | **FAKE (0)** |
| `half-true`, `mostly-true`, `true` | **REAL (1)** |

## Part of FacTora

This model powers [**FacTora**](https://github.com/pranav-lamkhade/Factora--Fake-News-Detector-) -- a full-stack fake news detection platform with:
- AI-powered news analysis
- Source credibility scoring
- Browser extension for real-time fact-checking
- Detailed confidence reports

## License

MIT License
"""

readme_path = "./README_HF.md"
with open(readme_path, "w", encoding="utf-8") as f:
    f.write(readme_content)

print("[5/5] Uploading model card (README.md)...")
api.upload_file(
    path_or_fileobj=readme_path,
    path_in_repo="README.md",
    repo_id=REPO_ID,
    token=HF_TOKEN,
    commit_message="Add model card",
)

# Clean up temp file
os.remove(readme_path)

print(f"")
print(f"=== DONE! ===")
print(f"Model is live at: https://huggingface.co/{REPO_ID}")
print(f"")
print(f"Load it with:")
print(f'  model = DistilBertForSequenceClassification.from_pretrained("{REPO_ID}")')
print(f'  tokenizer = DistilBertTokenizerFast.from_pretrained("{REPO_ID}")')
