/* js/project.js - VERSIONE CORRETTA */

// Funzione Esportazione PDF
async function exportToPDF() {
    const btn = document.getElementById('export-pdf-btn');
    if (!btn) return;
    btn.textContent = 'Esportazione in corso...';
    btn.disabled = true;

    const workspace = document.getElementById('workspace');
    const workspaceWrapper = document.getElementById('workspace-wrapper');
    const fileName = (document.getElementById('proj-title').value || "progetto") + ".pdf";

    // Salva posizione scroll per ripristinarla dopo
    const scrollX = workspaceWrapper.scrollLeft;
    const scrollY = workspaceWrapper.scrollTop;

    // Resetta lo scroll e il transform per una cattura pulita
    workspaceWrapper.scrollTo(0, 0);
    workspace.style.transform = 'scale(1)';
    document.body.classList.add('pdf-export-mode');

    // Attendi un istante per far applicare gli stili
    await new Promise(resolve => setTimeout(resolve, 100));

    // Crea un canvas temporaneo con html2canvas
    const canvas = await html2canvas(workspace, {
        allowTaint: true,
        useCORS: true,
        logging: false,
        scale: 1, // Cattura a risoluzione nativa
        width: workspace.scrollWidth,
        height: workspace.scrollHeight,
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.9); // JPEG per file più piccoli

    // Ripristina la visualizzazione normale
    document.body.classList.remove('pdf-export-mode');
    workspace.style.transform = `scale(${currentZoom})`;
    workspaceWrapper.scrollTo(scrollX, scrollY);

    // Inizializza jsPDF
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({
        orientation: workspace.scrollWidth > workspace.scrollHeight ? 'landscape' : 'portrait',
        unit: 'px',
        format: [workspace.scrollWidth, workspace.scrollHeight]
    });

    // Aggiungi l'immagine al PDF
    pdf.addImage(imgData, 'JPEG', 0, 0, workspace.scrollWidth, workspace.scrollHeight);
    pdf.save(fileName);

    btn.textContent = '📄 Esporta PDF';
    btn.disabled = false;
}

// Funzione per il salvataggio
function saveProject() {
    if(typeof selectElement === 'function') selectElement(null);
    
    const projectData = {
        title: document.getElementById('proj-title').value,
        author: document.getElementById('proj-author').value,
        totalSec: document.getElementById('total-duration').value,
        gridSec: document.getElementById('grid-sec').value,
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

// Funzione per il caricamento
function loadProject(event) {
    const file = event.target.files[0]; if (!file) return;
    const reader = new FileReader();
    
    reader.onload = (evt) => {
        try {
            const projectData = JSON.parse(evt.target.result);
            
            // 1. Ripristino Metadati
            if (projectData.title !== undefined) document.getElementById('proj-title').value = projectData.title;
            if (projectData.author !== undefined) document.getElementById('proj-author').value = projectData.author;
            
            // 2. Ripristino Tempo e Griglia
            if (projectData.totalSec !== undefined) document.getElementById('total-duration').value = projectData.totalSec;
            if (projectData.gridSec !== undefined) document.getElementById('grid-sec').value = projectData.gridSec;
            document.getElementById('legend-sec-val').innerText = document.getElementById('grid-sec').value;
            
            if(typeof updateWorkspaceSize === 'function') updateWorkspaceSize();

            // 3. Ripristino Disegni Vettoriali
            if (projectData.svgContent !== undefined) drawSvg.innerHTML = projectData.svgContent;
            
            // 4. Ripristino Legenda
            if (projectData.legendData) { 
                customLegend = projectData.legendData; 
                if(typeof updateVisualLegend === 'function') updateVisualLegend(); 
            }
            
            // 5. Ripristino Checkbox Strumenti
            if (projectData.snapGrid !== undefined) { 
                snapCheckbox.checked = projectData.snapGrid; 
                toolSelect.dispatchEvent(new Event('change')); 
            }
            if (projectData.mirrorDraw !== undefined) mirrorCheckbox.checked = projectData.mirrorDraw;
            
            // 6. Ripristino Battute Musicali (HTML + Eventi)
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
            
            // 7. Reset del motore Undo/Redo con il nuovo stato come "punto zero"
            actionHistory = [];
            historyStep = -1;
            if(typeof saveHistoryState === 'function') saveHistoryState();

        } catch (err) { 
            console.error(err);
            alert("Errore: Il file selezionato non è un progetto valido o è corrotto.");
        }
    }; 
    reader.readAsText(file);
}