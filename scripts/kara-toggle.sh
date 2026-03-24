#!/bin/bash
# Kara AI — Toggle widget
WIDGET_DIR="$(cd "$(dirname "$0")" && pwd)"

# Buscar proceso existente
PID=$(pgrep -f "python3.*kara-widget.py" 2>/dev/null | head -1)

if [ -n "$PID" ]; then
    # Cerrar
    kill "$PID" 2>/dev/null
else
    # Abrir (no bloquear)
    GDK_BACKEND=x11 nohup python3 "$WIDGET_DIR/kara-widget.py" >/dev/null 2>&1 &
fi
