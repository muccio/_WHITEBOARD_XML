/* js/main.js */

window.addEventListener('load', () => {
    // 1. Inizializza le dimensioni del workspace
    if (typeof updateWorkspaceSize === 'function') updateWorkspaceSize();

    // 2. Centra la visuale sulla linea del tempo
    const wrapper = document.getElementById('workspace-wrapper');
    if (wrapper && typeof WORKSPACE_CENTER_Y !== 'undefined') {
        wrapper.scrollTop = WORKSPACE_CENTER_Y - (window.innerHeight / 2);
    }

    // 3. Disegna timeline e legenda iniziali
    if (typeof drawTimeline === 'function') drawTimeline();
    if (typeof updateVisualLegend === 'function') updateVisualLegend();

    // 4. Salva lo stato iniziale (vuoto) nella cronologia
    if (typeof saveHistoryState === 'function') saveHistoryState();
    
    // 5. COLLEGA GLI EVENTI AI PULSANTI DI I/O
    const exportPdfBtn = document.getElementById('export-pdf-btn');
    if (exportPdfBtn) exportPdfBtn.addEventListener('click', exportToPDF);
    
    const saveProjectBtn = document.getElementById('save-project-btn');
    if (saveProjectBtn) saveProjectBtn.addEventListener('click', saveProject);

    // Gestione Caricamento Progetto
    const triggerLoadBtn = document.getElementById('trigger-load-btn');
    const loadProjectInput = document.getElementById('load-project-input');

    if (triggerLoadBtn && loadProjectInput) {
        triggerLoadBtn.addEventListener('click', () => {
            loadProjectInput.click();
        });

        loadProjectInput.addEventListener('change', (e) => {
            if (typeof loadProject === 'function') {
                loadProject(e);
            }
        });
    } else {
        console.error("Errore: Elementi di caricamento non trovati nell'HTML (trigger-load-btn o load-project-input)");
    }

    // Chiusura Modal Legenda
    const closeLegendBtn = document.getElementById('close-legend-modal');
    if (closeLegendBtn) {
        closeLegendBtn.addEventListener('click', () => {
            const modal = document.getElementById('legend-modal');
            if (modal) modal.style.display = 'none';
        });
    }

    console.log("MusicXML Whiteboard Pro avviato correttamente.");
});