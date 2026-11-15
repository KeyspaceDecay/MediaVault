#!/bin/sh
# Запуск MediaVault
cd "$(dirname "$0")"

if [ ! -d .venv ]; then
  echo "Виртуальное окружение не найдено. Выполняю setup..."
  python3 -m venv .venv
  .venv/bin/pip install --upgrade pip
  .venv/bin/pip install -r requirements.txt
fi

HOST="${HOST:-$(grep -E '^HOST=' .env 2>/dev/null | tail -1 | cut -d= -f2-)}"
PORT="${PORT:-$(grep -E '^PORT=' .env 2>/dev/null | tail -1 | cut -d= -f2-)}"
HOST="${HOST:-0.0.0.0}"
PORT="${PORT:-8666}"

exec .venv/bin/python -m uvicorn app.main:app --host "$HOST" --port "$PORT"
