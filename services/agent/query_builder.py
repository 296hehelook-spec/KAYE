from typing import List, Optional

def build_search_queries(
    college: str,
    passout_year: int,
    branch: str,
    company: Optional[str] = None,
    city: Optional[str] = None,
    role: Optional[str] = None,
) -> List[str]:
    """
    Construct 4 to 6 focused Google Programmable Search queries targeting
    LinkedIn public profile pages without ever scraping or logging in.
    """
    queries = [
        f'site:linkedin.com/in "{college}" "{branch}" "{passout_year}"',
        f'site:linkedin.com/in "{college}" "{branch}" "{passout_year - 4} - {passout_year}"',
        f'site:linkedin.com/in "{college}" "B.Tech" "{branch}" {passout_year}',
    ]

    if company:
        queries.append(f'site:linkedin.com/in "{college}" "{passout_year}" "{company}"')

    if role:
        queries.append(f'site:linkedin.com/in "{college}" "{branch}" "{role}"')

    if city:
        queries.append(f'site:linkedin.com/in "{college}" "{passout_year}" "{city}"')

    return queries
