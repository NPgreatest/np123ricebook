#!/bin/bash

# API URL
REGISTER_URL="http://localhost:3000/auth/register"

# Influencers to register
INFLUENCERS=(
    "Elon Musk"
    "Barack Obama"
    "Satya Nadella"
    "Sundar Pichai"
    "Tim Cook"
    "Jeff Bezos"
    "Jack Dorsey"
    "Donald J. Trump"
    "Bill Gates"
    "Mark Zuckerberg"
)

# Mock details for registration
EMAIL_DOMAIN="example.com"
PHONE_PREFIX="123-456"
ZIP_CODE="12345"

# Function to generate random DOBs
generate_dob() {
    year=$((RANDOM % 30 + 1970))  # Random year between 1970 and 1999
    month=$((RANDOM % 12 + 1))    # Random month
    day=$((RANDOM % 28 + 1))      # Random day
    printf "%04d-%02d-%02d" "$year" "$month" "$day"
}

# Register each influencer
for influencer in "${INFLUENCERS[@]}"; do
    USERNAME=$(echo "$influencer" | tr ' ' '_') # Replace spaces with underscores for username
    PASSWORD="password123" # Default password
    EMAIL="${USERNAME}@${EMAIL_DOMAIN}" # Lowercase username for email
    DOB=$(generate_dob) # Generate random DOB
    PHONE="${PHONE_PREFIX}-${RANDOM:0:4}" # Mock phone number
    ZIPCODE="$ZIP_CODE" # Use static ZIP code for simplicity

    echo "Registering $influencer..."
    RESPONSE=$(curl --silent --location --header "Content-Type: application/json" \
        --data "{
            \"username\": \"$USERNAME\",
            \"password\": \"$PASSWORD\",
            \"email\": \"$EMAIL\",
            \"dob\": \"$DOB\",
            \"phone\": \"$PHONE\",
            \"zipcode\": \"$ZIPCODE\"
        }" \
        $REGISTER_URL)

    echo "Response: $RESPONSE"
    sleep 1 # Avoid overloading the server
done

echo "Registration complete!"
