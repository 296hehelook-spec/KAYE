import re
from typing import Dict, Tuple

BRANCH_SYNONYMS: Dict[str, str] = {
    "cse": "Computer Science",
    "cs": "Computer Science",
    "it": "Information Technology",
    "ece": "Electronics and Communication",
    "eee": "Electrical and Electronics",
    "ee": "Electrical Engineering",
    "mech": "Mechanical Engineering",
    "me": "Mechanical Engineering",
    "civil": "Civil Engineering",
    "ce": "Civil Engineering",
    "chem": "Chemical Engineering",
    "biotech": "Biotechnology",
    "aero": "Aerospace Engineering",
    "ds": "Data Science",
    "ai": "Artificial Intelligence",
    "mba": "MBA",
    "bba": "BBA",
}

COLLEGE_SYNONYMS: Dict[str, str] = {
    "iitj": "IIT Jodhpur",
    "iit jodhpur": "Indian Institute of Technology Jodhpur",
    "iitb": "IIT Bombay",
    "iit bombay": "Indian Institute of Technology Bombay",
    "iitd": "IIT Delhi",
    "iit delhi": "Indian Institute of Technology Delhi",
    "iitm": "IIT Madras",
    "iit madras": "Indian Institute of Technology Madras",
    "iitk": "IIT Kanpur",
    "iit kanpur": "Indian Institute of Technology Kanpur",
    "bits pilani": "Birla Institute of Technology and Science Pilani",
    "bits": "BITS Pilani",
    "nit trichy": "National Institute of Technology Tiruchirappalli",
    "nitt": "NIT Trichy",
    "dtu": "Delhi Technological University",
    "nsut": "Netaji Subhas University of Technology",
}

def normalize_input(college: str, branch: str) -> Tuple[str, str]:
    """Clean, trim, and expand common acronyms and college shorthand."""
    cleaned_college = college.strip()
    c_lower = cleaned_college.lower()
    expanded_college = COLLEGE_SYNONYMS.get(c_lower, cleaned_college)

    cleaned_branch = branch.strip()
    b_lower = cleaned_branch.lower()
    expanded_branch = BRANCH_SYNONYMS.get(b_lower, cleaned_branch)

    return expanded_college, expanded_branch
