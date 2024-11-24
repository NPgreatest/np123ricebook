#!/bin/bash

# API URLs
LOGIN_URL="http://localhost:3000/auth/login"
ARTICLES_URL="http://localhost:3000/articles"

# Login credentials
USERNAME="NP_123"
PASSWORD="123456"

# Step 1: Login and acquire session cookie
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
echo ""

# Step 2: Fetch articles without login (unauthenticated)
echo "Fetching articles without login..."
UNAUTH_RESPONSE=$(curl --silent --location $ARTICLES_URL \
    --header 'Content-Type: application/json')

echo "Response (Unauthenticated):"
echo "$UNAUTH_RESPONSE"
echo ""

# Step 3: Fetch articles using the session cookie
echo "Fetching articles with login..."
AUTH_RESPONSE=$(curl --silent --location --cookie cookies.txt $ARTICLES_URL \
    --header "Content-Type: application/json")

echo "Response (Authenticated):"
echo "$AUTH_RESPONSE"
echo ""

# Step 4: Fetch a specific article by ID (replace 123 with your test ID)
ARTICLE_ID="123"
echo "Fetching article with ID $ARTICLE_ID..."
ARTICLE_RESPONSE=$(curl --silent --location --cookie cookies.txt "$ARTICLES_URL/$ARTICLE_ID" \
    --header "Content-Type: application/json")

echo "Response (Article ID $ARTICLE_ID):"
echo "$ARTICLE_RESPONSE"
echo ""

# Step 5: Fetch paginated articles (Page 2, 5 articles per page)
echo "Fetching paginated articles (page=2, size=5)..."
PAGINATED_RESPONSE=$(curl --silent --location --cookie cookies.txt "$ARTICLES_URL?ps=5&pn=2" \
    --header "Content-Type: application/json")

echo "Response (Paginated):"
echo "$PAGINATED_RESPONSE"
echo ""

# Clean up
rm cookies.txt
echo "Testing completed."
