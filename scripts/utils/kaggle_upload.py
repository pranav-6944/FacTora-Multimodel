r"""
FacTora Kaggle Uploader
Uploads the processed text dataset to Kaggle and pushes the training notebook.
Run: venv/Scripts/python scripts/utils/kaggle_upload.py
"""
import os
import json
import subprocess
import sys

# ── Config ────────────────────────────────────────────────────────────────────
PROJECT_ROOT    = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
PROCESSED_DIR   = os.path.join(PROJECT_ROOT, 'datasets', 'processed')
NOTEBOOK_PATH   = os.path.join(PROJECT_ROOT, 'scripts', 'training', 'train_text_deberta.ipynb')
KAGGLE_USERNAME = "pranavlamkhade69"
DATASET_ID      = f"{KAGGLE_USERNAME}/factora-fake-news-text-dataset"
NOTEBOOK_TITLE  = "factora-deberta-text-model-training"
KAGGLE_BIN      = os.path.join(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')), 'venv', 'Scripts', 'kaggle.exe')

def run(cmd, **kwargs):
    print(f"\n$ {cmd}")
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True, **kwargs)
    if result.stdout:
        print(result.stdout)
    if result.stderr:
        print(result.stderr)
    return result

def step1_upload_dataset():
    print("\n" + "="*60)
    print("STEP 1: Uploading Dataset to Kaggle")
    print("="*60)

    metadata = {
        "title": "factora-fake-news-text-dataset",
        "id": DATASET_ID,
        "licenses": [{"name": "CC0-1.0"}]
    }
    metadata_path = os.path.join(PROCESSED_DIR, 'dataset-metadata.json')
    with open(metadata_path, 'w') as f:
        json.dump(metadata, f, indent=2)
    print(f"  Metadata written to {metadata_path}")

    # Try to create dataset; if it already exists, update it
    result = run(f'"{KAGGLE_BIN}" datasets create -p "{PROCESSED_DIR}" --dir-mode zip')
    if 'already exists' in (result.stdout + result.stderr).lower() or result.returncode != 0:
        print("  Dataset exists - creating a new version...")
        run(f'"{KAGGLE_BIN}" datasets version -p "{PROCESSED_DIR}" -m "Updated processed data" --dir-mode zip')
    print("  [OK] Dataset upload complete.")


def step2_push_notebook():
    print("\n" + "="*60)
    print("STEP 2: Pushing Notebook to Kaggle")
    print("="*60)

    # Build kernel metadata alongside notebook
    notebook_dir     = os.path.dirname(NOTEBOOK_PATH)
    kernel_meta_path = os.path.join(notebook_dir, 'kernel-metadata.json')

    kernel_meta = {
        "id": f"{KAGGLE_USERNAME}/factora-deberta-text-model-training",
        "title": NOTEBOOK_TITLE,
        "code_file": os.path.basename(NOTEBOOK_PATH),
        "language": "python",
        "kernel_type": "notebook",
        "is_private": "true",
        "enable_gpu": "true",
        "enable_tpu": "false",
        "enable_internet": "true",
        "dataset_sources": [DATASET_ID],
        "competition_sources": [],
        "kernel_sources": []
    }

    with open(kernel_meta_path, 'w') as f:
        json.dump(kernel_meta, f, indent=2)
    print(f"  Kernel metadata written to {kernel_meta_path}")

    result = run(f'"{KAGGLE_BIN}" kernels push -p "{notebook_dir}"')
    if result.returncode == 0:
        print("\n  [OK] Notebook pushed! You can monitor it at:")
        print(f"  https://www.kaggle.com/code/{KAGGLE_USERNAME}/factora-deberta-text-model-training")
    else:
        print("\n  [WARNING] There was an issue pushing. Check the output above.")


if __name__ == "__main__":
    step1_upload_dataset()
    step2_push_notebook()
    print("\n" + "="*60)
    print("ALL DONE. Monitor training at:")
    print(f"https://www.kaggle.com/code/{KAGGLE_USERNAME}/factora-deberta-text-model-training")
    print("="*60)
