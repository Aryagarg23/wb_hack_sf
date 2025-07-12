import pytest
from fastapi.testclient import TestClient
from mcp_server.src.app import MCPServer

@pytest.fixture
def client():
    """
    Configures the FastAPI app for testing and provides a test client.
    """
    app = MCPServer().app
    with TestClient(app) as client:
        yield client