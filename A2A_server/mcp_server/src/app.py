from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from mcp_server.src.routes.home import home_router
from mcp_server.src.routes.assignment_sync import assignment_sync_router

class MCPServer:
    """
    The main class for the Multi-Agent Coordination Protocol (MCP) server.
    This server acts as an orchestrator for various agents, facilitating
    communication and coordination based on the A2A protocol.
    """
    def __init__(self):
        """
        Initializes the FastAPI application and enables Cross-Origin Resource Sharing (CORS).
        """
        self.app = FastAPI()
        self.app.add_middleware(
            CORSMiddleware,
            allow_origins=["*"],
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )
        self._register_routers()

    def _register_routers(self):
        """
        Registers FastAPI routers for different functionalities (e.g., home, assignment sync).
        """
        self.app.include_router(home_router)
        self.app.include_router(assignment_sync_router)

    def run(self, host: str = "0.0.0.0", port: int = 5000, reload: bool = True):
        """
        Runs the FastAPI application using Uvicorn.

        Args:
            host (str): The host address to bind the server to. Defaults to '0.0.0.0'.
            port (int): The port to bind the server to. Defaults to 5000.
            reload (bool): Enables or disables auto-reloading. Defaults to True.
        """
        import uvicorn
        uvicorn.run(self.app, host=host, port=port, reload=reload)

if __name__ == '__main__':
    server = MCPServer()
    server.run()