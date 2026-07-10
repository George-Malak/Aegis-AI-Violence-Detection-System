from transformers import VideoMAEModel
import torch
import torch.nn as nn
import numpy as np
class VideoMAEClassifier(nn.Module):
    def __init__(self, num_classes: int):
        super(VideoMAEClassifier, self).__init__()
        self.backbone = VideoMAEModel.from_pretrained("MCG-NJU/videomae-base")
        self.classifier = nn.Linear(self.backbone.config.hidden_size, num_classes)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        x = x.permute(0, 1, 4, 2, 3) # (B, F, C, H, W)
        x = x.permute(0, 2, 1, 3, 4) # (B, C, F, H, W)
        
        outputs = self.backbone(x)
        pooled_output = outputs.last_hidden_state.mean(dim=1)
        return self.classifier(pooled_output)