/* js/ui.js */

// GESTIONE TRACCE (INIT & SWITCH)
function initTracks() {
    if (tracks.length === 0) addTrack("Strumento 1");
    else { renderTrackSelector(); switchTrack(tracks[0].id); }
}

function addTrack(name) {
    const id = 'track_' + Date.now();
    const newIndex = tracks.length;
    const baseY = 1000 + (newIndex * globalTrackSpacing); 
    const newTrack = { 
        id, 
        name: name || `Traccia ${newIndex + 1}`, 
        baseY, 
        offsetY: 0,
        yLabels:[], ySectionsCount: 4, svgContent: '', htmlContent: '' 
    };
    tracks.push(newTrack);
    
    const svgGroup = document.createElementNS("http://www.w3.org/2000/svg", 'g');
    svgGroup.id = `svg-layer-${id}`; 
    svgGroup.classList.add('track-layer'); 
    drawSvg.appendChild(svgGroup);

    const htmlGroup = document.createElement('div');
    htmlGroup.id = `html-layer-${id}`; 
    htmlGroup.classList.add('track-layer'); 
    gallery.appendChild(htmlGroup);

    updateTrackPositions(); 
    renderTrackSelector(); switchTrack(id); updateWorkspaceSize();
}

function renderTrackSelector() {
    trackSelector.innerHTML = '';
    tracks.forEach(t => { const opt = document.createElement('option'); opt.value = t.id; opt.textContent = t.name; trackSelector.appendChild(opt); });
}

function switchTrack(id) {
    activeTrackId = id; trackSelector.value = id;
    document.querySelectorAll('.track-layer').forEach(layer => {
        const isSvgMatch = layer.id === `svg-layer-${id}`;
        const isHtmlMatch = layer.id === `html-layer-${id}`;
        layer.classList.toggle('active', isSvgMatch || isHtmlMatch);
        layer.classList.toggle('inactive', !isSvgMatch && !isHtmlMatch);
    });
    const track = getActiveTrack();
    if(track) ySectionsInput.value = track.ySectionsCount || 4;
    if(typeof selectElement === 'function') selectElement(null);
    
    if(track) {
        const currentVisualY = track.baseY + (track.offsetY || 0);
        document.getElementById('workspace-wrapper').scrollTop = (currentVisualY * currentZoom) - (window.innerHeight / 2);
    }
}

// GESTIONE SPAZIATURA DINAMICA
if(typeof trackSpacingInput !== 'undefined' && trackSpacingInput) {
    trackSpacingInput.addEventListener('input', (e) => {
        globalTrackSpacing = parseInt(e.target.value);
        updateTrackPositions();
    });
}

function updateTrackPositions() {
    if(tracks.length === 0) return;
    const anchorY = tracks[0].baseY; 

    tracks.forEach((track, index) => {
        const idealY = anchorY + (index * globalTrackSpacing);
        track.offsetY = idealY - track.baseY;

        const svgLayer = document.getElementById(`svg-layer-${track.id}`);
        const htmlLayer = document.getElementById(`html-layer-${track.id}`);
        
        if (svgLayer) svgLayer.setAttribute('transform', `translate(0, ${track.offsetY})`);
        if (htmlLayer) htmlLayer.style.transform = `translateY(${track.offsetY}px)`;
    });
    updateWorkspaceSize();
}

document.getElementById('btn-add-track').addEventListener('click', () => { const name = prompt("Nome traccia:"); if(name) { addTrack(name); saveHistoryState(); } });
document.getElementById('btn-rename-track').addEventListener('click', () => {
    const track = getActiveTrack();
    if(track) { const newName = prompt("Rinomina:", track.name); if (newName) { track.name = newName; renderTrackSelector(); trackSelector.value = activeTrackId; saveHistoryState(); } }
});
trackSelector.addEventListener('change', (e) => switchTrack(e.target.value));

// DIMENSIONI WORKSPACE E ASSI
function updateWorkspaceSize() {
    const totalSec = parseFloat(document.getElementById('total-duration').value) || 300;
    const secPerSquare = parseFloat(document.getElementById('grid-sec').value) || 1;
    let newWidth = (totalSec / secPerSquare) * GRID_SIZE + 200; newWidth = Math.max(newWidth, window.innerWidth); 
    
    let maxVisualY = 5000;
    if (tracks.length > 0) {
        const lastTrack = tracks[tracks.length - 1];
        maxVisualY = lastTrack.baseY + (lastTrack.offsetY || 0) + 1000;
    }
    const finalHeight = Math.max(5000, maxVisualY);

    const workspace = document.getElementById('workspace');
    workspace.style.width = `${newWidth}px`; workspace.style.height = `${finalHeight}px`;
    timelineCanvas.width = newWidth; timelineCanvas.height = finalHeight;
    drawSvg.setAttribute('width', newWidth); drawSvg.setAttribute('height', finalHeight);
    document.querySelectorAll('.bkg-layer svg').forEach(svg => { svg.setAttribute('width', newWidth); svg.setAttribute('height', finalHeight); });
    
    drawTimeline(); 
    drawYAxis();
}

function drawTimeline() {
    if(!tCtx) return;
    const w = timelineCanvas.width, h = timelineCanvas.height, secPerSquare = parseFloat(document.getElementById('grid-sec').value) || 1, hideSmall = hideSmallTicksCheckbox && hideSmallTicksCheckbox.checked;
    tCtx.clearRect(0, 0, w, h); 
    tCtx.font = "bold 14px sans-serif"; tCtx.textAlign = "center"; tCtx.textBaseline = "top";
    tracks.forEach(track => {
        const currentY = track.baseY + (track.offsetY || 0);
        
        tCtx.beginPath(); tCtx.strokeStyle = "#e06c75"; tCtx.lineWidth = 3; 
        tCtx.moveTo(0, currentY); tCtx.lineTo(w, currentY); tCtx.stroke();
        
        tCtx.fillStyle = "#abb2bf"; tCtx.strokeStyle = "#e06c75";
        for (let x = 0; x <= w; x += GRID_SIZE) {
            let i = x / GRID_SIZE, isMajorTick = (i % 5 === 0);
            if (isMajorTick) { tCtx.lineWidth = 2; tCtx.moveTo(x, currentY - 12); tCtx.lineTo(x, currentY + 12); tCtx.fillText(parseFloat((i * secPerSquare).toFixed(2)) + "s", x, currentY + 15); } 
            else if (!hideSmall) { tCtx.lineWidth = 1; tCtx.moveTo(x, currentY - 5); tCtx.lineTo(x, currentY + 5); }
        } tCtx.stroke();
    });
}

function drawYAxis() {
    if (!yCtx) return;
    const safeZoom = currentZoom || 1;
    const zoomGrid = GRID_SIZE * safeZoom;
    const totalHeight = timelineCanvas.height * safeZoom; 

    if (totalHeight > 0 && !isNaN(totalHeight)) yAxisCanvas.height = totalHeight;
    
    const w = yAxisCanvas.width; 
    yCtx.clearRect(0, 0, w, yAxisCanvas.height); 
    yCtx.font = `bold ${Math.max(8, 11 * safeZoom)}px sans-serif`;
    yCtx.fillStyle = "#61afef";

    tracks.forEach(track => {
        const zoomBaseY = (track.baseY + (track.offsetY || 0)) * safeZoom;
        yCtx.beginPath(); yCtx.strokeStyle = "#e06c75"; yCtx.lineWidth = 2; yCtx.moveTo(0, zoomBaseY); yCtx.lineTo(w, zoomBaseY); yCtx.stroke();
        let currentY = zoomBaseY;
        (track.yLabels ||[]).forEach(section => {
            const sectionHeight = (parseInt(section.squares) || 1) * zoomGrid;
            const nextY = currentY - sectionHeight;
            yCtx.beginPath(); yCtx.strokeStyle = "#444a58"; yCtx.lineWidth = 1; yCtx.moveTo(w - 20, nextY); yCtx.lineTo(w, nextY); yCtx.stroke();
            yCtx.save(); yCtx.translate(w - 10, currentY - (sectionHeight / 2)); yCtx.rotate(-Math.PI / 2); yCtx.textAlign = "center"; yCtx.textBaseline = "middle";
            yCtx.fillStyle = "#61afef"; yCtx.fillText(section.text.toUpperCase(), 0, 0); yCtx.restore();
            currentY = nextY;
        });
    });
}

document.getElementById('workspace-wrapper').addEventListener('scroll', function() { yAxisCanvas.style.top = `-${this.scrollTop}px`; });
document.getElementById('total-duration').addEventListener('change', updateWorkspaceSize);
document.getElementById('grid-sec').addEventListener('input', (e) => { document.getElementById('legend-sec-val').innerText = e.target.value; updateWorkspaceSize(); });

// GESTIONE ZOOM
const updateZoom = () => { 
    document.documentElement.style.setProperty('--zoom', currentZoom); 
    document.getElementById('zoom-val').innerText = `${Math.round(currentZoom * 100)}%`; 
    drawTimeline(); drawYAxis(); 
};
document.getElementById('btn-zoom-in').addEventListener('click', () => { currentZoom = Math.min(3, currentZoom + 0.1); updateZoom(); });
document.getElementById('btn-zoom-out').addEventListener('click', () => { currentZoom = Math.max(0.2, currentZoom - 0.1); updateZoom(); });

// GESTIONE PINCH-TO-ZOOM (TOUCHPAD E MOBILE)
const wsWrapper = document.getElementById('workspace-wrapper');

// 1. Touchpad / Mouse + Ctrl
wsWrapper.addEventListener('wheel', (e) => {
    if (e.ctrlKey) {
        e.preventDefault(); // Previene lo zoom nativo della pagina
        const zoomSpeed = 0.01;
        currentZoom = Math.max(0.2, Math.min(3, currentZoom - (e.deltaY * zoomSpeed)));
        updateZoom();
    }
}, { passive: false });

// 2. Mobile (Pinch con due dita)
let initialPinchDist = null;
let initialPinchZoom = 1;

wsWrapper.addEventListener('touchstart', (e) => {
    if (e.touches.length === 2) {
        initialPinchDist = Math.hypot(
            e.touches[0].clientX - e.touches[1].clientX,
            e.touches[0].clientY - e.touches[1].clientY
        );
        initialPinchZoom = currentZoom;
    }
}, { passive: false });

wsWrapper.addEventListener('touchmove', (e) => {
    if (e.touches.length === 2 && initialPinchDist) {
        e.preventDefault(); // Previene lo scroll/zoom nativo durante il pinch
        const currentDist = Math.hypot(
            e.touches[0].clientX - e.touches[1].clientX,
            e.touches[0].clientY - e.touches[1].clientY
        );
        const scale = currentDist / initialPinchDist;
        currentZoom = Math.max(0.2, Math.min(3, initialPinchZoom * scale));
        updateZoom();
    }
}, { passive: false });

wsWrapper.addEventListener('touchend', (e) => {
    if (e.touches.length < 2) {
        initialPinchDist = null;
    }
});

// GESTIONE LEGENDA
const modalLegend = document.getElementById('legend-modal');
document.getElementById('btn-legend-edit').addEventListener('click', () => { renderLegendEditor(); modalLegend.style.display = 'flex'; });

function deleteLegendItem(index) { customLegend.splice(index, 1); renderLegendEditor(); updateVisualLegend(); } 
window.deleteLegendItem = deleteLegendItem;

function getShapeHtml(shape, color) {
    if (shape === 'color') return `<div style="width:16px;height:16px;background:${color};border-radius:50%;border:1px solid #777;flex-shrink:0;"></div>`;
    if (shape === 'rect') return `<div style="width:16px;height:16px;background:${color};border:1px solid #555;flex-shrink:0;box-sizing:border-box;"></div>`;
    if (shape === 'rectOutline') return `<div style="width:16px;height:16px;border:3px solid ${color};flex-shrink:0;box-sizing:border-box;"></div>`;
    if (shape === 'circle') return `<div style="width:16px;height:16px;border:3px solid ${color};border-radius:50%;flex-shrink:0;box-sizing:border-box;"></div>`;
    if (shape === 'line') return `<div style="width:18px;height:3px;background:${color};flex-shrink:0;"></div>`; 
    if (shape === 'text') return `<div style="font-weight:bold;font-family:serif;font-size:16px;color:${color};width:18px;text-align:center;flex-shrink:0;">T</div>`;
    if (shape === 'freehand') return `<svg width="18" height="18" viewBox="0 0 20 20" style="flex-shrink:0;"><path d="M2,18 Q5,2 10,10 T18,2" stroke="${color}" stroke-width="2" fill="none"/></svg>`;
    if (shape === 'image') return `<div style="font-size:14px;width:18px;text-align:center;flex-shrink:0;">🖼️</div>`;
    return '';
}

function renderLegendEditor() {
    const container = document.getElementById('legend-list-container'); container.innerHTML = '';
    if(customLegend.length === 0) { container.innerHTML = '<div style="color:#777; text-align:center; padding:10px;">Nessuna voce presente.</div>'; return; }
    customLegend.forEach((item, index) => {
        container.innerHTML += `<div class="legend-list-item" style="display:flex; justify-content:space-between; align-items:center; padding:8px 5px; border-bottom:1px solid #4a515e;"><div style="display:flex; align-items:center; gap:12px;">${getShapeHtml(item.shape, item.color)} <strong style="color:#abb2bf;">${item.text}</strong></div><button class="btn-clear" style="padding:4px 8px;" onclick="deleteLegendItem(${index})">✖</button></div>`;
    });
}

function updateVisualLegend() {
    const box = document.getElementById('visual-legend-box'), content = document.getElementById('visual-legend-content');
    if(customLegend.length === 0) { box.style.display = 'none'; return; } box.style.display = 'block';
    content.innerHTML = customLegend.map(item => `<div class="visual-legend-item" style="display:flex; align-items:center; gap:10px; margin-bottom:8px;">${getShapeHtml(item.shape, item.color)}<span style="color:#abb2bf; font-size:14px;">${item.text}</span></div>`).join('');
}

document.getElementById('btn-add-legend').addEventListener('click', () => {
    const s = document.getElementById('new-legend-type').value, c = document.getElementById('new-legend-color').value, t = document.getElementById('new-legend-text').value.trim();
    if(!t) return; customLegend.push({ shape:s, color:c, text:t }); document.getElementById('new-legend-text').value = ''; renderLegendEditor(); updateVisualLegend();
});

// GESTIONE PANNELLI
// function makePanelDraggable(panel, handle) { if (!panel || !handle) return; let isDraggingPanel = false, sx, sy, il, it; handle.addEventListener('pointerdown', (e) => { isDraggingPanel = true; sx = e.clientX; sy = e.clientY; const r = panel.getBoundingClientRect(); il = r.left; it = r.top; panel.style.left = il + 'px'; panel.style.top = it + 'px'; panel.style.right = 'auto'; panel.style.bottom = 'auto'; panel.style.margin = '0'; handle.setPointerCapture(e.pointerId); e.preventDefault(); }); handle.addEventListener('pointermove', (e) => { if (!isDraggingPanel) return; panel.style.left = `${il + e.clientX - sx}px`; panel.style.top = `${it + e.clientY - sy}px`; }); handle.addEventListener('pointerup', () => isDraggingPanel = false); }
/* SOSTITUISCI LA FUNZIONE makePanelDraggable ESISTENTE IN js/ui.js */

function makePanelDraggable(panel, handle) {
    if (!panel || !handle) return;
    let isDraggingPanel = false;
    let startX, startY, initialLeft, initialTop;

    // Doppio click per chiudere/aprire (Nuova aggiunta)
    handle.addEventListener('dblclick', (e) => {
        e.preventDefault();
        e.stopPropagation();
        panel.classList.toggle('collapsed');
    });

    handle.addEventListener('pointerdown', (e) => {
        isDraggingPanel = true;
        startX = e.clientX;
        startY = e.clientY;
        const rect = panel.getBoundingClientRect();
        initialLeft = rect.left;
        initialTop = rect.top;
        
        // Imposta posizione fissa per evitare salti durante il drag
        panel.style.left = initialLeft + 'px';
        panel.style.top = initialTop + 'px';
        panel.style.right = 'auto';
        panel.style.bottom = 'auto';
        panel.style.margin = '0'; 
        
        handle.setPointerCapture(e.pointerId);
        e.preventDefault();
    });

    handle.addEventListener('pointermove', (e) => {
        if (!isDraggingPanel) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        panel.style.left = `${initialLeft + dx}px`;
        panel.style.top = `${initialTop + dy}px`;
    });

    handle.addEventListener('pointerup', (e) => {
        isDraggingPanel = false;
        handle.releasePointerCapture(e.pointerId);
    });
}

makePanelDraggable(document.getElementById('controls'), document.querySelector('#controls .drag-handle'));
makePanelDraggable(document.getElementById('tracks-panel'), document.querySelector('#tracks-panel .drag-handle'));
makePanelDraggable(document.getElementById('text-tools-panel'), document.querySelector('#text-tools-panel .drag-handle'));
makePanelDraggable(document.getElementById('y-axis-panel'), document.querySelector('#y-axis-panel .drag-handle'));
makePanelDraggable(document.getElementById('background-layers-panel'), document.querySelector('#background-layers-panel .drag-handle'));

// GESTIONE ETICHETTE ASSE Y
document.getElementById('edit-y-labels-btn').addEventListener('click', () => { const t = getActiveTrack(); if(!t) return; const n = parseInt(ySectionsInput.value) || 1; t.ySectionsCount = n; yLabelsEditor.innerHTML = '<div class="y-label-row" style="font-weight:bold; margin-bottom:10px;"><span style="width:80px;">Sezione</span><span style="flex-grow:1;">Etichetta</span><span style="width:60px;">Quadretti</span></div>'; for(let i=0; i<n; i++){ const d = t.yLabels[i] || {text:"",squares:5}; yLabelsEditor.innerHTML += `<div class="y-label-row"><label style="width:80px;">#${i+1}</label><input type="text" id="y-label-text-${i}" value="${d.text}" style="flex-grow:1;"><input type="number" id="y-label-sq-${i}" value="${d.squares}" style="width:60px;" min="1"></div>`; } yLabelsModal.style.display = 'flex'; });
document.getElementById('save-y-labels-btn').addEventListener('click', () => { const t = getActiveTrack(); if(!t) return; const n = parseInt(ySectionsInput.value) || 1; t.yLabels =[]; for(let i=0; i<n; i++){ t.yLabels.push({ text: document.getElementById(`y-label-text-${i}`).value, squares: document.getElementById(`y-label-sq-${i}`).value }); } yLabelsModal.style.display = 'none'; drawYAxis(); saveHistoryState(); });
document.getElementById('close-y-labels-modal').addEventListener('click', () => yLabelsModal.style.display = 'none');
document.getElementById('close-legend-modal').addEventListener('click', () => modalLegend.style.display = 'none');
document.getElementById('close-symbols-modal').addEventListener('click', () => symbolsModal.style.display = 'none');
ySectionsInput.addEventListener('change', () => { const t = getActiveTrack(); if(t) t.ySectionsCount = parseInt(ySectionsInput.value); drawYAxis(); });

// GESTIONE LAYER SFONDO CON TRASFORMAZIONI
document.getElementById('add-bkg-layer-btn').addEventListener('click', () => document.getElementById('load-bkg-layer-input').click());
document.getElementById('load-bkg-layer-input').addEventListener('change', (e) => {
    for (const file of e.target.files) {
        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const data = JSON.parse(evt.target.result);
                let tracksData = data.tracks;
                if (!tracksData || tracksData.length === 0) {
                    tracksData =[{ baseY: 1000, svgContent: data.svgContent, htmlContent: data.galleryHTML }];
                }
                const layerId = 'bkg_' + Date.now() + Math.random();
                backgroundLayers.push({ 
                    id: layerId, name: data.title || file.name, data: { ...data, tracks: tracksData }, 
                    visible: true, offsetX: 0, offsetY: 0, scale: 1
                });
                renderBackgroundLayers();
            } catch (err) { alert("File di progetto non valido."); }
        };
        reader.readAsText(file);
    }
    e.target.value = '';
});

function renderBackgroundLayers() {
    const listContainer = document.getElementById('background-layers-list');
    const bkgContainer = document.getElementById('background-layers');
    listContainer.innerHTML = '';
    bkgContainer.innerHTML = '';
    
    backgroundLayers.forEach(layer => {
        listContainer.innerHTML += `
            <div class="layer-item" style="flex-direction: column; align-items: stretch; gap: 5px;">
                <div style="display:flex; align-items:center; gap:8px;">
                    <button onclick="toggleBkgLayer('${layer.id}')" style="background:none;border:none;color:#abb2bf;">${layer.visible ? '👁️' : '➖'}</button>
                    <span style="flex-grow:1; font-size:12px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${layer.name}</span>
                    <button class="btn-clear" onclick="removeBkgLayer('${layer.id}')" style="padding: 2px 5px;">✖</button>
                </div>
                <div style="display:flex; justify-content:space-between; font-size:10px; color:#abb2bf;">
                    <label>X: <input type="number" step="10" oninput="updateBkgTransform('${layer.id}', 'offsetX', this.value)" value="${layer.offsetX}" style="width:40px; padding:2px; font-size:10px;"></label>
                    <label>Y: <input type="number" step="10" oninput="updateBkgTransform('${layer.id}', 'offsetY', this.value)" value="${layer.offsetY}" style="width:40px; padding:2px; font-size:10px;"></label>
                    <label>Scl: <input type="number" step="0.05" oninput="updateBkgTransform('${layer.id}', 'scale', this.value)" value="${layer.scale}" style="width:40px; padding:2px; font-size:10px;"></label>
                </div>
            </div>`;

        const bkgSvg = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
        bkgSvg.id = `bkg-svg-${layer.id}`;
        bkgSvg.classList.add('bkg-layer');
        if (!layer.visible) bkgSvg.classList.add('hidden');
        
        bkgSvg.setAttribute('width', drawSvg.getAttribute('width'));
        bkgSvg.setAttribute('height', drawSvg.getAttribute('height'));
        
        layer.data.tracks.forEach((bkgTrack, index) => {
            const currentTrack = tracks[index] || tracks[tracks.length-1];
            if(bkgTrack.svgContent && currentTrack) {
                const g = document.createElementNS("http://www.w3.org/2000/svg", 'g');
                const currentVisualY = currentTrack.baseY + (currentTrack.offsetY || 0);
                const baseOffsetY = currentVisualY - bkgTrack.baseY;
                
                const finalX = layer.offsetX;
                const finalY = baseOffsetY + layer.offsetY;
                
                g.setAttribute('transform', `translate(${finalX}, ${finalY}) scale(${layer.scale})`);
                g.innerHTML = bkgTrack.svgContent;
                bkgSvg.appendChild(g);
            }
        });
        bkgContainer.appendChild(bkgSvg);
    });
}

window.updateBkgTransform = function(id, prop, value) {
    const layer = backgroundLayers.find(l => l.id === id);
    if(layer) {
        layer[prop] = parseFloat(value) || (prop === 'scale' ? 1 : 0);
        const bkgSvg = document.getElementById(`bkg-svg-${id}`);
        if (bkgSvg) {
            const groups = bkgSvg.querySelectorAll('g');
            groups.forEach((g, index) => {
                const bkgTrack = layer.data.tracks[index];
                const currentTrack = tracks[index] || tracks[tracks.length-1];
                if (bkgTrack && currentTrack) {
                    const currentVisualY = currentTrack.baseY + (currentTrack.offsetY || 0);
                    const baseOffsetY = currentVisualY - bkgTrack.baseY;
                    const finalX = layer.offsetX;
                    const finalY = baseOffsetY + layer.offsetY;
                    g.setAttribute('transform', `translate(${finalX}, ${finalY}) scale(${layer.scale})`);
                }
            });
        }
    }
};

function toggleBkgLayer(id) { const l = backgroundLayers.find(l => l.id === id); if(l) l.visible = !l.visible; renderBackgroundLayers(); }
function removeBkgLayer(id) { backgroundLayers = backgroundLayers.filter(l => l.id !== id); renderBackgroundLayers(); }
window.toggleBkgLayer = toggleBkgLayer; window.removeBkgLayer = removeBkgLayer;