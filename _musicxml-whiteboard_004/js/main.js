/* js/main.js */

window.addEventListener('load', () => {
    if (typeof updateWorkspaceSize === 'function') updateWorkspaceSize();

    const wrapper = document.getElementById('workspace-wrapper');
    if (wrapper && typeof WORKSPACE_CENTER_Y !== 'undefined') {
        wrapper.scrollTop = WORKSPACE_CENTER_Y - (window.innerHeight / 2);
    }

    if (typeof drawTimeline === 'function') drawTimeline();
    if (typeof updateVisualLegend === 'function') updateVisualLegend();

    if (typeof saveHistoryState === 'function') saveHistoryState();
    
    const exportPdfBtn = document.getElementById('export-pdf-btn');
    if (exportPdfBtn) exportPdfBtn.addEventListener('click', exportToPDF);
    
    const saveProjectBtn = document.getElementById('save-project-btn');
    if (saveProjectBtn) saveProjectBtn.addEventListener('click', saveProject);

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
    }

    if (hideSmallTicksCheckbox) {
        hideSmallTicksCheckbox.addEventListener('change', drawTimeline);
    }

    const closeLegendBtn = document.getElementById('close-legend-modal');
    if (closeLegendBtn) {
        closeLegendBtn.addEventListener('click', () => {
            const modal = document.getElementById('legend-modal');
            if (modal) modal.style.display = 'none';
        });
    }

    const closeSymbolsBtn = document.getElementById('close-symbols-modal');
    if (closeSymbolsBtn) {
        closeSymbolsBtn.addEventListener('click', () => {
            symbolsModal.style.display = 'none';
        });
    }

    console.log("MusicXML Whiteboard Pro avviato correttamente.");
});