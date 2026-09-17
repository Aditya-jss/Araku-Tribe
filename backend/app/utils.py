from fastapi import Request


async def get_request_data(request: Request) -> dict[str, str]:
    """Merge query params (GET) and form fields (POST) into one dict, mirroring
    how the legacy PHP endpoints read `action` and friends from either."""
    data: dict[str, str] = dict(request.query_params)
    if request.method == "POST":
        form = await request.form()
        data.update({key: str(value) for key, value in form.items()})
    return data


def require_fields(data: dict[str, str], *fields: str) -> None:
    from fastapi import HTTPException

    missing = [f for f in fields if not data.get(f)]
    if missing:
        raise HTTPException(status_code=400, detail=f"Missing field(s): {', '.join(missing)}")
