from unittest.mock import patch, Mock

def test_sync_assignments_crew_success(client):
    with patch('crewai.Crew.kickoff') as mock_crew_kickoff:
        mock_crew_kickoff.return_value = "CrewAI orchestration successful!"

        response = client.get('/sync-assignments')
        assert response.status_code == 200
        data = response.json()
        assert data['status'] == 'success'
        assert data['message'] == 'Assignment synchronization orchestrated by CrewAI.'
        assert data['crew_output'] == 'CrewAI orchestration successful!'

        mock_crew_kickoff.assert_called_once()
