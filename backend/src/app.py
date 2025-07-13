from flask import Flask, request, jsonify
from flask_cors import CORS
from backend.src.db_schema import Query, Link
from backend.src.fivedvector import collect_all_intent
from backend.MCP.newscrew_http import run as news_run
from backend.MCP.researchcrew import run as res_run
from backend.tools.sources_parser import consolidate
from backend.src.query_orch import connect_links_to_query, find_similar_concepts, create_concept, connect_concept_to_query, retrieve_all_links_to_concept, retrieve_graph
from backend.tools.concept_categorizer import get_concept

app = Flask(__name__)
CORS(app)

@app.route('/api/search', methods=['POST'])
def search():
    data = request.get_json()
    query = Query(data['query'], intent="")

    result = collect_all_intent(query=query.content)

    intent = result.get('most_significant').get('intent')
    query.intent = intent
    answer = jsonify({'data': query.getContent(), 'intent': intent})

    if intent == 'News':
        answer = consolidate(query.getContent(), news_run)

    if intent == 'Research':
        answer = consolidate(query.getContent(), res_run)


    if answer != '':
        return jsonify(answer), 200
    else:
        return jsonify(answer), 400


@app.route('/api/add-links', methods=['POST'])
def link_adder():
    try:
        data = request.get_json()
        links = data.get('links')
        query = data.get('query')
        intent = data.get('intent')

        q = Query(query, intent)
        l = [Link(i) for i in links]
        connect_links_to_query(q, l)

        return jsonify('Success!'), 200
    except Exception as e:
        return jsonify(f"Error: {e}"), 400


@app.route('/api/new-query', methods=['POST'])
def query_adder():
    try:
        data = request.get_json()
        query = data.get('query')
        intent = data.get('intent')

        q = Query(query, intent)
        sim_concepts = find_similar_concepts(q)

        if sim_concepts[0].get('similarity') < 0.35:
            create_concept(q)

        else:
            for i in sim_concepts:
                if i.get('similarity') > 0.40:
                    connect_concept_to_query(q, i)

        return jsonify('Success!'), 200

    except Exception as e:
        return jsonify(f'Error: {e}'), 400


@app.route('/api/get-all-links-to-concept', methods=['POST'])
def get_all_links_to_concept():
    try:
        data = request.get_json()
        query = data.get('query')

        concept = get_concept(query)

        links = retrieve_all_links_to_concept(concept)

        return jsonify(links), 200

    except Exception as e:
        jsonify(f'Error: {e}'), 400

@app.route('/api/get-graph', methods=['GET'])
def get_graph():
    graph = get_graph()

    return jsonify(graph), 200

if __name__ == "__main__":
    app.run()