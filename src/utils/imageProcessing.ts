export const MAX_GARMENT_DIMENSION = 1024;
export const MIN_GARMENT_DIMENSION = 64;

export function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    if (!file.type.match(/^image\/(png|jpeg|jpg|webp)$/i)) {
      reject(new Error('unsupported'));
      return;
    }
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('load-failed'));
    };
    img.src = url;
  });
}

export function imageToCanvas(img: HTMLImageElement): HTMLCanvasElement {
  let { naturalWidth: w, naturalHeight: h } = img;
  if (w === 0 || h === 0) {
    w = img.width;
    h = img.height;
  }
  const maxDim = Math.max(w, h);
  if (maxDim > MAX_GARMENT_DIMENSION) {
    const scale = MAX_GARMENT_DIMENSION / maxDim;
    w = Math.round(w * scale);
    h = Math.round(h * scale);
  }
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0, w, h);
  return canvas;
}

export function hasAlphaChannel(canvas: HTMLCanvasElement): boolean {
  const ctx = canvas.getContext('2d')!;
  const data = ctx.getImageData(0, 0, Math.min(canvas.width, 100), Math.min(canvas.height, 100));
  for (let i = 3; i < data.data.length; i += 4) {
    if (data.data[i] < 250) return true;
  }
  return false;
}

export function removeBackground(canvas: HTMLCanvasElement): HTMLCanvasElement {
  const ctx = canvas.getContext('2d')!;
  const { width, height } = canvas;
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  const sampleSize = Math.min(20, Math.floor(width / 4), Math.floor(height / 4));
  const bgColors: { r: number; g: number; b: number }[] = [];

  for (let y = 0; y < sampleSize; y++) {
    for (let x = 0; x < sampleSize; x++) {
      const i = (y * width + x) * 4;
      bgColors.push({ r: data[i], g: data[i + 1], b: data[i + 2] });
      const i2 = (y * width + (width - 1 - x)) * 4;
      bgColors.push({ r: data[i2], g: data[i2 + 1], b: data[i2 + 2] });
      const i3 = ((height - 1 - y) * width + x) * 4;
      bgColors.push({ r: data[i3], g: data[i3 + 1], b: data[i3 + 2] });
      const i4 = ((height - 1 - y) * width + (width - 1 - x)) * 4;
      bgColors.push({ r: data[i4], g: data[i4 + 1], b: data[i4 + 2] });
    }
  }

  const avgR = bgColors.reduce((s, c) => s + c.r, 0) / bgColors.length;
  const avgG = bgColors.reduce((s, c) => s + c.g, 0) / bgColors.length;
  const avgB = bgColors.reduce((s, c) => s + c.b, 0) / bgColors.length;

  const variance = bgColors.reduce((s, c) => s + Math.abs(c.r - avgR) + Math.abs(c.g - avgG) + Math.abs(c.b - avgB), 0) / bgColors.length;

  const threshold = 50 + variance * 0.5;

  for (let i = 0; i < data.length; i += 4) {
    const dr = Math.abs(data[i] - avgR);
    const dg = Math.abs(data[i + 1] - avgG);
    const db = Math.abs(data[i + 2] - avgB);
    const dist = (dr + dg + db) / 3;

    if (dist < threshold) {
      const alpha = Math.max(0, 1 - dist / threshold);
      data[i + 3] = Math.round(data[i + 3] * alpha * alpha);
    }
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas;
}

export function trimTransparent(canvas: HTMLCanvasElement): HTMLCanvasElement {
  const ctx = canvas.getContext('2d')!;
  const { width, height } = canvas;
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  let minX = width, minY = height, maxX = 0, maxY = 0;
  let found = false;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const a = data[(y * width + x) * 4 + 3];
      if (a > 10) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
        found = true;
      }
    }
  }

  if (!found) return canvas;

  const pad = 4;
  minX = Math.max(0, minX - pad);
  minY = Math.max(0, minY - pad);
  maxX = Math.min(width - 1, maxX + pad);
  maxY = Math.min(height - 1, maxY + pad);

  const trimmed = document.createElement('canvas');
  trimmed.width = maxX - minX + 1;
  trimmed.height = maxY - minY + 1;
  const tCtx = trimmed.getContext('2d')!;
  tCtx.drawImage(canvas, minX, minY, trimmed.width, trimmed.height, 0, 0, trimmed.width, trimmed.height);
  return trimmed;
}

export function getBoundingBox(
  canvas: HTMLCanvasElement
): { x: number; y: number; w: number; h: number } | null {
  const ctx = canvas.getContext('2d')!;
  const { width, height } = canvas;
  const data = ctx.getImageData(0, 0, width, height).data;

  let minX = width, minY = height, maxX = 0, maxY = 0;
  let found = false;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * 4 + 3] > 10) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
        found = true;
      }
    }
  }

  if (!found) return null;
  return { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 };
}
