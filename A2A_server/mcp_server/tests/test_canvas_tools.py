import pytest
from unittest.mock import patch, Mock
from datetime import datetime, timedelta
from mcp_server.src.tools.canvas_tools import CanvasTools, FetchCanvasCoursesTool, FetchCanvasAssignmentsTool, GetUpcomingCanvasAssignmentsTool

@pytest.fixture
def canvas_tools_instance():
    return CanvasTools(canvas_api_token='test_token', canvas_base_url='http://test.canvas.com')

@patch('requests.get')
def test_fetch_courses_tool(mock_get, canvas_tools_instance):
    mock_response_page1 = Mock()
    mock_response_page1.status_code = 200
    mock_response_page1.json.return_value = [{'id': 1, 'name': 'Course A'}]
    mock_response_page1.headers = {'Link': '<http://test.canvas.com/api/v1/courses?page=2>; rel="next"'}

    mock_response_page2 = Mock()
    mock_response_page2.status_code = 200
    mock_response_page2.json.return_value = [{'id': 2, 'name': 'Course B'}]
    mock_response_page2.headers = {}

    mock_get.side_effect = [mock_response_page1, mock_response_page2]

    tool = FetchCanvasCoursesTool(canvas_tools=canvas_tools_instance)
    courses = tool._run()

    assert len(courses) == 2
    assert courses[0]['name'] == 'Course A'
    assert courses[1]['name'] == 'Course B'
    mock_get.assert_any_call('http://test.canvas.com/api/v1/courses', headers=canvas_tools_instance.headers)
    mock_get.assert_any_call('http://test.canvas.com/api/v1/courses?page=2', headers=canvas_tools_instance.headers)

@patch('requests.get')
def test_fetch_canvas_assignments_tool(mock_get, canvas_tools_instance):
    mock_response_page1 = Mock()
    mock_response_page1.status_code = 200
    mock_response_page1.json.return_value = [{'id': 101, 'name': 'Assignment 1'}]
    mock_response_page1.headers = {'Link': '<http://test.canvas.com/api/v1/courses/1/assignments?page=2>; rel="next"'}

    mock_response_page2 = Mock()
    mock_response_page2.status_code = 200
    mock_response_page2.json.return_value = [{'id': 102, 'name': 'Assignment 2'}]
    mock_response_page2.headers = {}

    mock_get.side_effect = [mock_response_page1, mock_response_page2]

    tool = FetchCanvasAssignmentsTool(canvas_tools=canvas_tools_instance)
    assignments = tool._run(course_id=1)

    assert len(assignments) == 2
    assert assignments[0]['name'] == 'Assignment 1'
    assert assignments[1]['name'] == 'Assignment 2'
    mock_get.assert_any_call('http://test.canvas.com/api/v1/courses/1/assignments', headers=canvas_tools_instance.headers)
    mock_get.assert_any_call('http://test.canvas.com/api/v1/courses/1/assignments?page=2', headers=canvas_tools_instance.headers)

@patch('mcp_server.src.tools.canvas_tools.CanvasTools.fetch_course_assignments')
def test_get_upcoming_canvas_assignments_tool(mock_fetch_assignments, canvas_tools_instance):
    mock_fetch_assignments.return_value = [
        {'id': 1, 'name': 'Upcoming Assignment', 'due_at': (datetime.utcnow().replace(microsecond=0) + timedelta(days=1)).isoformat() + 'Z'},
        {'id': 2, 'name': 'Past Assignment', 'due_at': (datetime.utcnow().replace(microsecond=0) - timedelta(days=1)).isoformat() + 'Z'},
        {'id': 3, 'name': 'No Due Date Assignment'}
    ]
    courses = [{'id': 10, 'name': 'Test Course'}]

    tool = GetUpcomingCanvasAssignmentsTool(canvas_tools=canvas_tools_instance)
    upcoming = tool._run(courses=courses)

    assert len(upcoming) == 1
    assert upcoming[0]['title'] == 'Upcoming Assignment'
    assert upcoming[0]['course_name'] == 'Test Course'
