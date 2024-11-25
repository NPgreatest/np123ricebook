import os
import csv
import json
import hashlib
import requests
from pathlib import Path
import random
# Configurations
LOGIN_URL = "http://localhost:3000/auth/login"
POST_URL = "http://localhost:3000/articles"
PICTURES_DIR = "./pictures"
OPENAI_DALLE_ENDPOINT = "https://api.openai.com/v1/images/generations"
OPENAI_API_KEY = "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"  # Replace with your OpenAI API key
DEFAULT_PASSWORD = "password123"

# Ensure the pictures directory exists
os.makedirs(PICTURES_DIR, exist_ok=True)

def hash_content(content):
    """Generate a hash for the content."""
    return hashlib.md5(content.encode()).hexdigest()

def login(username, password):
    """Simulate login and return the session."""
    response = requests.post(LOGIN_URL, json={"username": username, "password": password})
    if response.status_code == 200 and response.json().get("message") == "Login successful":
        # Extract the cookie value
        cookie_value = response.cookies.get('sid')  # 'sid' is your cookieKey
        cookies = {'sid': cookie_value}
        print(f"Login successful for {username}")
        return cookies
    else:
        print(f"Login failed for {username}: {response.text}")
        return None

def post_tweet(cookies, text, image_files):
    """Post the tweet with the provided text and image files."""
    files = [("pictures", (os.path.basename(img), open(img, "rb"))) for img in image_files]
    data = {"text": text}
    # Make sure to include the cookies in the request
    headers = {'Cookie': f'sid={cookies["sid"]}'}
    response = requests.post(POST_URL, headers=headers, data=data, files=files)
    if response.status_code == 201:
        print(f"Tweet posted successfully: {response.json()}")
    else:
        print(f"Error posting tweet: {response.text}")



def generate_images(prompt, hash_key, count=2):
    """Generate images using OpenAI's DALL-E API, if not already saved."""
    saved_files = []
    for i in range(count):
        filename = os.path.join(PICTURES_DIR, f"{hash_key}_{i}.jpg")
        if os.path.exists(filename):
            print(f"Image already exists: {filename}")
            saved_files.append(filename)
        else:
            headers = {"Authorization": f"Bearer {OPENAI_API_KEY}"}
            response = requests.post(OPENAI_DALLE_ENDPOINT, headers=headers, json={"prompt": prompt, "n": 1, "size": "1024x1024"})
            if response.status_code == 200:
                data = response.json()
                image_url = data["data"][0]["url"]
                img_response = requests.get(image_url)
                with open(filename, "wb") as f:
                    f.write(img_response.content)
                saved_files.append(filename)
            else:
                print(f"Error generating image: {response.text}")
    return saved_files


def post_tweet(cookies, text, image_files):
    """Post the tweet with the provided text and image files."""
    files = [("pictures", (os.path.basename(img), open(img, "rb"))) for img in image_files]
    data = {"text": text}
    response = requests.post(POST_URL, cookies=cookies, data=data, files=files)
    if response.status_code == 201:
        print(f"Tweet posted successfully: {response.json()}")
    else:
        print(f"Error posting tweet: {response.text}")

def process_post(row):
    """Process a single post."""
    username = row["author"].replace(" ", "_")
    text = row["text"]

    # Login and get cookies
    cookies = login(username, DEFAULT_PASSWORD)
    if not cookies:
        print(f"No cookies for {username}")
        return

    # Generate a hash for the content
    hash_key = hash_content(text)
    
    # Generate images
    image_files = generate_images(text, hash_key, count=2)
    
    # Post the tweet
    post_tweet(cookies, text, image_files)

def main():
    # Read the CSV file in sequence
    with open("posts.csv", "r") as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            print(f"Processing post for {row['author']}...")
            process_post(row)

if __name__ == "__main__":
    main()
