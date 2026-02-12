#!/usr/bin/env bash
# This file is kept for reference but not used when deploying via render.yaml Blueprint
# The Blueprint uses inline buildCommand and preDeployCommand instead

set -o errexit

pip install -r requirements.txt
python3 -m prisma generate