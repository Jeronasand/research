# OSS Data Bucket Access Modes

Use this reference after the user chooses the data-source bucket access mode.

## read-object

Use when the user only needs to fetch known object keys.

- Required permission shape: object read on selected keys or prefix.
- Avoid bucket-wide list permissions.
- Validate with a single head/get/download against a placeholder or user-approved key.

## list-and-read

Use when the user needs to browse a prefix and then read objects.

- Required permission shape: list bucket on the selected prefix plus object read.
- Ask for the narrowest prefix that should be visible.
- Report whether the command listed only metadata or downloaded object content.

## upload-sync

Use when the user needs to upload, mirror, or sync local files to the data bucket.

- Required permission shape: put object on selected prefix; delete only if the user explicitly asks for remote cleanup.
- Run dry-run first when the tool supports it.
- If `oss-upload-folder` is installed, prefer that skill's preview-first upload workflow.

## browser-cors-read

Use when a browser app reads the data bucket directly.

- Required permission shape: data read plus CORS allowing the actual app origin.
- Ask for origin, methods, request headers, and exposed response headers.
- Do not broaden CORS to `*` unless the user explicitly accepts the exposure.
- If browser credentials are used, prefer STS with short expiry and scoped permissions.

## presigned-url

Use when a backend, CLI, or agent creates temporary URLs for selected objects.

- Required permission shape: signing principal can read the selected objects.
- Ask for expiry time and whether the URL can be shared outside the logged-in session.
- Avoid generating URLs for bucket roots or broad object sets.

## static-website-cdn

Use when the data bucket is a public static site, preview site, or CDN origin.

- Required permission shape depends on deployment: public read, signed CDN, or private origin with CDN identity.
- Ask whether direct OSS public access is acceptable or access must go through CDN.
- Verify index object, route fallback, cache policy, and invalidation requirements before reporting done.

## admin-delete-policy

Use for delete, lifecycle, bucket policy, CORS, website, logging, replication, or other bucket-level changes.

- Treat as destructive or externally visible.
- Show the exact bucket, prefix, and intended command/config before running.
- Require explicit confirmation from the user.
- Record what changed and how to roll it back when possible.
