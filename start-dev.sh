#!/bin/bash

# Start the React development server
npm run dev -- --host 0.0.0.0 &
REACT_PID=$!

# Wait for React server to start
echo "Waiting for React server to start..."
sleep 5

# Start Electron with dummy API key
export GEMINI_API_KEY=dummy-api-key
export NODE_ENV=development

# Compile TypeScript files
echo "Compiling TypeScript files..."
npm run tsc

# Start Electron
echo "Starting Electron..."
electron .

# Kill React server when Electron exits
kill $REACT_PID