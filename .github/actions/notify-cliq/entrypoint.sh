#!/bin/bash

set -e

# Ensure required variables are provided
if [ -z "$CLIQ_URL" ]; then
  echo "Error: CLIQ is not set."
  exit 1
fi


if [ -z "$MESSAGE" ]; then
  echo "Error: MESSAGE is not set."
  exit 1
fi

  # Create payload
  PAYLOAD=$(jq -n \
    --arg message "$MESSAGE" \
      '{"text": $message }')

# Send the message to ZOHO api
curl -X POST "$CLIQ_URL"  \
     -H "Content-Type: application/json" \
     -d "$PAYLOAD"

echo "Message sent to Cliq ."