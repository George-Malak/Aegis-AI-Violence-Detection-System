"""Video visualization utilities.

This file contains the `VideoVisualizer` class used to annotate 
and display frames for debugging and visualization purposes.
"""

from typing import List, Tuple, Optional, Sequence
import cv2
import numpy as np


class VideoVisualizer:
    """Annotate frames with boxes, labels and display the result."""

    def __init__(self, color: Tuple[int, int, int] = (0, 255, 0)):
        self.default_color = color

    @staticmethod
    def _draw_box(frame: np.ndarray, box: Tuple[int, int, int, int], color: Tuple[int, int, int], thickness: int = 2) -> None:
        x1, y1, x2, y2 = box
        cv2.rectangle(frame, (x1, y1), (x2, y2), color, thickness)

    @staticmethod
    def _draw_label(frame: np.ndarray, text: str, origin: Tuple[int, int], color: Tuple[int, int, int]) -> None:
        cv2.putText(frame, text, (origin[0], origin[1] - 6), cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 1, cv2.LINE_AA)

    def overlay_boxes(
        self,
        frames: Sequence[np.ndarray],
        boxes_per_frame: Sequence[Sequence[Tuple[int, int, int, int]]],
        labels_per_frame: Optional[Sequence[Sequence[str]]] = None,
        colors: Optional[Sequence[Tuple[int, int, int]]] = None,
    ) -> List[np.ndarray]:
        """Return a new list of frames with boxes and optional labels overlaid.

        - `boxes_per_frame` should be aligned with `frames` (one list of boxes per frame).
        - `labels_per_frame`, if provided, should match `boxes_per_frame` shape.
        """
        annotated: List[np.ndarray] = []
        num_frames = len(frames)
        for i in range(num_frames):
            frame = frames[i].copy()
            boxes = boxes_per_frame[i] if i < len(boxes_per_frame) else []
            labels = (labels_per_frame[i] if labels_per_frame and i < len(labels_per_frame) else [None] * len(boxes))
            for j, box in enumerate(boxes):
                color = colors[j % len(colors)] if colors else self.default_color
                self._draw_box(frame, box, color)
                label = labels[j] if j < len(labels) else None
                if label:
                    self._draw_label(frame, label, (box[0], box[1]), color)
            annotated.append(frame)
        return annotated

    def show_frames(self, frames: Sequence[np.ndarray], window_name: str = "video", delay_ms: int = 30) -> None:
        """Display frames in an interactive high-gui display window loop wrapper until 'q' escape sequence is hit."""
        for frame in frames:
            cv2.imshow(window_name, frame)
            if cv2.waitKey(delay_ms) & 0xFF == ord("q"):
                break
        cv2.destroyAllWindows()

"""
if __name__ == "__main__":
    # Verification stub to ensure standalone execution works perfectly
    visualizer = VideoVisualizer()
    print("VideoVisualizer class initialized successfully in standalone mode.")
"""