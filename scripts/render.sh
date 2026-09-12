#!/usr/bin/env bash
# Render one cohort to mp4 + GIF + poster still.
#
#   npm run render engineers            -> out/Gravity-engineers-v1.*
#   npm run render engineers v3         -> out/Gravity-engineers-v3.*
#   npm run render all                  -> every cohort
#
# Never overwrite a previous render: bump the version tag instead. Old cuts
# get shared around and you want to be able to point at exactly one file.
set -euo pipefail
cd "$(dirname "$0")/.."

COHORT="${1:?usage: npm run render <cohort|all> [version]}"
VER="${2:-v1}"

if [ "$COHORT" = "all" ]; then
  for c in $(npx remotion compositions 2>/dev/null | awk '/^Gravity-/{print $1}' | sed 's/^Gravity-//'); do
    bash scripts/render.sh "$c" "$VER"
  done
  exit 0
fi

if [ ! -f public/fonts/ObviouslyNarrowBold.otf ]; then
  echo "missing public/fonts/ObviouslyNarrowBold.otf - see public/fonts/README.md" >&2
  exit 1
fi

ID="Gravity-$COHORT"
BASE="out/$ID-$VER"
mkdir -p out

if [ -e "$BASE.mp4" ]; then
  echo "refusing to overwrite $BASE.mp4 - pass a new version tag" >&2
  exit 1
fi

# 1080x1350 master at 25fps
npx remotion render "$ID" "$BASE.mp4" --scale=1.5

# GIF via ffmpeg palette at 25fps. Never the Remotion gif codec: it bands.
ffmpeg -y -loglevel error -i "$BASE.mp4" \
  -vf "fps=25,scale=720:900:flags=lanczos,palettegen=stats_mode=diff" -update 1 "/tmp/$ID-pal.png"
ffmpeg -y -loglevel error -i "$BASE.mp4" -i "/tmp/$ID-pal.png" \
  -lavfi "fps=25,scale=720:900:flags=lanczos[v];[v][1:v]paletteuse=dither=bayer:bayer_scale=4:diff_mode=rectangle" \
  "$BASE-720.gif"

# frame zero, at 2x - this is the poster, and on a muted feed it IS the ad
npx remotion still "$ID" "$BASE-frame1.png" --frame=0 --scale=2

ls -la "$BASE".* "$BASE"-*.* 2>/dev/null | awk '{printf "%-50s %6.1f MB\n", $9, $5/1048576}' | sort -u
