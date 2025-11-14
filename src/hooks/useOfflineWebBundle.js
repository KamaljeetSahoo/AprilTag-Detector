import { useEffect, useState } from 'react';
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system';

const TARGET_DIR = `${FileSystem.cacheDirectory}apriltag-web/`;

const manifest = [
  { module: require('../../assets/web/index.html'), target: 'index.html' },
  { module: require('../../assets/web/style.css'), target: 'style.css' },
  { module: require('../../assets/web/main.wjs'), target: 'main.js' },
  { module: require('../../assets/web/videoProcess.wjs'), target: 'videoProcess.js' },
  { module: require('../../assets/web/apriltag.wjs'), target: 'apriltag.js' },
  { module: require('../../assets/web/apriltag_wasm.wjs'), target: 'apriltag_wasm.js' },
  { module: require('../../assets/web/apriltag_wasm.wasm'), target: 'apriltag_wasm.wasm' }
];

export function useOfflineWebBundle() {
  const [webViewUri, setWebViewUri] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function prepareBundle() {
      try {
        const dirInfo = await FileSystem.getInfoAsync(TARGET_DIR);
        if (!dirInfo.exists) {
          await FileSystem.makeDirectoryAsync(TARGET_DIR, { intermediates: true });
        }

        for (const item of manifest) {
          const asset = Asset.fromModule(item.module);
          if (!asset.localUri) {
            await asset.downloadAsync();
          }

          const sourcePath = asset.localUri ?? asset.uri;
          const targetPath = `${TARGET_DIR}${item.target}`;

          if (!sourcePath) {
            throw new Error(`Unable to resolve asset for ${item.target}`);
          }

          await FileSystem.deleteAsync(targetPath, { idempotent: true });
          await FileSystem.copyAsync({ from: sourcePath, to: targetPath });
        }

        if (isMounted) {
          setWebViewUri(`${TARGET_DIR}index.html`);
          setLoading(false);
        }
      } catch (err) {
        console.error('Failed to prepare offline bundle', err);
        if (isMounted) {
          setError(err);
          setLoading(false);
        }
      }
    }

    prepareBundle();

    return () => {
      isMounted = false;
    };
  }, []);

  return { webViewUri, loading, error };
}
