#!/bin/bash
# Replace API URL placeholders with actual Render gateway URL before building
# RENDER_API_URL should be set in Render's environment variables
# e.g. https://jj-gateway.onrender.com/api

API_URL="${RENDER_API_URL:-/api}"
GATEWAY_URL="${RENDER_GATEWAY_URL:-}"

echo "Building with API_URL=$API_URL, GATEWAY_URL=$GATEWAY_URL"

sed -i "s|%%API_URL%%|${API_URL}|g" src/environments/environment.prod.ts
sed -i "s|%%GATEWAY_URL%%|${GATEWAY_URL}|g" src/environments/environment.prod.ts

cat src/environments/environment.prod.ts

npm install
npm run build
