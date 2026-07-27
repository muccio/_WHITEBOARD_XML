/* js/view3d.js */

// Stato Globale
let tracks = [];
let trackCanvasTextures = {};
let totalSec = 300;
let gridSec = 1;
let globalTrackSpacing = 1500;
let projectTitle = "Senza Titolo";
let projectAuthor = "Anonimo";

// WebGL Engine variables
let scene, camera, renderer, controls;
let verticalGap = 500;
let canvasWidth = 2000;
let trackMeshes = [];

// Tween engine variables
let isTweening = false;
let tweenStartTime = 0;
const tweenDuration = 400; // ms
let startCamPos = new THREE.Vector3();
let targetCamPos = new THREE.Vector3();
let startControlsTarget = new THREE.Vector3();
let targetControlsTarget = new THREE.Vector3();

document.addEventListener('DOMContentLoaded', () => {
    const opener = window.opener;
    const btnLoadDemo = document.getElementById('btn-load-demo');
    
    // Inizializza i controlli HUD
    initHudControls();
    
    if (opener && opener.tracks) {
        // Parent exists and has tracks
        try {
            loadParentState(opener);
        } catch (e) {
            console.error("Errore durante il caricamento dello stato del parent:", e);
            showDisconnectedOverlay();
        }
    } else {
        // Fallback disconnected warning
        showDisconnectedOverlay();
    }
    
    if (btnLoadDemo) {
        btnLoadDemo.addEventListener('click', loadDemoState);
    }
});

function showDisconnectedOverlay() {
    const overlay = document.getElementById('overlay-container');
    if (overlay) overlay.classList.remove('hidden');
}

function updateUI(title, author, totalSec, gridSec, spacing, legendCount, tracksList) {
    // Badge info
    document.getElementById('badge-title').textContent = title;
    
    const authorBadge = document.getElementById('badge-author');
    const authorWrapper = document.getElementById('badge-author-wrapper');
    if (author) {
        authorBadge.textContent = author;
        if (authorWrapper) authorWrapper.style.display = 'inline';
    } else {
        if (authorWrapper) authorWrapper.style.display = 'none';
    }
    
    // Meta variables
    document.getElementById('meta-duration').textContent = `${totalSec}s`;
    document.getElementById('meta-grid').textContent = `${gridSec}s`;
    document.getElementById('meta-spacing').textContent = `${spacing}px`;
    document.getElementById('meta-legend').textContent = `${legendCount} elementi`;
    
    // Track count
    document.getElementById('track-count').textContent = tracksList.length;
    
    // Render tracks list
    const tracksContainer = document.getElementById('tracks-list-container');
    if (tracksContainer) {
        tracksContainer.innerHTML = '';
        tracksList.forEach((track, index) => {
            const item = document.createElement('div');
            item.className = 'dashboard-item';
            
            // Format offsets
            const offsetY = track.offsetY || 0;
            const absoluteY = track.baseY + offsetY;
            
            item.innerHTML = `
                <div>
                    <span class="track-name">${track.name || `Traccia ${index + 1}`}</span>
                    <span class="track-meta">(${track.id})</span>
                </div>
                <div>Y: ${absoluteY}px <span class="track-meta">(offset: ${offsetY}px, sez: ${track.ySectionsCount || 4})</span></div>
            `;
            tracksContainer.appendChild(item);
        });
    }
}

async function loadParentState(parentWindow) {
    // Nascondi overlay di avviso
    const overlay = document.getElementById('overlay-container');
    if (overlay) overlay.classList.add('hidden');
    
    // Leggi dati dal parent
    tracks = parentWindow.tracks || [];
    totalSec = parentWindow.document.getElementById('total-duration')?.value || 300;
    gridSec = parentWindow.document.getElementById('grid-sec')?.value || 1;
    globalTrackSpacing = parentWindow.globalTrackSpacing || 1500;
    projectTitle = parentWindow.document.getElementById('proj-title')?.value || "Senza Titolo";
    projectAuthor = parentWindow.document.getElementById('proj-author')?.value || "Anonimo";
    
    const legendLength = parentWindow.customLegend ? parentWindow.customLegend.length : 0;
    
    // Aggiorna UI descrittiva
    updateUI(projectTitle, projectAuthor, totalSec, gridSec, globalTrackSpacing, legendLength, tracks);
    
    const statusDesc = document.getElementById('status-desc-text');
    if (statusDesc) {
        statusDesc.innerHTML = '🔄 <strong>Texture in generazione...</strong> Acquisizione in corso dei layer grafici del whiteboard.';
        statusDesc.style.color = '#6cefda';
    }
    
    // Esegui acquisizione texture
    try {
        await captureAllTracks(parentWindow);
        if (statusDesc) {
            statusDesc.innerHTML = '✓ <strong>Texture Generate:</strong> Dati e snapshot pronti. Avvio rendering 3D...';
            statusDesc.style.color = '#98c379';
        }
        
        // Avvio Motore 3D
        setTimeout(() => {
            // Nascondi il pannello di stato per mostrare interamente la scena WebGL
            const statusView = document.getElementById('status-view');
            if (statusView) statusView.style.display = 'none';
            
            init3dScene();
            createTrackPlanes();
            animate();
        }, 1000); // Piccolo ritardo per far leggere la conferma all'utente
        
    } catch (err) {
        console.error("Errore durante la cattura delle tracce:", err);
        if (statusDesc) {
            statusDesc.innerHTML = '❌ <strong>Errore Texture:</strong> Impossibile generare le texture 2D dagli elementi del parent.';
            statusDesc.style.color = '#e06c75';
        }
    }
}

async function loadDemoState() {
    // Nascondi overlay
    const overlay = document.getElementById('overlay-container');
    if (overlay) overlay.classList.add('hidden');
    
    // Dati fittizi
    projectTitle = "Sinfonia Campestre (Demo)";
    projectAuthor = "Ludwig van Beethoven";
    totalSec = 180;
    gridSec = 2;
    globalTrackSpacing = 1500;
    
    tracks = [
        { id: 'track_mock_1', name: 'Flauto (Traccia 1)', baseY: 1000, offsetY: 0, ySectionsCount: 4 },
        { id: 'track_mock_2', name: 'Oboe (Traccia 2)', baseY: 1000, offsetY: 1500, ySectionsCount: 3 },
        { id: 'track_mock_3', name: 'Clarinetto (Traccia 3)', baseY: 1000, offsetY: 3000, ySectionsCount: 5 }
    ];
    
    updateUI(projectTitle, projectAuthor, totalSec, gridSec, globalTrackSpacing, 3, tracks);
    
    const statusDesc = document.getElementById('status-desc-text');
    if (statusDesc) {
        statusDesc.innerHTML = '⚠️ <strong>Modalità Debug:</strong> Generazione texture demo in corso...';
        statusDesc.style.color = '#e5c07b';
    }
    
    // Genera canvas mockup per le tracce demo
    const previewPanel = document.getElementById('preview-panel');
    if (previewPanel) previewPanel.innerHTML = '';
    
    tracks.forEach((track, index) => {
        const canvas = generateMockTexture(track, index);
        trackCanvasTextures[track.id] = canvas;
        
        // Mostra preview nel pannello
        const previewWrap = document.createElement('div');
        previewWrap.style.margin = '5px 0';
        previewWrap.style.textAlign = 'left';
        
        const previewLabel = document.createElement('div');
        previewLabel.className = 'track-meta';
        previewLabel.textContent = `Preview ${track.name} (${canvas.width}x${canvas.height}px)`;
        
        const previewCanvas = document.createElement('canvas');
        previewCanvas.width = canvas.width;
        previewCanvas.height = canvas.height;
        previewCanvas.style.width = '100%';
        previewCanvas.style.height = 'auto';
        previewCanvas.style.border = '1px solid rgba(255, 255, 255, 0.15)';
        previewCanvas.style.borderRadius = '4px';
        
        const pCtx = previewCanvas.getContext('2d');
        pCtx.drawImage(canvas, 0, 0);
        
        previewWrap.appendChild(previewLabel);
        previewWrap.appendChild(previewCanvas);
        previewPanel.appendChild(previewWrap);
    });
    
    if (statusDesc) {
        statusDesc.innerHTML = '⚠️ <strong>Modalità Debug Attiva:</strong> Texture demo generate con successo.';
    }
    
    // Avvio Motore 3D per Demo
    setTimeout(() => {
        const statusView = document.getElementById('status-view');
        if (statusView) statusView.style.display = 'none';
        
        init3dScene();
        createTrackPlanes();
        animate();
    }, 1500);
}

function generateMockTexture(track, index) {
    const canvas = document.createElement('canvas');
    canvas.width = 2000;
    canvas.height = 1000;
    const ctx = canvas.getContext('2d');
    
    // Sfondo scuro
    ctx.fillStyle = '#1e222b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Griglia verticale (secondi)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 100) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
        
        // Etichette secondi
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.font = '14px Outfit, sans-serif';
        ctx.fillText(`${(x / 100) * 10}s`, x + 10, 480);
    }
    
    // Linea di base (baseline Y = 500)
    ctx.strokeStyle = '#abb2bf';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 500);
    ctx.lineTo(canvas.width, 500);
    ctx.stroke();
    
    // Linee griglia orizzontale (sezioni)
    const ySections = track.ySectionsCount || 4;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    for (let i = 1; i <= ySections; i++) {
        const yOffset = i * 40; // Simula GRID_SIZE = 20px o 40px
        ctx.beginPath();
        ctx.moveTo(0, 500 - yOffset);
        ctx.lineTo(canvas.width, 500 - yOffset);
        ctx.stroke();
    }
    
    // Colori tematici per traccia
    const colors = ['#6cefda', '#e06c75', '#98c379', '#e5c07b', '#61afef'];
    const trackColor = colors[index % colors.length];
    
    // Titolo traccia stampato sulla texture
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px Outfit, sans-serif';
    ctx.fillText(track.name || `Traccia ${index + 1}`, 40, 440);
    
    // Elementi musicali mockup (rettangoli delle battute)
    ctx.fillStyle = trackColor + '55'; // trasparente
    ctx.strokeStyle = trackColor;
    ctx.lineWidth = 2;
    for (let i = 0; i < 4; i++) {
        const x = 150 + i * 450;
        const y = 320 + (i % 2) * 60;
        const w = 220;
        const h = 100;
        ctx.fillRect(x, y, w, h);
        ctx.strokeRect(x, y, w, h);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px Outfit, sans-serif';
        ctx.fillText(`Measure ${i + 1}`, x + 15, y + 25);
        ctx.fillStyle = trackColor + '55';
    }
    
    // Disegni vettoriali mockup (linea ondulata ad esempio)
    ctx.strokeStyle = trackColor;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(50, 650);
    for (let x = 50; x < canvas.width - 50; x += 10) {
        const y = 650 + Math.sin((x - 50) * 0.015) * 80;
        ctx.lineTo(x, y);
    }
    ctx.stroke();
    
    // Bordo della traccia
    ctx.strokeStyle = trackColor;
    ctx.lineWidth = 6;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);
    
    return canvas;
}

async function captureAllTracks(parentWindow) {
    const previewPanel = document.getElementById('preview-panel');
    if (previewPanel) previewPanel.innerHTML = '';
    
    trackCanvasTextures = {};
    
    // Sequenziale per evitare colli di bottiglia nel rendering browser
    for (let i = 0; i < tracks.length; i++) {
        const track = tracks[i];
        console.log(`Avvio acquisizione per traccia: ${track.name || track.id}`);
        
        try {
            const canvas = await captureTrackTexture(track, parentWindow);
            trackCanvasTextures[track.id] = canvas;
            
            // Appendi una preview visiva nel dashboard
            if (previewPanel) {
                const previewWrap = document.createElement('div');
                previewWrap.style.margin = '8px 0';
                previewWrap.style.textAlign = 'left';
                
                const previewLabel = document.createElement('div');
                previewLabel.className = 'track-meta';
                previewLabel.textContent = `Snapshot ${track.name || `Traccia ${i + 1}`} (${canvas.width}x${canvas.height}px)`;
                
                const previewCanvas = document.createElement('canvas');
                previewCanvas.width = canvas.width;
                previewCanvas.height = canvas.height;
                previewCanvas.style.width = '100%';
                previewCanvas.style.height = 'auto';
                previewCanvas.style.border = '1px solid rgba(255, 255, 255, 0.15)';
                previewCanvas.style.borderRadius = '4px';
                
                const pCtx = previewCanvas.getContext('2d');
                pCtx.drawImage(canvas, 0, 0);
                
                previewWrap.appendChild(previewLabel);
                previewWrap.appendChild(previewCanvas);
                previewPanel.appendChild(previewWrap);
            }
        } catch (e) {
            console.error(`Errore durante l'acquisizione della traccia ${track.id}:`, e);
            // Crea un canvas di fallback
            const fallbackCanvas = generateMockTexture(track, i);
            trackCanvasTextures[track.id] = fallbackCanvas;
        }
    }
}

function captureTrackTexture(track, parentWindow) {
    return new Promise((resolve, reject) => {
        const offscreenArea = document.getElementById('offscreen-render-area');
        if (!offscreenArea) {
            return reject(new Error("Contenitore offscreen-render-area non trovato nel DOM."));
        }
        
        // Pulisce l'area offscreen
        offscreenArea.innerHTML = '';
        
        // Ottieni elementi dal parent
        const parentCanvas = parentWindow.document.getElementById('timeline-canvas');
        const svgLayer = parentWindow.document.getElementById(`svg-layer-${track.id}`);
        const htmlLayer = parentWindow.document.getElementById(`html-layer-${track.id}`);
        
        if (!parentCanvas) {
            return reject(new Error("Timeline canvas del parent non trovato."));
        }
        
        const workspaceWidth = parentCanvas.width || 2000;
        const targetHeight = 1000; // Altezza fissa del piano traccia
        const halfHeight = targetHeight / 2; // Baseline centrata a Y = 500
        
        // 1. Creazione Wrapper Offscreen
        const wrapper = document.createElement('div');
        wrapper.id = `capture-wrapper-${track.id}`;
        wrapper.style.position = 'relative';
        wrapper.style.width = `${workspaceWidth}px`;
        wrapper.style.height = `${targetHeight}px`;
        wrapper.style.background = '#1e222b'; // Sfondo identico all'editor
        wrapper.style.overflow = 'hidden';
        
        // 2. Slicing e baking del canvas della timeline
        const canvasSlice = document.createElement('canvas');
        canvasSlice.width = workspaceWidth;
        canvasSlice.height = targetHeight;
        const ctxSlice = canvasSlice.getContext('2d');
        
        // Determina la coordinata Y iniziale del ritaglio basandoci sulla baseline della traccia
        const trackBaselineY = track.baseY + (track.offsetY || 0);
        const sourceY = Math.max(0, trackBaselineY - halfHeight);
        
        try {
            ctxSlice.drawImage(parentCanvas, 
                0, sourceY, workspaceWidth, targetHeight,
                0, 0, workspaceWidth, targetHeight
            );
        } catch (err) {
            console.warn("Impossibile ritagliare il canvas della timeline del parent:", err);
            ctxSlice.fillStyle = '#1e222b';
            ctxSlice.fillRect(0, 0, workspaceWidth, targetHeight);
            
            ctxSlice.strokeStyle = 'rgba(255,255,255,0.1)';
            ctxSlice.beginPath();
            ctxSlice.moveTo(0, halfHeight);
            ctxSlice.lineTo(workspaceWidth, halfHeight);
            ctxSlice.stroke();
        }
        
        canvasSlice.style.position = 'absolute';
        canvasSlice.style.top = '0';
        canvasSlice.style.left = '0';
        canvasSlice.style.zIndex = '0';
        wrapper.appendChild(canvasSlice);
        
        // 3. Clonazione Layer SVG
        if (svgLayer && svgLayer.children.length > 0) {
            const svgRoot = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            svgRoot.setAttribute("width", workspaceWidth);
            svgRoot.setAttribute("height", targetHeight);
            svgRoot.style.position = 'absolute';
            svgRoot.style.top = '0';
            svgRoot.style.left = '0';
            svgRoot.style.width = '100%';
            svgRoot.style.height = '100%';
            svgRoot.style.zIndex = '1';
            svgRoot.style.pointerEvents = 'none';
            svgRoot.style.overflow = 'hidden';
            
            const svgClone = svgLayer.cloneNode(true);
            const translationY = halfHeight - track.baseY;
            svgClone.setAttribute('transform', `translate(0, ${translationY})`);
            
            svgRoot.appendChild(svgClone);
            wrapper.appendChild(svgRoot);
        }
        
        // 4. Clonazione Layer HTML
        if (htmlLayer && htmlLayer.children.length > 0) {
            const htmlClone = htmlLayer.cloneNode(true);
            htmlClone.style.position = 'absolute';
            htmlClone.style.top = '0';
            htmlClone.style.left = '0';
            htmlClone.style.width = `${workspaceWidth}px`;
            htmlClone.style.height = `${targetHeight}px`;
            htmlClone.style.zIndex = '2';
            htmlClone.style.pointerEvents = 'none';
            htmlClone.style.opacity = '1';
            htmlClone.style.display = 'block';
            
            const translationY = halfHeight - track.baseY;
            htmlClone.style.transform = `translateY(${translationY}px)`;
            
            wrapper.appendChild(htmlClone);
        }
        
        offscreenArea.appendChild(wrapper);
        
        setTimeout(() => {
            html2canvas(wrapper, {
                backgroundColor: null,
                logging: false,
                scale: 1,
                useCORS: true,
                allowTaint: true
            }).then(canvas => {
                if (wrapper.parentNode) {
                    wrapper.parentNode.removeChild(wrapper);
                }
                
                let finalCanvas = canvas;
                if (canvas.width > 4096) {
                    const scale = 4096 / canvas.width;
                    const newWidth = 4096;
                    const newHeight = Math.round(canvas.height * scale);
                    
                    const downscaledCanvas = document.createElement('canvas');
                    downscaledCanvas.width = newWidth;
                    downscaledCanvas.height = newHeight;
                    const downscaledCtx = downscaledCanvas.getContext('2d');
                    
                    downscaledCtx.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, newWidth, newHeight);
                    finalCanvas = downscaledCanvas;
                    console.log(`[view3d] Texture ridimensionata: da ${canvas.width}x${canvas.height}px a ${newWidth}x${newHeight}px`);
                }
                
                resolve(finalCanvas);
            }).catch(err => {
                if (wrapper.parentNode) {
                    wrapper.parentNode.removeChild(wrapper);
                }
                reject(err);
            });
        }, 150);
    });
}

// -------------------------------------------------------------
// MOTORE WEBGL DI VISUALIZZAZIONE 3D (Three.js)
// -------------------------------------------------------------

function cleanup3dScene() {
    const container = document.getElementById('3d-canvas-container');
    if (container) {
        container.innerHTML = '';
    }
    if (renderer) {
        renderer.dispose();
    }
    scene = null;
    camera = null;
    renderer = null;
    controls = null;
}

function init3dScene() {
    cleanup3dScene();
    
    const container = document.getElementById('3d-canvas-container');
    if (!container) return;
    
    const width = container.clientWidth;
    const height = container.clientHeight;
    
    // Scena
    scene = new THREE.Scene();
    scene.background = new THREE.Color('#1e222b');
    
    // Camera
    camera = new THREE.PerspectiveCamera(45, width / height, 1, 50000);
    
    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);
    
    // Controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.05; // Impedisci di andare sotto il piano
    
    // Pulisce l'active view preset se l'utente ruota manualmente
    controls.addEventListener('start', () => {
        if (!isTweening) {
            updateActiveViewButton(null);
        }
    });
    
    // Resize Listener
    window.addEventListener('resize', handleResize);
}

function createTrackPlanes() {
    if (tracks.length === 0) return;
    
    // Determina larghezza dal primo canvas caricato
    const firstTrackId = tracks[0].id;
    const firstCanvas = trackCanvasTextures[firstTrackId];
    if (!firstCanvas) return;
    
    canvasWidth = firstCanvas.width;
    const canvasHeight = firstCanvas.height;
    
    const colors = ['#6cefda', '#e06c75', '#98c379', '#e5c07b', '#61afef'];
    
    trackMeshes = []; // reset array
    
    tracks.forEach((track, index) => {
        const canvas = trackCanvasTextures[track.id];
        if (!canvas) return;
        
        // Creazione Texture e Materiale
        const texture = new THREE.CanvasTexture(canvas);
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.wrapS = THREE.ClampToEdgeWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;
        
        const geometry = new THREE.PlaneGeometry(canvas.width, canvas.height);
        
        // Materiale semi-trasparente (D-02) e double-sided (D-03)
        const material = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            opacity: 0.7,
            side: THREE.DoubleSide
        });
        
        const mesh = new THREE.Mesh(geometry, material);
        mesh.rotation.x = -Math.PI / 2; // Sdraiato in orizzontale (X-Z)
        
        // Stack Y: Traccia 1 a Y=0, Traccia 2 a Y=-500, Traccia 3 a Y=-1000
        mesh.position.set(0, -index * verticalGap, 0);
        
        // Outline di demarcazione (D-04)
        const edges = new THREE.EdgesGeometry(geometry);
        const borderColor = colors[index % colors.length];
        const lineMat = new THREE.LineBasicMaterial({ color: borderColor, linewidth: 2 });
        const borderOutline = new THREE.LineSegments(edges, lineMat);
        mesh.add(borderOutline);
        
        scene.add(mesh);
        trackMeshes.push(mesh);
    });
    
    // Calcola il centro del blocco dello stack
    const stackHeight = (tracks.length - 1) * verticalGap;
    const centerY = -stackHeight / 2;
    
    // Imposta il target dei controlli al centro geometrico dello stack
    controls.target.set(0, centerY, 0);
    
    // Posizionamento iniziale Isometrico (Tilted Perspective) (D-05)
    // Spostato a destra (X), in alto (Y) e davanti (Z)
    camera.position.set(
        canvasWidth * 0.4, 
        centerY + verticalGap * 1.5 + stackHeight, 
        canvasWidth * 0.7
    );
    controls.update();
    
    // Mostra il pannello dei controlli HUD
    const hudPanel = document.getElementById('hud-panel');
    if (hudPanel) {
        hudPanel.classList.remove('hidden');
    }
    
    // Highlight view isometrica iniziale
    updateActiveViewButton(document.getElementById('btn-view-iso'));
}

function handleResize() {
    const container = document.getElementById('3d-canvas-container');
    if (!container || !camera || !renderer) return;
    
    const width = container.clientWidth;
    const height = container.clientHeight;
    
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    
    renderer.setSize(width, height);
}

function animate() {
    requestAnimationFrame(animate);
    
    if (isTweening) {
        const elapsed = performance.now() - tweenStartTime;
        const t = Math.min(elapsed / tweenDuration, 1.0);
        // Cosine easing per premium feel
        const ease = 0.5 * (1 - Math.cos(t * Math.PI));
        
        camera.position.lerpVectors(startCamPos, targetCamPos, ease);
        controls.target.lerpVectors(startControlsTarget, targetControlsTarget, ease);
        
        if (t >= 1.0) {
            isTweening = false;
            controls.enabled = true;
        }
    }
    
    if (controls) {
        controls.update();
    }
    
    if (renderer && scene && camera) {
        renderer.render(scene, camera);
    }
}

// -------------------------------------------------------------
// LOGICHE INTERATTIVE HUD & CAM PRESETS (Fase 3)
// -------------------------------------------------------------

function startCameraTween(destPos, destTarget) {
    if (!camera || !controls) return;
    
    isTweening = true;
    tweenStartTime = performance.now();
    
    startCamPos.copy(camera.position);
    targetCamPos.copy(destPos);
    
    startControlsTarget.copy(controls.target);
    targetControlsTarget.copy(destTarget);
    
    // Disabilita i controlli durante l'interpolazione della camera
    controls.enabled = false;
}

function initHudControls() {
    const opacitySlider = document.getElementById('opacity-slider');
    if (opacitySlider) {
        opacitySlider.addEventListener('input', (e) => {
            const opacity = parseFloat(e.target.value);
            trackMeshes.forEach(mesh => {
                if (mesh.material) {
                    mesh.material.opacity = opacity;
                }
            });
        });
    }
    
    const spacingSlider = document.getElementById('spacing-slider');
    if (spacingSlider) {
        spacingSlider.addEventListener('input', (e) => {
            const newGap = parseFloat(e.target.value);
            if (tracks.length === 0) return;
            
            // Calcola spostamento del centro Y
            const oldStackHeight = (tracks.length - 1) * verticalGap;
            const oldCenterY = -oldStackHeight / 2;
            
            verticalGap = newGap;
            
            const newStackHeight = (tracks.length - 1) * verticalGap;
            const newCenterY = -newStackHeight / 2;
            const deltaY = newCenterY - oldCenterY;
            
            // Riposiziona i piani mesh
            trackMeshes.forEach((mesh, index) => {
                mesh.position.y = -index * verticalGap;
            });
            
            // Aggiorna posizione camera e target Y per tracciare lo spostamento
            if (camera) camera.position.y += deltaY;
            if (controls) {
                controls.target.y = newCenterY;
                controls.update();
            }
        });
    }
    
    const btnViewTop = document.getElementById('btn-view-top');
    if (btnViewTop) {
        btnViewTop.addEventListener('click', () => {
            if (tracks.length === 0) return;
            const centerY = -((tracks.length - 1) * verticalGap) / 2;
            // Leggera inclinazione X=0.1 per evitare blocco gimbal OrbitControls
            const targetPos = new THREE.Vector3(0.1, canvasWidth * 0.9, 0);
            const targetLook = new THREE.Vector3(0, centerY, 0);
            startCameraTween(targetPos, targetLook);
            
            updateActiveViewButton(btnViewTop);
        });
    }
    
    const btnViewSide = document.getElementById('btn-view-side');
    if (btnViewSide) {
        btnViewSide.addEventListener('click', () => {
            if (tracks.length === 0) return;
            const centerY = -((tracks.length - 1) * verticalGap) / 2;
            const targetPos = new THREE.Vector3(0, centerY, canvasWidth * 0.9);
            const targetLook = new THREE.Vector3(0, centerY, 0);
            startCameraTween(targetPos, targetLook);
            
            updateActiveViewButton(btnViewSide);
        });
    }
    
    const btnViewIso = document.getElementById('btn-view-iso');
    if (btnViewIso) {
        btnViewIso.addEventListener('click', () => {
            if (tracks.length === 0) return;
            const centerY = -((tracks.length - 1) * verticalGap) / 2;
            const stackHeight = (tracks.length - 1) * verticalGap;
            const targetPos = new THREE.Vector3(
                canvasWidth * 0.4, 
                centerY + verticalGap * 1.5 + stackHeight, 
                canvasWidth * 0.7
            );
            const targetLook = new THREE.Vector3(0, centerY, 0);
            startCameraTween(targetPos, targetLook);
            
            updateActiveViewButton(btnViewIso);
        });
    }
}

function updateActiveViewButton(activeBtn) {
    const buttons = [
        document.getElementById('btn-view-top'),
        document.getElementById('btn-view-side'),
        document.getElementById('btn-view-iso')
    ];
    buttons.forEach(btn => {
        if (btn) {
            btn.classList.remove('btn-accent');
        }
    });
    if (activeBtn) {
        activeBtn.classList.add('btn-accent');
    }
}

// -------------------------------------------------------------
// CHIUSURA FINESTRA STANDALONE / APP
// -------------------------------------------------------------
function closeWindow() {
    try {
        window.close();
    } catch (e) {
        console.warn("Chiusura finestra 3D fallita via script:", e);
    }
    setTimeout(() => {
        if (!window.closed) {
            if (window.history.length > 1 && document.referrer) {
                window.history.back();
            } else {
                window.location.href = 'index.html';
            }
        }
    }, 150);
}
