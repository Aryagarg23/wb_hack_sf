# learning_assistant.py  – prompts tweaked for general learning
import os, json, requests, subprocess
from datetime import datetime
from textwrap import dedent
from typing import Type

from dotenv import load_dotenv
from pydantic import BaseModel, Field
from crewai import Agent, Crew, Process, Task
from crewai.tools import BaseTool
from langchain_openai import ChatOpenAI
from langchain_community.utilities import ArxivAPIWrapper

# ───────────────────────────────────────────────────────────────
load_dotenv()                         # EXA_API_KEY, S2_API_KEY must be set
OPENAI_MODEL = "gpt-4o-mini"

# ────────────────────────── generic schema ─────────────────────
class SearchInput(BaseModel):
    query: str = Field(..., description="Search text")
    category: str | None = Field(
        default=None,
        description="Search the web"
    )

# ────────────────────────── search tools ───────────────────────
class ExaSearchTool(BaseTool):
    name: str = "exa_search"
    description: str = "Search Exa for tutorials, videos,  blogs, GitHub, news, PDFs."
    args_schema: Type[BaseModel] = SearchInput
    def _run(self, query: str, **_) -> str:
        body = {"query": query, "numResults": 5, "contents": {"text": True}}
        cmd = [
            "curl","-s","-X","POST","https://api.exa.ai/search",
            "--header","content-type: application/json",
            "--header",f"x-api-key: {os.getenv('EXA_API_KEY')}",
            "--data",json.dumps(body),
        ]
        try:
            resp = subprocess.run(cmd, capture_output=True, text=True, check=True)
            return json.dumps(json.loads(resp.stdout), indent=2)
        except Exception as e:
            return f"[Exa search failed] {e}"

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
        params = {"query": query, "limit": 5,
                  "fields": "title,year,venue,authors,citationCount,url"}
        headers = {"x-api-key": os.getenv("S2_API_KEY")}
        try:
            r = requests.get(self.S2_ENDPOINT, params=params,
                             headers=headers, timeout=15)
            r.raise_for_status()
            return json.dumps(r.json(), indent=2)
        except Exception as e:
            return f"[Semantic Scholar search failed] {e}"

# ────────────────────────── agents ─────────────────────────────
router = Agent(
    role="Learning Router",
    backstory=(
        "You triage a learner’s topic and pick the best retrieval tool(s).\n"
        "• If it sounds like general learning (tutorial, how-to, basics, guide), "
        "favour **exa_search** for blogs, docs, repos.\n"
        "• If it sounds like deep research (paper, benchmark, SOTA, citation), "
        "favour **arxiv_search** and **s2_search**.\n"
        "You may call several tools for a balanced view and return raw JSON."
    ),
    goal="Select the right tools and fetch 5–10 useful sources.",
    tools=[ExaSearchTool(), ArxivSearchTool(), SemanticScholarSearchTool()],
    allow_delegation=False, verbose=True, max_iter=4,
    llm=ChatOpenAI(model_name=OPENAI_MODEL, temperature=0.4),
)

summariser = Agent(
    role="Explainer",
    backstory="Turns mixed sources into beginner-friendly explanations.",
    goal=(
        "Write clear, structured notes: plain English, minimum jargon, "
        "include small code or real-world examples when helpful."
    ),
    tools=[], allow_delegation=False, verbose=True, max_iter=4,
    llm=ChatOpenAI(model_name=OPENAI_MODEL, temperature=0.65),
)

# ────────────────────────── tasks ──────────────────────────────
router_task = Task(
    description=dedent(
        """
        **Step 1 – Choose the right sources**

        Topic: {{topic}}

        • Decide whether this looks like a *general learning* request or a
          *research-level* request (inspect keywords).
        • Prefer **exa_search** for tutorials / guides, **arxiv_search** + **s2_search**
          for research. Use both categories if helpful.
        • Return a JSON list called `sources` each item:

          {"title": "...", "url": "...", "snippet": "...",
           "source": "exa|arxiv|s2"}
        """
    ),
    expected_output="JSON list of 5–10 sources.",
    agent=router,
)

summary_task = Task(
    description=dedent(
        """
        **Step 2 – Beginner-friendly summary**

        For every item in `router_output.json`, craft a Markdown block:

        ### [Title]
        • **What it covers:** …  
        • **Key insight:** …  
        • **Example / Analogy:** …

        Keep each block ≈80 words; aim for clarity over completeness.
        """
    ),
    expected_output="Markdown notes for each source.",
    agent=summariser,
    context=[router_task],
)

# ────────────────────────── crew ───────────────────────────────
crew = Crew(
    agents=[router, summariser],
    tasks=[router_task, summary_task],
    process=Process.sequential,
    verbose=True,
)

# ────────────────────────── entry point ────────────────────────
def run(topic: str):
    inputs = {"topic": topic, "current_date": datetime.now().strftime("%Y-%m-%d")}
    final = crew.kickoff(inputs=inputs)
    print("\n\n### SUMMARY NOTES ###\n", summary_task.output)
    if router_task.output_file:
        with open(router_task.output_file) as f:
            print(f"\n--- {router_task.output_file} ---\n{f.read()}")
    return {"summary": summary_task.output, "sources": router_task.output_file}

if __name__ == "__main__":
    print(run("Getting started with convolutional neural networks"))
