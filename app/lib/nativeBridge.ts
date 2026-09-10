export type NativeAuthEvent = 'ACCOUNT_DELETED' | 'AUTH_EXPIRED' | 'LOGOUT';
export type NativeNotificationScreen =
  | 'habits'
  | 'todos'
  | 'goals'
  | 'challenges'
  | 'rewards';

export interface NativeNotificationDestination {
  screen: NativeNotificationScreen;
  date?: string;
  entityId?: string;
}

const BRIDGE_SOURCE = 'growdo-web';
const NATIVE_SOURCE = 'growdo-native';
const PENDING_NOTIFICATION_KEY = 'growdo.pendingNotification';
const NOTIFICATION_EVENT = 'growdo:native-notification';
const NOTIFICATION_SCREENS = new Set<NativeNotificationScreen>([
  'habits',
  'todos',
  'goals',
  'challenges',
  'rewards',
]);

interface NativeWebViewBridge {
  postMessage: (message: string) => void;
}

interface NativeBridgeWindow extends Window {
  ReactNativeWebView?: NativeWebViewBridge;
}

interface NativeNotificationMessage {
  source: typeof NATIVE_SOURCE;
  type: 'OPEN_NOTIFICATION';
  destination: NativeNotificationDestination;
}

function postNativeEvent(type: NativeAuthEvent | 'WEB_READY'): boolean {
  if (typeof window === 'undefined') return false;

  const bridge = (window as NativeBridgeWindow).ReactNativeWebView;
  if (!bridge?.postMessage) return false;

  bridge.postMessage(JSON.stringify({ source: BRIDGE_SOURCE, type }));
  return true;
}

function parseNotificationMessage(value: unknown): NativeNotificationMessage | null {
  if (!value || typeof value !== 'object') return null;

  const message = value as Partial<NativeNotificationMessage>;
  const destination = message.destination;
  if (
    message.source !== NATIVE_SOURCE ||
    message.type !== 'OPEN_NOTIFICATION' ||
    !destination ||
    !NOTIFICATION_SCREENS.has(destination.screen)
  ) {
    return null;
  }
  return message as NativeNotificationMessage;
}

export function postNativeAuthEvent(type: NativeAuthEvent): boolean {
  return postNativeEvent(type);
}

export function postNativeBridgeReady(): boolean {
  return postNativeEvent('WEB_READY');
}

export function subscribeToNativeNotificationMessages(
  listener: (destination: NativeNotificationDestination) => void
): () => void {
  const handleMessage = (event: Event) => {
    const data = (event as MessageEvent<unknown>).data;
    if (typeof data !== 'string') return;

    try {
      const message = parseNotificationMessage(JSON.parse(data) as unknown);
      if (message) listener(message.destination);
    } catch {
      // 네이티브 브릿지 형식이 아닌 메시지는 무시한다.
    }
  };

  window.addEventListener('message', handleMessage);
  document.addEventListener('message', handleMessage);
  return () => {
    window.removeEventListener('message', handleMessage);
    document.removeEventListener('message', handleMessage);
  };
}

export function queueNativeNotification(
  destination: NativeNotificationDestination
): void {
  sessionStorage.setItem(PENDING_NOTIFICATION_KEY, JSON.stringify(destination));
  window.dispatchEvent(new CustomEvent(NOTIFICATION_EVENT, { detail: destination }));
}

export function consumeQueuedNativeNotification(): NativeNotificationDestination | null {
  const raw = sessionStorage.getItem(PENDING_NOTIFICATION_KEY);
  sessionStorage.removeItem(PENDING_NOTIFICATION_KEY);
  if (!raw) return null;

  try {
    return (
      parseNotificationMessage({
        source: NATIVE_SOURCE,
        type: 'OPEN_NOTIFICATION',
        destination: JSON.parse(raw) as unknown,
      })?.destination ?? null
    );
  } catch {
    return null;
  }
}

export function subscribeToQueuedNativeNotification(
  listener: (destination: NativeNotificationDestination) => void
): () => void {
  const handleNotification = (event: Event) => {
    if (!(event instanceof CustomEvent)) return;
    sessionStorage.removeItem(PENDING_NOTIFICATION_KEY);
    listener(event.detail as NativeNotificationDestination);
  };

  window.addEventListener(NOTIFICATION_EVENT, handleNotification);
  return () => window.removeEventListener(NOTIFICATION_EVENT, handleNotification);
}
