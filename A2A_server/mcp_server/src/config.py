import os
from dotenv import load_dotenv

class Config:
    """
    Configuration class for the MCP server.
    Loads environment variables and provides access to API tokens and other settings.
    """
    def __init__(self):
        """
        Initializes the Config class by loading environment variables from a .env file.
        """
        load_dotenv()
        self.CANVAS_API_TOKEN = os.getenv('CANVAS_API_TOKEN')
        self.TODOIST_API_TOKEN = os.getenv('TODOIST_API_TOKEN')
        self.CANVAS_BASE_URL = os.getenv('CANVAS_BASE_URL')

    def get_canvas_api_token(self) -> str:
        """
        Retrieves the Canvas API token from environment variables.

        Returns:
            str: The Canvas API token.
        """
        return self.CANVAS_API_TOKEN

    def get_todoist_api_token(self) -> str:
        """
        Retrieves the Todoist API token from environment variables.

        Returns:
            str: The Todoist API token.
        """
        return self.TODOIST_API_TOKEN

    def get_canvas_base_url(self) -> str:
        """
        Retrieves the Canvas base URL from environment variables.

        Returns:
            str: The Canvas base URL.
        """
        return self.CANVAS_BASE_URL
