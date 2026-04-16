# Dockerfile for SimpleQuiz (Django backend)
FROM python:3.13-slim

WORKDIR /app

COPY src/ ./src
COPY requirements.txt ./requirements.txt
COPY ./entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

RUN pip install --upgrade pip && pip install -r requirements.txt

EXPOSE 8000

WORKDIR /app/src

CMD ["/app/entrypoint.sh"]
