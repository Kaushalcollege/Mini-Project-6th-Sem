import requests

url = "http://127.0.0.1:8000/register"

student = {"username": "student_test", "password": "password123", "role": "student"}
admin = {"username": "admin_test", "password": "password123", "role": "admin"}

print("Registering Student...")
print(requests.post(url, json=student).json())

print("Registering Admin...")
print(requests.post(url, json=admin).json())