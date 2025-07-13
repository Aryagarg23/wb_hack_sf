import requests
import os
from datetime import datetime
from textwrap import dedent
from typing import Type
from pydantic import BaseModel, Field
from crewai import Agent, Crew, Process, Task
from crewai.tools import BaseTool
from langchain_openai import ChatOpenAI
from dotenv import load_dotenv
import json

# Load environment variables
load_dotenv()

# MCP server base URL
MCP_BASE_URL = os.getenv("MCP_BASE_URL", "http://localhost:8000")

# --- Input Schemas (mirror researchcrew.py) ---
class SearchInput(BaseModel):
    query: str = Field(..., description="Search text")
    category: str | None = Field(default=None, description="Search the web")

# --- HTTP Tool Wrappers ---
class ExaSearchHTTPTool(BaseTool):
    name: str = "exa_search"
    description: str = "Search Exa via MCP server."
    args_schema: Type[BaseModel] = SearchInput

    def _run(self, query: str, category: str = None, **_):
        url = f"{MCP_BASE_URL}/research/exa_search"
        payload = {"query": query, "category": category}
        resp = requests.post(url, json=payload, timeout=20)
        resp.raise_for_status()
        return resp.json()

class ArxivSearchHTTPTool(BaseTool):
    name: str = "arxiv_search"
    description: str = "Search arXiv via MCP server."
    args_schema: Type[BaseModel] = SearchInput

    def _run(self, query: str, category: str = None, **_):
        url = f"{MCP_BASE_URL}/research/arxiv_search"
        payload = {"query": query, "category": category}
        resp = requests.post(url, json=payload, timeout=20)
        resp.raise_for_status()
        return resp.json()

class S2SearchHTTPTool(BaseTool):
    name: str = "s2_search"
    description: str = "Search Semantic Scholar via MCP server."
    args_schema: Type[BaseModel] = SearchInput

    def _run(self, query: str, category: str = None, **_):
        url = f"{MCP_BASE_URL}/research/s2_search"
        payload = {"query": query, "category": category}
        resp = requests.post(url, json=payload, timeout=20)
        resp.raise_for_status()
        return resp.json()

# --- Agents (same as researchcrew.py, but use HTTP tools) ---
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
    tools=[ExaSearchHTTPTool(), ArxivSearchHTTPTool(), S2SearchHTTPTool()],
    allow_delegation=False, verbose=True, max_iter=4,
    llm=ChatOpenAI(model_name="gpt-4o-mini", temperature=0.4),
)

summariser = Agent(
    role="Explainer",
    backstory="Turns mixed sources into beginner-friendly explanations.",
    goal=(
        "Write clear, structured notes: plain English, minimum jargon, "
        "include small code or real-world examples when helpful."
    ),
    tools=[], allow_delegation=False, verbose=True, max_iter=4,
    llm=ChatOpenAI(model_name="gpt-4o-mini", temperature=0.65),
)

# --- Tasks (same as researchcrew.py) ---
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

# --- Crew ---
crew = Crew(
    agents=[router, summariser],
    tasks=[router_task, summary_task],
    process=Process.sequential,
    verbose=True,
)

def run(topic: str):
    inputs = {"topic": topic, "current_date": datetime.now().strftime("%Y-%m-%d")}
    final = crew.kickoff(inputs=inputs)
    sources = []
    if router_task.output_file:
        try:
            with open(router_task.output_file, 'r') as f:
                sources = json.loads(f.read())
        except Exception as e:
            print(f"Error reading sources: {e}")
            sources = []
    result = {
        "topic": topic,
        "summary": str(summary_task.output) if summary_task.output else "",
        "links": sources,
        "timestamp": datetime.now().isoformat()
    }
    print("\n\n### RESEARCH SUMMARY (HTTP) ###\n")
    print(summary_task.output)
    print(f"\n### LINKS (JSON) ###\n")
    print(result)
    return result

if __name__ == "__main__":
    print(run("Getting started with convolutional neural networks")) 