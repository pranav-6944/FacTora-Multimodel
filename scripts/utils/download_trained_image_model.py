"""
FacTora Trained Image Model Downloader
Monitors and downloads the fine-tuned CIFAKE ResNet model from Kaggle
directly into models_registry/factora_image_model/factora_image_model/
"""
import os
import sys
import shutil

# Patch open to prevent Windows charmap encoding crash with Kaggle API logs
import builtins
orig_open = builtins.open
def utf8_open(file, mode='r', *args, **kwargs):
    if 'b' not in mode and ('w' in mode or 'a' in mode) and 'encoding' not in kwargs:
        kwargs['encoding'] = 'utf-8'
    return orig_open(file, mode, *args, **kwargs)
builtins.open = utf8_open

from kaggle.api.kaggle_api_extended import KaggleApi

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
TARGET_DIR = os.path.join(PROJECT_ROOT, "models_registry", "factora_image_model", "factora_image_model")
TEMP_DIR = os.path.join(PROJECT_ROOT, "kaggle_model_download_temp")
KERNEL_ID = "pranavlamkhade69/factora-image-detector-training"

def check_and_download():
    api = KaggleApi()
    api.authenticate()
    
    print(f"Checking status for: {KERNEL_ID}...")
    status_obj = api.kernels_status(KERNEL_ID)
    status_str = str(status_obj)
    print(f"Current Status: {status_str}")
    
    if "COMPLETE" not in status_str:
        print("[INFO] Model training is still in progress on Kaggle GPU. Check back shortly.")
        return False
        
    print("\n[SUCCESS] Training completed! Downloading output artifacts from Kaggle...")
    os.makedirs(TEMP_DIR, exist_ok=True)
    os.makedirs(TARGET_DIR, exist_ok=True)
    
    files, _ = api.kernels_output(KERNEL_ID, TEMP_DIR, force=True)
    print(f"Downloaded {len(files)} files to temporary staging: {TEMP_DIR}")
    
    # Locate model files inside staging directory (search recursively for model.safetensors or pytorch_model.bin)
    found_model_dir = None
    for root, dirs, f_list in os.walk(TEMP_DIR):
        if "model.safetensors" in f_list or "pytorch_model.bin" in f_list or "config.json" in f_list:
            found_model_dir = root
            break
            
    if not found_model_dir:
        found_model_dir = TEMP_DIR
        
    print(f"Transferring model files from {found_model_dir} to {TARGET_DIR}...")
    for item in os.listdir(found_model_dir):
        src_path = os.path.join(found_model_dir, item)
        dst_path = os.path.join(TARGET_DIR, item)
        if os.path.isfile(src_path):
            shutil.copy2(src_path, dst_path)
            size_mb = os.path.getsize(dst_path) / 1e6
            print(f"  -> Installed {item} ({size_mb:.2f} MB)")
            
    print("\n[COMPLETE] Factora Image Model weights successfully installed and ready for inference!")
    return True

if __name__ == "__main__":
    check_and_download()
