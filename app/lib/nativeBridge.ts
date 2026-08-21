export type NativeAuthEvent = 'AUTH_EXPIRED' | 'LOGOUT';

const BRIDGE_SOURCE = 'growdo-web';

interface NativeWebViewBridge {
  postMessage: (message: string) => void;
}

interface NativeBridgeWindow extends Window {
  ReactNativeWebView?: NativeWebViewBridge;
}

export function postNativeAuthEvent(type: NativeAuthEvent): boolean {
  if (typeof window === 'undefined') return false;

  const bridge = (window as NativeBridgeWindow).ReactNativeWebView;
  if (!bridge?.postMessage) return false;

  bridge.postMessage(
    JSON.stringify({
      source: BRIDGE_SOURCE,
      type,
    })
  );
  return true;
}
