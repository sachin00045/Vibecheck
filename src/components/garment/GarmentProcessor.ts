import type { ProcessedGarment, GarmentMesh } from '@/types';
import {
  loadImageFromFile,
  imageToCanvas,
  hasAlphaChannel,
  removeBackground,
  trimTransparent,
} from '@/utils/imageProcessing';

export interface GarmentProcessResult {
  garment: ProcessedGarment;
  bgRemoved: boolean;
  method: 'auto-alpha' | 'bg-removal' | 'as-is';
}

export class GarmentProcessor {
  static async processFile(file: File): Promise<GarmentProcessResult> {
    const img = await loadImageFromFile(file);
    let canvas = imageToCanvas(img);
    const hadAlpha = hasAlphaChannel(canvas);

    if (hadAlpha) {
      canvas = trimTransparent(canvas);
      return {
        garment: {
          canvas,
          width: canvas.width,
          height: canvas.height,
          hasAlpha: true,
        },
        bgRemoved: false,
        method: 'auto-alpha',
      };
    }

    try {
      const removed = removeBackground(canvas);
      const trimmed = trimTransparent(removed);
      return {
        garment: {
          canvas: trimmed,
          width: trimmed.width,
          height: trimmed.height,
          hasAlpha: true,
        },
        bgRemoved: true,
        method: 'bg-removal',
      };
    } catch {
      return {
        garment: {
          canvas,
          width: canvas.width,
          height: canvas.height,
          hasAlpha: false,
        },
        bgRemoved: false,
        method: 'as-is',
      };
    }
  }

  static processAsIs(canvas: HTMLCanvasElement): GarmentProcessResult {
    return {
      garment: {
        canvas,
        width: canvas.width,
        height: canvas.height,
        hasAlpha: hasAlphaChannel(canvas),
      },
      bgRemoved: false,
      method: 'as-is',
    };
  }
}

export function createGarmentMesh(cols: number = 5, rows: number = 7): GarmentMesh {
  const vertices: { u: number; v: number }[] = [];
  for (let r = 0; r <= rows; r++) {
    for (let c = 0; c <= cols; c++) {
      vertices.push({
        u: c / cols,
        v: r / rows,
      });
    }
  }

  const triangles: [number, number, number][] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const i = r * (cols + 1) + c;
      const iRight = i + 1;
      const iBelow = i + (cols + 1);
      const iBelowRight = iBelow + 1;
      triangles.push([i, iBelow, iRight]);
      triangles.push([iRight, iBelow, iBelowRight]);
    }
  }

  return { cols, rows, vertices, triangles };
}

export function createDefaultGarmentMesh(): GarmentMesh {
  return createGarmentMesh(5, 7);
}
