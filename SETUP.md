# Setup Guide

## Quick Start

### 1. Extract Package
```bash
unzip multi-agent-dev-system.zip
cd multi-agent-dev-system
git init && git add . && git commit -m "Initial setup"
```

### 2. Open in Claude Code
```bash
code .
```

### 3. Start Phase 1

**Architect Agent:**
1. Open: agents/architect/system_prompt.md
2. Copy entire content
3. In Claude Code, create new chat
4. Paste system prompt
5. Send: "Read project-description.yaml and execute PLAN â†’ EXECUTE â†’ REPORT"

**Planner Agent (run in parallel):**
1. Same process as Architect
2. Open: agents/planner/system_prompt.md

### 4. Monitor Progress
```bash
cat SHARED_CONTEXT.json | jq .
```

## Agent Execution Order

**Phase 1 (Parallel):** Architect + Planner
**Phase 2:** Automatic (lock spec)
**Phase 3 (Parallel per feature):** Backend + Frontend + QA
**Phase 4 (Parallel):** DevOps + QA Integration
**Phase 5:** Docs Agent
**Phase 6:** Validation & Deploy

## Troubleshooting

**Agent stuck?**
```bash
cat agents/[agent]/blockers.md
```

**Check todos?**
```bash
cat agents/[agent]/TODOS.md
```

**View report?**
```bash
cat agents/[agent]/output/report.json
```
