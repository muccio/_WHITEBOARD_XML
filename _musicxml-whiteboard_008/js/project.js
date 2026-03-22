/* js/project.js */

async function exportToPDF() {
    const btn = document.getElementById('export-pdf-btn');
    if (!btn) return;
    btn.textContent = 'Esportazione...';
    btn.disabled = true;

    const workspace = document.getElementById('workspace');
    const workspaceWrapper = document.getElementById('workspace-wrapper');
    const fileName = (document.getElementById('proj-title').value || "progetto") + ".pdf";

    const scrollX = workspaceWrapper.scrollLeft;
    const scrollY = workspaceWrapper.scrollTop;

    workspaceWrapper.scrollTo(0, 0);
    workspace.style.transform = 'scale(1)';
    document.body.classList.add('pdf-export-mode');

    await new Promise(resolve => setTimeout(resolve, 100));

    const canvasExport = await html2canvas(workspace, {
        allowTaint: true, useCORS: true, logging: false, scale: 1,
        width: workspace.scrollWidth, height: workspace.scrollHeight,
    });

    const imgData = canvasExport.toDataURL('image/jpeg', 0.9);

    document.body.classList.remove('pdf-export-mode');
    workspace.style.transform = `scale(${currentZoom})`;
    workspaceWrapper.scrollTo(scrollX, scrollY);

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({
        orientation: workspace.scrollWidth > workspace.scrollHeight ? 'landscape' : 'portrait',
        unit: 'px', format: [workspace.scrollWidth, workspace.scrollHeight]
    });

    pdf.addImage(imgData, 'JPEG', 0, 0, workspace.scrollWidth, workspace.scrollHeight);
    pdf.save(fileName);

    btn.textContent = '📄 PDF';
    btn.disabled = false;
}

function saveProject() {
    if(typeof selectElement === 'function') selectElement(null);
    
    // Aggiorna gli innerHTML delle tracce prima di salvarle
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
            
            // Ripristino dati base
            document.getElementById('proj-title').value = projectData.title || '';
            document.getElementById('proj-author').value = projectData.author || '';
            document.getElementById('total-duration').value = projectData.totalSec || 300;
            document.getElementById('grid-sec').value = projectData.gridSec || 1;
            
            // CORREZIONE COMPATIBILITÀ: Se zoom non esiste (vecchi file), usa 1
            currentZoom = (typeof projectData.zoom === 'number') ? projectData.zoom : 1;
            
            hideSmallTicksCheckbox.checked = projectData.hideSmallTicks || false;
            customLegend = projectData.legendData || [];
            snapCheckbox.checked = projectData.snapGrid || false;
            mirrorCheckbox.checked = projectData.mirrorDraw || false;

            document.getElementById('legend-sec-val').innerText = document.getElementById('grid-sec').value;
            
            // Pulizia ambiente
            drawSvg.innerHTML = '';
            gallery.innerHTML = '';

            // GESTIONE RETROCOMPATIBILITÀ: Migrazione da Single-Track a Multi-Track
            if (projectData.tracks && projectData.tracks.length > 0) {
                // FILE NUOVO: Carica le tracce normalmente
                tracks = projectData.tracks;
            } else {
                // FILE VECCHIO: Crea una traccia fittizia e inserisci i vecchi dati root
                console.log("Rilevato file legacy: migrazione in corso...");
                tracks = [{
                    id: 'track_legacy_import',
                    name: 'Traccia Importata',
                    baseY: 1000 + (0 * 1500), // Default spaziatura
                    offsetY: 0,
                    yLabels: projectData.yAxisLabels || [], // Recupera vecchie label asse Y
                    ySectionsCount: parseInt(projectData.ySections) || 4,
                    svgContent: projectData.svgContent || '',
                    htmlContent: projectData.galleryHTML || ''
                }];
            }

            // Ricostruzione DOM Tracce
            tracks.forEach(t => {
                // Assicuriamoci che offsetY esista (per file salvati prima dell'ultimo update)
                if (typeof t.offsetY === 'undefined') t.offsetY = 0;

                const svgGroup = document.createElementNS("http://www.w3.org/2000/svg", 'g');
                svgGroup.id = `svg-layer-${t.id}`; 
                svgGroup.classList.add('track-layer');
                // Applica trasformazione posizionale
                svgGroup.setAttribute('transform', `translate(0, ${t.offsetY})`);
                if(t.svgContent) svgGroup.innerHTML = t.svgContent;
                drawSvg.appendChild(svgGroup);

                const htmlGroup = document.createElement('div');
                htmlGroup.id = `html-layer-${t.id}`; 
                htmlGroup.classList.add('track-layer');
                htmlGroup.style.transform = `translateY(${t.offsetY}px)`;
                if(t.htmlContent) htmlGroup.innerHTML = t.htmlContent;
                gallery.appendChild(htmlGroup);
            });

            // Aggiorna UI
            renderTrackSelector();
            const idToActivate = (projectData.activeTrackId && tracks.find(t=>t.id===projectData.activeTrackId)) ? projectData.activeTrackId : tracks[0].id;
            switchTrack(idToActivate);

            // Riattiva Drag & Drop
            let maxZ = 100;
            document.querySelectorAll('.measure-box').forEach(box => { 
                if(typeof makeDraggable === 'function') makeDraggable(box); 
                const z = parseInt(box.style.zIndex, 10); if (!isNaN(z) && z > maxZ) maxZ = z; 
            }); 
            highestZ = maxZ;

            // Aggiorna vista
            updateVisualLegend();
            updateWorkspaceSize();
            updateZoom(); 
            
            // Resetta cronologia
            actionHistory = []; historyStep = -1;
            if(typeof saveHistoryState === 'function') saveHistoryState();

        } catch (err) { 
            console.error(err);
            alert("Errore nel caricamento del file. Verifica che sia un JSON valido."); 
        }
    }; 
    reader.readAsText(file);
}