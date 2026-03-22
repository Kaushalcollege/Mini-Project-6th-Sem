from roboflow import Roboflow
from dotenv import load_dotenv
import os

load_dotenv()

ROBOFLOW_API_KEY = os.getenv("ROBOFLOW_API_KEY")

# Initialize
rf = Roboflow(api_key=ROBOFLOW_API_KEY)
project = rf.workspace("trafficvmd").project("garbage-littering-detection")
dataset = project.version(1).download("yolov8")

# Check the classes
import yaml
with open(f"{dataset.location}/data.yaml", 'r') as f:
    data = yaml.safe_load(f)
    print("\n--- DATASET CLASSES ---")
    print(data['names'])