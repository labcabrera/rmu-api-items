#!/bin/bash

set -e
set -a
source .env
set -e

ITEMS_DIR="items"

read_access_token() {
    echo "Fetching access token from Keycloak..."
    ACCESS_TOKEN=$(curl --silent --location "${KEYCLOAK_TOKEN_URI}" \
        --header 'Content-Type: application/x-www-form-urlencoded' \
        --data-urlencode 'grant_type=client_credentials' \
        --data-urlencode "client_id=${KEYCLOAK_CLIENT_ID}" \
        --data-urlencode "client_secret=${KEYCLOAK_CLIENT_SECRET}" \
        | jq -r '.access_token // empty')

    if [ -z "${ACCESS_TOKEN}" ] || [ "${ACCESS_TOKEN}" = "null" ]; then
        echo "Error: Unable to obtain access token from Keycloak" >&2
        return 1
    fi

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
    # Prepare payload by substituting environment variables in the file into a stream
    if command -v envsubst >/dev/null 2>&1; then
        payload=$(envsubst < "$filename")
    else
        # Fallback: replace literal $REALM_ID occurrences only
        if [ -z "${REALM_ID+x}" ]; then
            echo "Warning: REALM_ID not set, and envsubst not available; sending file as-is" >&2
            payload=$(cat "$filename")
        else
            # escape replacement value for sed
            esc_realm=$(printf '%s' "$REALM_ID" | sed -e 's/[\/&]/\\&/g')
            payload=$(sed "s/\$REALM_ID/${esc_realm}/g" "$filename")
        fi
    fi

    echo "$payload" | curl -X POST \
         -H "Content-Type: application/json" \
         -H "Accept: application/json" \
         -H "Authorization: Bearer $ACCESS_TOKEN" \
         -d @- \
         "$url" \
         -s --show-error \
         -w "\nHTTP Status: %{http_code}\nTotal Time: %{time_total}s\n"

    local exit_code=$?
    
    if [ ! $exit_code -eq 0 ]; then
        echo "Failed '$filename'"
    fi

    return $exit_code
}



initialize_items() {
    echo "Initializing items..."   
    for item_file in $(find "$ITEMS_DIR" -type f -o -type d); do
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
