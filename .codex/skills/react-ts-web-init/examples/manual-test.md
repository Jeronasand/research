# Manual Test Record

## Test Date

2026-05-11

## Scope

Public skill structure and script safety checks for `react-ts-web-init`.

## Test Cases

### Skill frontmatter validation

Command:

```bash
python3 -c 'import yaml, pathlib, re; p=pathlib.Path("skills/react-ts-web-init/SKILL.md"); s=p.read_text(); m=re.match(r"^---\n(.*?)\n---", s, re.S); data=yaml.safe_load(m.group(1)); assert data["name"]=="react-ts-web-init" and data["description"]; print("Skill is valid!")'
```

Expected:

- Prints `Skill is valid!`.
- Exits successfully.

### Shell syntax

Command:

```bash
bash -n skills/react-ts-web-init/scripts/init_react_ts_web.sh
```

Expected:

- Exits successfully.

### Dry-run project initialization

Command:

```bash
bash skills/react-ts-web-init/scripts/init_react_ts_web.sh \
  --project-dir /tmp/example-react-ts-web \
  --package-manager npm \
  --dry-run
```

Expected:

- Prints Vite creation, install, and file-write steps.
- Does not create or modify the target directory.

### Real npm smoke test

Command:

```bash
rm -rf /tmp/public-skills-react-ts-web-init-test
bash skills/react-ts-web-init/scripts/init_react_ts_web.sh \
  --project-dir /tmp/public-skills-react-ts-web-init-test \
  --package-manager npm
cd /tmp/public-skills-react-ts-web-init-test
npm run build
```

Expected:

- Creates a Vite React TypeScript project in `/tmp`.
- Installs `react-router`, `tailwindcss`, and `@tailwindcss/vite`.
- Writes the componentized baseline.
- `npm run build` exits successfully.

### Optional OSS association

Command:

```bash
python3 -m json.tool skills/associations.json >/dev/null
```

Expected:

- JSON is valid.
- Association includes optional `oss-upload-folder` follow-up for publishing `dist/`.

## Result

Passed current-run validation.

Verified commands:

- `bash -n skills/react-ts-web-init/scripts/init_react_ts_web.sh`
- `python3 -c 'import yaml, pathlib, re; p=pathlib.Path("skills/react-ts-web-init/SKILL.md"); s=p.read_text(); m=re.match(r"^---\\n(.*?)\\n---", s, re.S); data=yaml.safe_load(m.group(1)); assert data["name"]=="react-ts-web-init" and data["description"]; print("Skill is valid!")'`
- `bash skills/react-ts-web-init/scripts/init_react_ts_web.sh --project-dir /tmp/example-react-ts-web --package-manager npm --dry-run`
- `bash skills/react-ts-web-init/scripts/init_react_ts_web.sh --project-dir /tmp/public-skills-react-ts-web-init-test --package-manager npm`
- `cd /tmp/public-skills-react-ts-web-init-test && npm run build`
- `git diff --check`

## Notes

All examples use placeholder paths and contain no credentials.
