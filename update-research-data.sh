#!/usr/bin/env sh
set -eu

ROOT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"

usage() {
  cat <<'EOF'
Usage:
  ./update-research-data.sh [options]

Updates only the private datas bucket:
  1. Generate tree.json from top-level directories under research/
  2. Clean objects in the datas bucket, without deleting the bucket
  3. Upload filtered research/ and tree.json to the datas bucket
     - node_modules, .DS_Store, and .gitkeep are excluded
  4. Verify tree.json and the first project entry

Examples:
  ./update-research-data.sh --dry-run
  ./update-research-data.sh

Options are passed through to upload.js:
  --dry-run
  --endpoint <endpoint>
  --region <region>
  --datas-bucket <bucket>
  --profile <profile>
  --config-file <file>

Environment defaults:
  DATAS_BUCKET=research-pages
  OSS_ENDPOINT=oss-cn-shenzhen.aliyuncs.com
  OSS_REGION=cn-shenzhen
EOF
}

for arg in "$@"; do
  case "$arg" in
    -h|--help)
      usage
      exit 0
      ;;
    --preview)
      echo "Error: update-research-data.sh only updates the datas bucket. Use npm run deploy to update preview too." >&2
      exit 2
      ;;
  esac
done

if ! command -v node >/dev/null 2>&1; then
  echo "Error: node is required." >&2
  exit 127
fi

if ! command -v ossutil >/dev/null 2>&1; then
  echo "Error: ossutil is required and must be available in PATH." >&2
  exit 127
fi

cd "$ROOT_DIR"
exec node upload.js --clean-data "$@"
