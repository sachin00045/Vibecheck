import type { NormalizedLandmark } from '@mediapipe/tasks-vision';
import type { Vec2 } from '@/types';
import { lerp, lerpVec2, clamp } from './geometry';

const SMOOTHING_FACTOR = 0.6;

export class LandmarkSmoother {
  private smoothed: NormalizedLandmark[] | null = null;
  private alpha: number;

  constructor(alpha: number = SMOOTHING_FACTOR) {
    this.alpha = alpha;
  }

  smooth(landmarks: NormalizedLandmark[]): NormalizedLandmark[] {
    if (!this.smoothed || this.smoothed.length !== landmarks.length) {
      this.smoothed = landmarks.map((lm) => ({ ...lm }));
      return this.smoothed;
    }

    const result = landmarks.map((lm, i) => {
      const prev = this.smoothed![i];
      return {
        x: lerp(prev.x, lm.x, 1 - this.alpha),
        y: lerp(prev.y, lm.y, 1 - this.alpha),
        z: lerp(prev.z, lm.z, 1 - this.alpha),
        visibility: lm.visibility,
      };
    });

    this.smoothed = result;
    return result;
  }

  reset() {
    this.smoothed = null;
  }
}

export class Vec2Smoother {
  private smoothed: Vec2 | null = null;
  private alpha: number;

  constructor(alpha: number = 0.5) {
    this.alpha = alpha;
  }

  smooth(v: Vec2): Vec2 {
    if (!this.smoothed) {
      this.smoothed = { ...v };
      return v;
    }
    this.smoothed = lerpVec2(this.smoothed, v, 1 - this.alpha);
    return this.smoothed;
  }

  reset() {
    this.smoothed = null;
  }
}

export class ScalarSmoother {
  private smoothed: number | null = null;
  private alpha: number;

  constructor(alpha: number = 0.5) {
    this.alpha = alpha;
  }

  smooth(v: number): number {
    if (this.smoothed === null) {
      this.smoothed = v;
      return v;
    }
    this.smoothed = this.smoothed * this.alpha + v * (1 - this.alpha);
    return this.smoothed;
  }

  reset() {
    this.smoothed = null;
  }
}

export function smoothScalar(current: number | null, target: number, alpha: number): number {
  if (current === null) return target;
  return clamp(current * alpha + target * (1 - alpha), -1e6, 1e6);
}
