/* js/history.js */

function saveHistoryState() {
    if (historyStep < actionHistory.length - 1) {
        actionHistory = actionHistory.slice(0, historyStep + 1);
    }

    // Salva una copia profonda dei dati delle tracce
    const tracksCopy = JSON.parse(JSON.stringify(tracks));
    tracksCopy.forEach(t => {
        const svgLayer = document.getElementById(`svg-layer-${t.id}`);
        const htmlLayer = document.getElementById(`html-layer-${t.id}`);
        t.svgContent = svgLayer ? svgLayer.innerHTML : '';
        t.htmlContent = htmlLayer ? htmlLayer.innerHTML : '';
    });
    
    actionHistory.push(tracksCopy);
    
    if (actionHistory.length > MAX_HISTORY) {
        actionHistory.shift();
    } else {
        historyStep++;
    }
    updateUndoRedoUI();
}

function restoreState(tracksData) {
    if(typeof selectElement === 'function') selectElement(null); 
    
    tracks = JSON.parse(JSON.stringify(tracksData)); // Ripristina dati tracce
    
    drawSvg.innerHTML = '';
    gallery.innerHTML = '';

    tracks.forEach(t => {
        const svgGroup = document.createElementNS("http://www.w3.org/2000/svg", 'g');
        svgGroup.id = `svg-layer-${t.id}`;
        svgGroup.classList.add('track-layer');
        svgGroup.innerHTML = t.svgContent || '';
        drawSvg.appendChild(svgGroup);

        const htmlGroup = document.createElement('div');
        htmlGroup.id = `html-layer-${t.id}`;
        htmlGroup.classList.add('track-layer');
        htmlGroup.innerHTML = t.htmlContent || '';
        gallery.appendChild(htmlGroup);
    });

    renderTrackSelector();
    switchTrack(activeTrackId); // Mantiene la traccia attiva
    
    // Riattiva il Drag&Drop per le battute musicali
    let maxZ = 100;
    document.querySelectorAll('.measure-box').forEach(box => {
        if(typeof makeDraggable === 'function') makeDraggable(box);
        const z = parseInt(box.style.zIndex, 10);
        if (!isNaN(z) && z > maxZ) maxZ = z;
    });
    highestZ = maxZ;
}

function performUndo() {
    if (historyStep > 0) {
        historyStep--;
        restoreState(actionHistory[historyStep]);
        updateUndoRedoUI();
    }
}

function performRedo() {
    if (historyStep < actionHistory.length - 1) {
        historyStep++;
        restoreState(actionHistory[historyStep]);
        updateUndoRedoUI();
    }
}

function updateUndoRedoUI() {
    document.getElementById('btn-undo').disabled = historyStep <= 0;
    document.getElementById('btn-redo').disabled = historyStep >= actionHistory.length - 1;
}

document.getElementById('btn-undo').addEventListener('click', performUndo);
document.getElementById('btn-redo').addEventListener('click', performRedo);

document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z') { e.preventDefault(); performUndo(); }
        if (e.key === 'y') { e.preventDefault(); performRedo(); }
    }
});