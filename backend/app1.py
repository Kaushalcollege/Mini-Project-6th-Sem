import os
from flask import Flask, request, jsonify
from ultralytics import YOLO
import cv2
import numpy as np
from datetime import datetime

app = Flask(__name__)

# Load the model (It will look for the file created by train.py)
# Note: This file will exist AFTER your training finishes
MODEL_PATH = 'runs/detect/train2/weights/best.pt'

@app.route('/')
def home():
    return "Civic Sense AI Backend is Running!"

@app.route('/detect', methods=['POST'])
def detect():
    # 1. Check if model exists yet
    if not os.path.exists(MODEL_PATH):
        return jsonify({"error": "Model is still training. Please wait."}), 503

    model = YOLO(MODEL_PATH)

    # 2. Get Image from Request
    if 'image' not in request.files:
        return jsonify({"error": "No image uploaded"}), 400
    
    file = request.files['image']
    img_array = np.frombuffer(file.read(), np.uint8)
    img = cv2.imdecode(img_array, cv2.IMREAD_COLOR)

    # 3. Run AI Inference
    results = model(img)
    
    # 4. Process Results
    detections = []
    status = "Civic Sense Maintained" # Innocent until proven guilty
    
    for r in results:
        for box in r.boxes:
            class_id = int(box.cls[0])
            conf = float(box.conf[0])
            class_name = model.names[class_id]
            
            # Logic: If we see 'Littering' (or whatever the bad class is named)
            if class_name.lower() in ['littering', 'throwing', 'waste']:
                status = "Civic Sense Violated"
            
            detections.append({
                "class": class_name,
                "confidence": round(conf, 2)
            })

    # 5. Return JSON Report
    response = {
        "timestamp": datetime.now().isoformat(),
        "status": status,
        "details": detections,
        "action_required": "Warning Issued" if status == "Civic Sense Violated" else "None"
    }
    
    return jsonify(response)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True)