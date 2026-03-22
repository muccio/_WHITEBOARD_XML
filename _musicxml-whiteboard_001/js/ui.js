/* js/ui.js */

// GESTIONE DIMENSIONI WORKSPACE (DURATA) E TIMELINE
function updateWorkspaceSize() {
    const totalSec = parseFloat(document.getElementById('total-duration').value) || 300;
    const secPerSquare = parseFloat(document.getElementById('grid-sec').value) || 1;
    
    let newWidth = (totalSec / secPerSquare) * GRID_SIZE + 200; 
    newWidth = Math.max(newWidth, window.innerWidth); 

    const workspace = document.getElementById('workspace');
    workspace.style.width = `${newWidth}px`;
    timelineCanvas.width = newWidth;
    drawSvg.setAttribute('width', newWidth);

    drawTimeline();
}

function drawTimeline() {
    const w = timelineCanvas.width, h = timelineCanvas.height;
    const secPerSquare = parseFloat(document.getElementById('grid-sec').value) || 1;
    
    tCtx.clearRect(0, 0, w, h); 
    tCtx.beginPath(); tCtx.strokeStyle = "#e06c75"; tCtx.lineWidth = 3; 
    tCtx.moveTo(0, WORKSPACE_CENTER_Y); tCtx.lineTo(w, WORKSPACE_CENTER_Y); tCtx.stroke();
    
    tCtx.beginPath(); tCtx.strokeStyle = "#e06c75"; tCtx.fillStyle = "#abb2bf"; 
    tCtx.font = "bold 14px sans-serif"; tCtx.textAlign = "center"; tCtx.textBaseline = "top";
    
    for (let x = 0; x <= w; x += GRID_SIZE) {
        let i = x / GRID_SIZE;
        if (i % 5 === 0) { 
            tCtx.lineWidth = 2; tCtx.moveTo(x, WORKSPACE_CENTER_Y - 12); tCtx.lineTo(x, WORKSPACE_CENTER_Y + 12); 
            tCtx.fillText(parseFloat((i * secPerSquare).toFixed(2)) + "s", x, WORKSPACE_CENTER_Y + 15); 
        } else { 
            tCtx.lineWidth = 1; tCtx.moveTo(x, WORKSPACE_CENTER_Y - 5); tCtx.lineTo(x, WORKSPACE_CENTER_Y + 5); 
        }
    } 
    tCtx.stroke();
}

document.getElementById('total-duration').addEventListener('change', updateWorkspaceSize);
document.getElementById('grid-sec').addEventListener('input', (e) => { 
    document.getElementById('legend-sec-val').innerText = e.target.value; 
    updateWorkspaceSize(); 
});

// GESTIONE ZOOM
const updateZoom = () => { 
    document.documentElement.style.setProperty('--zoom', currentZoom); 
    document.getElementById('zoom-val').innerText = `${Math.round(currentZoom * 100)}%`; 
};
document.getElementById('btn-zoom-in').addEventListener('click', () => { currentZoom = Math.min(3, currentZoom + 0.1); updateZoom(); });
document.getElementById('btn-zoom-out').addEventListener('click', () => { currentZoom = Math.max(0.2, currentZoom - 0.1); updateZoom(); });

// GESTIONE LEGENDA VISIVA E POPUP
const modal = document.getElementById('legend-modal');
document.getElementById('btn-legend-edit').addEventListener('click', () => { renderLegendEditor(); modal.style.display = 'flex'; });

document.getElementById('btn-add-legend').addEventListener('click', () => {
    const shape = document.getElementById('new-legend-type').value;
    const color = document.getElementById('new-legend-color').value;
    const text = document.getElementById('new-legend-text').value.trim();
    if(!text) return alert("Inserisci un testo esplicativo!");
    customLegend.push({ shape, color, text }); 
    document.getElementById('new-legend-text').value = ''; 
    renderLegendEditor(); updateVisualLegend();
});

function deleteLegendItem(index) { 
    customLegend.splice(index, 1); 
    renderLegendEditor(); 
    updateVisualLegend(); 
}

window.deleteLegendItem = deleteLegendItem;

function getShapeHtml(shape, color) {
    if (shape === 'color') return `<div style="width:18px; height:18px; background:${color}; border-radius:50%; border: 1px solid #ccc; box-shadow: 0 1px 3px rgba(0,0,0,0.2);"></div>`;
    if (shape === 'rect') return `<div style="width:16px; height:16px; background:${color}; border: 1px solid #333;"></div>`;
    if (shape === 'rectOutline') return `<div style="width:16px; height:16px; border: 3px solid ${color};"></div>`;
    if (shape === 'circle') return `<div style="width:16px; height:16px; background:${color}; border-radius:50%; border: 1px solid #333;"></div>`;
    if (shape === 'line') return `<div style="width:18px; height:3px; background:${color}; margin-top:6px;"></div>`; 
    if (shape === 'text') return `<div style="font-weight:bold; font-family:serif; font-size:16px; color:${color};">T</div>`;
    if (shape === 'freehand') return `<svg width="18" height="18" viewBox="0 0 20 20"><path d="M2,18 Q5,2 10,10 T18,2" stroke="${color}" stroke-width="2" fill="none"/></svg>`;
    if (shape === 'image') return `<div style="width:16px; height:16px; background:#eee; border:1px solid #999; display:flex; justify-content:center; align-items:center; color:#555; font-size:8px;">IMG</div>`;
    return '';
}

function renderLegendEditor() {
    const container = document.getElementById('legend-list-container'); 
    container.innerHTML = '';
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

// LOGICA TRASCINAMENTO PANNELLI
function makePanelDraggable(panel, handle) {
    if (!panel || !handle) return;
    let isDraggingPanel = false;
    let startX, startY, initialLeft, initialTop;

    handle.addEventListener('pointerdown', (e) => {
        isDraggingPanel = true;
        startX = e.clientX;
        startY = e.clientY;
        
        const rect = panel.getBoundingClientRect();
        initialLeft = rect.left;
        initialTop = rect.top;

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

makePanelDraggable(document.getElementById('controls'), document.getElementById('main-drag-handle'));
makePanelDraggable(document.getElementById('text-tools-panel'), document.getElementById('text-drag-handle'));