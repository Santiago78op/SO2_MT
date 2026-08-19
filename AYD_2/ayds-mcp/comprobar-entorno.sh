#!/usr/bin/env bash
#
# comprobar-entorno.sh — chequeo previo para correr tutor-ayds en macOS.
#
# Verifica todo lo que el servidor necesita y, si algo falta, te dice exactamente
# que hacer. Al final imprime el comando de `claude mcp add` y el JSON de Claude
# Desktop YA COMPLETADOS con tus rutas reales, para copiar y pegar.
#
# Uso:
#   bash comprobar-entorno.sh /ruta/a/tu/boveda
#   bash comprobar-entorno.sh            (usa $VAULT_PATH si ya esta definida)
#
# Escrito para bash 3.2, que es el que trae macOS de fabrica.

set -u

# --- Colores (se desactivan si la salida no es una terminal) ---
if [ -t 1 ]; then
  ROJO=$'\033[31m'; VERDE=$'\033[32m'; AMARILLO=$'\033[33m'; NEGRITA=$'\033[1m'; FIN=$'\033[0m'
else
  ROJO=''; VERDE=''; AMARILLO=''; NEGRITA=''; FIN=''
fi

FALLAS=0
AVISOS=0

ok()    { printf "  %sOK%s     %s\n" "$VERDE" "$FIN" "$1"; }
falla() { printf "  %sFALLA%s  %s\n" "$ROJO" "$FIN" "$1"; FALLAS=$((FALLAS + 1)); }
aviso() { printf "  %sAVISO%s  %s\n" "$AMARILLO" "$FIN" "$1"; AVISOS=$((AVISOS + 1)); }
ayuda() { printf "         -> %s\n" "$1"; }
titulo(){ printf "\n%s%s%s\n" "$NEGRITA" "$1" "$FIN"; }

# La carpeta donde vive este script = raiz del proyecto.
PROYECTO="$(cd "$(dirname "$0")" && pwd)"

# Detectamos la plataforma REAL en la que se esta corriendo. El script esta pensado
# para macOS, pero si lo corres en otro lado conviene que los chequeos se adapten
# en vez de reportar fallas falsas.
case "$(uname -s)" in
  Darwin) ES_MAC=1; SO_NODE="darwin" ;;
  Linux)  ES_MAC=0; SO_NODE="linux" ;;
  MINGW*|MSYS*|CYGWIN*) ES_MAC=0; SO_NODE="win32" ;;
  *)      ES_MAC=0; SO_NODE="desconocido" ;;
esac

printf "%s=== Chequeo de entorno para tutor-ayds ===%s\n" "$NEGRITA" "$FIN"
printf "Proyecto: %s\n" "$PROYECTO"
printf "Sistema:  %s\n" "$(uname -s) $(uname -m)"
if [ "$ES_MAC" -eq 0 ]; then
  printf "%sNota: este script esta pensado para macOS. Los chequeos se adaptan a tu sistema,\n" "$AMARILLO"
  printf "pero los avisos sobre permisos y Claude Desktop son especificos de Mac.%s\n" "$FIN"
fi

# ---------------------------------------------------------------------------
titulo "1. Node.js"
# ---------------------------------------------------------------------------

if ! command -v node >/dev/null 2>&1; then
  falla "node no esta instalado (o no esta en el PATH)"
  ayuda "Instalalo con Homebrew:  brew install node"
  ayuda "O con nvm:               nvm install 22"
else
  NODE_BIN="$(command -v node)"
  NODE_VER="$(node -p 'process.versions.node')"
  NODE_MAYOR="$(node -p 'process.versions.node.split(".")[0]')"
  NODE_ARCH="$(node -p 'process.arch')"

  ok "node encontrado en $NODE_BIN"

  if [ "$NODE_MAYOR" -ge 20 ]; then
    ok "version $NODE_VER (se necesita >= 20)"
  else
    falla "version $NODE_VER — el SDK MCP v2 necesita Node >= 20"
    ayuda "Actualizalo:  brew upgrade node   (o  nvm install 22 && nvm use 22)"
  fi

  if [ "$NODE_ARCH" = "arm64" ]; then
    ok "arquitectura arm64 (nativo en el M5)"
  else
    aviso "arquitectura $NODE_ARCH — no es arm64 nativo"
    ayuda "Funciona igual bajo Rosetta, pero conviene un Node arm64. Reinstalalo con Homebrew nativo."
  fi
fi

if ! command -v npm >/dev/null 2>&1; then
  falla "npm no esta instalado"
else
  ok "npm $(npm -v)"
fi

# ---------------------------------------------------------------------------
titulo "2. Dependencias del proyecto"
# ---------------------------------------------------------------------------

if [ ! -d "$PROYECTO/node_modules" ]; then
  falla "no existe node_modules/"
  ayuda "Corre:  cd \"$PROYECTO\" && npm install"
else
  ok "node_modules/ existe"

  # Las dependencias de RUNTIME son JavaScript puro, asi que son portables.
  # El compilador de TypeScript 7, en cambio, trae un BINARIO POR PLATAFORMA.
  # Si copiaste node_modules desde Windows, aca vas a tener el binario de Windows
  # y ninguno de macOS: por eso hay que correr npm install en el Mac.
  if [ -d "$PROYECTO/node_modules/@modelcontextprotocol/server" ]; then
    ok "@modelcontextprotocol/server instalado"
  else
    falla "falta @modelcontextprotocol/server"
    ayuda "Corre:  npm install"
  fi

  # El compilador que ESTA plataforma necesita. Node ya nos dijo su arquitectura.
  ARCH_NODE="$(node -p 'process.arch' 2>/dev/null || echo desconocido)"
  ESPERADO="@typescript/typescript-${SO_NODE}-${ARCH_NODE}"

  if [ -d "$PROYECTO/node_modules/$ESPERADO" ]; then
    ok "compilador de TypeScript para $SO_NODE-$ARCH_NODE presente"
  else
    # Buscamos que binario SI hay, para poder explicar el problema.
    OTRO="$(ls -d "$PROYECTO"/node_modules/@typescript/typescript-* 2>/dev/null | head -1)"
    if [ -n "$OTRO" ]; then
      falla "falta $ESPERADO; el que esta instalado es $(basename "$OTRO")"
      ayuda "node_modules viene de otra maquina/plataforma. Borralo y reinstala:"
      ayuda "cd \"$PROYECTO\" && rm -rf node_modules && npm install"
    else
      aviso "no encuentro ningun binario del compilador de TypeScript"
      ayuda "Si 'npm run build' falla, corre:  rm -rf node_modules && npm install"
    fi
    ayuda "Solo afecta a COMPILAR. El servidor ya compilado corre en cualquier plataforma:"
    ayuda "sus dependencias de runtime (MCP y zod) son JavaScript puro."
  fi
fi

# ---------------------------------------------------------------------------
titulo "3. Compilacion"
# ---------------------------------------------------------------------------

EJECUTABLE="$PROYECTO/dist/src/index.js"

if [ ! -f "$EJECUTABLE" ]; then
  falla "no existe dist/src/index.js (el proyecto no esta compilado)"
  ayuda "Corre:  cd \"$PROYECTO\" && npm run build"
else
  ok "dist/src/index.js existe"
  # Si el fuente es mas nuevo que el compilado, el build quedo viejo.
  if [ "$PROYECTO/src/index.ts" -nt "$EJECUTABLE" ]; then
    aviso "src/index.ts es mas nuevo que dist/src/index.js"
    ayuda "Recompila:  npm run build"
  else
    ok "la compilacion esta al dia"
  fi
fi

# ---------------------------------------------------------------------------
titulo "4. La boveda (VAULT_PATH)"
# ---------------------------------------------------------------------------

# La ruta puede venir como argumento o en la variable de entorno.
BOVEDA="${1:-${VAULT_PATH:-}}"

if [ -z "$BOVEDA" ]; then
  falla "no me pasaste la ruta de la boveda"
  ayuda "Corre:  bash comprobar-entorno.sh /ruta/a/tu/boveda"
else
  if [ ! -d "$BOVEDA" ]; then
    falla "la ruta no existe o no es una carpeta: $BOVEDA"
  else
    # Ruta absoluta y real (resolviendo symlinks), que es la que hay que poner
    # en la configuracion del cliente.
    BOVEDA_ABS="$(cd "$BOVEDA" && pwd -P)"
    ok "boveda encontrada: $BOVEDA_ABS"

    # Estructura minima que el servidor espera.
    for CARPETA in 01-Notas 02-Diagramas 04-Flashcards 05-Quizzes; do
      if [ -d "$BOVEDA_ABS/$CARPETA" ]; then
        ok "existe $CARPETA/"
      else
        aviso "falta $CARPETA/"
        ayuda "El servidor no se cae, pero las herramientas de esa carpeta van a devolver vacio."
      fi
    done

    if [ -f "$BOVEDA_ABS/03-Glosario.md" ]; then
      ok "existe 03-Glosario.md"
    else
      aviso "falta 03-Glosario.md — la herramienta glosario() va a fallar"
    fi

    # Cuantas notas hay.
    if [ -d "$BOVEDA_ABS/01-Notas" ]; then
      CUANTAS=$(find "$BOVEDA_ABS/01-Notas" -maxdepth 1 -name '*.md' | wc -l | tr -d ' ')
      if [ "$CUANTAS" -gt 0 ]; then
        ok "$CUANTAS notas en 01-Notas/"
      else
        aviso "01-Notas/ esta vacia"
      fi
    fi

    # progreso.md todavia puede no existir: lo crea registrar_resultado.
    if [ -f "$BOVEDA_ABS/05-Quizzes/progreso.md" ]; then
      ok "05-Quizzes/progreso.md existe"
    else
      ok "05-Quizzes/progreso.md aun no existe (lo crea registrar_resultado en su primera llamada)"
    fi

    # Permisos de macOS: si la boveda esta en Documents, Desktop, Downloads o
    # iCloud, la primera vez el sistema puede pedir autorizacion de acceso.
    if [ "$ES_MAC" -eq 1 ]; then
      case "$BOVEDA_ABS" in
        */Documents/*|*/Desktop/*|*/Downloads/*|*Mobile\ Documents*)
          aviso "la boveda esta en una carpeta protegida por macOS (Documents/Desktop/Downloads/iCloud)"
          ayuda "La primera vez, macOS puede pedirle permiso a Claude para acceder. Aceptalo."
          ayuda "Si falla en silencio: Ajustes > Privacidad y seguridad > Archivos y carpetas."
          ;;
      esac
      case "$BOVEDA_ABS" in
        *Mobile\ Documents*)
          aviso "la boveda parece estar en iCloud Drive"
          ayuda "iCloud puede descargar archivos por demanda y hacer que una lectura falle."
          ayuda "Para un servidor MCP conviene una carpeta local, fuera de iCloud."
          ;;
      esac
    fi
  fi
fi

# ---------------------------------------------------------------------------
titulo "5. Cliente MCP"
# ---------------------------------------------------------------------------

if command -v claude >/dev/null 2>&1; then
  ok "el CLI de Claude Code esta instalado ($(command -v claude))"
else
  aviso "no encuentro el CLI 'claude' en el PATH"
  ayuda "Solo hace falta si vas a usar Claude Code. Para Claude Desktop no es necesario."
fi

CONFIG_DESKTOP="$HOME/Library/Application Support/Claude/claude_desktop_config.json"
if [ -f "$CONFIG_DESKTOP" ]; then
  ok "existe la configuracion de Claude Desktop"
else
  aviso "no existe $CONFIG_DESKTOP"
  ayuda "Se crea al abrir Claude Desktop por primera vez, o podes crearlo a mano."
fi

# ---------------------------------------------------------------------------
titulo "RESULTADO"
# ---------------------------------------------------------------------------

printf "  %s fallas, %s avisos\n" "$FALLAS" "$AVISOS"

if [ "$FALLAS" -gt 0 ]; then
  printf "\n%sHay fallas que impiden que el servidor funcione. Resolvelas y volve a correr este script.%s\n\n" "$ROJO" "$FIN"
  exit 1
fi

# ---------------------------------------------------------------------------
# Si todo esta bien, imprimimos los comandos listos para copiar.
# ---------------------------------------------------------------------------

if [ -n "${BOVEDA_ABS:-}" ] && [ -f "$EJECUTABLE" ]; then
  NODE_ABS="$(command -v node)"

  titulo "Probalo primero sin conectar nada"
  cat <<FIN_BLOQUE
  cd "$PROYECTO"
  npm run verificar
  VAULT_PATH="$BOVEDA_ABS" npm run demo
FIN_BLOQUE

  titulo "Conectarlo a Claude Code"
  cat <<FIN_BLOQUE
  claude mcp add tutor-ayds \\
    --env VAULT_PATH="$BOVEDA_ABS" \\
    -- "$NODE_ABS" "$EJECUTABLE"
FIN_BLOQUE

  titulo "Conectarlo a Claude Desktop"
  printf "  Pegá esto en %s\n" "$CONFIG_DESKTOP"
  printf "  (si el archivo ya tiene otros servidores, agregá solo la parte de \"tutor-ayds\")\n\n"
  cat <<FIN_BLOQUE
{
  "mcpServers": {
    "tutor-ayds": {
      "command": "$NODE_ABS",
      "args": ["$EJECUTABLE"],
      "env": {
        "VAULT_PATH": "$BOVEDA_ABS"
      }
    }
  }
}
FIN_BLOQUE

  printf "\n  Ojo: la ruta de node esta escrita completa a proposito. Claude Desktop no\n"
  printf "  hereda el PATH de la terminal, asi que poner solo \"node\" no funciona.\n"
  printf "  Despues de editar el JSON, salí de Claude Desktop del todo y volvé a abrirlo.\n\n"
fi
