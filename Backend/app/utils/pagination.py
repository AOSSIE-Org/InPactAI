from typing import Dict, Any


DEFAULT_SKIP = 0
DEFAULT_LIMIT = 50
MAX_LIMIT = 100


def get_pagination_params(skip: int = DEFAULT_SKIP, limit: int = DEFAULT_LIMIT) -> tuple:
    """Validate and return pagination parameters."""
    if skip < 0:
        skip = DEFAULT_SKIP
    if limit < 1:
        limit = DEFAULT_LIMIT
    if limit > MAX_LIMIT:
        limit = MAX_LIMIT
    return skip, limit


def paginate_query(query_result, skip: int, limit: int, total_count: int = 0) -> Dict[str, Any]:
    """Format paginated response with metadata."""
    data = query_result.data if hasattr(query_result, 'data') else query_result
    
    if not isinstance(data, list):
        data = []
    
    return {
        "data": data,
        "skip": skip,
        "limit": limit,
        "count": len(data),
        "total_count": total_count
    }
