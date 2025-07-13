from backend.src.query_orch import find_similar_concepts
from langchain_openai import ChatOpenAI
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
from backend.src.db_schema import Query
from dotenv import load_dotenv
import os

load_dotenv()

OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')

# For reference
intent_label_map = {
    "Research": "Exploring a broad or complex topic that requires detailed explanations and offers significant scope for deeper investigation.",
    "Answer": "A direct question seeking a specific, concise fact, definition, or set of instructions. Often starts with 'what is', 'how to', etc.",
    "Transactional": "The intent to complete a commercial action. Examples: buying a product, viewing prices, ordering parts, signing up for a service, or tracking an order.",
    "News": "Journalism, media reports, or live coverage about developing stories, politics, and breaking events.",
    "Navigational": "The query itself is a destination. It contains a URL, domain, or a specific brand/app name used to go directly to that online property."
}


def concept_parser(concepts):
    counter = 1
    string = ""
    for concept in concepts:
        string += f"{counter}. Concept: {concept['name']}, Intent: {concept['intent']}, Similarity Score: {round(concept['similarity'], 3)} \n"
        counter += 1

    return string


def get_intent(sentence):
    query = Query(sentence, intent='')
    similar_concepts = find_similar_concepts(query)
    prompt_template = PromptTemplate(
        input_variables=["sentence", "concepts"],
        template="""
        You are an expert in intent-classification. You have the following intents to classify between:
        1. Research: {research}
        2. Answer: {answer}
        3. Transactional: {transactional}
        4. News: {news}
        5. Navigational: {navigational}

        Given the following query, and the closest related concepts in the database based on that query, select an intent that
        best matches what the query is suggesting.

        The data that will be given from the database includes closest related concepts previously searched,
        the intent behind those searches and how similar they are to the current query.

        Respond with ONLY the intent, no explanation.

        Sentence: "{sentence}"
        Related Concepts in Database:
        {concepts}
        Intent:
        """
            )

    # Setup the LLM (make sure `OPENAI_API_KEY` is defined elsewhere or passed securely)
    llm = ChatOpenAI(
        model="gpt-4o-mini",
        temperature=0,
        api_key=OPENAI_API_KEY  # or set via environment var
    )

    # Now format inputs and run
    chain = LLMChain(llm=llm, prompt=prompt_template)
    result = chain.run({
        "sentence": sentence,
        "concepts": concept_parser(similar_concepts),
        "research": intent_label_map["Research"],
        "answer": intent_label_map["Answer"],
        "transactional": intent_label_map["Transactional"],
        "news": intent_label_map["News"],
        "navigational": intent_label_map["Navigational"],
    })

    return result.strip()
print(get_intent("What is a good recall score for an unsupervised model?"))