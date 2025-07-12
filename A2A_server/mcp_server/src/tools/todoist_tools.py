import requests
from crewai.tools import BaseTool

class TodoistTools:
    def __init__(self, todoist_api_token: str):
        self.todoist_api_token = todoist_api_token
        self.headers = {
            "Authorization": f"Bearer {self.todoist_api_token}",
            "Content-Type": "application/json"
        }

    def fetch_tasks(self) -> list:
        """
        Fetches all active tasks from Todoist.
        """
        url = "https://api.todoist.com/rest/v2/tasks"
        response = requests.get(url, headers=self.headers)
        if response.status_code == 200:
            return response.json()
        else:
            print(f"Error fetching Todoist tasks: {response.status_code}")
            return []

    def add_task(self, task: dict) -> bool:
        """
        Adds a new task to Todoist, avoiding duplicates.
        """
        existing_tasks = self.fetch_tasks()
        task_content = f"{task['title']} in {task['course_name']}" if task.get('course_name') else task['title']

        # Check for duplicates
        for existing_task in existing_tasks:
            if existing_task.get('content') == task_content:
                print(f"Task '{task_content}' already exists in Todoist. Skipping.")
                return False

        url = "https://api.todoist.com/rest/v2/tasks"
        data = {
            "content": task_content,
            "due_datetime": task['due_date']
        }

        response = requests.post(url, json=data, headers=self.headers)
        if response.status_code == 200:
            print(f"Successfully added task: {task_content}")
            return True
        else:
            print(f"Error adding task '{task_content}': {response.status_code}, {response.text}")
            return False

class FetchTodoistTasksTool(BaseTool):
    name: str = "Fetch Todoist Tasks"
    description: str = "Fetches all active tasks from Todoist."
    todoist_tools: TodoistTools

    def _run(self, **kwargs) -> list:
        return self.todoist_tools.fetch_tasks()

class AddTodoistTaskTool(BaseTool):
    name: str = "Add Todoist Task"
    description: str = "Adds a new task to Todoist, avoiding duplicates."
    todoist_tools: TodoistTools

    def _run(self, task: dict) -> bool:
        return self.todoist_tools.add_task(task)
