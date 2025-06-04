#!/usr/bin/env bash

set -euo pipefail

ZIPFILE="overview-on-panel-click@sourcepit.org.shell-extension.zip"
TARGET_DIR="$HOME/shared/overview-on-panel-click@sourcepit.org"

# Check if the ZIP file exists
if [[ ! -f "$ZIPFILE" ]]; then
  echo "Error: File '$ZIPFILE' not found." >&2
  exit 1
fi

# Remove target directory if it exists, without prompting
rm -rf "$TARGET_DIR"

# Create target directory and extract contents
mkdir -p "$TARGET_DIR"
unzip -q "$ZIPFILE" -d "$TARGET_DIR"

echo "Successfully extracted to '$TARGET_DIR'."
