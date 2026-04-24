import qrcode from 'qrcode-generator';

import type { ErrorCorrectionLevel } from './types';

export interface Print3dLogo {
  dataUrl: string;
  size: number;
  hideBackgroundDots: boolean;
}

export interface Print3dOptions {
  sizeMm: number;
  errorCorrection: ErrorCorrectionLevel;
  quietZoneModules: number;
  logo?: Print3dLogo | null;
}

interface Bbox {
  x: number;
  y: number;
  size: number;
}

/**
 * Each module is grown by this fraction of its size on all sides. Under a
 * nonzero fill rule, the resulting overlap between adjacent modules unions
 * cleanly into a single solid region, which defeats the hairline seams
 * that slicers otherwise render between shapes that share an exact edge.
 * The overlap is fractions of a millimetre in the final print — nothing a
 * printer can resolve.
 */
const MODULE_OUTSET = 0.02;

function f(n: number): string {
  const r = Math.round(n * 10000) / 10000;
  return String(r);
}

/**
 * Build a slicer-friendly SVG of a QR code.
 *
 * All data modules are rendered as squares regardless of the style used in
 * the on-screen preview — decorative dot/corner styles don't survive round
 * trips through slicers reliably, and square modules extrude cleanly and
 * scan best. Finder patterns are rendered in a separate path with an
 * evenodd fill rule so that their hollow centres are real holes.
 *
 * Coordinates are in millimetres. No base plate is emitted — print onto
 * the build plate with a brim, or add a plate in the slicer.
 */
export async function buildPrint3dSvg(
  data: string,
  opts: Print3dOptions,
): Promise<string> {
  if (!data) return '';

  const qrGen = qrcode(0, opts.errorCorrection);
  qrGen.addData(data);
  qrGen.make();
  const count = qrGen.getModuleCount();

  const q = Math.max(0, Math.round(opts.quietZoneModules));
  const total = count + 2 * q;
  const mm = opts.sizeMm / total;
  const qrDataSize = count * mm;
  const qrDataX = q * mm;
  const qrDataY = q * mm;

  let logoBbox: Bbox | null = null;
  let logoFragment = '';
  if (opts.logo?.dataUrl) {
    const side = Math.max(0, Math.min(1, opts.logo.size)) * qrDataSize;
    if (side > 0) {
      const cx = qrDataX + qrDataSize / 2;
      const cy = qrDataY + qrDataSize / 2;
      logoBbox = {
        x: cx - side / 2,
        y: cy - side / 2,
        size: side,
      };
      try {
        logoFragment = await renderLogoFragment(opts.logo.dataUrl, logoBbox);
      } catch (err) {
        console.warn(
          '3D-print logo rendering failed, continuing without it',
          err,
        );
        logoFragment = '';
      }
    }
  }

  const hideUnderLogo = !!(logoBbox && opts.logo?.hideBackgroundDots);
  const finderOrigins: ReadonlyArray<readonly [number, number]> = [
    [0, 0],
    [0, count - 7],
    [count - 7, 0],
  ];
  const inFinder = (r: number, c: number): boolean => {
    for (const [fr, fc] of finderOrigins) {
      if (r >= fr && r < fr + 7 && c >= fc && c < fc + 7) return true;
    }
    return false;
  };

  const outset = mm * MODULE_OUTSET;
  const moduleSubpaths: string[] = [];
  for (let r = 0; r < count; r++) {
    for (let c = 0; c < count; c++) {
      if (!qrGen.isDark(r, c)) continue;
      if (inFinder(r, c)) continue;

      const x = (q + c) * mm;
      const y = (q + r) * mm;
      if (hideUnderLogo && logoBbox) {
        const mcX = x + mm / 2;
        const mcY = y + mm / 2;
        if (
          mcX >= logoBbox.x &&
          mcX <= logoBbox.x + logoBbox.size &&
          mcY >= logoBbox.y &&
          mcY <= logoBbox.y + logoBbox.size
        ) {
          continue;
        }
      }
      moduleSubpaths.push(
        rectSubpath(x - outset, y - outset, mm + 2 * outset, mm + 2 * outset),
      );
    }
  }

  const finderSubpaths: string[] = [];
  for (const [fr, fc] of finderOrigins) {
    const fx = (q + fc) * mm;
    const fy = (q + fr) * mm;
    finderSubpaths.push(rectSubpath(fx, fy, 7 * mm, 7 * mm));
    finderSubpaths.push(rectSubpath(fx + mm, fy + mm, 5 * mm, 5 * mm));
    finderSubpaths.push(rectSubpath(fx + 2 * mm, fy + 2 * mm, 3 * mm, 3 * mm));
  }

  const sizeAttr = `${f(opts.sizeMm)}mm`;
  const viewBox = `0 0 ${f(opts.sizeMm)} ${f(opts.sizeMm)}`;

  const modulesGroup = moduleSubpaths.length
    ? `\n  <g id="modules" fill="#000000" fill-rule="nonzero" stroke="none"><path d="${moduleSubpaths.join(
        ' ',
      )}"/></g>`
    : '';
  const findersGroup = finderSubpaths.length
    ? `\n  <g id="finders" fill="#000000" fill-rule="evenodd" stroke="none"><path d="${finderSubpaths.join(
        ' ',
      )}"/></g>`
    : '';
  const logoBlock = logoFragment ? `\n  ${logoFragment}` : '';

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${sizeAttr}" height="${sizeAttr}" viewBox="${viewBox}">${findersGroup}${modulesGroup}${logoBlock}
</svg>
`;
}

function rectSubpath(x: number, y: number, w: number, h: number): string {
  return `M${f(x)} ${f(y)}h${f(w)}v${f(h)}h${f(-w)}Z`;
}

async function renderLogoFragment(
  dataUrl: string,
  bbox: Bbox,
): Promise<string> {
  if (dataUrl.startsWith('data:image/svg+xml')) {
    return renderSvgLogo(dataUrl, bbox);
  }
  return renderRasterLogo(dataUrl, bbox);
}

function decodeSvgDataUrl(dataUrl: string): string {
  const comma = dataUrl.indexOf(',');
  if (comma < 0) return '';
  const header = dataUrl.slice(0, comma);
  const payload = dataUrl.slice(comma + 1);
  if (header.includes(';base64')) {
    try {
      const binary = atob(payload);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      return new TextDecoder('utf-8').decode(bytes);
    } catch {
      return '';
    }
  }
  try {
    return decodeURIComponent(payload);
  } catch {
    return payload;
  }
}

function renderSvgLogo(dataUrl: string, bbox: Bbox): string {
  const svgText = decodeSvgDataUrl(dataUrl);
  if (!svgText) return '';
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgText, 'image/svg+xml');
  const root = doc.documentElement;
  if (!root || root.nodeName.toLowerCase() !== 'svg') return '';
  if (root.getElementsByTagName('parsererror').length > 0) return '';

  let vbX = 0;
  let vbY = 0;
  let vbW = 0;
  let vbH = 0;
  const vb = root.getAttribute('viewBox');
  if (vb) {
    const parts = vb.split(/[\s,]+/).map(Number);
    if (parts.length === 4 && parts.every((v) => Number.isFinite(v))) {
      vbX = parts[0];
      vbY = parts[1];
      vbW = parts[2];
      vbH = parts[3];
    }
  }
  if (!vbW || !vbH) {
    vbW = parseFloat(root.getAttribute('width') || '0');
    vbH = parseFloat(root.getAttribute('height') || '0');
  }
  if (!vbW || !vbH) return '';

  const scale = Math.min(bbox.size / vbW, bbox.size / vbH);
  const drawnW = vbW * scale;
  const drawnH = vbH * scale;
  const offsetX = bbox.x + (bbox.size - drawnW) / 2;
  const offsetY = bbox.y + (bbox.size - drawnH) / 2;

  const inner = root.innerHTML;
  const transform =
    `translate(${f(offsetX)} ${f(offsetY)}) ` +
    `scale(${f(scale)}) ` +
    `translate(${f(-vbX)} ${f(-vbY)})`;

  return `<g id="logo" fill="#555555" stroke="none" transform="${transform}">${inner}</g>`;
}

async function renderRasterLogo(dataUrl: string, bbox: Bbox): Promise<string> {
  const img = await loadImage(dataUrl);
  const maxRes = 96;
  const aspect = img.naturalWidth / img.naturalHeight;
  let w: number;
  let h: number;
  if (aspect >= 1) {
    w = maxRes;
    h = Math.max(1, Math.round(maxRes / aspect));
  } else {
    h = maxRes;
    w = Math.max(1, Math.round(maxRes * aspect));
  }

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  ctx.drawImage(img, 0, 0, w, h);
  const pixels = ctx.getImageData(0, 0, w, h).data;
  const total = w * h;

  let transparentCount = 0;
  for (let i = 0; i < total; i++) {
    if (pixels[i * 4 + 3] < 128) transparentCount++;
  }
  const hasTransparency = transparentCount / total > 0.1;

  const solid = new Uint8Array(total);
  if (hasTransparency) {
    for (let i = 0; i < total; i++) {
      solid[i] = pixels[i * 4 + 3] > 128 ? 1 : 0;
    }
  } else {
    for (let i = 0; i < total; i++) {
      const r = pixels[i * 4];
      const g = pixels[i * 4 + 1];
      const b = pixels[i * 4 + 2];
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      solid[i] = lum < 128 ? 1 : 0;
    }
  }

  const scale = Math.min(bbox.size / w, bbox.size / h);
  const drawnW = w * scale;
  const drawnH = h * scale;
  const offsetX = bbox.x + (bbox.size - drawnW) / 2;
  const offsetY = bbox.y + (bbox.size - drawnH) / 2;

  const subpaths: string[] = [];
  for (let y = 0; y < h; y++) {
    let x = 0;
    while (x < w) {
      if (solid[y * w + x]) {
        const runStart = x;
        while (x < w && solid[y * w + x]) x++;
        const runLen = x - runStart;
        const rx = offsetX + runStart * scale;
        const ry = offsetY + y * scale;
        const rw = runLen * scale;
        const rh = scale;
        subpaths.push(rectSubpath(rx, ry, rw, rh));
      } else {
        x++;
      }
    }
  }

  if (subpaths.length === 0) return '';
  return `<g id="logo" fill="#555555" stroke="none"><path d="${subpaths.join(
    ' ',
  )}"/></g>`;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Could not load logo image'));
    img.src = src;
  });
}

export function downloadSvg(filename: string, svg: string): void {
  const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.svg') ? filename : `${filename}.svg`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
