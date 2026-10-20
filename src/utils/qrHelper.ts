import QRCode from 'qrcode';

export interface QRPayload {
  type: 'HANDOVER_PROTOCOL' | 'DEVICE_ASSET' | 'URL';
  protocolId?: string;
  protocolNumber?: string;
  deviceId?: string;
  deviceCode?: string;
  deviceName?: string;
  timestamp?: string;
  rawText?: string;
}

/**
 * Generate QR code as Base64 Data URL
 */
export async function generateQRCodeDataURL(text: string, options: { width?: number; margin?: number; color?: { dark: string; light: string } } = {}): Promise<string> {
  try {
    return await QRCode.toDataURL(text, {
      width: options.width || 256,
      margin: options.margin ?? 1,
      color: {
        dark: options.color?.dark || '#0f172a',
        light: options.color?.light || '#ffffff',
      },
      errorCorrectionLevel: 'M',
    });
  } catch (err) {
    console.error('Failed to generate QR code:', err);
    return '';
  }
}

/**
 * Build standard QR payload string for a handover protocol
 */
export function buildProtocolQRPayload(protocolId: string, protocolNumber: string): string {
  return JSON.stringify({
    app: 'HANDOVER_PRO',
    type: 'HANDOVER_PROTOCOL',
    id: protocolId,
    code: protocolNumber,
    ts: new Date().toISOString(),
  });
}

/**
 * Build standard QR payload string for an individual device
 */
export function buildDeviceQRPayload(protocolId: string, deviceId: string, deviceCode: string, deviceName: string): string {
  return JSON.stringify({
    app: 'HANDOVER_PRO',
    type: 'DEVICE_ASSET',
    protocolId,
    deviceId,
    deviceCode,
    deviceName,
    ts: new Date().toISOString(),
  });
}

/**
 * Parse QR string from camera / image scan
 */
export function parseQRPayload(qrText: string): QRPayload {
  const trimmed = qrText.trim();
  try {
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      const data = JSON.parse(trimmed);
      if (data.type === 'HANDOVER_PROTOCOL') {
        return {
          type: 'HANDOVER_PROTOCOL',
          protocolId: data.id,
          protocolNumber: data.code,
          timestamp: data.ts,
          rawText: trimmed,
        };
      }
      if (data.type === 'DEVICE_ASSET') {
        return {
          type: 'DEVICE_ASSET',
          protocolId: data.protocolId,
          deviceId: data.deviceId,
          deviceCode: data.deviceCode,
          deviceName: data.deviceName,
          timestamp: data.ts,
          rawText: trimmed,
        };
      }
    }
  } catch {
    // Not valid JSON, continue to string match
  }

  // Check if string matches format: BBBG-xxx or contains protocol ID
  return {
    type: 'URL',
    rawText: trimmed,
  };
}

/**
 * Play pleasant confirmation beep using Web Audio API
 */
export function playScanSuccessSound() {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    // Play two-tone pleasant success chime (880Hz then 1320Hz)
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sine';
    osc2.type = 'triangle';

    const now = ctx.currentTime;
    osc1.frequency.setValueAtTime(784, now); // G5
    osc1.frequency.exponentialRampToValueAtTime(1046.5, now + 0.12); // C6

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.28);

    osc1.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc1.stop(now + 0.3);
  } catch (e) {
    console.warn('AudioContext beep not allowed or supported', e);
  }
}
