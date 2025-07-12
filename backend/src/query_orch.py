from backend.src.db_controller import run_db_query
from backend.src.db_schema import Concept, Query, Link
from sentence_transformers import SentenceTransformer
from backend.tools.concept_categorizer import get_concept

# Config for database stuff
model = SentenceTransformer('all-MiniLM-L6-v2', use_auth_token=False)  # or another model

def find_similar_concepts(query: Query, top_k=5):
    content = query.getContent()
    embedding = model.encode(content).tolist()

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
        "concept_name": concept.getName(),
        "intent": concept.intent,
        "embedding": concept.embedding,
        "query_content": content,
    }

    run_db_query(cypher_query, parameters)

    return concept

# if __name__ == "__main__":
#     a = Query('How to make sourdough', intent='Transactional')
#     print(find_similar_concepts(a))