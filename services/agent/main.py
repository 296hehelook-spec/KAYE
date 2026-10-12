import os
import time
import hashlib
import logging
from typing import List, Set
from fastapi import FastAPI, Header, HTTPException, status
from fastapi.responses import JSONResponse
from dotenv import load_dotenv

from schemas import FindRequest, FindResponse, ParsedAlumniItem, ErrorResponse
from normalizer import normalize_input
from query_builder import build_search_queries
from searcher import GoogleSearcher
from parser import SnippetParser

load_dotenv()

# Structured JSON Logger
logging.basicConfig(
    level=logging.INFO,
    format='{"time": "%(asctime)s", "level": "%(levelname)s", "message": "%(message)s"}'
)
logger = logging.getLogger("kaye_agent")

app = FastAPI(
    title="Kaye AlumniFinder Agent Service",
    version="1.0.0",
    description="Consent-first, compliant public web search and parsing agent for college alumni."
)

AGENT_SECRET = os.getenv("AGENT_SECRET", "kaye_agent_secret_key_demo")
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
GOOGLE_CSE_ID = os.getenv("GOOGLE_CSE_ID")
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")

searcher = GoogleSearcher(api_key=GOOGLE_API_KEY, cse_id=GOOGLE_CSE_ID)
parser = SnippetParser(anthropic_api_key=ANTHROPIC_API_KEY)

# Mock in-memory opt-outs set for agent isolation
OPT_OUTS_SET: Set[str] = {
    "https://www.linkedin.com/in/opted-out-profile-sample",
}

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "kaye-agent",
        "timestamp": int(time.time()),
        "mock_mode": not bool(GOOGLE_API_KEY and ANTHROPIC_API_KEY)
    }

@app.post(
    "/find",
    response_model=FindResponse,
    responses={
        401: {"model": ErrorResponse},
        429: {"model": ErrorResponse},
        500: {"model": ErrorResponse},
    }
)
async def find_alumni(
    req: FindRequest,
    x_agent_key: str = Header(..., alias="X-Agent-Key")
):
    start_time = time.time()

    # 1. Shared secret authentication
    if x_agent_key != AGENT_SECRET:
        logger.warning("Unauthorized access attempt with invalid X-Agent-Key")
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content={"error": {"code": "UNAUTHORIZED", "message": "Invalid or missing X-Agent-Key header"}}
        )

    # 2. Input normalization
    norm_college, norm_branch = normalize_input(req.college, req.branch)

    # 3. Query building
    queries = build_search_queries(
        college=norm_college,
        passout_year=req.passout_year,
        branch=norm_branch,
        company=req.company,
        city=req.city,
        role=req.role
    )

    logger.info(f"Generated {len(queries)} search queries for college='{norm_college}', year={req.passout_year}")

    all_snippets = []
    seen_urls: Set[str] = set()
    google_call_budget = 0
    MAX_GOOGLE_CALLS = 15

    # 4. Search execution with budget limit
    for q in queries:
        if google_call_budget >= MAX_GOOGLE_CALLS or len(seen_urls) >= req.count * 2:
            break
        try:
            google_call_budget += 1
            results = await searcher.execute_query(q)
            for r in results:
                url = r["url"].strip().lower().rstrip("/")
                # Never include opted-out URLs!
                if url in OPT_OUTS_SET or r["url"] in OPT_OUTS_SET:
                    continue
                if url not in seen_urls and "linkedin.com/in/" in url:
                    seen_urls.add(url)
                    all_snippets.append(r)
        except Exception as e:
            logger.error(f"Search query error: {e}")

    # 5. Parsing with LLM in batches of 10
    parsed_alumni: List[ParsedAlumniItem] = []
    batch_size = 10
    claude_call_budget = 0
    MAX_CLAUDE_CALLS = 6

    for i in range(0, len(all_snippets), batch_size):
        if claude_call_budget >= MAX_CLAUDE_CALLS or len(parsed_alumni) >= req.count:
            break
        batch = all_snippets[i:i + batch_size]
        try:
            claude_call_budget += 1
            items = parser.parse_batch(
                snippets=batch,
                target_college=norm_college,
                target_year=req.passout_year,
                target_branch=norm_branch
            )
            for it in items:
                # Require college match and verify not in opt-out list
                if it.college_match and it.linkedin_url.lower().rstrip("/") not in OPT_OUTS_SET:
                    parsed_alumni.append(it)
        except Exception as e:
            logger.error(f"Batch parse error: {e}")

    duration_ms = int((time.time() - start_time) * 1000)

    # 6. Response
    return FindResponse(
        count=len(parsed_alumni[:req.count]),
        from_cache=False,
        execution_time_ms=duration_ms,
        alumni=parsed_alumni[:req.count]
    )
