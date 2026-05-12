# External Web Inbox

Put Web or HTML files copied from other places here first.

An inbox item can be:

- a single `.html` file
- a folder with an entry HTML file plus CSS, JS, images, fonts, JSON, CSV, or other local data files

Rules:

- Files in this directory are not synced automatically.
- Files here are not included in `research/private-index.json`.
- Files here are not included in `web/research-data/manifest.json`.
- Only process this directory when the user explicitly asks to sync.

During sync, classify each file into one of:

- `research/*.html` for completed research deliverables
- `research/<topic>/index.html` for completed research packages that need local assets
- `research/pending/<topic>/` for pending research requests or source collections
- `skills/<skill-id>/index.html` for reusable HTML skill pages

When syncing a folder, preserve the relative paths between the entry HTML and its assets.

Leave unclear files in this inbox and report why.
