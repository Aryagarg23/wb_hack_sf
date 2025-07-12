import flask
from neo4j import GraphDatabase
from config import NEO4J_API_URL, NEO4J_PASSWORD, NEO4J_USER

URI = NEO4J_API_URL
AUTH = (NEO4J_USER, NEO4J_PASSWORD)

with GraphDatabase.driver(URI, auth=AUTH) as driver:
    driver.verify_connectivity()