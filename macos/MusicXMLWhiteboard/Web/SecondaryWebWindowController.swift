import AppKit
import WebKit

final class SecondaryWebWindowController: NSWindowController, NSWindowDelegate, WKUIDelegate, WKNavigationDelegate {
    private static var openControllers: Set<SecondaryWebWindowController> = []

    let webView: WKWebView

    init(webView: WKWebView, title: String? = nil, defaultSize: CGSize = CGSize(width: 1200, height: 800)) {
        self.webView = webView

        let window = NSWindow(
            contentRect: NSRect(origin: .zero, size: defaultSize),
            styleMask: [.titled, .closable, .miniaturizable, .resizable],
            backing: .buffered,
            defer: false
        )

        window.title = title ?? "MusicXML Whiteboard"
        window.isReleasedWhenClosed = false
        window.center()
        window.backgroundColor = NSColor(calibratedRed: 0.16, green: 0.17, blue: 0.20, alpha: 1.0)
        window.appearance = NSAppearance(named: .darkAqua)

        super.init(window: window)

        window.delegate = self
        window.contentView = webView
        webView.uiDelegate = self
        webView.navigationDelegate = self

        SecondaryWebWindowController.openControllers.insert(self)
    }

    required init?(coder: NSCoder) {
        fatalError("init(coder:) non implementato")
    }

    func windowWillClose(_ notification: Notification) {
        SecondaryWebWindowController.openControllers.remove(self)
    }

    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        if let title = webView.title, !title.isEmpty {
            self.window?.title = title
        }
    }

    func webViewDidClose(_ webView: WKWebView) {
        self.close()
    }
}
