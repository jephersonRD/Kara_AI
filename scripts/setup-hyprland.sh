#!/bin/bash
# Kara AI — Setup Hyprland
WIDGET_DIR="$(cd "$(dirname "$0")" && pwd)"
HYPR_CONF="$HOME/.config/hypr/hyprland.conf"
MARKER="# --- KARA AI WIDGET ---"

# Eliminar config vieja
sed -i '/# --- KARA AI WIDGET ---/,/# --- KARA AI WIDGET --- END/d' "$HYPR_CONF" 2>/dev/null

# Añadir keybind
cat >> "$HYPR_CONF" << EOF

$MARKER
bind = SUPER, ntilde, exec, $WIDGET_DIR/kara-toggle.sh
$MARKER END
EOF

echo "Configurado. Recarga Hyprland:"
echo "  hyprctl reload"
echo ""
echo "O cierra sesión y vuelve a entrar."
echo ""
echo "Tecla: Super+ñ"
