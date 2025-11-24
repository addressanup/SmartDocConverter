#!/usr/bin/env python3
"""
Multi-Agent Development System Orchestrator
Manages 7 agents through 6 project phases
"""

import json
import os
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Optional

# Database support (optional)
try:
    from database import Database
    DATABASE_AVAILABLE = True
except ImportError:
    DATABASE_AVAILABLE = False



class ProjectOrchestrator:
    """Orchestrates multi-agent development system"""
    
    def __init__(self, project_root: str = ".", use_database: bool = True):
        self.project_root = Path(project_root)
        self.context_file = self.project_root / "SHARED_CONTEXT.json"
        self.use_database = use_database and DATABASE_AVAILABLE
        
        if self.use_database:
            self.db = Database(str(self.project_root / "orchestrator.db"))
            # Migrate from JSON if exists and DB is empty
            if self.context_file.exists():
                try:
                    project = self.db.get_active_project()
                    if not project:
                        print("🔄 Migrating from SHARED_CONTEXT.json to database...")
                        with open(self.context_file) as f:
                            data = json.load(f)
                        self.db.import_from_json(data)
                        print("✅ Migration complete")
                except Exception as e:
                    print(f"⚠️  Migration warning: {e}")
        
        self.agents = [
            "architect",
            "planner", 
            "backend",
            "frontend",
            "devops",
            "qa",
            "docs"
        ]
        self.phases = {
            1: {"name": "Analysis & Planning", "agents": ["architect", "planner"]},
            2: {"name": "Specification", "agents": ["orchestrator"]},
            3: {"name": "Implementation", "agents": ["backend", "frontend", "qa"]},
            4: {"name": "Infrastructure", "agents": ["devops", "qa"]},
            5: {"name": "Documentation", "agents": ["docs"]},
            6: {"name": "Validation", "agents": ["orchestrator"]}
        }
    
    def load_context(self) -> Dict:
        """Load current project context"""
        if self.use_database:
            project = self.db.get_active_project()
            if project:
                return self.db.export_to_json(project['id'])
            return self.initialize_context()
        else:
            if self.context_file.exists():
                return json.loads(self.context_file.read_text())
            return self.initialize_context()
    
    def initialize_context(self) -> Dict:
        """Initialize new project context"""
        if self.use_database:
            project_id = self.db.create_project("Multi-Agent Development System", "1.0.0")
            return self.db.export_to_json(project_id)
        else:
            context = {
                "project": "Multi-Agent Development System",
                "version": "1.0.0",
                "current_phase": 1,
                "status": "INITIALIZED",
                "started_at": datetime.now().isoformat(),
                "agents": {agent: {
                    "phase": "WAITING",
                    "status": "READY",
                    "progress": "0%",
                    "todos_completed": 0,
                    "todos_total": 0,
                    "last_update": None
                } for agent in self.agents},
                "phase_timeline": {},
                "overall_progress": "0%"
            }
            self.save_context(context)
            return context
    
    def save_context(self, context: Dict):
        """Save project context"""
        if self.use_database:
            project = self.db.get_active_project()
            if project:
                # Update project
                project_updates = {
                    "current_phase": context.get("current_phase"),
                    "current_feature": context.get("current_feature"),
                    "status": context.get("status"),
                    "overall_progress": context.get("overall_progress")
                }
                self.db.update_project(project['id'], project_updates)
                
                # Update agents
                agents_data = context.get("agents", {})
                for agent_name, agent_info in agents_data.items():
                    self.db.update_agent(project['id'], agent_name, {
                        "phase": agent_info.get("phase", "WAITING"),
                        "status": agent_info.get("status", "READY"),
                        "progress": agent_info.get("progress", "0%"),
                        "todos_completed": agent_info.get("todos_completed", 0),
                        "todos_total": agent_info.get("todos_total", 0)
                    })
        else:
            self.context_file.write_text(json.dumps(context, indent=2))
    
    def get_agent_status(self, agent: str) -> Dict:
        """Get status of specific agent"""
        context = self.load_context()
        return context["agents"].get(agent, {})
    
    def update_agent_status(self, agent: str, status: Dict):
        """Update status of specific agent"""
        context = self.load_context()
        context["agents"][agent].update(status)
        context["agents"][agent]["last_update"] = datetime.now().isoformat()
        self.save_context(context)
    
    def get_phase_info(self, phase: int) -> Optional[Dict]:
        """Get information about a phase"""
        return self.phases.get(phase)
    
    def transition_phase(self, new_phase: int):
        """Transition to new project phase"""
        context = self.load_context()
        old_phase = context["current_phase"]

        # Validate current phase before advancing (except when initializing)
        if old_phase > 0:
            print(f"\n🔍 Validating Phase {old_phase} completion...")
            try:
                from phase_validators import validate_phase
                success, errors = validate_phase(old_phase, str(self.project_root))

                if not success:
                    print(f"\n❌ Phase {old_phase} validation FAILED")
                    print(f"\nFound {len(errors)} issues that must be fixed before advancing:\n")
                    for i, error in enumerate(errors, 1):
                        print(f"  {i}. {error}")
                    print(f"\n💡 Fix these issues and try again.")
                    return
                else:
                    print(f"✅ Phase {old_phase} validation PASSED\n")
            except ImportError:
                print("⚠️  Warning: phase_validators.py not found, skipping validation")
            except Exception as e:
                print(f"⚠️  Warning: Validation error: {str(e)}")

        context["current_phase"] = new_phase
        context["phase_timeline"][f"phase_{new_phase}_started"] = datetime.now().isoformat()

        # Reset agent statuses for new phase
        phase_agents = self.phases[new_phase]["agents"]
        for agent in phase_agents:
            if agent != "orchestrator":
                context["agents"][agent]["status"] = "IN_PROGRESS"
                context["agents"][agent]["progress"] = "0%"

        self.save_context(context)
        print(f"✅ Transitioned from Phase {old_phase} to Phase {new_phase}")
    
    def print_phase_instructions(self, phase: int):
        """Print instructions for a phase"""
        phase_info = self.get_phase_info(phase)
        if not phase_info:
            print(f"âŒ Phase {phase} not found")
            return
        
        instructions = {
            1: self._phase_1_instructions,
            2: self._phase_2_instructions,
            3: self._phase_3_instructions,
            4: self._phase_4_instructions,
            5: self._phase_5_instructions,
            6: self._phase_6_instructions
        }
        
        if phase in instructions:
            instructions[phase]()
    
    def _phase_1_instructions(self):
        print("""
â•”â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•—
â•‘                 PHASE 1: ANALYSIS & PLANNING                       â•‘
â•‘              (Copy-paste agent prompts to Claude Code)              â•‘
â•šâ•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

ðŸ¤– ARCHITECT AGENT (Run First)
â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
Location: agents/architect/system_prompt.md

Instructions:
1. Open agents/architect/system_prompt.md
2. Copy entire content
3. In Claude Code: Create new chat
4. Paste the system prompt
5. Send task: "Read project-description.yaml and execute PLAN â†’ EXECUTE â†’ REPORT"

Expected Output:
- agents/architect/TODOS.md (filled with 40-50 todos)
- agents/architect/output/architecture.md
- agents/architect/output/api.openapi.yaml
- agents/architect/output/database_schema.prisma
- agents/architect/output/report.json

Duration: ~20-30 minutes

ðŸ“‹ PLANNER AGENT (Run in Parallel)
â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
Location: agents/planner/system_prompt.md

Same process as Architect (can run simultaneously)

Expected Output:
- agents/planner/TODOS.md (filled with 30-40 todos)
- agents/planner/output/execution_plan.json
- agents/planner/output/task_list.json
- agents/planner/output/report.json

ðŸ“Š MONITORING
â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
Check progress anytime:

$ cat SHARED_CONTEXT.json | jq .
$ cat agents/architect/TODOS.md | grep "- \["
$ cat agents/architect/output/report.json

âœ… COMPLETION
â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
When both agents complete:
$ python3 orchestrator.py --advance-phase 2
""")
    
    def _phase_2_instructions(self):
        print("""
â•”â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•—
â•‘               PHASE 2: SPECIFICATION LOCKING                       â•‘
â•šâ•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

âœ… This phase is AUTOMATIC:

1. Copy Architect's output: agents/architect/output/api.openapi.yaml
2. Paste to: specs/api.openapi.yaml
3. This becomes the MASTER CONTRACT for all downstream agents

Master Specification Contents:
âœ“ All API endpoints (organized by feature)
âœ“ Request/response schemas
âœ“ Error codes and messages
âœ“ Authentication scheme
âœ“ Rate limiting rules

Duration: 5 minutes

Ready for Phase 3: Implementation
$ python3 orchestrator.py --advance-phase 3
""")
    
    def _phase_3_instructions(self):
        print("""
â•”â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•—
â•‘            PHASE 3: CORE IMPLEMENTATION (Parallel)                 â•‘
â•‘          Backend + Frontend + QA work simultaneously               â•‘
â•šâ•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

For each feature (auth â†’ products â†’ orders):

ðŸš€ BACKEND AGENT
â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
Location: agents/backend/system_prompt.md

Task: "Implement Feature: [feature_name]"

Deliverables:
- src/routes/[feature].ts
- src/services/[feature].ts
- Database migrations
- Unit tests (>80% coverage)

ðŸŽ¨ FRONTEND AGENT (Parallel)
â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
Location: agents/frontend/system_prompt.md

Task: "Implement Feature: [feature_name]"

Deliverables:
- src/components/[Feature]/
- src/api/[feature].ts (API client)
- src/store/[featureSlice].ts (Redux)
- Component tests (>75% coverage)

ðŸ§ª QA AGENT (Parallel)
â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
Location: agents/qa/system_prompt.md

Task: "Test Feature: [feature_name]"

Deliverables:
- Unit tests
- Integration tests
- E2E tests (happy path)
- Coverage report

ðŸ“‹ FEATURES TO IMPLEMENT
â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
1. auth (User authentication with JWT)
2. products (Product catalog management)
3. orders (Order management system)

Process for each feature:
1. Backend Agent implements APIs
2. Frontend Agent builds UI (in parallel)
3. QA Agent tests (in parallel)
4. All tests must pass before next feature

Duration: ~18 days

Ready for Phase 4: Infrastructure
$ python3 orchestrator.py --advance-phase 4
""")
    
    def _phase_4_instructions(self):
        print("""
â•”â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•—
â•‘       PHASE 4: INFRASTRUCTURE & TESTING                            â•‘
â•šâ•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

ðŸ³ DEVOPS AGENT
â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
Location: agents/devops/system_prompt.md

Task: "Setup Docker, CI/CD, and deployment infrastructure"

Deliverables:
- Dockerfile (backend)
- Dockerfile (frontend)
- docker-compose.yml
- .github/workflows/ci.yml (GitHub Actions)
- Environment configuration
- Secrets management

ðŸ§ª QA AGENT (Integration & E2E Tests)
â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
Location: agents/qa/system_prompt.md

Task: "Create integration and E2E test suites"

Deliverables:
- Integration tests (all features)
- E2E tests with Playwright
- Performance tests
- Security tests

Duration: ~5 days

Ready for Phase 5: Documentation
$ python3 orchestrator.py --advance-phase 5
""")
    
    def _phase_5_instructions(self):
        print("""
â•”â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•—
â•‘           PHASE 5: DOCUMENTATION GENERATION                        â•‘
â•šâ•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

ðŸ“š DOCS AGENT
â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”
Location: agents/docs/system_prompt.md

Task: "Generate complete project documentation"

Deliverables:
- docs/API.md (Complete API documentation)
- docs/ARCHITECTURE.md (Architecture guide)
- docs/SETUP.md (Setup instructions)
- docs/DEPLOYMENT.md (Deployment guide)
- docs/USER_GUIDE.md (End-user guide)
- docs/DEVELOPER_GUIDE.md (Developer guide)
- docs/TROUBLESHOOTING.md (Troubleshooting)
- docs/CONTRIBUTING.md (Contributing guidelines)

Duration: ~2 days

Ready for Phase 6: Validation
$ python3 orchestrator.py --advance-phase 6
""")
    
    def _phase_6_instructions(self):
        print("""
â•”â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•—
â•‘         PHASE 6: VALIDATION & DEPLOYMENT                           â•‘
â•šâ•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

âœ… VALIDATION CHECKLIST
â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”

Code Quality:
[ ] All tests passing (npm run test)
[ ] Backend coverage >= 80%
[ ] Frontend coverage >= 75%
[ ] Linting checks passing
[ ] Type checking passing (tsc --noEmit)

Security:
[ ] HTTPS enabled
[ ] CORS configured correctly
[ ] SQL injection protected (Prisma)
[ ] XSS protection in place
[ ] CSRF tokens on forms
[ ] Secrets not in code

Performance:
[ ] API response time < 200ms (p95)
[ ] Frontend page load < 3 seconds
[ ] Database queries optimized
[ ] Images optimized

Deployment:
[ ] Docker build successful
[ ] docker-compose works locally
[ ] CI/CD pipeline green
[ ] Secrets configured in deployment
[ ] Database migrations tested

Documentation:
[ ] API docs complete
[ ] Setup guide clear
[ ] Deployment guide clear
[ ] README up to date
[ ] Contributing guide present

ðŸš€ DEPLOYMENT
â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”

1. Tag release:
   $ git tag v1.0.0
   $ git push --tags

2. Deploy backend (Cloud Run / Heroku):
   $ cd backend && npm run build
   $ # Push to deployment platform

3. Deploy frontend (Vercel / Netlify):
   $ cd frontend && npm run build
   $ # Push to deployment platform

4. Verify in production:
   $ curl https://yourdomain.com/api/health

5. Monitor for issues:
   $ # Check logs and metrics

Duration: ~3 days

ðŸŽ‰ PROJECT COMPLETE!
""")
    
    def print_status(self):
        """Print current project status"""
        context = self.load_context()
        
        print(f"""
â•”â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•—
â•‘         PROJECT STATUS REPORT                                      â•‘
â•šâ•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

Project: {context["project"]}
Current Phase: {context["current_phase"]}
Overall Progress: {context["overall_progress"]}

Agent Status:
""")
        for agent, status in context["agents"].items():
            print(f"  {agent.upper()}")
            print(f"    Status: {status['status']}")
            print(f"    Progress: {status['progress']}")
            print(f"    Todos: {status['todos_completed']}/{status['todos_total']}")
            print()
    
    def print_help(self):
        """Print help information"""
        print("""
â•”â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•—
â•‘         MULTI-AGENT ORCHESTRATOR - COMMANDS                        â•‘
â•šâ•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

Usage: python3 orchestrator.py [command]

Commands:
  --phase 1         Show Phase 1 instructions
  --phase 2         Show Phase 2 instructions
  --phase 3         Show Phase 3 instructions
  --phase 4         Show Phase 4 instructions
  --phase 5         Show Phase 5 instructions
  --phase 6         Show Phase 6 instructions
  
  --advance-phase N Transition to phase N
  --status          Print current project status
  --init            Initialize new project
  --help            Show this help message

Examples:
  python3 orchestrator.py --phase 1
  python3 orchestrator.py --status
  python3 orchestrator.py --advance-phase 3

Ready to build! ðŸš€
""")


def main():
    import sys
    
    orchestrator = ProjectOrchestrator()
    
    if len(sys.argv) == 1:
        orchestrator.print_help()
        return
    
    command = sys.argv[1]
    
    if command == "--help":
        orchestrator.print_help()
    elif command == "--status":
        orchestrator.print_status()
    elif command == "--init":
        orchestrator.initialize_context()
        print("âœ… Project initialized")
    elif command == "--phase" and len(sys.argv) > 2:
        phase = int(sys.argv[2])
        orchestrator.print_phase_instructions(phase)
    elif command == "--advance-phase" and len(sys.argv) > 2:
        phase = int(sys.argv[2])
        orchestrator.transition_phase(phase)
    else:
        print(f"Unknown command: {command}")
        orchestrator.print_help()


if __name__ == "__main__":
    main()
