# Usage Instructions for A2A Server with MCP and CrewAI Integration

This document provides instructions on how to set up, run, and interact with the A2A server, which implements the Multi-Agent Coordination Protocol (MCP) with CrewAI for agent orchestration.

## 1. Project Structure

```
A2A_server/
├── .env
├── project_plan.md
└── mcp_server/
    ├── src/
    │   ├── tools/
    │   │   ├── canvas_tools.py
    │   │   └── todoist_tools.py
    │   ├── routes/
    │   │   ├── assignment_sync.py
    │   │   └── home.py
    │   ├── app.py
    │   ├── config.py
    │   ├── crew_agents.py
    │   ├── crew_tasks.py
    │   ├── crew.py
    │   └── src.md
    └── tests/
        └── test.md
```

## 2. Setup

### 2.1. Environment Variables

Create a `.env` file in the root directory of the project (`A2A_server/`) and populate it with your API tokens and Canvas base URL. This file will be used by the `mcp_server/src/config.py` to load the necessary credentials.

```
CANVAS_API_TOKEN=your_canvas_api_token_here
TODOIST_API_TOKEN=your_todoist_api_token_here
CANVAS_BASE_URL=your_canvas_base_url_here
```

- **CANVAS_API_TOKEN**: Obtain this from your Canvas account settings under 'Approved Integrations'.
- **TODOIST_API_TOKEN**: Find this in your Todoist app settings under 'Integrations' -> 'Developer'.
- **CANVAS_BASE_URL**: This is the base URL of your university's Canvas instance (e.g., `university.instructure.com`).

### 2.2. Python Environment

It is recommended to use a virtual environment to manage dependencies.

1. **Create a virtual environment (if you haven't already):**
   ```bash
   python3 -m venv venv
   ```

2. **Activate the virtual environment:**
   - On Linux/macOS:
     ```bash
     source venv/bin/activate
     ```
   - On Windows (Command Prompt):
     ```bash
     .\venv\Scripts\activate.bat
     ```
   - On Windows (PowerShell):
     ```bash
     .\venv\Scripts\Activate.ps1
     ```

3. **Install required Python packages:**
   ```bash
   pip install fastapi uvicorn python-dotenv requests pytest crewai crewai-tools
   ```

## 3. Running the MCP Server

To start the MCP server, navigate to the root directory of the project (`A2A_server/`) and run the `app.py` file located in `mcp_server/src/`:

```bash
python mcp_server/src/app.py
```

The server will start and be accessible at `http://0.0.0.0:5000` (or `http://localhost:5000`).

## 4. Interacting with the Server

### 4.1. Home Endpoint

- **URL:** `http://localhost:5000/`
- **Method:** `GET`
- **Description:** A simple endpoint to confirm that the FastAPI server is running.
- **Expected Response:** `MCP FastAPI server is running!`

### 4.2. Sync Assignments Endpoint

- **URL:** `http://localhost:5000/sync-assignments`
- **Method:** `GET`
- **Description:** This endpoint triggers the synchronization of upcoming assignments from Canvas to Todoist, orchestrated by CrewAI agents.
- **Expected Response (JSON):**
  ```json
  {
    "status": "success",
    "message": "Assignment synchronization orchestrated by CrewAI.",
    "crew_output": "... (output from CrewAI kickoff) ..."
  }
  ```

## 5. Running Tests

To run tests, you would typically use `pytest` from the root directory:

```bash
PYTHONPATH=/home/arya/projects/wb_hack_sf/A2A_server /home/arya/projects/wb_hack_sf/A2A_server/venv/bin/pytest mcp_server/tests/
```

## 6. CrewAI Integration

This project now integrates CrewAI agents for multi-agent coordination. The `CanvasAgent` and `TodoistAgent` functionalities have been refactored into CrewAI Tools. The `assignment_sync` endpoint now leverages a CrewAI Crew to orchestrate the fetching of Canvas assignments and adding them to Todoist.
