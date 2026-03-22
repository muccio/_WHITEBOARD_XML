/* js/main.js */

window.addEventListener('load', () => {
    if (typeof initTracks === 'function') initTracks();
    if (typeof updateWorkspaceSize === 'function') updateWorkspaceSize();

    const wrapper = document.getElementById('workspace-wrapper');
    if (wrapper) {
        const startY = (typeof tracks !== 'undefined' && tracks.length > 0) ? tracks[0].baseY : 2500;
        wrapper.scrollTop = startY - (window.innerHeight / 2);
    }

    if (typeof drawTimeline === 'function') drawTimeline();
    if (typeof updateVisualLegend === 'function') updateVisualLegend();
    if (typeof saveHistoryState === 'function') saveHistoryState();
    
    const exportPdfBtn = document.getElementById('export-pdf-btn');
    if (exportPdfBtn && typeof exportToPDF === 'function') exportPdfBtn.addEventListener('click', exportToPDF);
    
    const saveProjectBtn = document.getElementById('save-project-btn');
    if (saveProjectBtn && typeof saveProject === 'function') saveProjectBtn.addEventListener('click', saveProject);

    const triggerLoadBtn = document.getElementById('trigger-load-btn');
    const loadProjectInput = document.getElementById('load-project-input');

    if (triggerLoadBtn && loadProjectInput) {
        triggerLoadBtn.addEventListener('click', () => { loadProjectInput.click(); });
        loadProjectInput.addEventListener('change', (e) => { if (typeof loadProject === 'function') loadProject(e); });
    }

    if (typeof hideSmallTicksCheckbox !== 'undefined' && hideSmallTicksCheckbox) {
        hideSmallTicksCheckbox.addEventListener('change', () => { if(typeof drawTimeline === 'function') drawTimeline(); });
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
            const symbolsModal = document.getElementById('symbols-modal');
            if (symbolsModal) symbolsModal.style.display = 'none';
        });
    }

    const performDelete = () => {
        if (selectedElement) {
            deleteElement(selectedElement); 
        } else if (selectedMeasureBox) {
            selectedMeasureBox.remove();
            selectedMeasureBox = null;
            if(btnDeleteElement) btnDeleteElement.style.display = 'none';
            saveHistoryState();
        }
    };

    if(btnDeleteElement) btnDeleteElement.addEventListener('click', performDelete);

    // TRACCIAMENTO MOUSE PER INCOLLA
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    document.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

        if (e.key === 'Delete' || e.key === 'Backspace') {
            performDelete();
        }

        if (e.ctrlKey || e.metaKey) {
            if (e.key === 'c') {
                if (selectedElement) {
                    clipboard = { type: 'svg', content: selectedElement.cloneNode(true) };
                } else if (selectedMeasureBox) {
                    clipboard = { type: 'html', content: selectedMeasureBox.cloneNode(true) };
                }
            } else if (e.key === 'v') {
                if (clipboard && activeTrackId) {
                    
                    const activeTrack = getActiveTrack();
                    const trackOffset = activeTrack ? (activeTrack.offsetY || 0) : 0;

                    // Calcolo coordinate di destinazione GLOBALI (relative al workspace)
                    const svgRect = drawSvg.getBoundingClientRect();
                    let globalTargetX = (mouseX - svgRect.left) / currentZoom;
                    let globalTargetY = (mouseY - svgRect.top) / currentZoom;

                    if (snapCheckbox.checked) {
                        globalTargetX = Math.round(globalTargetX / GRID_SIZE) * GRID_SIZE;
                        globalTargetY = Math.round(globalTargetY / GRID_SIZE) * GRID_SIZE;
                    }

                    // CONVERSIONE LOCALE PER IL PASTE:
                    // Sottraiamo l'offset della traccia per posizionarlo correttamente dentro al gruppo
                    const localTargetY = globalTargetY - trackOffset;

                    if (clipboard.type === 'svg') {
                        const activeSvgLayer = document.getElementById(`svg-layer-${activeTrackId}`);
                        if (activeSvgLayer) {
                            const clone = clipboard.content.cloneNode(true);
                            clone.id = 'svg_paste_' + Date.now() + Math.floor(Math.random()*1000);
                            
                            // Reset trasformazioni
                            clone.setAttribute('transform', '');
                            clone.setAttribute('data-tx', 0);
                            clone.setAttribute('data-ty', 0);
                            
                            // Aggiungiamo il clone temporaneamente per misurarlo
                            activeSvgLayer.appendChild(clone);
                            const bbox = clone.getBBox();
                            
                            // Calcolo delta dallo zero dell'oggetto alla posizione del mouse (locale)
                            const deltaX = globalTargetX - bbox.x;
                            const deltaY = localTargetY - bbox.y;
                            
                            clone.setAttribute('transform', `translate(${deltaX}, ${deltaY})`);
                            clone.setAttribute('data-tx', deltaX);
                            clone.setAttribute('data-ty', deltaY);
                            clone.setAttribute('data-start-tx', deltaX);
                            clone.setAttribute('data-start-ty', deltaY);

                            selectElement(clone);
                            saveHistoryState();
                        }
                    } else if (clipboard.type === 'html') {
                        const activeHtmlLayer = document.getElementById(`html-layer-${activeTrackId}`);
                        if (activeHtmlLayer) {
                            const clone = clipboard.content.cloneNode(true);
                            highestZ++;
                            clone.style.zIndex = highestZ;
                            
                            clone.style.left = globalTargetX + 'px';
                            // Usa target locale per l'HTML tradotto
                            clone.style.top = localTargetY + 'px';
                            clone.classList.remove('selected'); 

                            activeHtmlLayer.appendChild(clone);
                            if(typeof makeDraggable === 'function') makeDraggable(clone);
                            
                            if(selectedMeasureBox) selectedMeasureBox.classList.remove('selected');
                            selectedMeasureBox = clone;
                            clone.classList.add('selected');
                            
                            saveHistoryState();
                        }
                    }
                }
            }
        }
    });

    console.log("MusicXML Whiteboard Pro avviato correttamente.");
});