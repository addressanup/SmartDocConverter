# Setup Guide

## Prerequisites

Before starting, ensure you have:

### Required Software
- **Python 3.8+**: For running the orchestrator
  ```bash
  python3 --version  # Should show 3.8 or higher
  ```

- **Node.js 18+**: For the generated application
  ```bash
  node --version  # Should show v18 or higher
  ```

- **Git**: For version control
  ```bash
  git --version
  ```

### Required Accounts
- **Claude Code** or **Claude.ai subscription**: For executing agent prompts
- **GitHub account** (optional): For CI/CD and version control

### Recommended Tools
- **jq**: For pretty-printing JSON state files
  ```bash
  # macOS
  brew install jq

  # Ubuntu/Debian
  sudo apt-get install jq
  ```

- **VS Code** or **Claude Code**: For editing files

## Quick Start

### 1. Extract and Initialize Project
```bash
# Extract the package
unzip multi-agent-dev-system.zip
cd multi-agent-dev-system

# Initialize git repository
git init
git add .
git commit -m "Initial setup"
```

**Verification**: Run `git status` - should show "nothing to commit, working tree clean"

### 2. Review Project Requirements

```bash
# View the sample project specification
cat project-description.yaml
```

**What to review**:
- Tech stack (Node.js, React, PostgreSQL)
- Features to implement (auth, products, orders)
- Performance requirements (API < 200ms p95)
- Testing coverage targets (80% backend, 75% frontend)

**Customize** (optional): Edit `project-description.yaml` to match your actual project needs

### 3. Start Phase 1 - Architecture & Planning

```bash
# Show Phase 1 instructions
python3 orchestrator.py --phase 1
```

This will display detailed instructions for executing the Architect and Planner agents.

## Agent Execution Workflow

### Phase 1: Architect Agent

**Step 1**: Open the agent prompt
```bash
# View the prompt
cat agents/architect/system_prompt.md
```

**Step 2**: Copy the entire prompt content to clipboard

**Step 3**: Open Claude Code or Claude.ai
- Create a new chat session
- Paste the system prompt
- Send the following task:
  ```
  Read project-description.yaml and execute PLAN → EXECUTE → REPORT workflow
  ```

**Step 4**: Monitor agent execution
- Agent will create todos in `agents/architect/TODOS.md`
- Agent will generate outputs in `agents/architect/output/`

**Expected Outputs**:
- `agents/architect/output/architecture.md` - System architecture documentation
- `agents/architect/output/api.openapi.yaml` - Complete API specification
- `agents/architect/output/database_schema.prisma` - Database schema
- `agents/architect/output/report.json` - Completion status

**Verification**:
```bash
# Check if all required files exist
ls -l agents/architect/output/

# Validate OpenAPI spec (if you have openapi-validator)
npx @readme/openapi-validator agents/architect/output/api.openapi.yaml

# View the completion report
cat agents/architect/output/report.json | jq .
```

**Expected result**: `report.json` should show `"status": "COMPLETED"` and `"progress": "100%"`

### Phase 1: Planner Agent (Run in Parallel)

Follow the same process as Architect:

**Command**:
```bash
cat agents/planner/system_prompt.md
# Copy to Claude Code/Claude.ai
```

**Expected Outputs**:
- `agents/planner/output/execution_plan.json`
- `agents/planner/output/task_list.json`
- `agents/planner/output/report.json`

**Verification**:
```bash
ls -l agents/planner/output/
cat agents/planner/output/report.json | jq .
```

### Check Overall Progress

```bash
# View current project state
cat SHARED_CONTEXT.json | jq .

# View specific agent status
python3 orchestrator.py --status
```

### Advance to Phase 2

Once both Architect and Planner have completed (both report.json files show "COMPLETED"):

```bash
# Transition to Phase 2
python3 orchestrator.py --advance-phase 2

# View Phase 2 instructions
python3 orchestrator.py --phase 2
```

## Agent Execution Order

**Phase 1 (Parallel execution recommended)**:
- Architect Agent - ~20-30 minutes
- Planner Agent - ~20-30 minutes
Run these simultaneously in separate Claude Code chats

**Phase 2**:
- Manual specification review - ~30-60 minutes
- Copy `agents/architect/output/api.openapi.yaml` to `specs/api.openapi.yaml`

**Phase 3 (Per feature: auth → products → orders)**:
For each feature:
- Backend Agent - ~2-4 hours per feature
- Frontend Agent - ~2-4 hours per feature (can run parallel with Backend)
- QA Agent - ~1-2 hours per feature

**Phase 4 (Parallel)**:
- DevOps Agent - ~3-5 hours
- QA Integration Tests - ~2-3 hours

**Phase 5**:
- Docs Agent - ~2-3 hours

**Phase 6**:
- Manual validation checklist - ~2-4 hours

## Troubleshooting

### Agent Not Producing Expected Outputs

**Problem**: Agent finishes but files are missing or incomplete

**Solutions**:
1. Check if agent created blockers:
   ```bash
   cat agents/[agent-name]/blockers.md
   ```

2. Review agent todos to see progress:
   ```bash
   cat agents/[agent-name]/TODOS.md | grep "\[x\]"  # Completed
   cat agents/[agent-name]/TODOS.md | grep "\[ \]"  # Pending
   ```

3. Re-run agent with more specific instructions:
   ```
   You previously started this task. Review your TODOS.md and complete any remaining items. Ensure all outputs are saved to agents/[agent-name]/output/
   ```

### Python Version Issues

**Problem**: `python3` command not found or wrong version

**Solution**:
```bash
# Check Python version
python --version
python3 --version

# Install Python 3.8+ if needed
# macOS: brew install python@3.11
# Ubuntu: sudo apt-get install python3.11
```

### Git Not Initialized

**Problem**: Orchestrator or agents complain about git

**Solution**:
```bash
cd multi-agent-dev-system
git init
git add .
git commit -m "Initial setup"
```

### Claude Code Not Responding

**Problem**: Agent seems stuck or not producing outputs

**Solutions**:
1. Check token limits - agent might have exceeded context window
2. Break down the task into smaller steps
3. Use Claude.ai web interface instead of Claude Code if issues persist
4. Check Claude API status: https://status.anthropic.com

### Files In Wrong Location

**Problem**: Agent created files but not in specified directories

**Solution**:
```bash
# Manually move files to correct location
mv [source-file] agents/[agent-name]/output/[expected-filename]

# Update report.json to reflect correct paths
```

## Best Practices

1. **One agent at a time per chat**: Don't mix multiple agent prompts in same conversation
2. **Save chat transcripts**: Useful for debugging and understanding agent decisions
3. **Verify outputs before advancing**: Always check report.json status before moving to next phase
4. **Commit after each phase**: `git add . && git commit -m "Completed Phase X"`
5. **Review agent blockers**: Check blockers.md files regularly
6. **Budget your time**: Each agent takes real time - don't expect instant results

## Getting Help

**Check agent blockers**: `cat agents/*/blockers.md`
**Review todos**: `cat agents/*/TODOS.md`
**Check reports**: `cat agents/*/output/report.json | jq .`
**View project status**: `python3 orchestrator.py --status`

For detailed phase-by-phase instructions, run:
```bash
python3 orchestrator.py --phase [1-6]
```
