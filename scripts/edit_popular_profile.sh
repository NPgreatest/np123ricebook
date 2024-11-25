#!/bin/bash

# API URLs
LOGIN_URL="http://localhost:3000/auth/login"
UPDATE_PROFILE_URL="http://localhost:3000/profile"
PEOPLE_FILE="./peoples.txt"
DEFAULT_PASSWORD="password123"

echo "Processing influencer profiles..."

while IFS=',' read -r NAME PICTURE_URL; do
    USERNAME=$(echo "$NAME" | tr ' ' '_')
    PICTURE_URL=$(echo "$PICTURE_URL" | xargs)

    echo "Logging in as $USERNAME..."

    # Login
    LOGIN_RESPONSE=$(curl --silent --location --cookie-jar cookies.txt $LOGIN_URL \
        --header "Content-Type: application/json" \
        --data "{\"username\":\"$USERNAME\",\"password\":\"$DEFAULT_PASSWORD\"}")

    LOGIN_MESSAGE=$(echo "$LOGIN_RESPONSE" | jq -r '.message')

    if [[ "$LOGIN_MESSAGE" != "Login successful" ]]; then
        echo "Login failed for $USERNAME. Skipping..."
        continue
    fi

    echo "Login successful for $USERNAME."

    # Download image to temp file
    TEMP_FILE=$(mktemp)
    curl -s "$PICTURE_URL" -o "$TEMP_FILE"

    # Update profile with image file
    echo "Updating profile picture for $USERNAME"
    UPDATE_RESPONSE=$(curl --silent --location --cookie cookies.txt $UPDATE_PROFILE_URL \
        --request PUT \
        --form "picture=@$TEMP_FILE" \
        --form "Content-Type=image/jpeg")

    echo "Response for $USERNAME: $UPDATE_RESPONSE"
    
    # Cleanup
    rm "$TEMP_FILE"
    rm cookies.txt
    sleep 1

done < "$PEOPLE_FILE"

echo "Profile updates complete!"
