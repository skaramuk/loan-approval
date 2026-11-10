"""Consistent JSON errors with Turkish user-facing messages.

Every error response has the shape:
    {"error": {"code": "...", "message": "...", "details": [{"field": "...", "message": "..."}]}}
"""

from __future__ import annotations

import logging
from typing import Any

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

logger = logging.getLogger("app.errors")

HTTP_MESSAGES = {
    400: ("bad_request", "İstek işlenemedi."),
    401: ("unauthorized", "Bu işlem için giriş yapmanız gerekiyor."),
    403: ("forbidden", "Bu işlem için yetkiniz yok."),
    404: ("not_found", "Aradığınız kayıt bulunamadı."),
    405: ("method_not_allowed", "Bu işlem desteklenmiyor."),
    429: ("rate_limited", "Çok fazla istek gönderdiniz. Lütfen biraz sonra tekrar deneyin."),
    503: (
        "service_unavailable",
        "Servis şu anda kullanılamıyor. Lütfen daha sonra tekrar deneyin.",
    ),
}
INTERNAL_ERROR = (
    "internal_error",
    "Beklenmeyen bir hata oluştu. Lütfen daha sonra tekrar deneyin.",
)
VALIDATION_MESSAGE = "Girdiğiniz bilgilerde hata var. Lütfen işaretli alanları kontrol edin."


class AppError(Exception):
    """An error with a ready-made Turkish message, raised by application code."""

    def __init__(self, status_code: int, code: str, message: str) -> None:
        super().__init__(message)
        self.status_code = status_code
        self.code = code
        self.message = message


def error_body(code: str, message: str, details: list[dict[str, str]] | None = None) -> dict:
    return {"error": {"code": code, "message": message, "details": details or []}}


def _number(value: Any) -> str:
    """Format a bound the Turkish way: 5.4 -> 5,4 and 35000 -> 35.000."""
    if isinstance(value, float) and not value.is_integer():
        return f"{value:,.2f}".rstrip("0").translate(str.maketrans(",.", ".,"))
    return f"{int(value):,}".replace(",", ".")


def _field_message(error: dict[str, Any]) -> str:
    kind, ctx = error["type"], error.get("ctx") or {}
    if kind == "missing":
        return "Bu alan zorunludur."
    if kind == "extra_forbidden":
        return "Bu alan kabul edilmiyor."
    if kind in {"greater_than_equal", "greater_than"}:
        return f"En az {_number(ctx.get('ge', ctx.get('gt')))} olmalıdır."
    if kind in {"less_than_equal", "less_than"}:
        return f"En fazla {_number(ctx.get('le', ctx.get('lt')))} olmalıdır."
    if kind == "literal_error":
        return "Geçerli seçeneklerden biri seçilmelidir."
    if kind.startswith("int"):
        return "Tam sayı girilmelidir."
    if kind.startswith(("float", "decimal")):
        return "Sayı girilmelidir."
    if kind.startswith("bool"):
        return "Evet ya da hayır seçilmelidir."
    if kind == "value_error" and isinstance(ctx.get("error"), ValueError):
        return str(ctx["error"])
    if kind.startswith("json"):
        return "İstek gövdesi geçerli bir JSON değil."
    return "Geçersiz değer."


def _field_name(loc: tuple) -> str:
    parts = [str(p) for p in loc if p not in {"body", "query", "path"}]
    return ".".join(parts)


async def handle_validation_error(_: Request, exc: RequestValidationError) -> JSONResponse:
    details = [
        {"field": _field_name(tuple(err["loc"])), "message": _field_message(err)}
        for err in exc.errors()
    ]
    return JSONResponse(
        status_code=422, content=error_body("validation_error", VALIDATION_MESSAGE, details)
    )


async def handle_http_error(_: Request, exc: StarletteHTTPException) -> JSONResponse:
    code, message = HTTP_MESSAGES.get(exc.status_code, INTERNAL_ERROR)
    return JSONResponse(
        status_code=exc.status_code, content=error_body(code, message), headers=exc.headers
    )


async def handle_app_error(_: Request, exc: AppError) -> JSONResponse:
    return JSONResponse(status_code=exc.status_code, content=error_body(exc.code, exc.message))


async def handle_unexpected_error(request: Request, exc: Exception) -> JSONResponse:
    # Log the exception type and route only: request bodies hold personal financial data.
    logger.error("Unhandled %s on %s %s", type(exc).__name__, request.method, request.url.path)
    return JSONResponse(status_code=500, content=error_body(*INTERNAL_ERROR))


def register_error_handlers(app: FastAPI) -> None:
    app.add_exception_handler(RequestValidationError, handle_validation_error)
    app.add_exception_handler(StarletteHTTPException, handle_http_error)
    app.add_exception_handler(AppError, handle_app_error)
    app.add_exception_handler(Exception, handle_unexpected_error)
