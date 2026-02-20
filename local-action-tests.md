# Local Action Repro Tests

This file contains reproducible `@github/local-action` test runs for **all actions** in `src/main.ts`.

## Prerequisites

- Install dependencies:

```bash
npm install
```

- Ensure fixture payloads exist:
  - `__fixtures__/events/pull_request.json`
  - `__fixtures__/events/issues.json`

- For actions that call Asana/GitHub/Mattermost APIs, set real values below:
  - `ASANA_PAT`
  - `ASANA_PROJECT_ID`
  - `ASANA_SECTION_ID` (optional)
  - `ASANA_TASK_ID`
  - `ASANA_ASSIGNEE_ID`
  - `GITHUB_PAT`
  - `GITHUB_ORG`
  - `GITHUB_REPOSITORY`
  - `GITHUB_PR`
  - `MM_TOKEN`
  - `MM_TEAM_ID`
  - `MM_CHANNEL_NAME`
  - `MM_MESSAGE`
  - `MM_URL` (optional, defaults to `https://chat.duckduckgo.com`)

## Helper

Each test writes a temporary env file and runs:

```bash
npx @github/local-action . src/main.ts .tmp.env
```

Then removes `.tmp.env`.

---

## 1) find-asana-task-id

```bash
cat > .tmp.env <<'EOF'
ACTIONS_STEP_DEBUG=true
INPUT_ACTION=find-asana-task-id
INPUT_TRIGGER-PHRASE=Task/Issue URL:
GITHUB_EVENT_NAME=pull_request
GITHUB_EVENT_PATH=__fixtures__/events/pull_request.json
EOF
npx @github/local-action . src/main.ts .tmp.env
rm -f .tmp.env
```

## 2) find-asana-task-ids

```bash
cat > .tmp.env <<'EOF'
ACTIONS_STEP_DEBUG=true
INPUT_ACTION=find-asana-task-ids
INPUT_TRIGGER-PHRASE=Task/Issue URL:
GITHUB_EVENT_NAME=pull_request
GITHUB_EVENT_PATH=__fixtures__/events/pull_request.json
EOF
npx @github/local-action . src/main.ts .tmp.env
rm -f .tmp.env
```

## 3) create-asana-task

```bash
cat > .tmp.env <<EOF
ACTIONS_STEP_DEBUG=true
INPUT_ACTION=create-asana-task
INPUT_ASANA-PAT=${ASANA_PAT}
INPUT_ASANA-PROJECT=${ASANA_PROJECT_ID}
INPUT_ASANA-TASK-NAME=Local Action Test Task
INPUT_ASANA-TASK-DESCRIPTION=Created from local-action test.
INPUT_ASANA-SECTION=${ASANA_SECTION_ID}
EOF
npx @github/local-action . src/main.ts .tmp.env
rm -f .tmp.env
```

## 4) post-comment-asana-task

```bash
cat > .tmp.env <<EOF
ACTIONS_STEP_DEBUG=true
INPUT_ACTION=post-comment-asana-task
INPUT_ASANA-PAT=${ASANA_PAT}
INPUT_ASANA-TASK-ID=${ASANA_TASK_ID}
INPUT_ASANA-TASK-COMMENT=Local-action comment test.
INPUT_ASANA-TASK-COMMENT-PINNED=false
INPUT_ASANA-TASK-COMMENT-IS-HTML=false
EOF
npx @github/local-action . src/main.ts .tmp.env
rm -f .tmp.env
```

## 5) get-asana-task-permalink

```bash
cat > .tmp.env <<EOF
ACTIONS_STEP_DEBUG=true
INPUT_ACTION=get-asana-task-permalink
INPUT_ASANA-PAT=${ASANA_PAT}
INPUT_ASANA-TASK-ID=${ASANA_TASK_ID}
EOF
npx @github/local-action . src/main.ts .tmp.env
rm -f .tmp.env
```

## 6) mark-asana-task-complete

```bash
cat > .tmp.env <<EOF
ACTIONS_STEP_DEBUG=true
INPUT_ACTION=mark-asana-task-complete
INPUT_ASANA-PAT=${ASANA_PAT}
INPUT_ASANA-TASK-ID=${ASANA_TASK_ID}
INPUT_IS-COMPLETE=true
EOF
npx @github/local-action . src/main.ts .tmp.env
rm -f .tmp.env
```

## 7) assign-asana-task

```bash
cat > .tmp.env <<EOF
ACTIONS_STEP_DEBUG=true
INPUT_ACTION=assign-asana-task
INPUT_ASANA-PAT=${ASANA_PAT}
INPUT_ASANA-TASK-ID=${ASANA_TASK_ID}
INPUT_ASANA-ASSIGNEE=${ASANA_ASSIGNEE_ID}
EOF
npx @github/local-action . src/main.ts .tmp.env
rm -f .tmp.env
```

## 8) search-asana-task-by-name

```bash
cat > .tmp.env <<EOF
ACTIONS_STEP_DEBUG=true
INPUT_ACTION=search-asana-task-by-name
INPUT_ASANA-PAT=${ASANA_PAT}
INPUT_ASANA-PROJECT=${ASANA_PROJECT_ID}
INPUT_ASANA-TASK-NAME=Local Action Test Task
INPUT_ASANA-SECTION=${ASANA_SECTION_ID}
EOF
npx @github/local-action . src/main.ts .tmp.env
rm -f .tmp.env
```

## 9) create-asana-issue-task

```bash
cat > .tmp.env <<EOF
ACTIONS_STEP_DEBUG=true
INPUT_ACTION=create-asana-issue-task
INPUT_ASANA-PAT=${ASANA_PAT}
INPUT_ASANA-PROJECT=${ASANA_PROJECT_ID}
GITHUB_EVENT_NAME=issues
GITHUB_EVENT_PATH=__fixtures__/events/issues.json
EOF
npx @github/local-action . src/main.ts .tmp.env
rm -f .tmp.env
```

## 10) add-asana-comment

```bash
cat > .tmp.env <<EOF
ACTIONS_STEP_DEBUG=true
INPUT_ACTION=add-asana-comment
INPUT_ASANA-PAT=${ASANA_PAT}
INPUT_TRIGGER-PHRASE=Task/Issue URL:
INPUT_IS-PINNED=true
GITHUB_EVENT_NAME=pull_request
GITHUB_EVENT_PATH=__fixtures__/events/pull_request.json
EOF
npx @github/local-action . src/main.ts .tmp.env
rm -f .tmp.env
```

## 11) notify-pr-approved

```bash
cat > .tmp.env <<EOF
ACTIONS_STEP_DEBUG=true
INPUT_ACTION=notify-pr-approved
INPUT_ASANA-PAT=${ASANA_PAT}
INPUT_TRIGGER-PHRASE=Task/Issue URL:
GITHUB_EVENT_NAME=pull_request
GITHUB_EVENT_PATH=__fixtures__/events/pull_request.json
EOF
npx @github/local-action . src/main.ts .tmp.env
rm -f .tmp.env
```

## 12) notify-pr-merged

```bash
cat > .tmp.env <<EOF
ACTIONS_STEP_DEBUG=true
INPUT_ACTION=notify-pr-merged
INPUT_ASANA-PAT=${ASANA_PAT}
INPUT_TRIGGER-PHRASE=Task/Issue URL:
INPUT_IS-COMPLETE=true
GITHUB_EVENT_NAME=pull_request
GITHUB_EVENT_PATH=__fixtures__/events/pull_request.json
EOF
npx @github/local-action . src/main.ts .tmp.env
rm -f .tmp.env
```

## 13) add-task-asana-project

```bash
cat > .tmp.env <<EOF
ACTIONS_STEP_DEBUG=true
INPUT_ACTION=add-task-asana-project
INPUT_ASANA-PAT=${ASANA_PAT}
INPUT_ASANA-PROJECT=${ASANA_PROJECT_ID}
INPUT_ASANA-SECTION=${ASANA_SECTION_ID}
INPUT_ASANA-TASK-ID=${ASANA_TASK_ID}
EOF
npx @github/local-action . src/main.ts .tmp.env
rm -f .tmp.env
```

## 14) add-task-pr-description

```bash
cat > .tmp.env <<EOF
ACTIONS_STEP_DEBUG=true
INPUT_ACTION=add-task-pr-description
INPUT_GITHUB-PAT=${GITHUB_PAT}
INPUT_GITHUB-ORG=${GITHUB_ORG}
INPUT_GITHUB-REPOSITORY=${GITHUB_REPOSITORY}
INPUT_GITHUB-PR=${GITHUB_PR}
INPUT_ASANA-PROJECT=${ASANA_PROJECT_ID}
INPUT_ASANA-TASK-ID=${ASANA_TASK_ID}
EOF
npx @github/local-action . src/main.ts .tmp.env
rm -f .tmp.env
```

## 15) send-mattermost-message

```bash
cat > .tmp.env <<EOF
ACTIONS_STEP_DEBUG=true
INPUT_ACTION=send-mattermost-message
INPUT_MATTERMOST-TOKEN=${MM_TOKEN}
INPUT_MATTERMOST-TEAM-ID=${MM_TEAM_ID}
INPUT_MATTERMOST-CHANNEL-NAME=${MM_CHANNEL_NAME}
INPUT_MATTERMOST-MESSAGE=${MM_MESSAGE}
INPUT_MATTERMOST-URL=${MM_URL}
EOF
npx @github/local-action . src/main.ts .tmp.env
rm -f .tmp.env
```

---

## Quick smoke test (no external API calls)

This one is useful to validate local wiring only:

```bash
cat > .tmp.env <<'EOF'
ACTIONS_STEP_DEBUG=true
INPUT_ACTION=find-asana-task-id
INPUT_TRIGGER-PHRASE=Task/Issue URL:
GITHUB_EVENT_NAME=pull_request
GITHUB_EVENT_PATH=__fixtures__/events/pull_request.json
EOF
npx @github/local-action . src/main.ts .tmp.env
rm -f .tmp.env
```
