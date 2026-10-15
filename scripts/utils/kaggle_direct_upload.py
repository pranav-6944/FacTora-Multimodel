r"""
FacTora Direct Kaggle Uploader
Uses Bearer token (KGAT_...) directly via REST API — bypasses kaggle CLI auth issues.
Run: venv/Scripts/python scripts/utils/kaggle_direct_upload.py
"""
import os
import json
import zipfile
import requests

# ── Config ────────────────────────────────────────────────────────────────────
PROJECT_ROOT    = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
PROCESSED_DIR   = os.path.join(PROJECT_ROOT, 'datasets', 'processed')
NOTEBOOK_PATH   = os.path.join(PROJECT_ROOT, 'scripts', 'training', 'train_text_deberta.ipynb')
KAGGLE_TOKEN    = "53b1c34727b6652892fe454944e23a6b"
KAGGLE_USERNAME = "pranavlamkhade69"
DATASET_SLUG    = "factora-fake-news-text-dataset"
DATASET_ID      = f"{KAGGLE_USERNAME}/{DATASET_SLUG}"
NOTEBOOK_SLUG   = "factora-deberta-training"

HEADERS = {"Authorization": f"Bearer {KAGGLE_TOKEN}"}
API_BASE = "https://www.kaggle.com/api/v1"

def print_section(title):
    print(f"\n{'='*60}\n{title}\n{'='*60}")

# ── Step 1: Zip the dataset ───────────────────────────────────────────────────
def zip_dataset():
    zip_path = os.path.join(PROJECT_ROOT, 'datasets', 'factora_text_dataset.zip')
    files = ['train.csv', 'val.csv', 'test.csv']
    print(f"  Zipping {len(files)} files...")
    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zf:
        for f in files:
            fpath = os.path.join(PROCESSED_DIR, f)
            if os.path.exists(fpath):
                zf.write(fpath, f)
                size_mb = os.path.getsize(fpath) / 1024 / 1024
                print(f"    Added {f} ({size_mb:.1f} MB)")
    total_mb = os.path.getsize(zip_path) / 1024 / 1024
    print(f"  Zip created: {zip_path} ({total_mb:.1f} MB compressed)")
    return zip_path

# ── Step 2: Create or version dataset ─────────────────────────────────────────
def upload_dataset(zip_path):
    print_section("STEP 1: Uploading Dataset to Kaggle")

    # Check if dataset already exists
    r = requests.get(f"{API_BASE}/datasets/{DATASET_ID}", headers=HEADERS)
    exists = r.status_code == 200
    print(f"  Dataset exists: {exists}")

    # Get blob upload URL
    blob_url = f"{API_BASE}/blobs/upload"
    zip_size = os.path.getsize(zip_path)
    blob_payload = {
        "type": "dataset_zip",
        "name": "factora_text_dataset.zip",
        "totalSize": zip_size
    }
    print(f"  Requesting blob upload URL (size: {zip_size/1024/1024:.1f} MB)...")
    r = requests.post(blob_url, headers=HEADERS, json=blob_payload)
    if r.status_code != 200:
        print(f"  ERROR getting blob URL: {r.status_code} — {r.text}")
        return None
    blob_data = r.json()
    create_token = blob_data.get("token")
    upload_url   = blob_data.get("createUrl")
    print(f"  Got blob token. Uploading zip...")

    # Upload the zip blob
    with open(zip_path, 'rb') as f:
        up = requests.put(upload_url, data=f, headers={"Content-Type": "application/zip"})
    if up.status_code not in (200, 201, 204):
        print(f"  ERROR uploading zip: {up.status_code} — {up.text}")
        return None
    print(f"  Zip uploaded successfully.")

    # Create or version the dataset
    if not exists:
        print("  Creating new dataset...")
        payload = {
            "ownerSlug": KAGGLE_USERNAME,
            "slug": DATASET_SLUG,
            "title": "FacTora Fake News Text Dataset",
            "licenseName": "CC0-1.0",
            "isPrivate": False,
            "files": [{"token": create_token}]
        }
        r = requests.post(f"{API_BASE}/datasets", headers=HEADERS, json=payload)
    else:
        print("  Adding new version...")
        payload = {
            "versionNotes": "Updated train/val/test splits",
            "files": [{"token": create_token}],
            "deleteOldVersions": False
        }
        r = requests.post(f"{API_BASE}/datasets/{DATASET_ID}/versions", headers=HEADERS, json=payload)

    if r.status_code in (200, 201):
        print(f"  [OK] Dataset {'created' if not exists else 'versioned'} successfully!")
        print(f"  URL: https://www.kaggle.com/datasets/{DATASET_ID}")
        return True
    else:
        print(f"  ERROR: {r.status_code} — {r.text}")
        return False

# ── Step 3: Push Notebook ─────────────────────────────────────────────────────
def push_notebook():
    print_section("STEP 2: Pushing Training Notebook to Kaggle")

    with open(NOTEBOOK_PATH, 'r', encoding='utf-8') as f:
        notebook_content = json.load(f)

    payload = {
        "newTitle": "FacTora DeBERTa Text Model Training",
        "source": json.dumps(notebook_content),
        "language": "python",
        "kernelType": "notebook",
        "isPrivate": True,
        "enableGpu": True,
        "enableInternet": True,
        "categoryIds": [],
        "datasetDataSources": [DATASET_ID],
        "kernelDataSources": [],
        "slug": NOTEBOOK_SLUG
    }

    r = requests.post(f"{API_BASE}/kernels/push", headers=HEADERS, json=payload)
    if r.status_code in (200, 201):
        print(f"  [OK] Notebook pushed!")
        print(f"  Monitor at: https://www.kaggle.com/code/{KAGGLE_USERNAME}/{NOTEBOOK_SLUG}")
    else:
        print(f"  ERROR pushing notebook: {r.status_code} — {r.text}")

# ── Main ──────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    print("FacTora Kaggle Direct Uploader")
    zip_path = zip_dataset()
    success = upload_dataset(zip_path)
    if success:
        push_notebook()
    else:
        print("\n[FAILED] Dataset upload failed. Cannot push notebook without dataset.")
    print("\nDone.")
