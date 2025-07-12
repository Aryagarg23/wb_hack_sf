from langchain_openai import ChatOpenAI
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
from dotenv import load_dotenv
import os

OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')

def get_concept(sentence):
    prompt = PromptTemplate.from_template(
        """You are an expert in topic classification.
    Given the following sentence, return a high-level concept that categorizes its meaning.

    Respond with ONLY the concept, no explanation.

    Sentence: "{input}"
    Concept:"""
    )

    llm = ChatOpenAI(model='gpt-4o-mini', temperature=0, api_key=OPENAI_API_KEY)
    concept_chain = LLMChain(llm=llm, prompt=prompt)
    result = concept_chain.run(sentence)
    return result.strip()
