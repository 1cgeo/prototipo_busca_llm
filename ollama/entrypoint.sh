#!/bin/bash
sudo chmod +x /entrypoint.sh 
set -e

echo "Iniciando entrypoint.sh..."

echo "Iniciando servidor Ollama..."
/bin/ollama serve &

# Record Process ID.
pid=$!

sleep 5

echo "Executando ollama run phi4:14b"
ollama pull phi4:14b
echo "Download do modelo phi4:14b concluído."

wait $pid
