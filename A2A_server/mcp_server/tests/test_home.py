def test_home_route(client):
    response = client.get('/')
    assert response.status_code == 200
    assert 'MCP FastAPI server is running!' in response.text