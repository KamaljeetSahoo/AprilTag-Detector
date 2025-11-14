import { Asset } from 'expo-asset';

export async function createWasmHTML(): Promise<string> {
  // Load WASM files as assets
  // For now, we'll use a simpler approach with inline code
  // In production, you'd load these from assets
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script src="https://unpkg.com/comlink/dist/umd/comlink.js"></script>
    </head>
    <body>
        <script>
            let apriltag = null;
            let isReady = false;
            
            function sendMessage(message) {
                if (window.ReactNativeWebView) {
                    window.ReactNativeWebView.postMessage(JSON.stringify(message));
                }
            }
            
            async function initDetector() {
                try {
                    // Create worker with inline code that loads WASM
                    // We'll fetch the WASM files from the bundle
                    
                    const workerCode = \`
                        importScripts('https://unpkg.com/comlink/dist/umd/comlink.js');
                        
                        let Module = null;
                        let detectorInitialized = false;
                        
                        // Load WASM module
                        async function loadWasm() {
                            try {
                                // Try to load apriltag_wasm.js
                                // For React Native, we need to use fetch with the correct path
                                const wasmJsUrl = './apriltag_wasm.js';
                                
                                // Use importScripts if available, otherwise fetch
                                try {
                                    importScripts(wasmJsUrl);
                                } catch (e) {
                                    // If importScripts fails, try fetch + eval
                                    const response = await fetch(wasmJsUrl);
                                    const code = await response.text();
                                    eval(code);
                                }
                                
                                // Now AprilTagWasm should be available
                                if (typeof AprilTagWasm === 'function') {
                                    Module = await AprilTagWasm({
                                        locateFile: (path) => {
                                            // Return path to WASM file
                                            if (path.endsWith('.wasm')) {
                                                return './apriltag_wasm.wasm';
                                            }
                                            return path;
                                        }
                                    });
                                    initializeDetector();
                                } else {
                                    throw new Error('AprilTagWasm function not found');
                                }
                            } catch (error) {
                                self.postMessage({ type: 'error', error: error.toString() });
                            }
                        }
                        
                        function initializeDetector() {
                            const _init = Module.cwrap('atagjs_init', 'number', []);
                            const _set_detector_options = Module.cwrap('atagjs_set_detector_options', 'number', ['number', 'number', 'number', 'number', 'number', 'number', 'number']);
                            const _set_img_buffer = Module.cwrap('atagjs_set_img_buffer', 'number', ['number', 'number', 'number']);
                            const _detect = Module.cwrap('atagjs_detect', 'number', []);
                            
                            _init();
                            _set_detector_options(2.0, 0.0, 1, 1, 0, 1, 1);
                            
                            detectorInitialized = true;
                            
                            Comlink.expose({
                                detect: async function(grayscaleImg, imgWidth, imgHeight) {
                                    if (!detectorInitialized) {
                                        return [];
                                    }
                                    
                                    const imgBuffer = _set_img_buffer(imgWidth, imgHeight, imgWidth);
                                    if (imgWidth * imgHeight < grayscaleImg.length) {
                                        return [];
                                    }
                                    
                                    Module.HEAPU8.set(grayscaleImg, imgBuffer);
                                    const strJsonPtr = _detect();
                                    const strJsonLen = Module.getValue(strJsonPtr, 'i32');
                                    
                                    if (strJsonLen === 0) {
                                        return [];
                                    }
                                    
                                    const strJsonStrPtr = Module.getValue(strJsonPtr + 4, 'i32');
                                    const strJsonView = new Uint8Array(Module.HEAP8.buffer, strJsonStrPtr, strJsonLen);
                                    let detectionsJson = '';
                                    for (let i = 0; i < strJsonLen; i++) {
                                        detectionsJson += String.fromCharCode(strJsonView[i]);
                                    }
                                    
                                    try {
                                        return JSON.parse(detectionsJson);
                                    } catch (e) {
                                        return [];
                                    }
                                }
                            });
                            
                            self.postMessage({ type: 'ready' });
                        }
                        
                        loadWasm();
                    \`;
                    
                    const blob = new Blob([workerCode], { type: 'application/javascript' });
                    const workerUrl = URL.createObjectURL(blob);
                    const apriltagWorker = new Worker(workerUrl);
                    
                    const Apriltag = Comlink.wrap(apriltagWorker);
                    
                    apriltag = await new Apriltag(Comlink.proxy(() => {
                        isReady = true;
                        sendMessage({ type: 'ready' });
                    }));
                    
                    sendMessage({ type: 'initialized' });
                } catch (error) {
                    sendMessage({ type: 'error', error: error.toString() });
                    console.error('Init error:', error);
                }
            }
            
            async function processImage(imageDataUrl) {
                if (!apriltag || !isReady) {
                    sendMessage({ type: 'error', error: 'Detector not ready' });
                    return;
                }
                
                try {
                    const img = new Image();
                    img.crossOrigin = 'anonymous';
                    
                    img.onload = async function() {
                        const canvas = document.createElement('canvas');
                        canvas.width = img.width;
                        canvas.height = img.height;
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(img, 0, 0);
                        
                        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                        const pixels = imageData.data;
                        
                        const grayscalePixels = new Uint8Array(canvas.width * canvas.height);
                        for (let i = 0, j = 0; i < pixels.length; i += 4, j++) {
                            const grayscale = Math.round((pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3);
                            grayscalePixels[j] = grayscale;
                        }
                        
                        try {
                            const detections = await apriltag.detect(grayscalePixels, canvas.width, canvas.height);
                            sendMessage({ type: 'detections', detections, width: canvas.width, height: canvas.height });
                        } catch (error) {
                            sendMessage({ type: 'error', error: 'Detection failed: ' + error.toString() });
                        }
                    };
                    
                    img.onerror = function() {
                        sendMessage({ type: 'error', error: 'Failed to load image' });
                    };
                    
                    img.src = imageDataUrl;
                } catch (error) {
                    sendMessage({ type: 'error', error: error.toString() });
                }
            }
            
            window.addEventListener('message', function(event) {
                let data;
                try {
                    data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
                } catch (e) {
                    return;
                }
                
                if (data.type === 'init') {
                    initDetector();
                } else if (data.type === 'process') {
                    processImage(data.payload.imageDataUrl);
                }
            });
            
            sendMessage({ type: 'loaded' });
        </script>
    </body>
    </html>
  `;
}
