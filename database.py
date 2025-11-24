#!/usr/bin/env python3
"""
Database module for orchestrator state management
Replaces file-based SHARED_CONTEXT.json with SQLite database
"""

import sqlite3
import json
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Tuple
from contextlib import contextmanager


class Database:
    """SQLite database for orchestrator state"""

    def __init__(self, db_path: str = "orchestrator.db"):
        self.db_path = Path(db_path)
        self.init_database()

    def init_database(self):
        """Initialize database schema"""
        with self.get_connection() as conn:
            cursor = conn.cursor()

            # Projects table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS projects (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    version TEXT NOT NULL,
                    current_phase INTEGER DEFAULT 1,
                    current_feature TEXT,
                    status TEXT DEFAULT 'INITIALIZED',
                    started_at TEXT,
                    completed_at TEXT,
                    overall_progress TEXT DEFAULT '0%',
                    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
                )
            """)

            # Agents table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS agents (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    project_id INTEGER NOT NULL,
                    name TEXT NOT NULL,
                    phase TEXT DEFAULT 'WAITING',
                    status TEXT DEFAULT 'READY',
                    progress TEXT DEFAULT '0%',
                    todos_completed INTEGER DEFAULT 0,
                    todos_total INTEGER DEFAULT 0,
                    last_update TEXT,
                    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE,
                    UNIQUE (project_id, name)
                )
            """)

            # Events table (audit log)
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS events (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    project_id INTEGER NOT NULL,
                    agent_name TEXT,
                    event_type TEXT NOT NULL,
                    data TEXT,
                    timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE
                )
            """)

            # Phase timeline table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS phase_timeline (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    project_id INTEGER NOT NULL,
                    phase_number INTEGER NOT NULL,
                    started_at TEXT,
                    completed_at TEXT,
                    duration_minutes INTEGER,
                    FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE,
                    UNIQUE (project_id, phase_number)
                )
            """)

            # Indexes for performance
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_agents_project ON agents(project_id)")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_events_project ON events(project_id)")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_events_timestamp ON events(timestamp)")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_phase_timeline_project ON phase_timeline(project_id)")

            conn.commit()

    @contextmanager
    def get_connection(self):
        """Context manager for database connections"""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row  # Access columns by name
        try:
            yield conn
        finally:
            conn.close()

    def create_project(self, name: str, version: str = "1.0.0") -> int:
        """Create a new project"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO projects (name, version, started_at)
                VALUES (?, ?, ?)
            """, (name, version, datetime.now().isoformat()))

            project_id = cursor.lastrowid

            # Create agent records
            agents = ["architect", "planner", "backend", "frontend", "qa", "devops", "docs"]
            for agent in agents:
                cursor.execute("""
                    INSERT INTO agents (project_id, name, phase, status, progress)
                    VALUES (?, ?, ?, ?, ?)
                """, (project_id, agent, "WAITING", "READY", "0%"))

            # Log event inline to avoid nested transaction
            cursor.execute("""
                INSERT INTO events (project_id, agent_name, event_type, data)
                VALUES (?, ?, ?, ?)
            """, (project_id, None, "PROJECT_CREATED", json.dumps({"name": name, "version": version})))

            conn.commit()
            return project_id

    def get_active_project(self) -> Optional[Dict]:
        """Get the most recently active project"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT * FROM projects
                ORDER BY updated_at DESC
                LIMIT 1
            """)
            row = cursor.fetchone()
            return dict(row) if row else None

    def get_project(self, project_id: int) -> Optional[Dict]:
        """Get project by ID"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM projects WHERE id = ?", (project_id,))
            row = cursor.fetchone()
            return dict(row) if row else None

    def update_project(self, project_id: int, updates: Dict):
        """Update project fields"""
        if not updates:
            return

        # Always update the updated_at timestamp
        updates['updated_at'] = datetime.now().isoformat()

        fields = ", ".join(f"{k} = ?" for k in updates.keys())
        values = list(updates.values()) + [project_id]

        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(f"UPDATE projects SET {fields} WHERE id = ?", values)
            conn.commit()

    def get_agents(self, project_id: int) -> List[Dict]:
        """Get all agents for a project"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT * FROM agents
                WHERE project_id = ?
                ORDER BY name
            """, (project_id,))
            return [dict(row) for row in cursor.fetchall()]

    def get_agent(self, project_id: int, agent_name: str) -> Optional[Dict]:
        """Get specific agent"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT * FROM agents
                WHERE project_id = ? AND name = ?
            """, (project_id, agent_name))
            row = cursor.fetchone()
            return dict(row) if row else None

    def update_agent(self, project_id: int, agent_name: str, updates: Dict):
        """Update agent status"""
        if not updates:
            return

        updates['updated_at'] = datetime.now().isoformat()
        updates['last_update'] = datetime.now().isoformat()

        fields = ", ".join(f"{k} = ?" for k in updates.keys())
        values = list(updates.values()) + [project_id, agent_name]

        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(f"""
                UPDATE agents SET {fields}
                WHERE project_id = ? AND name = ?
            """, values)
            conn.commit()

        # Log event
        self.log_event(project_id, agent_name, "AGENT_UPDATED", updates)

    def log_event(self, project_id: int, agent_name: Optional[str], event_type: str, data: Dict):
        """Log an event to audit trail"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO events (project_id, agent_name, event_type, data)
                VALUES (?, ?, ?, ?)
            """, (project_id, agent_name, event_type, json.dumps(data)))
            conn.commit()

    def get_events(self, project_id: int, limit: int = 100) -> List[Dict]:
        """Get recent events for a project"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT * FROM events
                WHERE project_id = ?
                ORDER BY timestamp DESC
                LIMIT ?
            """, (project_id, limit))
            return [dict(row) for row in cursor.fetchall()]

    def update_phase_timeline(self, project_id: int, phase_number: int, started_at: str = None, completed_at: str = None):
        """Update phase timeline"""
        with self.get_connection() as conn:
            cursor = conn.cursor()

            # Check if record exists
            cursor.execute("""
                SELECT id, started_at FROM phase_timeline
                WHERE project_id = ? AND phase_number = ?
            """, (project_id, phase_number))
            row = cursor.fetchone()

            if row:
                # Update existing record
                updates = []
                values = []

                if completed_at:
                    updates.append("completed_at = ?")
                    values.append(completed_at)

                    # Calculate duration if we have both timestamps
                    if row['started_at']:
                        start = datetime.fromisoformat(row['started_at'])
                        end = datetime.fromisoformat(completed_at)
                        duration = int((end - start).total_seconds() / 60)
                        updates.append("duration_minutes = ?")
                        values.append(duration)

                if updates:
                    values.append(row['id'])
                    cursor.execute(f"""
                        UPDATE phase_timeline SET {', '.join(updates)}
                        WHERE id = ?
                    """, values)
            else:
                # Insert new record
                cursor.execute("""
                    INSERT INTO phase_timeline (project_id, phase_number, started_at, completed_at)
                    VALUES (?, ?, ?, ?)
                """, (project_id, phase_number, started_at, completed_at))

            conn.commit()

    def get_phase_timeline(self, project_id: int) -> List[Dict]:
        """Get phase timeline for a project"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT * FROM phase_timeline
                WHERE project_id = ?
                ORDER BY phase_number
            """, (project_id,))
            return [dict(row) for row in cursor.fetchall()]

    def export_to_json(self, project_id: int) -> Dict:
        """Export project to JSON format (compatible with old SHARED_CONTEXT.json)"""
        project = self.get_project(project_id)
        if not project:
            return {}

        agents = self.get_agents(project_id)
        phase_timeline = self.get_phase_timeline(project_id)

        # Build agents dict
        agents_dict = {}
        for agent in agents:
            agents_dict[agent['name']] = {
                "phase": agent['phase'],
                "status": agent['status'],
                "progress": agent['progress'],
                "todos_completed": agent['todos_completed'],
                "todos_total": agent['todos_total'],
                "last_update": agent['last_update']
            }

        # Build phase timeline dict
        timeline_dict = {}
        for phase in phase_timeline:
            if phase['started_at']:
                timeline_dict[f"phase_{phase['phase_number']}_started"] = phase['started_at']
            if phase['completed_at']:
                timeline_dict[f"phase_{phase['phase_number']}_completed"] = phase['completed_at']

        return {
            "project": project['name'],
            "version": project['version'],
            "current_phase": project['current_phase'],
            "current_feature": project['current_feature'],
            "status": project['status'],
            "started_at": project['started_at'],
            "agents": agents_dict,
            "phase_timeline": timeline_dict,
            "overall_progress": project['overall_progress']
        }

    def import_from_json(self, json_data: Dict) -> int:
        """Import project from JSON format (migrate from SHARED_CONTEXT.json)"""
        # Create project
        project_id = self.create_project(
            name=json_data.get("project", "Imported Project"),
            version=json_data.get("version", "1.0.0")
        )

        # Update project fields
        updates = {
            "current_phase": json_data.get("current_phase", 1),
            "current_feature": json_data.get("current_feature"),
            "status": json_data.get("status", "INITIALIZED"),
            "started_at": json_data.get("started_at"),
            "overall_progress": json_data.get("overall_progress", "0%")
        }
        self.update_project(project_id, updates)

        # Update agents
        agents_data = json_data.get("agents", {})
        for agent_name, agent_info in agents_data.items():
            self.update_agent(project_id, agent_name, {
                "phase": agent_info.get("phase", "WAITING"),
                "status": agent_info.get("status", "READY"),
                "progress": agent_info.get("progress", "0%"),
                "todos_completed": agent_info.get("todos_completed", 0),
                "todos_total": agent_info.get("todos_total", 0),
                "last_update": agent_info.get("last_update")
            })

        # Import phase timeline
        timeline_data = json_data.get("phase_timeline", {})
        for key, value in timeline_data.items():
            if "_started" in key:
                phase_num = int(key.split("_")[1])
                self.update_phase_timeline(project_id, phase_num, started_at=value)
            elif "_completed" in key:
                phase_num = int(key.split("_")[1])
                self.update_phase_timeline(project_id, phase_num, completed_at=value)

        self.log_event(project_id, None, "PROJECT_IMPORTED", {"source": "JSON"})

        return project_id


if __name__ == "__main__":
    # Test the database
    import sys

    db = Database()

    if len(sys.argv) > 1 and sys.argv[1] == "migrate":
        # Migrate from SHARED_CONTEXT.json
        json_file = Path("SHARED_CONTEXT.json")
        if json_file.exists():
            print(f"Migrating {json_file} to database...")
            with open(json_file) as f:
                data = json.load(f)
            project_id = db.import_from_json(data)
            print(f"✅ Migration complete. Project ID: {project_id}")
        else:
            print(f"❌ {json_file} not found")
    else:
        # Create test project
        project_id = db.create_project("Test Project", "1.0.0")
        print(f"✅ Created test project with ID: {project_id}")

        # Get and display
        project = db.get_project(project_id)
        print(f"\nProject: {project['name']}")
        print(f"Status: {project['status']}")

        agents = db.get_agents(project_id)
        print(f"\nAgents: {len(agents)}")
        for agent in agents:
            print(f"  - {agent['name']}: {agent['status']}")
