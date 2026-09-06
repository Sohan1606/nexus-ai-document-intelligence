FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app
COPY corpus ./corpus
COPY eval ./eval

ENV NEXUS_DATA_DIR=/data
ENV NEXUS_CORPUS_DIR=/app/corpus
ENV PYTHONUNBUFFERED=1

VOLUME ["/data"]
EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
