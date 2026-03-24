#!/usr/bin/env python3
"""Kara AI — Widget para Hyprland"""

import gi
gi.require_version('Gtk', '3.0')
gi.require_version('WebKit2', '4.0')
from gi.repository import Gtk, Gdk, WebKit2, GLib
import os, signal, subprocess, json, time, threading
import urllib.parse
import http.server
import socketserver
import webbrowser

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
SRC_DIR = os.path.join(os.path.dirname(SCRIPT_DIR), 'src')
CONFIG_PATH = os.path.join(SRC_DIR, 'config.json')

HTTP_PORT = 18234


def load_config():
    try:
        with open(CONFIG_PATH, 'r') as f:
            return json.load(f)
    except Exception:
        return {"gemini": "", "groq": "", "openrouter": ""}


def save_config(data):
    try:
        with open(CONFIG_PATH, 'w') as f:
            json.dump(data, f, indent=2)
        return True
    except Exception:
        return False


def get_screen_size():
    try:
        r = subprocess.run(['hyprctl', 'monitors', '-j'],
                           capture_output=True, text=True, timeout=3)
        m = json.loads(r.stdout)[0]
        return m['width'], m['height']
    except Exception:
        return 1366, 768


def run_command_in_terminal(cmd):
    terminals = [
        ('kitty', ['kitty', '--detach', 'sh', '-c', f'{cmd}; echo ""; echo "--- Presiona Enter ---"; read']),
        ('alacritty', ['alacritty', '-e', 'sh', '-c', f'{cmd}; echo ""; echo "--- Presiona Enter ---"; read']),
        ('wezterm', ['wezterm', 'start', '--', 'sh', '-c', f'{cmd}; echo ""; echo "--- Presiona Enter ---"; read']),
        ('foot', ['foot', 'sh', '-c', f'{cmd}; echo ""; echo "--- Presiona Enter ---"; read']),
        ('ghostty', ['ghostty', '-e', 'sh', '-c', f'{cmd}; echo ""; echo "--- Presiona Enter ---"; read']),
        ('xfce4-terminal', ['xfce4-terminal', '-e', f"sh -c '{cmd}; echo; echo \"--- Presiona Enter ---\"; read'"]),
        ('gnome-terminal', ['gnome-terminal', '--', 'sh', '-c', f'{cmd}; echo ""; echo "--- Presiona Enter ---"; read']),
        ('xterm', ['xterm', '-e', 'sh', '-c', f'{cmd}; echo ""; echo "--- Presiona Enter ---"; read']),
    ]
    for name, args in terminals:
        if subprocess.run(['which', name], capture_output=True).returncode == 0:
            subprocess.Popen(args, start_new_session=True)
            return
    try:
        subprocess.run(['wl-copy'], input=cmd.encode(), timeout=2)
    except Exception:
        pass


def hypr_dispatch(*args):
    subprocess.run(['hyprctl', 'dispatch'] + list(args),
                   capture_output=True, timeout=3)


def apply_rules():
    time.sleep(1)
    try:
        r = subprocess.run(['hyprctl', 'clients', '-j'],
                           capture_output=True, text=True, timeout=3)
        for c in json.loads(r.stdout):
            if c.get('title') == 'kara-ai-widget':
                addr = c['address']
                hypr_dispatch('togglefloating', f'address:{addr}')
                time.sleep(0.2)
                hypr_dispatch('pin', f'address:{addr}')
                hypr_dispatch('focuswindow', f'address:{addr}')
                time.sleep(0.2)
                for _ in range(20):
                    hypr_dispatch('movewindow', 'l')
                for _ in range(20):
                    hypr_dispatch('movewindow', 'u')
                break
    except Exception:
        pass


class ConfigHandler(http.server.BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        pass

    def _cors_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')

    def do_OPTIONS(self):
        self.send_response(200)
        self._cors_headers()
        self.end_headers()

    def do_GET(self):
        if self.path == '/api/config':
            config = load_config()
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self._cors_headers()
            self.end_headers()
            self.wfile.write(json.dumps(config).encode())
        else:
            self.send_response(404)
            self.end_headers()

    def do_POST(self):
        if self.path == '/api/config':
            length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(length)
            try:
                data = json.loads(body)
                if save_config(data):
                    self.send_response(200)
                    self.send_header('Content-Type', 'application/json')
                    self._cors_headers()
                    self.end_headers()
                    self.wfile.write(b'{"ok":true}')
                else:
                    raise Exception("write failed")
            except Exception:
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self._cors_headers()
                self.end_headers()
                self.wfile.write(b'{"ok":false}')
        else:
            self.send_response(404)
            self.end_headers()


def start_http_server():
    server = socketserver.TCPServer(('127.0.0.1', HTTP_PORT), ConfigHandler)
    server.serve_forever()


def main():
    os.environ['GDK_BACKEND'] = 'x11'
    signal.signal(signal.SIGINT, signal.SIG_DFL)

    # Leer config y preparar inyección JS
    config = load_config()
    config_js = f"window.__KARA_CONFIG__ = {json.dumps(config)};"

    # Iniciar servidor HTTP para guardar keys
    http_thread = threading.Thread(target=start_http_server, daemon=True)
    http_thread.start()

    sw, sh = get_screen_size()
    win_w = 470
    win_h = 744

    win = Gtk.Window(title="kara-ai-widget")
    win.set_decorated(False)
    win.set_resizable(True)
    win.set_skip_taskbar_hint(True)
    win.set_skip_pager_hint(True)
    win.set_default_size(win_w, win_h)

    css = Gtk.CssProvider()
    css.load_from_data(b"window { background-color: #0a0a0f; }")
    Gtk.StyleContext.add_provider_for_screen(
        Gdk.Screen.get_default(), css,
        Gtk.STYLE_PROVIDER_PRIORITY_APPLICATION
    )

    wv = WebKit2.WebView()
    s = wv.get_settings()
    s.set_enable_developer_extras(True)
    s.set_javascript_can_access_clipboard(True)
    s.set_allow_file_access_from_file_urls(True)

    def on_decide_policy(view, decision, policy_type):
        if policy_type == WebKit2.PolicyDecisionType.NAVIGATION_ACTION:
            try:
                action = decision.get_navigation_action()
                uri = action.get_request().get_uri()
            except Exception:
                return
            
            if uri and uri.startswith('terminal://'):
                decision.ignore()
                cmd = urllib.parse.unquote(uri[len('terminal://'):])
                run_command_in_terminal(cmd)
                return
            
            if uri and (uri.startswith('http://') or uri.startswith('https://')):
                decision.ignore()
                webbrowser.open(uri)
                return

    wv.connect('decide-policy', on_decide_policy)

    def on_create_webview(view, action):
        uri = action.get_request().get_uri()
        if uri:
            webbrowser.open(uri)
        return None

    wv.connect('create', on_create_webview)

    def on_loaded(view, event):
        if event == WebKit2.LoadEvent.FINISHED:
            view.run_javascript(
                "document.body.classList.add('widget-mode');",
                None, None, None
            )

    wv.connect("load-changed", on_loaded)

    # Inyectar config ANTES de que se ejecute cualquier script de la página
    manager = wv.get_user_content_manager()
    manager.register_script_message_handler('kara')
    script = WebKit2.UserScript.new(
        config_js,
        WebKit2.UserContentInjectedFrames.ALL_FRAMES,
        WebKit2.UserScriptInjectionTime.START,
        None, None
    )
    manager.add_script(script)

    def on_script_message(user_content_manager, message):
        try:
            # Intentar obtener el string del mensaje
            msg = None
            if hasattr(message, 'get_string'):
                msg = message.get_string()
            elif hasattr(message, 'to_string'):
                msg = message.to_string()
            else:
                msg = str(message)
            
            if msg and 'close' in msg:
                Gtk.main_quit()
        except Exception as e:
            print(f"Error: {e}")

    manager.connect('script-message-received::kara', on_script_message)

    wv.load_uri(f"file://{os.path.join(SRC_DIR, 'index.html')}")

    win.add(wv)
    win.connect("destroy", Gtk.main_quit)
    win.connect("key-press-event",
                lambda w, e: Gtk.main_quit() if e.keyval == Gdk.KEY_Escape else None)

    win.show_all()

    threading.Thread(target=apply_rules, daemon=True).start()

    Gtk.main()


if __name__ == "__main__":
    main()
