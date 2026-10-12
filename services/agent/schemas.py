from typing import List, Optional, Literal
from pydantic import BaseModel, Field, HttpUrl

class FindRequest(BaseModel):
    college: str = Field(..., description="Target college name or short acronym")
    passout_year: int = Field(..., ge=1970, le=2035, description="Passout graduation year")
    branch: str = Field(..., description="Branch/Department of study")
    count: int = Field(default=10, ge=1, le=50, description="Number of alumni matches requested")
    company: Optional[str] = Field(default=None, description="Optional target current company")
    city: Optional[str] = Field(default=None, description="Optional target location")
    role: Optional[str] = Field(default=None, description="Optional target job title")

class ParsedAlumniItem(BaseModel):
    name: str = Field(..., description="Full professional name")
    headline: str = Field(..., description="LinkedIn headline snippet")
    current_role: Optional[str] = Field(default=None, description="Extracted current title or role")
    company: Optional[str] = Field(default=None, description="Extracted current company")
    location: Optional[str] = Field(default=None, description="Extracted city/state/country")
    linkedin_url: str = Field(..., description="Public profile URL")
    college_match: bool = Field(default=True, description="Snippet explicitly mentions college")
    year_match: bool = Field(default=False, description="Snippet explicitly mentions year")
    branch_match: bool = Field(default=False, description="Snippet explicitly mentions branch")
    confidence: Literal["high", "medium", "low"] = Field(default="high")

class FindResponse(BaseModel):
    count: int
    from_cache: bool
    execution_time_ms: int
    alumni: List[ParsedAlumniItem]

class ErrorDetail(BaseModel):
    code: str
    message: str

class ErrorResponse(BaseModel):
    error: ErrorDetail
