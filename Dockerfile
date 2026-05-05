FROM python:3.10-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8080

WORKDIR /app

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8080

# Use shell form so $PORT is expanded correctly in all environments
CMD ["sh", "-c", "gunicorn --bind 0.0.0.0:${PORT} main:app"]
