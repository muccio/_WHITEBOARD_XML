# MusicXML Whiteboard Pro 3D - macOS Application

Versione nativa per macOS di **MusicXML Whiteboard Pro 3D**, strutturata con Swift, SwiftUI, AppKit e WebKit, con server HTTP locale integrato a zero dipendenze esterne.

---

## 🚀 Caratteristiche della versione macOS

1. **Architettura Universal Binary (Apple Silicon + Intel)**:
   - Compilata nativamente sia per architetture `arm64` (M1/M2/M3/M4) che per `x86_64` (Intel).
   - Richiede macOS 13.0 (Ventura) o superiore.
   - Dimensioni minime (~8 MB) rispetto a pesanti runtime come Electron (>250 MB).

2. **Server HTTP Locale Integrato (`EmbeddedWebServer`)**:
   - Server puro Swift basato su `Network.framework` (`NWListener`) in ascolto unicamente su `127.0.0.1`.
   - Garantisce piena conformità alle API moderne del browser (Web Audio API, Canvas, Three.js WebGL per la vista 3D a strati, salvataggio Blob, e comunicazione finestre) senza problemi di permessi o restrizioni `file://`.
   - Tutti gli asset web (`index.html`, `audio-tool.html`, `manuale.html`, `view3d.html`, cartelle `css`, `js`, `vendor`, `esempi`, `icons`) sono inclusi e autonomi dentro il bundle dell'app: non è richiesta alcuna connessione a Internet.

3. **Multi-Finestra e Popup Nativi**:
   - Aprendo il **Visualizzatore 3D** (`view3d.html`), l'**Audio Visualizer** (`audio-tool.html`) o il **Manuale Utente** (`manuale.html`), l'app crea finestre macOS native separate, centrate, con tema scuro e ridimensionabili.

4. **Integrazione di Sistema e Scorciatoie da Tastiera**:
   - **File -> Apri... (`⌘O`)**: Apre un selettore nativo macOS per caricare file MusicXML (`.xml`, `.musicxml`, `.mxl`) o progetti Whiteboard (`.json`).
   - **File -> Salva Progetto (`⌘S`)**: Esporta e salva il file `.json` del progetto.
   - **File -> Esporta PDF... (`⇧⌘E`)**: Avvia la generazione e il salvataggio del PDF multipagina/multitraccia.
   - **Modifica -> Annulla (`⌘Z`)** / **Ripristina (`⇧⌘Z`)**: Gestione dello storico modifiche.
   - **Visualizza -> Visualizzatore 3D (`⌘3`)**: Apre direttamente la finestra 3D.
   - **Visualizza -> Audio Visualizer (`⇧⌘A`)**: Apre l'analizzatore FFT e forme d'onda.
   - **Visualizza -> Manuale Utente (`⌘?`)**: Apre la documentazione.
   - **Visualizza -> Zoom (`⌘+`, `⌘-`, `⌘0`)**: Controlli rapidi dello zoom dello spartito.
   - **Drag & Drop**: Puoi trascinare direttamente qualsiasi file MusicXML o `.json` da Finder sulla finestra dell'applicazione.

---

## 🛠️ Struttura della directory `macos/`

```
macos/
├── MusicXMLWhiteboard/
│   ├── App/
│   │   ├── MusicXMLWhiteboardApp.swift    # Entry point SwiftUI, gestione scene e menu nativi
│   │   └── AppDelegate.swift              # Ciclo di vita app e apertura file esterni
│   ├── Web/
│   │   ├── EmbeddedWebServer.swift        # HTTP server locale su 127.0.0.1 (Network.framework)
│   │   ├── WebViewController.swift        # Controller WKWebView, drag&drop, salvataggi e bridge
│   │   └── SecondaryWebWindowController.swift # Finestre popup native per 3D, Audio e Manuale
│   ├── Resources/
│   │   ├── Assets.xcassets/               # Icone app macOS ad alta risoluzione
│   │   ├── AppIcon.icns                   # Icona standalone macOS
│   │   └── web/                           # Copia offline completa degli asset web
│   └── Info.plist                         # Tipi di file associati, networking locale, tema
├── tools/
│   └── generate_icons.sh                  # Script per ricreare le icone a tutte le risoluzioni
├── project.yml                            # Specifica XcodeGen
├── MusicXMLWhiteboard.xcodeproj           # Progetto Xcode generato
├── build.sh                               # Script di compilazione release universal
├── package.sh                             # Script per creare .app, .zip e .dmg
├── dist/                                  # Pacchetti pronti per la distribuzione
│   ├── MusicXML Whiteboard.app
│   ├── MusicXML-Whiteboard-1.0.0-macOS-universal.zip
│   └── MusicXML-Whiteboard-1.0.0-macOS-universal.dmg
└── README.md
```

---

## 📦 Come compilare e distribuire

### 1. Compilare l'applicazione
Dalla cartella `macos/`, esegui:
```bash
./build.sh
```
Questo script:
1. Sincronizza automaticamente gli ultimi file web da `_musicxml-whiteboard/` in `Resources/web/`.
2. Rigenera il progetto Xcode con `xcodegen` (se installato).
3. Compila il binario universale (`arm64` + `x86_64`) in `build/Build/Products/Release/MusicXML Whiteboard.app`.

### 2. Creare i pacchetti (.zip e .dmg)
Dalla cartella `macos/`, esegui:
```bash
./package.sh
```
I file finali per l'utente o il rilascio saranno salvati nella cartella `macos/dist/`:
- `MusicXML Whiteboard.app`
- `MusicXML-Whiteboard-1.0.0-macOS-universal.zip`
- `MusicXML-Whiteboard-1.0.0-macOS-universal.dmg`

### 3. Avviare l'applicazione
Puoi aprire direttamente l'app compilata con:
```bash
open "macos/dist/MusicXML Whiteboard.app"
```
oppure trascinare `MusicXML Whiteboard.app` nella cartella `/Applications`.
