from crewai import Crew
from mcp_server.src.crew_agents import MCPAgents
from mcp_server.src.crew_tasks import MCPTasks
from mcp_server.src.tools.canvas_tools import CanvasTools
from mcp_server.src.tools.todoist_tools import TodoistTools
from mcp_server.src.config import Config

class AssignmentSyncCrew:
    def __init__(self):
        self.config = Config()
        self.canvas_tools = CanvasTools(self.config.get_canvas_api_token(), self.config.get_canvas_base_url())
        self.todoist_tools = TodoistTools(self.config.get_todoist_api_token())
        self.agents = MCPAgents(self.canvas_tools, self.todoist_tools)
        self.tasks = MCPTasks(self.agents)

    def run(self):
        canvas_manager = self.agents.canvas_manager_agent()
        todoist_manager = self.agents.todoist_manager_agent()
        orchestrator = self.agents.assignment_sync_orchestrator()

        fetch_courses_task = self.tasks.fetch_canvas_courses_task(canvas_manager)
        get_upcoming_assignments_task = self.tasks.get_upcoming_assignments_task(canvas_manager, courses=fetch_courses_task.output)

        # This part needs to be dynamic based on the output of get_upcoming_assignments_task
        # For now, we'll simulate the flow.
        # In a real CrewAI scenario, the orchestrator agent would dynamically create these tasks.
        add_todoist_tasks = []
        # Assuming get_upcoming_assignments_task.output is a list of assignments
        # This is a placeholder, as CrewAI's dynamic task creation is more complex.
        # The orchestrator agent's role would be to process the output of one task
        # and create subsequent tasks.
        # For demonstration, let's assume we have some assignments to add.
        sample_assignments = [
            {'title': 'Sample Assignment 1', 'due_date': '2025-07-20T10:00:00Z', 'course_name': 'Sample Course'},
            {'title': 'Sample Assignment 2', 'due_date': '2025-07-21T10:00:00Z', 'course_name': 'Sample Course'}
        ]

        for assignment in sample_assignments:
            add_todoist_tasks.append(self.tasks.add_todoist_task(todoist_manager, assignment))

        crew = Crew(
            agents=[
                canvas_manager,
                todoist_manager,
                orchestrator
            ],
            tasks=[
                fetch_courses_task,
                get_upcoming_assignments_task,
                *add_todoist_tasks # Unpack the list of tasks
            ],
            verbose=True
        )

        result = crew.kickoff()
        return result
