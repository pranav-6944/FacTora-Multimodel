"""
FacTora Kaggle Image Model Kernel Uploader
Uploads train_image_detector.ipynb to Kaggle and attaches CIFAKE dataset.
"""
import os
import json
import base64
import requests

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
NOTEBOOK_PATH = os.path.join(PROJECT_ROOT, "scripts", "training", "train_image_detector.ipynb")

def get_kaggle_auth():
    kaggle_json = os.path.expanduser("~/.kaggle/kaggle.json")
    if not os.path.exists(kaggle_json):
        raise FileNotFoundError("~/.kaggle/kaggle.json not found.")
    with open(kaggle_json, "r") as f:
        creds = json.load(f)
    username = creds["username"]
    key = creds["key"]
    token = base64.b64encode(f"{username}:{key}".encode()).decode()
    return username, {"Authorization": f"Basic {token}"}

def search_cifake_dataset(headers):
    url = "https://www.kaggle.com/api/v1/datasets/list?search=cifake"
    r = requests.get(url, headers=headers)
    if r.status_code == 200:
        datasets = r.json()
        print(f"Found {len(datasets)} matching datasets for 'cifake':")
        for d in datasets[:5]:
            print(f"  - {d.get('ref')} ({d.get('totalBytes', 0) / 1e6:.1f} MB) : {d.get('title')}")
        if datasets:
            return datasets[0]["ref"]
    return "birdy654/cifake-real-and-ai-generated-synthetic-images"

def push_image_notebook(username, headers, dataset_ref):
    slug = "factora-image-detector-training"
    title = "FacTora Image Deepfake Model Training"
    
    with open(NOTEBOOK_PATH, "r", encoding="utf-8") as f:
        notebook_content = json.load(f)

    payload = {
        "newTitle": title,
        "source": json.dumps(notebook_content),
        "language": "python",
        "kernelType": "notebook",
        "isPrivate": True,
        "enableGpu": True,
        "enableInternet": True,
        "categoryIds": [],
        "datasetDataSources": [dataset_ref],
        "kernelDataSources": [],
        "slug": slug
    }

    url = "https://www.kaggle.com/api/v1/kernels/push"
    print(f"\nPushing notebook to Kaggle as '{username}/{slug}'...")
    print(f"Attaching dataset: {dataset_ref}")
    r = requests.post(url, headers=headers, json=payload)
    if r.status_code in (200, 201):
        print("\n[SUCCESS] Notebook successfully pushed to Kaggle!")
        print(f"Notebook URL: https://www.kaggle.com/code/{username}/{slug}")
        return True
    else:
        print(f"\n[FAILED] Error pushing notebook: {r.status_code} - {r.text}")
        return False

def check_kernel_status(username, headers):
    slug = "factora-image-detector-training"
    url = f"https://www.kaggle.com/api/v1/kernels/status?userName={username}&kernelSlug={slug}"
    r = requests.get(url, headers=headers)
    if r.status_code == 200:
        data = r.json()
        print(f"Kernel Status: {data.get('status')} | Message: {data.get('failureMessage') or 'Healthy'}")
        return data
    else:
        print(f"Error fetching status: {r.status_code} - {r.text}")
        return None

if __name__ == "__main__":
    import sys
    username, headers = get_kaggle_auth()
    if len(sys.argv) > 1 and sys.argv[1] == "status":
        check_kernel_status(username, headers)
    else:
        print(f"Authenticated as Kaggle user: {username}")
        dataset_ref = search_cifake_dataset(headers)
        push_image_notebook(username, headers, dataset_ref)
        check_kernel_status(username, headers)
