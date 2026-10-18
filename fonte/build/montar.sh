#!/bin/sh
# monta a pasta retrozap-site completa (site + função + README)
set -e
D=$(cd "$(dirname "$0")/.." && pwd)
python3 "$D/build/build.py"
python3 "$D/build/pages.py" > /dev/null
cp "$D/build/stats.js" "$D/retrozap-site/functions/api/stats.js"
cp "$D/build/ideias.js" "$D/retrozap-site/functions/api/ideias.js"
cp "$D/build/pix.js" "$D/retrozap-site/functions/api/pix.js"
cp "$D/build/README.md" "$D/retrozap-site/README.md"
cp "$D/build/gitignore" "$D/retrozap-site/.gitignore"
python3 "$D/build/og.py"
node --check "$D/build/prod_check.js"
# V2 roda como Cloudflare Worker (repositório gtorniero/retrozap)
mkdir -p "$D/retrozap-site/src"
cp "$D/build/worker/index.js" "$D/retrozap-site/src/index.js"
sed 's#../functions/api/stats.js#../functions/api/stats.js#' "$D/build/worker/index.js" > "$D/retrozap-site/src/index.js"
cp "$D/build/worker/wrangler.jsonc" "$D/retrozap-site/wrangler.jsonc"
rm -f "$D/retrozap-site/public/_redirects"
