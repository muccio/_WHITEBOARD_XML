function saveHistoryState() {
    // Tronca la cronologia se abbiamo fatto "Undo" e compiamo una nuova azione
    if (historyStep < actionHistory.length - 1) {
        actionHistory = actionHistory.slice(0, historyStep + 1);
    }
    
    actionHistory.push({
        svg: drawSvg.innerHTML,
        gallery: gallery.innerHTML
    });
    
    if (actionHistory.length > MAX_HISTORY) {
        actionHistory.shift();
    } else {
        historyStep++;
    }
    updateUndoRedoUI();
}

function restoreState(state) {
    if(typeof selectElement === 'function') selectElement(null); 
    
    drawSvg.innerHTML = state.svg;
    gallery.innerHTML = state.gallery;
    
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

// Event Listeners Undo/Redo
document.getElementById('btn-undo').addEventListener('click', performUndo);
document.getElementById('btn-redo').addEventListener('click', performRedo);

// Scorciatoie Tastiera
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z') { e.preventDefault(); performUndo(); }
        if (e.key === 'y') { e.preventDefault(); performRedo(); }
    }
});