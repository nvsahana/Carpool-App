#!/usr/bin/env bash
set -o errexit

pip install -r requirements.txt
python3 -m prisma generate

# Run database migrations
cd prisma
python3 -m prisma db push --accept-data-loss
cd ..