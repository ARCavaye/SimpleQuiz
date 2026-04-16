# Dockerfile for SimpleQuiz (Django backend)
FROM python:3.13-slim

WORKDIR /app

COPY backend/src/ ./src
COPY uv.lock ./uv.lock
COPY pyproject.toml ./pyproject.toml
COPY backend/entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

RUN pip install --upgrade pip && pip install uv && uv sync --no-dev

EXPOSE 8000

WORKDIR /app/src

CMD ["uv", "run", "/app/entrypoint.sh"]
