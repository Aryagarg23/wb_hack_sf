# learning_assistant.py – prompts tweaked for general learning, SerpAPI version
import os, json, requests
from datetime import datetime
from textwrap import dedent
from typing import Type
import subprocess
from dotenv import load_dotenv
from pydantic import BaseModel, Field, constr
from crewai import Agent, Crew, Process, Task
from crewai.tools import BaseTool
from exa_py import Exa
from langchain_openai import ChatOpenAI
from langchain_community.utilities import ArxivAPIWrapper

import os, requests, json
from pydantic import BaseModel, Field, constr
from crewai.tools import BaseTool
from typing import Type

# ───────────────────────────────────────────────────────────────
load_dotenv()                         # SERPAPI_API_KEY, S2_API_KEY must be set
OPENAI_MODEL = "gpt-4o-mini"

# ────────────────────────── generic schema ─────────────────────
class SearchInput(BaseModel):
    """Minimal query-only payload."""
    query: constr(strip_whitespace=True, min_length=1) = Field(
        ..., description="Free-text search query."
    )

# ────────────────────────── search tools ───────────────────────
class ExaSearchTool(BaseTool):
    name: str = "exa_search"
    description: str = "Search Exa for tutorials, blogs, repos, PDFs."
    args_schema: Type[BaseModel] = SearchInput

    def _run(self, query: str, **_) -> str:

        if isinstance(query, str) and query.strip().startswith("{"):
            try:
                query_obj = json.loads(query)
                query = query_obj.get("query", "")
            except Exception as e:
                return f"[Exa input parsing error] {e}"
        try:
            exa = Exa(api_key=os.getenv("EXA_API_KEY"))
            print(query)
            results = exa.search_and_contents(
                query,
                type="neural",
                num_results=5,
                highlights=True,
                livecrawl="always"
            )

            parsed = [
                {
                    "title": result.title,
                    "url": result.url,
                    "snippet": " ".join(result.highlights or ["(no highlights found)"])
                }
                for result in results.results
            ]
            return json.dumps(parsed, indent=2)
        except Exception as e:
            return f'[Exa search failed via SDK] {e}'
class ArxivSearchTool(BaseTool):
    name: str = "arxiv_search"
    description: str = "Search arXiv for scholarly papers."
    args_schema: Type[BaseModel] = SearchInput
    _wrapper = ArxivAPIWrapper(load_max_docs=5)
    def _run(self, query: str, **_) -> str:
        try:
            return self._wrapper.run(query)
        except Exception as e:
            return f"[arXiv search failed] {e}"

class SemanticScholarSearchTool(BaseTool):
    name: str = "s2_search"
    description: str = "Search Semantic Scholar for metadata & citations."
    args_schema: Type[BaseModel] = SearchInput
    S2_ENDPOINT: str = "https://api.semanticscholar.org/graph/v1/paper/search"
    def _run(self, query: str, **_) -> str:
        params = {
            "query": query, "limit": 5,
            "fields": "title,year,venue,authors,citationCount,url"
        }
        headers = {"x-api-key": os.getenv("S2_API_KEY")}
        try:
            r = requests.get(self.S2_ENDPOINT, params=params,
                             headers=headers, timeout=15)
            r.raise_for_status()
            return json.dumps(r.json(), indent=2)
        except Exception as e:
            return f"[Semantic Scholar search failed] {e}"

enhancer = Agent(
    role="Query Enhancer",
    backstory=dedent("""
        You are an expert at rewriting and expanding search queries for news and research. Your job is to take a user-provided topic and turn it into a clear, detailed, and effective search query that will yield the best results from search.
    """),
    goal="Rewrite or expand the topic into a more effective search query.",
    tools=[],
    llm=ChatOpenAI(model_name=OPENAI_MODEL, temperature=0.4),
    allow_delegation=False,
    verbose=True,
    max_iter=2,
)
# ────────────────────────── agents ─────────────────────────────
router = Agent(
    role="Learning Router",
    backstory=(
        "You triage a learner’s topic and pick the best retrieval tool(s).\n"
        "• If it sounds like general learning (tutorial, how-to, basics, guide), "
        "favour **serpapi_search** for blogs, docs, repos.\n"
        "• If it sounds like deep research (paper, benchmark, SOTA, citation), "
        "favour **arxiv_search** and **s2_search**.\n"
        "You may call several tools for a balanced view and return raw JSON."
    ),
    goal="Select the right tools and fetch 5–10 useful sources.",
    tools=[ExaSearchTool(), ArxivSearchTool(), SemanticScholarSearchTool()],
    allow_delegation=False, verbose=True, max_iter=4,
    llm=ChatOpenAI(model_name=OPENAI_MODEL, temperature=0.4),
)
enhance_task = Task(
    description=dedent("""
        **Step 0 – Enhance the query for better search
            Take the userprovided query and enhance to be more clear and detailed}**

    """),
    expected_output="A rewritten or expanded search query string.",
    agent=enhancer,
)
# ────────────────────────── tasks ──────────────────────────────
router_task = Task(
    description=dedent(
        """
        **Step 1 – Choose the right sources**

        Topic: {{topic}}

        • Decide whether this looks like a *general learning* request or a
          *research-level* request (inspect keywords).
        • Prefer **serpapi_search** for tutorials / guides, **arxiv_search** + **s2_search**
          for research. Use both categories if helpful.
        • Return a JSON list called `sources` each item:

          {"title": "...", "url": "...", "snippet": "...",
           "source": "serpapi|arxiv|s2"}
        """
    ),
    expected_output="JSON list of 5–10 sources.",
    agent=router,
    context={enhance_task}
)

# ────────────────────────── crew ───────────────────────────────
crew = Crew(
    agents=[enhancer, router],
    tasks=[enhance_task,router_task],
    process=Process.sequential,
    verbose=True,
)

# ────────────────────────── entry point ────────────────────────
def run(topic: str):
    inputs = {"topic": topic, "current_date": datetime.now().strftime("%Y-%m-%d")}
    final = crew.kickoff(inputs={"topic": topic})
    print("\n\n### SUMMARY NOTES ###\n", router_task.output)
    if router_task.output_file:
        with open(router_task.output_file) as f:
            print(f"\n--- {router_task.output_file} ---\n{f.read()}")
    return {"summary": router_task.output}

if __name__ == "__main__":
    print(run("Getting started with convolutional neural networks"))
