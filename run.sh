#!/bin/sh
# Запуск MediaVault
cd "$(dirname "$0")"
if [ ! -d .venv ]; then
  echo "Виртуальное окружение не найдено. Выполняю setup..."
  python3 -m venv .venv
  .venv/bin/pip install --upgrade pip
  .venv/bin/pip install -r requirements.txt
fi
exec .venv/bin/python -m uvicorn app.main:app --host "${HOST:-0.0.0.0}" --port "${PORT:-8666}"
