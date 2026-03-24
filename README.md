<div align="center">

# Kara AI

<img src="Assets/3.jpg" alt="Kara AI Logo" width="200">

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

Kara AI es un **widget de escritorio** que te da acceso a ChatGPT, Gemini y otros modelos de IA **sin abrir el navegador**. Un simple atajo de teclado (`Super + ñ`) y ya puedes preguntar lo que necesite: un comando, un código, una duda rápida.

Pensado para **Hyprland** y usuarios de Linux que no quieren cambiar de ventana cada vez que necesitan ayuda de IA.

<img src="Assets/2.png" alt="Kara AI Preview" width="600">

## Instalación Rápida (Recomendado)

Con un solo comando puedes instalar Kara AI en tu sistema:

```bash
bash <(curl -sSL https://raw.githubusercontent.com/jephersonRD/Chat-Hyperland/main/installer.sh)
```

O descarga el script y ejecútalo manualmente:

```bash
wget https://raw.githubusercontent.com/jephersonRD/Chat-Hyperland/main/installer.sh
chmod +x installer.sh
./installer.sh
```

El instalador te permitirá:
- **Seleccionar idioma** (Español/Inglés)
- **Instalar** - Descarga el proyecto y configura todo automáticamente
- **Reparar** - Verifica y repara una instalación existente
- **Eliminar** - Borra completamente Kara AI de tu sistema

> **Nota:** El instalador detecta automáticamente tu distribución (Arch, Ubuntu, Fedora, etc.) e instala las dependencias necesarias.

## Proveedores de IA

| Proveedor | Modelos destacados | Velocidad | Gratis |
|-----------|-------------------|-----------|--------|
| **Groq** | Llama 3.3 70B, Qwen 3, GPT-OSS 120B | Muy rápida | Sí |
| **Google Gemini** | 2.5 Flash, 2.5 Pro, 2.0 Flash | Rápida | Sí |
| **OpenRouter** | Gemma 3 27B, GLM 4.5, Trinity Mini | Variable | Sí |

## Modelos de IA Disponibles

### Groq (Inferencia LPU - Ultra Rápida)

| Modelo | Descripción | Nivel |
|--------|-------------|-------|
| GPT-OSS 120B | OpenAI open-weight, máximo rendimiento | ⭐⭐⭐⭐⭐ |
| Llama 4 Maverick | 128 expertos, 128K contexto | ⭐⭐⭐⭐⭐ |
| Llama 4 Scout | MoE con visión, 128K contexto | ⭐⭐⭐⭐ |
| Qwen 3 32B | Razonamiento + tools | ⭐⭐⭐⭐ |
| Llama 3.3 70B | Versátil, 128K contexto (recomendado) | ⭐⭐⭐⭐ |
| Compound | Web search + código | ⭐⭐⭐ |
| Llama 3.1 8B | Ultra rápido y ligero | ⭐⭐⭐ |
| Compound Mini | Agente ligero | ⭐⭐ |

### Google Gemini

| Modelo | Descripción | Nivel |
|--------|-------------|-------|
| 2.5 Pro | Máxima capacidad | ⭐⭐⭐⭐⭐ |
| 2.5 Flash | Rápido y recomendado | ⭐⭐⭐⭐ |
| 2.0 Flash | Estable y eficiente | ⭐⭐⭐⭐ |
| Flash Lite | Ultra ligero | ⭐⭐⭐ |

### OpenRouter (Modelos Gratuitos)

| Modelo | Descripción | Nivel |
|--------|-------------|-------|
| Gemma 3 27B | Gratuito, 131K contexto | ⭐⭐⭐⭐ |
| Free Router | Auto-selección del mejor gratis | ⭐⭐⭐ |
| GLM 4.5 Air | Gratuito, 131K contexto | ⭐⭐⭐ |
| Step 3.5 Flash | Gratuito, 256K contexto | ⭐⭐⭐ |
| Trinity Mini | Gratuito, 131K contexto | ⭐⭐⭐ |
| Gemma 3 4B | Gratuito, ligero | ⭐⭐ |
| LFM 1.2B | Gratuito, ultra ligero | ⭐ |

## Capturas

<img src="Assets/1.png" alt="Kara AI Captura" width="600">

## Características

| Función | Descripción |
|---------|-------------|
| ⚡ Acceso rápido | `Super + ñ` abre/cierra el widget |
| 🎨 Tema dark/light | Alterna con un click, se guarda tu preferencia |
| 💬 Multi-conversación | Sidebar con historial de chats separados |
| ✏️ Editar mensajes | Click en tu mensaje para editarlo y reenviar |
| ⏹️ Detener generación | Botón rojo o `Escape` para cortar la respuesta |
| 📊 Stats en vivo | Tokens, mensajes y tiempo de conversación |
| 💯 Límite de mensajes | 100 mensajes por chat |
| 🖥️ Ejecutar código | Botón para abrir código bash en tu terminal |
| 📥 Descargar código | Guarda bloques de código como archivo |
| 🔌 Estado de conexión | Punto verde/rojo según tengas internet |
| 🔑 Gestión de API | Botón "Api" para configurar las claves |

## Uso

| Acción | Cómo |
|--------|------|
| Abrir/cerrar widget | `Super + ñ` |
| Enviar mensaje | `Enter` |
| Salto de línea | `Shift + Enter` |
| Detener generación | `Escape` o botón ⏹ |
| Cambiar modelo | Click en el nombre del modelo arriba a la derecha |
| Configurar API | Click en el botón "Api" en el header |

## Requisitos

| Dependencia | Motivo | Auto-instalado |
|-------------|--------|----------------|
| Python 3.10+ | Widget de escritorio | ✅ |
| PyGObject (GTK3, WebKit2) | Renderizado del widget | ✅ |
| Hyprland | Gestor de ventanas | ❌ (requerido) |
| git | Descargar proyecto | ✅ |

> El script de instalación detecta tu distribución e instala automáticamente las dependencias faltantes.

## Archivos del Repositorio

Para que el instalador funcione correctamente, estos archivos deben estar en el repositorio:

```
Chat-Hyperland/
├── installer.sh          # Script de instalación
├── scripts/
│   └── kara-widget.py    # Widget principal
├── src/
│   ├── index.html        # Interfaz
│   ├── script.js         # Lógica JavaScript
│   ├── style.css         # Estilos
│   └── config.json       # Configuración (se crea automáticamente)
├── Assets/               # Imágenes del README
└── README.md             # Este archivo
```

## Contribuir

Las contribuciones son bienvenidas. Abre un issue o un pull request.

## Licencia

[MIT](LICENSE)
