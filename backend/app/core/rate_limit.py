"""Per-user rate limiting for the prediction endpoint.

Counters are kept in process memory, which is correct for a single container. Running several
instances would need a shared store (e.g. Redis) passed as `storage_uri`.
"""

from __future__ import annotations

from fastapi import Request
from fastapi.responses import JSONResponse
from slowapi import Limiter
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

from app.core.config import get_settings
from app.core.errors import HTTP_MESSAGES, error_body


def user_key(request: Request) -> str:
    """Rate-limit by authenticated user; fall back to the client address."""
    user_id = getattr(request.state, "user_id", None)
    return f"user:{user_id}" if user_id else f"ip:{get_remote_address(request)}"


limiter = Limiter(key_func=user_key)


def prediction_limit() -> str:
    return get_settings().prediction_rate_limit


async def handle_rate_limit(_: Request, exc: RateLimitExceeded) -> JSONResponse:
    code, message = HTTP_MESSAGES[429]
    return JSONResponse(status_code=429, content=error_body(code, message))
