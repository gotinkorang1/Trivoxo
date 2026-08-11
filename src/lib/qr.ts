import QRCode from 'qrcode'

const OPTIONS = { margin: 1, width: 240, errorCorrectionLevel: 'M' as const }

/** Inline SVG QR — for web pages (crisp, themeable, no external request). */
export function qrSvg(text: string): Promise<string> {
  return QRCode.toString(text, { type: 'svg', ...OPTIONS })
}

/** PNG data URL QR — for emails, where inline SVG is unreliable. */
export function qrDataUrl(text: string): Promise<string> {
  return QRCode.toDataURL(text, OPTIONS)
}
