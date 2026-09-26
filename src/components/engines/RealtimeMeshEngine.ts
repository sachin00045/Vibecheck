import type {
  BodyGeometry,
  ProcessedGarment,
  ManualAdjustments,
  SegmentationData,
} from '@/types';
import type { VirtualTryOnEngine, TryOnRenderInput, TryOnRenderResult } from './VirtualTryOnEngine';
import { GarmentMeshRenderer, drawMeshWithOcclusion } from '@/components/garment/GarmentMesh';
import { createDefaultGarmentMesh } from '@/components/garment/GarmentProcessor';
import { getBodyStatus } from '@/utils/geometry';

export class RealtimeMeshEngine implements VirtualTryOnEngine {
  private meshRenderer: GarmentMeshRenderer | null = null;
  private initialized = false;

  get isReady(): boolean {
    return this.initialized;
  }

  async initialize(): Promise<void> {
    const mesh = createDefaultGarmentMesh();
    this.meshRenderer = new GarmentMeshRenderer(mesh);
    this.initialized = true;
  }

  render(input: TryOnRenderInput): TryOnRenderResult {
    const { ctx, canvasWidth, canvasHeight, garment, geometry, adjustments, video } = input;

    if (!garment || !geometry || !this.meshRenderer) {
      return { rendered: false, bodyDetected: geometry !== null };
    }

    const status = getBodyStatus(geometry);
    if (status === 'none') {
      return { rendered: false, bodyDetected: false };
    }

    const positions = this.meshRenderer.update(geometry, adjustments);

    const personMask = input.segmentation
      ? this.extractPersonMask(input.segmentation, canvasWidth, canvasHeight)
      : null;

    drawMeshWithOcclusion(
      ctx,
      garment.canvas,
      this.meshRenderer.meshData,
      positions,
      personMask,
      canvasWidth,
      canvasHeight,
      true
    );

    return { rendered: true, bodyDetected: true };
  }

  private extractPersonMask(
    seg: SegmentationData,
    width: number,
    height: number
  ): Uint8Array | null {
    const mask = seg.categoryMask;
    const maskW = seg.width;
    const maskH = seg.height;
    const out = new Uint8Array(width * height);
    const xRatio = maskW / width;
    const yRatio = maskH / height;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const mx = Math.min(maskW - 1, Math.floor(x * xRatio));
        const my = Math.min(maskH - 1, Math.floor(y * yRatio));
        out[y * width + x] = mask[my * maskW + mx] > 0 ? 255 : 0;
      }
    }
    return out;
  }

  dispose() {
    this.meshRenderer = null;
    this.initialized = false;
  }
}
