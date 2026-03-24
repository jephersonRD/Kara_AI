#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════════
#  Kara AI - Instalador para Hyprland
#  https://github.com/jephersonRD/Chat-Hyperland
# ═══════════════════════════════════════════════════════════════════════════════

# Detectar si se ejecuta desde pipe (curl | bash) y re-ejecutar correctamente
if [ ! -t 0 ]; then
  TEMP_SCRIPT=$(mktemp)
  cat > "$TEMP_SCRIPT"
  chmod +x "$TEMP_SCRIPT"
  exec bash "$TEMP_SCRIPT" "$@"
fi

# Re-ejecutar con bash si estamos en fish u otro shell
if [ -z "$BASH_VERSION" ]; then
  exec bash "$0" "$@"
fi

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
BOLD='\033[1m'
DIM='\033[2m'
NC='\033[0m'

# Variables
INSTALL_DIR="$HOME/.karaIA"
REPO_URL="https://github.com/jephersonRD/Kara_AI"

# Detectar ubicación de config de Hyprland
if [ -f "$HOME/.local/share/caelestia/hypr/hyprland.conf" ]; then
  HYPR_CONF="$HOME/.local/share/caelestia/hypr/hyprland.conf"
else
  HYPR_CONF="$HOME/.config/hypr/hyprland.conf"
fi

LANG_CHOICE="es"

# ═══════════════════════════════════════════════════════════════════════════════
#  FUNCIONES DE TRADUCCIÓN
# ═══════════════════════════════════════════════════════════════════════════════

t() {
  local key="$1"
  case "$LANG_CHOICE" in
    "es")
      case "$key" in
        "select_lang") echo "Selecciona tu idioma / Select your language:" ;;
        "spanish") echo "Español" ;;
        "english") echo "Inglés" ;;
        "opt_install") echo "Instalar" ;;
        "opt_repair") echo "Reparar" ;;
        "opt_remove") echo "Borrar el proyecto" ;;
        "opt_exit") echo "Salir" ;;
        "select_opt") echo "Selecciona una opción:" ;;
        "invalid_opt") echo "Opción no válida. Intenta de nuevo." ;;
        "detecting") echo "Detectando sistema..." ;;
        "detected") echo "Sistema detectado:" ;;
        "checking_deps") echo "Verificando dependencias..." ;;
        "installing") echo "Instalando..." ;;
        "missing_deps") echo "Dependencias faltantes:" ;;
        "installing_deps") echo "Instalando dependencias..." ;;
        "downloading") echo "Descargando Kara AI..." ;;
        "download_ok") echo "Descarga completada" ;;
        "config_keys") echo "Configurando atajos de teclado..." ;;
        "keys_ok") echo "Atajos configurados: Super+Ñ" ;;
        "install_complete") echo "¡Instalación completada!" ;;
        "launching") echo "Iniciando Kara AI..." ;;
        "repairing") echo "Reparando instalación..." ;;
        "repair_ok") echo "Reparación completada" ;;
        "removing") echo "Eliminando proyecto..." ;;
        "remove_ok") echo "Proyecto eliminado" ;;
        "goodbye") echo "¡Hasta luego!" ;;
        "already_installed") echo "Kara AI ya está instalado." ;;
        "not_installed") echo "Kara AI no está instalado." ;;
        "root_error") echo "No ejecutes este script como root." ;;
        "hypr_error") echo "Hyprland no está instalado." ;;
        *) echo "$key" ;;
      esac
      ;;
    "en")
      case "$key" in
        "select_lang") echo "Select your language / Selecciona tu idioma:" ;;
        "spanish") echo "Spanish" ;;
        "english") echo "English" ;;
        "opt_install") echo "Install" ;;
        "opt_repair") echo "Repair" ;;
        "opt_remove") echo "Remove project" ;;
        "opt_exit") echo "Exit" ;;
        "select_opt") echo "Select an option:" ;;
        "invalid_opt") echo "Invalid option. Try again." ;;
        "detecting") echo "Detecting system..." ;;
        "detected") echo "System detected:" ;;
        "checking_deps") echo "Checking dependencies..." ;;
        "installing") echo "Installing..." ;;
        "missing_deps") echo "Missing dependencies:" ;;
        "installing_deps") echo "Installing dependencies..." ;;
        "downloading") echo "Downloading Kara AI..." ;;
        "download_ok") echo "Download completed" ;;
        "config_keys") echo "Configuring keyboard shortcuts..." ;;
        "keys_ok") echo "Shortcuts configured: Super+Ñ" ;;
        "install_complete") echo "Installation completed!" ;;
        "launching") echo "Starting Kara AI..." ;;
        "repairing") echo "Repairing installation..." ;;
        "repair_ok") echo "Repair completed" ;;
        "removing") echo "Removing project..." ;;
        "remove_ok") echo "Project removed" ;;
        "goodbye") echo "Goodbye!" ;;
        "already_installed") echo "Kara AI is already installed." ;;
        "not_installed") echo "Kara AI is not installed." ;;
        "root_error") echo "Do not run this script as root." ;;
        "hypr_error") echo "Hyprland is not installed." ;;
        *) echo "$key" ;;
      esac
      ;;
  esac
}

# ═══════════════════════════════════════════════════════════════════════════════
#  BANNER ASCII
# ═══════════════════════════════════════════════════════════════════════════════

show_banner() {
  clear
  echo ""
  echo -e "${MAGENTA}${BOLD}"
  echo "  ██╗  ██╗ █████╗ ██████╗  █████╗      █████╗  ██╗"
  echo "  ██║ ██╔╝██╔══██╗██╔══██╗██╔══██╗    ██╔══██╗ ██║"
  echo "  █████╔╝ ███████║██████╔╝███████║    ███████║ ██║"
  echo "  ██╔═██╗ ██╔══██║██╔══██╗██╔══██║    ██╔══██║ ██║"
  echo "  ██║  ██╗██║  ██║██║  ██║██║  ██║    ██║  ██║ ██║"
  echo "  ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝    ╚═╝  ╚═╝ ╚═╝"
  echo ""
  echo -e "${NC}"
  echo -e "    ${DIM}https://github.com/jephersonRD/Kara_AI${NC}"
  echo ""
}

# ═══════════════════════════════════════════════════════════════════════════════
#  DETECTAR DISTRIBUCIÓN
# ═══════════════════════════════════════════════════════════════════════════════

detect_distro() {
  echo -e "\n${CYAN}$(t "detecting")${NC}"
  sleep 0.5

  if [ -f /etc/os-release ]; then
    . /etc/os-release
    DISTRO_NAME="$NAME"
    DISTRO_ID="$ID"
    DISTRO_LIKE="$ID_LIKE"
  elif [ -f /etc/lsb-release ]; then
    . /etc/lsb-release
    DISTRO_NAME="$DISTRIB_DESCRIPTION"
    DISTRO_ID="$DISTRIB_ID"
    DISTRO_LIKE=""
  else
    DISTRO_NAME="Unknown"
    DISTRO_ID="unknown"
    DISTRO_LIKE=""
  fi

  echo -e "${GREEN}$(t "detected") ${WHITE}${DISTRO_NAME}${NC}"
  echo ""

  # Determinar gestor de paquetes
  case "$DISTRO_ID" in
    arch|manjaro|endeavouros|garuda|artix)
      PKG_MANAGER="pacman"
      PKG_INSTALL="sudo pacman -S --noconfirm"
      PKG_UPDATE="sudo pacman -Syu --noconfirm"
      ;;
    ubuntu|debian|linuxmint|pop|elementary|zorin)
      PKG_MANAGER="apt"
      PKG_INSTALL="sudo apt install -y"
      PKG_UPDATE="sudo apt update"
      ;;
    fedora|nobara)
      PKG_MANAGER="dnf"
      PKG_INSTALL="sudo dnf install -y"
      PKG_UPDATE="sudo dnf check-update"
      ;;
    opensuse*|suse)
      PKG_MANAGER="zypper"
      PKG_INSTALL="sudo zypper install -y"
      PKG_UPDATE="sudo zypper refresh"
      ;;
    void)
      PKG_MANAGER="xbps"
      PKG_INSTALL="sudo xbps-install -y"
      PKG_UPDATE="sudo xbps-install -Syu"
      ;;
    *)
      # Detectar por ID_LIKE
      if echo "$DISTRO_LIKE" | grep -qi "arch"; then
        PKG_MANAGER="pacman"
        PKG_INSTALL="sudo pacman -S --noconfirm"
        PKG_UPDATE="sudo pacman -Syu --noconfirm"
      elif echo "$DISTRO_LIKE" | grep -qi "debian\|ubuntu"; then
        PKG_MANAGER="apt"
        PKG_INSTALL="sudo apt install -y"
        PKG_UPDATE="sudo apt update"
      elif echo "$DISTRO_LIKE" | grep -qi "fedora\|rhel"; then
        PKG_MANAGER="dnf"
        PKG_INSTALL="sudo dnf install -y"
        PKG_UPDATE="sudo dnf check-update"
      else
        echo -e "${RED}Distribución no soportada: ${DISTRO_NAME}${NC}"
        echo -e "${YELLOW}Se requiere: Arch, Ubuntu, Debian, Fedora, openSUSE o Void${NC}"
        exit 1
      fi
      ;;
  esac
}

# ═══════════════════════════════════════════════════════════════════════════════
#  VERIFICAR E INSTALAR DEPENDENCIAS
# ═══════════════════════════════════════════════════════════════════════════════

check_and_install_deps() {
  echo -e "${CYAN}$(t "checking_deps")${NC}\n"

  local missing=()
  local deps=("python3" "python-gobject" "webkit2gtk" "git" "gtk3")

  # Verificar Hyprland
  if ! command -v hyprctl &> /dev/null; then
    echo -e "${RED}  ✗ Hyprland${NC}"
    echo -e "\n${RED}$(t "hypr_error")${NC}"
    exit 1
  else
    echo -e "${GREEN}  ✓ Hyprland${NC}"
  fi

  # Verificar cada dependencia
  for dep in "${deps[@]}"; do
    case "$dep" in
      "python3")
        if command -v python3 &> /dev/null; then
          echo -e "${GREEN}  ✓ Python 3${NC}"
        else
          echo -e "${RED}  ✗ Python 3${NC}"
          missing+=("python3")
        fi
        ;;
      "python-gobject")
        if python3 -c "import gi" 2>/dev/null; then
          echo -e "${GREEN}  ✓ PyGObject${NC}"
        else
          echo -e "${RED}  ✗ PyGObject${NC}"
          case "$PKG_MANAGER" in
            pacman) missing+=("python-gobject") ;;
            apt) missing+=("python3-gi") ;;
            dnf) missing+=("python3-gobject") ;;
            zypper) missing+=("python3-gobject") ;;
            xbps) missing+=("python3-gobject") ;;
          esac
        fi
        ;;
      "webkit2gtk")
        if python3 -c "import gi; gi.require_version('WebKit2', '4.0')" 2>/dev/null; then
          echo -e "${GREEN}  ✓ WebKit2GTK${NC}"
        else
          echo -e "${RED}  ✗ WebKit2GTK${NC}"
          case "$PKG_MANAGER" in
            pacman) missing+=("webkit2gtk") ;;
            apt) missing+=("gir1.2-webkit2-4.0") ;;
            dnf) missing+=("webkit2gtk4.0") ;;
            zypper) missing+=("webkit2gtk3") ;;
            xbps) missing+=("webkit2gtk") ;;
          esac
        fi
        ;;
      "git")
        if command -v git &> /dev/null; then
          echo -e "${GREEN}  ✓ Git${NC}"
        else
          echo -e "${RED}  ✗ Git${NC}"
          missing+=("git")
        fi
        ;;
      "gtk3")
        if python3 -c "import gi; gi.require_version('Gtk', '3.0')" 2>/dev/null; then
          echo -e "${GREEN}  ✓ GTK 3${NC}"
        else
          echo -e "${RED}  ✗ GTK 3${NC}"
          case "$PKG_MANAGER" in
            pacman) missing+=("gtk3") ;;
            apt) missing+=("gir1.2-gtk-3.0") ;;
            dnf) missing+=("gtk3") ;;
            zypper) missing+=("gtk3") ;;
            xbps) missing+=("gtk+3") ;;
          esac
        fi
        ;;
    esac
  done

  # Instalar dependencias faltantes
  if [ ${#missing[@]} -gt 0 ]; then
    echo -e "\n${YELLOW}$(t "missing_deps") ${missing[*]}${NC}"
    echo -e "${CYAN}$(t "installing_deps")${NC}\n"

    # Actualizar repositorios
    echo -e "${DIM}Actualizando repositorios...${NC}"
    $PKG_UPDATE 2>/dev/null || true

    # Instalar paquetes
    for pkg in "${missing[@]}"; do
      echo -e "${DIM}Instalando ${pkg}...${NC}"
      $PKG_INSTALL "$pkg" 2>/dev/null || {
        echo -e "${RED}Error instalando ${pkg}${NC}"
      }
    done

    echo -e "\n${GREEN}✓ Dependencias instaladas${NC}"
  else
    echo -e "\n${GREEN}✓ Todas las dependencias están instaladas${NC}"
  fi
}

# ═══════════════════════════════════════════════════════════════════════════════
#  DESCARGAR PROYECTO
# ═══════════════════════════════════════════════════════════════════════════════

download_project() {
  echo -e "\n${CYAN}$(t "downloading")${NC}"

  # Crear directorio de instalación
  mkdir -p "$INSTALL_DIR"

  # Eliminar instalación anterior si existe
  if [ -d "$INSTALL_DIR/Chat-Hyperland" ]; then
    rm -rf "$INSTALL_DIR/Chat-Hyperland"
  fi

  # Clonar repositorio
  if git clone --depth 1 "$REPO_URL" "$INSTALL_DIR/Chat-Hyperland" 2>/dev/null; then
    echo -e "${GREEN}$(t "download_ok")${NC}"
  else
    echo -e "${RED}Error al descargar el proyecto${NC}"
    exit 1
  fi

  # Hacer ejecutable el widget
  chmod +x "$INSTALL_DIR/Chat-Hyperland/scripts/kara-widget.py"

  # Crear archivo de configuración si no existe
  if [ ! -f "$INSTALL_DIR/Chat-Hyperland/src/config.json" ]; then
    echo '{"gemini":"","groq":"","openrouter":""}' > "$INSTALL_DIR/Chat-Hyperland/src/config.json"
  fi
}

# ═══════════════════════════════════════════════════════════════════════════════
#  CONFIGURAR ATAJO DE TECLADO
# ═══════════════════════════════════════════════════════════════════════════════

setup_keybinding() {
  echo -e "\n${CYAN}$(t "config_keys")${NC}"

  # Crear directorio de config si no existe
  mkdir -p "$(dirname "$HYPR_CONF")"

  # Crear archivo de configuración si no existe
  if [ ! -f "$HYPR_CONF" ]; then
    touch "$HYPR_CONF"
  fi

  # Verificar si ya existe el atajo
  if grep -q "kara-widget.py" "$HYPR_CONF" 2>/dev/null; then
    echo -e "${YELLOW}El atajo ya existe, actualizando...${NC}"
    # Eliminar línea anterior
    sed -i '/kara-widget.py/d' "$HYPR_CONF"
  fi

  # Agregar atajo de teclado
  echo "" >> "$HYPR_CONF"
  echo "# Kara AI - Widget de asistente IA" >> "$HYPR_CONF"
  echo "bind = SUPER, grave, exec, python3 $INSTALL_DIR/Chat-Hyperland/scripts/kara-widget.py" >> "$HYPR_CONF"

  echo -e "${GREEN}$(t "keys_ok")${NC}"
  echo -e "${DIM}Atajo: Super + Ñ (o backtick)${NC}"

  # Recargar Hyprland si está corriendo
  if pgrep -x "Hyprland" > /dev/null; then
    hyprctl reload 2>/dev/null && echo -e "${GREEN}Hyprland recargado${NC}" || true
  fi
}

# ═══════════════════════════════════════════════════════════════════════════════
#  INSTALAR
# ═══════════════════════════════════════════════════════════════════════════════

do_install() {
  show_banner
  echo -e "${BOLD}${MAGENTA}  ┌─────────────────────────────────────┐${NC}"
  echo -e "${BOLD}${MAGENTA}  │${NC}  ${WHITE}$(t "opt_install")${NC}                             ${BOLD}${MAGENTA}│${NC}"
  echo -e "${BOLD}${MAGENTA}  └─────────────────────────────────────┘${NC}"
  echo ""

  # Verificar si ya está instalado
  if [ -d "$INSTALL_DIR/Chat-Hyperland" ]; then
    echo -e "${YELLOW}$(t "already_installed")${NC}"
    echo -e "${DIM}Usa la opción 2 para reparar o 3 para eliminar.${NC}"
    read -rp "Presiona Enter para continuar..."
    return
  fi

  detect_distro
  check_and_install_deps
  download_project
  setup_keybinding

  echo ""
  echo -e "${GREEN}${BOLD}  ╔═══════════════════════════════════════╗${NC}"
  echo -e "${GREEN}${BOLD}  ║                                       ║${NC}"
  echo -e "${GREEN}${BOLD}  ║     ✓ $(t "install_complete")          ║${NC}"
  echo -e "${GREEN}${BOLD}  ║                                       ║${NC}"
  echo -e "${GREEN}${BOLD}  ╚═══════════════════════════════════════╝${NC}"
  echo ""
  echo -e "${WHITE}$(t "launching")${NC}"
  echo -e "${DIM}Presiona Super+Ñ para abrir Kara AI${NC}"
  echo ""

  # Iniciar el widget
  nohup python3 "$INSTALL_DIR/Chat-Hyperland/scripts/kara-widget.py" &>/dev/null &
  disown

  sleep 2
}

# ═══════════════════════════════════════════════════════════════════════════════
#  REPARAR
# ═══════════════════════════════════════════════════════════════════════════════

do_repair() {
  show_banner
  echo -e "${BOLD}${YELLOW}  ┌─────────────────────────────────────┐${NC}"
  echo -e "${BOLD}${YELLOW}  │${NC}  ${WHITE}$(t "opt_repair")${NC}                               ${BOLD}${YELLOW}│${NC}"
  echo -e "${BOLD}${YELLOW}  └─────────────────────────────────────┘${NC}"
  echo ""

  # Verificar si está instalado
  if [ ! -d "$INSTALL_DIR/Chat-Hyperland" ]; then
    echo -e "${RED}$(t "not_installed")${NC}"
    echo -e "${DIM}Usa la opción 1 para instalar.${NC}"
    read -rp "Presiona Enter para continuar..."
    return
  fi

  echo -e "${CYAN}$(t "repairing")${NC}\n"

  # Verificar dependencias
  detect_distro
  check_and_install_deps

  # Verificar archivos del proyecto
  echo -e "\n${CYAN}Verificando archivos del proyecto...${NC}"

  local missing_files=()
  [ ! -f "$INSTALL_DIR/Chat-Hyperland/scripts/kara-widget.py" ] && missing_files+=("scripts/kara-widget.py")
  [ ! -f "$INSTALL_DIR/Chat-Hyperland/src/index.html" ] && missing_files+=("src/index.html")
  [ ! -f "$INSTALL_DIR/Chat-Hyperland/src/script.js" ] && missing_files+=("src/script.js")
  [ ! -f "$INSTALL_DIR/Chat-Hyperland/src/style.css" ] && missing_files+=("src/style.css")
  [ ! -f "$INSTALL_DIR/Chat-Hyperland/src/config.json" ] && missing_files+=("src/config.json")

  if [ ${#missing_files[@]} -gt 0 ]; then
    echo -e "${RED}Archivos faltantes:${NC}"
    for f in "${missing_files[@]}"; do
      echo -e "  ${RED}✗ ${f}${NC}"
    done
    echo -e "\n${YELLOW}Re-descargando proyecto...${NC}"
    download_project
  else
    echo -e "${GREEN}✓ Todos los archivos presentes${NC}"
  fi

  # Verificar atajo de teclado
  echo -e "\n${CYAN}Verificando atajo de teclado...${NC}"
  if ! grep -q "kara-widget.py" "$HYPR_CONF" 2>/dev/null; then
    echo -e "${YELLOW}Atajo no encontrado, configurando...${NC}"
    setup_keybinding
  else
    echo -e "${GREEN}✓ Atajo configurado correctamente${NC}"
  fi

  # Verificar permisos
  chmod +x "$INSTALL_DIR/Chat-Hyperland/scripts/kara-widget.py"

  echo -e "\n${GREEN}$(t "repair_ok")${NC}"
  read -rp "Presiona Enter para continuar..."
}

# ═══════════════════════════════════════════════════════════════════════════════
#  ELIMINAR
# ═══════════════════════════════════════════════════════════════════════════════

do_remove() {
  show_banner
  echo -e "${BOLD}${RED}  ┌─────────────────────────────────────┐${NC}"
  echo -e "${BOLD}${RED}  │${NC}  ${WHITE}$(t "opt_remove")${NC}                       ${BOLD}${RED}│${NC}"
  echo -e "${BOLD}${RED}  └─────────────────────────────────────┘${NC}"
  echo ""

  # Verificar si está instalado
  if [ ! -d "$INSTALL_DIR" ]; then
    echo -e "${YELLOW}$(t "not_installed")${NC}"
    read -rp "Presiona Enter para continuar..."
    return
  fi

  # Confirmar eliminación
  echo -e "${YELLOW}¿Estás seguro de que quieres eliminar Kara AI? (s/n)${NC}"
  read -rp "> " confirm

  if [[ "$confirm" != "s" && "$confirm" != "S" ]]; then
    echo -e "${DIM}Operación cancelada${NC}"
    read -rp "Presiona Enter para continuar..."
    return
  fi

  echo -e "\n${CYAN}$(t "removing")${NC}"

  # Matar proceso si está corriendo
  pkill -f "kara-widget.py" 2>/dev/null || true

  # Eliminar directorio
  rm -rf "$INSTALL_DIR"

  # Eliminar atajo de teclado
  if [ -f "$HYPR_CONF" ]; then
    sed -i '/kara-widget.py/d' "$HYPR_CONF"
    sed -i '/Kara AI/d' "$HYPR_CONF"
  fi

  echo -e "${GREEN}$(t "remove_ok")${NC}"
  echo -e "${DIM}El directorio ~/.karaIA ha sido eliminado${NC}"
  read -rp "Presiona Enter para continuar..."
}

# ═══════════════════════════════════════════════════════════════════════════════
#  MENÚ PRINCIPAL
# ═══════════════════════════════════════════════════════════════════════════════

show_menu() {
  show_banner
  echo -e "  ${BOLD}${WHITE}$(t "select_opt")${NC}"
  echo ""
  echo -e "  ${CYAN}1)${NC} ${GREEN}$(t "opt_install")${NC}"
  echo -e "  ${CYAN}2)${NC} ${YELLOW}$(t "opt_repair")${NC}"
  echo -e "  ${CYAN}3)${NC} ${RED}$(t "opt_remove")${NC}"
  echo -e "  ${CYAN}4)${NC} ${DIM}$(t "opt_exit")${NC}"
  echo ""
  echo -ne "  ${BOLD}> ${NC}"
}

# ═══════════════════════════════════════════════════════════════════════════════
#  SELECCIÓN DE IDIOMA
# ═══════════════════════════════════════════════════════════════════════════════

select_language() {
  clear
  echo ""
  echo -e "${MAGENTA}${BOLD}"
  echo "  ██╗  ██╗ █████╗ ██████╗  █████╗      █████╗  ██╗"
  echo "  ██║ ██╔╝██╔══██╗██╔══██╗██╔══██╗    ██╔══██╗ ██║"
  echo "  █████╔╝ ███████║██████╔╝███████║    ███████║ ██║"
  echo "  ██╔═██╗ ██╔══██║██╔══██╗██╔══██║    ██╔══██║ ██║"
  echo "  ██║  ██╗██║  ██║██║  ██║██║  ██║    ██║  ██║ ██║"
  echo "  ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝    ╚═╝  ╚═╝ ╚═╝"
  echo ""
  echo -e "${NC}"
  echo -e "    ${DIM}https://github.com/jephersonRD/Kara_AI${NC}"
  echo ""
  echo -e "  ${WHITE}$(t "select_lang")${NC}"
  echo ""
  echo -e "  ${CYAN}1)${NC} ${WHITE}$(t "spanish")${NC}"
  echo -e "  ${CYAN}2)${NC} ${WHITE}$(t "english")${NC}"
  echo ""
  echo -ne "  ${BOLD}> ${NC}"

  while true; do
    read -r lang_choice
    case $lang_choice in
      1) LANG_CHOICE="es"; break ;;
      2) LANG_CHOICE="en"; break ;;
      *) echo -e "  ${RED}$(t "invalid_opt")${NC}" ;;
    esac
  done
}

# ═══════════════════════════════════════════════════════════════════════════════
#  MAIN
# ═══════════════════════════════════════════════════════════════════════════════

main() {
  # Verificar que no se ejecute como root
  if [ "$EUID" -eq 0 ]; then
    echo -e "${RED}$(t "root_error")${NC}"
    exit 1
  fi

  # Seleccionar idioma
  select_language

  while true; do
    show_menu
    read -r option
    case $option in
      1) do_install ;;
      2) do_repair ;;
      3) do_remove ;;
      4)
        echo ""
        echo -e "${GREEN}$(t "goodbye")${NC}"
        echo ""
        exit 0
        ;;
      *)
        echo -e "  ${RED}$(t "invalid_opt")${NC}"
        sleep 1
        ;;
    esac
  done
}

# Ejecutar
main
