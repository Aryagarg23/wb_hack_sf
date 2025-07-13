from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, HttpUrl
from enum import Enum
from typing import List, Optional
from exa_py import Exa

# Initialize FastAPI app
app = FastAPI(
    title="Exa API Proxy",
    description=(
        "FastAPI wrapper for Exa endpoints: /search, /contents, /findsimilar, /answer, /research.\n\n"
        "Use this API to perform semantic web search, extract HTML content, find similar pages, "
        "answer questions, and perform structured research using Exa."
    ),
    version="1.0.0"
)

# Initialize Exa client
exa = Exa(api_key="bdaeaccb-4fd8-4416-b137-16d5f3f3f2fb")

# ---- ENUMS ----
class CategoryEnum(str, Enum):
    company = "company"
    research_paper = "research paper"
    news = "news"
    pdf = "pdf"
    github = "github"
    tweet = "tweet"
    personal_site = "personal site"
    linkedin_profile = "linkedin profile"
    financial_report = "financial report"

# ---- REQUEST MODELS ----
class SearchRequest(BaseModel):
    query: str
    num_results: Optional[int] = 5
    category: Optional[CategoryEnum] = None

class ContentsRequest(BaseModel):
    urls: List[HttpUrl]

class FindSimilarRequest(BaseModel):
    url: HttpUrl
    includeText: List[str]

class AnswerRequest(BaseModel):
    question: str

class ResearchRequest(BaseModel):
    query: str

# ---- ENDPOINTS ----

@app.post("/search", summary="Semantic or keyword-based search")
def search_exa(req: SearchRequest):
    try:
        results = exa.search(
            req.query,
            num_results=req.num_results,
            category=req.category.value if req.category else None
        )
        return {"results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/contents", summary="Get clean HTML contents from Exa URLs")
def contents_exa(req: ContentsRequest):
    try:
        results = exa.get_contents(req.urls)
        return {"contents": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/findsimilar", summary="Find semantically similar pages to a given URL")
def find_similar_exa(req: FindSimilarRequest):
    try:
        results = exa.find_similar(str(req.url))
        return {"similar": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/answer", summary="Get a direct answer to a question using Exa")
def answer_exa(req: AnswerRequest):
    try:
        result = exa.answer_question(req.question)
        return {"answer": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/research", summary="Automate structured research with citations")
def research_exa(req: ResearchRequest):
    try:
        result = exa.research(req.query)
        return {"research": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

