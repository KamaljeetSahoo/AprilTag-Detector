# WASM Files Setup

The app uses WebAssembly (WASM) files for AprilTag detection. These files need to be accessible to the WebView.

## Current Setup

The WASM files are in the project root:
- `apriltag.js` - Worker script that wraps the WASM module
- `apriltag_wasm.js` - WASM loader/initializer
- `apriltag_wasm.wasm` - Compiled WASM binary

## Loading WASM in WebView

The WebView component loads these files. There are a few approaches:

### Option 1: Bundle WASM Files (Recommended)

1. Copy WASM files to `assets/wasm/` folder
2. Update `app.config.js` to include them in `assetBundlePatterns`
3. Load them using `expo-asset` or direct file paths

### Option 2: Host WASM Files

1. Host the WASM files on a CDN or local server
2. Update the WebView HTML to load from the URL

### Option 3: Inline WASM (Current Implementation)

The current implementation tries to fetch WASM files from relative paths. For this to work:

1. **For Development**: The files need to be accessible via HTTP
   - Use `expo start` with web support
   - Or use a local server

2. **For Production**: Bundle the files as assets
   - Add to `assets/` folder
   - Update `app.config.js`:
     ```js
     assetBundlePatterns: ['**/*', 'assets/wasm/**/*']
     ```

## Quick Fix for Testing

To test immediately, you can:

1. Start a local HTTP server in the project root:
   ```bash
   npx http-server -p 8080
   ```

2. Update the WebView to load from `http://localhost:8080`

3. Or use Expo's web support:
   ```bash
   npx expo start --web
   ```

## Production Solution

For production, the best approach is to:

1. Copy WASM files to `assets/wasm/`
2. Use `expo-asset` to get the file URIs
3. Pass these URIs to the WebView
4. Load them in the WebView HTML

This ensures the files are bundled with the app and work offline.
