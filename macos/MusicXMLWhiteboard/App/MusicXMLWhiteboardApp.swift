import SwiftUI

struct WebViewRepresentable: NSViewControllerRepresentable {
    func makeNSViewController(context: Context) -> WebViewController {
        return WebViewController()
    }

    func updateNSViewController(_ nsViewController: WebViewController, context: Context) {}
}

@main
struct MusicXMLWhiteboardApp: App {
    @NSApplicationDelegateAdaptor(AppDelegate.self) var appDelegate

    var body: some Scene {
        WindowGroup("MusicXML Whiteboard Pro 3D") {
            WebViewRepresentable()
                .frame(minWidth: 1000, minHeight: 650)
                .background(Color(red: 0.16, green: 0.17, blue: 0.20))
        }
        .defaultSize(width: 1360, height: 860)
        .commands {
            CommandGroup(replacing: .newItem) {
                Button("Apri...") {
                    WebViewController.sharedMainController?.showOpenPanel()
                }
                .keyboardShortcut("o", modifiers: .command)

                Divider()

                Button("Salva Progetto") {
                    WebViewController.sharedMainController?.triggerSaveProject()
                }
                .keyboardShortcut("s", modifiers: .command)

                Button("Esporta PDF...") {
                    WebViewController.sharedMainController?.triggerExportPDF()
                }
                .keyboardShortcut("e", modifiers: [.command, .shift])
            }

            CommandGroup(replacing: .undoRedo) {
                Button("Annulla") {
                    WebViewController.sharedMainController?.triggerUndo()
                }
                .keyboardShortcut("z", modifiers: .command)

                Button("Ripristina") {
                    WebViewController.sharedMainController?.triggerRedo()
                }
                .keyboardShortcut("z", modifiers: [.command, .shift])
            }

            CommandGroup(after: .toolbar) {
                Button("Visualizzatore 3D...") {
                    WebViewController.sharedMainController?.triggerView3D()
                }
                .keyboardShortcut("3", modifiers: .command)

                Button("Audio Visualizer...") {
                    WebViewController.sharedMainController?.triggerAudioTool()
                }
                .keyboardShortcut("a", modifiers: [.command, .shift])

                Button("Manuale Utente...") {
                    WebViewController.sharedMainController?.triggerManual()
                }
                .keyboardShortcut("?", modifiers: .command)

                Divider()

                Button("Ingrandisci (Zoom +)") {
                    WebViewController.sharedMainController?.zoomIn()
                }
                .keyboardShortcut("+", modifiers: .command)

                Button("Rimpicciolisci (Zoom -)") {
                    WebViewController.sharedMainController?.zoomOut()
                }
                .keyboardShortcut("-", modifiers: .command)

                Button("Zoom Reale (100%)") {
                    WebViewController.sharedMainController?.resetZoom()
                }
                .keyboardShortcut("0", modifiers: .command)

                Divider()

                Button("Ricarica") {
                    WebViewController.sharedMainController?.reloadPage()
                }
                .keyboardShortcut("r", modifiers: .command)
            }
        }
    }
}
