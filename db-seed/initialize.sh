#!/bin/bash

set -e
set -a
source .env
set -e

read_access_token() {
    echo "Fetching access token from Keycloak..."
    ACCESS_TOKEN=$(curl --silent --location "${KEYCLOAK_TOKEN_URI}" \
        --header 'Content-Type: application/x-www-form-urlencoded' \
        --data-urlencode 'grant_type=client_credentials' \
        --data-urlencode "client_id=${KEYCLOAK_CLIENT_ID}" \
        --data-urlencode "client_secret=${KEYCLOAK_CLIENT_SECRET}" \
        | jq -r '.access_token // empty')

    # Validate token presence
    if [ -z "${ACCESS_TOKEN}" ] || [ "${ACCESS_TOKEN}" = "null" ]; then
        echo "Error: Unable to obtain access token from Keycloak" >&2
        return 1
    fi

    # Basic JWT structure check (should have at least two dots)
    DOTS_COUNT=$(printf '%s' "${ACCESS_TOKEN}" | awk -F'.' '{print NF-1}')
    if [ -z "${DOTS_COUNT}" ] || [ "${DOTS_COUNT}" -lt 2 ]; then
        echo "Error: Received access token does not look like a JWT" >&2
        return 1
    fi

    export ACCESS_TOKEN
    echo "Access token obtained"
    return 0
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
         -H "Content-Type: application/json" \
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

if read_access_token; then
    initialize_items
else
    echo "Initialization aborted: invalid or missing access token." >&2
    exit 1
fi
