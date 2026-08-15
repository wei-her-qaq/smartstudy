#!/bin/bash
DIR="$(cd "$(dirname "$0")" && pwd)"
if [ "$(id -u)" -eq 0 ]; then
    chown root:root "$DIR/chrome-sandbox" 2>/dev/null
    chmod 4755 "$DIR/chrome-sandbox" 2>/dev/null
fi
if [ -w "$DIR/chrome-sandbox" ] && [ "$(stat -c '%a' "$DIR/chrome-sandbox" 2>/dev/null)" != "4755" ]; then
    echo "正在修复 chrome-sandbox 权限..."
    sudo chown root:root "$DIR/chrome-sandbox" 2>/dev/null
    sudo chmod 4755 "$DIR/chrome-sandbox" 2>/dev/null
fi
exec "$DIR/smartstudy" "$@"