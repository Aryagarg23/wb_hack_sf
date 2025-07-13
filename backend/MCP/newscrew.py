# learning_assistant.py  – NEWS-centric version with highlights
# ---------------------------------------------------------------
# Requires:  OPENAI_API_KEY, NEWS_API_KEY, EXA_API_KEY (.env)
# Optional:  S2_API_KEY if you keep the research tools
# ---------------------------------------------------------------
import os, json, requests, subprocess
from datetime import datetime, timedelta
from textwrap import dedent
from typing import Type
import subprocess
from exa_py import Exa
from dotenv import load_dotenv
from pydantic import BaseModel, Field, constr, validator
from crewai import Agent, Crew, Process, Task
from crewai.tools import BaseTool
from langchain_openai import ChatOpenAI
import weave

load_dotenv('backend/.env')
# ──────────────────────── load env vars ───────────────────────
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
OPENAI_MODEL = "gpt-4o"

# ────────────────────────── schemas ───────────────────────────
class SearchInput(BaseModel):
    """Minimal query-only payload."""
    query: constr(strip_whitespace=True, min_length=1) = Field(
        ...,
        description="Free-text search query."
    )


class NewsSearchInput(SearchInput):
    """Adds optional ISO-8601 date filters & language."""
    from_date: str | None = Field(
        default=None, description="Start date YYYY-MM-DD")
    to_date: str | None = Field(
        default=None, description="End date YYYY-MM-DD")
    language: str | None = Field(default="en", description="2-letter code")

# ──────────────────────── search tools ────────────────────────
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
class NewsAPISearchTool(BaseTool):
    """Live/archived news via NewsAPI.org "everything" endpoint."""
    name: str = "news_api_search"
    description: str = "Search NewsAPI for up-to-the-minute headlines & articles."
    args_schema: Type[BaseModel] = NewsSearchInput

    def _run(self, query: str, from_date: str | None = None,
             to_date: str | None = None, language: str = "en", **_) -> str:
        url = "https://newsapi.org/v2/everything"
        params = {
            "q": query,
            "pageSize": 10,
            "sortBy": "publishedAt",
            "language": language,
            "apiKey": os.getenv("NEWS_API_KEY"),
        }
        if from_date:
            params["from"] = from_date
        if to_date:
            params["to"] = to_date
        r = requests.get(url, params=params, timeout=15)
        r.raise_for_status()
        items = r.json().get("articles", [])
        # strip down to essentials
        slim = [
            {"title": a["title"], "url": a["url"],
             "snippet": (a.get("description") or "")[:180]}
            for a in items
        ]
        return json.dumps(slim, indent=2)

class GDELTSearchTool(BaseTool):
    """Historical & global coverage via the GDELT DOC 2.0 API."""
    name: str = "gdelt_search"
    description: str = "Query the GDELT 2.0 Doc API for worldwide news archives."
    args_schema: Type[BaseModel] = NewsSearchInput

    def _run(self, query: str, from_date: str | None = None,
             to_date: str | None = None, **_) -> str:
        # format YYMMDDhhmmss; default span = last 24 h
        def gd_fmt(date_str: str) -> str:
            return date_str.replace("-", "") + "000000"

        url = "https://api.gdeltproject.org/api/v2/doc/doc"
        params = {
            "query": query,
            "mode": "ArtList",
            "maxrecords": 50,
            "format": "json",
        }
        if from_date:
            # GDELT filter syntax: e.g., "EXISTS:1 AND Date>=20250701000000"
            params["filter"] = f"EXISTS:1 AND Date>={gd_fmt(from_date)}"
        if to_date:
            params["filter"] = params.get("filter", "") + \
                f" AND Date<={gd_fmt(to_date)}"  # append
        r = requests.get(url, params=params, timeout=20)
        r.raise_for_status()
        items = r.json().get("articles", [])
        slim = [
            {"title": a["title"], "url": a["url"],
             "snippet": (a.get("source") or "") + " • " + a.get("seendate", "")}
            for a in items
        ]
        return json.dumps(slim, indent=2)

# ───────────────────── router helper ───────────────────────────
def dedupe(sources: list[dict]) -> list[dict]:
    """Remove near-duplicate headlines (same leading fragment)."""
    seen, uniq = set(), []
    for it in sources:
        key = it["title"].split(" - ")[0].lower()
        if key not in seen:
            seen.add(key); uniq.append(it)
    return uniq

# ───────────────────────── agents ─────────────────────────────
router = Agent(
    role="News Router",
    backstory=dedent("""\
        You decide which search tool(s) fit the request and collect sources.
        • If the prompt contains 'news', 'headline', 'today', 'latest',
          or a recent date, use **news_api_search**.
        • If it asks about coverage over time ('since 2022', 'evolution',
          'trend'), add **gdelt_search**.
        • Add **exa_search** for tutorials, blog context, or developer angles.
        You must call the tools and return the raw results for processing."""),
    goal="Pick tools, fetch results, return raw source data.",
    tools=[NewsAPISearchTool(), GDELTSearchTool(), ExaSearchTool()],
    llm=ChatOpenAI(model_name=OPENAI_MODEL, temperature=0.3, api_key=OPENAI_API_KEY),
    allow_delegation=False,
    verbose=True,
    max_iter=4,
)

# ───────────────────────── tasks ──────────────────────────────
router_task = Task(
    description=dedent("""
        **Step 1 – Collect sources**

        Topic: {{topic}}

        • Use appropriate search tools to find relevant news articles
        • Focus on recent, credible sources
        • Collect the raw search results with titles, URLs, and snippets
    """),
    expected_output="Raw search results from news tools.",
    agent=router,
)


# ───────────────────────── crew ───────────────────────────────
crew = Crew(
    agents=[router],
    tasks=[router_task],
    process=Process.sequential,
    verbose=True,
)

# ──────────────────────── entry point ─────────────────────────
def run(topic: str):
    inputs = {"topic": topic,
              "current_date": datetime.now().strftime("%Y-%m-%d")}
    final = crew.kickoff(inputs=inputs)

    # Get highlight-source pairs from highlighter output
    results = []
    try:
        if hasattr(router_task.output, 'raw'):
            output_str = router_task.output.raw
        else:
            output_str = str(router_task.output)

        # Try to parse as JSON
        try:
            results = json.loads(output_str)
            if not isinstance(results, list):
                results = []
        except json.JSONDecodeError:
            # If not valid JSON, try to extract from text
            print(f"Could not parse JSON, raw output: {output_str}")
            results = []
    except Exception as e:
        print(f"Error parsing output: {e}")
        results = []

    return output_str