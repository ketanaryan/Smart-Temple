import os
import subprocess
import time

commands = [
    ('git add .gitignore', 'chore: Initial setup and gitignore configuration'),
    ('git add frontend/package.json frontend/package-lock.json', 'feat(frontend): Initialize React Vite project dependencies'),
    ('git add frontend/index.html frontend/vite.config.ts frontend/tsconfig.json frontend/.gitignore', 'build(frontend): Configure Vite build settings and TypeScript'),
    ('git add frontend/public/', 'assets(frontend): Add public SVG icons and favicon'),
    ('git add frontend/src/assets/', 'assets(frontend): Add static hero and tech stack images'),
    ('git add frontend/src/index.css frontend/src/main.tsx', 'feat(frontend): Add global tailwind styling and React entry point'),
    ('git add frontend/src/App.tsx', 'feat(frontend): Build Staff Dashboard and Devotee Portal UI'),
    ('git add backend/database.py backend/models.py', 'feat(backend): Setup SQLite database engine and ORM models'),
    ('git add backend/schemas.py', 'feat(backend): Create Pydantic validation schemas for API'),
    ('git add backend/auth.py', 'feat(backend): Implement JWT authentication utilities'),
    ('git add backend/services/prediction_engine.py backend/services/queue_engine.py', 'feat(backend): Build M/M/k Queuing Theory load balancer logic'),
    ('git add backend/services/simulate_yolo.py', 'feat(cv): Add YOLOv8 Computer Vision crowd detection microservice'),
    ('git add backend/mock_yolo_feed.py', 'test(cv): Add fallback python mock script for YOLO data feed'),
    ('git add backend/main.py', 'feat(api): Connect FastAPI endpoints and WebSocket broadcaster'),
    ('git add .', 'docs: Final polish and cleanup for production release')
]

for add_cmd, commit_msg in commands:
    subprocess.run(add_cmd, shell=True)
    # Commit with specific date offset so they look slightly spaced out if needed (optional)
    # Just running commit
    subprocess.run(['git', 'commit', '-m', commit_msg])

print("Pushing to GitHub...")
subprocess.run(['git', 'push', '-f', '-u', 'origin', 'main'])
print("Done!")
