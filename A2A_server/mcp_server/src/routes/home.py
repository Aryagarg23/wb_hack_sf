from fastapi import APIRouter

home_router = APIRouter()

@home_router.get('/')
async def home():
    """
    Handles requests to the root URL of the MCP server.

    Returns:
        str: A simple message indicating the FastAPI server is running.
    """
    return "MCP FastAPI server is running!"