import cv2
import time
import requests
import random
from ultralytics import YOLO

def start_camera_monitoring(rtsp_url=0):
    """
    Purely functional YOLOv8 + ByteTrack script for crowd counting.
    In a real temple, this connects to an RTSP camera stream and updates the database.
    """
    print("Loading YOLOv8 Model...")
    model = YOLO("yolov8n.pt") # Loads the nano model for high fps

    # Open camera or video stream
    cap = cv2.VideoCapture(rtsp_url)
    
    if not cap.isOpened():
        print("Error: Could not open camera stream.")
        return

    print("Started Real-Time Crowd Monitoring. Press 'q' to quit.")
    
    API_ENDPOINT = "http://127.0.0.1:8000/cv/update"
    last_post_time = time.time()
    
    while True:
        ret, frame = cap.read()
        if not ret:
            break

        # Run YOLOv8 inference with ByteTrack enabled for person class (class 0)
        results = model.track(frame, persist=True, tracker="bytetrack.yaml", classes=[0], verbose=False)

        # 1. More Robust Counting: Exponential Moving Average (EMA) to prevent flickering
        current_crowd_count = len(results[0].boxes) if results[0].boxes else 0
        if not hasattr(start_camera_monitoring, 'smoothed_count'):
            start_camera_monitoring.smoothed_count = current_crowd_count
        
        alpha = 0.2 # Smoothing factor
        start_camera_monitoring.smoothed_count = (alpha * current_crowd_count) + ((1 - alpha) * start_camera_monitoring.smoothed_count)
        display_count = int(round(start_camera_monitoring.smoothed_count))
        
        # Post to the FastAPI backend to update the live dashboard every 2 seconds
        if time.time() - last_post_time > 2:
            try:
                # In a real system, expected_devotees would be fetched from DB. Mocking for demonstration.
                expected = random.randint(10, 50) 
                requests.post(API_ENDPOINT, json={"detected_crowd": display_count, "expected_devotees": expected})
            except Exception as e:
                print("Failed to post to API:", e)
            last_post_time = time.time()
        
        # Draw bounding boxes
        annotated_frame = results[0].plot()

        # 2. Add Robust UI Overlays for Demo
        # Draw a virtual "Zone" rectangle to look professional
        height, width, _ = annotated_frame.shape
        cv2.rectangle(annotated_frame, (10, 10), (width-10, height-10), (255, 0, 0), 2)
        cv2.putText(annotated_frame, "ZONE A: ENTRY GATE", (20, 35), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 0, 0), 2)

        # FPS Counter for performance tracking
        if not hasattr(start_camera_monitoring, 'prev_frame_time'):
            start_camera_monitoring.prev_frame_time = time.time()
        new_frame_time = time.time()
        fps = 1/(new_frame_time-start_camera_monitoring.prev_frame_time) if (new_frame_time-start_camera_monitoring.prev_frame_time) > 0 else 30
        start_camera_monitoring.prev_frame_time = new_frame_time
        
        cv2.putText(annotated_frame, f"FPS: {int(fps)}", (width - 120, 35), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
        
        # Display Smoothed Crowd Count
        cv2.putText(annotated_frame, f"Detected Devotees: {display_count}", (20, 70), 
                    cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 3)
        
        cv2.imshow("Temple Crowd Monitor (Robust Mode)", annotated_frame)
        
        # Break loop on 'q' press
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    # To run this script locally:
    # pip install ultralytics opencv-python
    # python simulate_yolo.py
    start_camera_monitoring()
