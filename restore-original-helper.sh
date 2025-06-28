#!/bin/bash

# Check if the backup file exists
if [ ! -f "/workspace/free-cluely/electron/main.ts.bak" ]; then
  echo "Error: Backup file not found!"
  exit 1
fi

# Restore the original file
cp /workspace/free-cluely/electron/main.ts.bak /workspace/free-cluely/electron/main.ts

echo "Restored original main.ts file"