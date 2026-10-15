import json
import os

NOTEBOOK_PATHS = [
    "scripts/training/image/train_image_detector.ipynb",
    "scripts/training/train_image_detector.ipynb"
]

pytorch_training_source = [
    "# Step 7 & 8 & 9: Rock-Solid Native PyTorch Training Loop with AMP\n",
    "import time\n",
    "import torch\n",
    "from torch.utils.data import DataLoader\n",
    "\n",
    "train_loader = DataLoader(train_dataset, batch_size=BATCH_SIZE, shuffle=True, num_workers=2, pin_memory=True)\n",
    "val_loader = DataLoader(val_dataset, batch_size=BATCH_SIZE, shuffle=False, num_workers=2, pin_memory=True)\n",
    "\n",
    "device = torch.device(\"cuda\" if torch.cuda.is_available() else \"cpu\")\n",
    "model.to(device)\n",
    "\n",
    "optimizer = torch.optim.AdamW(model.parameters(), lr=LEARNING_RATE, weight_decay=1e-2)\n",
    "scaler = torch.cuda.amp.GradScaler(enabled=torch.cuda.is_available())\n",
    "\n",
    "print(f\"[TRAINING] Starting Native PyTorch Training on {device} (Mixed Precision AMP: {torch.cuda.is_available()})...\")\n",
    "print(f\"[TRAINING] Total Batches per Epoch: {len(train_loader)} | Validation Batches: {len(val_loader)}\")\n",
    "\n",
    "best_val_acc = 0.0\n",
    "final_model_dir = os.path.join(OUTPUT_DIR, \"factora_image_model\")\n",
    "os.makedirs(final_model_dir, exist_ok=True)\n",
    "\n",
    "for epoch in range(1, NUM_EPOCHS + 1):\n",
    "    start_t = time.time()\n",
    "    model.train()\n",
    "    total_loss = 0.0\n",
    "    correct = 0\n",
    "    total = 0\n",
    "    \n",
    "    for step, batch in enumerate(train_loader):\n",
    "        pixel_values = batch[\"pixel_values\"].to(device)\n",
    "        labels = batch[\"labels\"].to(device)\n",
    "        \n",
    "        optimizer.zero_grad()\n",
    "        with torch.cuda.amp.autocast(enabled=torch.cuda.is_available()):\n",
    "            outputs = model(pixel_values=pixel_values, labels=labels)\n",
    "            loss = outputs.loss\n",
    "            \n",
    "        scaler.scale(loss).backward()\n",
    "        scaler.step(optimizer)\n",
    "        scaler.update()\n",
    "        \n",
    "        total_loss += loss.item()\n",
    "        preds = torch.argmax(outputs.logits, dim=1)\n",
    "        correct += (preds == labels).sum().item()\n",
    "        total += labels.size(0)\n",
    "        \n",
    "        if (step + 1) % 150 == 0 or (step + 1) == len(train_loader):\n",
    "            avg_loss = total_loss / (step + 1)\n",
    "            acc = (correct / total) * 100\n",
    "            print(f\"Epoch [{epoch}/{NUM_EPOCHS}] Step [{step + 1}/{len(train_loader)}] | Loss: {avg_loss:.4f} | Train Acc: {acc:.2f}%\")\n",
    "            \n",
    "    # Validation Loop\n",
    "    model.eval()\n",
    "    val_correct = 0\n",
    "    val_total = 0\n",
    "    val_loss = 0.0\n",
    "    with torch.no_grad():\n",
    "        for batch in val_loader:\n",
    "            pixel_values = batch[\"pixel_values\"].to(device)\n",
    "            labels = batch[\"labels\"].to(device)\n",
    "            with torch.cuda.amp.autocast(enabled=torch.cuda.is_available()):\n",
    "                outputs = model(pixel_values=pixel_values, labels=labels)\n",
    "            val_loss += outputs.loss.item()\n",
    "            preds = torch.argmax(outputs.logits, dim=1)\n",
    "            val_correct += (preds == labels).sum().item()\n",
    "            val_total += labels.size(0)\n",
    "            \n",
    "    val_acc = (val_correct / val_total) * 100\n",
    "    elapsed = time.time() - start_t\n",
    "    print(f\"\\n>>> Epoch {epoch} Complete in {elapsed:.1f}s | Val Acc: {val_acc:.2f}% | Val Loss: {val_loss / len(val_loader):.4f}\\n\")\n",
    "    \n",
    "    if val_acc > best_val_acc:\n",
    "        best_val_acc = val_acc\n",
    "        print(f\"[CHECKPOINT] New Best Accuracy: {val_acc:.2f}%. Saving to {final_model_dir}...\")\n",
    "        model.save_pretrained(final_model_dir)\n",
    "        processor.save_pretrained(final_model_dir)\n",
    "\n",
    "print(f\"\\n[COMPLETE] Training Finished! Best Validation Accuracy: {best_val_acc:.2f}%\")\n",
    "print(f\"Model files saved in: {final_model_dir}\")\n",
    "for f in os.listdir(final_model_dir):\n",
    "    fpath = os.path.join(final_model_dir, f)\n",
    "    size_mb = os.path.getsize(fpath) / 1e6\n",
    "    print(f\"  - {f} ({size_mb:.2f} MB)\")\n"
]

for p in NOTEBOOK_PATHS:
    if not os.path.exists(p):
        continue
    with open(p, "r", encoding="utf-8") as f:
        nb = json.load(f)

    new_cells = []
    for cell in nb["cells"]:
        source = "".join(cell.get("source", []))
        if "# Step 7: Metrics Function" in source:
            # Replace Step 7, 8, 9, 10, 11 with the clean PyTorch training loop
            cell["source"] = pytorch_training_source
            new_cells.append(cell)
        elif any(marker in source for marker in [
            "# Step 8: Training Arguments",
            "# Step 9: Execute Training Loop",
            "# Step 10: Final Evaluation",
            "# Step 11: Export Model Weights"
        ]):
            # Skip old Trainer cells
            continue
        else:
            new_cells.append(cell)

    nb["cells"] = new_cells
    with open(p, "w", encoding="utf-8") as f:
        json.dump(nb, f, indent=1)
    print(f"Saved updated notebook: {p}")

print("Notebook update complete!")
