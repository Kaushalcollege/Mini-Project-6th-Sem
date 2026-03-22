from ultralytics import YOLO
import os

# 1. Load the "nano" model (Smallest and fastest for prototypes)
model = YOLO('yolov8n.pt')

# 2. Locate your data.yaml file
# (Roboflow creates a folder with the dataset name. Check your folder if this name is slightly different)
dataset_path = os.path.join(os.getcwd(), "garbage-littering-detection-1", "data.yaml")

print(f"Training on dataset: {dataset_path}")

# 3. Train the model
# We set epochs=25 to get a result quickly (approx 15-30 mins on CPU, <5 mins on GPU)
results = model.train(
    data=dataset_path,
    epochs=25,
    imgsz=640,
    plots=True  # This creates graphs of how well it's learning
)

print("Training Complete! Best model saved in 'runs/detect/train/weights/best.pt'")