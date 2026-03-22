import yaml
import os

cwd = os.getcwd()
possible_names = ["Garbage-Littering-Detection-1", "garbage-littering-detection-1"]
dataset_dir = None

for name in possible_names:
    if os.path.exists(os.path.join(cwd, name)):
        dataset_dir = os.path.join(cwd, name)
        break

if not dataset_dir:
    print("Error: Could not find the dataset folder. Please check the folder name.")
    exit()

print(f"Found dataset at: {dataset_dir}")

# 2. Update data.yaml
yaml_path = os.path.join(dataset_dir, "data.yaml")

with open(yaml_path, 'r') as f:
    data = yaml.safe_load(f)

data['path'] = dataset_dir
data['train'] = "train/images"
data['val'] = "train/images" 

if 'test' in data:
    del data['test']

with open(yaml_path, 'w') as f:
    yaml.dump(data, f)
