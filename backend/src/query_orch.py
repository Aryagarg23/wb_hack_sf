from db_controller import run_db_query
from db_schema import Concept, Query, Link
from sentence_transformers import SentenceTransformer

model = SentenceTransformer('all-MiniLM-L6-v2')  # or another model

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
            LIMIT 10
            """
    vars = {"embedding": embedding, "top_k": top_k}
    result = run_db_query(db_query, vars)

    return result


# if __name__ == "__main__":
#     a = Query(content="Ai Generated Content", intent="Transactional")
#     print(find_similar_concepts(a))