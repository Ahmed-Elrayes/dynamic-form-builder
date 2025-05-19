#!/bin/bash

# Exit on error
set -e

echo "Starting tests for dynamic-form-builder..."

# Clean dist directory if it exists
if [ -d "dist" ]; then
  echo "Cleaning dist directory..."
  rm -rf dist
fi

# Run the build process
echo "Building the package..."
npm run build

# Verify that the expected files are created
echo "Verifying build output..."
if [ ! -f "dist/index.js" ]; then
  echo "Error: dist/index.js not found!"
  exit 1
fi

if [ ! -f "dist/dynamic-form-builder.js" ]; then
  echo "Error: dist/dynamic-form-builder.js not found!"
  exit 1
fi

if [ ! -f "dist/types.js" ]; then
  echo "Error: dist/types.js not found!"
  exit 1
fi

if [ ! -d "dist/themes" ]; then
  echo "Error: dist/themes directory not found!"
  exit 1
fi

# Check if TypeScript declaration files are generated
if [ ! -f "dist/index.d.ts" ]; then
  echo "Error: dist/index.d.ts not found!"
  exit 1
fi

if [ ! -f "dist/dynamic-form-builder.d.ts" ]; then
  echo "Error: dist/dynamic-form-builder.d.ts not found!"
  exit 1
fi

if [ ! -f "dist/types.d.ts" ]; then
  echo "Error: dist/types.d.ts not found!"
  exit 1
fi

echo "Build verification successful!"

# Run the import test
echo "Running import test..."
node tests/import-test.js

echo "All tests passed!"
