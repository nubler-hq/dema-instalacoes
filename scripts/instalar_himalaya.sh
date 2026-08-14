#!/usr/bin/env bash
export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:$HOME/.local/bin"

echo "=== VERIFICANDO HIMALAYA ==="
if command -v himalaya &>/dev/null; then
    echo "Himalaya já está instalado: $(himalaya --version)"
else
    echo "Himalaya não encontrado. Instalando via Homebrew..."
    brew install himalaya 2>&1
    echo "=== RESULTADO DA INSTALAÇÃO ==="
    command -v himalaya && himalaya --version || echo "Falha na instalação"
fi

echo "=== VERIFICANDO CONFIG DIR ==="
mkdir -p "$HOME/.config/himalaya"
ls -la "$HOME/.config/himalaya/"

echo "=== FIM ==="
