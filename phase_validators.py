#!/usr/bin/env python3
"""
Phase Gate Validators
Ensures phase completion criteria are met before advancing
"""

import json
import os
from pathlib import Path
from typing import List, Dict, Tuple

try:
    import yaml
    YAML_AVAILABLE = True
except ImportError:
    YAML_AVAILABLE = False


class ValidationError(Exception):
    """Raised when validation fails"""
    pass


class PhaseValidator:
    """Base class for phase validators"""

    def __init__(self, project_root: str = "."):
        self.project_root = Path(project_root)

    def validate(self) -> Tuple[bool, List[str]]:
        """
        Validate phase completion
        Returns: (success: bool, errors: List[str])
        """
        raise NotImplementedError


class Phase1Validator(PhaseValidator):
    """Validates Phase 1: Analysis & Planning"""

    def validate(self) -> Tuple[bool, List[str]]:
        errors = []

        # Check Architect outputs
        architect_base = self.project_root / "agents" / "architect" / "output"

        # 1. Architecture document
        arch_doc = architect_base / "architecture.md"
        if not arch_doc.exists():
            errors.append("Missing: agents/architect/output/architecture.md")
        elif arch_doc.stat().st_size < 1000:  # At least 1KB
            errors.append("Architecture document too short (< 1KB)")

        # 2. OpenAPI specification
        openapi_spec = architect_base / "api.openapi.yaml"
        if not openapi_spec.exists():
            errors.append("Missing: agents/architect/output/api.openapi.yaml")
        else:
            if YAML_AVAILABLE:
                # Validate it's valid YAML
                try:
                    with open(openapi_spec) as f:
                        spec = yaml.safe_load(f)

                    # Check required OpenAPI fields
                    if "openapi" not in spec:
                        errors.append("OpenAPI spec missing 'openapi' version field")
                    if "info" not in spec:
                        errors.append("OpenAPI spec missing 'info' section")
                    if "paths" not in spec or not spec["paths"]:
                        errors.append("OpenAPI spec has no paths defined")

                except yaml.YAMLError as e:
                    errors.append(f"Invalid YAML in OpenAPI spec: {str(e)}")
                except Exception as e:
                    errors.append(f"Error reading OpenAPI spec: {str(e)}")
            elif openapi_spec.stat().st_size < 500:
                errors.append("OpenAPI spec file too small (< 500 bytes)")

        # 3. Database schema
        db_schema = architect_base / "database_schema.prisma"
        if not db_schema.exists():
            errors.append("Missing: agents/architect/output/database_schema.prisma")
        elif db_schema.stat().st_size < 100:  # At least 100 bytes
            errors.append("Database schema too short")

        # 4. Report with COMPLETED status
        report = architect_base / "report.json"
        if not report.exists():
            errors.append("Missing: agents/architect/output/report.json")
        else:
            try:
                with open(report) as f:
                    report_data = json.load(f)
                if report_data.get("status") != "COMPLETED":
                    errors.append(f"Architect status is '{report_data.get('status')}', expected 'COMPLETED'")
            except json.JSONDecodeError:
                errors.append("Invalid JSON in architect report.json")

        # Check Planner outputs
        planner_base = self.project_root / "agents" / "planner" / "output"

        # 5. Execution plan
        exec_plan = planner_base / "execution_plan.json"
        if not exec_plan.exists():
            errors.append("Missing: agents/planner/output/execution_plan.json")
        else:
            try:
                with open(exec_plan) as f:
                    plan = json.load(f)
                if "phases" not in plan:
                    errors.append("Execution plan missing 'phases' field")
            except json.JSONDecodeError:
                errors.append("Invalid JSON in execution_plan.json")

        # 6. Task list
        task_list = planner_base / "task_list.json"
        if not task_list.exists():
            errors.append("Missing: agents/planner/output/task_list.json")
        else:
            try:
                with open(task_list) as f:
                    tasks = json.load(f)
                if "tasks" not in tasks or not tasks["tasks"]:
                    errors.append("Task list has no tasks defined")
            except json.JSONDecodeError:
                errors.append("Invalid JSON in task_list.json")

        # 7. Planner report
        planner_report = planner_base / "report.json"
        if not planner_report.exists():
            errors.append("Missing: agents/planner/output/report.json")
        else:
            try:
                with open(planner_report) as f:
                    report_data = json.load(f)
                if report_data.get("status") != "COMPLETED":
                    errors.append(f"Planner status is '{report_data.get('status')}', expected 'COMPLETED'")
            except json.JSONDecodeError:
                errors.append("Invalid JSON in planner report.json")

        return (len(errors) == 0, errors)


class Phase2Validator(PhaseValidator):
    """Validates Phase 2: Specification Locking"""

    def validate(self) -> Tuple[bool, List[str]]:
        errors = []

        # Check that API spec has been copied to specs/
        master_spec = self.project_root / "specs" / "api.openapi.yaml"

        if not master_spec.exists():
            errors.append("Missing: specs/api.openapi.yaml (master specification not locked)")
        else:
            if YAML_AVAILABLE:
                # Validate it's valid YAML
                try:
                    with open(master_spec) as f:
                        spec = yaml.safe_load(f)

                    if "openapi" not in spec:
                        errors.append("Master spec missing 'openapi' version field")
                    if "paths" not in spec or not spec["paths"]:
                        errors.append("Master spec has no paths defined")

                except yaml.YAMLError as e:
                    errors.append(f"Invalid YAML in master spec: {str(e)}")
            elif master_spec.stat().st_size < 500:
                errors.append("Master spec file too small (< 500 bytes)")

        return (len(errors) == 0, errors)


class Phase3Validator(PhaseValidator):
    """Validates Phase 3: Implementation"""

    def validate(self) -> Tuple[bool, List[str]]:
        errors = []

        # Check that at least one feature has been implemented
        backend_base = self.project_root / "backend" / "src"
        frontend_base = self.project_root / "frontend" / "src"

        # Look for implementation files
        if backend_base.exists():
            route_files = list(backend_base.glob("routes/*.ts")) + list(backend_base.glob("routes/*.js"))
            if not route_files:
                errors.append("No backend route files found in backend/src/routes/")
        else:
            errors.append("Backend src directory not found")

        if frontend_base.exists():
            component_dirs = list(frontend_base.glob("components/*"))
            if not component_dirs:
                errors.append("No frontend components found in frontend/src/components/")
        else:
            errors.append("Frontend src directory not found")

        # Check for tests
        backend_tests = self.project_root / "backend" / "tests"
        if not backend_tests.exists() or not list(backend_tests.glob("**/*.test.*")):
            errors.append("No backend tests found")

        frontend_tests = self.project_root / "frontend" / "tests"
        if not frontend_tests.exists() or not list(frontend_tests.glob("**/*.test.*")):
            errors.append("No frontend tests found")

        return (len(errors) == 0, errors)


class Phase4Validator(PhaseValidator):
    """Validates Phase 4: Infrastructure"""

    def validate(self) -> Tuple[bool, List[str]]:
        errors = []

        # Check Docker files
        backend_dockerfile = self.project_root / "backend" / "Dockerfile"
        if not backend_dockerfile.exists():
            errors.append("Missing: backend/Dockerfile")

        frontend_dockerfile = self.project_root / "frontend" / "Dockerfile"
        if not frontend_dockerfile.exists():
            errors.append("Missing: frontend/Dockerfile")

        # Check docker-compose
        docker_compose = self.project_root / "docker-compose.yml"
        if not docker_compose.exists():
            docker_compose_alt = self.project_root / "config" / "docker" / "docker-compose.yml"
            if not docker_compose_alt.exists():
                errors.append("Missing: docker-compose.yml")

        # Check CI/CD
        ci_file = self.project_root / ".github" / "workflows" / "ci.yml"
        if not ci_file.exists():
            errors.append("Missing: .github/workflows/ci.yml")

        return (len(errors) == 0, errors)


class Phase5Validator(PhaseValidator):
    """Validates Phase 5: Documentation"""

    def validate(self) -> Tuple[bool, List[str]]:
        errors = []

        docs_dir = self.project_root / "docs"

        required_docs = [
            "API.md",
            "ARCHITECTURE.md",
            "SETUP.md",
            "DEPLOYMENT.md"
        ]

        for doc in required_docs:
            doc_path = docs_dir / doc
            if not doc_path.exists():
                errors.append(f"Missing: docs/{doc}")
            elif doc_path.stat().st_size < 500:  # At least 500 bytes
                errors.append(f"docs/{doc} is too short (< 500 bytes)")

        return (len(errors) == 0, errors)


class Phase6Validator(PhaseValidator):
    """Validates Phase 6: Final Validation"""

    def validate(self) -> Tuple[bool, List[str]]:
        errors = []

        # This phase is mostly manual checklist
        # We can validate that previous phases are complete

        validators = [
            Phase1Validator(self.project_root),
            Phase2Validator(self.project_root),
            Phase3Validator(self.project_root),
            Phase4Validator(self.project_root),
            Phase5Validator(self.project_root)
        ]

        for i, validator in enumerate(validators, 1):
            success, phase_errors = validator.validate()
            if not success:
                errors.append(f"Phase {i} validation failed: {len(phase_errors)} issues")

        return (len(errors) == 0, errors)


def get_validator(phase: int, project_root: str = ".") -> PhaseValidator:
    """Factory function to get validator for a phase"""
    validators = {
        1: Phase1Validator,
        2: Phase2Validator,
        3: Phase3Validator,
        4: Phase4Validator,
        5: Phase5Validator,
        6: Phase6Validator
    }

    validator_class = validators.get(phase)
    if not validator_class:
        raise ValueError(f"No validator for phase {phase}")

    return validator_class(project_root)


def validate_phase(phase: int, project_root: str = ".") -> Tuple[bool, List[str]]:
    """
    Validate a phase
    Returns: (success: bool, errors: List[str])
    """
    validator = get_validator(phase, project_root)
    return validator.validate()


if __name__ == "__main__":
    import sys

    if len(sys.argv) < 2:
        print("Usage: python3 phase_validators.py <phase_number>")
        sys.exit(1)

    phase = int(sys.argv[1])

    print(f"Validating Phase {phase}...")
    success, errors = validate_phase(phase)

    if success:
        print(f"✅ Phase {phase} validation PASSED")
        sys.exit(0)
    else:
        print(f"❌ Phase {phase} validation FAILED")
        print(f"\nFound {len(errors)} issues:")
        for i, error in enumerate(errors, 1):
            print(f"  {i}. {error}")
        sys.exit(1)
