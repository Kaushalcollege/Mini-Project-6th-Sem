import requests

url = 'http://127.0.0.1:8000/detect' 
image_path = 'test2.jpg' 

print(f"Sending {image_path} to AI server...")

try:
    # 2. Open the image and send it
    with open(image_path, 'rb') as img:
        files = {'image': img}
        response = requests.post(url, files=files)

    # 3. Print the Result
    print("\n--- AI RESPONSE ---")
    print(f"Status Code: {response.status_code}")
    print(response.json())

except FileNotFoundError:
    print("Error: test_image.jpg not found. Please add an image to the folder.")
except Exception as e:
    print(f"Connection Error: Is the server running? ({e})")