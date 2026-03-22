import os
import uuid
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from ultralytics import YOLO
import cv2
import numpy as np
from datetime import datetime

# Import the database connection function from your db.py file
from db import get_db_connection

app = Flask(__name__)
# Enable CORS so React can communicate with Flask
CORS(app) 

# Configuration
UPLOAD_FOLDER = 'static/uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Load the model (ensure this path is correct for your trained model)
MODEL_PATH = 'runs/detect/train2/weights/best.pt'

# --- ROUTE: Serve Uploaded Images ---
@app.route('/static/uploads/<filename>')
def serve_image(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

# --- ROUTE: User Registration ---
@app.route('/register', methods=['POST'])
def register():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    role = data.get('role', 'student') # Default to student

    if not username or not password:
        return jsonify({"error": "Username and password required"}), 400

    hashed_pw = generate_password_hash(password)
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500

    try:
        cur = conn.cursor()
        cur.execute(
            "INSERT INTO users (username, password_hash, role) VALUES (%s, %s, %s) RETURNING id, username, role, civic_score",
            (username, hashed_pw, role)
        )
        new_user = cur.fetchone()
        conn.commit()
        cur.close()
        conn.close()
        
        return jsonify({
            "message": "User registered successfully",
            "user": {"id": new_user[0], "username": new_user[1], "role": new_user[2], "civic_score": new_user[3]}
        }), 201
    except Exception as e:
        if conn: conn.close()
        return jsonify({"error": "Username might already exist"}), 400

# --- ROUTE: User Login (UPDATED) ---
@app.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500

    cur = conn.cursor()
    # Now fetching email, phone_number, and created_at as well
    cur.execute("SELECT id, username, password_hash, role, civic_score, email, phone_number, created_at FROM users WHERE username = %s", (username,))
    user = cur.fetchone()
    cur.close()
    conn.close()

    if user and check_password_hash(user[2], password):
        # Format the created_at date nicely if it exists
        member_since = user[7].strftime("%b %Y") if user[7] else "Mar 2026"
        return jsonify({
            "message": "Login successful",
            "user": {
                "id": user[0], "username": user[1], "role": user[3], 
                "civic_score": user[4], "email": user[5], 
                "phone_number": user[6], "member_since": member_since
            }
        }), 200
    else:
        return jsonify({"error": "Invalid credentials"}), 401


# --- ROUTE: Fetch User History (UPDATED) ---
@app.route('/user/<int:user_id>/incidents', methods=['GET'])
def get_user_incidents(user_id):
    conn = get_db_connection()
    if not conn: return jsonify({"error": "Database connection failed"}), 500

    try:
        cur = conn.cursor()
        # FIXED: Changed 'timestamp' to 'time_stamp' to match your PostgreSQL schema
        cur.execute("""
            SELECT i.id, i.status, i.time_stamp, i.image_url, 
                   (SELECT class_name FROM detections d WHERE d.incident_id = i.id LIMIT 1) as detected_class
            FROM incidents i 
            WHERE user_id = %s 
            ORDER BY i.time_stamp DESC
        """, (user_id,))
        
        rows = cur.fetchall()
        history = []
        for row in rows:
            history.append({
                "id": row[0],
                "status": row[1],
                "time": row[2].strftime("%b %d, %Y - %I:%M %p"),
                "image_url": row[3],
                "detected_class": row[4] or "Clean Area"
            })
            
        cur.close()
        conn.close()
        return jsonify(history), 200
    except Exception as e:
        if conn: conn.close()
        return jsonify({"error": str(e)}), 500


# --- ROUTE: Admin Fetch All Incidents (UPDATED) ---
@app.route('/admin/incidents', methods=['GET'])
def get_all_incidents():
    conn = get_db_connection()
    if not conn: return jsonify({"error": "Database connection failed"}), 500

    try:
        cur = conn.cursor()
        # ADDED i.image_url to the SELECT statement
        cur.execute("""
            SELECT i.id, i.time_stamp, i.location, i.status, u.username,
                   (SELECT class_name FROM detections d WHERE d.incident_id = i.id LIMIT 1) as detected_class,
                   (SELECT confidence FROM detections d WHERE d.incident_id = i.id LIMIT 1) as confidence,
                   i.image_url
            FROM incidents i
            JOIN users u ON i.user_id = u.id
            ORDER BY i.time_stamp DESC
        """)
        rows = cur.fetchall()
        incidents = []
        for r in rows:
            conf = r[6] if r[6] else 0.0
            priority = "high" if r[3] == "violation" and conf > 0.8 else ("medium" if r[3] == "violation" else "low")
            
            incidents.append({
                "id": f"INC-{r[0]}",
                "timestamp": r[1].strftime("%b %d, %Y - %I:%M %p"),
                "location": r[2] or "Campus Default",
                "status": r[3],
                "reportedBy": r[4],
                "detectedClass": r[5] or "None",
                "confidence": round(conf, 2),
                "priority": priority,
                "image_url": r[7] # Added the image URL to the JSON response
            })
        cur.close()
        conn.close()
        return jsonify(incidents), 200
    except Exception as e:
        if conn: conn.close()
        return jsonify({"error": str(e)}), 500
    
# --- ROUTE: AI Detection & Database Logging ---
@app.route('/detect', methods=['POST'])
def detect():
    if not os.path.exists(MODEL_PATH):
        return jsonify({"error": "Model is still training. Please wait."}), 503

    if 'image' not in request.files or 'user_id' not in request.form:
        return jsonify({"error": "Image and user_id are required"}), 400
    
    user_id = request.form['user_id']
    location = request.form.get('location', 'Unknown')
    file = request.files['image']

    # 1. Save the image locally
    filename = f"{uuid.uuid4().hex}_{file.filename}"
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(filepath)
    image_url = f"http://127.0.0.1:8000/{filepath}"

    # 2. Run AI Inference
    img = cv2.imread(filepath)
    model = YOLO(MODEL_PATH)
    results = model(img)
    
    # 3. Process Results
    detections = []
    status = "clean" 
    
    for r in results:
        for box in r.boxes:
            class_id = int(box.cls[0])
            conf = float(box.conf[0])
            class_name = model.names[class_id]
            
            # Extract Bounding Box coordinates
            x1, y1, x2, y2 = box.xyxy[0].tolist()
            w = x2 - x1
            h = y2 - y1
            
            if class_name.lower() in ['littering', 'throwing', 'waste', 'plastic bottle', 'garbage']:
                status = "violation"
            
            detections.append({
                "class_name": class_name,
                "confidence": round(conf, 2),
                "bbox_x": x1, "bbox_y": y1, "bbox_w": w, "bbox_h": h
            })

    # 4. Save everything to PostgreSQL
    conn = get_db_connection()
    if conn:
        cur = conn.cursor()
        # Insert Incident
        cur.execute(
            "INSERT INTO incidents (user_id, image_url, status, location) VALUES (%s, %s, %s, %s) RETURNING id",
            (user_id, image_url, status, location)
        )
        incident_id = cur.fetchone()[0]

        # Insert Detections
        for det in detections:
            cur.execute(
                "INSERT INTO detections (incident_id, class_name, confidence, bbox_x, bbox_y, bbox_w, bbox_h) VALUES (%s, %s, %s, %s, %s, %s, %s)",
                (incident_id, det['class_name'], det['confidence'], det['bbox_x'], det['bbox_y'], det['bbox_w'], det['bbox_h'])
            )
        
        # Update User's Civic Score (Penalty for violation, reward for clean)
        if status == "violation":
            cur.execute("UPDATE users SET civic_score = civic_score - 5 WHERE id = %s", (user_id,))
        else:
            cur.execute("UPDATE users SET civic_score = civic_score + 2 WHERE id = %s", (user_id,))

        conn.commit()
        cur.close()
        conn.close()

    # 5. Return JSON Report to Frontend
    return jsonify({
        "message": "Analysis complete",
        "incident_id": incident_id if conn else None,
        "status": status,
        "image_url": image_url,
        "details": detections
    }), 200

# --- ROUTE: Admin Resolve Incident (NEW) ---
@app.route('/admin/incidents/<int:incident_id>/resolve', methods=['PATCH'])
def resolve_incident(incident_id):
    conn = get_db_connection()
    if not conn: return jsonify({"error": "Database connection failed"}), 500

    try:
        cur = conn.cursor()
        # Update the status to 'clean' (resolved)
        cur.execute(
            "UPDATE incidents SET status = 'clean' WHERE id = %s RETURNING id",
            (incident_id,)
        )
        updated_id = cur.fetchone()
        conn.commit()
        cur.close()
        conn.close()
        
        if updated_id:
            return jsonify({"message": "Incident resolved successfully"}), 200
        else:
            return jsonify({"error": "Incident not found"}), 404
    except Exception as e:
        if conn: conn.close()
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=8000)