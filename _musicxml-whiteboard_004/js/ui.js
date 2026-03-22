/* js/ui.js */

// GESTIONE TRACCE (INIT & SWITCH)
function initTracks() {
    if (tracks.length === 0) addTrack("Strumento 1");
    else { renderTrackSelector(); switchTrack(tracks[0].id); }
}

function addTrack(name) {
    const id = 'track_' + Date.now();
    const newIndex = tracks.length;
    const baseY = 1000 + (newIndex * TRACK_HEIGHT_SPACING); 
    const newTrack = { id, name: name || `Traccia ${newIndex + 1}`, baseY, yLabels:[], ySectionsCount: 4, svgContent: '', htmlContent: '' };
    tracks.push(newTrack);
    const svgGroup = document.createElementNS("http://www.w3.org/2000/svg", 'g');
    svgGroup.id = `svg-layer-${id}`; svgGroup.classList.add('track-layer'); drawSvg.appendChild(svgGroup);
    const htmlGroup = document.createElement('div');
    htmlGroup.id = `html-layer-${id}`; htmlGroup.classList.add('track-layer'); gallery.appendChild(htmlGroup);
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
    if(track) document.getElementById('workspace-wrapper').scrollTop = (track.baseY * currentZoom) - (window.innerHeight / 2);
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
    const neededHeight = tracks.length * TRACK_HEIGHT_SPACING + 1000, finalHeight = Math.max(5000, neededHeight);
    const workspace = document.getElementById('workspace');
    workspace.style.width = `${newWidth}px`; workspace.style.height = `${finalHeight}px`;
    timelineCanvas.width = newWidth; timelineCanvas.height = finalHeight;
    drawSvg.setAttribute('width', newWidth); drawSvg.setAttribute('height', finalHeight);
    document.querySelectorAll('.bkg-layer svg').forEach(svg => { svg.setAttribute('width', newWidth); svg.setAttribute('height', finalHeight); });
    drawTimeline(); drawYAxis();
}

function drawTimeline() {
    if(!tCtx) return;
    const w = timelineCanvas.width, h = timelineCanvas.height, secPerSquare = parseFloat(document.getElementById('grid-sec').value) || 1, hideSmall = hideSmallTicksCheckbox.checked;
    tCtx.clearRect(0, 0, w, h); 
    tCtx.font = "bold 14px sans-serif"; tCtx.textAlign = "center"; tCtx.textBaseline = "top";
    tracks.forEach(track => {
        const baseY = track.baseY;
        tCtx.beginPath(); tCtx.strokeStyle = "#e06c75"; tCtx.lineWidth = 3; tCtx.moveTo(0, baseY); tCtx.lineTo(w, baseY); tCtx.stroke();
        tCtx.fillStyle = "#abb2bf"; tCtx.strokeStyle = "#e06c75";
        for (let x = 0; x <= w; x += GRID_SIZE) {
            let i = x / GRID_SIZE, isMajorTick = (i % 5 === 0);
            if (isMajorTick) { tCtx.lineWidth = 2; tCtx.moveTo(x, baseY - 12); tCtx.lineTo(x, baseY + 12); tCtx.fillText(parseFloat((i * secPerSquare).toFixed(2)) + "s", x, baseY + 15); } 
            else if (!hideSmall) { tCtx.lineWidth = 1; tCtx.moveTo(x, baseY - 5); tCtx.lineTo(x, baseY + 5); }
        } tCtx.stroke();
    });
}

function drawYAxis() { /* Logica invariata */
    if (!yCtx) return;
    const zoomGrid = GRID_SIZE * currentZoom, totalHeight = timelineCanvas.height * currentZoom; yAxisCanvas.height = totalHeight;
    const w = yAxisCanvas.width; yCtx.clearRect(0, 0, w, totalHeight); yCtx.font = `bold ${Math.max(8, 11 * currentZoom)}px sans-serif`;
    tracks.forEach(track => {
        const zoomBaseY = track.baseY * currentZoom;
        yCtx.beginPath(); yCtx.strokeStyle = "#e06c75"; yCtx.lineWidth = 2; yCtx.moveTo(0, zoomBaseY); yCtx.lineTo(w, zoomBaseY); yCtx.stroke();
        let currentY = zoomBaseY;
        (track.yLabels || []).forEach(section => {
            const sectionHeight = (parseInt(section.squares) || 1) * zoomGrid, nextY = currentY - sectionHeight;
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
const updateZoom = () => { document.documentElement.style.setProperty('--zoom', currentZoom); document.getElementById('zoom-val').innerText = `${Math.round(currentZoom * 100)}%`; drawYAxis(); };
document.getElementById('btn-zoom-in').addEventListener('click', () => { currentZoom = Math.min(3, currentZoom + 0.1); updateZoom(); });
document.getElementById('btn-zoom-out').addEventListener('click', () => { currentZoom = Math.max(0.2, currentZoom - 0.1); updateZoom(); });

// GESTIONE LEGENDA
const modalLegend = document.getElementById('legend-modal');
document.getElementById('btn-legend-edit').addEventListener('click', () => { renderLegendEditor(); modalLegend.style.display = 'flex'; });
function deleteLegendItem(index) { customLegend.splice(index, 1); renderLegendEditor(); updateVisualLegend(); } window.deleteLegendItem = deleteLegendItem;
function getShapeHtml(shape, color) {
    if (shape === 'color') return `<div style="width:18px;height:18px;background:${color};border-radius:50%;"></div>`; if (shape === 'rect') return `<div style="width:16px;height:16px;background:${color};"></div>`;
    if (shape === 'rectOutline') return `<div style="width:16px;height:16px;border:3px solid ${color};"></div>`; if (shape === 'circle') return `<div style="width:16px;height:16px;border:3px solid ${color};border-radius:50%;"></div>`;
    if (shape === 'line') return `<div style="width:18px;height:3px;background:${color};"></div>`; if (shape === 'text') return `<div style="font-weight:bold;font-size:16px;color:${color};">T</div>`;
    if (shape === 'freehand') return `<svg width="18" height="18" viewBox="0 0 20 20"><path d="M2,18 Q5,2 10,10 T18,2" stroke="${color}" stroke-width="2" fill="none"/></svg>`;
    if (shape === 'image') return `🖼️`; return '';
}
function renderLegendEditor() {
    const c = document.getElementById('legend-list-container'); c.innerHTML = '';
    if(customLegend.length === 0){ c.innerHTML = '<p>Nessuna voce.</p>'; return; }
    customLegend.forEach((i, idx) => c.innerHTML += `<div class="legend-list-item"><div>${getShapeHtml(i.shape, i.color)} <strong>${i.text}</strong></div><button class="btn-clear" onclick="deleteLegendItem(${idx})">X</button></div>`);
}
function updateVisualLegend() {
    const b = document.getElementById('visual-legend-box'), c = document.getElementById('visual-legend-content');
    if(customLegend.length === 0){ b.style.display = 'none'; return; } b.style.display = 'block';
    c.innerHTML = customLegend.map(i => `<div class="visual-legend-item">${getShapeHtml(i.shape, i.color)}<span>${i.text}</span></div>`).join('');
}
document.getElementById('btn-add-legend').addEventListener('click', () => {
    const s = document.getElementById('new-legend-type').value, c = document.getElementById('new-legend-color').value, t = document.getElementById('new-legend-text').value.trim();
    if(!t) return; customLegend.push({ shape:s, color:c, text:t }); document.getElementById('new-legend-text').value = ''; renderLegendEditor(); updateVisualLegend();
});

// GESTIONE PANNELLI
function makePanelDraggable(panel, handle) { if (!panel || !handle) return; let isDraggingPanel = false, sx, sy, il, it; handle.addEventListener('pointerdown', (e) => { isDraggingPanel = true; sx = e.clientX; sy = e.clientY; const r = panel.getBoundingClientRect(); il = r.left; it = r.top; panel.style.left = il + 'px'; panel.style.top = it + 'px'; panel.style.right = 'auto'; panel.style.bottom = 'auto'; handle.setPointerCapture(e.pointerId); e.preventDefault(); }); handle.addEventListener('pointermove', (e) => { if (!isDraggingPanel) return; panel.style.left = `${il + e.clientX - sx}px`; panel.style.top = `${it + e.clientY - sy}px`; }); handle.addEventListener('pointerup', () => isDraggingPanel = false); }
makePanelDraggable(document.getElementById('controls'), document.querySelector('#controls .drag-handle'));
makePanelDraggable(document.getElementById('tracks-panel'), document.querySelector('#tracks-panel .drag-handle'));
makePanelDraggable(document.getElementById('text-tools-panel'), document.querySelector('#text-tools-panel .drag-handle'));
makePanelDraggable(document.getElementById('y-axis-panel'), document.querySelector('#y-axis-panel .drag-handle'));
makePanelDraggable(document.getElementById('background-layers-panel'), document.querySelector('#background-layers-panel .drag-handle'));

// GESTIONE ETICHETTE ASSE Y
document.getElementById('edit-y-labels-btn').addEventListener('click', () => { const t = getActiveTrack(); if(!t) return; const n = parseInt(ySectionsInput.value) || 1; t.ySectionsCount = n; yLabelsEditor.innerHTML = '<div style="display:flex;justify-content:space-between;font-weight:bold;"><span>Etichetta</span><span>Quadretti</span></div>'; for(let i=0; i<n; i++){ const d = t.yLabels[i] || {text:"",squares:5}; yLabelsEditor.innerHTML += `<div class="y-label-row">#${i+1}<input type="text" id="y-label-text-${i}" value="${d.text}"><input type="number" id="y-label-sq-${i}" value="${d.squares}" min="1"></div>`; } yLabelsModal.style.display = 'flex'; });
document.getElementById('save-y-labels-btn').addEventListener('click', () => { const t = getActiveTrack(); if(!t) return; const n = parseInt(ySectionsInput.value) || 1; t.yLabels = []; for(let i=0; i<n; i++){ t.yLabels.push({ text: document.getElementById(`y-label-text-${i}`).value, squares: document.getElementById(`y-label-sq-${i}`).value }); } yLabelsModal.style.display = 'none'; drawYAxis(); saveHistoryState(); });
document.getElementById('close-y-labels-modal').addEventListener('click', () => yLabelsModal.style.display = 'none');
document.getElementById('close-legend-modal').addEventListener('click', () => modalLegend.style.display = 'none');
document.getElementById('close-symbols-modal').addEventListener('click', () => symbolsModal.style.display = 'none');
ySectionsInput.addEventListener('change', () => { const t = getActiveTrack(); if(t) t.ySectionsCount = parseInt(ySectionsInput.value); drawYAxis(); });

// GESTIONE LAYER SFONDO
document.getElementById('add-bkg-layer-btn').addEventListener('click', () => document.getElementById('load-bkg-layer-input').click());
document.getElementById('load-bkg-layer-input').addEventListener('change', (e) => {
    for (const file of e.target.files) {
        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const data = JSON.parse(evt.target.result);
                if (!data.tracks) throw new Error("File non valido");
                const layerId = 'bkg_' + Date.now() + Math.random();
                backgroundLayers.push({ id: layerId, name: data.title || file.name, data, visible: true });
                renderBackgroundLayers();
            } catch (err) { alert("File di progetto non valido."); }
        };
        reader.readAsText(file);
    }
    e.target.value = ''; // Permette di ricaricare lo stesso file
});

function renderBackgroundLayers() {
    const listContainer = document.getElementById('background-layers-list');
    const bkgContainer = document.getElementById('background-layers');
    listContainer.innerHTML = '';
    bkgContainer.innerHTML = '';
    
    backgroundLayers.forEach(layer => {
        // Aggiungi alla lista UI
        listContainer.innerHTML += `
            <div class="layer-item">
                <button onclick="toggleBkgLayer('${layer.id}')" style="background:none;border:none;">${layer.visible ? '👁️' : '➖'}</button>
                <span>${layer.name}</span>
                <button class="btn-clear" onclick="removeBkgLayer('${layer.id}')" style="padding: 2px 5px;">✖</button>
            </div>`;

        // Renderizza il contenuto SVG
        const scaleMismatch = parseFloat(layer.data.gridSec) !== parseFloat(document.getElementById('grid-sec').value);
        if (scaleMismatch && layer.visible) {
            console.warn(`Attenzione: il layer "${layer.name}" ha una scala temporale (s/q) diversa dal progetto corrente.`);
        }

        const bkgSvg = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
        bkgSvg.classList.add('bkg-layer');
        if (!layer.visible) bkgSvg.classList.add('hidden');
        bkgSvg.setAttribute('width', drawSvg.getAttribute('width'));
        bkgSvg.setAttribute('height', drawSvg.getAttribute('height'));
        
        // Sovrapponi le tracce
        layer.data.tracks.forEach((bkgTrack, index) => {
            const currentTrack = tracks[index];
            if(bkgTrack.svgContent && currentTrack) {
                const g = document.createElementNS("http://www.w3.org/2000/svg", 'g');
                const yOffset = currentTrack.baseY - bkgTrack.baseY;
                g.setAttribute('transform', `translate(0, ${yOffset})`);
                g.innerHTML = bkgTrack.svgContent;
                bkgSvg.appendChild(g);
            }
        });
        bkgContainer.appendChild(bkgSvg);
    });
}

function toggleBkgLayer(id) {
    const layer = backgroundLayers.find(l => l.id === id);
    if(layer) layer.visible = !layer.visible;
    renderBackgroundLayers();
}

function removeBkgLayer(id) {
    backgroundLayers = backgroundLayers.filter(l => l.id !== id);
    renderBackgroundLayers();
}
window.toggleBkgLayer = toggleBkgLayer;
window.removeBkgLayer = removeBkgLayer;