// Gestione stato cursore UI e Visibilità Pannelli Strumenti
toolSelect.addEventListener('change', () => {
    const tool = toolSelect.value;
    
    // Gestione Cursore
    drawSvg.className = tool === 'select' ? 'select-active' : (snapCheckbox.checked ? 'snap-active' : '');
    
    // Deseleziona eventuali elementi attivi
    if(tool !== 'select') selectElement(null);

    // Gestione Visibilità Pannelli
    if (tool === 'text') {
        textToolsPanel.style.display = 'flex';
        standardControls.style.display = 'flex'; 
    } else {
        textToolsPanel.style.display = 'none';
        standardControls.style.display = 'flex';
    }

    // Gestione Upload Immagine
    if (tool === 'image') {
        imgUploadInput.click();
        standardControls.style.display = 'none'; 
    }
});

snapCheckbox.addEventListener('change', () => toolSelect.dispatchEvent(new Event('change')));

// CHIUSURA PANNELLO TESTO
if(btnCloseTextPanel) {
    btnCloseTextPanel.addEventListener('click', () => {
        textToolsPanel.style.display = 'none';
        toolSelect.value = 'select'; // Torna allo strumento selezione
        toolSelect.dispatchEvent(new Event('change'));
    });
}

// GESTIONE MODAL SIMBOLI MUSICALI
if(btnOpenSymbols) {
    btnOpenSymbols.addEventListener('click', () => {
        symbolsModal.style.display = 'flex';
    });
}

if(btnCloseSymbols) {
    btnCloseSymbols.addEventListener('click', () => {
        symbolsModal.style.display = 'none';
    });
}

// Gestione Caricamento Immagine
imgUploadInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (evt) => {
            uploadedImgData = evt.target.result; 
            if (toolSelect.value !== 'image') toolSelect.value = 'image';
        };
        reader.readAsDataURL(file);
    }
});

function getCanvasPos(e) {
    const rect = drawSvg.getBoundingClientRect();
    let x = (e.clientX - rect.left) / currentZoom, y = (e.clientY - rect.top) / currentZoom;
    if (snapCheckbox.checked && !isDragging && !isResizing) { 
        x = Math.round(x / GRID_SIZE) * GRID_SIZE; y = Math.round(y / GRID_SIZE) * GRID_SIZE;
    }
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

// Funzione Helper per aggiornare la posizione della maniglia di resize
function updateResizeHandle() {
    if (selectedElement && selectedElement.tagName === 'image' && resizeHandle) {
        const x = parseFloat(selectedElement.getAttribute('x'));
        const y = parseFloat(selectedElement.getAttribute('y'));
        const w = parseFloat(selectedElement.getAttribute('width'));
        const h = parseFloat(selectedElement.getAttribute('height'));
        const tx = parseFloat(selectedElement.getAttribute('data-tx')) || 0;
        const ty = parseFloat(selectedElement.getAttribute('data-ty')) || 0;
        
        // Posiziona la maniglia nell'angolo in basso a destra dell'immagine
        // Applicando la stessa trasformazione dell'immagine
        resizeHandle.setAttribute('x', x + w - 5); 
        resizeHandle.setAttribute('y', y + h - 5);
        resizeHandle.setAttribute('transform', `translate(${tx}, ${ty})`);
    }
}

function selectElement(el) {
    // Rimuovi vecchia maniglia se esiste
    if (resizeHandle) {
        resizeHandle.remove();
        resizeHandle = null;
    }

    if (selectedElement) selectedElement.classList.remove('selected-svg-element');
    
    if (el && el !== drawSvg) {
        selectedElement = el;
        selectedElement.classList.add('selected-svg-element');
        btnDeleteElement.style.display = 'inline-block';
        
        // Se è un'immagine, crea la maniglia di ridimensionamento
        if (el.tagName === 'image') {
            resizeHandle = document.createElementNS("http://www.w3.org/2000/svg", 'rect');
            resizeHandle.setAttribute('width', '10');
            resizeHandle.setAttribute('height', '10');
            resizeHandle.classList.add('resize-handle');
            drawSvg.appendChild(resizeHandle);
            updateResizeHandle();
        }

    } else {
        selectedElement = null;
        btnDeleteElement.style.display = 'none';
    }
}

function deleteElement(el) {
    if (!el) return;
    document.querySelectorAll(`use[href="#${el.id}"]`).forEach(u => u.remove());
    el.remove();
    selectElement(null);
    saveHistoryState(); 
}

btnDeleteElement.addEventListener('click', () => deleteElement(selectedElement));

// Aggiornamento stile elemento in tempo reale
const updateSelectedProperties = () => {
    if (!selectedElement) return;
    const colorObj = getDrawColor();
    const size = document.getElementById('draw-size').value; 
    
    if (selectedElement.tagName === 'text') {
        selectedElement.setAttribute('fill', colorObj.rgbaStr);
        const specificTextSize = document.getElementById('text-font-size').value;
        if(textToolsPanel.style.display !== 'none') {
             selectedElement.setAttribute('font-size', specificTextSize);
        } else {
             selectedElement.setAttribute('font-size', size * 6 + 10);
        }
    } else if (selectedElement.tagName !== 'image') {
        selectedElement.setAttribute('stroke', colorObj.rgbaStr);
        selectedElement.setAttribute('stroke-width', size);
        const currentFill = selectedElement.getAttribute('fill');
        if (currentFill !== 'transparent' && currentFill !== 'none') {
            selectedElement.setAttribute('fill', colorObj.rgbaStr);
        }
    }
};

document.getElementById('draw-color').addEventListener('input', updateSelectedProperties);
document.getElementById('draw-opacity').addEventListener('input', updateSelectedProperties);
document.getElementById('draw-size').addEventListener('input', updateSelectedProperties);
document.getElementById('text-font-size').addEventListener('input', () => {
    if(selectedElement && selectedElement.tagName === 'text') {
        selectedElement.setAttribute('font-size', document.getElementById('text-font-size').value);
        saveHistoryState();
    }
});

const savePropChange = () => { if(selectedElement) saveHistoryState(); };
document.getElementById('draw-color').addEventListener('change', savePropChange);
document.getElementById('draw-opacity').addEventListener('change', savePropChange);
document.getElementById('draw-size').addEventListener('change', savePropChange);

// LOGICA MOUSE (POINTER EVENTS)
drawSvg.addEventListener('pointerdown', (e) => {
    const tool = toolSelect.value;
    const pos = getCanvasPos(e);
    let target = e.target;
    
    // Gestione click su maniglia di ridimensionamento
    if (target === resizeHandle) {
        isResizing = true;
        drawStartX = pos.x; 
        drawStartY = pos.y;
        drawSvg.setPointerCapture(e.pointerId);
        e.stopPropagation(); // Evita di selezionare altro
        return;
    }

    if (target.tagName === 'use') target = document.querySelector(target.getAttribute('href'));

    // SELEZIONE E SPOSTAMENTO
    if (tool === 'select') {
        if (target !== drawSvg) {
            selectElement(target);
            isDragging = true; drawStartX = pos.x; drawStartY = pos.y;
            target.setAttribute('data-start-tx', target.getAttribute('data-tx') || 0);
            target.setAttribute('data-start-ty', target.getAttribute('data-ty') || 0);
            drawSvg.setPointerCapture(e.pointerId);
        } else selectElement(null);
        return;
    }

    // GOMMA
    if (tool === 'eraser') {
        if (target !== drawSvg) deleteElement(target);
        return;
    }

    // SECCHIELLO
    if (tool === 'fill') {
        if (target !== drawSvg && target.tagName !== 'line' && target.tagName !== 'text' && target.tagName !== 'image') {
            target.setAttribute('fill', getDrawColor().rgbaStr);
            saveHistoryState();
        }
        return;
    }

    // TESTO AVANZATO
    if (tool === 'text') {
        const content = textContentInput.value;
        if (content && content.trim() !== "") {
            const txtEl = createSVGShape('text');
            const colorObj = getDrawColor();
            const fontName = textFontSelect.value;
            const fontSize = textSizeInput.value;
            
            txtEl.setAttribute('x', pos.x); 
            txtEl.setAttribute('y', pos.y);
            txtEl.setAttribute('fill', colorObj.rgbaStr);
            txtEl.setAttribute('font-family', fontName);
            txtEl.setAttribute('font-size', fontSize);
            txtEl.setAttribute('font-weight', 'normal'); 
            txtEl.setAttribute('dominant-baseline', 'middle');
            txtEl.textContent = content;
            
            drawSvg.appendChild(txtEl);
            saveHistoryState();
        } else {
            alert("Scrivi qualcosa nel pannello testo in alto prima di cliccare!");
            textContentInput.focus();
        }
        return;
    }

    // INSERIMENTO IMMAGINE
    if (tool === 'image') {
        if (uploadedImgData) {
            const imgEl = createSVGShape('image');
            imgEl.setAttribute('x', pos.x);
            imgEl.setAttribute('y', pos.y);
            imgEl.setAttribute('href', uploadedImgData);
            imgEl.setAttribute('width', '200');
            imgEl.setAttribute('height', '200');
            
            drawSvg.appendChild(imgEl);
            saveHistoryState();
        } else {
            alert("Nessuna immagine caricata. Seleziona il file.");
            imgUploadInput.click();
        }
        return;
    }

    // INIZIO DISEGNO FORME/TRATTI
    isDrawing = true; drawStartX = pos.x; drawStartY = pos.y;
    const colorObj = getDrawColor();
    const size = document.getElementById('draw-size').value;

    let tag = 'path';
    if (tool === 'line') tag = 'line';
    if (tool === 'rect' || tool === 'rectFill') tag = 'rect';
    if (tool === 'circle') tag = 'circle';

    currentDrawing = createSVGShape(tag);
    currentDrawing.setAttribute('stroke', colorObj.rgbaStr);
    currentDrawing.setAttribute('stroke-width', size);
    
    if (tool === 'rectFill') currentDrawing.setAttribute('fill', colorObj.rgbaStr);
    else if (tag === 'line' || tag === 'path') {
        currentDrawing.setAttribute('fill', 'none');
        currentDrawing.setAttribute('stroke-linecap', 'round');
        currentDrawing.setAttribute('stroke-linejoin', 'round');
    } else currentDrawing.setAttribute('fill', 'transparent');

    if (tag === 'path') currentDrawing.setAttribute('d', `M ${pos.x} ${pos.y}`);
    if (tag === 'line') { currentDrawing.setAttribute('x1', pos.x); currentDrawing.setAttribute('y1', pos.y); currentDrawing.setAttribute('x2', pos.x); currentDrawing.setAttribute('y2', pos.y); }
    if (tag === 'rect') { currentDrawing.setAttribute('x', pos.x); currentDrawing.setAttribute('y', pos.y); currentDrawing.setAttribute('width', 0); currentDrawing.setAttribute('height', 0); }
    if (tag === 'circle') { currentDrawing.setAttribute('cx', pos.x); currentDrawing.setAttribute('cy', pos.y); currentDrawing.setAttribute('r', 0); }

    drawSvg.appendChild(currentDrawing);

    // Applica Mirroring
    if (mirrorCheckbox.checked) {
        const mirrorClone = document.createElementNS("http://www.w3.org/2000/svg", 'use');
        mirrorClone.setAttribute('href', `#${currentDrawing.id}`);
        mirrorClone.setAttribute('transform', `translate(0, ${WORKSPACE_CENTER_Y * 2}) scale(1, -1)`);
        mirrorClone.style.pointerEvents = 'all';
        drawSvg.appendChild(mirrorClone);
    }
});

drawSvg.addEventListener('pointermove', (e) => {
    const pos = getCanvasPos(e);

    // LOGICA RIDIMENSIONAMENTO IMMAGINE
    if (isResizing && selectedElement && selectedElement.tagName === 'image') {
        const tx = parseFloat(selectedElement.getAttribute('data-tx')) || 0;
        const ty = parseFloat(selectedElement.getAttribute('data-ty')) || 0;
        const currentX = parseFloat(selectedElement.getAttribute('x')) + tx;
        const currentY = parseFloat(selectedElement.getAttribute('y')) + ty;
        
        // Calcola nuova larghezza e altezza basata sulla posizione mouse
        let newW = pos.x - currentX;
        let newH = pos.y - currentY;
        
        // Impedisci dimensioni negative o troppo piccole
        if (newW < 20) newW = 20;
        if (newH < 20) newH = 20;
        
        selectedElement.setAttribute('width', newW);
        selectedElement.setAttribute('height', newH);
        
        updateResizeHandle();
        return;
    }

    // Spostamento elemento
    if (isDragging && selectedElement) {
        let dx = pos.x - drawStartX, dy = pos.y - drawStartY;
        let newTx = parseFloat(selectedElement.getAttribute('data-start-tx')) + dx;
        let newTy = parseFloat(selectedElement.getAttribute('data-start-ty')) + dy;
        if (snapCheckbox.checked) {
            newTx = Math.round(newTx / GRID_SIZE) * GRID_SIZE; newTy = Math.round(newTy / GRID_SIZE) * GRID_SIZE;
        }
        selectedElement.setAttribute('transform', `translate(${newTx}, ${newTy})`);
        selectedElement.setAttribute('data-tx', newTx); selectedElement.setAttribute('data-ty', newTy);
        
        updateResizeHandle(); // Aggiorna posizione maniglia se presente
        return;
    }

    if (toolSelect.value === 'eraser' && e.buttons === 1) {
        let target = e.target;
        if (target.tagName === 'use') target = document.querySelector(target.getAttribute('href'));
        if (target !== drawSvg) deleteElement(target);
        return;
    }

    if (!isDrawing || !currentDrawing) return;
    const tool = toolSelect.value;

    if (tool === 'freehand') {
        currentDrawing.setAttribute('d', currentDrawing.getAttribute('d') + ` L ${pos.x} ${pos.y}`);
    } else if (tool === 'line') {
        currentDrawing.setAttribute('x2', pos.x); currentDrawing.setAttribute('y2', pos.y);
    } else if (tool === 'rect' || tool === 'rectFill') {
        let x = Math.min(drawStartX, pos.x), y = Math.min(drawStartY, pos.y);
        let w = Math.abs(pos.x - drawStartX), h = Math.abs(pos.y - drawStartY);
        currentDrawing.setAttribute('x', x); currentDrawing.setAttribute('y', y);
        currentDrawing.setAttribute('width', w); currentDrawing.setAttribute('height', h);
    } else if (tool === 'circle') {
        let r = Math.sqrt(Math.pow(pos.x - drawStartX, 2) + Math.pow(pos.y - drawStartY, 2));
        currentDrawing.setAttribute('r', r);
    }
});

drawSvg.addEventListener('pointerup', (e) => { 
    if (isDrawing || isDragging || isResizing) {
        isDrawing = false; isDragging = false; isResizing = false;
        drawSvg.releasePointerCapture(e.pointerId); 
        saveHistoryState(); 
    }
});

document.getElementById('clear-canvas').addEventListener('click', () => {
    if(confirm("Pulire tutti i disegni e testi? (Le battute musicali e la timeline rimarranno)")) {
        drawSvg.innerHTML = '';
        selectElement(null);
        saveHistoryState();
    }
});