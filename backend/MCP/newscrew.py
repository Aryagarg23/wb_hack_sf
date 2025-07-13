# learning_assistant.py  – NEWS-centric version
# ---------------------------------------------------------------
# Requires:  OPENAI_API_KEY, NEWS_API_KEY, EXA_API_KEY (.env)
# Optional:  S2_API_KEY if you keep the research tools
# ---------------------------------------------------------------
import os, json, requests, subprocess
from datetime import datetime, timedelta
from textwrap import dedent
from typing import Type

from dotenv import load_dotenv
from pydantic import BaseModel, Field
from crewai import Agent, Crew, Process, Task
from crewai.tools import BaseTool
from langchain_openai import ChatOpenAI

# ──────────────────────── load env vars ───────────────────────
load_dotenv()
OPENAI_MODEL = "gpt-4o-mini"

# ────────────────────────── schemas ───────────────────────────
class SearchInput(BaseModel):
    query: str = Field(..., description="Search text")

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
        body = {"query": query, "numResults": 5, "contents": {"text": True}, category: "news"}
        cmd = [
            "curl", "-s", "-X", "POST", "https://api.exa.ai/search",
            "--header", "content-type: application/json",
            "--header", f"x-api-key: {os.getenv('EXA_API_KEY')}",
            "--data", json.dumps(body),
        ]
        try:
            resp = subprocess.run(cmd, capture_output=True,
                                  text=True, check=True, timeout=20)
            return resp.stdout           # already JSON
        except Exception as e:
            return f'[Exa search failed] {e}'

class NewsAPISearchTool(BaseTool):
    """Live/archived news via NewsAPI.org “everything” endpoint."""
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
        You decide which search tool(s) fit the request.
        • If the prompt contains 'news', 'headline', 'today', 'latest',
          or a recent date, use **news_api_search**.
        • If it asks about coverage over time ('since 2022', 'evolution',
          'trend'), add **gdelt_search**.
        • Add **exa_search** for tutorials, blog context, or developer angles.
        You may call multiple tools and must return a single JSON array
        named `sources` (5-10 de-duplicated items)."""),
    goal="Pick tools, fetch results, emit a `sources` JSON list.",
    tools=[NewsAPISearchTool(), GDELTSearchTool(), ExaSearchTool()],
    llm=ChatOpenAI(model_name=OPENAI_MODEL, temperature=0.3),
    allow_delegation=False,
    verbose=True,
    max_iter=4,
)

summariser = Agent(
    role="News Explainer",
    backstory="Turns raw links into short, beginner-friendly news digests.",
    goal="Produce clear, date-stamped news notes.",
    tools=[],
    llm=ChatOpenAI(model_name=OPENAI_MODEL, temperature=0.55),
    allow_delegation=False,
    verbose=True,
    max_iter=4,
)

# ───────────────────────── tasks ──────────────────────────────
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

# ───────────────────────── crew ───────────────────────────────
crew = Crew(
    agents=[router, summariser],
    tasks=[router_task, summary_task],
    process=Process.sequential,
    verbose=True,
)

# ──────────────────────── entry point ─────────────────────────
def run(topic: str):
    inputs = {"topic": topic,
              "current_date": datetime.now().strftime("%Y-%m-%d")}
    final = crew.kickoff(inputs=inputs)

    # Get sources from router output
    sources = []
    if router_task.output_file:
        try:
            with open(router_task.output_file, 'r') as f:
                sources = json.loads(f.read())
        except Exception as e:
            print(f"Error reading sources: {e}")
            sources = []

    # Create JSON response with links
    result = {
        "topic": topic,
        "digest": str(summary_task.output) if summary_task.output else "",
        "links": sources,
        "timestamp": datetime.now().isoformat()
    }

    print("\n\n### NEWS DIGEST ###\n")
    print(summary_task.output)
    print(f"\n### LINKS (JSON) ###\n")
    print(json.dumps(result, indent=2))

    return result

# Quick smoke-test
if __name__ == "__main__":
   print(run("Latest developments in AI chip export controls"))
