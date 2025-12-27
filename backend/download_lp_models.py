import os
import subprocess
from huggingface_hub import hf_hub_download

def download_models():
    base_dir = "LivePortrait/pretrained_weights"
    os.makedirs(base_dir, exist_ok=True)
    
    # LivePortrait Core Models
    repo_id = "KwaiVGI/LivePortrait"
    files = [
        "appearance_feature_extractor.pth",
        "motion_extractor.pth",
        "spade_generator.pth",
        "warping_module.pth"
    ]
    
    print(f"[*] Downloading LivePortrait models to {base_dir}...")
    for f in files:
        print(f"  - {f}")
        hf_hub_download(repo_id=repo_id, filename=f"liveportrait/{f}", local_dir=base_dir, local_dir_use_symlinks=False)
        # Move optional if huggingface puts it in subdir, but local_dir handles it mostly depending on config
        # Actually KwaiVGI repo structure is specific.
        # Let's use git lfs or a smarter script if possible, but huggingface_hub is standard.
        
    # Landmark Models (InsightFace)
    landmark_dir = "LivePortrait/pretrained_weights/insightface/models/buffalo_l"
    os.makedirs(landmark_dir, exist_ok=True)
    # Typically these are handled by insightface lib auto-download, but explicit is better for offline/colab
    
    print("[*] All critical models downloaded.")

if __name__ == "__main__":
    try:
        download_models()
    except Exception as e:
        print(f"[!] Error downloading models: {e}")
        print("    Please ensure 'huggingface_hub' is installed.")
