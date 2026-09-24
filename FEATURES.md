# Smart Temple: Comprehensive Feature Breakdown

This document details every feature available in the Smart Temple platform, along with the underlying technology stack that powers it.

## 1. M/M/k Mathematical Queue Balancing
*   **Feature Description**: Instead of traditional First-Come-First-Serve (FCFS), the system uses Queuing Theory to dynamically balance the ratio of Online vs. Walk-in devotees being allowed into the temple. It actively calculates expected wait times and prevents either queue from stalling.
*   **Tech Stack**: 
    *   **Python / FastAPI**: Core logic mathematically calculates Lambda (arrival rate), Mu (service rate), and System Utilization (Rho).
    *   **SQLite**: Maintains the state of all active queues.

## 2. Real-Time YOLOv8 Crowd Tracking (Computer Vision)
*   **Feature Description**: An edge script captures live CCTV/Webcam feeds and uses AI to identify and count physical human bodies in the temple. If the physical count drastically exceeds the expected bookings, a "HIGH CONGESTION" alert is triggered.
*   **Tech Stack**:
    *   **Ultralytics YOLOv8**: High-speed, state-of-the-art object detection.
    *   **ByteTrack Algorithm**: Assigns IDs to devotees to prevent double-counting as they move across the camera frame.
    *   **OpenCV**: Handles the raw video stream and draws visual bounding boxes for staff validation.

## 3. Asynchronous WebSocket Alerts
*   **Feature Description**: When the CV engine detects a crowd surge, it bypasses standard polling and instantly pushes a WebSocket message to the browser.
*   **Tech Stack**:
    *   **FastAPI WebSockets**: Maintains an open TCP connection with the client browser.
    *   **React `useEffect`**: Listens for WebSocket messages and instantly triggers state updates.

## 4. Secure Devotee Portal & JWT Authentication
*   **Feature Description**: Devotees can register, login securely, select dates, and book Darshan slots.
*   **Tech Stack**:
    *   **Jose / Passlib (Bcrypt)**: Hashes passwords before storing them in the database and generates encrypted JSON Web Tokens (JWT).
    *   **React LocalStorage**: Safely stores the JWT on the client side to append to future HTTP requests.

## 5. Dynamic QR Code e-Tokens
*   **Feature Description**: Upon successful booking, the system generates a scannable QR Code that the devotee can present at the smart entrance gates.
*   **Tech Stack**:
    *   **`qrcode.react`**: Renders SVG-based QR codes instantly on the client side without needing backend image generation.

## 6. VIP/Senior Citizen Priority Flags
*   **Feature Description**: Devotees can mark themselves as Senior Citizens or differently-abled, ensuring their token is expedited through the Queue Engine logic.
*   **Tech Stack**:
    *   **React Forms**: UI toggle seamlessly integrated into the checkout flow.

## 7. IoT Environment Dashboard (Mocked for Demo)
*   **Feature Description**: Displays Ambient Temperature, Indoor AQI, and Security Status to show integration readiness with physical temple hardware.
*   **Tech Stack**:
    *   **TailwindCSS & Lucide Icons**: Creates a gorgeous, easily readable grid layout for critical environmental metrics.
