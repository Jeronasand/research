---
name: git-commit-convention
description: "Generate repository-compliant git commit messages and commit workflows. Use when the user asks Codex to write a commit message, commit staged or unstaged changes, follow a repo's git convention, inspect diffs before committing, or translate work into a Conventional Commit style message such as `type: subject`."
---

# Git Commit Convention

Use this skill to turn real repository changes into a commit message that follows the repository's own rules.

## Workflow

1. Inspect the repository rules before writing the message.
   - Read `AGENTS.md`, `CONVENTIONS.md`, `CONTRIBUTING.md`, `.gitmessage`, README contribution sections, package-specific docs, or other repository-maintained rule files if they exist.
   - Prefer explicit local rules over generic conventions.
   - Treat repository-maintained rule files as binding for this repository, including any documented commit units, release units, staging rules, generated-file rules, tag rules, or "ask before split/merge" requirements.
   - If the user provides a convention in the prompt, treat it as the newest rule for this task.

2. Inspect the actual change set.
   - Run `git status --short --branch`.
   - Use `git diff --stat` for the scope.
   - Use `git diff` for unstaged changes and `git diff --cached` for staged changes when composing a real commit.
   - Do not include unrelated dirty files in the message unless they are part of the requested commit.

3. Decide whether the change set should be split.
   - Default to separate commits when the diff mixes unrelated purposes, unrelated modules, generated files plus source edits, formatting-only churn plus behavior changes, dependency/runtime changes plus repo tooling, or multiple commit types such as `feat` and `fix`.
   - Treat repo-local Codex skill installation or updates under `.codex/skills/` or `.codex/public-skills.yaml` as a separate repository-maintenance commit unless the repository explicitly defines it as part of the same release unit.
   - Treat package dependency updates, import migrations, build configuration changes, and runtime code changes as separate from agent/tooling setup unless they are directly required by the same source change.
   - If the repository rules define commit or release units, use those local units as the primary split boundary.
   - If the diff mixes files from different locally defined units, propose one commit per unit unless the user explicitly asks to merge them.
   - Treat generated index files, lockfiles, snapshots, or build metadata according to the repository's local rules; if no local rule exists, commit them with the source change that caused them.
   - Explain the likely split groups in concrete file or behavior terms.
   - Ask the user to confirm the split only when staging/committing will be performed. If the user only asked for commit messages, output one message per split group.
   - Do not split or partially stage without user confirmation.
   - If the user confirms, create one focused message per group and stage/commit each group separately.
   - If the user wants one commit anyway, write a single message that honestly describes the combined scope.

   Example: if one change set includes `@mizumessenger/sui-stack-messaging` dependency/import replacement and `.codex/skills/git-commit-convention/` installation, do not write one combined message such as `chore: update messaging package and commit skill`. Split it into two focused commits, for example:

   ```text
   chore: update messaging package
   chore: install git commit convention skill
   ```

4. Choose the commit type from the repo convention.
   - Common types: `feat`, `fix`, `docs`, `chore`, `refactor`, `test`, `build`, `ci`, `perf`.
   - For documentation-only changes, prefer `docs`.
   - For new reusable skill content, prefer `feat` unless the repo treats skills as documentation.
   - For repository setup, formatting, or metadata, prefer `chore`.

5. Write the subject.
   - Keep it concise, imperative, and specific.
   - Use lowercase after the type unless the repo's convention differs.
   - Avoid trailing punctuation.
   - Mention the user-visible outcome, not every file touched.

6. Add a body only when it helps.
   - Use a body for multi-part changes, behavior changes, migrations, or important validation notes.
   - Skip the body for small obvious changes.

## Default Format

When the repository only says `type: subject`, use:

```text
type: short imperative subject
```

Examples:

```text
docs: add public skills repository guide
feat: add git commit convention skill
fix: correct skill validation command
chore: update skill index metadata
```

## Commit Execution

If the user asks Codex to commit:

1. Verify the intended files with `git status --short`.
2. Stage only the relevant files.
3. Run repository validation when available, or at minimum run `git diff --check` for text changes.
4. Commit with the selected message.
5. Report the commit hash and the files included.

Never stage or commit unrelated user changes without explicit permission.

## Response Shape

If only asked for a message, return the recommended commit message first:

```text
feat: add git commit convention skill
```

Then briefly explain why that type and subject match the diff if useful.
