from pathlib import Path
import torch
import torch.nn as nn
from torch.utils.data import Dataset
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
    """Bridges your custom DatasetLoader manifest with PyTorch DataLoader execution loops."""

    def __init__(self, manifest_list: list, preprocessor_instance, class_to_idx: dict, target_frames: int = 16):
        self.samples = manifest_list
        self.preprocessor = preprocessor_instance
        self.class_to_idx = class_to_idx
        self.target_frames = target_frames

    def __len__(self) -> int:
        return len(self.samples)

    def _sample_adaptive_indices(self, total_frames: int, is_segmented: bool) -> np.ndarray:
        """Determines uniform sampling vs dense sampling based on the video duration pattern."""
        if is_segmented:
            # For 15-second segments (Abuse), capture tight dense localized action windows
            stride = 2
            required_window = self.target_frames * stride
            if total_frames > required_window:
                start_idx = np.random.randint(0, total_frames - required_window)
                return np.arange(start_idx, start_idx + required_window, stride)[:self.target_frames]
        
        # Standard uniform spread sampling across full-length tracks
        return np.linspace(0, total_frames - 1, num=self.target_frames, dtype=int)

    def __getitem__(self, idx: int) -> tuple:
        sample = self.samples[idx]
        video_path = sample["video_path"]
        class_name = sample["class_name"]
        label_idx = self.class_to_idx[class_name]
        
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            return torch.zeros((self.target_frames, 224, 224, 3), dtype=torch.float32), torch.tensor(label_idx, dtype=torch.long)
            
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        if total_frames == 0:
            cap.release()
            return torch.zeros((self.target_frames, 224, 224, 3), dtype=torch.float32), torch.tensor(label_idx, dtype=torch.long)

        # Apply specific window logic if tracking the pre-segmented Abuse clips
        is_abuse_clip = (class_name == "Abuse")
        target_indices = self._sample_adaptive_indices(total_frames, is_segmented=is_abuse_clip)
        
        video_sequence = []
        current_idx = 0
        
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
                
            if current_idx in target_indices:
                occurrences = np.sum(target_indices == current_idx)
                for _ in range(occurrences):
                    processed = self.preprocessor.process_single_frame(frame)
                    video_sequence.append(processed)
                    
            current_idx += 1
            if len(video_sequence) >= self.target_frames:
                break
                
        cap.release()
        
        # Patch structural array mismatch if frames fail to capture
        while len(video_sequence) < self.target_frames:
            video_sequence.append(np.zeros((224, 224, 3), dtype=np.float32))
            
        video_tensor = np.array(video_sequence, dtype=np.float32)[:self.target_frames]
        return torch.from_numpy(video_tensor), torch.tensor(label_idx, dtype=torch.long)