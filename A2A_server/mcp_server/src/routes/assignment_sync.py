from fastapi import APIRouter
from mcp_server.src.crew import AssignmentSyncCrew

assignment_sync_router = APIRouter()

@assignment_sync_router.get('/sync-assignments')
async def sync_assignments():
    """
    Synchronizes upcoming assignments from Canvas to Todoist.
    This endpoint orchestrates the communication between the CanvasAgent and TodoistAgent.

    Returns:
        dict: A JSON response indicating the status of the synchronization
                        and a list of tasks that were added to Todoist.
    """
    crew = AssignmentSyncCrew()
    result = crew.run()

    # The result from crew.run() will be the final output of the orchestration.
    # You might need to parse this result based on how your CrewAI agents are designed
    # to return their final output.
    return {
        "status": "success",
        "message": "Assignment synchronization orchestrated by CrewAI.",
        "crew_output": result
    }