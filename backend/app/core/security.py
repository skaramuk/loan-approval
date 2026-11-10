"""Verifying Supabase Auth access tokens.

Supabase signs access tokens with an asymmetric key; the public keys are published as a JWKS
at <supabase-url>/auth/v1/.well-known/jwks.json. The backend never sees a signing secret.
"""

from __future__ import annotations

import logging
from functools import lru_cache
from typing import Any, Protocol
from uuid import UUID

import jwt
from jwt import PyJWKClient

from app.core.config import get_settings
from app.core.errors import AppError

logger = logging.getLogger("app.security")

ALGORITHMS = ["ES256", "RS256"]
UNAUTHORIZED_MESSAGE = "Oturumunuz geçersiz ya da süresi dolmuş. Lütfen yeniden giriş yapın."


class SigningKeyProvider(Protocol):
    def get_key(self, token: str) -> Any: ...


class JwksKeyProvider:
    """Fetches and caches the project's public signing keys."""

    def __init__(self, jwks_url: str) -> None:
        self._client = PyJWKClient(jwks_url, cache_keys=True, lifespan=600, timeout=5)

    def get_key(self, token: str) -> Any:
        return self._client.get_signing_key_from_jwt(token).key


class TokenVerifier:
    def __init__(self, keys: SigningKeyProvider, issuer: str, audience: str) -> None:
        self._keys = keys
        self._issuer = issuer
        self._audience = audience

    def verify(self, token: str) -> UUID:
        """Return the user id (`sub`) of a valid access token, or raise a 401 AppError."""
        try:
            claims = jwt.decode(
                token,
                self._keys.get_key(token),
                algorithms=ALGORITHMS,
                audience=self._audience,
                issuer=self._issuer,
                options={"require": ["exp", "sub", "aud", "iss"]},
            )
            return UUID(claims["sub"])
        except jwt.PyJWKClientConnectionError as exc:
            logger.error("Could not fetch signing keys: %s", type(exc).__name__)
            raise AppError(
                503,
                "auth_unavailable",
                "Kimlik doğrulama servisine ulaşılamıyor. Lütfen daha sonra tekrar deneyin.",
            ) from exc
        except (jwt.PyJWTError, ValueError, KeyError) as exc:
            # Do not log the token or its claims.
            logger.info("Rejected access token: %s", type(exc).__name__)
            raise AppError(401, "unauthorized", UNAUTHORIZED_MESSAGE) from exc


@lru_cache
def get_token_verifier() -> TokenVerifier:
    settings = get_settings()
    if not settings.jwks_url:
        raise AppError(
            503,
            "auth_not_configured",
            "Kimlik doğrulama yapılandırılmamış. Lütfen daha sonra tekrar deneyin.",
        )
    return TokenVerifier(
        JwksKeyProvider(settings.jwks_url), settings.jwt_issuer, settings.jwt_audience
    )
