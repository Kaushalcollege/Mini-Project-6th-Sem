import yaml
import os

# 1. Detect the correct folder name (Case Sensitive fix)
cwd = os.getcwd()
possible_names = ["Garbage-Littering-Detection-1", "garbage-littering-detection-1"]
dataset_dir = None

for name in possible_names:
    if os.path.exists(os.path.join(cwd, name)):
        dataset_dir = os.path.join(cwd, name)
        break

if not dataset_dir:
    print("❌ Error: Could not find the dataset folder. Please check the folder name.")
    exit()

print(f"✅ Found dataset at: {dataset_dir}")

# 2. Update data.yaml
yaml_path = os.path.join(dataset_dir, "data.yaml")

with open(yaml_path, 'r') as f:
    data = yaml.safe_load(f)

# Force Absolute Paths & Fix Missing Validation Set
data['path'] = dataset_dir
data['train'] = "train/images"
# HACK: Point 'val' to 'train' because the 'valid' folder is missing
data['val'] = "train/images" 

# Remove 'test' if it exists to avoid errors
if 'test' in data:
    del data['test']

with open(yaml_path, 'w') as f:
    yaml.dump(data, f)

print(f"✅ Fixed data.yaml! Validation set linked to Training set.")
print("🚀 You can now run 'python3 train.py'")