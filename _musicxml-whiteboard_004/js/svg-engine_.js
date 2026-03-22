/* js/svg-engine.js */

toolSelect.addEventListener('change', () => {
    const tool = toolSelect.value;
    bezierStep = 0; bezierPoints =[]; if (tempBezierGroup) tempBezierGroup.remove();
    drawSvg.className = tool === 'select' ? 'select-active' : (snapCheckbox.checked ? 'snap-active' : '');
    if(tool !== 'select') selectElement(null); 
    textToolsPanel.style.display = (tool === 'text') ? 'flex' : 'none';
    standardControls.style.display = (tool === 'image') ? 'none' : 'flex'; 
    if (tool === 'image') imgUploadInput.click();
});

snapCheckbox.addEventListener('change', () => toolSelect.dispatchEvent(new Event('change')));
if(btnCloseTextPanel) btnCloseTextPanel.addEventListener('click', () => { textToolsPanel.style.display = 'none'; toolSelect.value = 'select'; toolSelect.dispatchEvent(new Event('change')); });
if(btnOpenSymbols) btnOpenSymbols.addEventListener('click', () => symbolsModal.style.display = 'flex');
if(btnCloseSymbols) btnCloseSymbols.addEventListener('click', () => symbolsModal.style.display = 'none');

imgUploadInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (evt) => { uploadedImgData = evt.target.result; if (toolSelect.value !== 'image') toolSelect.value = 'image'; };
        reader.readAsDataURL(file);
    }
});

function getCanvasPos(e) {
    const rect = drawSvg.getBoundingClientRect();
    let x = (e.clientX - rect.left) / currentZoom, y = (e.clientY - rect.top) / currentZoom;
    if (snapCheckbox.checked && !isDragging && !isResizing) { x = Math.round(x / GRID_SIZE) * GRID_SIZE; y = Math.round(y / GRID_SIZE) * GRID_SIZE; }
    return { x, y };
}

function getDrawColor() {
    const hex = document.getElementById('draw-color').value, alpha = document.getElementById('draw-opacity').value;
    const r = parseInt(hex.slice(1,3), 16), g = parseInt(hex.slice(3,5), 16), b = parseInt(hex.slice(5,7), 16);
    return { rgbaStr: `rgba(${r},${g},${b},${alpha})`, hex };
}

function createSVGShape(type) {
    const el = document.createElementNS("http://www.w3.org/2000/svg", type);
    el.id = 'svg_' + Date.now() + Math.floor(Math.random()*1000);
    el.setAttribute('data-tx', '0'); el.setAttribute('data-ty', '0');
    el.style.pointerEvents = 'all'; 
    return el;
}

function updateResizeHandle() {
    if (selectedElement && selectedElement.tagName === 'image' && resizeHandle) {
        const x = parseFloat(selectedElement.getAttribute('x')), y = parseFloat(selectedElement.getAttribute('y'));
        const w = parseFloat(selectedElement.getAttribute('width')), h = parseFloat(selectedElement.getAttribute('height'));
        const tx = parseFloat(selectedElement.getAttribute('data-tx')) || 0, ty = parseFloat(selectedElement.getAttribute('data-ty')) || 0;
        resizeHandle.setAttribute('x', x + w - 5); resizeHandle.setAttribute('y', y + h - 5);
        resizeHandle.setAttribute('transform', `translate(${tx}, ${ty})`);
    }
}

let shapeControls = { group: null, points: [], lines:[], targetShape: null };

function selectElement(el) {
    if (shapeControls.group) { shapeControls.group.remove(); shapeControls.group = null; }
    if (resizeHandle) { resizeHandle.remove(); resizeHandle = null; }
    if (selectedElement) selectedElement.classList.remove('selected-svg-element');
    
    // Controlla se l'elemento appartiene al layer attivo prima di selezionarlo
    const activeLayer = document.getElementById(`svg-layer-${activeTrackId}`);
    
    if (el && el !== drawSvg && el.closest('g.track-layer') === activeLayer) {
        selectedElement = el;
        selectedElement.classList.add('selected-svg-element');
        btnDeleteElement.style.display = 'inline-block';
        
        if (el.tagName === 'image') {
            resizeHandle = createSVGShape('rect');
            resizeHandle.setAttribute('width', '10'); resizeHandle.setAttribute('height', '10');
            resizeHandle.classList.add('resize-handle');
            activeLayer.appendChild(resizeHandle);
            updateResizeHandle();
        } else if (el.dataset.bezier ||['line', 'rect', 'circle'].includes(el.tagName)) {
            drawShapeControls(el, activeLayer);
        }
    } else {
        selectedElement = null;
        btnDeleteElement.style.display = 'none';
    }
}

function deleteElement(el) {
    if (!el) return;
    document.querySelectorAll(`use[href="#${el.id}"]`).forEach(u => u.remove());
    el.remove(); selectElement(null); saveHistoryState(); 
}

btnDeleteElement.addEventListener('click', () => deleteElement(selectedElement));

const updateSelectedProperties = () => {
    if (!selectedElement) return;
    const colorObj = getDrawColor(), size = document.getElementById('draw-size').value; 
    if (selectedElement.tagName === 'text') {
        selectedElement.setAttribute('fill', colorObj.rgbaStr);
        if(textToolsPanel.style.display !== 'none') selectedElement.setAttribute('font-size', document.getElementById('text-font-size').value);
        else selectedElement.setAttribute('font-size', size * 6 + 10);
    } else if (selectedElement.tagName !== 'image') {
        selectedElement.setAttribute('stroke', colorObj.rgbaStr); selectedElement.setAttribute('stroke-width', size);
        const currentFill = selectedElement.getAttribute('fill');
        if (currentFill !== 'transparent' && currentFill !== 'none') selectedElement.setAttribute('fill', colorObj.rgbaStr);
    }
};

document.getElementById('draw-color').addEventListener('input', updateSelectedProperties);
document.getElementById('draw-opacity').addEventListener('input', updateSelectedProperties);
document.getElementById('draw-size').addEventListener('input', updateSelectedProperties);
document.getElementById('text-font-size').addEventListener('input', () => { if(selectedElement && selectedElement.tagName === 'text') { selectedElement.setAttribute('font-size', document.getElementById('text-font-size').value); saveHistoryState(); }});
const savePropChange = () => { if(selectedElement) saveHistoryState(); };
document.getElementById('draw-color').addEventListener('change', savePropChange); document.getElementById('draw-opacity').addEventListener('change', savePropChange); document.getElementById('draw-size').addEventListener('change', savePropChange);

function handleBezierDrawing(pos, activeLayer) {
    bezierStep++; bezierPoints.push(pos);
    if (bezierStep === 1) { 
        tempBezierGroup = createSVGShape('g'); activeLayer.appendChild(tempBezierGroup);
        const startPoint = createSVGShape('circle'); startPoint.setAttribute('cx', pos.x); startPoint.setAttribute('cy', pos.y); startPoint.setAttribute('r', '4'); startPoint.setAttribute('fill', 'red'); tempBezierGroup.appendChild(startPoint);
    } else if (bezierStep === 4) { 
        const[p1, c1, c2, p2] = bezierPoints;
        const path = createSVGShape('path'); path.dataset.bezier = "true";
        path.dataset.p1x = p1.x; path.dataset.p1y = p1.y; path.dataset.c1x = c1.x; path.dataset.c1y = c1.y; path.dataset.c2x = c2.x; path.dataset.c2y = c2.y; path.dataset.p2x = p2.x; path.dataset.p2y = p2.y;
        path.setAttribute('d', `M ${p1.x},${p1.y} C ${c1.x},${c1.y} ${c2.x},${c2.y} ${p2.x},${p2.y}`);
        path.setAttribute('stroke', getDrawColor().rgbaStr); path.setAttribute('stroke-width', document.getElementById('draw-size').value); path.setAttribute('fill', 'none');
        
        activeLayer.appendChild(path);

        if (mirrorCheckbox.checked) {
            const mirrorClone = createSVGShape('use'); mirrorClone.setAttribute('href', `#${path.id}`);
            const trackBaseY = getActiveTrack().baseY;
            mirrorClone.setAttribute('transform', `translate(0, ${trackBaseY * 2}) scale(1, -1)`);
            activeLayer.appendChild(mirrorClone);
        }
        tempBezierGroup.remove(); bezierStep = 0; bezierPoints =[]; saveHistoryState();
    }
}

function drawShapeControls(shape, activeLayer) {
    const group = createSVGShape('g'); shapeControls.group = group; shapeControls.points =[]; shapeControls.lines =[]; shapeControls.targetShape = shape;
    const addPoint = (x, y, index) => { const p = createSVGShape('circle'); p.setAttribute('cx', x); p.setAttribute('cy', y); p.setAttribute('r', '5'); p.classList.add('bezier-control-point'); p.dataset.pointIndex = index; group.appendChild(p); shapeControls.points.push(p); };
    if (shape.dataset.bezier) {
        const p1 = { x: +shape.dataset.p1x, y: +shape.dataset.p1y }, c1 = { x: +shape.dataset.c1x, y: +shape.dataset.c1y }, c2 = { x: +shape.dataset.c2x, y: +shape.dataset.c2y }, p2 = { x: +shape.dataset.p2x, y: +shape.dataset.p2y };
        addPoint(p1.x, p1.y, 0); addPoint(c1.x, c1.y, 1); addPoint(c2.x, c2.y, 2); addPoint(p2.x, p2.y, 3);
        const l1 = createSVGShape('line'); l1.setAttribute('x1', p1.x); l1.setAttribute('y1', p1.y); l1.setAttribute('x2', c1.x); l1.setAttribute('y2', c1.y); l1.classList.add('bezier-control-line');
        const l2 = createSVGShape('line'); l2.setAttribute('x1', p2.x); l2.setAttribute('y1', p2.y); l2.setAttribute('x2', c2.x); l2.setAttribute('y2', c2.y); l2.classList.add('bezier-control-line');
        group.prepend(l1, l2); shapeControls.lines.push(l1, l2);
    } else if (shape.tagName === 'line') { addPoint(+shape.getAttribute('x1'), +shape.getAttribute('y1'), 0); addPoint(+shape.getAttribute('x2'), +shape.getAttribute('y2'), 1); } 
    else if (shape.tagName === 'rect') { addPoint(+shape.getAttribute('x') + +shape.getAttribute('width'), +shape.getAttribute('y') + +shape.getAttribute('height'), 0); } 
    else if (shape.tagName === 'circle') { addPoint(+shape.getAttribute('cx') + +shape.getAttribute('r'), +shape.getAttribute('cy'), 0); }
    activeLayer.appendChild(group);
}

function updateShape() {
    const shape = shapeControls.targetShape; if (!shape) return;
    const points = shapeControls.points;
    if (shape.dataset.bezier) {
        const[p1, c1, c2, p2] = points.map(p => ({ x: +p.getAttribute('cx'), y: +p.getAttribute('cy') }));
        shape.setAttribute('d', `M ${p1.x},${p1.y} C ${c1.x},${c1.y} ${c2.x},${c2.y} ${p2.x},${p2.y}`);
        shape.dataset.p1x = p1.x; shape.dataset.p1y = p1.y; shape.dataset.c1x = c1.x; shape.dataset.c1y = c1.y; shape.dataset.c2x = c2.x; shape.dataset.c2y = c2.y; shape.dataset.p2x = p2.x; shape.dataset.p2y = p2.y;
        shapeControls.lines[0].setAttribute('x1', p1.x); shapeControls.lines[0].setAttribute('y1', p1.y); shapeControls.lines[0].setAttribute('x2', c1.x); shapeControls.lines[0].setAttribute('y2', c1.y);
        shapeControls.lines[1].setAttribute('x1', p2.x); shapeControls.lines[1].setAttribute('y1', p2.y); shapeControls.lines[1].setAttribute('x2', c2.x); shapeControls.lines[1].setAttribute('y2', c2.y);
    } else if (shape.tagName === 'line') { shape.setAttribute('x1', points[0].getAttribute('cx')); shape.setAttribute('y1', points[0].getAttribute('cy')); shape.setAttribute('x2', points[1].getAttribute('cx')); shape.setAttribute('y2', points[1].getAttribute('cy')); } 
    else if (shape.tagName === 'rect') { const x = +shape.getAttribute('x'), y = +shape.getAttribute('y'); const newW = +points[0].getAttribute('cx') - x, newH = +points[0].getAttribute('cy') - y; if (newW > 0) shape.setAttribute('width', newW); if (newH > 0) shape.setAttribute('height', newH); } 
    else if (shape.tagName === 'circle') { const cx = +shape.getAttribute('cx'), cy = +shape.getAttribute('cy'); const newR = Math.sqrt(Math.pow(+points[0].getAttribute('cx') - cx, 2) + Math.pow(+points[0].getAttribute('cy') - cy, 2)); if (newR > 0) shape.setAttribute('r', newR); }
}

drawSvg.addEventListener('pointerdown', (e) => {
    if(!activeTrackId) return;
    const activeLayer = document.getElementById(`svg-layer-${activeTrackId}`);
    const tool = toolSelect.value, pos = getCanvasPos(e);
    let target = e.target;
    
    if (target.classList.contains('bezier-control-point')) { isDragging = true; selectedElement = target; drawSvg.setPointerCapture(e.pointerId); e.stopPropagation(); return; }
    if (target === resizeHandle) { isResizing = true; drawStartX = pos.x; drawStartY = pos.y; drawSvg.setPointerCapture(e.pointerId); e.stopPropagation(); return; }
    if (target.tagName === 'use') target = document.querySelector(target.getAttribute('href'));

    if (tool === 'select') {
        if (target !== drawSvg && target.closest('g.track-layer') === activeLayer) {
            selectElement(target); isDragging = true; drawStartX = pos.x; drawStartY = pos.y;
            target.setAttribute('data-start-tx', target.getAttribute('data-tx') || 0); target.setAttribute('data-start-ty', target.getAttribute('data-ty') || 0);
            drawSvg.setPointerCapture(e.pointerId);
        } else selectElement(null);
        return;
    }

    if (tool === 'bezier') { handleBezierDrawing(pos, activeLayer); return; }
    if (tool === 'eraser') { if (target !== drawSvg && target.closest('g.track-layer') === activeLayer) deleteElement(target); return; }
    if (tool === 'fill') {
        if (target !== drawSvg && target.closest('g.track-layer') === activeLayer && !['line','text','image'].includes(target.tagName)) {
            target.setAttribute('fill', getDrawColor().rgbaStr); saveHistoryState();
        } return;
    }
    if (tool === 'text') {
        const content = textContentInput.value;
        if (content && content.trim() !== "") {
            const txtEl = createSVGShape('text');
            txtEl.setAttribute('x', pos.x); txtEl.setAttribute('y', pos.y); txtEl.setAttribute('fill', getDrawColor().rgbaStr); txtEl.setAttribute('font-family', textFontSelect.value); txtEl.setAttribute('font-size', textSizeInput.value); txtEl.setAttribute('font-weight', 'normal'); txtEl.setAttribute('dominant-baseline', 'middle'); txtEl.textContent = content;
            activeLayer.appendChild(txtEl); saveHistoryState();
        } else { alert("Scrivi qualcosa nel pannello testo prima di cliccare!"); textContentInput.focus(); } return;
    }
    if (tool === 'image') {
        if (uploadedImgData) {
            const imgEl = createSVGShape('image'); imgEl.setAttribute('x', pos.x); imgEl.setAttribute('y', pos.y); imgEl.setAttribute('href', uploadedImgData); imgEl.setAttribute('width', '200'); imgEl.setAttribute('height', '200');
            activeLayer.appendChild(imgEl); saveHistoryState();
        } else { alert("Nessuna immagine caricata."); imgUploadInput.click(); } return;
    }

    isDrawing = true; drawStartX = pos.x; drawStartY = pos.y;
    const colorObj = getDrawColor(), size = document.getElementById('draw-size').value;
    let tag = 'path'; if (tool === 'line') tag = 'line'; if (tool === 'rect' || tool === 'rectFill') tag = 'rect'; if (tool === 'circle') tag = 'circle';

    currentDrawing = createSVGShape(tag);
    currentDrawing.setAttribute('stroke', colorObj.rgbaStr); currentDrawing.setAttribute('stroke-width', size);
    if (tool === 'rectFill') currentDrawing.setAttribute('fill', colorObj.rgbaStr);
    else if (tag === 'line' || tag === 'path') { currentDrawing.setAttribute('fill', 'none'); currentDrawing.setAttribute('stroke-linecap', 'round'); currentDrawing.setAttribute('stroke-linejoin', 'round'); } 
    else currentDrawing.setAttribute('fill', 'transparent');

    if (tag === 'path') currentDrawing.setAttribute('d', `M ${pos.x} ${pos.y}`);
    if (tag === 'line') { currentDrawing.setAttribute('x1', pos.x); currentDrawing.setAttribute('y1', pos.y); currentDrawing.setAttribute('x2', pos.x); currentDrawing.setAttribute('y2', pos.y); }
    if (tag === 'rect') { currentDrawing.setAttribute('x', pos.x); currentDrawing.setAttribute('y', pos.y); currentDrawing.setAttribute('width', 0); currentDrawing.setAttribute('height', 0); }
    if (tag === 'circle') { currentDrawing.setAttribute('cx', pos.x); currentDrawing.setAttribute('cy', pos.y); currentDrawing.setAttribute('r', 0); }

    activeLayer.appendChild(currentDrawing);

    if (mirrorCheckbox.checked) {
        const mirrorClone = createSVGShape('use'); mirrorClone.setAttribute('href', `#${currentDrawing.id}`);
        const trackBaseY = getActiveTrack().baseY;
        mirrorClone.setAttribute('transform', `translate(0, ${trackBaseY * 2}) scale(1, -1)`);
        activeLayer.appendChild(mirrorClone);
    }
});

drawSvg.addEventListener('pointermove', (e) => {
    const pos = getCanvasPos(e);
    if (isDragging && selectedElement) {
        if (selectedElement.classList.contains('bezier-control-point')) { selectedElement.setAttribute('cx', pos.x); selectedElement.setAttribute('cy', pos.y); updateShape(); return; }
        let dx = pos.x - drawStartX, dy = pos.y - drawStartY;
        let newTx = parseFloat(selectedElement.getAttribute('data-start-tx')) + dx, newTy = parseFloat(selectedElement.getAttribute('data-start-ty')) + dy;
        if (snapCheckbox.checked) { newTx = Math.round(newTx / GRID_SIZE) * GRID_SIZE; newTy = Math.round(newTy / GRID_SIZE) * GRID_SIZE; }
        selectedElement.setAttribute('transform', `translate(${newTx}, ${newTy})`); selectedElement.setAttribute('data-tx', newTx); selectedElement.setAttribute('data-ty', newTy);
        updateResizeHandle(); if (shapeControls.group) shapeControls.group.setAttribute('transform', `translate(${newTx}, ${newTy})`); return;
    }
    if (isResizing && selectedElement && selectedElement.tagName === 'image') {
        const tx = parseFloat(selectedElement.getAttribute('data-tx')) || 0, ty = parseFloat(selectedElement.getAttribute('data-ty')) || 0;
        let newW = pos.x - (parseFloat(selectedElement.getAttribute('x')) + tx), newH = pos.y - (parseFloat(selectedElement.getAttribute('y')) + ty);
        if (newW < 20) newW = 20; if (newH < 20) newH = 20;
        selectedElement.setAttribute('width', newW); selectedElement.setAttribute('height', newH); updateResizeHandle(); return;
    }
    if (toolSelect.value === 'eraser' && e.buttons === 1) {
        let target = e.target; if (target.tagName === 'use') target = document.querySelector(target.getAttribute('href'));
        if (target !== drawSvg && target.closest('g.track-layer') === document.getElementById(`svg-layer-${activeTrackId}`)) deleteElement(target); return;
    }
    
    if (toolSelect.value === 'bezier' && bezierStep > 0 && tempBezierGroup) {
        while (tempBezierGroup.lastChild.tagName !== 'circle') tempBezierGroup.lastChild.remove();
        const [p1, c1, c2] = bezierPoints;
        if (bezierStep === 1) { const line = createSVGShape('line'); line.setAttribute('x1', p1.x); line.setAttribute('y1', p1.y); line.setAttribute('x2', pos.x); line.setAttribute('y2', pos.y); line.classList.add('bezier-control-line'); tempBezierGroup.appendChild(line); } 
        else if (bezierStep === 2) { const line = createSVGShape('line'); line.setAttribute('x1', p1.x); line.setAttribute('y1', p1.y); line.setAttribute('x2', c1.x); line.setAttribute('y2', c1.y); line.classList.add('bezier-control-line'); const curve = createSVGShape('path'); curve.setAttribute('d', `M ${p1.x},${p1.y} C ${c1.x},${c1.y} ${pos.x},${pos.y} ${pos.x},${pos.y}`); curve.setAttribute('stroke', '#aaa'); curve.setAttribute('stroke-width', '2'); curve.setAttribute('fill', 'none'); tempBezierGroup.append(line, curve); } 
        else if (bezierStep === 3) { const l1 = createSVGShape('line'); l1.setAttribute('x1', p1.x); l1.setAttribute('y1', p1.y); l1.setAttribute('x2', c1.x); l1.setAttribute('y2', c1.y); l1.classList.add('bezier-control-line'); const l2 = createSVGShape('line'); l2.setAttribute('x1', pos.x); l2.setAttribute('y1', pos.y); l2.setAttribute('x2', c2.x); l2.setAttribute('y2', c2.y); l2.classList.add('bezier-control-line'); const curve = createSVGShape('path'); curve.setAttribute('d', `M ${p1.x},${p1.y} C ${c1.x},${c1.y} ${c2.x},${c2.y} ${pos.x},${pos.y}`); curve.setAttribute('stroke', getDrawColor().rgbaStr); curve.setAttribute('stroke-width', document.getElementById('draw-size').value); curve.setAttribute('fill', 'none'); tempBezierGroup.append(l1, l2, curve); }
    }

    if (!isDrawing || !currentDrawing) return;
    const tool = toolSelect.value;
    if (tool === 'freehand') currentDrawing.setAttribute('d', currentDrawing.getAttribute('d') + ` L ${pos.x} ${pos.y}`);
    else if (tool === 'line') { currentDrawing.setAttribute('x2', pos.x); currentDrawing.setAttribute('y2', pos.y); }
    else if (tool === 'rect' || tool === 'rectFill') {
        currentDrawing.setAttribute('x', Math.min(drawStartX, pos.x)); currentDrawing.setAttribute('y', Math.min(drawStartY, pos.y));
        currentDrawing.setAttribute('width', Math.abs(pos.x - drawStartX)); currentDrawing.setAttribute('height', Math.abs(pos.y - drawStartY));
    } else if (tool === 'circle') { currentDrawing.setAttribute('r', Math.sqrt(Math.pow(pos.x - drawStartX, 2) + Math.pow(pos.y - drawStartY, 2))); }
});

drawSvg.addEventListener('pointerup', (e) => { 
    if (isDrawing || isDragging || isResizing) {
        if(isDragging && selectedElement.classList.contains('bezier-control-point')) selectElement(shapeControls.targetShape);
        isDrawing = false; isDragging = false; isResizing = false; drawSvg.releasePointerCapture(e.pointerId); 
        if (toolSelect.value !== 'bezier') saveHistoryState(); 
    }
});

document.getElementById('clear-canvas').addEventListener('click', () => {
    if(confirm("Pulire tutti i disegni della TRACCIA ATTIVA?")) {
        document.getElementById(`svg-layer-${activeTrackId}`).innerHTML = '';
        selectElement(null); saveHistoryState();
    }
});