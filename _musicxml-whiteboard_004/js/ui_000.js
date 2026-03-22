/* js/ui.js */

// GESTIONE TRACCE (INIT & SWITCH)
function initTracks() {
    if (tracks.length === 0) {
        addTrack("Strumento 1"); // Prima traccia di default
    } else {
        renderTrackSelector();
        switchTrack(tracks[0].id);
    }
}

function addTrack(name) {
    const id = 'track_' + Date.now();
    const newIndex = tracks.length;
    const baseY = 1000 + (newIndex * TRACK_HEIGHT_SPACING); // Posiziona ogni traccia più in basso

    const newTrack = {
        id: id,
        name: name || `Traccia ${newIndex + 1}`,
        baseY: baseY,
        yLabels:[], // Specifiche della traccia
        ySectionsCount: 4
    };
    tracks.push(newTrack);

    // Crea Layer SVG
    const svgGroup = document.createElementNS("http://www.w3.org/2000/svg", 'g');
    svgGroup.id = `svg-layer-${id}`;
    svgGroup.classList.add('track-layer');
    drawSvg.appendChild(svgGroup);

    // Crea Layer HTML (per MusicXML)
    const htmlGroup = document.createElement('div');
    htmlGroup.id = `html-layer-${id}`;
    htmlGroup.classList.add('track-layer');
    gallery.appendChild(htmlGroup);

    renderTrackSelector();
    switchTrack(id);
    updateWorkspaceSize();
}

function renderTrackSelector() {
    trackSelector.innerHTML = '';
    tracks.forEach(t => {
        const opt = document.createElement('option');
        opt.value = t.id;
        opt.textContent = t.name;
        trackSelector.appendChild(opt);
    });
}

function switchTrack(id) {
    activeTrackId = id;
    trackSelector.value = id;

    // Aggiorna UI CSS (Grigetto per inattive)
    document.querySelectorAll('.track-layer').forEach(layer => {
        if (layer.id === `svg-layer-${id}` || layer.id === `html-layer-${id}`) {
            layer.classList.add('active');
            layer.classList.remove('inactive');
        } else {
            layer.classList.remove('active');
            layer.classList.add('inactive');
        }
    });

    // Carica impostazioni Y della traccia
    const track = getActiveTrack();
    if(track) ySectionsInput.value = track.ySectionsCount || 4;

    // Deseleziona forme per sicurezza
    if(typeof selectElement === 'function') selectElement(null);

    // Scorri la pagina per mettere a fuoco la traccia attiva
    if(track) {
        document.getElementById('workspace-wrapper').scrollTop = (track.baseY * currentZoom) - (window.innerHeight / 2);
    }
}

document.getElementById('btn-add-track').addEventListener('click', () => {
    const name = prompt("Nome della nuova traccia:");
    if(name) { addTrack(name); saveHistoryState(); }
});

document.getElementById('btn-rename-track').addEventListener('click', () => {
    const track = getActiveTrack();
    if(track) {
        const newName = prompt("Rinomina traccia:", track.name);
        if (newName && newName.trim() !== '') {
            track.name = newName;
            renderTrackSelector();
            trackSelector.value = activeTrackId;
            saveHistoryState();
        }
    }
});

trackSelector.addEventListener('change', (e) => switchTrack(e.target.value));

// DIMENSIONI WORKSPACE
function updateWorkspaceSize() {
    const totalSec = parseFloat(document.getElementById('total-duration').value) || 300;
    const secPerSquare = parseFloat(document.getElementById('grid-sec').value) || 1;
    let newWidth = (totalSec / secPerSquare) * GRID_SIZE + 200; 
    newWidth = Math.max(newWidth, window.innerWidth); 

    // L'altezza dipende dal numero di tracce
    const neededHeight = tracks.length * TRACK_HEIGHT_SPACING + 1000;
    const finalHeight = Math.max(5000, neededHeight);

    const workspace = document.getElementById('workspace');
    workspace.style.width = `${newWidth}px`;
    workspace.style.height = `${finalHeight}px`;
    
    timelineCanvas.width = newWidth;
    timelineCanvas.height = finalHeight;
    drawSvg.setAttribute('width', newWidth);
    drawSvg.setAttribute('height', finalHeight);

    drawTimeline();
    drawYAxis();
}

function drawTimeline() {
    if(!tCtx) return;
    const w = timelineCanvas.width, h = timelineCanvas.height;
    const secPerSquare = parseFloat(document.getElementById('grid-sec').value) || 1;
    const hideSmall = hideSmallTicksCheckbox.checked;
    
    tCtx.clearRect(0, 0, w, h); 
    tCtx.font = "bold 14px sans-serif"; tCtx.textAlign = "center"; tCtx.textBaseline = "top";
    
    // Disegna l'asse per OGNI traccia
    tracks.forEach(track => {
        const baseY = track.baseY;
        
        tCtx.beginPath(); tCtx.strokeStyle = "#e06c75"; tCtx.lineWidth = 3; 
        tCtx.moveTo(0, baseY); tCtx.lineTo(w, baseY); tCtx.stroke();
        
        tCtx.fillStyle = "#abb2bf"; tCtx.strokeStyle = "#e06c75";
        
        for (let x = 0; x <= w; x += GRID_SIZE) {
            let i = x / GRID_SIZE;
            let isMajorTick = (i % 5 === 0);
            
            if (isMajorTick) { 
                tCtx.lineWidth = 2; tCtx.moveTo(x, baseY - 12); tCtx.lineTo(x, baseY + 12); 
                tCtx.fillText(parseFloat((i * secPerSquare).toFixed(2)) + "s", x, baseY + 15); 
            } else if (!hideSmall) { 
                tCtx.lineWidth = 1; tCtx.moveTo(x, baseY - 5); tCtx.lineTo(x, baseY + 5); 
            }
        } 
        tCtx.stroke();
    });
}

function drawYAxis() {
    if (!yCtx) return;
    
    const zoomGrid = GRID_SIZE * currentZoom;
    const totalHeight = timelineCanvas.height * currentZoom; // Usa altezza dinamica

    yAxisCanvas.height = totalHeight;
    const w = yAxisCanvas.width;
    yCtx.clearRect(0, 0, w, totalHeight);
    yCtx.font = `bold ${Math.max(8, 11 * currentZoom)}px sans-serif`;
    yCtx.fillStyle = "#61afef";

    // Disegna l'asse Y per OGNI traccia
    tracks.forEach(track => {
        const zoomBaseY = track.baseY * currentZoom;
        
        yCtx.beginPath();
        yCtx.strokeStyle = "#e06c75";
        yCtx.lineWidth = 2;
        yCtx.moveTo(0, zoomBaseY);
        yCtx.lineTo(w, zoomBaseY);
        yCtx.stroke();

        let currentY = zoomBaseY;
        const labels = track.yLabels ||[];
        
        labels.forEach((section) => {
            const sectionHeight = (parseInt(section.squares) || 1) * zoomGrid;
            const nextY = currentY - sectionHeight;

            yCtx.beginPath();
            yCtx.strokeStyle = "#444a58";
            yCtx.lineWidth = 1;
            yCtx.moveTo(w - 20, nextY);
            yCtx.lineTo(w, nextY);
            yCtx.stroke();

            yCtx.save();
            yCtx.translate(w - 10, currentY - (sectionHeight / 2));
            yCtx.rotate(-Math.PI / 2);
            yCtx.textAlign = "center";
            yCtx.textBaseline = "middle";
            yCtx.fillText(section.text.toUpperCase(), 0, 0);
            yCtx.restore();

            currentY = nextY;
        });
    });
}

document.getElementById('workspace-wrapper').addEventListener('scroll', function() {
    yAxisCanvas.style.top = `-${this.scrollTop}px`;
});

document.getElementById('total-duration').addEventListener('change', updateWorkspaceSize);
document.getElementById('grid-sec').addEventListener('input', (e) => { 
    document.getElementById('legend-sec-val').innerText = e.target.value; 
    updateWorkspaceSize(); 
});

const updateZoom = () => { 
    document.documentElement.style.setProperty('--zoom', currentZoom); 
    document.getElementById('zoom-val').innerText = `${Math.round(currentZoom * 100)}%`; 
    drawTimeline(); drawYAxis();
};
document.getElementById('btn-zoom-in').addEventListener('click', () => { currentZoom = Math.min(3, currentZoom + 0.1); updateZoom(); });
document.getElementById('btn-zoom-out').addEventListener('click', () => { currentZoom = Math.max(0.2, currentZoom - 0.1); updateZoom(); });

const modalLegend = document.getElementById('legend-modal');
document.getElementById('btn-legend-edit').addEventListener('click', () => { renderLegendEditor(); modalLegend.style.display = 'flex'; });
document.getElementById('btn-add-legend').addEventListener('click', () => {
    const shape = document.getElementById('new-legend-type').value, color = document.getElementById('new-legend-color').value, text = document.getElementById('new-legend-text').value.trim();
    if(!text) return; customLegend.push({ shape, color, text }); document.getElementById('new-legend-text').value = ''; 
    renderLegendEditor(); updateVisualLegend();
});
function deleteLegendItem(index) { customLegend.splice(index, 1); renderLegendEditor(); updateVisualLegend(); }
window.deleteLegendItem = deleteLegendItem;

function getShapeHtml(shape, color) {
    if (shape === 'color') return `<div style="width:18px; height:18px; background:${color}; border-radius:50%; border: 1px solid #ccc;"></div>`;
    if (shape === 'rect') return `<div style="width:16px; height:16px; background:${color}; border: 1px solid #333;"></div>`;
    if (shape === 'rectOutline') return `<div style="width:16px; height:16px; border: 3px solid ${color};"></div>`;
    if (shape === 'circle') return `<div style="width:16px; height:16px; border: 3px solid ${color}; border-radius:50%;"></div>`;
    if (shape === 'line') return `<div style="width:18px; height:3px; background:${color}; margin-top:6px;"></div>`; 
    if (shape === 'text') return `<div style="font-weight:bold; font-family:serif; font-size:16px; color:${color};">T</div>`;
    if (shape === 'freehand') return `<svg width="18" height="18" viewBox="0 0 20 20"><path d="M2,18 Q5,2 10,10 T18,2" stroke="${color}" stroke-width="2" fill="none"/></svg>`;
    if (shape === 'image') return `<div style="font-size:14px;">🖼️</div>`; return '';
}
function renderLegendEditor() {
    const container = document.getElementById('legend-list-container'); container.innerHTML = '';
    if(customLegend.length === 0) { container.innerHTML = '<div style="color:#777; text-align:center;">Nessuna voce presente.</div>'; return; }
    customLegend.forEach((item, index) => {
        const div = document.createElement('div'); div.className = 'legend-list-item';
        div.innerHTML = `<div style="display:flex; align-items:center; gap:10px;">${getShapeHtml(item.shape, item.color)} <strong>${item.text}</strong></div><button class="btn-clear" onclick="deleteLegendItem(${index})">Elimina</button>`;
        container.appendChild(div);
    });
}
function updateVisualLegend() {
    const box = document.getElementById('visual-legend-box'), content = document.getElementById('visual-legend-content');
    if(customLegend.length === 0) { box.style.display = 'none'; return; } 
    box.style.display = 'block';
    content.innerHTML = customLegend.map(item => `<div class="visual-legend-item">${getShapeHtml(item.shape, item.color)}<span>${item.text}</span></div>`).join('');
}

function makePanelDraggable(panel, handle) {
    if (!panel || !handle) return;
    let isDraggingPanel = false, startX, startY, initialLeft, initialTop;
    handle.addEventListener('pointerdown', (e) => {
        isDraggingPanel = true; startX = e.clientX; startY = e.clientY;
        const rect = panel.getBoundingClientRect(); initialLeft = rect.left; initialTop = rect.top;
        panel.style.left = initialLeft + 'px'; panel.style.top = initialTop + 'px'; panel.style.right = 'auto'; panel.style.bottom = 'auto'; panel.style.margin = '0'; 
        handle.setPointerCapture(e.pointerId); e.preventDefault();
    });
    handle.addEventListener('pointermove', (e) => {
        if (!isDraggingPanel) return;
        panel.style.left = `${initialLeft + e.clientX - startX}px`; panel.style.top = `${initialTop + e.clientY - startY}px`;
    });
    handle.addEventListener('pointerup', (e) => { isDraggingPanel = false; handle.releasePointerCapture(e.pointerId); });
}

makePanelDraggable(document.getElementById('controls'), document.querySelector('#controls .drag-handle'));
makePanelDraggable(document.getElementById('tracks-panel'), document.querySelector('#tracks-panel .drag-handle'));
makePanelDraggable(document.getElementById('text-tools-panel'), document.querySelector('#text-tools-panel .drag-handle'));
makePanelDraggable(document.getElementById('y-axis-panel'), document.querySelector('#y-axis-panel .drag-handle'));

// GESTIONE ETICHETTE ASSE Y PER LA TRACCIA ATTIVA
document.getElementById('edit-y-labels-btn').addEventListener('click', () => {
    const track = getActiveTrack();
    if(!track) return;
    const numSections = parseInt(ySectionsInput.value) || 1;
    track.ySectionsCount = numSections; // Salva la preferenza
    
    yLabelsEditor.innerHTML = '<div class="y-label-row" style="font-weight:bold; margin-bottom:10px;"><span style="width:80px;">Sezione</span><span style="flex-grow:1;">Etichetta</span><span style="width:60px;">Quadretti</span></div>';
    for(let i=0; i<numSections; i++){
        const currentData = track.yLabels[i] || { text: "", squares: 5 };
        yLabelsEditor.innerHTML += `
            <div class="y-label-row">
                <label style="width:80px;">#${i+1}</label>
                <input type="text" id="y-label-text-${i}" value="${currentData.text}" style="flex-grow:1;">
                <input type="number" id="y-label-sq-${i}" value="${currentData.squares}" style="width:60px;" min="1">
            </div>`;
    }
    yLabelsModal.style.display = 'flex';
});

document.getElementById('save-y-labels-btn').addEventListener('click', () => {
    const track = getActiveTrack();
    if(!track) return;
    const numSections = parseInt(ySectionsInput.value) || 1;
    track.yLabels =[];
    for(let i=0; i<numSections; i++){
        track.yLabels.push({
            text: document.getElementById(`y-label-text-${i}`).value,
            squares: document.getElementById(`y-label-sq-${i}`).value
        });
    }
    yLabelsModal.style.display = 'none';
    drawYAxis();
    saveHistoryState();
});

document.getElementById('close-y-labels-modal').addEventListener('click', () => { yLabelsModal.style.display = 'none'; });
document.getElementById('close-legend-modal').addEventListener('click', () => { modalLegend.style.display = 'none'; });
document.getElementById('close-symbols-modal').addEventListener('click', () => { symbolsModal.style.display = 'none'; });
ySectionsInput.addEventListener('change', () => {
    const track = getActiveTrack();
    if(track) track.ySectionsCount = parseInt(ySectionsInput.value);
    drawYAxis();
});