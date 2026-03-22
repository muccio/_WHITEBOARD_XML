/* js/globals.js */

var drawSvg = document.getElementById('draw-svg');
var timelineCanvas = document.getElementById('timeline-canvas');
var tCtx = timelineCanvas ? timelineCanvas.getContext('2d') : null;
var gallery = document.getElementById('patch-gallery');
var tempContainer = document.getElementById('render-temp');
var btnDeleteElement = document.getElementById('btn-delete-element');
var toolSelect = document.getElementById('draw-tool');
var snapCheckbox = document.getElementById('snap-grid');
var mirrorCheckbox = document.getElementById('mirror-draw');
var hideSmallTicksCheckbox = document.getElementById('hide-small-ticks');

var textToolsPanel = document.getElementById('text-tools-panel');
var btnCloseTextPanel = document.getElementById('btn-close-text-panel');
var textContentInput = document.getElementById('text-content');
var textFontSelect = document.getElementById('text-font');
var textSizeInput = document.getElementById('text-font-size');
var imgUploadInput = document.getElementById('img-upload');
var standardControls = document.getElementById('standard-controls');

var symbolsModal = document.getElementById('symbols-modal');
var btnOpenSymbols = document.getElementById('btn-open-symbols');
var btnCloseSymbols = document.getElementById('close-symbols-modal');

var yAxisCanvas = document.getElementById('y-axis-canvas');
var yCtx = yAxisCanvas ? yAxisCanvas.getContext('2d') : null;
var ySectionsInput = document.getElementById('y-sections');
var yLabelsModal = document.getElementById('y-labels-modal');
var yLabelsEditor = document.getElementById('y-labels-editor');
var yAxisLabels = [];

var uploadedImgData = null;
var GRID_SIZE = 20; 
var WORKSPACE_CENTER_Y = 2500; 
var highestZ = 100;
var currentZoom = 1;
var customLegend = []; 

// SISTEMA MULTI-TRACCIA & LAYERS
var TRACK_HEIGHT_SPACING = 1500;
var tracks = [];
var activeTrackId = null;
var trackSelector = document.getElementById('track-selector');
var backgroundLayers = [];

function getActiveTrack() { 
    return tracks.find(t => t.id === activeTrackId); 
}

// Stato Cronologia (Undo/Redo)
var actionHistory = [];
var historyStep = -1;
var MAX_HISTORY = 30;

// Stato Disegno Vettoriale
var isDrawing = false, isDragging = false, isResizing = false;
var resizeHandle = null; 
var drawStartX = 0, drawStartY = 0;
var currentDrawing = null, selectedElement = null;
var bezierStep = 0, bezierPoints = [], tempBezierGroup = null;

// Stato HTML e Mouse
var selectedMeasureBox = null;
var clipboard = null;
var mouseX = 0; // Coordinata X mouse globale
var mouseY = 0; // Coordinata Y mouse globale

function insertSymbol(sym) { 
    if(textContentInput) { 
        textContentInput.value += sym; 
        textContentInput.focus(); 
    } 
}