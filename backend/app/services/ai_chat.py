import json
import logging

import anthropic
from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.config import settings
from app.models.user import User
from app.routers import cart as cart_router
from app.routers import orders as orders_router
from app.routers import products as products_router

logger = logging.getLogger("arakutribe.ai_chat")

MODEL = "claude-opus-5"
MAX_TOKENS = 2048
MAX_TOOL_ITERATIONS = 6

SYSTEM_PROMPT = """You are the Araku Tribe shopping assistant — a friendly, knowledgeable guide for an \
online store selling ethically sourced coffee (bags), cups, mugs, and branded t-shirts, grown by tribal \
farming communities in the Araku Valley, India.

## What you actually know

You have two kinds of knowledge, and it matters which one a question needs:

1. **Live catalog/account data** (products, stock, prices, cart, orders) — always use the tools for \
this. Never guess or invent a product name, price, stock level, order status, or order ID.
2. **Static brand/business facts** (below) — you already know these, use them directly, don't deflect \
to "check the website" for anything covered here.

### Brand story (About)
Araku Tribe is a community-driven coffee brand built with tribal farming communities in the Araku \
Valley, Eastern Ghats. Beans are handpicked at peak ripeness, sourced through direct fair-trade \
partnerships (more value flows to farmers, not middlemen), grown using shade-grown methods that \
protect the valley's biodiversity, and shipped in eco-friendly, recyclable packaging.

### Franchise program
Starting investment is $7,000 (down from a standard $8,000). It includes premium high-altitude Araku \
Valley coffee, full training on brewing/service/operations, marketing support, access to the supplier \
network, and ongoing operational support after opening. Store formats fit cafés, kiosks, and franchise \
counters. To apply or ask more, direct them to the Franchise page (/franchise) or Contact page (/contact).

### Contact info
- Address: Araku Tribe Coffee, Araku Valley, Visakhapatnam
- Phone: +91-7893-836-529
- Email: info@arakutribe.com
- There's also a contact form at /contact for anything needing a human follow-up.

### Policies (high level — for specifics, point to the linked page)
- **Shipping/orders**: prices are in USD; cash-on-delivery orders are marked pending until collected, \
other payment methods are marked paid at checkout.
- **Cancellations**: an order can be cancelled from the customer's Orders page while it's still \
"Processing" — once it's shipped, it can no longer be cancelled through the site.
- **Account deletion**: deleting your account (from Account settings) is immediate and permanent — \
there's no grace period, unlike some other sites. Full details at /terms-deletion.
- **Privacy/Terms**: full text at /privacy and /terms.
- Guest checkout isn't supported — an account (with OTP-verified email) is required to buy or check \
order status.

## Guidelines
- Be warm, concise, and natural. Prefer a short reply over a long list unless the customer asks for detail.
- All prices are in US dollars.
- The cart and order tools only work for a signed-in customer. If a tool result says the customer \
needs to sign in, tell them to sign in at /login and ask again — state it plainly, don't over-apologize.
- After a tool call that changes something (added to cart, cancelled an order), briefly confirm what \
happened, including the new total or status.
- If asked about something genuinely unrelated to Araku Tribe (not products, brand, franchise, \
policies, or the store in general), say so plainly and steer back — don't force an answer.
"""

TOOLS: list[dict] = [
    {
        "name": "search_products",
        "description": (
            "Search the Araku Tribe product catalog. Provide a category to browse a specific type, "
            "and/or a text query to filter by product name. Returns up to 12 matching products with "
            "their id, name, price (USD), stock quantity, and category. Always use this instead of "
            "guessing what's in stock."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "category": {
                    "type": "string",
                    "enum": ["bag", "cup", "mug", "tshirt"],
                    "description": "Limit results to this category. Omit to search across all categories.",
                },
                "query": {
                    "type": "string",
                    "description": "Optional case-insensitive text to filter product names by, e.g. 'dark roast'.",
                },
            },
        },
    },
    {
        "name": "get_product_details",
        "description": (
            "Get full details (name, price, stock, category, minimum order quantity) for one product "
            "by its exact product ID, as returned by search_products."
        ),
        "input_schema": {
            "type": "object",
            "properties": {"product_id": {"type": "string"}},
            "required": ["product_id"],
        },
    },
    {
        "name": "add_to_cart",
        "description": "Add a quantity of one product to the current customer's cart. Requires the customer to be signed in.",
        "input_schema": {
            "type": "object",
            "properties": {
                "product_id": {"type": "string"},
                "quantity": {"type": "integer", "minimum": 1},
            },
            "required": ["product_id", "quantity"],
        },
    },
    {
        "name": "view_cart",
        "description": "View the current customer's cart contents and total. Requires the customer to be signed in.",
        "input_schema": {"type": "object", "properties": {}},
    },
    {
        "name": "list_my_orders",
        "description": "List the current customer's past orders with status and total. Requires the customer to be signed in.",
        "input_schema": {"type": "object", "properties": {}},
    },
    {
        "name": "get_order_details",
        "description": (
            "Get full details (items, status, payment, shipping address) for one of the current "
            "customer's orders by order ID. Requires the customer to be signed in."
        ),
        "input_schema": {
            "type": "object",
            "properties": {"order_id": {"type": "integer"}},
            "required": ["order_id"],
        },
    },
    {
        "name": "cancel_order",
        "description": (
            "Cancel one of the current customer's orders by order ID, if it's still cancellable (not "
            "yet shipped/delivered/already cancelled). Requires the customer to be signed in."
        ),
        "input_schema": {
            "type": "object",
            "properties": {"order_id": {"type": "integer"}},
            "required": ["order_id"],
        },
    },
]

_AUTH_REQUIRED_TOOLS = {"add_to_cart", "view_cart", "list_my_orders", "get_order_details", "cancel_order"}


def _run_tool(name: str, tool_input: dict, user: User | None, db: Session) -> tuple[dict, bool]:
    """Returns (result, is_error). Reuses the same handler functions the REST
    routers use, so business rules (stock checks, ownership, low-stock sync,
    ...) stay in one place regardless of which surface calls them."""
    if user is None and name in _AUTH_REQUIRED_TOOLS:
        return {"error": "This customer is not signed in. Tell them to sign in at /login, then ask again."}, True

    try:
        if name == "search_products":
            category = tool_input.get("category")
            query = (tool_input.get("query") or "").strip().lower()
            categories = [category] if category else ["bag", "cup", "mug", "tshirt"]
            products: list[dict] = []
            for cat in categories:
                products.extend(products_router._list({"category": cat}, db)["products"])
            if query:
                products = [p for p in products if query in p["name"].lower()]
            products = products[:12]
            return {"products": products, "count": len(products)}, False

        if name == "get_product_details":
            return products_router._detail({"product_id": tool_input["product_id"]}, db), False

        if name == "add_to_cart":
            data = {"product_id": tool_input["product_id"], "quantity": str(tool_input["quantity"])}
            return cart_router._add(data, user, db), False

        if name == "view_cart":
            return cart_router._cart_response(user, db), False

        if name == "list_my_orders":
            return orders_router._list(user, db), False

        if name == "get_order_details":
            data = {"order_id": str(tool_input["order_id"])}
            return orders_router._detail(data, user, db), False

        if name == "cancel_order":
            data = {"order_id": str(tool_input["order_id"])}
            return orders_router._cancel(data, user, db), False

        return {"error": f"Unknown tool: {name}"}, True
    except HTTPException as exc:
        return {"error": str(exc.detail)}, True
    except (KeyError, ValueError, TypeError) as exc:
        return {"error": f"Invalid input: {exc}"}, True


def run_chat(history: list[dict], user: User | None, db: Session) -> str:
    if not settings.anthropic_api_key:
        raise HTTPException(status_code=503, detail="The AI assistant is not configured yet.")

    client = anthropic.Anthropic(api_key=settings.anthropic_api_key)
    messages: list[dict] = list(history)
    final_text = "Sorry, I couldn't come up with a response — please try again."

    for _ in range(MAX_TOOL_ITERATIONS):
        try:
            response = client.messages.create(
                model=MODEL,
                max_tokens=MAX_TOKENS,
                system=[{"type": "text", "text": SYSTEM_PROMPT, "cache_control": {"type": "ephemeral"}}],
                tools=TOOLS,
                messages=messages,
            )
        except anthropic.APIStatusError as exc:
            logger.error("Claude API error: %s", exc)
            raise HTTPException(status_code=502, detail="The AI assistant is temporarily unavailable.") from exc
        except anthropic.APIConnectionError as exc:
            logger.error("Claude API connection error: %s", exc)
            raise HTTPException(status_code=502, detail="The AI assistant is temporarily unavailable.") from exc

        text_blocks = [block.text for block in response.content if block.type == "text"]
        if text_blocks:
            final_text = "\n".join(text_blocks)

        if response.stop_reason != "tool_use":
            break

        messages.append({"role": "assistant", "content": response.content})

        tool_results = []
        for block in response.content:
            if block.type != "tool_use":
                continue
            result, is_error = _run_tool(block.name, block.input, user, db)
            tool_results.append(
                {
                    "type": "tool_result",
                    "tool_use_id": block.id,
                    "content": json.dumps(result, default=str),
                    "is_error": is_error,
                }
            )
        messages.append({"role": "user", "content": tool_results})
    else:
        logger.warning("AI chat hit max tool iterations (%s)", MAX_TOOL_ITERATIONS)

    return final_text
