from backend.src.db_controller import run_db_query
from backend.src.db_schema import Concept, Query, Link
from sentence_transformers import SentenceTransformer
from backend.tools.concept_categorizer import get_concept
from typing import List

################################################
# SINGULAR TRANSACTIONS TO MAIN GRAPH
################################################
def find_similar_concepts(query: Query, top_k=5):
    model = SentenceTransformer('all-MiniLM-L6-v2', use_auth_token=False)  # or another model
    content = query.getContent()
    relevant_concept = get_concept(content)
    embedding = model.encode(relevant_concept).tolist()


    db_query = """
            WITH $embedding AS queryEmbedding
            MATCH (c:Concept)
            WITH c,
                REDUCE(dot = 0.0, i IN RANGE(0, SIZE(queryEmbedding)-1) | dot + queryEmbedding[i] * c.embedding[i]) AS dotProduct,
                SQRT(REDUCE(qSum = 0.0, i IN RANGE(0, SIZE(queryEmbedding)-1) | qSum + queryEmbedding[i]^2)) AS queryMagnitude,
                SQRT(REDUCE(cSum = 0.0, i IN RANGE(0, SIZE(c.embedding)-1) | cSum + c.embedding[i]^2)) AS conceptMagnitude
            WITH c,
                CASE
                    WHEN queryMagnitude = 0 OR conceptMagnitude = 0 THEN 0.0
                    ELSE dotProduct / (queryMagnitude * conceptMagnitude)
                END AS similarity
            RETURN c.name AS name, c.intent AS intent, similarity
            ORDER BY similarity DESC
            LIMIT $top_k
            """
    vars = {"embedding": embedding, "top_k": top_k}
    result = run_db_query(db_query, vars)

    return result

def create_concept(query: Query):
    model = SentenceTransformer('all-MiniLM-L6-v2', use_auth_token=False)  # or another model
    content = query.getContent()
    concept = get_concept(content)
    intent = query.intent # Assuming the roberta handles this
    embedding = model.encode(concept).tolist()

    concept = Concept(name=concept, intent=intent, embedding=embedding)

    cypher_query = """
    MERGE (c:Concept {name: $concept_name})
    ON CREATE SET c.intent = $intent, c.embedding = $embedding

    MERGE (q:Query {content: $query_content})
    ON CREATE SET q.intent = $intent

    MERGE (c)-[:SEARCHED_BY]->(q)
    """

    parameters = {
        "concept_name": concept.name,
        "intent": concept.intent,
        "embedding": concept.embedding,
        "query_content": content,
    }

    run_db_query(cypher_query, parameters)

def connect_concept_to_query(query: Query, concept: Concept):
    cypher_query = """
    MERGE (c:Concept {name: $concept_name})
    MERGE (q:Query {content: $query_content})
    MERGE (c)-[:SEARCHED_BY]->(q)
    """

    parameters = {
        "concept_name": concept.name,
        "query_content": query.content
    }

    run_db_query(cypher_query, parameters)

def connect_links_to_query(query: Query, links_visited: List[Link]):
    cypher_query = """
    MERGE (q: Query {content: $query_content})
    MERGE (l: Link {address: $link_address})
    MERGE (q)-[:CLICKED]-(l)
    """

    parameters = {
        "query_content": query.content,
        "link_address": ""
    }

    for link in links_visited:
        parameters["link_address"] = link.address

        # print(parameters)
        run_db_query(cypher_query, parameters)

def retrieve_all_related_concepts(query: Query):
    cypher_query = """
    MATCH (n:Concept)
    MATCH (m:Query {content: $query_content})
    MATCH (n)-[r:SEARCHED_BY]-(m:Query)
    RETURN n
    """

    parameters = {
        "query_content": query.content
    }

    result = run_db_query(cypher_query, parameters)

    return result


def retrieve_all_links_to_query(query: Query):
    cypher_query = """
    MATCH (n:Query {content: $query_content})
    MATCH (m:Link)
    MATCH (n)-[r:CLICKED]-(m)
    RETURN m
    """

    parameters = {
        "query_content": query.content
    }

    result = run_db_query(cypher_query, parameters)

    return result

def retrieve_all_links_to_concept(concept):
    cypher_query = """
    MATCH (n:Concept {name: $concept_name})
    MATCH (m:Query)
    MATCH (l:Link)
    MATCH (n)-[:SEARCHED_BY]-(m)-[:CLICKED]-(l)
    RETURN l
    """
    parameters = {
        "concept_name": concept
    }

    result = run_db_query(cypher_query, parameters)

    return(result)

def retrieve_graph():
    cypher_query = """
    MATCH (n)
    WHERE n:Concept OR n:Query OR n:Link
    OPTIONAL MATCH (n)-[r]->(m)
    WHERE m:Concept OR m:Query OR m:Link
    RETURN n, r, m
    """
    result = run_db_query(cypher_query)

    nodes = []
    relationships = []

    for record in result:
        n = record["n"]
        m = record["m"]
        r = record["r"]

        nodes.append(n)
        nodes.append(m)
        relationships.append(r)


    return {
        "nodes": list(nodes),
        "relationships": relationships
    }



# if __name__ == "__main__":
#     q = Query('My breadboard is broken, how do I fix it?', intent='Informational')
#     print(find_similar_concepts(q))
    # q = Query('How to make sourdough', intent='Informational')
    # print(create_concept(q))
    # print(retrieve_graph())
