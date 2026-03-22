/* js/globals.js */

// Riferimenti DOM principali
var drawSvg = document.getElementById('draw-svg');
var timelineCanvas = document.getElementById('timeline-canvas');
var tCtx = timelineCanvas ? timelineCanvas.getContext('2d') : null;
var gallery = document.getElementById('patch-gallery');
var tempContainer = document.getElementById('render-temp');
var btnDeleteElement = document.getElementById('btn-delete-element');
var toolSelect = document.getElementById('draw-tool');
var snapCheckbox = document.getElementById('snap-grid');
var mirrorCheckbox = document.getElementById('mirror-draw');

// Nuovi riferimenti per Testo e Immagini
var textToolsPanel = document.getElementById('text-tools-panel');
var btnCloseTextPanel = document.getElementById('btn-close-text-panel');
var textContentInput = document.getElementById('text-content');
var textFontSelect = document.getElementById('text-font');
var textSizeInput = document.getElementById('text-font-size');
var imgUploadInput = document.getElementById('img-upload');
var standardControls = document.getElementById('standard-controls');

// Riferimenti per Modal Simboli
var symbolsModal = document.getElementById('symbols-modal');
var btnOpenSymbols = document.getElementById('btn-open-symbols');
var btnCloseSymbols = document.getElementById('close-symbols-modal');

// Variabile per conservare temporaneamente l'immagine caricata
var uploadedImgData = null;

// Costanti e Variabili di Stato Globali
var GRID_SIZE = 20; 
var WORKSPACE_CENTER_Y = 2500; 
var highestZ = 100;
var currentZoom = 1;
var customLegend = []; 

// Stato Cronologia (Undo/Redo)
var actionHistory = [];
var historyStep = -1;
var MAX_HISTORY = 30;

// Stato Disegno Vettoriale e Ridimensionamento
var isDrawing = false;
var isDragging = false;
var isResizing = false; // Nuovo flag
var resizeHandle = null; // Riferimento al quadratino di resize
var drawStartX = 0;
var drawStartY = 0;
var currentDrawing = null;
var selectedElement = null;

// Funzione globale per inserire simboli (chiamata dai bottoni HTML)
function insertSymbol(sym) {
    if(textContentInput) {
        textContentInput.value += sym;
        textContentInput.focus();
    }
}