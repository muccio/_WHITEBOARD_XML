/* js/musicxml.js */

const osmd = new opensheetmusicdisplay.OpenSheetMusicDisplay(tempContainer, { 
    backend: "svg", 
    drawTitle: false, 
    drawSubtitle: false, 
    drawComposer: false, 
    drawLyrics: true, 
    drawPartNames: false, 
    drawFingerings: true, 
    fillEmptyMeasures: false, 
    drawingParameters: "compact" 
});

document.getElementById('file-input').addEventListener('change', async (e) => {
    if(!activeTrackId) return alert("Crea una traccia prima di importare.");
    
    const file = e.target.files[0]; 
    if (!file) return; 
    
    const activeHtmlLayer = document.getElementById(`html-layer-${activeTrackId}`);
    if (!activeHtmlLayer) {
        console.error("Layer HTML non trovato.");
        return;
    }

    activeHtmlLayer.innerHTML = ""; 
    
    const reader = new FileReader();
    
    reader.onload = async (event) => {
        try {
            await osmd.load(event.target.result); 
            const totalMeasures = osmd.Sheet.SourceMeasures.length;
            const track = getActiveTrack();
            const trackBaseY = track ? track.baseY : 2500;
            
            let currentX = GRID_SIZE;
            let currentY = trackBaseY - 200; 
            let rowMaxHeight = 0;
            const maxAllowedWidth = timelineCanvas.width - 100;

            for (let i = 1; i <= totalMeasures; i++) {
                osmd.setOptions({ drawFromMeasureNumber: i, drawUpToMeasureNumber: i }); 
                osmd.render();
                
                const svgElement = tempContainer.querySelector("svg");
                if (svgElement) {
                    const bbox = svgElement.getBBox();
                    
                    const wrapper = document.createElement('div');
                    wrapper.className = 'measure-box'; 
                    highestZ++; 
                    wrapper.style.zIndex = highestZ;
                    
                    const label = document.createElement('span'); 
                    label.className = 'measure-label'; 
                    label.textContent = `M ${i}`;
                    wrapper.appendChild(label);
                    
                    const svgClone = svgElement.cloneNode(true);
                    const pad = 5;
                    svgClone.setAttribute("viewBox", `${bbox.x - pad} ${bbox.y - pad} ${bbox.width + pad * 2} ${bbox.height + pad * 2}`);
                    svgClone.removeAttribute("width"); 
                    svgClone.removeAttribute("height"); 
                    svgClone.setAttribute("preserveAspectRatio", "xMidYMid meet");
                    
                    const baseW = bbox.width + pad * 2;
                    const baseH = bbox.height + pad * 2;
                    wrapper.style.width = `${baseW}px`; 
                    wrapper.style.height = `${baseH + 25}px`; 
                    
                    wrapper.appendChild(svgClone); 
                    activeHtmlLayer.appendChild(wrapper);
                    
                    if (currentX + baseW > maxAllowedWidth) { 
                        currentX = GRID_SIZE; 
                        currentY += rowMaxHeight + GRID_SIZE; 
                        currentY = Math.ceil(currentY / GRID_SIZE) * GRID_SIZE; 
                        rowMaxHeight = 0; 
                    }
                    
                    wrapper.style.left = `${currentX}px`; 
                    wrapper.style.top = `${currentY}px`;
                    
                    currentX += baseW + GRID_SIZE; 
                    currentX = Math.ceil(currentX / GRID_SIZE) * GRID_SIZE; 
                    rowMaxHeight = Math.max(rowMaxHeight, baseH + 25);
                    
                    makeDraggable(wrapper);
                } 
                await new Promise(r => setTimeout(r, 5)); 
            }
            saveHistoryState();
        } catch (err) { 
            console.error(err); 
            alert("Errore durante l'elaborazione del file MusicXML.");
        }
    }; 
    reader.readAsText(file);
});

function makeDraggable(el) {
    let startX, startY, initialLeft, initialTop;
    el.addEventListener('pointerdown', (e) => {
        const activeLayerId = `html-layer-${activeTrackId}`;
        if (activeTrackId && el.closest('div.track-layer').id !== activeLayerId) return;
        
        const rect = el.getBoundingClientRect(); 
        if ((e.clientX > rect.right - 18) && (e.clientY > rect.bottom - 18)) return; 
        
        e.preventDefault(); 
        e.stopPropagation(); 

        if(typeof selectElement === 'function') selectElement(null);
        if (selectedMeasureBox && selectedMeasureBox !== el) selectedMeasureBox.classList.remove('selected');
        selectedMeasureBox = el;
        el.classList.add('selected');
        if(btnDeleteElement) btnDeleteElement.style.display = 'inline-block';

        if (e.altKey) {
            const clone = el.cloneNode(true);
            clone.classList.remove('selected'); 
            highestZ++;
            clone.style.zIndex = highestZ;
            document.getElementById(activeLayerId).appendChild(clone);
            makeDraggable(clone);
            selectedMeasureBox.classList.remove('selected');
            selectedMeasureBox = clone;
            clone.classList.add('selected');
            el = clone; 
        }

        el.setPointerCapture(e.pointerId); 
        el.style.cursor = "grabbing";
        highestZ++; 
        el.style.zIndex = highestZ; 
        startX = e.clientX; 
        startY = e.clientY;
        initialLeft = parseInt(el.style.left, 10) || 0; 
        initialTop = parseInt(el.style.top, 10) || 0;
        
        el.addEventListener('pointermove', onPointerMove); 
        el.addEventListener('pointerup', onPointerUp);
    });
    
    function onPointerMove(e) {
        const dx = (e.clientX - startX) / currentZoom;
        const dy = (e.clientY - startY) / currentZoom;
        let newLeft = initialLeft + dx;
        let newTop = initialTop + dy;
        
        if (snapCheckbox.checked) { 
            newLeft = Math.round(newLeft / GRID_SIZE) * GRID_SIZE; 
            newTop = Math.round(newTop / GRID_SIZE) * GRID_SIZE; 
        }
        
        if (newLeft < 0) newLeft = 0; 
        if (newTop < 0) newTop = 0;
        
        el.style.left = `${newLeft}px`; 
        el.style.top = `${newTop}px`;
    }
    
    function onPointerUp(e) { 
        el.style.cursor = "grab"; 
        el.releasePointerCapture(e.pointerId); 
        el.removeEventListener('pointermove', onPointerMove); 
        el.removeEventListener('pointerup', onPointerUp); 
        saveHistoryState(); 
    }
}