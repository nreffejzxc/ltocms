#!/bin/bash

# LTOCMS Backend Build Script
echo "🔧 Building LTOCMS Backend..."

# Check if TypeScript is available
if ! command -v tsc &> /dev/null; then
    echo "📦 TypeScript not found globally, using npx..."
    TSC_CMD="npx tsc"
else
    echo "✅ TypeScript found"
    TSC_CMD="tsc"
fi

# Clean previous build
echo "🧹 Cleaning previous build..."
rm -rf dist

# Build with TypeScript
echo "🏗️  Compiling TypeScript..."
if [ -f "tsconfig.build.json" ]; then
    echo "Using tsconfig.build.json..."
    $TSC_CMD -p tsconfig.build.json
else
    echo "Using default tsconfig.json..."
    $TSC_CMD
fi

# Check if build was successful
if [ -f "dist/server.js" ]; then
    echo "✅ Build successful! dist/server.js created"
    echo "📁 Build output:"
    ls -la dist/
    exit 0
else
    echo "❌ Build failed! dist/server.js not found"
    echo "📁 Current directory contents:"
    ls -la
    echo "📁 Dist directory contents (if exists):"
    ls -la dist/ 2>/dev/null || echo "dist/ directory does not exist"
    exit 1
fi