#!/bin/bash

# Stop on error
set -e

# Run Prisma migration
npx prisma migrate deploy
npx tsx scripts/import-unit-data.ts data/unit15.json
npx tsx scripts/import-unit-data.ts data/unit16.json

# kanji
npx tsx scripts/import-kanji.ts data/kanji_n5.json