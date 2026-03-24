<div align="center">

# Kara AI - Desktop AI Assistant for Hyprland Linux

**ChatGPT, Gemini & Groq on your desktop. No browser needed.**

<img src="Assets/3.jpg" alt="Kara AI - AI Desktop Widget for Hyprland" width="200">

[![GitHub Stars](https://img.shields.io/github/stars/jephersonRD/Kara_AI?style=flat-square&logo=github&color=orange)](https://github.com/jephersonRD/Kara_AI)
[![GitHub Forks](https://img.shields.io/github/forks/jephersonRD/Kara_AI?style=flat-square&logo=github&color=blue)](https://github.com/jephersonRD/Kara_AI)
[![GitHub Issues](https://img.shields.io/github/issues/jephersonRD/Kara_AI?style=flat-square&logo=github)](https://github.com/jephersonRD/Kara_AI/issues)
[![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](LICENSE)
[![Hyprland](https://img.shields.io/badge/Hyprland-ready-blueviolet?style=flat-square&logo=linux)](https://hyprland.org)
[![Python](https://img.shields.io/badge/Python-3.10+-yellow?style=flat-square&logo=python)](https://python.org)
[![GitHub Last Commit](https://img.shields.io/github/last-commit/jephersonRD/Kara_AI?style=flat-square&color=green)](https://github.com/jephersonRD/Kara_AI)

---

**[English](#english)** | **[Español](#español)** | **[Installation](#installation)** | **[Features](#features)** | **[FAQ](#faq)**

</div>

---

## Español

### ¿Qué es Kara AI?

**Kara AI** es un **widget de escritorio para Linux** que te da acceso a **ChatGPT, Gemini, Groq y otros modelos de IA** sin abrir el navegador. Solo presiona `Super + ñ` y pregunta lo que necesites.

**¿Por qué usar Kara AI?**
- **Sin navegador** - No más pestañas abiertas de ChatGPT
- **Rápido** - Acceso instantáneo con atajo de teclado
- **Privado** - Tus conversaciones se guardan localmente
- **Gratis** - Usa modelos gratuitos de Groq, Gemini y OpenRouter
- **Para Hyprland** - Integración perfecta con el gestor de ventanas

### Instalación Rápida

```bash
curl -sSL https://raw.githubusercontent.com/jephersonRD/Kara_AI/main/installer.sh | bash
```

> **Funciona en:** bash, zsh, fish, y cualquier terminal de Linux

### Proveedores de IA Disponibles

| Proveedor | Modelos | Velocidad | Precio |
|-----------|---------|-----------|--------|
| **Groq** | Llama 3.3, Qwen 3, GPT-OSS | ⚡ Ultra rápida | Gratis |
| **Google Gemini** | 2.5 Flash, 2.5 Pro | 🚀 Rápida | Gratis |
| **OpenRouter** | Gemma 3, GLM 4.5 | 🔄 Variable | Gratis |

### Capturas

<img src="Assets/1.png" alt="Kara AI interfaz de chat con IA" width="600">

---

## English

### What is Kara AI?

**Kara AI** is a **Linux desktop widget** that gives you access to **ChatGPT, Gemini, Groq and other AI models** without opening a browser. Just press `Super + ñ` and ask anything.

**Why use Kara AI?**
- **No browser** - No more ChatGPT tabs open
- **Fast** - Instant access with keyboard shortcut
- **Private** - Conversations saved locally
- **Free** - Use free models from Groq, Gemini and OpenRouter
- **For Hyprland** - Perfect integration with the window manager

### Quick Installation

```bash
curl -sSL https://raw.githubusercontent.com/jephersonRD/Kara_AI/main/installer.sh | bash
```

> **Works on:** bash, zsh, fish, and any Linux terminal

---

## Features

| Feature | Description |
|---------|-------------|
| ⚡ **Quick Access** | `Super + ñ` opens/closes the widget |
| 🎨 **Dark/Light Theme** | Toggle with one click, saves preference |
| 💬 **Multi-Chat** | Sidebar with separate chat history |
| ✏️ **Edit Messages** | Click your message to edit and resend |
| ⏹️ **Stop Generation** | Red button or `Escape` to stop response |
| 📊 **Live Stats** | Tokens, messages and conversation time |
| 💯 **Message Limit** | 100 messages per chat |
| 🖥️ **Run Code** | Button to open bash code in terminal |
| 📥 **Download Code** | Save code blocks as files |
| 🔌 **Connection Status** | Green/red dot based on internet |
| 🔑 **API Management** | "Api" button to configure keys |

## How to Use

| Action | How |
|--------|-----|
| Open/close widget | `Super + ñ` |
| Send message | `Enter` |
| New line | `Shift + Enter` |
| Stop generation | `Escape` or ⏹ button |
| Change model | Click model name (top right) |
| Configure API | Click "Api" button in header |

## Requirements

| Dependency | Why | Auto-installed |
|------------|-----|----------------|
| Python 3.10+ | Widget runtime | ✅ |
| PyGObject (GTK3, WebKit2) | Widget rendering | ✅ |
| Hyprland | Window manager | ❌ (required) |
| git | Download project | ✅ |

> The installer auto-detects your distro and installs missing dependencies.

## Installation Methods

### Method 1: One-liner (Recommended)
```bash
curl -sSL https://raw.githubusercontent.com/jephersonRD/Kara_AI/main/installer.sh | bash
```

### Method 2: Manual Download
```bash
wget https://raw.githubusercontent.com/jephersonRD/Kara_AI/main/installer.sh
chmod +x installer.sh
./installer.sh
```

### Method 3: Git Clone
```bash
git clone https://github.com/jephersonRD/Kara_AI.git
cd Kara_AI
chmod +x installer.sh
./installer.sh
```

## Supported Distros

- **Arch Linux** (and derivatives: Manjaro, EndeavourOS, Garuda)
- **Ubuntu/Debian** (and derivatives: Pop!_OS, Linux Mint, Zorin)
- **Fedora** (and derivatives: Nobara)
- **openSUSE** (Tumbleweed, Leap)
- **Void Linux**

## FAQ

### ¿Cómo obtengo API keys gratis?
- **Groq**: https://console.groq.com/keys (gratis, sin límites de prueba)
- **Gemini**: https://aistudio.google.com/api-keys (gratis)
- **OpenRouter**: https://openrouter.ai/keys (modelos gratuitos disponibles)

### Where do I get free API keys?
- **Groq**: https://console.groq.com/keys (free, no trial limits)
- **Gemini**: https://aistudio.google.com/api-keys (free)
- **OpenRouter**: https://openrouter.ai/keys (free models available)

### ¿El atajo Super+ñ no funciona?
Asegúrate de que Hyprland esté corriendo y recarga la configuración:
```bash
hyprctl reload
```

### Why Super+ñ doesn't work?
Make sure Hyprland is running and reload the config:
```bash
hyprctl reload
```

### ¿Cómo desinstalar?
Usa el instalador y selecciona "Eliminar" (opción 3):
```bash
./installer.sh
```

### How to uninstall?
Use the installer and select "Remove" (option 3):
```bash
./installer.sh
```

## Project Structure

```
Kara_AI/
├── installer.sh          # Installation script
├── scripts/
│   ├── kara-widget.py    # Main widget
│   ├── kara-toggle.sh    # Toggle script
│   └── setup-hyprland.sh # Hyprland config
├── src/
│   ├── index.html        # UI interface
│   ├── script.js         # JavaScript logic
│   ├── style.css         # Styles
│   └── config.json       # Config (auto-created)
├── Assets/               # Images & screenshots
├── LICENSE               # MIT License
└── README.md             # This file
```

## Contributing

Contributions welcome! Feel free to:
- Open an [Issue](https://github.com/jephersonRD/Kara_AI/issues)
- Submit a [Pull Request](https://github.com/jephersonRD/Kara_AI/pulls)
- Star the repo if you find it useful

## Alternatives

Looking for similar tools? Check out:
- **[ChatGPT Desktop](https://github.com/lencx/ChatGPT)** - Electron-based
- **[GPT4All](https://github.com/nomic-ai/gpt4all)** - Local models
- **[Ollama](https://github.com/ollama/ollama)** - Run LLMs locally

**Kara AI** is different because:
- ✨ Native GTK app (not Electron)
- ⚡ Ultra-fast inference with Groq
- 🎯 Made specifically for Hyprland
- 💰 Uses free API tiers

## License

[MIT](LICENSE) © 2024 [jephersonRD](https://github.com/jephersonRD)

---

<div align="center">

**⭐ Star this repo if you find it useful! ⭐**

[![GitHub Stars](https://img.shields.io/github/stars/jephersonRD/Kara_AI?style=social)](https://github.com/jephersonRD/Kara_AI)
[![GitHub Watchers](https://img.shields.io/github/watchers/jephersonRD/Kara_AI?style=social)](https://github.com/jephersonRD/Kara_AI)

Made with ❤️ for the Linux community

</div>
