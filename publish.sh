#!/bin/bash

# 1. Controllo Autenticazione e configurazione Git
if ! gh auth status >/dev/null 2>&1; then
    echo "🔐 Non sei autenticato. Avvio login..."
    gh auth login
else
    echo "✅ Autenticazione GitHub CLI verificata."
fi

# Forza Git a usare le credenziali della GitHub CLI (Risolve il problema del push)
gh auth setup-git
echo "✅ Git configurato per usare le credenziali CLI."

# 2. Imposta il nome del repository
REPO_NAME=${1:-$(basename "$PWD")}

# 3. Inizializzazione Git locale
if [ ! -d ".git" ]; then
    git init -b main
    echo "✅ Git inizializzato localmente."
fi

# 4. Creazione file README.md (se non esiste)
if [ ! -f "README.md" ]; then
    echo "# $REPO_NAME" > README.md
    echo "Repository privato creato via terminale macOS." >> README.md
    echo "✅ README.md creato."
fi

# 5. Creazione .gitignore (per macOS)
if [ ! -f ".gitignore" ]; then
    printf ".DS_Store\n.vscode/\nnode_modules/\n" > .gitignore
    echo "✅ .gitignore creato."
fi

# 6. Stage e Commit
git add .
git commit -m "Initial commit"

# 7. Creazione repo PRIVATO e PUSH
echo "🌐 Creazione repository PRIVATO su GitHub e invio file..."
# Usiamo --source=. per indicare questa cartella e --push per l'invio immediato
gh repo create "$REPO_NAME" --private --source=. --remote=origin --push

echo "------------------------------------------------"
if [ $? -eq 0 ]; then
    echo "🎉 Successo! Il tuo codice è online (Privato)."
    echo "🔗 Link: https://github.com(gh api user -q .login)/$REPO_NAME"
else
    echo "❌ Errore durante il push. Verifica la connessione o i permessi."
fi
