import requests
from datetime import datetime, timedelta
from crewai.tools import BaseTool

class CanvasTools:
    def __init__(self, canvas_api_token: str, canvas_base_url: str):
        self.canvas_api_token = canvas_api_token
        self.canvas_base_url = canvas_base_url
        self.headers = {
            "Authorization": f"Bearer {self.canvas_api_token}"
        }

    def _fetch_paginated_data(self, url: str) -> list:
        data = []
        while url:
            response = requests.get(url, headers=self.headers)
            if response.status_code == 200:
                data.extend(response.json())
                link_header = response.headers.get('Link', None)
                url = None
                if link_header:
                    links = link_header.split(',')
                    for link in links:
                        if 'rel="next"' in link:
                            url = link[link.find('<')+1:link.find('>')]
                            break
            else:
                print(f"Error fetching data: {response.status_code}")
                url = None
        return data

    def fetch_courses(self) -> list:
        """
        Fetches all courses from Canvas.
        """
        url = f"{self.canvas_base_url}/api/v1/courses"
        return self._fetch_paginated_data(url)

    def fetch_course_assignments(self, course_id: int) -> list:
        """
        Fetches assignments for a specific course from Canvas.
        """
        url = f"{self.canvas_base_url}/api/v1/courses/{course_id}/assignments"
        return self._fetch_paginated_data(url)

    def get_upcoming_assignments(self, courses: list) -> list:
        """
        Retrieves upcoming assignments for a list of courses.
        """
        tasks = []
        now = datetime.utcnow()

        for course in courses:
            course_name = course.get('name')
            course_id = course.get('id')

            if not course_name or not course_id:
                continue

            assignments = self.fetch_course_assignments(course_id)

            for assignment in assignments:
                due_date_str = assignment.get('due_at')
                if due_date_str:
                    due_date = datetime.strptime(due_date_str, "%Y-%m-%dT%H:%M:%SZ")
                    if due_date > now:
                        tasks.append({
                            'title': assignment['name'],
                            'due_date': due_date_str,
                            'course_name': course_name
                        })
        return tasks

class FetchCanvasCoursesTool(BaseTool):
    name: str = "Fetch Canvas Courses"
    description: str = "Fetches all courses from Canvas."
    canvas_tools: CanvasTools

    def _run(self, **kwargs) -> list:
        return self.canvas_tools.fetch_courses()

class FetchCanvasAssignmentsTool(BaseTool):
    name: str = "Fetch Canvas Assignments"
    description: str = "Fetches assignments for a specific course from Canvas."
    canvas_tools: CanvasTools

    def _run(self, course_id: int) -> list:
        return self.canvas_tools.fetch_course_assignments(course_id)

class GetUpcomingCanvasAssignmentsTool(BaseTool):
    name: str = "Get Upcoming Canvas Assignments"
    description: str = "Retrieves upcoming assignments for a list of courses."
    canvas_tools: CanvasTools

    def _run(self, courses: list) -> list:
        return self.canvas_tools.get_upcoming_assignments(courses)
