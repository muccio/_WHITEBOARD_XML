import AppKit
import WebKit
import UniformTypeIdentifiers

final class CustomWebView: WKWebView {
    weak var dragHandler: DragAndDropDelegate?

    override func awakeFromNib() {
        super.awakeFromNib()
        registerForDraggedTypes([.fileURL])
    }

    override init(frame: CGRect, configuration: WKWebViewConfiguration) {
        super.init(frame: frame, configuration: configuration)
        registerForDraggedTypes([.fileURL])
    }

    required init?(coder: NSCoder) {
        super.init(coder: coder)
        registerForDraggedTypes([.fileURL])
    }

    override func draggingEntered(_ sender: NSDraggingInfo) -> NSDragOperation {
        guard let handler = dragHandler, handler.canHandleDrag(sender) else {
            return []
        }
        return .copy
    }

    override func performDragOperation(_ sender: NSDraggingInfo) -> Bool {
        return dragHandler?.handleDrop(sender) ?? false
    }
}

protocol DragAndDropDelegate: AnyObject {
    func canHandleDrag(_ sender: NSDraggingInfo) -> Bool
    func handleDrop(_ sender: NSDraggingInfo) -> Bool
}

final class WebViewController: NSViewController, WKUIDelegate, WKNavigationDelegate, WKDownloadDelegate, DragAndDropDelegate {
    static weak var sharedMainController: WebViewController?

    private var webView: CustomWebView!
    private var pendingFileURL: URL?

    override func loadView() {
        let config = WKWebViewConfiguration()
        config.preferences.setValue(true, forKey: "developerExtrasEnabled")
        config.preferences.setValue(true, forKey: "allowFileAccessFromFileURLs")
        config.defaultWebpagePreferences.allowsContentJavaScript = true

        // User script helper for desktop integration
        let desktopScript = WKUserScript(
            source: desktopIntegrationJS,
            injectionTime: .atDocumentEnd,
            forMainFrameOnly: true
        )
        config.userContentController.addUserScript(desktopScript)

        webView = CustomWebView(frame: .zero, configuration: config)
        webView.uiDelegate = self
        webView.navigationDelegate = self
        webView.dragHandler = self
        webView.autoresizingMask = [.width, .height]

        self.view = webView
    }

    override func viewDidLoad() {
        super.viewDidLoad()
        WebViewController.sharedMainController = self
        loadApp()
    }

    func loadApp() {
        let bundleWebURL = Bundle.main.resourceURL?.appendingPathComponent("web")
        let fallbackURL = bundleWebURL?.appendingPathComponent("index.html")

        if let webDir = bundleWebURL, FileManager.default.fileExists(atPath: webDir.path) {
            EmbeddedWebServer.shared.start(withDirectory: webDir) { [weak self] serverURL in
                guard let self = self else { return }
                let indexURL = serverURL.appendingPathComponent("index.html")
                self.webView.load(URLRequest(url: indexURL))
            }
        } else if let fallback = fallbackURL, FileManager.default.fileExists(atPath: fallback.path) {
            webView.loadFileURL(fallback, allowingReadAccessTo: bundleWebURL ?? fallback.deletingLastPathComponent())
        } else {
            NSLog("[WebViewController] Cartella risorse web non trovata.")
        }
    }

    // MARK: - Drag and Drop

    func canHandleDrag(_ sender: NSDraggingInfo) -> Bool {
        guard let urls = fileURLs(from: sender), !urls.isEmpty else { return false }
        let validExts = ["xml", "musicxml", "mxl", "json"]
        return urls.contains { validExts.contains($0.pathExtension.lowercased()) }
    }

    func handleDrop(_ sender: NSDraggingInfo) -> Bool {
        guard let urls = fileURLs(from: sender), let first = urls.first else { return false }
        openFile(at: first)
        return true
    }

    private func fileURLs(from sender: NSDraggingInfo) -> [URL]? {
        let pasteboard = sender.draggingPasteboard
        guard let items = pasteboard.readObjects(forClasses: [NSURL.self], options: nil) as? [URL] else {
            return nil
        }
        return items
    }

    // MARK: - File Actions

    func openFile(at url: URL) {
        let ext = url.pathExtension.lowercased()
        if ext == "json" {
            guard let content = try? String(contentsOf: url, encoding: .utf8) else {
                showErrorAlert(message: "Impossibile leggere il file di progetto JSON.")
                return
            }
            executeDesktopLoadProject(jsonContent: content)
        } else if ext == "xml" || ext == "musicxml" {
            guard let content = try? String(contentsOf: url, encoding: .utf8) else {
                showErrorAlert(message: "Impossibile leggere il file MusicXML.")
                return
            }
            executeDesktopLoadMusicXML(xmlContent: content)
        }
    }

    func showOpenPanel() {
        let panel = NSOpenPanel()
        panel.allowedContentTypes = [
            UTType(filenameExtension: "xml") ?? .xml,
            UTType(filenameExtension: "musicxml") ?? .xml,
            UTType(filenameExtension: "mxl") ?? .data,
            UTType.json
        ]
        panel.allowsMultipleSelection = false
        panel.canChooseDirectories = false
        panel.canChooseFiles = true
        panel.prompt = "Apri"
        panel.message = "Seleziona un file MusicXML (.xml, .musicxml) o un progetto Whiteboard (.json)"

        panel.begin { [weak self] response in
            if response == .OK, let selectedURL = panel.url {
                self?.openFile(at: selectedURL)
            }
        }
    }

    func triggerSaveProject() {
        webView.evaluateJavaScript("if (typeof saveProject === 'function') { saveProject(); } else { const btn = document.getElementById('save-project-btn'); if (btn) btn.click(); }")
    }

    func triggerExportPDF() {
        webView.evaluateJavaScript("if (typeof exportToPDF === 'function') { exportToPDF(); } else { const btn = document.getElementById('export-pdf-btn'); if (btn) btn.click(); }")
    }

    func triggerUndo() {
        webView.evaluateJavaScript("const btn = document.getElementById('btn-undo'); if (btn && !btn.disabled) btn.click();")
    }

    func triggerRedo() {
        webView.evaluateJavaScript("const btn = document.getElementById('btn-redo'); if (btn && !btn.disabled) btn.click();")
    }

    func triggerView3D() {
        webView.evaluateJavaScript("const btn = document.getElementById('btn-view-3d'); if (btn) btn.click();")
    }

    func triggerAudioTool() {
        openSecondaryWindow(relativePath: "audio-tool.html", title: "MusicXML Whiteboard - Audio Visualizer")
    }

    func triggerManual() {
        openSecondaryWindow(relativePath: "manuale.html", title: "MusicXML Whiteboard - Manuale Utente")
    }

    func zoomIn() {
        webView.evaluateJavaScript("if (typeof zoomWorkspace === 'function') { zoomWorkspace(0.1); }")
    }

    func zoomOut() {
        webView.evaluateJavaScript("if (typeof zoomWorkspace === 'function') { zoomWorkspace(-0.1); }")
    }

    func resetZoom() {
        webView.evaluateJavaScript("if (typeof setZoom === 'function') { setZoom(1.0); } else { currentZoom = 1.0; if (typeof updateWorkspaceSize === 'function') updateWorkspaceSize(); }")
    }

    func reloadPage() {
        webView.reload()
    }

    private func executeDesktopLoadProject(jsonContent: String) {
        let escaped = jsonContent
            .replacingOccurrences(of: "\\", with: "\\\\")
            .replacingOccurrences(of: "\"", with: "\\\"")
            .replacingOccurrences(of: "\n", with: "\\n")
            .replacingOccurrences(of: "\r", with: "\\r")
        let js = "if (window.__desktopLoadProjectJSON) { window.__desktopLoadProjectJSON(\"\(escaped)\"); }"
        webView.evaluateJavaScript(js)
    }

    private func executeDesktopLoadMusicXML(xmlContent: String) {
        let escaped = xmlContent
            .replacingOccurrences(of: "\\", with: "\\\\")
            .replacingOccurrences(of: "\"", with: "\\\"")
            .replacingOccurrences(of: "\n", with: "\\n")
            .replacingOccurrences(of: "\r", with: "\\r")
        let js = "if (window.__desktopLoadMusicXML) { window.__desktopLoadMusicXML(\"\(escaped)\"); }"
        webView.evaluateJavaScript(js)
    }

    private func openSecondaryWindow(relativePath: String, title: String) {
        guard let base = EmbeddedWebServer.shared.serverURL else { return }
        let targetURL = base.appendingPathComponent(relativePath)
        let config = WKWebViewConfiguration()
        config.preferences.setValue(true, forKey: "developerExtrasEnabled")
        let newWebView = WKWebView(frame: .zero, configuration: config)
        let controller = SecondaryWebWindowController(webView: newWebView, title: title)
        newWebView.load(URLRequest(url: targetURL))
        controller.showWindow(self)
    }

    private func showErrorAlert(message: String) {
        let alert = NSAlert()
        alert.messageText = "Errore"
        alert.informativeText = message
        alert.alertStyle = .warning
        alert.addButton(withTitle: "OK")
        alert.runModal()
    }

    // MARK: - WKUIDelegate

    func webView(_ webView: WKWebView, createWebViewWith configuration: WKWebViewConfiguration, for navigationAction: WKNavigationAction, windowFeatures: WKWindowFeatures) -> WKWebView? {
        let targetURL = navigationAction.request.url?.absoluteString ?? ""
        var windowTitle = "MusicXML Whiteboard"
        var windowSize = CGSize(width: 1200, height: 800)

        if targetURL.contains("view3d") {
            windowTitle = "MusicXML Whiteboard - Visualizzatore 3D"
        } else if targetURL.contains("audio-tool") {
            windowTitle = "MusicXML Whiteboard - Audio Visualizer"
            windowSize = CGSize(width: 1100, height: 750)
        } else if targetURL.contains("manuale") {
            windowTitle = "MusicXML Whiteboard - Manuale Utente"
            windowSize = CGSize(width: 900, height: 800)
        }

        let newWebView = WKWebView(frame: .zero, configuration: configuration)
        let windowController = SecondaryWebWindowController(webView: newWebView, title: windowTitle, defaultSize: windowSize)
        windowController.showWindow(self)
        return newWebView
    }

    func webView(_ webView: WKWebView, runJavaScriptAlertPanelWithMessage message: String, initiatedByFrame frame: WKFrameInfo, completionHandler: @escaping () -> Void) {
        let alert = NSAlert()
        alert.messageText = "MusicXML Whiteboard"
        alert.informativeText = message
        alert.addButton(withTitle: "OK")
        alert.runModal()
        completionHandler()
    }

    func webView(_ webView: WKWebView, runJavaScriptConfirmPanelWithMessage message: String, initiatedByFrame frame: WKFrameInfo, completionHandler: @escaping (Bool) -> Void) {
        let alert = NSAlert()
        alert.messageText = "MusicXML Whiteboard"
        alert.informativeText = message
        alert.addButton(withTitle: "OK")
        alert.addButton(withTitle: "Annulla")
        let response = alert.runModal()
        completionHandler(response == .alertFirstButtonReturn)
    }

    func webView(_ webView: WKWebView, runOpenPanelWith parameters: WKOpenPanelParameters, initiatedByFrame frame: WKFrameInfo, completionHandler: @escaping ([URL]?) -> Void) {
        let openPanel = NSOpenPanel()
        openPanel.allowsMultipleSelection = parameters.allowsMultipleSelection
        openPanel.canChooseDirectories = parameters.allowsDirectories
        openPanel.canChooseFiles = true
        openPanel.begin { result in
            if result == .OK {
                completionHandler(openPanel.urls)
            } else {
                completionHandler(nil)
            }
        }
    }

    // MARK: - WKNavigationDelegate

    func webView(_ webView: WKWebView, decidePolicyFor navigationAction: WKNavigationAction, preferences: WKWebpagePreferences, decisionHandler: @escaping (WKNavigationActionPolicy, WKWebpagePreferences) -> Void) {
        if navigationAction.shouldPerformDownload {
            decisionHandler(.download, preferences)
            return
        }

        guard let url = navigationAction.request.url else {
            decisionHandler(.allow, preferences)
            return
        }

        if url.host == "127.0.0.1" || url.host == "localhost" || url.scheme == "file" || url.scheme == "blob" || url.scheme == "data" {
            decisionHandler(.allow, preferences)
        } else {
            // External URL clicked, open in default macOS browser
            NSWorkspace.shared.open(url)
            decisionHandler(.cancel, preferences)
        }
    }

    func webView(_ webView: WKWebView, decidePolicyFor navigationResponse: WKNavigationResponse, decisionHandler: @escaping (WKNavigationResponsePolicy) -> Void) {
        if navigationResponse.canShowMIMEType {
            decisionHandler(.allow)
        } else {
            decisionHandler(.download)
        }
    }

    // MARK: - WKDownloadDelegate

    func download(_ download: WKDownload, decideDestinationUsing response: URLResponse, suggestedFilename: String, completionHandler: @escaping (URL?) -> Void) {
        let savePanel = NSSavePanel()
        savePanel.nameFieldStringValue = suggestedFilename
        savePanel.canCreateDirectories = true
        savePanel.prompt = "Salva"

        savePanel.begin { result in
            if result == .OK, let destinationURL = savePanel.url {
                try? FileManager.default.removeItem(at: destinationURL)
                completionHandler(destinationURL)
            } else {
                completionHandler(nil)
            }
        }
    }

    func downloadDidFinish(_ download: WKDownload) {
        NSLog("[WebViewController] Download completato.")
    }

    func download(_ download: WKDownload, didFailWithError error: Error, resumeData: Data?) {
        NSLog("[WebViewController] Errore download: %@", error.localizedDescription)
    }
}

// MARK: - Desktop Integration Script

private let desktopIntegrationJS = """
window.__desktopLoadProjectJSON = function(jsonString) {
    try {
        const projectData = JSON.parse(jsonString);
        if (projectData.title !== undefined) document.getElementById('proj-title').value = projectData.title;
        if (projectData.author !== undefined) document.getElementById('proj-author').value = projectData.author;
        if (projectData.totalSec !== undefined) document.getElementById('total-duration').value = projectData.totalSec;
        if (projectData.gridSec !== undefined) document.getElementById('grid-sec').value = projectData.gridSec;
        if (projectData.zoom !== undefined) currentZoom = projectData.zoom;
        if (projectData.hideSmallTicks !== undefined) {
            const cb = document.getElementById('hide-small-ticks');
            if (cb) cb.checked = projectData.hideSmallTicks;
        }
        if (projectData.legendData) {
            customLegend = projectData.legendData;
            if (typeof updateVisualLegend === 'function') updateVisualLegend();
        }
        if (projectData.snapGrid !== undefined) {
            const snapCb = document.getElementById('snap-grid');
            if (snapCb) snapCb.checked = projectData.snapGrid;
            const ts = document.getElementById('draw-tool');
            if (ts) ts.dispatchEvent(new Event('change'));
        }
        if (projectData.mirrorDraw !== undefined) {
            const mcb = document.getElementById('mirror-draw');
            if (mcb) mcb.checked = projectData.mirrorDraw;
        }

        const legVal = document.getElementById('legend-sec-val');
        const gridSecEl = document.getElementById('grid-sec');
        if (legVal && gridSecEl) legVal.innerText = gridSecEl.value;

        if (typeof initTimeline === 'function') initTimeline();
        tracks = [];
        activeTrackId = null;
        document.getElementById('workspace').innerHTML = '';
        document.getElementById('track-list-body').innerHTML = '';

        if (Array.isArray(projectData.tracks)) {
            projectData.tracks.forEach(t => {
                if (typeof addTrack === 'function') {
                    addTrack(t.name, t.baseY, t.color, t.volume, t.pan, t.eq, t.audioUrl, t.id, t.htmlContent, t.svgContent, t.offsetY);
                }
            });
        }
        if (projectData.activeTrackId && typeof selectTrack === 'function') {
            selectTrack(projectData.activeTrackId);
        }
        if (typeof saveHistoryState === 'function') saveHistoryState();
        return true;
    } catch (e) {
        console.error("Errore importazione desktop:", e);
        alert("Errore caricamento progetto: " + e.message);
        return false;
    }
};

window.__desktopLoadMusicXML = async function(xmlString) {
    if (typeof activeTrackId === 'undefined' || !activeTrackId) {
        alert("Seleziona o crea prima una traccia su cui caricare la partitura MusicXML.");
        return false;
    }
    const activeHtmlLayer = document.getElementById('html-layer-' + activeTrackId);
    if (!activeHtmlLayer) return false;
    activeHtmlLayer.innerHTML = "";
    try {
        await osmd.load(xmlString);
        const totalMeasures = osmd.Sheet.SourceMeasures.length;
        const track = (typeof getActiveTrack === 'function') ? getActiveTrack() : null;
        const trackBaseY = track ? track.baseY : 2500;
        let currentX = (typeof GRID_SIZE !== 'undefined') ? GRID_SIZE : 100;
        let currentY = trackBaseY - 200;
        let rowMaxHeight = 0;
        const timelineCanvasEl = document.getElementById('timeline-canvas');
        const maxAllowedWidth = timelineCanvasEl ? (timelineCanvasEl.width - 100) : 30000;

        for (let i = 1; i <= totalMeasures; i++) {
            osmd.setOptions({ drawFromMeasureNumber: i, drawUpToMeasureNumber: i });
            osmd.render();
            const svgElement = tempContainer.querySelector("svg");
            if (svgElement) {
                const bbox = svgElement.getBBox();
                const boxWidth = bbox.width + 10;
                const boxHeight = bbox.height + 10;
                if (currentX + boxWidth > maxAllowedWidth) {
                    currentX = (typeof GRID_SIZE !== 'undefined') ? GRID_SIZE : 100;
                    currentY += rowMaxHeight + 10;
                    rowMaxHeight = 0;
                }
                const box = document.createElement("div");
                box.className = "measure-box";
                box.style.left = currentX + 'px';
                box.style.top = currentY + 'px';
                box.style.width = boxWidth + 'px';
                box.style.height = boxHeight + 'px';
                box.dataset.measure = i;
                box.dataset.track = activeTrackId;
                box.innerHTML = svgElement.outerHTML;
                activeHtmlLayer.appendChild(box);
                if (typeof makeDraggable === 'function') makeDraggable(box);
                currentX += boxWidth + 10;
                if (boxHeight > rowMaxHeight) rowMaxHeight = boxHeight;
            }
        }
        if (typeof saveHistoryState === 'function') saveHistoryState();
        return true;
    } catch (e) {
        console.error("Errore caricamento MusicXML:", e);
        alert("Errore durante il rendering del file MusicXML: " + e.message);
        return false;
    }
};
"""
