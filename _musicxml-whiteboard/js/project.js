/* js/project.js */

async function exportToPDF() {
    const btn = document.getElementById('export-pdf-btn');
    if (!btn) return;
    
    if (!tracks || tracks.length === 0) {
        alert("Nessuna traccia da esportare.");
        return;
    }

    btn.textContent = 'Calcolo area...';
    btn.disabled = true;

    const workspace = document.getElementById('workspace');
    const yAxisCanvasEl = document.getElementById('y-axis-canvas');
    const workspaceWrapper = document.getElementById('workspace-wrapper');
    const fileName = (document.getElementById('proj-title').value || "progetto") + ".pdf";

    // 1. Preparazione Ambiente (Reset Zoom per calcoli precisi)
    const originalScrollX = workspaceWrapper.scrollLeft;
    const originalScrollY = workspaceWrapper.scrollTop;
    
    // Resetta vista per catturare tutto a scala 1:1
    workspaceWrapper.scrollTo(0, 0); 
    workspace.style.transform = 'scale(1)'; 
    document.body.classList.add('pdf-export-mode');

    // Estendi l'asse Y temporaneamente
    const originalYAxisHeight = yAxisCanvasEl.height;
    yAxisCanvasEl.style.height = workspace.style.height;
    yAxisCanvasEl.height = parseFloat(workspace.style.height);
    if(typeof drawYAxis === 'function') drawYAxis(); 

    // Attendi applicazione stili
    await new Promise(resolve => setTimeout(resolve, 200));

    // 2. CALCOLO LIMITI CONTENUTO REALE
    let minContentY = Infinity;
    let maxContentY = -Infinity;

    // Funzione helper per aggiornare i limiti
    const updateLimits = (top, bottom) => {
        if (top < minContentY) minContentY = top;
        if (bottom > maxContentY) maxContentY = bottom;
    };

    tracks.forEach(t => {
        const visualOffsetY = t.offsetY || 0;
        const trackBaseLine = t.baseY + visualOffsetY;

        // A. Analisi SVG (Disegni)
        const svgLayer = document.getElementById(`svg-layer-${t.id}`);
        if (svgLayer && svgLayer.children.length > 0) {
            try {
                // getBBox ritorna le coordinate locali dentro il gruppo
                const bbox = svgLayer.getBBox();
                // Sommiamo l'offset della traccia per ottenere la coordinata globale nel workspace
                const svgTop = bbox.y + visualOffsetY;
                const svgBottom = bbox.y + bbox.height + visualOffsetY;
                updateLimits(svgTop, svgBottom);
            } catch (e) { console.warn("Impossibile calcolare BBox per SVG", e); }
        }

        // B. Analisi HTML (Battute musicali)
        const htmlLayer = document.getElementById(`html-layer-${t.id}`);
        if (htmlLayer && htmlLayer.children.length > 0) {
            Array.from(htmlLayer.children).forEach(box => {
                // offsetTop è relativo al contenitore padre (il workspace), ma il layer ha un transform translateY
                // Tuttavia, offsetTop di un elemento trasformato non cambia, ma la sua posizione visiva sì.
                // Poiché il layer HTML ha style.transform = `translateY(...)`, e i box sono absolute dentro:
                // La posizione visiva è box.offsetTop + visualOffsetY
                const boxTop = box.offsetTop + visualOffsetY;
                const boxBottom = boxTop + box.offsetHeight;
                updateLimits(boxTop, boxBottom);
            });
        }

        // C. Includiamo sempre almeno la linea temporale della traccia e le sue etichette Y
        // Altezza stimata etichette sopra la linea
        const labelsTop = trackBaseLine - (t.ySectionsCount * GRID_SIZE);
        updateLimits(labelsTop, trackBaseLine + 20); // +20px sotto la linea
    });

    // Se per qualche motivo non abbiamo trovato nulla, usiamo valori di fallback
    if (minContentY === Infinity) minContentY = 0;
    if (maxContentY === -Infinity) maxContentY = 1000;

    // 3. Applicazione Padding
    const PADDING_TOP = 50;
    const PADDING_BOTTOM = 50;

    const finalCropY = Math.max(0, minContentY - PADDING_TOP);
    const finalCropHeight = (maxContentY - minContentY) + PADDING_TOP + PADDING_BOTTOM;

    btn.textContent = 'Rendering...';

    try {
        // 4. Cattura Asse Y
        const yAxisSnapshot = await html2canvas(yAxisCanvasEl, {
            x: 0,
            y: finalCropY,
            width: 60,
            height: finalCropHeight,
            scale: 2, 
            logging: false,
            allowTaint: true,
            backgroundColor: '#ffffff'
        });

        // 5. Cattura Workspace
        const workspaceSnapshot = await html2canvas(workspace, {
            x: 0,
            y: finalCropY,
            width: workspace.scrollWidth,
            height: finalCropHeight,
            scale: 2,
            logging: false,
            allowTaint: true,
            useCORS: true,
            backgroundColor: '#ffffff',
            ignoreElements: (element) => {
                return element.classList.contains('resize-handle') || element.classList.contains('bezier-control-point');
            }
        });

        // 6. Compositing
        const finalCanvas = document.createElement('canvas');
        finalCanvas.width = yAxisSnapshot.width + workspaceSnapshot.width;
        finalCanvas.height = workspaceSnapshot.height;
        const ctx = finalCanvas.getContext('2d');

        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);
        
        ctx.drawImage(yAxisSnapshot, 0, 0);
        ctx.drawImage(workspaceSnapshot, yAxisSnapshot.width, 0);

        // 7. Generazione PDF
        const imgData = finalCanvas.toDataURL('image/jpeg', 0.90);
        const { jsPDF } = window.jspdf;
        
        const orientation = finalCanvas.width > finalCanvas.height ? 'landscape' : 'portrait';
        
        const pdf = new jsPDF({
            orientation: orientation,
            unit: 'px',
            format: [finalCanvas.width, finalCanvas.height]
        });

        pdf.addImage(imgData, 'JPEG', 0, 0, finalCanvas.width, finalCanvas.height);
        pdf.save(fileName);

    } catch (err) {
        console.error("Errore PDF:", err);
        alert("Errore durante l'esportazione PDF.");
    } finally {
        // 8. Ripristino
        document.body.classList.remove('pdf-export-mode');
        workspace.style.transform = `scale(${currentZoom})`;
        workspaceWrapper.scrollTo(originalScrollX, originalScrollY);
        
        // Ripristino altezza asse Y originale
        yAxisCanvasEl.style.height = '100%'; 
        // Aggiorna dimensioni corrette basate sullo zoom
        if(typeof updateWorkspaceSize === 'function') updateWorkspaceSize();
        
        btn.textContent = '📄 PDF';
        btn.disabled = false;
    }
}

function saveProject() {
    if(typeof selectElement === 'function') selectElement(null);
    
    tracks.forEach(t => {
        const svgLayer = document.getElementById(`svg-layer-${t.id}`);
        const htmlLayer = document.getElementById(`html-layer-${t.id}`);
        t.svgContent = svgLayer ? svgLayer.innerHTML : '';
        t.htmlContent = htmlLayer ? htmlLayer.innerHTML : '';
    });

    const projectData = {
        title: document.getElementById('proj-title').value,
        author: document.getElementById('proj-author').value,
        totalSec: document.getElementById('total-duration').value,
        gridSec: document.getElementById('grid-sec').value,
        zoom: currentZoom,
        tracks: tracks,
        activeTrackId: activeTrackId,
        hideSmallTicks: hideSmallTicksCheckbox.checked,
        legendData: customLegend,
        snapGrid: snapCheckbox.checked,
        mirrorDraw: mirrorCheckbox.checked
    };
    
    const blob = new Blob([JSON.stringify(projectData)], { type: "application/json" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); 
    a.download = (projectData.title ? projectData.title.replace(/\s+/g, '_') : "progetto_musicale") + ".json";
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
}

function loadProject(event) {
    const file = event.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
        try {
            const projectData = JSON.parse(evt.target.result);
            if (projectData.title !== undefined) document.getElementById('proj-title').value = projectData.title;
            if (projectData.author !== undefined) document.getElementById('proj-author').value = projectData.author;
            if (projectData.totalSec !== undefined) document.getElementById('total-duration').value = projectData.totalSec;
            if (projectData.gridSec !== undefined) document.getElementById('grid-sec').value = projectData.gridSec;
            if (projectData.zoom !== undefined) currentZoom = projectData.zoom;
            if (projectData.hideSmallTicks !== undefined) hideSmallTicksCheckbox.checked = projectData.hideSmallTicks;
            if (projectData.legendData) { customLegend = projectData.legendData; if(typeof updateVisualLegend === 'function') updateVisualLegend(); }
            if (projectData.snapGrid !== undefined) { snapCheckbox.checked = projectData.snapGrid; toolSelect.dispatchEvent(new Event('change')); }
            if (projectData.mirrorDraw !== undefined) mirrorCheckbox.checked = projectData.mirrorDraw;

            document.getElementById('legend-sec-val').innerText = document.getElementById('grid-sec').value;
            
            if (projectData.tracks && projectData.tracks.length > 0) {
                tracks = projectData.tracks;
                drawSvg.innerHTML = '';
                gallery.innerHTML = '';
                tracks.forEach(t => {
                    if (typeof t.offsetY === 'undefined') t.offsetY = 0;
                    const svgGroup = document.createElementNS("http://www.w3.org/2000/svg", 'g');
                    svgGroup.id = `svg-layer-${t.id}`; svgGroup.classList.add('track-layer');
                    svgGroup.setAttribute('transform', `translate(0, ${t.offsetY})`);
                    if(t.svgContent) svgGroup.innerHTML = t.svgContent;
                    drawSvg.appendChild(svgGroup);

                    const htmlGroup = document.createElement('div');
                    htmlGroup.id = `html-layer-${t.id}`; htmlGroup.classList.add('track-layer');
                    htmlGroup.style.transform = `translateY(${t.offsetY}px)`;
                    if(t.htmlContent) htmlGroup.innerHTML = t.htmlContent;
                    gallery.appendChild(htmlGroup);
                });
                renderTrackSelector();
                const idToActivate = (projectData.activeTrackId && tracks.find(t=>t.id===projectData.activeTrackId)) ? projectData.activeTrackId : tracks[0].id;
                switchTrack(idToActivate);

                let maxZ = 100;
                document.querySelectorAll('.measure-box').forEach(box => { 
                    if(typeof makeDraggable === 'function') makeDraggable(box); 
                    const z = parseInt(box.style.zIndex, 10); if (!isNaN(z) && z > maxZ) maxZ = z; 
                }); highestZ = maxZ;
            } else {
                tracks = [];
                initTracks();
            }

            if(typeof updateWorkspaceSize === 'function') updateWorkspaceSize();
            if(typeof updateZoom === 'function') updateZoom(); 
            
            actionHistory = []; historyStep = -1;
            if(typeof saveHistoryState === 'function') saveHistoryState();

        } catch (err) { alert("Errore nel file di progetto."); console.error(err); }
    }; 
    reader.readAsText(file);
}