/* js/musicxml.js */

const osmd = new opensheetmusicdisplay.OpenSheetMusicDisplay(tempContainer, { backend: "svg", drawTitle: false, drawSubtitle: false, drawComposer: false, drawLyrics: true, drawPartNames: false, drawFingerings: true, fillEmptyMeasures: false, drawingParameters: "compact" });

document.getElementById('file-input').addEventListener('change', async (e) => {
    if(!activeTrackId) return alert("Crea una traccia prima di importare.");
    const file = e.target.files[0]; if (!file) return; 
    
    const activeHtmlLayer = document.getElementById(`html-layer-${activeTrackId}`);
    activeHtmlLayer.innerHTML = ""; 
    const reader = new FileReader();
    
    reader.onload = async (event) => {
        try {
            await osmd.load(event.target.result); 
            const totalMeasures = osmd.Sheet.SourceMeasures.length;
            const trackBaseY = getActiveTrack().baseY;
            let currentX = GRID_SIZE, currentY = trackBaseY - 200, rowMaxHeight = 0;
            const maxAllowedWidth = timelineCanvas.width - 100;

            for (let i = 1; i <= totalMeasures; i++) {
                osmd.setOptions({ drawFromMeasureNumber: i, drawUpToMeasureNumber: i }); osmd.render();
                const svgElement = tempContainer.querySelector("svg");
                if (svgElement) {
                    const bbox = svgElement.getBBox(), wrapper = document.createElement('div');
                    wrapper.className = 'measure-box'; wrapper.style.zIndex = highestZ;
                    const label = document.createElement('span'); label.className = 'measure-label'; label.textContent = `M ${i}`;
                    wrapper.appendChild(label);
                    const svgClone = svgElement.cloneNode(true), pad = 5;
                    svgClone.setAttribute("viewBox", `${bbox.x - pad} ${bbox.y - pad} ${bbox.width + pad * 2} ${bbox.height + pad * 2}`);
                    svgClone.removeAttribute("width"); svgClone.removeAttribute("height"); svgClone.setAttribute("preserveAspectRatio", "xMidYMid meet");
                    const baseW = bbox.width + pad * 2, baseH = bbox.height + pad * 2;
                    wrapper.style.width = `${baseW}px`; wrapper.style.height = `${baseH + 25}px`; 
                    wrapper.appendChild(svgClone); activeHtmlLayer.appendChild(wrapper);
                    
                    if (currentX + baseW > maxAllowedWidth) { currentX = GRID_SIZE; currentY += rowMaxHeight + GRID_SIZE; currentY = Math.ceil(currentY / GRID_SIZE) * GRID_SIZE; rowMaxHeight = 0; }
                    wrapper.style.left = `${currentX}px`; wrapper.style.top = `${currentY}px`;
                    currentX += baseW + GRID_SIZE; currentX = Math.ceil(currentX / GRID_SIZE) * GRID_SIZE; rowMaxHeight = Math.max(rowMaxHeight, baseH + 25);
                    makeDraggable(wrapper);
                } await new Promise(r => setTimeout(r, 5)); 
            }
            saveHistoryState();
        } catch (err) { console.error(err); }
    }; reader.readAsText(file);
});

function makeDraggable(el) {
    let startX, startY, initialLeft, initialTop;
    el.addEventListener('pointerdown', (e) => {
        // Blocca il drag se il box non è nel layer attivo
        if(el.closest('div.track-layer').id !== `html-layer-${activeTrackId}`) return;
        
        const rect = el.getBoundingClientRect(); if ((e.clientX > rect.right - 18) && (e.clientY > rect.bottom - 18)) return; 
        e.preventDefault(); el.setPointerCapture(e.pointerId); el.style.cursor = "grabbing";
        highestZ++; el.style.zIndex = highestZ; startX = e.clientX; startY = e.clientY;
        initialLeft = parseInt(el.style.left, 10) || 0; initialTop = parseInt(el.style.top, 10) || 0;
        el.addEventListener('pointermove', onPointerMove); el.addEventListener('pointerup', onPointerUp);
    });
    function onPointerMove(e) {
        const dx = (e.clientX - startX) / currentZoom, dy = (e.clientY - startY) / currentZoom;
        let newLeft = initialLeft + dx, newTop = initialTop + dy;
        if (snapCheckbox.checked) { newLeft = Math.round(newLeft / GRID_SIZE) * GRID_SIZE; newTop = Math.round(newTop / GRID_SIZE) * GRID_SIZE; }
        if (newLeft < 0) newLeft = 0; if (newTop < 0) newTop = 0;
        el.style.left = `${newLeft}px`; el.style.top = `${newTop}px`;
    }
    function onPointerUp(e) { el.style.cursor = "grab"; el.releasePointerCapture(e.pointerId); el.removeEventListener('pointermove', onPointerMove); el.removeEventListener('pointerup', onPointerUp); saveHistoryState(); }
}