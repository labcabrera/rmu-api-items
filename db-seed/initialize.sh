#!/bin/bash

set -a
source ../.env
set -e
DEFAULT_BASE_URL="http://localhost:3006/v1"
DEFAULT_CONTENT_TYPE="application/json"

read_access_token() {
    echo "Fetching access token from ${RMU_IAM_TOKEN_URI}"
    echo " Client: ${RMU_IAM_CLIENT_ID}"
    echo " Secret: ${RMU_IAM_CLIENT_SECRET}"

    ACCESS_TOKEN=$(curl --location "${RMU_IAM_TOKEN_URI}" --silent \
        --header 'Content-Type: application/x-www-form-urlencoded' \
        --data-urlencode 'grant_type=password' \
        --data-urlencode "client_id=${RMU_IAM_CLIENT_ID}" \
        --data-urlencode "client_secret=${RMU_IAM_CLIENT_SECRET}" \
        --data-urlencode "username=${RMU_IAM_USERNAME}" \
        --data-urlencode "password=${RMU_IAM_PASSWORD}" \
        | jq -r '.access_token')

    echo "Token: $ACCESS_TOKEN"
        
    export ACCESS_TOKEN
}

send_file_to_service() {
    local filename="$1"
    local endpoint="$2"
    
    if [ -z "$filename" ] || [ -z "$endpoint" ]; then
        echo "Error: filename and endpoint are required"
        return 1
    fi
    
    if [ ! -f "$filename" ]; then
        echo "Error: File '$filename' not found"
        return 1
    fi

    local url="$DEFAULT_BASE_URL/$endpoint"

    curl -X POST \
         -H "Content-Type: $DEFAULT_CONTENT_TYPE" \
         -H "Accept: application/json" \
         -H "Authorization: Bearer $ACCESS_TOKEN" \
         -d @"$filename" \
         "$url" \
         -s --show-error \
         -w "\nHTTP Status: %{http_code}\nTotal Time: %{time_total}s\n" \
    
    local exit_code=$?
    
    if [ $exit_code -eq 0 ]; then
        echo "Processed '$filename'"
    else
        echo "Failed '$filename'"
    fi
    
    return $exit_code
}



initialize_items() {
    echo "Initializing items..."   
    for item_file in $(find items -type f -o -type d); do
        if [ -f "$item_file" ]; then
            send_file_to_service "$item_file" "items"
            echo ""
        fi
    done
    echo "Items data initialization completed"
}

read_access_token
initialize_items
