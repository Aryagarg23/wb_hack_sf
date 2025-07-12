from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, HttpUrl
from exa_py import Exa
from typing import List, Optional

app = FastAPI(
    title="Exa API Proxy",
    description="FastAPI wrapper for Exa endpoints: /search, /contents, /findsimilar, /answer, /research",
    version="1.0.0"
)

# Initialize Exa client
exa = Exa(api_key="bdaeaccb-4fd8-4416-b137-16d5f3f3f2fb")

# --- Request models ---
class SearchRequest(BaseModel):
    query: str
    num_results: Optional[int] = 5
    use_keyword_search: Optional[bool] = False
    category: Optional[str] = None

class ContentsRequest(BaseModel):
    urls: List[HttpUrl]

class FindSimilarRequest(BaseModel):
    url: HttpUrl

class AnswerRequest(BaseModel):
    question: str

class ResearchRequest(BaseModel):
    query: str

# --- Routes ---

@app.post("/search")
def search_exa(req: SearchRequest):
    try:
        results = exa.search(
            req.query,
            num_results=req.num_results,
            use_keyword_search=req.use_keyword_search,
            category=req.category
        )
        return {"results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/contents")
def contents_exa(req: ContentsRequest):
    try:
        results = exa.get_contents(req.urls)
        return {"contents": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/findsimilar")
def find_similar_exa(req: FindSimilarRequest):
    try:
        results = exa.find_similar(str(req.url))
        return {"similar": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/answer")
def answer_exa(req: AnswerRequest):
    try:
        result = exa.answer_question(req.question)
        return {"answer": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/research")
def research_exa(req: ResearchRequest):
    try:
        result = exa.research(req.query)
        return {"research": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

