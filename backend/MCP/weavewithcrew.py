import os
import json
import subprocess
from datetime import datetime
from textwrap import dedent
from typing import Type

from dotenv import load_dotenv
from pydantic import BaseModel, Field
from crewai import Agent, Crew, Process, Task
from crewai.tools import BaseTool
from langchain_openai import ChatOpenAI
import weave

# ---------------------- Load ENV & Init ----------------------
load_dotenv()
weave.init("crewai-ai-news-agent")

# ---------------------- EXA Tool (New CrewAI Style) ----------------------
class ExaToolInput(BaseModel):
    """Input schema for ExaSearchTool."""
    query: str = Field(..., description="Search query for AI-related news")

class ExaSearchTool(BaseTool):
    name: str = "exa_search"
    description: str = "Search recent AI news using the Exa API"
    args_schema: Type[BaseModel] = ExaToolInput

    def _run(self, query: str) -> str:
        print("boot")
        try:
            curl_data = {
                "query": query,
                "numResults": 5,
                "category": "news",
                "contents": {"text": True}
            }

            curl_cmd = [
                "curl", "-X", "POST", "https://api.exa.ai/search",
                "--header", "content-type: application/json",
                "--header", f"x-api-key: {os.getenv('EXA_API_KEY')}",
                "--data", json.dumps(curl_data)
            ]
            print(curl_cmd)
            result = subprocess.run(curl_cmd, capture_output=True, text=True, check=True)
            print(result)
            response_data = json.loads(result.stdout)

            lines = []
            for i, hit in enumerate(response_data.get("results", []), 1):
                title = hit.get("title", "Untitled")
                url = hit.get("url", "")
                date = hit.get("publishedDate", "")
                lines.append(f"{i}. {title} ({date}) - {url}")

            return "\n".join(lines)

        except subprocess.CalledProcessError as e:
            return f"Search failed: {e.stderr}"
        except json.JSONDecodeError as e:
            return f"Failed to parse response: {e}"
        except Exception as e:
            return f"Search failed: {e}"

# Instantiate tool
search_tool = ExaSearchTool()

# ---------------------- Custom OpenAI LLM Configuration ----------------------
llm = ChatOpenAI(
    model_name="gpt-4o-mini",
    openai_api_base="https://api.inference.wandb.ai/v1",
    openai_api_key="<9eb29bead4f6f971b770f83829a87a95ef3ef3e5>",
    extra_headers={"OpenAI-Project": "crewai/pop_smoke"},
)

# ---------------------- Agents ----------------------
researcher = Agent(
    role="AI News Researcher",
    backstory="An AI-focused journalist specializing in breaking news and emerging trends.",
    goal="Find the most recent AI news from the last 24 hours. Note --> IF NEWS IS NOT WITHIN THE LAST FEW DAYS, DO NOT INCLUDE IT!!!!!!!",
    tools=[search_tool],
    allow_delegation=False,
    verbose=True,
    max_iter=3,
    llm=llm
)

story_researcher = Agent(
    role="AI Story Investigator",
    backstory="A deep-research AI journalist who expands on initial news findings, gathering additional context, sources, and insights for each AI story.",
    goal="For each news story found, conduct a deeper investigation to retrieve additional information, sources, and full context. Write **at least 300 words** for each story, including details, expert opinions, and possible implications. Ensure you provide the full URL of the main source.",
    tools=[search_tool],
    allow_delegation=False,
    verbose=True,
    max_iter=5,
    llm=llm
)

# ---------------------- Tasks ----------------------
research_task = Task(
    description=dedent("""
        Search for the most recent AI news published in the last 24 hours.
        Extract the **5 most important developments**, including company names, new AI models, breakthroughs, and market trends.

        **Query Parameters:**
        - Search for AI-related news.
        - Filter results to only include content from the last 24 hours.

        **Example Output Format:**
        1. OpenAI announces GPT-5 development with a new multimodal framework. (Source: TechCrunch - https://techcrunch.com/example)
        2. Google DeepMind unveils Gemini 1.5 with extended context length. (Source: The Verge - https://theverge.com/example)
        3. NVIDIA releases new AI GPUs optimized for deep learning. (Source: Reuters - https://reuters.com/example)
    """),
    expected_output="A list of the 5 most important AI news updates from the last 24 hours, each with a direct source URL.",
    agent=researcher,
    output_file="latest_ai_news.md"
)

story_research_task = Task(
    description=dedent("""
        For each AI news story identified, perform **detailed research** to provide a comprehensive 300-word analysis.

        **Steps:**
        1. Search for additional details, expert opinions, technical specifications, and market reactions for each news story.
        2. Write a **detailed 300-word breakdown** of each AI news update.
        3. Verify and include **full URLs** for all primary sources.
    """),
    expected_output="A detailed 300-word analysis for each AI news story, with full source citations.",
    agent=story_researcher,
    context=[research_task],
    output_file="expanded_ai_news.md"
)

# ---------------------- Crew Definition ----------------------
crew = Crew(
    agents=[researcher, story_researcher],
    tasks=[research_task, story_research_task],
    verbose=True,
    process=Process.sequential
)

# ---------------------- Entry Point ----------------------
def run():
    inputs = {
        "topic": "Latest AI News",
        "current_year": str(datetime.now().year),
        "current_month": str(datetime.now().month),
        "current_day": str(datetime.now().day)
    }

    result = crew.kickoff(inputs=inputs)

    print("\n\n### Final AI News Report ###\n")
    print(result)

    print("\n\n### Task Outputs ###\n")
    for task in crew.tasks:
        if task.output_file:
            with open(task.output_file, "r") as f:
                print(f"Task: {task.description}\nOutput:\n{f.read()}\n{'-'*40}")

if __name__ == "__main__":
    run()
