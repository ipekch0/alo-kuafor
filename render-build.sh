#!/usr/bin/env bash
# Exit on error
set -o errexit

echo "------------------------------------------------"
echo "🚀 RENDER BUILD SCRIPT STARTED"
echo "------------------------------------------------"

echo "📍 Current Directory: $(pwd)"
echo "📂 Listing Root Files:"
ls -la

if [ -d "server" ]; then
  echo "📦 Installing Dependencies (Root)..."
  npm install --legacy-peer-deps
  
  echo "🏗️  Building Frontend..."
  npx vite build

  echo "➡️  Entering server directory..."
  cd server
  
  echo "📦 Installing Dependencies (Server)..."
  npm install
  
  echo "🛠️  Generating Prisma Client..."
  npx prisma generate
  
  echo "✅ Build Complete!"
else
  echo "❌ ERROR: 'server' directory NOT FOUND in $(pwd)"
  echo "🔍 Searching for 'server' directory in subfolders..."
  find . -type d -name "server" -not -path '*/.*'
  
  echo "------------------------------------------------"
  echo "💀 BUILD FAILED: Could not locate server folder."
  exit 1
fi
