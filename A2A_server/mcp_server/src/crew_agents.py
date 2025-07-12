from crewai import Agent
from mcp_server.src.tools.canvas_tools import FetchCanvasCoursesTool, GetUpcomingCanvasAssignmentsTool
from mcp_server.src.tools.todoist_tools import AddTodoistTaskTool

class MCPAgents:
    def __init__(self, canvas_tools, todoist_tools):
        self.canvas_tools = canvas_tools
        self.todoist_tools = todoist_tools

    def canvas_manager_agent(self):
        return Agent(
            role='Canvas Manager',
            goal='Manage and retrieve information from Canvas LMS.',
            backstory='Expert in Canvas API interactions, capable of fetching courses and assignments.',
            tools=[
                FetchCanvasCoursesTool(canvas_tools=self.canvas_tools),
                GetUpcomingCanvasAssignmentsTool(canvas_tools=self.canvas_tools)
            ],
            verbose=True
        )

    def todoist_manager_agent(self):
        return Agent(
            role='Todoist Manager',
            goal='Manage and add tasks to Todoist.',
            backstory='Proficient in Todoist API, able to add tasks and avoid duplicates.',
            tools=[
                AddTodoistTaskTool(todoist_tools=self.todoist_tools)
            ],
            verbose=True
        )

    def assignment_sync_orchestrator(self):
        return Agent(
            role='Assignment Sync Orchestrator',
            goal='Orchestrate the synchronization of Canvas assignments to Todoist.',
            backstory='A master orchestrator that coordinates between Canvas and Todoist managers to ensure assignments are synced efficiently.',
            verbose=True
        )
