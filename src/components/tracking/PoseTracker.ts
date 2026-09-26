import {
  FilesetResolver,
  PoseLandmarker,
  type PoseLandmarkerResult,
  type NormalizedLandmark,
} from '@mediapipe/tasks-vision';
import type { PoseData } from '@/types';

const WASM_PATH = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.1/wasm';
const POSE_MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task';

export class PoseTracker {
  private landmarker: PoseLandmarker | null = null;
  private initialized = false;
  private initializing = false;
  private lastTimestamp = 0;

  get isReady(): boolean {
    return this.initialized;
  }

  get isInitializing(): boolean {
    return this.initializing;
  }

  async initialize(): Promise<void> {
    if (this.initialized || this.initializing) return;
    this.initializing = true;
    try {
      const fileset = await FilesetResolver.forVisionTasks(WASM_PATH);
      this.landmarker = await PoseLandmarker.createFromOptions(fileset, {
        baseOptions: {
          modelAssetPath: POSE_MODEL_URL,
          delegate: 'GPU',
        },
        runningMode: 'VIDEO',
        numPoses: 1,
        minPoseDetectionConfidence: 0.4,
        minPosePresenceConfidence: 0.4,
        minTrackingConfidence: 0.4,
      });
      this.initialized = true;
    } finally {
      this.initializing = false;
    }
  }

  detect(video: HTMLVideoElement): PoseData | null {
    if (!this.landmarker || !this.initialized) return null;
    if (video.readyState < 2) return null;

    const timestamp = performance.now();
    if (timestamp <= this.lastTimestamp) return null;
    this.lastTimestamp = timestamp;

    let result: PoseLandmarkerResult | null = null;
    try {
      result = this.landmarker.detectForVideo(video, timestamp);
    } catch {
      return null;
    }

    if (!result || !result.landmarks || result.landmarks.length === 0) return null;

    const landmarks: NormalizedLandmark[] = result.landmarks[0];
    return { landmarks, timestamp };
  }

  dispose() {
    if (this.landmarker) {
      this.landmarker.close();
      this.landmarker = null;
    }
    this.initialized = false;
  }
}
