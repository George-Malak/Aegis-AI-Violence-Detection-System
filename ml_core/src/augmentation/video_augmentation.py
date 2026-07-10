import os
from typing import List, Tuple, Optional

import cv2
import numpy as np
import albumentations as A


class VideoAugmentor:
    """Utility class to read, augment and write video clips.

    Features:
    - read videos and obtain properties
    - sliding-window temporal clipping
    - spatial augmentation (ReplayCompose) applied consistently across frames
    - save original and augmented clips
    """

    def __init__(self, transform: Optional[A.ReplayCompose] = None):
        if transform is None:
            transform = A.ReplayCompose([
                A.HorizontalFlip(p=0.5),
                A.RandomBrightnessContrast(brightness_limit=0.2, contrast_limit=0.2, p=0.7),
            ])
        self.transform = transform

    @staticmethod
    def get_video_properties(video_path: str) -> Tuple[int, int, int, int]:
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            raise IOError(f"Cannot open video: {video_path}")
        fps = int(cap.get(cv2.CAP_PROP_FPS)) or 30
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        cap.release()
        return fps, width, height, total_frames

    @staticmethod 
    # --->
    def read_all_frames(video_path: str) -> List[np.ndarray]:
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            raise IOError(f"Cannot open video: {video_path}")
        
        frames: List[np.ndarray] = []
        while True:
            ret, frame = cap.read()
            if not ret:
                break
            frames.append(frame)
        cap.release()
        return frames

    @staticmethod
    def save_video(frames: List[np.ndarray], output_path: str, fps: int, width: int, height: int) -> None:
        if not frames:
            return
        fourcc = cv2.VideoWriter_fourcc(*"mp4v")
        os.makedirs(os.path.dirname(output_path) or ".", exist_ok=True)
        out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))
        for frame in frames:
            if frame.shape[1] != width or frame.shape[0] != height:
                frame = cv2.resize(frame, (width, height))
            out.write(frame)
        out.release()

    def apply_spatial_augmentation(self, frames: List[np.ndarray]) -> List[np.ndarray]:
        """Apply spatial augmentation consistently across all frames using ReplayCompose.

        The first frame is used to draw the random augmentation parameters which are
        then replayed on all subsequent frames so the augmentation is temporally
        coherent.
        """
        if len(frames) == 0:
            return frames

        augmented_frames: List[np.ndarray] = []
        first_aug = self.transform(image=frames[0])
        augmented_frames.append(first_aug["image"])
        replay_data = first_aug.get("replay")

        for frame in frames[1:]:
            aug = A.ReplayCompose.replay(replay_data, image=frame)
            augmented_frames.append(aug["image"])

        return augmented_frames

    def augment_video_pipeline(
        self,
        video_path: str,
        output_dir: str,
        class_name: str,
        video_id: str,
        window_duration_sec: int = 3,
        overlap_sec: int = 1,
    ) -> None:
        """Split video into temporal clips and save both original and augmented versions.

        - window_duration_sec: length of each clip in seconds
        - overlap_sec: overlap between consecutive clips in seconds
        """
        try:
            fps, width, height, total_frames = self.get_video_properties(video_path)
        except IOError as e:
            print(f"Skipping corrupted video: {video_path}. Error: {e}")
            return
        os.makedirs(output_dir, exist_ok=True)

        fps, width, height, total_frames = self.get_video_properties(video_path)
        frames = self.read_all_frames(video_path)

        window_size = max(1, int(window_duration_sec * fps))
        step_size = max(1, int((window_duration_sec - overlap_sec) * fps))

        start_frame = 0
        clip_idx = 0
        num_frames = len(frames)

        # If the video is shorter than a window, still produce one clip
        if num_frames > 0 and num_frames < window_size:
            current_clip_frames = frames
            orig_clip_name = f"{class_name}_{video_id}_clip_{clip_idx}_orig.mp4"
            self.save_video(current_clip_frames, os.path.join(output_dir, orig_clip_name), fps, width, height)
            aug_clip_frames = self.apply_spatial_augmentation(current_clip_frames)
            aug_clip_name = f"{class_name}_{video_id}_clip_{clip_idx}_aug.mp4"
            self.save_video(aug_clip_frames, os.path.join(output_dir, aug_clip_name), fps, width, height)
            return

        while start_frame + window_size <= num_frames:
            end_frame = start_frame + window_size
            current_clip_frames = frames[start_frame:end_frame]

            orig_clip_name = f"{class_name}_{video_id}_clip_{clip_idx}_orig.mp4"
            self.save_video(current_clip_frames, os.path.join(output_dir, orig_clip_name), fps, width, height)

            aug_clip_frames = self.apply_spatial_augmentation(current_clip_frames)
            aug_clip_name = f"{class_name}_{video_id}_clip_{clip_idx}_aug.mp4"
            self.save_video(aug_clip_frames, os.path.join(output_dir, aug_clip_name), fps, width, height)

            clip_idx += 1
            start_frame += step_size


