#!/bin/sh

# Check if we are in a git repository
if [ -d ".git" ]; then
  echo "[Update] Checking for updates from GitHub..."
  git fetch origin
  
  LOCAL=$(git rev-parse @)
  REMOTE=$(git rev-parse @{u})

  if [ "$LOCAL" != "$REMOTE" ]; then
    echo "[Update] New version detected. Pulling changes..."
    git pull
    echo "[Update] Reinstalling dependencies..."
    npm install
    echo "[Update] Rebuilding frontend..."
    npm run build
    echo "[Update] Restarting server..."
  else
    echo "[Update] Already up to date."
  fi
else
  echo "[Update] Not a git repository. Skipping update check."
fi

# Start the application
exec npm start
