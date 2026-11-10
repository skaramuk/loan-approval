"""Shared FastAPI dependencies."""

from __future__ import annotations

from typing import Annotated
from uuid import UUID

from fastapi import Depends, Request
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.errors import AppError
from app.core.security import UNAUTHORIZED_MESSAGE, TokenVerifier, get_token_verifier
from app.db.session import get_session
from app.services.model_store import ModelBundle

bearer_scheme = HTTPBearer(auto_error=False, description="Supabase Auth access token")


def get_bundle(request: Request) -> ModelBundle:
    bundle = getattr(request.app.state, "bundle", None)
    if bundle is None:
        raise AppError(
            503,
            "model_unavailable",
            "Model şu anda kullanılamıyor. Lütfen daha sonra tekrar deneyin.",
        )
    return bundle


def get_current_user_id(
    request: Request,
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer_scheme)],
    verifier: Annotated[TokenVerifier, Depends(get_token_verifier)],
) -> UUID:
    """The caller's identity comes only from the verified token's `sub` claim.

    Nothing in the request body or query string is ever trusted as a user id.
    """
    if credentials is None:
        raise AppError(401, "unauthorized", UNAUTHORIZED_MESSAGE)
    user_id = verifier.verify(credentials.credentials)
    request.state.user_id = user_id  # read by the rate limiter
    return user_id


BundleDep = Annotated[ModelBundle, Depends(get_bundle)]
CurrentUserId = Annotated[UUID, Depends(get_current_user_id)]
SessionDep = Annotated[Session, Depends(get_session)]
