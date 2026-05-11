# Manual Test Record

## Test Date

2026-05-06

## Scope

Public skill structure and policy checks for `bucket-upload-policy`.

## Test Cases

### Required files

Command:

```bash
python3 - <<'PY'
from pathlib import Path
d = Path("skills/bucket-upload-policy")
for name in ["SKILL.md", "README.md", "SOURCE.md"]:
    assert (d / name).exists(), name
print("ok")
PY
```

Expected:

- Required files exist.

### Repository secret safety

Command:

```bash
rg -n "AKIA[0-9A-Z]{16}|LTAI[0-9A-Za-z]{12,}|BEGIN [A-Z ]*PRIVATE KEY" skills/bucket-upload-policy
```

Expected:

- No real secret values are present.

## Result

Passed current-run verification.
