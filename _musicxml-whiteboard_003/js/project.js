/* js/project.js */

async function exportToPDF() {
    const btn = document.getElementById('export-pdf-btn');
    if (!btn) return;
    btn.textContent = 'Esportazione...';
    btn.disabled = true;

    const workspace = document.getElementById('workspace');
    const workspaceWrapper = document.getElementById('workspace-wrapper');
    const fileName = (document.getElementById('proj-title').value || "progetto") + ".pdf";

    const scrollX = workspaceWrapper.scrollLeft;
    const scrollY = workspaceWrapper.scrollTop;

    workspaceWrapper.scrollTo(0, 0);
    workspace.style.transform = 'scale(1)';
    document.body.classList.add('pdf-export-mode');

    await new Promise(resolve => setTimeout(resolve, 100));

    const canvasExport = await html2canvas(workspace, {
        allowTaint: true, useCORS: true, logging: false, scale: 1,
        width: workspace.scrollWidth, height: workspace.scrollHeight,
    });

    const imgData = canvasExport.toDataURL('image/jpeg', 0.9);

    document.body.classList.remove('pdf-export-mode');
    workspace.style.transform = `scale(${currentZoom})`;
    workspaceWrapper.scrollTo(scrollX, scrollY);

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({
        orientation: workspace.scrollWidth > workspace.scrollHeight ? 'landscape' : 'portrait',
        unit: 'px', format: [workspace.scrollWidth, workspace.scrollHeight]
    });

    pdf.addImage(imgData, 'JPEG', 0, 0, workspace.scrollWidth, workspace.scrollHeight);
    pdf.save(fileName);

    btn.textContent = '📄 PDF';
    btn.disabled = false;
}

function saveProject() {
    if(typeof selectElement === 'function') selectElement(null);
    
    const projectData = {
        title: document.getElementById('proj-title').value,
        author: document.getElementById('proj-author').value,
        totalSec: document.getElementById('total-duration').value,
        gridSec: document.getElementById('grid-sec').value,
        zoom: currentZoom, // Salvataggio zoom
        ySections: document.getElementById('y-sections').value,
        yAxisLabels: yAxisLabels,
        hideSmallTicks: hideSmallTicksCheckbox.checked,
        svgContent: drawSvg.innerHTML,
        galleryHTML: gallery.innerHTML,
        legendData: customLegend,
        snapGrid: snapCheckbox.checked,
        mirrorDraw: mirrorCheckbox.checked
    };
    
    const blob = new Blob([JSON.stringify(projectData)], { type: "application/json" });
    const a = document.createElement("a"); 
    a.href = URL.createObjectURL(blob); 
    a.download = (projectData.title ? projectData.title.replace(/\s+/g, '_') : "progetto_musicale") + ".json";
    document.body.appendChild(a); 
    a.click(); 
    document.body.removeChild(a);
}

function loadProject(event) {
    const file = event.target.files[0]; if (!file) return;
    const reader = new FileReader();
    
    reader.onload = (evt) => {
        try {
            const projectData = JSON.parse(evt.target.result);
            
            if (projectData.title !== undefined) document.getElementById('proj-title').value = projectData.title;
            if (projectData.author !== undefined) document.getElementById('proj-author').value = projectData.author;
            if (projectData.totalSec !== undefined) document.getElementById('total-duration').value = projectData.totalSec;
            if (projectData.gridSec !== undefined) document.getElementById('grid-sec').value = projectData.gridSec;
            if (projectData.zoom !== undefined) currentZoom = projectData.zoom;
            if (projectData.ySections !== undefined) document.getElementById('y-sections').value = projectData.ySections;
            if (projectData.yAxisLabels !== undefined) yAxisLabels = projectData.yAxisLabels;
            if (projectData.hideSmallTicks !== undefined) hideSmallTicksCheckbox.checked = projectData.hideSmallTicks;

            document.getElementById('legend-sec-val').innerText = document.getElementById('grid-sec').value;
            
            if(typeof updateWorkspaceSize === 'function') updateWorkspaceSize();
            if(typeof updateZoom === 'function') updateZoom(); // Applica lo zoom caricato

            if (projectData.svgContent !== undefined) drawSvg.innerHTML = projectData.svgContent;
            if (projectData.legendData) { customLegend = projectData.legendData; if(typeof updateVisualLegend === 'function') updateVisualLegend(); }
            if (projectData.snapGrid !== undefined) { snapCheckbox.checked = projectData.snapGrid; toolSelect.dispatchEvent(new Event('change')); }
            if (projectData.mirrorDraw !== undefined) mirrorCheckbox.checked = projectData.mirrorDraw;
            
            if (projectData.galleryHTML !== undefined) {
                gallery.innerHTML = projectData.galleryHTML; 
                let maxZ = 100;
                document.querySelectorAll('.measure-box').forEach(box => { 
                    if(typeof makeDraggable === 'function') makeDraggable(box); 
                    const z = parseInt(box.style.zIndex, 10); 
                    if (!isNaN(z) && z > maxZ) maxZ = z; 
                });
                highestZ = maxZ;
            }
            
            actionHistory = []; historyStep = -1;
            if(typeof saveHistoryState === 'function') saveHistoryState();

        } catch (err) { alert("Errore nel file di progetto."); }
    }; 
    reader.readAsText(file);
}