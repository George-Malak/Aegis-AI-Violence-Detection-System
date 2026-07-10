import cv2
import numpy as np
import os

class VideoPreprocessor:
    def __init__(self, target_frames=16, target_size=(224, 224), clip_limit=2.0, tile_grid_size=(8, 8)):
        self.target_frames = target_frames
        self.target_size = target_size
        
        self.clahe = cv2.createCLAHE(clipLimit=clip_limit, tileGridSize=tile_grid_size)

    def preprocess(self, video_path):
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            print(f"❌ Error: Cannot open video {video_path}")
            return None

        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        if total_frames == 0:
            cap.release()
            return None

        # Temporal Sampling Indices
        indices = np.linspace(0, total_frames - 1, num=self.target_frames, dtype=int)
        
        video_sequence = []
        current_frame_idx = 0
        
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
                
            if current_frame_idx in indices:
                # Handle multiple indices matches (padding for ultra-short clips)
                occurrences = np.sum(indices == current_frame_idx)
                for _ in range(occurrences):
                    
                    # --- A. SPATIAL PROCESSING & ASPECT RATIO ---
                    # Letterbox/Resize preserving aspect ratio to avoid squishing human figures
                    h, w = frame.shape[:2]
                    t_w, t_h = self.target_size
                    scale = min(t_w / w, t_h / h)
                    nw, nh = int(w * scale), int(h * scale)
                    
                    resized = cv2.resize(frame, (nw, nh), interpolation=cv2.INTER_AREA)
                    
                    # Create canvas and paste the resized image in the center
                    canvas = np.zeros((t_h, t_w, 3), dtype=np.uint8)
                    dx, dy = (t_w - nw) // 2, (t_h - nh) // 2
                    canvas[dy:dy+nh, dx:dx+nw] = resized
                    
                    # --- B. QUALITY & CONTRAST ENHANCEMENT ---
                    # Convert to YCrCb to enhance luminosity channel without messing up colors
                    ycrcb = cv2.cvtColor(canvas, cv2.COLOR_BGR2YCrCb)
                    ycrcb[:, :, 0] = self.clahe.apply(ycrcb[:, :, 0])
                    enhanced = cv2.cvtColor(ycrcb, cv2.YCrCb2RGB) # Switch to RGB for Deep Learning
                    
                    # Mild Bilateral Filter: Denoises low-quality video but *keeps sharp edges* of moving bodies
                    filtered = cv2.bilateralFilter(enhanced, d=5, sigmaColor=35, sigmaSpace=35)
                    
                    # --- C. NORMALIZATION ---
                    normalized = filtered.astype(np.float32) / 255.0
                    video_sequence.append(normalized)
                    
            current_frame_idx += 1
            if len(video_sequence) >= self.target_frames:
                break

        cap.release()
        
        # Ensure we strictly return the expected shape
        video_tensor = np.array(video_sequence)[:self.target_frames]
        return video_tensor

""""
# Quick Verification
if __name__ == "__main__":
    preprocessor = VideoPreprocessor(target_frames=16, target_size=(224, 224)) 
    sample_path = r"D:\downloads\Movies\Robbery150_x264.mp4"
    if os.path.exists(sample_path):
        tensor = preprocessor.preprocess(sample_path)
        print(f" Done! Tensor shape: {tensor.shape}") # الناتج المتوقع: (16, 224, 224, 3)
    else:
        print(f"Video file not found!")
"""
