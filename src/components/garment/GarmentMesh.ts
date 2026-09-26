import type { GarmentMesh, BodyGeometry, ManualAdjustments } from '@/types';
import { lerp } from '@/utils/geometry';

export interface MeshVertexTransform {
  x: number;
  y: number;
}

export class GarmentMeshRenderer {
  private mesh: GarmentMesh;
  private currentPositions: MeshVertexTransform[] = [];
  private prevPositions: MeshVertexTransform[] = [];
  private smoothing = 0.4;

  constructor(mesh: GarmentMesh) {
    this.mesh = mesh;
    this.currentPositions = mesh.vertices.map(() => ({ x: 0, y: 0 }));
    this.prevPositions = mesh.vertices.map(() => ({ x: 0, y: 0 }));
  }

  update(geom: BodyGeometry, adjustments: ManualAdjustments): MeshVertexTransform[] {
    const { cols, rows } = this.mesh;

    const shoulderL = geom.shoulderLeft;
    const shoulderR = geom.shoulderRight;
    const hipL = geom.hipLeft;
    const hipR = geom.hipRight;
    const shoulderCenter = geom.shoulderCenter;
    const hipCenter = geom.hipCenter;

    const shoulderWidth = geom.shoulderWidth;
    const torsoHeight = geom.torsoHeight;

    const garmentWidth = shoulderWidth * 1.35 * adjustments.scale;
    const garmentHeight = (torsoHeight * 1.25 + shoulderWidth * 0.3) * adjustments.scale;

    const centerX = (shoulderCenter.x + hipCenter.x) / 2 + adjustments.offsetX;
    const centerY = (shoulderCenter.y + hipCenter.y) / 2 - garmentHeight * 0.08 + adjustments.offsetY;

    const rotation = geom.bodyRotation + adjustments.rotation;

    const cos = Math.cos(rotation);
    const sin = Math.sin(rotation);

    const halfW = garmentWidth / 2;
    const halfH = garmentHeight / 2;

    const newPositions: MeshVertexTransform[] = [];

    for (let r = 0; r <= rows; r++) {
      for (let c = 0; c <= cols; c++) {
        const idx = r * (cols + 1) + c;
        const u = c / cols;
        const v = r / rows;

        let localX = (u - 0.5) * 2 * halfW;
        let localY = (v - 0.5) * 2 * halfH;

        const topWeight = 1 - v;
        const shoulderInfluence = lerp(
          (shoulderL.x - shoulderCenter.x) / (shoulderWidth / 2),
          (shoulderR.x - shoulderCenter.x) / (shoulderWidth / 2),
          u
        );
        const shoulderY = lerp(shoulderL.y, shoulderR.y, u);
        const hipInfluence = lerp(
          (hipL.x - hipCenter.x) / (geom.torsoWidth / 2 || 1),
          (hipR.x - hipCenter.x) / (geom.torsoWidth / 2 || 1),
          u
        );
        const hipY = lerp(hipL.y, hipR.y, u);

        const targetX = lerp(shoulderInfluence * halfW, hipInfluence * halfW * 0.85, v);
        const targetY = lerp(shoulderY - shoulderCenter.y, hipY - shoulderCenter.y, v) + (v - 0.5) * garmentHeight;

        localX = lerp(localX, targetX, 0.3);
        localY = lerp(localY, targetY, 0.3);

        const rotX = localX * cos - localY * sin;
        const rotY = localX * sin + localY * cos;

        const px = centerX + rotX;
        const py = centerY + rotY;

        if (this.prevPositions[idx] && this.prevPositions[idx].x !== 0) {
          const smoothedX = lerp(this.prevPositions[idx].x, px, 1 - this.smoothing);
          const smoothedY = lerp(this.prevPositions[idx].y, py, 1 - this.smoothing);
          newPositions.push({ x: smoothedX, y: smoothedY });
          this.prevPositions[idx] = { x: smoothedX, y: smoothedY };
        } else {
          newPositions.push({ x: px, y: py });
          this.prevPositions[idx] = { x: px, y: py };
        }
      }
    }

    this.currentPositions = newPositions;
    return newPositions;
  }

  reset() {
    this.prevPositions = this.mesh.vertices.map(() => ({ x: 0, y: 0 }));
  }

  get positions(): MeshVertexTransform[] {
    return this.currentPositions;
  }

  get meshData(): GarmentMesh {
    return this.mesh;
  }
}

export function drawMeshWithOcclusion(
  ctx: CanvasRenderingContext2D,
  garmentCanvas: HTMLCanvasElement,
  mesh: GarmentMesh,
  positions: MeshVertexTransform[],
  personMask: Uint8Array | null,
  canvasWidth: number,
  canvasHeight: number,
  armsInFront: boolean
): void {
  // Draw every garment mesh triangle by mapping the *entire source image*
  // triangle to its destination triangle. The previous implementation mixed
  // normalized UV coordinates with pixel coordinates and used an invalid
  // affine transform, which can result in the garment not being drawn at all.
  const { triangles } = mesh;
  const W = garmentCanvas.width;
  const H = garmentCanvas.height;

  const drawTriangle = (
    p0: MeshVertexTransform,
    p1: MeshVertexTransform,
    p2: MeshVertexTransform,
    u0: number,
    v0: number,
    u1: number,
    v1: number,
    u2: number,
    v2: number
  ) => {
    const sx0 = u0 * W;
    const sy0 = v0 * H;
    const sx1 = u1 * W;
    const sy1 = v1 * H;
    const sx2 = u2 * W;
    const sy2 = v2 * H;

    const det =
      sx0 * (sy1 - sy2) +
      sx1 * (sy2 - sy0) +
      sx2 * (sy0 - sy1);

    if (Math.abs(det) < 0.000001) return;

    // Solve the affine transform:
    //   dx = a*sx + c*sy + e
    //   dy = b*sx + d*sy + f
    const a = (p0.x * (sy1 - sy2) + p1.x * (sy2 - sy0) + p2.x * (sy0 - sy1)) / det;
    const c = (p0.x * (sx2 - sx1) + p1.x * (sx0 - sx2) + p2.x * (sx1 - sx0)) / det;
    const e =
      (p0.x * (sx1 * sy2 - sx2 * sy1) +
        p1.x * (sx2 * sy0 - sx0 * sy2) +
        p2.x * (sx0 * sy1 - sx1 * sy0)) /
      det;

    const b = (p0.y * (sy1 - sy2) + p1.y * (sy2 - sy0) + p2.y * (sy0 - sy1)) / det;
    const d = (p0.y * (sx2 - sx1) + p1.y * (sx0 - sx2) + p2.y * (sx1 - sx0)) / det;
    const f =
      (p0.y * (sx1 * sy2 - sx2 * sy1) +
        p1.y * (sx2 * sy0 - sx0 * sy2) +
        p2.y * (sx0 * sy1 - sx1 * sy0)) /
      det;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(p0.x, p0.y);
    ctx.lineTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.closePath();
    ctx.clip();
    ctx.setTransform(a, b, c, d, e, f);
    ctx.drawImage(garmentCanvas, 0, 0, W, H);
    ctx.restore();
  };

  for (const [i0, i1, i2] of triangles) {
    const p0 = positions[i0];
    const p1 = positions[i1];
    const p2 = positions[i2];
    const v0 = mesh.vertices[i0];
    const v1 = mesh.vertices[i1];
    const v2 = mesh.vertices[i2];
    if (!p0 || !p1 || !p2 || !v0 || !v1 || !v2) continue;

    drawTriangle(
      p0,
      p1,
      p2,
      v0.u,
      v0.v,
      v1.u,
      v1.v,
      v2.u,
      v2.v
    );
  }

  // The current MediaPipe segmentation is a person mask rather than a true
  // depth map. Keep this hook without applying a destructive/no-op mask.
  // The garment remains fully visible; depth-aware arm occlusion can be added
  // later with a dedicated depth/part segmentation model.
  void personMask;
  void canvasWidth;
  void canvasHeight;
  void armsInFront;
}
