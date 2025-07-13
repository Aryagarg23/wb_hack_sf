from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional
import uvicorn
import os
import json

# Import tool classes from newscrew and researchcrew
from backend.MCP.newscrew import NewsAPISearchTool, GDELTSearchTool, ExaSearchTool as NewsExaSearchTool, NewsSearchInput, SearchInput as NewsSearchInputSimple
from backend.MCP.researchcrew import ExaSearchTool as ResearchExaSearchTool, ArxivSearchTool, SemanticScholarSearchTool, SearchInput as ResearchSearchInput

app = FastAPI(title="MCP Tool Server", description="Expose News and Research tools via FastAPI.")

# --- News Tools Input Schemas ---
class NewsAPISearchRequest(NewsSearchInput):
    pass

class GDELTSearchRequest(NewsSearchInput):
    pass

class NewsExaSearchRequest(NewsSearchInputSimple):
    pass

# --- Research Tools Input Schemas ---
class ResearchExaSearchRequest(ResearchSearchInput):
    pass

class ArxivSearchRequest(ResearchSearchInput):
    pass

class S2SearchRequest(ResearchSearchInput):
    pass

# --- Root and Tool List ---
@app.get("/")
def root():
    return {"message": "Welcome to the MCP FastAPI server! See /tools for available endpoints."}

@app.get("/tools")
def list_tools():
    return {
        "news": ["/news/news_api_search", "/news/gdelt_search", "/news/exa_search"],
        "research": ["/research/exa_search", "/research/arxiv_search", "/research/s2_search"]
    }

# --- News Endpoints ---
@app.post("/news/news_api_search")
def news_api_search(req: NewsAPISearchRequest):
    tool = NewsAPISearchTool()
    try:
        result = tool._run(
            query=req.query,
            from_date=req.from_date,
            to_date=req.to_date,
            language=req.language or "en"
        )
        return json.loads(result) if isinstance(result, str) else result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/news/gdelt_search")
def gdelt_search(req: GDELTSearchRequest):
    tool = GDELTSearchTool()
    try:
        result = tool._run(
            query=req.query,
            from_date=req.from_date,
            to_date=req.to_date
        )
        return json.loads(result) if isinstance(result, str) else result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/news/exa_search")
def news_exa_search(req: NewsExaSearchRequest):
    tool = NewsExaSearchTool()
    try:
        result = tool._run(query=req.query)
        return json.loads(result) if isinstance(result, str) else result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- Research Endpoints ---
@app.post("/research/exa_search")
def research_exa_search(req: ResearchExaSearchRequest):
    tool = ResearchExaSearchTool()
    try:
        result = tool._run(query=req.query, category=req.category)
        return json.loads(result) if isinstance(result, str) else result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/research/arxiv_search")
def arxiv_search(req: ArxivSearchRequest):
    tool = ArxivSearchTool()
    try:
        result = tool._run(query=req.query, category=req.category)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/research/s2_search")
def s2_search(req: S2SearchRequest):
    tool = SemanticScholarSearchTool()
    try:
        result = tool._run(query=req.query, category=req.category)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- Run with: uvicorn backend.MCP.mcp_server:app --reload ---
if __name__ == "__main__":
    uvicorn.run("backend.MCP.mcp_server:app", host="0.0.0.0", port=8000, reload=True)