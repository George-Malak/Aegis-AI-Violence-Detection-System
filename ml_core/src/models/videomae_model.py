"""VideoMAE Model and Preprocessing Components.

This file houses the VideoPreprocessor for frame-by-frame quality enhancement 
and the VideoMAEClassifier architectural wrapper.
"""

import cv2
import numpy as np
import torch
import torch.nn as nn
from transformers import VideoMAEModel


class VideoPreprocessor:
    """Handles on-the-fly video frame resizing, CLAHE enhancement, and normalization."""

    def __init__(self, target_frames: int = 16, target_size: tuple = (224, 224)):
        self.target_frames = target_frames
        self.target_size = target_size
        self.clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))

    def process_single_frame(self, frame: np.ndarray) -> np.ndarray:
        """Applies spatial adjustments and contrast filter improvements to one frame."""
        # Letterboxing / Aspect ratio matching can be scaled here
        resized = cv2.resize(frame, self.target_size, interpolation=cv2.INTER_AREA)
        ycrcb = cv2.cvtColor(resized, cv2.COLOR_BGR2YCrCb)
        ycrcb[:, :, 0] = self.clahe.apply(ycrcb[:, :, 0])
        rgb = cv2.cvtColor(ycrcb, cv2.COLOR_YCrCb2RGB)
        return rgb.astype(np.float32) / 255.0


class VideoMAEClassifier(nn.Module):
    """VideoMAE network wrapper with automatic dimension shuffling for PyTorch."""

    def __init__(self, num_classes: int, model_name: str = "MCG-NJU/videomae-base"):
        super(VideoMAEClassifier, self).__init__()
        print(f"Loading pretrained VideoMAE backbone: {model_name}...")
        self.backbone = VideoMAEModel.from_pretrained(model_name)
        self.classifier = nn.Linear(self.backbone.config.hidden_size, num_classes)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """Transforms input (B, F, H, W, C) to VideoMAE format (B, C, F, H, W)."""
        # Step 1: Shift to standard PyTorch layout (B, F, C, H, W)
        x = x.permute(0, 1, 4, 2, 3)
        # Step 2: Shift to VideoMAE spatio-temporal tracking layout (B, C, F, H, W)
        x = x.permute(0, 2, 1, 3, 4)
        
        outputs = self.backbone(x)
        pooled_output = outputs.last_hidden_state.mean(dim=1)
        return self.classifier(pooled_output)