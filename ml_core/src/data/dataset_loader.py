from pathlib import Path
import torch
import torch.nn as nn
from torch.utils.data import Dataset, DataLoader
import numpy as np

class DatasetLoader:
    def __init__(self, drive_root, class_names=None, video_extensions=None):
        self.drive_root = drive_root
        self.class_names = class_names
        self.video_extensions = video_extensions or {".mp4", ".avi", ".mov", ".mkv"}

    def _candidate_roots(self):
        if isinstance(self.drive_root, (list, tuple, set)):
            return [Path(candidate) for candidate in self.drive_root]

        return [Path(self.drive_root)]

    def resolve_root(self):
        for candidate in self._candidate_roots():
            if candidate.exists():
                return candidate

        candidates = ", ".join(str(candidate) for candidate in self._candidate_roots())
        raise FileNotFoundError(f"Dataset root not found in any of: {candidates}")

    def discover_class_folders(self):
        root = self.resolve_root()

        if self.class_names:
            folders = []
            for class_name in self.class_names:
                class_dir = root / class_name
                if class_dir.exists() and class_dir.is_dir():
                    folders.append(class_dir)
            return folders

        return [item for item in root.iterdir() if item.is_dir()]

    def iter_video_files(self):
        for class_dir in self.discover_class_folders():
            for video_file in class_dir.rglob("*"):
                if video_file.is_file() and video_file.suffix.lower() in self.video_extensions:
                    yield class_dir.name, video_file

    def load_manifest(self):
        manifest = []
        for class_name, video_file in self.iter_video_files():
            manifest.append({
                "class_name": class_name,
                "video_path": str(video_file),
                "file_name": video_file.name,
            })
        return manifest

    def load_dataset(self):
        return self.load_manifest()
    

class OnTheFlyVideoDataset(Dataset):
    def __init__(self, manifest_list, preprocessor_instance):
        self.samples = manifest_list
        self.preprocessor = preprocessor_instance

    def __len__(self) -> int:
        return len(self.samples)

    def __getitem__(self, idx: int):
        video_data = self.samples[idx]
        video_path = video_data["video_path"]
        label = video_data["label_idx"]   
        
        video_tensor = self.preprocessor.preprocess(video_path)
        
        if video_tensor is None:
            video_tensor = np.zeros((16, 224, 224, 3), dtype=np.float32)
            
        return torch.from_numpy(video_tensor), torch.tensor(label, dtype=torch.long)