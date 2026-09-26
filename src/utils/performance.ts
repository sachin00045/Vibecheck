export class PerformanceMonitor {
  private frameTimes: number[] = [];
  private maxFrames = 30;
  private lastFrameTime = 0;
  private _fps = 0;
  private _poseFps = 0;
  private poseFrameTimes: number[] = [];

  get fps(): number {
    return this._fps;
  }

  get poseFps(): number {
    return this._poseFps;
  }

  recordFrame() {
    const now = performance.now();
    if (this.lastFrameTime > 0) {
      const delta = now - this.lastFrameTime;
      this.frameTimes.push(delta);
      if (this.frameTimes.length > this.maxFrames) this.frameTimes.shift();
      const avg = this.frameTimes.reduce((s, v) => s + v, 0) / this.frameTimes.length;
      this._fps = avg > 0 ? Math.round(1000 / avg) : 0;
    }
    this.lastFrameTime = now;
  }

  recordPoseFrame() {
    const now = performance.now();
    this.poseFrameTimes.push(now);
    const cutoff = now - 1000;
    this.poseFrameTimes = this.poseFrameTimes.filter((t) => t > cutoff);
    this._poseFps = this.poseFrameTimes.length;
  }

  reset() {
    this.frameTimes = [];
    this.poseFrameTimes = [];
    this.lastFrameTime = 0;
    this._fps = 0;
    this._poseFps = 0;
  }
}

export const perfMonitor = new PerformanceMonitor();
