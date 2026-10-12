import pytest
from normalizer import normalize_input
from query_builder import build_search_queries
from parser import SnippetParser, clean_json_output
from schemas import ParsedAlumniItem

def test_normalization():
    col, branch = normalize_input("IITJ", "CSE")
    assert col == "IIT Jodhpur"
    assert branch == "Computer Science"

    col2, branch2 = normalize_input("bits pilani", "ece")
    assert col2 == "Birla Institute of Technology and Science Pilani"
    assert branch2 == "Electronics and Communication"

def test_query_builder():
    queries = build_search_queries(
        college="IIT Jodhpur",
        passout_year=2020,
        branch="Computer Science",
        company="Google"
    )
    assert len(queries) >= 4
    assert any('site:linkedin.com/in "IIT Jodhpur" "Computer Science" "2020"' in q for q in queries)
    assert any('Google' in q for q in queries)

def test_clean_json_output():
    raw = '```json\n[{"name": "Test User"}]\n```'
    cleaned = clean_json_output(raw)
    assert cleaned == '[{"name": "Test User"}]'

def test_heuristic_parser():
    parser = SnippetParser(anthropic_api_key=None)
    mock_snippets = [
        {
            "title": "Aarav Sharma - Software Engineer - Google | LinkedIn",
            "snippet": "IIT Jodhpur B.Tech CSE Class of 2020. Working on cloud infrastructure.",
            "url": "https://www.linkedin.com/in/aarav-sharma-iitj"
        }
    ]
    parsed = parser.parse_batch(mock_snippets, "IIT Jodhpur", 2020, "Computer Science")
    assert len(parsed) == 1
    assert parsed[0].name == "Aarav Sharma"
    assert parsed[0].college_match is True
    assert parsed[0].year_match is True
    assert parsed[0].confidence == "high"
