# Project Plan: A2A Server with MCP and CrewAI Integration

This plan outlines the steps to refactor the existing project into an A2A-compliant multi-agent system using the Model Context Protocol (MCP) and integrating CrewAI for agent orchestration.

## Phase 1: Setup and Initial Structure

- [x] Acknowledge A2A/MCP information provided by the user.
- [x] Remove the `rai1975-canvas2doist` directory.
- [x] Create `mcp.md` with a high-level overview of the Multi-Agent Coordination Protocol.
- [x] Create `mcp_server/tests/test.md` detailing the purpose of the test directory.
- [x] Create `mcp_server/src/src.md` detailing the purpose of the source directory.

## Phase 2: Code Refinement and Documentation

- [x] Create `mcp_server/src/app.py` as the main entry point for the MCP server.
- [x] Create `mcp_server/src/config.py` for environment variables and configuration.
- [x] Create `mcp_server/src/routes/` directory and initial route files (e.g., `home.py`).
- [x] Add docstrings to all functions in the newly created Python files.

## Phase 3: API Integration and Agent Setup (CrewAI)

- [x] Implement the usage of APIs into tools within the `mcp_server` structure, aligning with A2A/MCP concepts.
- [x] Define how each API category (e.g., Canvas, Todoist) will be assigned to CrewAI agents.
- [x] Outline the A2A and MCP setup within the project, detailing inter-agent communication.
- [x] Create detailed Mermaid diagram in `mermaid.md` detailing the flow.
- [x] **Refactor `CanvasAgent` into a CrewAI Tool.**
- [x] **Refactor `TodoistAgent` into a CrewAI Tool.**
- [x] **Define CrewAI Agents** (e.g., `CanvasManager`, `TodoistManager`) that utilize these tools.
- [x] **Define CrewAI Tasks** for fetching Canvas assignments and adding them to Todoist.
- [x] **Create a CrewAI Crew** to orchestrate the agents and tasks for assignment synchronization.
- [x] **Update `mcp_server/src/routes/assignment_sync.py`** to use the CrewAI Crew.
- [x] **Update project dependencies** to include `crewai` and `crewai-tools`.

## Phase 4: Usage Instructions

- [x] Create comprehensive usage instructions for the new A2A/MCP system.
- [x] **Update `USAGE.md`** to reflect the CrewAI integration and new setup instructions.

## Phase 5: Testing and Validation

- [x] **Implement robust unit tests** for all components, especially the CrewAI tools and agents.
- [x] **Implement integration tests** for the entire assignment synchronization workflow.
- [ ] **Ensure all tests pass** and the system functions as expected.

## Phase 6: Deployment and Monitoring

- [ ] Outline deployment strategies (e.g., Docker, cloud platforms).
- [ ] Implement basic logging and monitoring for agent activities.

## Phase 7: Future Enhancements

- [ ] Explore advanced MCP features (e.g., dynamic agent discovery, task prioritization).
- [ ] Integrate with other platforms (e.g., Google Calendar, Slack).
- [ ] Implement a user interface for managing agents and workflows.
