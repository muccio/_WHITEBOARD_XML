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
                    // Clona SVG e salva bounding box originale per calcolare offset relativo
                    const bbox = selectedElement.getBBox();
                    // Consideriamo la trasformazione corrente per avere la posizione visiva reale
                    const ctm = selectedElement.getCTM();
                    const realX = (bbox.x * ctm.a) + ctm.e; 
                    const realY = (bbox.y * ctm.d) + ctm.f;
                    
                    clipboard = { 
                        type: 'svg', 
                        content: selectedElement.cloneNode(true),
                        origX: realX,
                        origY: realY
                    };
                } else if (selectedMeasureBox) {
                    clipboard = { type: 'html', content: selectedMeasureBox.cloneNode(true) };
                }
            } else if (e.key === 'v') {
                if (clipboard && activeTrackId) {
                    
                    // Calcolo coordinate di destinazione (MOUSE) relative al workspace
                    const svgRect = drawSvg.getBoundingClientRect();
                    let targetX = (mouseX - svgRect.left) / currentZoom;
                    let targetY = (mouseY - svgRect.top) / currentZoom;

                    if (snapCheckbox.checked) {
                        targetX = Math.round(targetX / GRID_SIZE) * GRID_SIZE;
                        targetY = Math.round(targetY / GRID_SIZE) * GRID_SIZE;
                    }

                    if (clipboard.type === 'svg') {
                        const activeSvgLayer = document.getElementById(`svg-layer-${activeTrackId}`);
                        if (activeSvgLayer) {
                            const clone = clipboard.content.cloneNode(true);
                            clone.id = 'svg_paste_' + Date.now() + Math.random();
                            
                            // Per SVG, usiamo la trasformazione per spostare l'elemento al cursore
                            // Calcoliamo la posizione originale (senza trasformazioni)
                            let originalX = 0, originalY = 0;
                            if (clone.tagName === 'circle') { originalX = parseFloat(clone.getAttribute('cx')); originalY = parseFloat(clone.getAttribute('cy')); }
                            else if (clone.tagName === 'rect' || clone.tagName === 'image' || clone.tagName === 'text') { originalX = parseFloat(clone.getAttribute('x')); originalY = parseFloat(clone.getAttribute('y')); }
                            else if (clone.tagName === 'line') { originalX = parseFloat(clone.getAttribute('x1')); originalY = parseFloat(clone.getAttribute('y1')); }
                            else if (clone.tagName === 'path') {
                                // Per i path è complesso estrarre X/Y, usiamo il clipboard origX se disponibile o 0
                                // Ma un metodo più robusto è usare la traslazione pura:
                                // Resettiamo la posizione base e usiamo transform.
                                // Tuttavia, per coerenza con il drag system:
                            }

                            // METODO UNIVERSALE PER SVG:
                            // Calcoliamo lo spostamento necessario rispetto alla posizione originale dell'elemento
                            // Per semplicità nel drag system attuale, usiamo data-tx e transform.
                            // Nota: clipboard.content ha gli attributi originali. 
                            
                            // Troviamo il bounding box dell'elemento originale CLONATO (non appeso) è difficile.
                            // Strategia: Appendiamo, misuriamo, spostiamo.
                            
                            // Reset trasformazioni precedenti
                            clone.setAttribute('transform', '');
                            clone.setAttribute('data-tx', 0);
                            clone.setAttribute('data-ty', 0);
                            
                            activeSvgLayer.appendChild(clone);
                            
                            // Ora calcoliamo dove si trova "naturalmente"
                            const bbox = clone.getBBox();
                            
                            // Calcoliamo il delta per portarlo al mouse (centrato o top-left)
                            const deltaX = targetX - bbox.x;
                            const deltaY = targetY - bbox.y;
                            
                            // Applichiamo la trasformazione e salviamo i dati per il drag futuro
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
                            
                            // Posizionamento diretto
                            clone.style.left = targetX + 'px';
                            clone.style.top = targetY + 'px';
                            clone.classList.remove('selected'); 

                            activeHtmlLayer.appendChild(clone);
                            makeDraggable(clone);
                            
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