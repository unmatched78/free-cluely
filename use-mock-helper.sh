#!/bin/bash

# Check if the original file exists
if [ ! -f "/workspace/free-cluely/electron/main.ts" ]; then
  echo "Error: main.ts file not found!"
  exit 1
fi

# Create a backup of the original file
cp /workspace/free-cluely/electron/main.ts /workspace/free-cluely/electron/main.ts.bak

# Replace the import statement for ProcessingHelper
sed -i 's/import { ProcessingHelper } from ".\/ProcessingHelper"/import { ProcessingHelper } from ".\/ProcessingHelperMock"/' /workspace/free-cluely/electron/main.ts

echo "Modified main.ts to use ProcessingHelperMock"