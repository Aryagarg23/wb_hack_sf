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

# Load environment variables
load_dotenv()

# MCP server base URL
MCP_BASE_URL = os.getenv("MCP_BASE_URL", "http://localhost:8000")

# --- Input Schemas (mirror newscrew.py) ---
class SearchInput(BaseModel):
    query: str = Field(..., description="Search text")

class NewsSearchInput(SearchInput):
    from_date: str | None = Field(default=None, description="Start date YYYY-MM-DD")
    to_date: str | None = Field(default=None, description="End date YYYY-MM-DD")
    language: str | None = Field(default="en", description="2-letter code")

# --- HTTP Tool Wrappers ---
class NewsAPISearchHTTPTool(BaseTool):
    name: str = "news_api_search"
    description: str = "Search NewsAPI via MCP server."
    args_schema: Type[BaseModel] = NewsSearchInput

    def _run(self, query: str, from_date: str = None, to_date: str = None, language: str = "en", **_):
        url = f"{MCP_BASE_URL}/news/news_api_search"
        payload = {"query": query, "from_date": from_date, "to_date": to_date, "language": language}
        resp = requests.post(url, json=payload, timeout=20)
        resp.raise_for_status()
        return resp.json()

class GDELTSearchHTTPTool(BaseTool):
    name: str = "gdelt_search"
    description: str = "Search GDELT via MCP server."
    args_schema: Type[BaseModel] = NewsSearchInput

    def _run(self, query: str, from_date: str = None, to_date: str = None, **_):
        url = f"{MCP_BASE_URL}/news/gdelt_search"
        payload = {"query": query, "from_date": from_date, "to_date": to_date}
        resp = requests.post(url, json=payload, timeout=20)
        resp.raise_for_status()
        return resp.json()

class ExaSearchHTTPTool(BaseTool):
    name: str = "exa_search"
    description: str = "Search Exa via MCP server."
    args_schema: Type[BaseModel] = SearchInput

    def _run(self, query: str, **_):
        url = f"{MCP_BASE_URL}/news/exa_search"
        payload = {"query": query}
        resp = requests.post(url, json=payload, timeout=20)
        resp.raise_for_status()
        return resp.json()

# --- Agents (same as newscrew.py, but use HTTP tools) ---
router = Agent(
    role="News Router",
    backstory=dedent("""
        You decide which search tool(s) fit the request.
        • If the prompt contains 'news', 'headline', 'today', 'latest',
          or a recent date, use **news_api_search**.
        • If it asks about coverage over time ('since 2022', 'evolution',
          'trend'), add **gdelt_search**.
        • Add **exa_search** for tutorials, blog context, or developer angles.
        You may call multiple tools and must return a single JSON array
        named `sources` (5-10 de-duplicated items)."""),
    goal="Pick tools, fetch results, emit a `sources` JSON list.",
    tools=[NewsAPISearchHTTPTool(), GDELTSearchHTTPTool(), ExaSearchHTTPTool()],
    llm=ChatOpenAI(model_name="gpt-4o-mini", temperature=0.3),
    allow_delegation=False,
    verbose=True,
    max_iter=4,
)

summariser = Agent(
    role="News Explainer",
    backstory="Turns raw links into short, beginner-friendly news digests.",
    goal="Produce clear, date-stamped news notes.",
    tools=[],
    llm=ChatOpenAI(model_name="gpt-4o-mini", temperature=0.55),
    allow_delegation=False,
    verbose=True,
    max_iter=4,
)

# --- Tasks (same as newscrew.py) ---
router_task = Task(
    description=dedent("""
        **Step 1 – Pick tools & collect sources**

        Topic: {{topic}}

        • Decide which of `news_api_search`, `gdelt_search`, `exa_search`
          (or a combo) is appropriate.
        • Call them.  Merge and de-duplicate the results with `title`, `url`,
          and `snippet`.  Keep 5–10 items max.
        • Return exactly *one* JSON list named `sources`.
    """),
    expected_output="JSON list of 5-10 sources.",
    agent=router,
)

summary_task = Task(
    description=dedent("""
        **Step 2 – Write digest**

        For every item in `router_output.json`, craft:

        ### *Headline* (Outlet, YYYY-MM-DD)
        **What happened:** …  
        **Why it matters:** …  
        **Source:** <url>

        • Keep each block ≈60-80 words.
        • Use plain English and minimal jargon.
    """),
    expected_output="Markdown digest for each source.",
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
        "digest": str(summary_task.output) if summary_task.output else "",
        "links": sources,
        "timestamp": datetime.now().isoformat()
    }
    print("\n\n### NEWS DIGEST (HTTP) ###\n")
    print(summary_task.output)
    print(f"\n### LINKS (JSON) ###\n")
    print(result)
    return result

if __name__ == "__main__":
    print(run("Latest developments in AI chip export controls"))

