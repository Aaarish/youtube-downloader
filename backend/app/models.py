from pydantic import BaseModel
from typing import List

class Resolution(BaseModel):
    label: str
    paid: bool
    price: int | None = None

class ResolutionResponse(BaseModel):
    title: str
    resolutions: List[Resolution]
