import type { BodyGeometry, ProcessedGarment, ManualAdjustments, SegmentationData } from '@/types';
import type { GarmentMesh as GarmentMeshType } from '@/types';

export interface TryOnRenderInput {
  ctx: CanvasRenderingContext2D;
  canvasWidth: number;
  canvasHeight: number;
  garment: ProcessedGarment | null;
  geometry: BodyGeometry | null;
  segmentation: SegmentationData | null;
  adjustments: ManualAdjustments;
  video: HTMLVideoElement;
}

export interface TryOnRenderResult {
  rendered: boolean;
  bodyDetected: boolean;
}

export interface VirtualTryOnEngine {
  initialize(): Promise<void>;
  render(input: TryOnRenderInput): TryOnRenderResult;
  dispose(): void;
  get isReady(): boolean;
}

export function createDefaultMesh(): GarmentMeshType {
  return { cols: 5, rows: 7, vertices: [], triangles: [] };
}
