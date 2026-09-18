import time
from collections import defaultdict, deque

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_current_user_optional
from app.models.user import User
from app.services.ai_chat import run_chat

router = APIRouter(prefix="/api/ai", tags=["ai-chat"])

MAX_HISTORY_MESSAGES = 20

# Simple in-memory per-IP rate limit. Every call to this endpoint spends real
# money on the Claude API and is reachable by anonymous guests, so it needs
# *some* abuse guard even for a small storefront. This is process-local (not
# shared across replicas) — fine for a single backend instance; a multi-
# instance deployment needs a shared store (Redis) instead.
_RATE_LIMIT_WINDOW_SECONDS = 600
_RATE_LIMIT_MAX_REQUESTS = 20
_request_log: dict[str, deque] = defaultdict(deque)


def _check_rate_limit(client_ip: str) -> None:
    now = time.time()
    log = _request_log[client_ip]
    while log and now - log[0] > _RATE_LIMIT_WINDOW_SECONDS:
        log.popleft()
    if len(log) >= _RATE_LIMIT_MAX_REQUESTS:
        raise HTTPException(status_code=429, detail="Too many messages — please wait a few minutes and try again.")
    log.append(now)


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: list[ChatMessage] = Field(min_length=1)


class ChatResponse(BaseModel):
    message: str


@router.post("/chat", response_model=ChatResponse)
def chat(
    body: ChatRequest,
    request: Request,
    user: User | None = Depends(get_current_user_optional),
    db: Session = Depends(get_db),
):
    _check_rate_limit(request.client.host if request.client else "unknown")

    for m in body.messages:
        if m.role not in ("user", "assistant"):
            raise HTTPException(status_code=400, detail="Message role must be 'user' or 'assistant'")

    history = [{"role": m.role, "content": m.content} for m in body.messages[-MAX_HISTORY_MESSAGES:]]
    reply = run_chat(history, user, db)
    return ChatResponse(message=reply)
