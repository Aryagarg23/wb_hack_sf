from langchain_openai import ChatOpenAI
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
from backend.MCP.researchcrew import run as run_research
from backend.MCP.newscrew import run as run_news
from dotenv import load_dotenv
import os


load_dotenv()

OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')


def get_titles(json):
    prompt = PromptTemplate.from_template(
        """You are an expert in JSON parsing.
    Given the following JSON string, you will extract the 'Title'
    and return it separated by '/'.

    Respond with ONLY the title content, no explanation.

    Example output: Title A / Title B / Title C

    Sentence: "{input}"
    Concept:"""
    )

    llm = ChatOpenAI(model='gpt-4o-mini', temperature=0, api_key=OPENAI_API_KEY)
    concept_chain = LLMChain(llm=llm, prompt=prompt)
    result = concept_chain.run({'input':json})

    return result


def get_links(json):
    prompt = PromptTemplate.from_template(
        """You are an expert in JSON parsing.
    Given the following JSON string, you will extract the 'URL'
    and return it separated by spaces.

    Respond with ONLY the title content, no explanation.

    Example output: https://www.google.com https://www.example.com https://example.com

    Sentence: "{input}"
    Concept:"""
    )

    llm = ChatOpenAI(model='gpt-4o-mini', temperature=0, api_key=OPENAI_API_KEY)
    concept_chain = LLMChain(llm=llm, prompt=prompt)
    result = concept_chain.run({'input':json})

    return result

def get_snipped(json):
    prompt = PromptTemplate.from_template(
        """You are an expert in JSON parsing.
    Given the following JSON string, you will extract the 'Snippet'
    and return it separated by '//.

    Respond with ONLY the title content, no explanation.

    Example output: Snippet A // Snippet B // Snippet C

    Sentence: "{input}"
    Concept:"""
    )

    llm = ChatOpenAI(model='gpt-4o-mini', temperature=0, api_key=OPENAI_API_KEY)
    concept_chain = LLMChain(llm=llm, prompt=prompt)
    result = concept_chain.run({'input':json})

    return result


def consolidate(query, func):
    json = func(query)

    retlist = []
    titles = get_titles(json).split('/')
    links = get_links(json).split(' ')
    snippets = get_snipped(json).split('//')

    for i in range(len(titles)):
        retlist.append({
            'link': links[i],
            'title': titles[i],
            'snippet': snippets[i]
        })


    return retlist

if __name__=="__main__":
    print(consolidate('Latest news about quantum computing', run_news))