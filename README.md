<div align="center">

# Kara AI

**Tu asistente de IA en el escritorio. Sin navegador. Sin distracciones.**

[![Hyprland](https://img.shields.io/badge/Hyprland-ready-blueviolet?style=flat-square&logo=linux)](https://hyprland.org)
[![Python](https://img.shields.io/badge/Python-3.10+-yellow?style=flat-square&logo=python)](https://python.org)
[![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](#)
[![Stars](https://img.shields.io/github/stars/jeph/Kara-AI?style=flat-square&logo=github&color=orange)](https://github.com/jeph/Kara-AI)

---

<img src="https://img.shields.io/badge/status-online-brightgreen?style=for-the-badge" alt="status"> &nbsp;
<img src="https://img.shields.io/badge/providers-3-blue?style=for-the-badge" alt="providers">

</div>

## ¿Qué es Kara AI?

Kara AI es un **widget de escritorio** que te da acceso a ChatGPT, Gemini y otros modelos de IA **sin abrir el navegador**. Un simple atajo de teclado (`Super + ñ`) y ya puedes preguntar lo que necesites: un comando, un código, una duda rápida.

Pensado para **Hyprland** y usuarios de Linux que no quieren cambiar de ventana cada vez que necesitan ayuda de IA.

## Capturas

```
┌─────────────────────────────────────┐
│  ⚡ Kara AI                    ☰ 🗑 │
│─────────────────────────────────────│
│                                     │
│  Tú: cómo ver procesos en linux     │
│                                     │
│  Kara: Usa `htop` o `ps aux`...    │
│  ┌──────────────────────────────┐   │
│  │ bash                     📋  │   │
│  │ ───────────────────────────  │   │
│  │ $ htop                       │   │
│  │ $ ps aux --sort=-%mem        │   │
│  └──────────────────────────────┘   │
│                                     │
│─────────────────────────────────────│
│  Escribe un mensaje...          ▶   │
│  llama-3.3-70b   ·57 tokens · 12↕  │
└─────────────────────────────────────┘
```

## Proveedores de IA

| Proveedor | Modelos destacados | Velocidad | Gratis |
|-----------|-------------------|-----------|--------|
| **Groq** | Llama 3.3 70B, Qwen 3, GPT-OSS 120B | Muy rápida | Sí |
| **Google Gemini** | 2.5 Flash, 2.5 Pro, 2.0 Flash | Rápida | Sí |
| **OpenRouter** | Gemma 3 27B, GLM 4.5, Trinity Mini | Variable | Sí |

## Características

| Función | Descripción |
|---------|-------------|
| ⚡ Acceso rápido | `Super + ñ` abre/cierra el widget |
| 🎨 Tema dark/light | Alterna con un click, se guarda tu preferencia |
| 💬 Multi-conversación | Sidebar con historial de chats separados |
| ✏️ Editar mensajes | Click en tu mensaje para editarlo y reenviar |
| ⏹️ Detener generación | Botón rojo o `Escape` para cortar la respuesta |
| 📊 Stats en vivo | Tokens, mensajes y tiempo de conversación |
| ⚡ Rate limit | Indicador visual de requests por minuto |
| 🖥️ Ejecutar código | Botón para abrir código bash en tu terminal |
| 📥 Descargar código | Guarda bloques de código como archivo |
| 🔌 Estado de conexión | Punto verde/rojo según tengas internet |

## Instalación

```bash
# Clonar
git clone https://github.com/jeph/Kara-AI.git
cd Kara-AI

# Dependencias Python
pip install PyGObject

# Configurar en Hyprland
chmod +x setup-hyprland.sh
./setup-hyprland.sh

# Recargar Hyprland
hyprctl reload
```

## Uso

| Acción | Cómo |
|--------|------|
| Abrir/cerrar widget | `Super + ñ` |
| Enviar mensaje | `Enter` |
| Salto de línea | `Shift + Enter` |
| Detener generación | `Escape` o botón ⏹ |
| Cambiar modelo | Click en el nombre del modelo arriba a la derecha |

## Estructura

```
Kara-AI/
├── src/
│   ├── index.html          # Interfaz del chat
│   ├── style.css           # Tema glassmorphism
│   └── script.js           # Lógica, APIs, renderizado
├── scripts/
│   ├── kara-widget.py      # Widget GTK3 para Hyprland
│   ├── kara-toggle.sh      # Toggle abrir/cerrar
│   ├── setup-hyprland.sh   # Configura keybind
│   └── setup-terminal-handler.sh  # Protocolo terminal://
└── README.md
```

## Requisitos

| Dependencia | Motivo |
|-------------|--------|
| Python 3.10+ | Widget de escritorio |
| PyGObject (GTK3, WebKit2) | Renderizado del widget |
| Hyprland | Gestor de ventanas |
| kitty / alacritty / foot | Para ejecutar código (opcional) |

## Contribuir

Las contribuciones son bienvenidas. Abre un issue o un pull request.

## Licencia

MIT
