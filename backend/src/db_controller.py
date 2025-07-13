import flask
from neo4j import GraphDatabase
from backend.config import NEO4J_API_URL, NEO4J_PASSWORD, NEO4J_USER

URI = NEO4J_API_URL
AUTH = (NEO4J_USER, NEO4J_PASSWORD)

def run_db_query(query, vars={}):
    with GraphDatabase.driver(URI, auth=AUTH).session() as session:
        try:
            result = session.run(query, vars)
            return [record.data() for record in result]
        except Exception as e:
            return f"Error! Database error: {e}"