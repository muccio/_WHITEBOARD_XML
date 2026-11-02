import Foundation
import Network

/// Lightweight embedded HTTP server using Network.framework.
/// Listens exclusively on loopback (127.0.0.1) and serves static web assets.
final class EmbeddedWebServer {
    static let shared = EmbeddedWebServer()

    private var listener: NWListener?
    private let queue = DispatchQueue(label: "com.musicxmlwhiteboard.webserver", qos: .userInitiated)
    private var baseDirectory: URL?
    private(set) var port: UInt16 = 0
    private var readyHandlers: [(URL) -> Void] = []
    private var isStarted = false

    var serverURL: URL? {
        guard port > 0 else { return nil }
        return URL(string: "http://127.0.0.1:\(port)")
    }

    private init() {}

    func start(withDirectory directory: URL, completion: @escaping (URL) -> Void) {
        queue.async {
            self.baseDirectory = directory.standardizedFileURL

            if self.port > 0, let url = self.serverURL {
                DispatchQueue.main.async { completion(url) }
                return
            }

            self.readyHandlers.append(completion)
            if self.isStarted { return }
            self.isStarted = true

            do {
                let params = NWParameters.tcp
                params.allowLocalEndpointReuse = true
                let listener = try NWListener(using: params, on: .any)
                self.listener = listener

                listener.stateUpdateHandler = { [weak self] state in
                    self?.handleStateUpdate(state)
                }

                listener.newConnectionHandler = { [weak self] connection in
                    self?.handleConnection(connection)
                }

                listener.start(queue: self.queue)
            } catch {
                NSLog("[EmbeddedWebServer] Impossibile avviare listener: %@", error.localizedDescription)
            }
        }
    }

    func stop() {
        queue.async {
            self.listener?.cancel()
            self.listener = nil
            self.port = 0
            self.isStarted = false
        }
    }

    private func handleStateUpdate(_ state: NWListener.State) {
        switch state {
        case .ready:
            if let assignedPort = listener?.port?.rawValue {
                self.port = assignedPort
                NSLog("[EmbeddedWebServer] In ascolto su http://127.0.0.1:%d", assignedPort)
                if let url = self.serverURL {
                    let handlers = self.readyHandlers
                    self.readyHandlers.removeAll()
                    DispatchQueue.main.async {
                        handlers.forEach { $0(url) }
                    }
                }
            }
        case .failed(let error):
            NSLog("[EmbeddedWebServer] Errore listener: %@", error.localizedDescription)
            self.stop()
        case .cancelled:
            NSLog("[EmbeddedWebServer] Listener interrotto.")
        default:
            break
        }
    }

    private func handleConnection(_ connection: NWConnection) {
        connection.start(queue: queue)
        receiveRequest(on: connection)
    }

    private func receiveRequest(on connection: NWConnection) {
        connection.receive(minimumIncompleteLength: 4, maximumLength: 65536) { [weak self] data, _, isComplete, error in
            guard let self = self else { return }
            if let error = error {
                NSLog("[EmbeddedWebServer] Errore lettura: %@", error.localizedDescription)
                connection.cancel()
                return
            }

            guard let data = data, !data.isEmpty,
                  let requestString = String(data: data, encoding: .utf8) else {
                if isComplete { connection.cancel() }
                return
            }

            self.processHTTPRequest(requestString, on: connection)
        }
    }

    private func processHTTPRequest(_ request: String, on connection: NWConnection) {
        let lines = request.components(separatedBy: "\r\n")
        guard let requestLine = lines.first else {
            sendResponse(status: 400, statusText: "Bad Request", headers: [:], body: Data(), on: connection)
            return
        }

        let parts = requestLine.components(separatedBy: " ")
        guard parts.count >= 2, parts[0] == "GET" || parts[0] == "HEAD" else {
            sendResponse(status: 405, statusText: "Method Not Allowed", headers: [:], body: Data(), on: connection)
            return
        }

        let method = parts[0]
        var rawPath = parts[1]

        // Parse query params and anchors
        if let queryIndex = rawPath.firstIndex(of: "?") {
            rawPath = String(rawPath[..<queryIndex])
        }
        if let hashIndex = rawPath.firstIndex(of: "#") {
            rawPath = String(rawPath[..<hashIndex])
        }

        let decodedPath = rawPath.removingPercentEncoding ?? rawPath
        let cleanPath = decodedPath == "/" ? "/index.html" : decodedPath

        guard let base = baseDirectory else {
            sendResponse(status: 500, statusText: "Internal Error", headers: [:], body: Data(), on: connection)
            return
        }

        var relativePath = cleanPath
        if relativePath.hasPrefix("/") {
            relativePath.removeFirst()
        }

        let targetURL = base.appendingPathComponent(relativePath).standardizedFileURL

        // Security check against path traversal
        guard targetURL.path.hasPrefix(base.path) else {
            sendResponse(status: 403, statusText: "Forbidden", headers: [:], body: Data(), on: connection)
            return
        }

        var isDir: ObjCBool = false
        if FileManager.default.fileExists(atPath: targetURL.path, isDirectory: &isDir) {
            let finalURL: URL
            if isDir.boolValue {
                finalURL = targetURL.appendingPathComponent("index.html")
            } else {
                finalURL = targetURL
            }

            if let fileData = try? Data(contentsOf: finalURL) {
                let mimeType = mimeType(for: finalURL.pathExtension)
                var headers: [String: String] = [
                    "Content-Type": mimeType,
                    "Content-Length": "\(fileData.count)",
                    "Access-Control-Allow-Origin": "*",
                    "Cache-Control": "no-cache",
                    "Connection": "close"
                ]

                let bodyData = (method == "HEAD") ? Data() : fileData
                sendResponse(status: 200, statusText: "OK", headers: headers, body: bodyData, on: connection)
                return
            }
        }

        let notFoundHTML = "<html><body><h1>404 Not Found</h1><p>\(cleanPath)</p></body></html>".data(using: .utf8) ?? Data()
        sendResponse(status: 404, statusText: "Not Found", headers: ["Content-Type": "text/html; charset=utf-8"], body: notFoundHTML, on: connection)
    }

    private func sendResponse(status: Int, statusText: String, headers: [String: String], body: Data, on connection: NWConnection) {
        var headerString = "HTTP/1.1 \(status) \(statusText)\r\n"
        for (k, v) in headers {
            headerString += "\(k): \(v)\r\n"
        }
        if headers["Content-Length"] == nil {
            headerString += "Content-Length: \(body.count)\r\n"
        }
        headerString += "\r\n"

        var responseData = headerString.data(using: .utf8) ?? Data()
        responseData.append(body)

        connection.send(content: responseData, completion: .contentProcessed({ _ in
            connection.cancel()
        }))
    }

    private func mimeType(for ext: String) -> String {
        switch ext.lowercased() {
        case "html", "htm": return "text/html; charset=utf-8"
        case "js", "mjs":   return "application/javascript; charset=utf-8"
        case "css":         return "text/css; charset=utf-8"
        case "json":        return "application/json; charset=utf-8"
        case "xml", "musicxml": return "application/xml; charset=utf-8"
        case "mxl":         return "application/zip"
        case "png":         return "image/png"
        case "jpg", "jpeg": return "image/jpeg"
        case "gif":         return "image/gif"
        case "svg":         return "image/svg+xml"
        case "ico":         return "image/x-icon"
        case "woff2":       return "font/woff2"
        case "woff":        return "font/woff"
        case "ttf":         return "font/ttf"
        case "otf":         return "font/otf"
        case "wav":         return "audio/wav"
        case "mp3":         return "audio/mpeg"
        case "ogg":         return "audio/ogg"
        case "pdf":         return "application/pdf"
        default:            return "application/octet-stream"
        }
    }
}
