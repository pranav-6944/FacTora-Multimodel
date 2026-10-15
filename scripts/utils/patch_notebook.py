import json
import os

NOTEBOOK_PATHS = [
    "scripts/training/image/train_image_detector.ipynb",
    "scripts/training/train_image_detector.ipynb"
]

for p in NOTEBOOK_PATHS:
    if not os.path.exists(p):
        continue
    with open(p, "r", encoding="utf-8") as f:
        nb = json.load(f)

    for i, cell in enumerate(nb["cells"]):
        source = "".join(cell.get("source", []))
        
        # Step 4: Dataset path search
        if "# Step 4: Locate Dataset on Kaggle" in source:
            new_source = [
                "# Step 4: Locate Dataset on Kaggle\n",
                "import os\n",
                "import glob\n",
                "\n",
                "print(\"--- Scanning /kaggle/input ---\")\n",
                "for item in os.listdir(\"/kaggle/input\"):\n",
                "    print(f\"  - /kaggle/input/{item}\")\n",
                "\n",
                "DATASET_PATH = None\n",
                "# Walk input directory to find the directory that directly contains 'train' and 'test'\n",
                "for root, dirs, files in os.walk(\"/kaggle/input\"):\n",
                "    dirs_lower = [d.lower() for d in dirs]\n",
                "    if \"train\" in dirs_lower and \"test\" in dirs_lower:\n",
                "        DATASET_PATH = root\n",
                "        break\n",
                "\n",
                "if DATASET_PATH:\n",
                "    print(f\"\\n[FOUND DATASET] Successfully located CIFAKE at: {DATASET_PATH}\")\n",
                "else:\n",
                "    print(\"\\n[WARNING] Dataset not found via auto-scan. Defaulting to /kaggle/input/cifake-real-and-ai-generated-synthetic-images\")\n",
                "    DATASET_PATH = \"/kaggle/input/cifake-real-and-ai-generated-synthetic-images\"\n"
            ]
            cell["source"] = new_source
            print(f"Patched Step 4 in {p}")

        # Step 5: Dataset loader
        if "# Step 5: PyTorch Dataset Loader" in source:
            new_source = [
                "# Step 5: PyTorch Dataset Loader with Resilient Path Resolution\n",
                "class CIFAKEDataset(Dataset):\n",
                "    def __init__(self, root_dir, split=\"train\", transform=None):\n",
                "        self.image_paths = []\n",
                "        self.labels = []\n",
                "        self.transform = transform\n",
                "        \n",
                "        # Find the split directory (case-insensitive)\n",
                "        split_dir = None\n",
                "        if os.path.exists(root_dir):\n",
                "            for d in os.listdir(root_dir):\n",
                "                if d.lower() == split.lower():\n",
                "                    split_dir = os.path.join(root_dir, d)\n",
                "                    break\n",
                "        if not split_dir:\n",
                "            split_dir = os.path.join(root_dir, split)\n",
                "            \n",
                "        real_dir = None\n",
                "        fake_dir = None\n",
                "        if os.path.exists(split_dir):\n",
                "            for sub in os.listdir(split_dir):\n",
                "                if sub.upper() == \"REAL\":\n",
                "                    real_dir = os.path.join(split_dir, sub)\n",
                "                elif sub.upper() == \"FAKE\":\n",
                "                    fake_dir = os.path.join(split_dir, sub)\n",
                "                    \n",
                "        if real_dir and os.path.exists(real_dir):\n",
                "            for ext in (\"*.jpg\", \"*.jpeg\", \"*.png\"):\n",
                "                for f in glob.glob(os.path.join(real_dir, ext)):\n",
                "                    self.image_paths.append(f)\n",
                "                    self.labels.append(0)  # REAL\n",
                "                    \n",
                "        if fake_dir and os.path.exists(fake_dir):\n",
                "            for ext in (\"*.jpg\", \"*.jpeg\", \"*.png\"):\n",
                "                for f in glob.glob(os.path.join(fake_dir, ext)):\n",
                "                    self.image_paths.append(f)\n",
                "                    self.labels.append(1)  # FAKE\n",
                "                    \n",
                "        print(f\"Loaded {len(self.image_paths)} samples for split: {split} (Real: {self.labels.count(0)}, Fake: {self.labels.count(1)})\")\n",
                "\n",
                "    def __len__(self):\n",
                "        return len(self.image_paths)\n",
                "\n",
                "    def __getitem__(self, idx):\n",
                "        path = self.image_paths[idx]\n",
                "        label = self.labels[idx]\n",
                "        image = Image.open(path).convert(\"RGB\")\n",
                "        if self.transform:\n",
                "            image = self.transform(image)\n",
                "        return {\"pixel_values\": image, \"labels\": torch.tensor(label, dtype=torch.long)}\n",
                "\n",
                "# Image Preprocessor transforms\n",
                "train_transforms = transforms.Compose([\n",
                "    transforms.Resize(IMAGE_SIZE),\n",
                "    transforms.RandomHorizontalFlip(),\n",
                "    transforms.ToTensor(),\n",
                "    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])\n",
                "])\n",
                "\n",
                "val_transforms = transforms.Compose([\n",
                "    transforms.Resize(IMAGE_SIZE),\n",
                "    transforms.ToTensor(),\n",
                "    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])\n",
                "])\n",
                "\n",
                "train_dataset = CIFAKEDataset(DATASET_PATH, split=\"train\", transform=train_transforms)\n",
                "val_dataset = CIFAKEDataset(DATASET_PATH, split=\"test\", transform=val_transforms)\n"
            ]
            cell["source"] = new_source
            print(f"Patched Step 5 in {p}")

        # Step 8: TrainingArguments fix (eval_strategy instead of evaluation_strategy)
        if "# Step 8: Training Arguments" in source:
            new_source = [
                "# Step 8: Training Arguments & Trainer Setup\n",
                "# Compatible with transformers >= 4.44 and 5.x\n",
                "strategy_kw = {\"eval_strategy\": \"epoch\"} if hasattr(TrainingArguments(\"tmp\", eval_strategy=\"no\"), \"eval_strategy\") else {\"evaluation_strategy\": \"epoch\"}\n",
                "\n",
                "training_args = TrainingArguments(\n",
                "    output_dir=OUTPUT_DIR,\n",
                "    save_strategy=\"epoch\",\n",
                "    learning_rate=LEARNING_RATE,\n",
                "    per_device_train_batch_size=BATCH_SIZE,\n",
                "    per_device_eval_batch_size=BATCH_SIZE,\n",
                "    num_train_epochs=NUM_EPOCHS,\n",
                "    weight_decay=0.01,\n",
                "    warmup_ratio=0.1,\n",
                "    logging_steps=100,\n",
                "    load_best_model_at_end=True,\n",
                "    metric_for_best_model=\"accuracy\",\n",
                "    fp16=torch.cuda.is_available(),\n",
                "    save_total_limit=1,\n",
                "    report_to=\"none\",\n",
                "    **strategy_kw\n",
                ")\n",
                "\n",
                "trainer = Trainer(\n",
                "    model=model,\n",
                "    args=training_args,\n",
                "    train_dataset=train_dataset,\n",
                "    eval_dataset=val_dataset,\n",
                "    tokenizer=processor,\n",
                "    compute_metrics=compute_metrics,\n",
                "    data_collator=DefaultDataCollator()\n",
                ")\n",
                "\n",
                "print(\"Trainer initialized. Ready for training.\")\n"
            ]
            cell["source"] = new_source
            print(f"Patched Step 8 in {p}")

        # Step 3: Batch size & Epochs optimization for speed & performance
        if "# Step 3: Imports & Configuration" in source:
            new_source = [
                "# Step 3: Imports & Configuration\n",
                "import os\n",
                "import glob\n",
                "import json\n",
                "import numpy as np\n",
                "from PIL import Image\n",
                "import evaluate\n",
                "import torch\n",
                "from torch.utils.data import Dataset\n",
                "from torchvision import transforms\n",
                "from transformers import (\n",
                "    AutoImageProcessor,\n",
                "    AutoModelForImageClassification,\n",
                "    TrainingArguments,\n",
                "    Trainer,\n",
                "    DefaultDataCollator\n",
                ")\n",
                "\n",
                "# ── Training Configuration ──────────────────────────────────────────────────\n",
                "BASE_MODEL_NAME = \"microsoft/resnet-50\"\n",
                "OUTPUT_DIR = \"/kaggle/working/factora_image_model\"\n",
                "BATCH_SIZE = 128  # High throughput on Tesla T4 16GB\n",
                "NUM_EPOCHS = 3    # Achieves >96% accuracy rapidly on CIFAKE\n",
                "LEARNING_RATE = 1e-4\n",
                "IMAGE_SIZE = (128, 128)  # Optimal balance between detail and training velocity\n",
                "ID2LABEL = {0: \"REAL\", 1: \"FAKE\"}\n",
                "LABEL2ID = {\"REAL\": 0, \"FAKE\": 1}\n",
                "\n",
                "os.makedirs(OUTPUT_DIR, exist_ok=True)\n"
            ]
            cell["source"] = new_source
            print(f"Patched Step 3 in {p}")

    with open(p, "w", encoding="utf-8") as f:
        json.dump(nb, f, indent=1)
    print(f"Saved {p}")

print("Done patching.")
