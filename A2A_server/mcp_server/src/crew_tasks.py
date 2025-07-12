from crewai import Task

class MCPTasks:
    def __init__(self, agent_instance):
        self.agent_instance = agent_instance

    def fetch_canvas_courses_task(self, agent):
        return Task(
            description='Fetch all courses from Canvas.',
            agent=agent,
            tools=[self.agent_instance.canvas_manager_agent().tools[0]], # FetchCanvasCoursesTool
            expected_output='A list of course dictionaries.'
        )

    def get_upcoming_assignments_task(self, agent, courses):
        return Task(
            description=f"Get upcoming assignments for courses: {courses}",
            agent=agent,
            tools=[self.agent_instance.canvas_manager_agent().tools[1]], # GetUpcomingCanvasAssignmentsTool
            expected_output='A list of upcoming assignment dictionaries.'
        )

    def add_todoist_task(self, agent, assignment):
        return Task(
            description=f"Add assignment {assignment['title']} to Todoist.",
            agent=agent,
            tools=[self.agent_instance.todoist_manager_agent().tools[0]], # AddTodoistTaskTool
            expected_output='Boolean indicating success or failure of task addition.'
        )

    def orchestrate_assignment_sync_task(self, agent, courses, upcoming_assignments):
        return Task(
            description='Orchestrate the synchronization of Canvas assignments to Todoist.',
            agent=agent,
            expected_output='A JSON response indicating the status of the synchronization and a list of tasks that were added to Todoist.'
        )