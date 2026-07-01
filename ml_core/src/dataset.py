import cv2
import numpy as np

def preprocess_video(video_path, target_fps=10, target_size=(224, 224)):
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        print("Error opening video stream or file")
        return None

    original_fps = cap.get(cv2.CAP_PROP_FPS)
    # Calculate how many frames to skip to hit target FPS
    frame_interval = max(1, int(original_fps / target_fps))
    frames = []
    optical_flows = []
    prev_gray = None
    count = 0
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
        
        # Frame Extraction (Skip frames to match target FPS)
        if count % frame_interval == 0:
            # Spatial Reduction (Resize)
            resized_frame = cv2.resize(frame, target_size, interpolation=cv2.INTER_AREA)
            frames.append(resized_frame)
            
            # Temporal Processing (Optical Flow)
            gray = cv2.cvtColor(resized_frame, cv2.COLOR_BGR2GRAY)
            if prev_gray is not None:
                # Calculate Dense Optical Flow
                
                flow = cv2.calcOpticalFlowFarneback(prev_gray, gray, None, 0.5, 3, 15, 3, 5, 1.2, 0)
                # Calculate the magnitude of the velocity vectors
                magnitude, angle = cv2.cartToPolar(flow[..., 0], flow[..., 1])

                # To ignore any movement that is too weak
                motion_threshold = 1 # i belive it is not the best but 1.5 and .5 are not good at all
                flow[magnitude < motion_threshold] = 0
                # Normalize flow to make it an "image-like" structure if needed for CNN input
                # or just append the raw (x, y) displacement vectors
                optical_flows.append(flow)
                
            prev_gray = gray
        count += 1
    cap.release()
    return np.array(frames), np.array(optical_flows)

# Example Usage:
video_frames, motion_features = preprocess_video(r"D:\downloads\Movies\Robbery150_x264.mp4")
