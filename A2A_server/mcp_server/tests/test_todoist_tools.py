import pytest
from unittest.mock import patch, Mock
from mcp_server.src.tools.todoist_tools import TodoistTools, FetchTodoistTasksTool, AddTodoistTaskTool

@pytest.fixture
def todoist_tools_instance():
    return TodoistTools(todoist_api_token='test_todoist_token')

@patch('requests.get')
def test_fetch_todoist_tasks_tool(mock_get, todoist_tools_instance):
    mock_response = Mock()
    mock_response.status_code = 200
    mock_response.json.return_value = [{'id': 1, 'content': 'Task 1'}]
    mock_get.return_value = mock_response

    tool = FetchTodoistTasksTool(todoist_tools=todoist_tools_instance)
    tasks = tool._run()

    assert len(tasks) == 1
    assert tasks[0]['content'] == 'Task 1'

@patch('requests.post')
@patch('mcp_server.src.tools.todoist_tools.TodoistTools.fetch_tasks')
def test_add_todoist_task_tool_success(mock_fetch_tasks, mock_post, todoist_tools_instance):
    mock_fetch_tasks.return_value = []  # No existing tasks
    mock_post.return_value.status_code = 200

    task = {'title': 'New Assignment', 'due_date': '2025-07-15T10:00:00Z', 'course_name': 'Test Course'}
    tool = AddTodoistTaskTool(todoist_tools=todoist_tools_instance)
    result = tool._run(task=task)

    assert result is True
    mock_post.assert_called_once_with(
        "https://api.todoist.com/rest/v2/tasks",
        json={'content': 'New Assignment in Test Course', 'due_datetime': '2025-07-15T10:00:00Z'},
        headers=todoist_tools_instance.headers
    )

@patch('requests.post')
@patch('mcp_server.src.tools.todoist_tools.TodoistTools.fetch_tasks')
def test_add_todoist_task_tool_duplicate(mock_fetch_tasks, mock_post, todoist_tools_instance):
    mock_fetch_tasks.return_value = [{'content': 'Existing Assignment in Test Course'}]

    task = {'title': 'Existing Assignment', 'due_date': '2025-07-15T10:00:00Z', 'course_name': 'Test Course'}
    tool = AddTodoistTaskTool(todoist_tools=todoist_tools_instance)
    result = tool._run(task=task)

    assert result is False
    mock_post.assert_not_called()

@patch('requests.post')
@patch('mcp_server.src.tools.todoist_tools.TodoistTools.fetch_tasks')
def test_add_todoist_task_tool_error(mock_fetch_tasks, mock_post, todoist_tools_instance):
    mock_fetch_tasks.return_value = []
    mock_post.return_value.status_code = 400
    mock_post.return_value.text = "Error message"

    task = {'title': 'New Assignment', 'due_date': '2025-07-15T10:00:00Z', 'course_name': 'Test Course'}
    tool = AddTodoistTaskTool(todoist_tools=todoist_tools_instance)
    result = tool._run(task=task)

    assert result is False
