#!/bin/bash

# Script to import all N5 units (or specific ones)
# Usage: ./scripts/import-all-n5.sh [unit_number]
# Example: ./scripts/import-all-n5.sh (imports all)
# Example: ./scripts/import-all-n5.sh 12 (imports only unit 12)

set -e

if [ "$1" ]; then
    UNIT_FILE="data/jlpt_n5/unit$1.json"
    if [ -f "$UNIT_FILE" ]; then
        echo "Importing single unit: $UNIT_FILE"
        npx tsx scripts/import-unit-data.ts "$UNIT_FILE"
    else
        echo "Error: File $UNIT_FILE not found."
        exit 1
    fi
else
    echo "Importing all available N5 units..."
    for file in data/jlpt_n5/unit*.json; do
        if [ -f "$file" ]; then
            echo "----------------------------------------"
            echo "Importing $file..."
            npx tsx scripts/import-unit-data.ts "$file"
        fi
    done
fi

echo "----------------------------------------"
echo "All done!"
