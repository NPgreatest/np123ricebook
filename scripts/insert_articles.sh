#!/bin/bash

# API URLs
LOGIN_URL="http://localhost:3000/auth/login"
POST_URL="http://localhost:3000/articles"

# Login credentials
USERNAME="NP_1234"
PASSWORD="12345678"

# List of random article texts
TEXTS=(
    "Exploring the wonders of the universe with James Webb Telescope."
    "10 tips to improve your coding skills today!"
    "The art of minimalism: Living with less for a fuller life."
    "Breaking news: Major breakthrough in renewable energy technology."
    "Travel guide: Top 5 destinations for adventure seekers."
    "Healthy living: How to maintain a balanced diet on a busy schedule."
    "AI in 2024: Transforming industries and daily life."
    "Understanding blockchain technology: A guide for beginners."
    "The rise of electric vehicles: What it means for the environment."
    "Top strategies to manage stress and increase productivity."
)

# Step 1: Login and acquire the session cookie
echo "Logging in as $USERNAME..."
LOGIN_RESPONSE=$(curl --silent --location --cookie-jar cookies.txt $LOGIN_URL \
    --header 'Content-Type: application/json' \
    --data "{\"username\":\"$USERNAME\",\"password\":\"$PASSWORD\"}")

LOGIN_MESSAGE=$(echo $LOGIN_RESPONSE | jq -r '.message')

if [[ "$LOGIN_MESSAGE" != "Login successful" ]]; then
    echo "Login failed! Check your username and password."
    exit 1
fi

echo "Login successful. Session cookie acquired."

# Step 2: Post 10 random articles using the session cookie
echo "Inserting articles..."
for i in {1..10}; do
    RANDOM_TEXT=${TEXTS[$RANDOM % ${#TEXTS[@]}]} # Pick a random text from the list

    POST_RESPONSE=$(curl --silent --location --cookie cookies.txt $POST_URL \
        --header "Content-Type: application/json" \
        --data "{\"text\":\"$RANDOM_TEXT\"}")

    echo "Inserted Article $i: $RANDOM_TEXT"
    echo "Response: $POST_RESPONSE"

    sleep 1
done

# Clean up
rm cookies.txt