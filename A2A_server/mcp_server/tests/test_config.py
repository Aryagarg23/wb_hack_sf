import os
from unittest.mock import patch
from mcp_server.src.config import Config

@patch('mcp_server.src.config.load_dotenv')
def test_config_loads_env_vars(mock_load_dotenv):
    with patch.dict(os.environ, {
        'CANVAS_API_TOKEN': 'test_canvas_token',
        'TODOIST_API_TOKEN': 'test_todoist_token',
        'CANVAS_BASE_URL': 'http://test.canvas.com'
    }):
        config = Config()
        assert config.get_canvas_api_token() == 'test_canvas_token'
        assert config.get_todoist_api_token() == 'test_todoist_token'
        assert config.get_canvas_base_url() == 'http://test.canvas.com'

@patch('mcp_server.src.config.load_dotenv')
def test_config_returns_none_if_env_var_not_set(mock_load_dotenv):
    with patch.dict(os.environ, {}, clear=True):
        config = Config()
        assert config.get_canvas_api_token() is None
        assert config.get_todoist_api_token() is None
        assert config.get_canvas_base_url() is None