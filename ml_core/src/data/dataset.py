from pathlib import Path

from ml_core.src.video_preprocessor import VideoPreprocessor


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
                from .data.dataset_loader import DatasetLoader
                from .preprocessing.video_preprocessor import VideoPreprocessor


                def preprocess_video(video_path, target_frames=16, target_size=(224, 224)):
                    processor = VideoPreprocessor(target_frames=target_frames, target_size=target_size)
                    return processor.preprocess_video(video_path)

