FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["sh", "-c", "alembic upgrade head && python -m app.seed && (test -z \"$ADMIN_EMAIL\" || python -m app.seed_admin) && uvicorn app.main:app --host 0.0.0.0 --port 8000"]
