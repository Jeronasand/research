# Artifact Manifest Template

Use this template when a skill references files stored outside git.

```markdown
# Artifact Manifest

## Storage Target

- Provider:
- Region:
- Bucket:
- Public domain:
- Prefix:

## Files

| File | Public URL | Storage URI | Size | SHA-256 | Source | Notes |
| --- | --- | --- | --- | --- | --- | --- |
|  |  |  |  |  |  |  |

## Upload Verification

- Dry-run command:
- Upload command:
- Verification command:
- Date:
- Operator:
```

## Public Skills OSS Defaults

```text
Provider: Alibaba Cloud OSS
Region: oss-cn-shenzhen
Bucket: public-skills
Public domain: public-skills.jeronasand.cn
Prefix: skills/<skill-name>/<version>/
```
