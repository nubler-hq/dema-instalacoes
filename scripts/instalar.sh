#!/usr/bin/env bash
echo "PASSO 1: PATH=$PATH"
echo "PASSO 2: VERIFICANDO BREW"
which brew 2>&1 || echo "brew not found"
echo "PASSO 3: VERIFICANDO HIMALAYA"
which himalaya 2>&1 || echo "himalaya not found"
echo "FIM"
