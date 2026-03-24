#!/bin/bash
# Kara AI — Terminal Handler Setup
# Registra el protocolo terminal:// para ejecutar comandos desde el chat

set -e

HANDLER="$HOME/.local/bin/kara-terminal-handler"
DESKTOP="$HOME/.local/share/applications/kara-terminal-handler.desktop"

mkdir -p "$(dirname "$HANDLER")"
mkdir -p "$(dirname "$DESKTOP")"

# --- Script handler ---
cat > "$HANDLER" << 'SCRIPT'
#!/bin/bash
# Recibe terminal://comando y lo ejecuta en una terminal nueva
RAW="${1#terminal://}"
CMD=$(python3 -c "import sys,urllib.parse; print(urllib.parse.unquote(sys.argv[1]))" "$RAW" 2>/dev/null || echo "$RAW")

# Detectar terminal disponible
if command -v kitty &>/dev/null; then
    kitty --detach sh -c "$CMD; echo ''; echo '--- Presiona Enter para salir ---'; read"
elif command -v alacritty &>/dev/null; then
    alacritty -e sh -c "$CMD; echo ''; echo '--- Presiona Enter para salir ---'; read"
elif command -v wezterm &>/dev/null; then
    wezterm start -- sh -c "$CMD; echo ''; echo '--- Presiona Enter para salir ---'; read"
elif command -v foot &>/dev/null; then
    foot sh -c "$CMD; echo ''; echo '--- Presiona Enter para salir ---'; read"
elif command -v ghostty &>/dev/null; then
    ghostty -e sh -c "$CMD; echo ''; echo '--- Presiona Enter para salir ---'; read"
elif command -v xfce4-terminal &>/dev/null; then
    xfce4-terminal -e "sh -c '$CMD; echo; echo \"--- Presiona Enter para salir ---\"; read'"
elif command -v gnome-terminal &>/dev/null; then
    gnome-terminal -- sh -c "$CMD; echo ''; echo '--- Presiona Enter para salir ---'; read"
elif command -v xterm &>/dev/null; then
    xterm -e sh -c "$CMD; echo ''; echo '--- Presiona Enter para salir ---'; read"
else
    notify-send "Kara AI" "No se encontró terminal. Instala kitty, alacritty, foot o xterm." 2>/dev/null
    exit 1
fi
SCRIPT
chmod +x "$HANDLER"

# --- Desktop entry ---
cat > "$DESKTOP" << DESKTOP
[Desktop Entry]
Name=Kara Terminal Handler
Exec=$HANDLER %u
Type=Application
NoDisplay=true
MimeType=x-scheme-handler/terminal;
Terminal=false
DESKTOP

# Registrar como handler
update-desktop-database "$(dirname "$DESKTOP")" 2>/dev/null || true
xdg-mime default kara-terminal-handler.desktop x-scheme-handler/terminal 2>/dev/null || true

# Registrar también con xdg-open
if ! grep -q 'x-scheme-handler/terminal' "$HOME/.config/mimeapps.list" 2>/dev/null; then
    mkdir -p "$HOME/.config"
    echo "[Default Applications]" >> "$HOME/.config/mimeapps.list" 2>/dev/null || true
    echo "x-scheme-handler/terminal=kara-terminal-handler.desktop" >> "$HOME/.config/mimeapps.list" 2>/dev/null || true
fi

echo "Handler registrado en: $HANDLER"
echo "Desktop entry en: $DESKTOP"
echo "Prueba con: xdg-open 'terminal://echo hola'"
