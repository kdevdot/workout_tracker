#!/usr/bin/env bash
# Downloads selected wger.de exercise videos (CC-BY-SA 4.0, author: Goulart) and re-encodes them
# to small H.264 MP4s that play in every phone browser. Usage: scripts/fetch-videos.sh <id>...
# IDs are wger video IDs; attribution lives in src/domain/guides.ts.
set -euo pipefail
out="$(cd "$(dirname "$0")/.." && pwd)/public/videos"
work="$(mktemp -d)"
trap 'rm -rf "$work"' EXIT
for id in "$@"; do
  url=$(curl -fsS "https://wger.de/api/v2/video/$id/" | python3 -I -c 'import json,sys; print(json.load(sys.stdin)["video"])')
  curl -fsSL "$url" -o "$work/in"
  ffmpeg -loglevel error -y -i "$work/in" -an -vf "scale=-2:480,fps=30" -c:v libx264 -profile:v main \
    -pix_fmt yuv420p -crf 28 -preset slow -movflags +faststart "$out/wger-$id.mp4"
  ffmpeg -loglevel error -y -ss 1 -i "$out/wger-$id.mp4" -frames:v 1 -q:v 5 "$out/wger-$id.jpg"
  rm -f "$work/in"
  echo "wger-$id $(du -h "$out/wger-$id.mp4" | cut -f1)"
done
