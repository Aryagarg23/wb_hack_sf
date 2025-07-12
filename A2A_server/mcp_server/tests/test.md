This directory contains tests for the MCP server components. Each module within the `mcp_server/src` directory should have a corresponding test file here to ensure proper functionality and adherence to the A2A protocol.

## Test Cases Documentation

- **`test_config.py`**: This file contains unit tests for the `Config` class in `mcp_server/src/config.py`. It verifies that environment variables are loaded correctly and that `None` is returned for unset variables.
- **`test_home.py`**: This file contains integration tests for the home route (`/`) in `mcp_server/src/routes/home.py`. It checks if the endpoint returns the expected success message and status code.
- **`test_canvas_tools.py`**: This file contains unit tests for the `CanvasTools` class and its associated `BaseTool` implementations (`FetchCanvasCoursesTool`, `FetchCanvasAssignmentsTool`, `GetUpcomingCanvasAssignmentsTool`) in `mcp_server/src/tools/canvas_tools.py`. It mocks external API calls to ensure the data fetching and processing logic is correct, including pagination and filtering of upcoming assignments.
- **`test_todoist_tools.py`**: This file contains unit tests for the `TodoistTools` class and its associated `BaseTool` implementations (`FetchTodoistTasksTool`, `AddTodoistTaskTool`) in `mcp_server/src/tools/todoist_tools.py`. It mocks external API calls to verify task fetching, addition, and duplicate handling.
- **`test_assignment_sync.py`**: This file contains integration tests for the `/sync-assignments` route in `mcp_server/src/routes/assignment_sync.py`. It mocks the `CrewAI.kickoff` method to ensure that the CrewAI orchestration is correctly initiated and the expected JSON response is returned.
