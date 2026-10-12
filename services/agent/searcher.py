import logging
from typing import List, Dict, Any, Optional
import httpx
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type

logger = logging.getLogger("kaye_agent.searcher")

class GoogleSearcher:
    def __init__(self, api_key: Optional[str] = None, cse_id: Optional[str] = None):
        self.api_key = api_key
        self.cse_id = cse_id
        self.endpoint = "https://customsearch.googleapis.com/customsearch/v1"

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=1, max=5),
        retry=retry_if_exception_type(httpx.HTTPError),
        reraise=True,
    )
    async def execute_query(self, query: str, start_index: int = 1) -> List[Dict[str, str]]:
        """Call Google Programmable Search JSON API with budget caps and retries."""
        if not self.api_key or not self.cse_id:
            logger.info("Google API Key or CSE ID missing; returning mock results.")
            return []

        async with httpx.AsyncClient(timeout=20.0) as client:
            params = {
                "key": self.api_key,
                "cx": self.cse_id,
                "q": query,
                "start": start_index,
                "num": 10,
            }
            resp = await client.get(self.endpoint, params=params)
            resp.raise_for_status()
            data = resp.json()

            items = data.get("items", [])
            extracted = []
            for item in items:
                link = item.get("link", "")
                if "linkedin.com/in/" in link:
                    extracted.append({
                        "title": item.get("title", ""),
                        "snippet": item.get("snippet", ""),
                        "url": link,
                    })
            return extracted
