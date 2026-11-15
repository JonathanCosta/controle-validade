/**
 * Scanner de código de barras (ESPECIFICACAO §6.3; skill scanner).
 *
 * Estratégia de melhoria progressiva:
 * 1. BarcodeDetector nativo apenas se getSupportedFormats() confirmar ean_8+ean_13
 *    e a criação do detector funcionar;
 * 2. fallback @zxing/browser carregado por import() dinâmico, restrito a EAN-8/EAN-13;
 * 3. se ambos falharem, cadastro manual permanece disponível.
 *
 * A câmera encerra em TODOS os caminhos: leitura aceita, cancelamento, erro,
 * troca de rota ou aba oculta (document.visibilitychange).
 */

import { isValidEan } from '../domain/ean.ts';

export interface BarcodeDetectorLike {
  detect(source: CanvasImageSource): Promise<Array<{ rawValue: string }>>;
}

export interface BarcodeDetectorConstructor {
  new (options?: { formats: string[] }): BarcodeDetectorLike;
  getSupportedFormats?(): Promise<string[]>;
}

export interface ScannerHandle {
  /** Encerra câmera, timers e overlay. Idempotente. */
  close(): void;
}

export interface ScannerOptions {
  onDetected: (ean: string) => void;
  /** Chamado uma única vez quando o scanner não pode ser usado. */
  onError: (message: string) => void;
}

export const SCANNER_ERROR_MESSAGES = {
  insecure: 'A câmera exige conexão segura (HTTPS) ou localhost. Você pode digitar o nome do produto.',
  permission: 'Permissão de câmera negada. Libere o acesso nas configurações do navegador ou digite o nome do produto.',
  noCamera: 'Nenhuma câmera disponível. Você pode digitar o nome do produto.',
  busy: 'A câmera está em uso por outro aplicativo. Feche-o e tente novamente, ou digite o nome do produto.',
  unsupported: 'Scanner não disponível neste navegador. Você pode digitar o nome do produto.',
  failure: 'Não foi possível iniciar a leitura. Você pode digitar o nome do produto.',
} as const;

/**
 * Verificação do suporte nativo (§6.3): não basta `'BarcodeDetector' in window`.
 * Testável: recebe o construtor explicitamente.
 */
export async function detectNativeBarcodeSupport(
  ctor: BarcodeDetectorConstructor | undefined,
): Promise<boolean> {
  if (!ctor || typeof ctor.getSupportedFormats !== 'function') {
    return false;
  }
  try {
    const formats = await ctor.getSupportedFormats();
    if (!formats.includes('ean_13') || !formats.includes('ean_8')) {
      return false;
    }
    // A criação precisa funcionar de fato (pode estar desabilitada).
    new ctor({ formats: ['ean_13', 'ean_8'] });
    return true;
  } catch {
    return false;
  }
}

type StreamSource = MediaStream;

let activeScanner: ScannerHandle | null = null;

/** Abre o overlay de scanner; apenas um por vez. */
export async function openScanner(options: ScannerOptions): Promise<ScannerHandle> {
  if (activeScanner) {
    activeScanner.close();
    activeScanner = null;
  }

  const overlay = createOverlay();
  document.body.appendChild(overlay.root);
  overlay.root.showModal();

  let stopped = false;
  let detectionTimer = 0;
  let stream: StreamSource | null = null;
  let zxingStop: (() => void) | null = null;

  function stopEverything(): void {
    if (stopped) {
      return;
    }
    stopped = true;
    window.clearTimeout(detectionTimer);
    if (zxingStop) {
      try {
        zxingStop();
      } catch {
        // encerramento best-effort
      }
      zxingStop = null;
    }
    if (stream) {
      for (const track of stream.getTracks()) {
        track.stop();
      }
      stream = null;
    }
    overlay.video.srcObject = null;
    if (overlay.root.open) {
      overlay.root.close();
    }
    overlay.root.remove();
    window.removeEventListener('hashchange', handleHashChange);
    document.removeEventListener('visibilitychange', handleVisibility);
    if (activeScanner === handle) {
      activeScanner = null;
    }
  }

  function handleHashChange(): void {
    stopEverything();
  }

  function handleVisibility(): void {
    if (document.visibilityState === 'hidden') {
      stopEverything();
    }
  }

  function failWith(message: string): void {
    options.onError(message);
    stopEverything();
  }

  function handleRawValue(rawValue: string): void {
    if (stopped) {
      return;
    }
    if (!isValidEan(rawValue)) {
      return; // ignora leitura inválida e continua procurando
    }
    try {
      navigator.vibrate?.(100);
    } catch {
      // vibração é opcional
    }
    options.onDetected(rawValue);
    stopEverything();
  }

  window.addEventListener('hashchange', handleHashChange);
  document.addEventListener('visibilitychange', handleVisibility);
  overlay.root.addEventListener('close', stopEverything);
  overlay.closeButton.addEventListener('click', stopEverything);

  const handle: ScannerHandle = { close: stopEverything };
  activeScanner = handle;

  (async () => {
    try {
      if (!window.isSecureContext) {
        failWith(SCANNER_ERROR_MESSAGES.insecure);
        return;
      }
      if (!navigator.mediaDevices?.getUserMedia) {
        failWith(SCANNER_ERROR_MESSAGES.unsupported);
        return;
      }

      const nativeDetector = await detectNativeBarcodeSupport(
        (window as Window & { BarcodeDetector?: BarcodeDetectorConstructor }).BarcodeDetector,
      );

      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false,
      });
      // O usuário pode ter cancelado enquanto o prompt de permissão estava
      // aberto: encerra imediatamente o stream recém-aberto (§17.4).
      if (stopped) {
        for (const track of stream.getTracks()) {
          track.stop();
        }
        stream = null;
        return;
      }
      overlay.video.srcObject = stream;
      await overlay.video.play();

      if (nativeDetector) {
        enableTorchIfSupported(stream, overlay.actions);
        startNativeDetection();
      } else {
        await startZxingDetection();
      }
    } catch (error) {
      failWith(cameraErrorMessage(error));
    }
  })();

  function startNativeDetection(): void {
    const ctor = (window as Window & { BarcodeDetector?: BarcodeDetectorConstructor }).BarcodeDetector;
    if (!ctor) {
      failWith(SCANNER_ERROR_MESSAGES.unsupported);
      return;
    }
    const detector = new ctor({ formats: ['ean_13', 'ean_8'] });
    let lastRead = { value: '', at: 0 };

    const scan = async (): Promise<void> => {
      if (stopped || !overlay.video.srcObject) {
        return;
      }
      try {
        const codes = await detector.detect(overlay.video);
        const first = codes[0]?.rawValue;
        if (first && isValidEan(first)) {
          const now = Date.now();
          // Proteção contra leitura repetida do mesmo código (1,5s).
          if (first !== lastRead.value || now - lastRead.at > 1500) {
            lastRead = { value: first, at: now };
            handleRawValue(first);
            return;
          }
        }
      } catch {
        // frames falhos são ignorados; próxima tentativa continua
      }
      detectionTimer = window.setTimeout(() => {
        void scan();
      }, 150);
    };
    void scan();
  }

  async function startZxingDetection(): Promise<void> {
    // ZXing abre e gerencia o próprio stream: encerra o meu antes para
    // não manter duas câmeras abertas.
    if (stream) {
      for (const track of stream.getTracks()) {
        track.stop();
      }
      stream = null;
      overlay.video.srcObject = null;
    }
    const [{ BrowserMultiFormatReader }, zxing] = await Promise.all([
      import('@zxing/browser'),
      import('@zxing/library'),
    ]);
    if (stopped) {
      return; // cancelamento durante o download do chunk dinâmico
    }
    const hints = new Map<unknown, unknown>();
    hints.set(zxing.DecodeHintType.POSSIBLE_FORMATS, [
      zxing.BarcodeFormat.EAN_13,
      zxing.BarcodeFormat.EAN_8,
    ]);
    const reader = new BrowserMultiFormatReader(hints as never, {
      delayBetweenScanAttempts: 150,
    });
    const controls = await reader.decodeFromVideoDevice(
      undefined,
      overlay.video,
      (result) => {
        if (result) {
          handleRawValue(result.getText());
        }
      },
    );
    // Cancelamento pode ter ocorrido durante a abertura da câmera do ZXing.
    if (stopped) {
      controls.stop();
      return;
    }
    zxingStop = () => {
      controls.stop();
    };
  }

  return handle;
}

function cameraErrorMessage(error: unknown): string {
  if (error instanceof DOMException || error instanceof Error) {
    switch (error.name) {
      case 'NotAllowedError':
      case 'PermissionDeniedError':
        return SCANNER_ERROR_MESSAGES.permission;
      case 'NotFoundError':
      case 'DevicesNotFoundError':
        return SCANNER_ERROR_MESSAGES.noCamera;
      case 'NotReadableError':
      case 'TrackStartError':
        return SCANNER_ERROR_MESSAGES.busy;
      case 'OverconstrainedError':
        // Única tentativa menos restritiva acontece na próxima abertura;
        // por ora, orientar o usuário.
        return SCANNER_ERROR_MESSAGES.failure;
      case 'SecurityError':
        return SCANNER_ERROR_MESSAGES.insecure;
      default:
        return SCANNER_ERROR_MESSAGES.failure;
    }
  }
  return SCANNER_ERROR_MESSAGES.failure;
}

interface Overlay {
  root: HTMLDialogElement;
  video: HTMLVideoElement;
  closeButton: HTMLButtonElement;
  actions: HTMLElement;
}

function createOverlay(): Overlay {
  const root = document.createElement('dialog');
  root.className = 'scanner-overlay';
  root.setAttribute('aria-label', 'Escanear código de barras');

  const frame = document.createElement('div');
  frame.className = 'scanner-frame';

  const video = document.createElement('video');
  video.className = 'scanner-video';
  video.setAttribute('playsinline', '');
  video.muted = true;

  const instruction = document.createElement('p');
  instruction.className = 'scanner-instruction';
  instruction.textContent = 'Aponte para o código de barras';

  const closeButton = document.createElement('button');
  closeButton.type = 'button';
  closeButton.className = 'scanner-close';
  closeButton.textContent = 'Cancelar';
  closeButton.setAttribute('aria-label', 'Fechar scanner');

  const actions = document.createElement('div');
  actions.className = 'scanner-actions';
  actions.appendChild(closeButton);

  frame.append(video, instruction);
  root.append(frame, actions);

  return { root, video, closeButton, actions };
}

/**
 * Lanterna apenas quando o dispositivo e a track suportam (§6.3);
 * nunca exibir controle falso.
 */
function enableTorchIfSupported(
  stream: MediaStream,
  host: HTMLElement,
): void {
  const track = stream.getVideoTracks()[0];
  const capabilities = track?.getCapabilities?.() as
    | (MediaTrackCapabilities & { torch?: boolean })
    | undefined;
  if (!track || !capabilities?.torch) {
    return;
  }
  let torchOn = false;
  const torchButton = document.createElement('button');
  torchButton.type = 'button';
  torchButton.className = 'scanner-torch';

  const updateButton = (): void => {
    torchButton.textContent = torchOn ? 'Desligar lanterna' : 'Ligar lanterna';
    torchButton.setAttribute('aria-pressed', String(torchOn));
  };
  updateButton();

  torchButton.addEventListener('click', () => {
    torchOn = !torchOn;
    void track
      .applyConstraints({
        advanced: [{ torch: torchOn } as unknown as MediaTrackConstraintSet],
      })
      .then(updateButton)
      .catch(() => {
        torchOn = false;
        updateButton();
      });
  });

  host.insertBefore(torchButton, host.firstChild);
}
