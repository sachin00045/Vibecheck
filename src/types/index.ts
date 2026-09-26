import type { NormalizedLandmark } from '@mediapipe/tasks-vision';

export interface BodyGeometry {
  shoulderCenter: Vec2;
  shoulderLeft: Vec2;
  shoulderRight: Vec2;
  hipCenter: Vec2;
  hipLeft: Vec2;
  hipRight: Vec2;
  nose: Vec2;
  elbowLeft: Vec2;
  elbowRight: Vec2;
  wristLeft: Vec2;
  wristRight: Vec2;
  shoulderWidth: number;
  torsoHeight: number;
  torsoWidth: number;
  bodyCenter: Vec2;
  bodyRotation: number;
  bodyScale: number;
  cameraDistance: number;
  confidence: number;
}

export interface Vec2 {
  x: number;
  y: number;
}

export interface PoseData {
  landmarks: NormalizedLandmark[];
  timestamp: number;
}

export interface SegmentationData {
  categoryMask: Uint8Array;
  width: number;
  height: number;
  timestamp: number;
}

export const SEGMENT_CATEGORIES = {
  BACKGROUND: 0,
  HAIR: 1,
  BODY_SKIN: 2,
  FACE_SKIN: 3,
  CLOTHES: 4,
  OTHERS: 5,
} as const;

export interface ProcessedGarment {
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
  hasAlpha: boolean;
}

export interface GarmentMeshVertex {
  u: number;
  v: number;
}

export interface GarmentMesh {
  cols: number;
  rows: number;
  vertices: GarmentMeshVertex[];
  triangles: [number, number, number][];
}

export interface ManualAdjustments {
  scale: number;
  offsetX: number;
  offsetY: number;
  rotation: number;
}

export type BodyStatus = 'detected' | 'partial' | 'none';

export type Page = 'landing' | 'tryon' | 'settings';

export interface DemoGarment {
  id: string;
  name: string;
  category: string;
  url: string;
}
