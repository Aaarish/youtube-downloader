import re
from typing import Optional

def resolution_to_int(res: Optional[str]) -> int:
    if not res:
        return 0

    match = re.search(r"(\d+)", res)
    return int(match.group(1)) if match else 0
